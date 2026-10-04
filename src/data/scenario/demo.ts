import type { Scenario } from '../../types/scenario'

const office = { background: '探偵事務所・午後（仮背景）', character: '相澤澪' }

export const demoScenario: Scenario = {
  id: 'demo-request',
  title: '動作確認用の仮シーン（本編「灰色の証言」とは異なります）',
  start: 'request',
  nodes: {
    request: {
      type: 'dialogue', stage: { ...office, character: '佐伯湊' },
      speaker: '佐伯湊', text: '……依頼ですか', next: 'reply',
    },
    reply: {
      type: 'dialogue', stage: office,
      speaker: '相澤澪', text: 'ええ。少し気になる話なんです', next: 'decision',
    },
    decision: {
      type: 'choice', stage: office, prompt: 'どう応じますか？',
      options: [
        { id: 'listen', label: '話を聞こう', next: 'listen' },
        { id: 'coffee', label: '先にコーヒーを頼む', next: 'coffee' },
      ],
    },
    listen: {
      type: 'dialogue', stage: { ...office, character: '佐伯湊' },
      speaker: '佐伯湊', text: '話を聞こう。何が気になっているんです？', next: 'listen-reply',
    },
    'listen-reply': {
      type: 'dialogue', stage: office,
      speaker: '相澤澪', text: '昨日届いた手紙に、心当たりのない名前があったんです。', next: 'end',
    },
    coffee: {
      type: 'dialogue', stage: { ...office, character: '佐伯湊' },
      speaker: '佐伯湊', text: '先にコーヒーを頼もう。少し落ち着いてからでいい。', next: 'coffee-reply',
    },
    'coffee-reply': {
      type: 'dialogue', stage: office,
      speaker: '相澤澪', text: 'ありがとうございます。では、砂糖をひとつお願いします。', next: 'end',
    },
    end: { type: 'end', stage: office, text: '仮シーンはここまでです。' },
  },
}
