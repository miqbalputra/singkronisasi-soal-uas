export interface TextEdit { value: string; caret: number }

export function toggleNumberedList(value: string, start: number, end: number): TextEdit {
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1
  const nextBreak = value.indexOf('\n', Math.max(start, end - 1))
  const to = nextBreak === -1 ? value.length : nextBreak
  const lines = value.slice(from, to).split('\n')
  const remove = lines.every(line => /^\s*\d{1,4}[.)]\s/.test(line))
  const replacement = lines.map((line, i) => remove
    ? line.replace(/^(\s*)\d{1,4}[.)]\s/, '$1')
    : `${i + 1}. ${line.replace(/^\s*\d{1,4}[.)]\s/, '')}`).join('\n')
  return { value: value.slice(0, from) + replacement + value.slice(to), caret: from + replacement.length }
}

export function continueNumberedList(value: string, start: number, end: number): TextEdit | null {
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1
  const prefix = value.slice(from, start)
  const match = prefix.match(/^(\s*)(\d{1,4})([.)])\s(.*)$/)
  if (!match || value.slice(start, end).includes('\n')) return null
  const nextBreak = value.indexOf('\n', end)
  const to = nextBreak === -1 ? value.length : nextBreak
  if (!match[4].trim() && !value.slice(end, to).trim()) {
    return { value: value.slice(0, from) + value.slice(to), caret: from }
  }
  const addition = `\n${match[1]}${Number(match[2]) + 1}${match[3]} `
  return { value: value.slice(0, start) + addition + value.slice(end), caret: start + addition.length }
}

export type MessageBlock = { type: 'text'; text: string } | { type: 'list'; items: { number: number; text: string }[] }

export function messageBlocks(content: string): MessageBlock[] {
  const blocks: MessageBlock[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*(\d{1,4})[.)]\s+(.*)$/)
    const previous = blocks.at(-1)
    if (match) {
      const item = { number: Number(match[1]), text: match[2] }
      if (previous?.type === 'list') previous.items.push(item)
      else blocks.push({ type: 'list', items: [item] })
    } else if (previous?.type === 'text') previous.text += `\n${line}`
    else blocks.push({ type: 'text', text: line })
  }
  return blocks
}
