const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const helpers = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/chat-numbering.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: helpers })
const { toggleNumberedList, continueNumberedList, messageBlocks } = helpers

test('starts a numbered list and numbers selected lines', () => {
  assert.equal(toggleNumberedList('', 0, 0).value, '1. ')
  assert.equal(toggleNumberedList('Judul\nSatu\nDua', 6, 14).value, 'Judul\n1. Satu\n2. Dua')
  assert.equal(toggleNumberedList('\nJudul', 0, 0).value, '1. \nJudul')
})
test('can remove numbering without changing the item text', () => {
  assert.equal(toggleNumberedList('1. Satu\n2. Dua', 0, 14).value, 'Satu\nDua')
})
test('Enter continues numbering and preserves text after the cursor', () => {
  assert.equal(continueNumberedList('9. Soal', 7, 7).value, '9. Soal\n10. ')
  assert.equal(continueNumberedList('1. Soal panjang', 7, 7).value, '1. Soal\n2.  panjang')
  assert.equal(continueNumberedList('Teks biasa', 10, 10), null)
})
test('Enter on an empty item exits the list', () => {
  const edit = continueNumberedList('1. Catatan\n2. ', 14, 14)
  assert.equal(edit.value, '1. Catatan\n')
  assert.equal(edit.caret, 11)
})
test('renders numbered text as lists while preserving text and explicit numbering', () => {
  const blocks = messageBlocks('Catatan\n3. Satu\n4. <script>test</script>\nSelesai')
  assert.equal(blocks.length, 3)
  assert.equal(blocks[1].type, 'list')
  assert.equal(blocks[1].items[0].number, 3)
  assert.equal(blocks[1].items[1].text, '<script>test</script>')
  assert.equal(blocks[2].text, 'Selesai')
})
