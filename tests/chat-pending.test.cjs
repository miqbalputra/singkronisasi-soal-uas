const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const exportsForTest = {}
vm.runInNewContext(ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/lib/chat-pending.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText, { exports: exportsForTest })
const { getPendingReply } = exportsForTest
const messages = (...senders) => senders.map((sender, i) => ({ id: String(i), sender }))

test('empty conversations have no pending badge', () => {
  assert.equal(getPendingReply([]), null)
})

for (const [sender, recipient] of [['Ustadz', 'Ustadzah'], ['Ustadzah', 'Ustadz']]) {
  test(`three ${sender} messages await ${recipient}, even when viewed repeatedly`, () => {
    const comments = messages(sender, sender, sender)
    for (let i = 0; i < 3; i++) {
      const pending = getPendingReply(comments)
      assert.equal(pending.count, 3)
      assert.equal(pending.sender, sender)
      assert.equal(pending.waitingFor, recipient)
      assert.equal(pending.firstMessageId, '0')
    }
  })

  test(`only a ${recipient} reply resolves the preceding ${sender} run`, () => {
    const comments = messages(sender, sender, sender)
    assert.equal(getPendingReply([...comments, { id: '3', sender }]).count, 4)
    const pending = getPendingReply([...comments, { id: '3', sender: recipient }])
    assert.equal(pending.count, 1)
    assert.equal(pending.waitingFor, sender)
    assert.equal(pending.firstMessageId, '3')
  })
}

test('counts only the latest unanswered run across multiple exchanges', () => {
  const pending = getPendingReply(messages('Ustadz', 'Ustadzah', 'Ustadzah', 'Ustadz', 'Ustadz'))
  assert.equal(pending.count, 2)
  assert.equal(pending.firstMessageId, '3')
  assert.equal(pending.waitingFor, 'Ustadzah')
})

test('invalid legacy senders cannot resolve a pending conversation', () => {
  const pending = getPendingReply(messages('Ustadz', 'Admin'))
  assert.equal(pending.count, 1)
  assert.equal(pending.waitingFor, 'Ustadzah')
  assert.equal(getPendingReply(messages('Admin')), null)
})
