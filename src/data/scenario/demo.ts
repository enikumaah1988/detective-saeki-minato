import type { Scenario } from '../../types/scenario'

const office = { backgroundId: 'office-afternoon', characters: [{ characterId: 'minato', expression: 'normal', position: 'left' as const }, { characterId: 'mio', expression: 'normal', position: 'right' as const }] }
const serious = { ...office, characters: office.characters.map(c => c.characterId === 'minato' ? { ...c, expression: 'serious' } : c) }

export const demoScenario: Scenario = {
  id: 'demo-request',
  title: '動作確認用の仮シーン（本編「灰色の証言」とは異なります）',
  start: 'request',
  scenes: { office, serious },
  nodes: {
    request: {
      type: 'dialogue', sceneId: 'office', stage: office,
      speakerId: 'minato', text: '……依頼ですか', next: 'reply',
    },
    reply: {
      type: 'dialogue', sceneId: 'office', stage: office,
      speakerId: 'mio', text: 'ええ。少し気になる話なんです', next: 'decision',
    },
    decision: {
      type: 'choice', sceneId: 'office', stage: office, prompt: 'どう応じますか？',
      options: [
        { id: 'listen', label: '話を聞こう', next: 'listen' },
        { id: 'coffee', label: '先にコーヒーを頼む', next: 'coffee' },
      ],
    },
    listen: {
      type: 'dialogue', sceneId: 'serious', stage: serious,
      speakerId: 'minato', text: '話を聞こう。何が気になっているんです？', next: 'listen-reply',
    },
    'listen-reply': {
      type: 'dialogue', sceneId: 'serious', stage: serious,
      speakerId: 'mio', text: '昨日届いた手紙に、心当たりのない名前があったんです。', next: 'end',
    },
    coffee: {
      type: 'dialogue', sceneId: 'office', stage: office,
      speakerId: 'minato', text: '先にコーヒーを頼もう。少し落ち着いてからでいい。', next: 'coffee-reply',
    },
    'coffee-reply': {
      type: 'dialogue', sceneId: 'office', stage: office,
      speakerId: 'mio', text: 'ありがとうございます。では、砂糖をひとつお願いします。', next: 'end',
    },
    end: { type: 'end', sceneId: 'office', stage: office, text: '仮シーンはここまでです。' },
  },
}
