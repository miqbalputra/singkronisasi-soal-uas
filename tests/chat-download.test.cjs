const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const filename = '12345678-1234-1234-1234-123456789abc.pdf'

function route({ authenticated = true, found = true, missingFile = false } = {}) {
  const exports = {}, reads = [], queries = []
  const source = fs.readFileSync(path.join(__dirname, '../src/app/api/chat-files/[subjectId]/[filename]/route.ts'), 'utf8')
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, {
    exports, Response, process, console,
    require(name) {
      if (name === 'next/headers') return { cookies: async () => ({ get: () => authenticated ? { value: 'verified' } : undefined }) }
      if (name === '@/lib/prisma') return { prisma: { comment: { findFirst: async query => {
        queries.push(query)
        return found ? { attachmentName: 'Revisi soal – النهائي.pdf' } : null
      } } } }
      if (name === 'fs/promises') return { readFile: async filePath => {
        reads.push(filePath)
        if (missingFile) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return Buffer.from('file contents')
      } }
      return require(name)
    },
  })
  return { get: (name = filename) => exports.GET(new Request('http://localhost'), { params: Promise.resolve({ subjectId: 'subject', filename: name }) }), reads, queries }
}

test('chat downloads require the PIN session', async () => {
  const ctx = route({ authenticated: false })
  assert.equal((await ctx.get()).status, 401)
  assert.equal(ctx.queries.length, 0)
  assert.equal(ctx.reads.length, 0)
})
test('rejects traversal and unknown message attachments', async () => {
  const ctx = route()
  assert.equal((await ctx.get('../private.pdf')).status, 404)
  assert.equal(ctx.reads.length, 0)
  const missing = route({ found: false })
  assert.equal((await missing.get()).status, 404)
  assert.equal(missing.reads.length, 0)
})
test('downloads exact bytes with a safe Unicode filename and private cache policy', async () => {
  const ctx = route()
  const response = await ctx.get()
  assert.equal(await response.text(), 'file contents')
  assert.match(response.headers.get('content-disposition'), /^attachment;.*filename\*=UTF-8''/)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(ctx.queries[0].where.subjectId, 'subject')
  assert.equal(ctx.queries[0].where.attachmentUrl, `/api/chat-files/subject/${filename}`)
  assert.match(ctx.reads[0], /storage[\\/]chat[\\/]/)
})
test('missing disk files return 404', async () => {
  assert.equal((await route({ missingFile: true }).get()).status, 404)
})
