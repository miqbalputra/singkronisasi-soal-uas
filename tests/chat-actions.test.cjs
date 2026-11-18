const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')
const chat = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/chat.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: chat })

// Exercise the actual server action with isolated database and request boundaries.
function action({ authenticated = true, fail = false, subjectExists = true, diskFails = false } = {}) {
  const writes = [], invalidations = []
  const files = [], deleted = []
  const source = fs.readFileSync(path.join(__dirname, '../src/app/subject/[id]/actions.ts'), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    File, Buffer, process,
    console: { error() {} },
    require(name) {
      if (name === '@/lib/prisma') return { prisma: { subject: { findUnique: async () => subjectExists ? { id: 'subject' } : null }, comment: { create: async args => {
        if (fail) throw new Error('database unavailable')
        writes.push(args.data)
      } } } }
      if (name === 'next/cache') return { revalidatePath: value => invalidations.push(value) }
      if (name === 'next/headers') return { cookies: async () => ({ get: () => authenticated ? { value: 'verified' } : undefined }) }
      if (name === '@/lib/chat') return chat
      if (name === 'fs/promises') return {
        mkdir: async () => {},
        writeFile: async (filePath, bytes) => { if (diskFails) throw new Error('disk full'); files.push({ filePath, bytes }) },
        unlink: async filePath => { deleted.push(filePath) },
      }
      return require(name)
    },
  })
  return { addComment: exports.addComment, sendChatMessage: exports.sendChatMessage, writes, invalidations, files, deleted }
}

test('rejects an expired PIN session before writing', async () => {
  const ctx = action({ authenticated: false })
  assert.ok((await ctx.addComment('subject', 'Ustadz', 'Pesan')).error)
  assert.equal(ctx.writes.length, 0)
})

test('rejects invalid sender, malformed, blank and oversized messages', async () => {
  const ctx = action()
  for (const [sender, content] of [['Admin', 'Pesan'], ['Ustadz', null], ['Ustadz', { name: 'file' }], ['Ustadz', ' \n '], ['Ustadzah', 'a'.repeat(4001)]]) {
    assert.ok((await ctx.addComment('subject', sender, content)).error)
  }
  assert.equal(ctx.writes.length, 0)
  assert.equal(ctx.invalidations.length, 0)
})

for (const sender of ['Ustadz', 'Ustadzah']) {
  test(`saves long multiline messages as ${sender} and refreshes the subject`, async () => {
    const ctx = action()
    const prefix = 'Catatan revisi\n'
    const content = prefix + 'a'.repeat(4000 - prefix.length)
    assert.equal(content.length, 4000)
    assert.equal((await ctx.addComment('subject', sender, content)).success, true)
    assert.equal(ctx.writes[0].sender, sender)
    assert.equal(ctx.writes[0].content, content)
    assert.equal(ctx.writes[0].subjectId, 'subject')
    assert.equal(ctx.invalidations[0], '/subject/subject')
  })
}

test('returns a recoverable error when the database write fails', async () => {
  const ctx = action({ fail: true })
  assert.ok((await ctx.addComment('subject', 'Ustadz', 'Pesan')).error)
  assert.equal(ctx.invalidations.length, 0)
})

function upload(file, content = '') {
  const form = new FormData()
  form.set('sender', 'Ustadzah')
  form.set('content', content)
  if (file) form.set('file', file)
  return form
}

test('sends a file-only message and keeps the original filename', async () => {
  const ctx = action()
  const result = await ctx.sendChatMessage('subject', upload(new File(['revision'], 'Revisi Soal.docx')))
  assert.equal(result.success, true)
  assert.equal(ctx.writes[0].content, '')
  assert.equal(ctx.writes[0].attachmentName, 'Revisi Soal.docx')
  assert.equal(ctx.writes[0].attachmentSize, 8)
  assert.match(ctx.writes[0].attachmentUrl, /^\/api\/chat-files\/subject\/[a-f0-9-]{36}\.docx$/)
  assert.match(ctx.files[0].filePath, /storage[\\/]chat[\\/]/)
  assert.equal(ctx.files[0].bytes.toString(), 'revision')
})

test('saves a caption and attachment together as a single message', async () => {
  const ctx = action()
  assert.equal((await ctx.sendChatMessage('subject', upload(new File(['pdf'], 'soal.pdf'), '1. Periksa ini\n2. Revisi'))).success, true)
  assert.equal(ctx.writes.length, 1)
  assert.equal(ctx.writes[0].content, '1. Periksa ini\n2. Revisi')
})

test('rejects empty, oversized, unsupported and malformed files before writing', async () => {
  const ctx = action()
  for (const file of [new File([], 'kosong.pdf'), new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'besar.pdf'), new File(['x'], 'run.exe')]) {
    assert.ok((await ctx.sendChatMessage('subject', upload(file))).error)
  }
  const form = upload(null, 'Pesan')
  form.set('file', 'forged metadata')
  assert.ok((await ctx.sendChatMessage('subject', form)).error)
  assert.equal(ctx.files.length, 0)
  assert.equal(ctx.writes.length, 0)
})

test('removes a newly written upload if database persistence fails', async () => {
  const ctx = action({ fail: true })
  assert.ok((await ctx.sendChatMessage('subject', upload(new File(['pdf'], 'soal.pdf')))).error)
  assert.equal(ctx.files.length, 1)
  assert.equal(ctx.deleted[0], ctx.files[0].filePath)
  assert.equal(ctx.invalidations.length, 0)
})

test('failed disk writes and missing subjects do not create messages', async () => {
  for (const settings of [{ diskFails: true }, { subjectExists: false }, { authenticated: false }]) {
    const ctx = action(settings)
    assert.ok((await ctx.sendChatMessage('subject', upload(new File(['pdf'], 'soal.pdf')))).error)
    assert.equal(ctx.writes.length, 0)
    assert.equal(ctx.files.length, 0)
  }
})
