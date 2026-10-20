// 表示だけを整える。原稿・進捗ID・保存値には適用しない。
export function displayText(text: string): string {
  return text.replace(/Episode [0-9]{2}\b|[0-9]/g, token => token.startsWith('Episode ') ? token : String.fromCharCode(token.charCodeAt(0) + 0xfee0))
}
