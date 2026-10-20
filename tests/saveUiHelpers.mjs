// 既存の進行回帰を新しい枠選択・SAVE確認に接続する。
export async function closeMenuForTest(page) {
 const menu = page.getByRole('dialog', { name: 'システムメニュー', exact: true })
 await menu.getByRole('button', { name: 'システムメニューを閉じる', exact: true }).click()
 await menu.waitFor({ state: 'hidden' })
}

export async function loadForTest(page) {
 await page.getByRole('button',{name:'LOAD',exact:true}).click()
 await page.getByRole('dialog',{name:'LOAD',exact:true}).getByRole('button',{name:'SAVE １',exact:true}).click()
}
export async function saveForTest(page) {
 await page.getByRole('button',{name:'SAVE',exact:true}).click()
 await page.getByRole('dialog',{name:'セーブしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
 await page.getByLabel('メニュー',{exact:true}).click()
}
