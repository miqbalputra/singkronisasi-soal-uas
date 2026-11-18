const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')

// Exercise the actual server action with isolated database and request boundaries.
function action({ authenticated = true, fail = false } = {}) {
  const writes = [], invalidations = []
  const source = fs.readFileSync(path.join(__dirname, '../src/app/subject/[id]/actions.ts'), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    console: { error() {} },
    require(name) {
      if (name === '@/lib/prisma') return { prisma: { comment: { create: async args => {
        if (fail) throw new Error('database unavailable')
        writes.push(args.data)
      } } } }
      if (name === 'next/cache') return { revalidatePath: value => invalidations.push(value) }
      if (name === 'next/headers') return { cookies: async () => ({ get: () => authenticated ? { value: 'verified' } : undefined }) }
      if (name === '@/lib/chat') return { MAX_MESSAGE_LENGTH: 4000 }
      return require(name)
    },
  })
  return { addComment: exports.addComment, writes, invalidations }
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
