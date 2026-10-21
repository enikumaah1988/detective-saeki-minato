// 明示実行では外部ブラウザー未設定を成功（全スキップ）にしない。
process.env.SAEKI_DISTRIBUTION_REQUIRED = '1'
await import('../tests/distributionBrowser.test.mjs')
