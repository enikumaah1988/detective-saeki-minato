// 表示だけを整える。原稿・進捗ID・保存値には適用しない。
export function displayText(text: string): string {
  return text.replace(/[0-9]/g, digit => String.fromCharCode(digit.charCodeAt(0) + 0xfee0))
}
