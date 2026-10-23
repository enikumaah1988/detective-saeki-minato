import type { BackgroundDefinition, CharacterDefinition, ExpressionDefinition } from '../types/presentation'

// 検証用画像。本番画像へ差し替える際もシナリオの ID は変更しない。
export const backgrounds: Record<string, BackgroundDefinition> = {
  prologue: { id: 'prologue', name: '西新宿' },
  'building-room': { id: 'building-room', name: '成子坂共同ビル・管理人室', imageSrc: new URL('../assets/images/backgrounds/building-room.png', import.meta.url).href },
  'building-room-evening': { id: 'building-room-evening', name: '成子坂共同ビル・管理人室', imageSrc: new URL('../assets/images/backgrounds/building-room-evening.png', import.meta.url).href },
  'office-evening': { id: 'office-evening', name: '佐伯探偵事務所', imageSrc: new URL('../assets/images/backgrounds/office-evening.png', import.meta.url).href },
  'office-exterior-evening': { id: 'office-exterior-evening', name: '佐伯探偵事務所前', imageSrc: new URL('../assets/images/backgrounds/office-exterior-evening.png', import.meta.url).href },
  'building-exterior-evening': { id: 'building-exterior-evening', name: '成子坂共同ビル前', imageSrc: new URL('../assets/images/backgrounds/building-exterior-evening.png', import.meta.url).href },
  'old-office': { id: 'old-office', name: '成子坂共同ビル・旧事務室', imageSrc: new URL('../assets/images/backgrounds/old-office.png', import.meta.url).href },
  'building-entrance': { id: 'building-entrance', name: '成子坂共同ビル・入口', imageSrc: new URL('../assets/images/backgrounds/building-entrance.png', import.meta.url).href },
  'building-stairs': { id: 'building-stairs', name: '成子坂共同ビル・階段', imageSrc: new URL('../assets/images/backgrounds/building-stairs.png', import.meta.url).href },
  'office-before-noon': { id: 'office-before-noon', name: '佐伯探偵事務所', imageSrc: new URL('../assets/images/backgrounds/office-day.png', import.meta.url).href },
  'office-exterior': { id: 'office-exterior', name: '佐伯探偵事務所前', imageSrc: new URL('../assets/images/backgrounds/office-exterior.png', import.meta.url).href },
  'company-exterior': { id: 'company-exterior', name: '西新宿セントラルタワー前', imageSrc: new URL('../assets/images/backgrounds/company-exterior.png', import.meta.url).href },
  'company-lobby': { id: 'company-lobby', name: '西新宿セントラルタワー・共用ロビー', imageSrc: new URL('../assets/images/backgrounds/company-lobby.png', import.meta.url).href },
  'company-office': { id: 'company-office', name: '東成ビルサービス・執務室', imageSrc: new URL('../assets/images/backgrounds/company-office.png', import.meta.url).href },
  'company-lounge': { id: 'company-lounge', name: '東成ビルサービス・応接室', imageSrc: new URL('../assets/images/backgrounds/company-lounge.png', import.meta.url).href },
  'building-exterior': { id: 'building-exterior', name: '成子坂共同ビル前', imageSrc: new URL('../assets/images/backgrounds/building-exterior.png', import.meta.url).href },
  'police-exterior': { id: 'police-exterior', name: '西新宿警察署前', imageSrc: new URL('../assets/images/backgrounds/police-exterior.png', import.meta.url).href },
  'police-reception': { id: 'police-reception', name: '西新宿警察署・受付', imageSrc: new URL('../assets/images/backgrounds/police-reception.png', import.meta.url).href },
  'police-meeting': { id: 'police-meeting', name: '西新宿警察署・面会室', imageSrc: new URL('../assets/images/backgrounds/police-meeting.png', import.meta.url).href },
  'company-reception': { id: 'company-reception', name: '東成ビルサービス・12階受付', imageSrc: new URL('../assets/images/backgrounds/company-reception.png', import.meta.url).href },
  'office-afternoon': { id: 'office-afternoon', name: '佐伯探偵事務所', imageSrc: new URL('../assets/images/backgrounds/office-afternoon.png', import.meta.url).href },
}

export const characters: Record<string, CharacterDefinition> = {
  narrator: { id: 'narrator', name: '', expressions: {} },
  kuroda: { id: 'kuroda', name: '黒田　征司', expressions: {
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/kuroda/waist/neutral.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/kuroda/waist/smile.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/kuroda/waist/serious.png', import.meta.url).href },
    confused: { id: 'confused', name: '戸惑い', imageSrc: new URL('../assets/images/characters/kuroda/waist/confused.png', import.meta.url).href },
    worried: { id: 'worried', name: '不安', imageSrc: new URL('../assets/images/characters/kuroda/waist/worried.png', import.meta.url).href },
    pained: { id: 'pained', name: '沈痛', imageSrc: new URL('../assets/images/characters/kuroda/waist/pained.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/kuroda/waist/neutral.png', import.meta.url).href }
  } },
  miyahara: { id: 'miyahara', name: '宮原　文雄', expressions: {
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/miyahara/waist/neutral.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/miyahara/waist/smile.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/miyahara/waist/serious.png', import.meta.url).href },
    worried: { id: 'worried', name: '不安', imageSrc: new URL('../assets/images/characters/miyahara/waist/worried.png', import.meta.url).href },
    pained: { id: 'pained', name: '沈痛', imageSrc: new URL('../assets/images/characters/miyahara/waist/pained.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/miyahara/waist/surprised.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/miyahara/waist/relieved.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/miyahara/waist/neutral.png', import.meta.url).href }
  } },
  misaki: { id: 'misaki', name: '三崎　健', expressions: { normal: { id: 'normal', name: '肖像', imageSrc: new URL('../assets/images/characters/misaki/portrait/neutral.png', import.meta.url).href } } },
  'company-staff': { id: 'company-staff', name: '受付の女性', expressions: {} },
  'company-reception': { id: 'company-reception', name: '受付の女性', expressions: {} },
  'police-reception': { id: 'police-reception', name: '受付の女性', expressions: {} },
  'police-staff': { id: 'police-staff', name: '受付の女性', expressions: {} },
  minato: { id: 'minato', name: '佐伯　湊', expressions: {
    'front-normal': { id: 'front-normal', name: '通常（新画風の正面差分は未制作）', imageSrc: new URL('../assets/images/characters/minato/waist/neutral.png', import.meta.url).href },
    irritated: { id: 'irritated', name: 'irritated', imageSrc: new URL('../assets/images/characters/minato/waist/irritated.png', import.meta.url).href },
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/minato/waist/neutral.png', import.meta.url).href },
    pained: { id: 'pained', name: '沈痛', imageSrc: new URL('../assets/images/characters/minato/waist/pained.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/minato/waist/relieved.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/minato/waist/serious.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/minato/waist/smile.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/minato/waist/surprised.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/minato/waist/neutral.png', import.meta.url).href }
  } },
  mio: { id: 'mio', name: '相澤　澪', expressions: {
    amused: { id: 'amused', name: 'amused', imageSrc: new URL('../assets/images/characters/mio/waist/amused.png', import.meta.url).href },
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/mio/waist/neutral.png', import.meta.url).href },
    pained: { id: 'pained', name: '沈痛', imageSrc: new URL('../assets/images/characters/mio/waist/pained.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/mio/waist/relieved.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/mio/waist/serious.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/mio/waist/smile.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/mio/waist/surprised.png', import.meta.url).href },
    worried: { id: 'worried', name: '不安', imageSrc: new URL('../assets/images/characters/mio/waist/worried.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/mio/waist/neutral.png', import.meta.url).href }
  } },
  narumi: { id: 'narumi', name: '鳴海　ユウ', expressions: {
    amused: { id: 'amused', name: 'amused', imageSrc: new URL('../assets/images/characters/narumi/waist/amused.png', import.meta.url).href },
    cool: { id: 'cool', name: 'cool', imageSrc: new URL('../assets/images/characters/narumi/waist/cool.png', import.meta.url).href },
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/narumi/waist/neutral.png', import.meta.url).href },
    playful: { id: 'playful', name: 'playful', imageSrc: new URL('../assets/images/characters/narumi/waist/playful.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/narumi/waist/serious.png', import.meta.url).href },
    smirk: { id: 'smirk', name: 'smirk', imageSrc: new URL('../assets/images/characters/narumi/waist/smirk.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/narumi/waist/surprised.png', import.meta.url).href },
    wary: { id: 'wary', name: 'wary', imageSrc: new URL('../assets/images/characters/narumi/waist/wary.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/narumi/waist/neutral.png', import.meta.url).href }
  } },
  okumura: { id: 'okumura', name: '奥村　修一', expressions: {
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/okumura/waist/neutral.png', import.meta.url).href },
    pained: { id: 'pained', name: '沈痛', imageSrc: new URL('../assets/images/characters/okumura/waist/pained.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/okumura/waist/relieved.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/okumura/waist/serious.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/okumura/waist/smile.png', import.meta.url).href },
    stern: { id: 'stern', name: 'stern', imageSrc: new URL('../assets/images/characters/okumura/waist/stern.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/okumura/waist/surprised.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/okumura/waist/neutral.png', import.meta.url).href }
  } },
  segawa: { id: 'segawa', name: '瀬川　亮介', expressions: {
    irritated: { id: 'irritated', name: 'irritated', imageSrc: new URL('../assets/images/characters/segawa/waist/irritated.png', import.meta.url).href },
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/segawa/waist/neutral.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/segawa/waist/relieved.png', import.meta.url).href },
    reluctant: { id: 'reluctant', name: 'reluctant', imageSrc: new URL('../assets/images/characters/segawa/waist/reluctant.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/segawa/waist/serious.png', import.meta.url).href },
    skeptical: { id: 'skeptical', name: 'skeptical', imageSrc: new URL('../assets/images/characters/segawa/waist/skeptical.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/segawa/waist/smile.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/segawa/waist/surprised.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/segawa/waist/neutral.png', import.meta.url).href }
  } },
  naoto: { id: 'naoto', name: '高瀬　直人', expressions: {
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/naoto/waist/neutral.png', import.meta.url).href },
    pained: { id: 'pained', name: '沈痛', imageSrc: new URL('../assets/images/characters/naoto/waist/pained.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/naoto/waist/relieved.png', import.meta.url).href },
    remorseful: { id: 'remorseful', name: 'remorseful', imageSrc: new URL('../assets/images/characters/naoto/waist/remorseful.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/naoto/waist/serious.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/naoto/waist/smile.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/naoto/waist/surprised.png', import.meta.url).href },
    worried: { id: 'worried', name: '不安', imageSrc: new URL('../assets/images/characters/naoto/waist/worried.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/naoto/waist/neutral.png', import.meta.url).href }
  } },
  saori: { id: 'saori', name: '三原　沙織', expressions: {
    confused: { id: 'confused', name: '困惑', imageSrc: new URL('../assets/images/characters/saori/waist/confused.png', import.meta.url).href },
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/saori/waist/neutral.png', import.meta.url).href },
    pained: { id: 'pained', name: '沈痛', imageSrc: new URL('../assets/images/characters/saori/waist/pained.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/saori/waist/relieved.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/saori/waist/serious.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/saori/waist/smile.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/saori/waist/surprised.png', import.meta.url).href },
    worried: { id: 'worried', name: '不安', imageSrc: new URL('../assets/images/characters/saori/waist/worried.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/saori/waist/neutral.png', import.meta.url).href }
  } },
  akari: { id: 'akari', name: '高瀬　あかり', expressions: {
    'right-sad': { id: 'right-sad', name: '悲しみ（新画風の右向き差分は未制作）', imageSrc: new URL('../assets/images/characters/akari/waist/sad.png', import.meta.url).href },
    determined: { id: 'determined', name: '決意', imageSrc: new URL('../assets/images/characters/akari/waist/determined.png', import.meta.url).href },
    neutral: { id: 'neutral', name: '通常', imageSrc: new URL('../assets/images/characters/akari/waist/neutral.png', import.meta.url).href },
    relieved: { id: 'relieved', name: '安堵', imageSrc: new URL('../assets/images/characters/akari/waist/relieved.png', import.meta.url).href },
    sad: { id: 'sad', name: '悲しみ', imageSrc: new URL('../assets/images/characters/akari/waist/sad.png', import.meta.url).href },
    serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/images/characters/akari/waist/serious.png', import.meta.url).href },
    smile: { id: 'smile', name: '微笑み', imageSrc: new URL('../assets/images/characters/akari/waist/smile.png', import.meta.url).href },
    surprised: { id: 'surprised', name: '驚き', imageSrc: new URL('../assets/images/characters/akari/waist/surprised.png', import.meta.url).href },
    worried: { id: 'worried', name: '不安', imageSrc: new URL('../assets/images/characters/akari/waist/worried.png', import.meta.url).href },
    normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/images/characters/akari/waist/neutral.png', import.meta.url).href }
  } },
}

export function resolveBackground(id: string): BackgroundDefinition {
  return Object.hasOwn(backgrounds, id) ? backgrounds[id] : { id, name: '未登録の背景' }
}

export function resolveCharacter(id: string): CharacterDefinition {
  return Object.hasOwn(characters, id) ? characters[id] : { id, name: '未登録の人物', expressions: {} }
}

export function resolveExpression(characterId: string, expressionId: string): ExpressionDefinition {
  const character = resolveCharacter(characterId)
  return Object.hasOwn(character.expressions, expressionId)
    ? character.expressions[expressionId]
    : { id: expressionId, name: '未登録の表情' }
}

export function resolveSpeakerName(speakerId: string): string {
  return resolveCharacter(speakerId).name
}
