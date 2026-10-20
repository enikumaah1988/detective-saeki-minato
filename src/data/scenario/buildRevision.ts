import type { Choice, Condition, Scenario, Scene, StateUpdate } from '../../types/scenario'
import { resolveExpression, resolveSpeakerName } from '../presentation'
import { revisionCommand, revisionLabels, canCarryTopic, conversationLabel, sceneClosings, reasoningLabels, conversationCondition } from './revisionCommands'
import { formatNames } from '../displayNames'
import { personObservation } from './personObservations'
import { episodePrologue } from './episodePrologue'

export type RevisionLine = { speakerId: string; text: string; grants?: string[]; backgroundId?: string }
export type RevisionAction = { id: string; personId?: string | null; label?: string; lines: RevisionLine[]; requires: string[]; grants: string[]; required?: boolean; interaction?: 'think' | 'organize' | 'phone' | 'item-use'; itemId?: string; questionSetId?: string;
  questions?: { id: string; prompt: string; choices: { id: string; text: string }[]; answer: string; requires: string[]; hint: string; grants: string[] }[];
  successLines?: RevisionLine[]; retainCorrectAnswers?: boolean;
  remoteOnly?: boolean;
  legacyOnly?: boolean;
  triggerMode?: 'automatic-after-entry' | 'automatic-after-information';
}
export type RevisionScene = {
  id: string; part: number; locationId: string; roomId: string; sceneTime: string;
  intro: RevisionLine[]; people: string[]; required: string[];
  ask: RevisionAction[]; speak: RevisionAction[]; inspect: RevisionAction[]; think: RevisionAction[];
  organize?: RevisionAction[];
  topicTransitions?: { id: string; personId: string; requires: string[]; unless: string[]; lines: RevisionLine[]; grants: string[] }[];
  exit: { label: string; nextSceneId: string | null; requires: string[] }; ending: RevisionLine[];
}
export type RevisionData = { scenes: RevisionScene[] }
const placeNames: Record<string, string> = { office: '佐伯探偵事務所', company: '東成ビルサービス', building: '成子坂共同ビル', police: '西新宿警察署' }
const roomNames: Record<string, string> = { office: '事務所', 'company-reception': '受付', 'company-lounge': '応接室', 'building-manager-room': '管理人室', 'building-stairs': '階段', 'building-old-office': '旧事務室', 'police-reception': '受付', 'police-meeting-room': '面会室' }
const roomBackgrounds: Record<string, string> = {
  office: 'office-before-noon', reception: 'company-reception', company: 'company-reception', meeting: 'company-reception',
  'company-reception': 'company-reception', 'company-meeting': 'company-reception',
  'company-lounge': 'company-lounge', 'company-exterior': 'company-exterior', 'building-exterior': 'building-exterior',
  entrance: 'building-entrance', 'building-entrance': 'building-entrance', manager: 'building-room', 'manager-room': 'building-room',
  stairs: 'building-stairs', 'old-office': 'old-office',
  'building-manager-room': 'building-room', 'building-stairs': 'building-stairs', 'building-old-office': 'old-office',
  'police-reception': 'police-reception', 'police-meeting': 'police-meeting', 'police-interview': 'police-meeting',
}
const information = (id: string): StateUpdate => ({ type: 'addInformation', id })
const grants = (ids: string[]): StateUpdate[] => ids.flatMap(id => id.endsWith('_completed') || id === 'request_accepted'
  ? [information(id), { type: 'setFlag' as const, id, value: true }] : [information(id)])
const has = (ids: string[]): Condition => ({ type: 'hasAllInformation', ids })
const names: Record<string, string> = { akari: '女性', naoto: 'あかりの兄', miyahara: '管理人', kuroda: '黒田部長', okumura: '刑事', segawa: '若い刑事' }
const personFor = (action: RevisionAction) => action.personId ?? (/奥村/.test(action.label ?? '') ? 'okumura' : /澪/.test(action.label ?? '') ? 'mio' : /妹/.test(action.label ?? '') ? 'akari' : /情報屋/.test(action.label ?? '') ? 'narumi' : /折り返し/.test(action.label ?? '') ? 'naoto' : action.lines.find(line => !['narrator', 'minato'].includes(line.speakerId))?.speakerId ?? 'minato')
function timeLabel(value: string) {
  const date = new Date(`${value}+09:00`)
  if (!Number.isFinite(date.getTime())) throw new Error(`場面時刻が不正です: ${value}`)
  return `${value.slice(0, 4)}年${Number(value.slice(5, 7))}月${Number(value.slice(8, 10))}日（${'日月火水木金土'[new Date(value.slice(0, 10)).getUTCDay()]}）${value.slice(11, 16)}`
}

// 文稿のIDをゲームの進捗IDとして保持する。旧ノードも残し、セーブ形式はversion2を維持。
export function buildRevision(base: Scenario, data: RevisionData): Scenario {
  const nodes = { ...base.nodes }, scenes = { ...base.scenes }, times = { ...base.nodeTimes }
  const phaseById = new Map(data.scenes.map(phase => [phase.id, phase]))
  const uses: NonNullable<Scenario['itemUses']> = []
  const returnTargets = new Map<string, string>()
  const sceneOwners = new Map<string, string>()
  const add = (id: string, node: Scenario['nodes'][string], time: string) => { nodes[id] = node; times[id] = time }
  const stageFor = (phase: RevisionScene, person?: string, actionId?: string): Scene => {
    let backgroundId = roomBackgrounds[phase.roomId]
    if (phase.locationId === 'police') backgroundId = phase.roomId.endsWith('exterior') ? 'police-exterior' : /reception|受付/.test(phase.roomId) ? 'police-reception' : 'police-meeting'
    if (!backgroundId) backgroundId = phase.locationId === 'office' ? 'office-before-noon' : phase.locationId === 'company' ? 'company-reception' : 'building-room'
    if (Number(phase.sceneTime.slice(11, 13)) >= 16) backgroundId = ({ 'office-before-noon': 'office-evening', 'building-room': 'building-room-evening', 'building-exterior': 'building-exterior-evening' } as Record<string, string>)[backgroundId] ?? backgroundId
    const other = person ?? (phase.people.includes('naoto') ? 'naoto' : phase.people.includes('akari') ? 'akari' : phase.people.find(id => !['minato', 'company-staff', 'police-staff', 'narrator', 'narumi', 'company-reception', 'police-reception'].includes(id)))
    const expression = (id: string) => {
      let mood = 'normal'
      if (id === 'minato' && phase.part >= 3) mood = 'serious'
      if (id === 'mio') mood = ['P1-01', 'P4-11'].includes(phase.id) ? 'smile' : 'serious'
      if (id === 'akari') mood = phase.part === 1 ? 'worried' : 'sad'
      if (id === 'naoto') mood = phase.part === 3 ? 'worried' : 'serious'
      if (id === 'naoto' && ['p3-silence', 'p3-responsibility', 'p4-siblings-talk'].includes(actionId ?? '')) mood = 'pained'
      if (id === 'naoto' && ['p3-testify', 'p3-map-naoto', 'p3-handover'].includes(actionId ?? '')) mood = 'serious'
      return resolveExpression(id, mood).name === '未登録の表情' ? 'normal' : mood
    }
    const policeGroup = phase.people.includes('okumura') && phase.people.includes('segawa') && (!other || ['okumura', 'segawa'].includes(other))
    const characters: NonNullable<Scene['characters']> = policeGroup
      ? [{ characterId: 'segawa', expression: expression('segawa'), position: 'left', condition: has(['met-segawa']) }, { characterId: 'minato', expression: 'front-normal', position: 'center' }, { characterId: 'okumura', expression: expression('okumura'), position: 'right', condition: has(['met-okumura']) }]
      : phase.id === 'P4-10'
      ? [{ characterId: 'akari', expression: 'right-sad', position: 'left', condition: has(['met-akari']) }, { characterId: 'minato', expression: 'front-normal', position: 'center' }, { characterId: 'naoto', expression: expression('naoto'), position: 'right', condition: has(['met-naoto']) }]
      : [{ characterId: 'minato', expression: expression('minato'), position: 'left' }]
    if (!policeGroup && phase.id !== 'P4-10' && other && !['minato', 'company-reception', 'police-reception', 'narumi'].includes(other) && !(other === 'mio' && phase.locationId !== 'office')) characters.push({ characterId: other, expression: expression(other), position: 'right', condition: ['mio'].includes(other) ? undefined : has([`met-${other}`]) })
    return { backgroundId, characters, smokingAllowed: phase.locationId === 'office' }
  }
  const sequence = (id: string, phase: RevisionScene, lines: RevisionLine[], next: string, updates: StateUpdate[] = [], person?: string) => {
    const sceneId = `${phase.id}-${id}`
    sceneOwners.set(sceneId, phase.id)
    scenes[sceneId] = stageFor(phase, person, id)
    const content = lines.length ? lines : [{ speakerId: 'narrator', text: '' }]
    let currentTime = phase.sceneTime
    content.forEach((line, index) => {
      const explicitTime = line.text.match(/^(\d{1,2}):(\d{2})。/)
      if (explicitTime) currentTime = `${phase.sceneTime.slice(0, 11)}${explicitTime[1].padStart(2, '0')}:${explicitTime[2]}:00`
      const key = index ? `${id}-${index + 1}` : id
      // 入館・室内の眺めだけを切り替え、既存の移動先・進捗条件・保存形式を維持する。
      const lineSceneId = line.backgroundId ? `${sceneId}-view-${index + 1}` : sceneId
      if (line.backgroundId) {
        scenes[lineSceneId] = { ...scenes[sceneId], backgroundId: line.backgroundId, characters: [] }
        sceneOwners.set(lineSceneId, phase.id)
      }
      add(key, { type: 'dialogue', stage: scenes[lineSceneId], sceneId: lineSceneId, speakerId: line.speakerId, text: line.text,
        ...(!lines.length ? { autoAdvance: true } : {}),
        ...(names[line.speakerId] ? { speakerName: names[line.speakerId], speakerNameCondition: has([`named-${line.speakerId}`]) } : {}),
        next: index === content.length - 1 ? next : `${id}-${index + 2}`,
        entryUpdates: index === 0 || explicitTime ? [information(`clock:${currentTime}`)] : [], updates: [...grants(line.grants ?? []), ...(index === content.length - 1 ? updates : [])],
      }, timeLabel(currentTime))
    })
    return id
  }
  const boundary = (id: string, phase: RevisionScene, direction: 'IN' | 'OUT', next: string) => {
    const sceneId = `${phase.id}-boundary`
    scenes[sceneId] = { ...stageFor(phase), characters: [] }
    add(id, { type: 'dialogue', stage: scenes[sceneId], sceneId, speakerId: 'narrator', text: direction === 'IN' ? `第${phase.part}部　${['', '依頼と初動', '展開', '核心', '解決'][phase.part]}` : `第${phase.part}部　終わり`, next,
      illustration: { id: `C${phase.part}-${direction}`, imageSrc: undefined, alt: `第${phase.part}部${direction === 'IN' ? '始まり' : '終わり'}の挿絵`, heading: '探偵 佐伯　湊', subtitle: `Episode 01　灰色の証言 — 第${phase.part}部　${['', '依頼と初動', '展開', '核心', '解決'][phase.part]}${direction === 'OUT' ? '　終' : ''}`, provisional: true },
    }, timeLabel(phase.sceneTime))
  }
  const arrival = (phase: RevisionScene) => `${phase.id}-arrival`
  for (const phase of data.scenes) {
    const phaseStage = stageFor(phase), sceneId = phase.id, menuId = `${phase.id}-menu`, time = timeLabel(phase.sceneTime)
    scenes[sceneId] = phaseStage
    sceneOwners.set(sceneId, phase.id)
    const previous = data.scenes[data.scenes.indexOf(phase) - 1]
    const first = !previous || previous.part !== phase.part
    const automatic = [...phase.ask, ...phase.speak].find(action => action.triggerMode === 'automatic-after-entry')
    if (automatic) sequence(automatic.id, phase, automatic.lines, menuId, [{ type: 'addHeardTopic', id: automatic.id }, ...grants(automatic.grants)])
    const automaticSteps = [...phase.ask, ...phase.speak].filter(action => action.triggerMode === 'automatic-after-information')
    const automaticBranches = automaticSteps.map(action => ({
      condition: { type: 'all' as const, conditions: [has(action.requires), { type: 'not' as const, condition: has(action.grants) }] },
      next: sequence(action.id, phase, action.lines, menuId, [{ type: 'addHeardTopic', id: action.id }, ...grants(action.grants)], personFor(action)),
    }))
    const intro = sequence(`${phase.id}-intro`, phase, phase.intro, automatic?.id ?? menuId)
    nodes[intro].entryUpdates = [...(nodes[intro].entryUpdates ?? []), ...phase.people.filter(person => !['minato', 'mio', 'company-reception', 'police-reception', 'narumi'].includes(person)).map(person => information(`met-${person}`))]
    if (first) boundary(`${phase.id}-start`, phase, 'IN', intro)
    const entryBackground = phase.intro[0]?.backgroundId
    const entryStage = entryBackground ? { ...phaseStage, backgroundId: entryBackground, characters: [] } : phaseStage
    add(arrival(phase), { type: 'dialogue', stage: entryStage, sceneId, speakerId: 'narrator', text: entryBackground ? '建物内へ入った。' : phase.roomId.endsWith('exterior') ? `${placeNames[phase.locationId]}の前に着いた。` : `${roomNames[phase.roomId] ?? placeNames[phase.locationId]}に入った。`, next: first ? `${phase.id}-start` : intro }, time)
    const carried: {kind: 'ask'|'speak'; action: RevisionAction}[] = []
    for(let i=data.scenes.indexOf(phase)-1;i>=0;i--){
      const earlier=data.scenes[i]
      if(earlier.locationId!==phase.locationId || earlier.roomId!==phase.roomId) break
      for(const kind of ['ask','speak'] as const) for(const action of earlier[kind])
        if(action.required===false && canCarryTopic(action.id, phase.id) && !action.triggerMode && (action.remoteOnly || action.interaction==='phone' || phase.people.includes(personFor(action)))) carried.push({kind,action})
    }
    const conversation = [
      ...phase.ask.map(action=>({kind:'ask' as const,action})), ...phase.speak.map(action=>({kind:'speak' as const,action})),
      ...carried.filter(entry=>![...phase.ask,...phase.speak].some(action=>action.id===entry.action.id)),
    ]
    // 任意の話題が解放された直後に相手を退出させず、最後の挨拶で会話を閉じる。
    const farewell = ['P1-05', 'P4-10'].includes(phase.id) ? `${phase.id}-farewell` : undefined
    if(farewell) conversation.push({kind:'speak',action:{id:farewell,personId:'akari',label:'挨拶',lines:[{speakerId:'minato',text:'気をつけて。'}],requires:phase.exit.requires,grants:[farewell],required:true}})
    const closing = sceneClosings[phase.id]
    if (closing) conversation.push({kind:'speak',action:{id:`${phase.id}-close-conversation`,personId:closing.personId,label:closing.label,lines:[{speakerId:'minato',text:closing.text}],requires:phase.exit.requires,grants:[`${phase.id}-conversation-closed`],required:true}})
    const conversationGate = (action: RevisionAction): Condition => action.legacyOnly
      ? {type:'all',conditions:[conversationCondition(action.id,action.requires,phase.id),{type:'not',condition:has(action.grants)}]}
      : conversationCondition(action.id,action.requires,phase.id)
    const options: Choice[] = []
    for (const [commandId, actions] of [['speak', conversation.filter(({action})=>!action.triggerMode).map(entry=>entry.action)]] as const) {
      if (!actions.length) continue
      const peopleId = `${phase.id}-${commandId}-people`
      const people = [...new Set(actions.map(personFor))]
      const peopleChoices: Choice[] = []
      for (const person of people) {
        const topicsId = `${phase.id}-${commandId}-${person}`, relevant = actions.filter(action => personFor(action) === person)
        const focused = phase.people.includes(person) && relevant.some(action=>!action.remoteOnly && action.interaction!=='phone')
        scenes[topicsId] = focused ? stageFor(phase, person) : phaseStage
        sceneOwners.set(topicsId, phase.id)
        const choices = relevant.map(action => {
          const actionNodeId = carried.some(entry=>entry.action===action) ? `${phase.id}-carry-${action.id}` : action.id
          returnTargets.set(actionNodeId, topicsId)
          return ({ id: action.id, required: action.required, label: conversationLabel(action),
          next: sequence(actionNodeId, phase, action.lines, topicsId, [{ type: 'addHeardTopic', id: action.id }, ...grants(action.grants)], action.interaction === 'phone' || action.remoteOnly ? undefined : person), condition: conversationGate(action) })})
        add(topicsId, { type: 'topic', heading: '話す', appendUnlockedTopics: phase.part === 1,
          stage: scenes[topicsId], sceneId: topicsId,
          parent: { commandId, nodeId: peopleId }, prompt: '話題を選ぶ', options: choices }, time)
        const remote = relevant.every(action=>action.remoteOnly || action.interaction==='phone')
        const suffix = remote ? '（電話）' : ''
        peopleChoices.push({ id: person, label: (names[person] ?? resolveSpeakerName(person)) + suffix, labelWhen: names[person] ? { condition: has([`named-${person}`]), label: resolveSpeakerName(person) + suffix } : undefined, next: topicsId, condition: { type: 'any', conditions: relevant.map(conversationGate) } })
      }
      add(peopleId, { type: 'topic', selection: 'person', heading: '話す', stage: phaseStage, sceneId,
        parent: { commandId, nodeId: menuId }, prompt: '相手を選ぶ', options: peopleChoices }, time)
      // 以前の「聞く」の保存位置も、取得済み情報を増やさず統合後の会話に戻す。
      add(`${phase.id}-talk-people`, nodes[peopleId], time)
      for(const person of people) add(`${phase.id}-talk-${person}`, nodes[`${phase.id}-speak-${person}`], time)
      options.push({ id: commandId, label: '話す', next: peopleId, condition: { type: 'any', conditions: actions.map(conversationGate) } })
    }
    // 期限を過ぎた日常会話の旧セーブだけは末尾まで読める。新しい一覧には出さない。
    const daily = data.scenes[0].speak.filter(action=>['p1-schedule','p1-coffee'].includes(action.id))
    if(phase.id!=='P1-01' && phase.locationId==='office' && phase.part===1){
      for(const action of daily) sequence(`${phase.id}-carry-${action.id}`,phase,action.lines,menuId,[{type:'addHeardTopic',id:action.id},...grants(action.grants)],'mio')
      if(!nodes[`${phase.id}-speak-mio`]) add(`${phase.id}-speak-mio`,{type:'topic',heading:'話す',stage:stageFor(phase,'mio'),sceneId,parent:{commandId:'speak',nodeId:nodes[`${phase.id}-speak-people`] ? `${phase.id}-speak-people` : menuId},prompt:'話題を選ぶ',options:[]},time)
    }
    if(['P1-04','P1-05','P1-06'].includes(phase.id)) {
      for(const action of phaseById.get('P1-03')?.ask.filter(action=>action.required===false) ?? []) sequence(`${phase.id}-carry-${action.id}`,phase,action.lines,menuId,[{type:'addHeardTopic',id:action.id},...grants(action.grants)],'akari')
      if(!nodes[`${phase.id}-speak-akari`]) add(`${phase.id}-speak-akari`,{type:'topic',heading:'話す',stage:phaseStage,sceneId,parent:{commandId:'speak',nodeId:menuId},prompt:'話題を選ぶ',options:[]},time)
      if(!nodes[`${phase.id}-speak-people`]) add(`${phase.id}-speak-people`,{type:'topic',selection:'person',heading:'話す',stage:phaseStage,sceneId,parent:{commandId:'speak',nodeId:menuId},prompt:'相手を選ぶ',options:[]},time)
    }
    for (const command of ['look', 'investigate'] as const) {
      const detailed = phase.inspect.filter(action=>revisionCommand('inspect',action.id)==='investigate')
      const discoveries: RevisionAction[] = command==='look' ? detailed.map(action=>({id:`${action.id}-notice`,label:action.label,lines:[{speakerId:'narrator',text:`${action.label}がある。詳しく調べてみよう。`}],requires:action.requires,grants:[`${action.id}-noticed`],required:action.required})) : []
      const observations: RevisionAction[] = command === 'look' ? phase.people.filter(person=>!['minato','narrator','narumi'].includes(person)).map(person=>({
        id: `${phase.id}-observe-${person}`, personId: person, label: names[person] ?? resolveSpeakerName(person), lines: [{speakerId:'narrator',text:personObservation(person,phase.id)}],
        requires: ['mio'].includes(person) ? [] : [`met-${person}`], grants: [], required:false,
      })) : []
      const inspections = [...phase.inspect.filter(action => revisionCommand('inspect', action.id) === command), ...observations, ...discoveries]
      if (!inspections.length) continue
      const targetsId = command === 'look' ? `${phase.id}-targets` : `${phase.id}-investigate-targets`
      const choices: Choice[] = inspections.map(action => { returnTargets.set(action.id, targetsId); return ({ id: action.id, required: action.required, label: revisionLabels[action.id] ?? action.label ?? action.id,
        labelWhen: action.personId && names[action.personId] ? {condition:has([`named-${action.personId}`]),label:resolveSpeakerName(action.personId)} : undefined,
        next: sequence(action.id, phase, action.lines, targetsId, [{ type: 'addInspectedTarget', id: action.id }, ...grants(action.grants)], action.personId ?? undefined), condition: has(command==='investigate' ? [...action.requires, `${action.id}-noticed`] : action.requires) })})
      add(targetsId, { type: 'inspect', stage: phaseStage, sceneId, heading: command === 'look' ? '見る' : '調べる', parent: { commandId: command, nodeId: menuId }, prompt: '対象を選ぶ', options: choices }, time)
      // ver0.03で調査一覧を保存した位置も復元できるよう旧IDを保持する。
      if (command === 'investigate' && !nodes[`${phase.id}-targets`]) add(`${phase.id}-targets`, nodes[targetsId], time)
      options.push({ id: command, label: command === 'look' ? '見る' : '調べる', next: targetsId, condition: { type: 'any', conditions: inspections.map(action => has(command==='investigate' ? [...action.requires, `${action.id}-noticed`] : action.requires)) } })
    }
    for (const [commandId, actions] of [['think', phase.think.filter(action => action.interaction !== 'organize')], ['organize', [...(phase.organize ?? []), ...phase.think.filter(action => action.interaction === 'organize')]]] as const) {
      for (const action of actions) {
        let continuation = menuId
        if (action.questionSetId) {
          const prefix = action.questionSetId === 'Q1' ? 'reason1' : 'reason2'
          const finish = sequence(`${action.id}-passed`, phase, action.successLines ?? [{ speakerId: 'narrator', text: '確認した事実と、まだ確かめることを分けて記録した。' }], menuId, grants(action.grants))
          const aliases = new Map<string, string>()
          for (const id of Object.keys(base.nodes).filter(id => id.startsWith(`${prefix}-q`))) aliases.set(id, `${phase.id}-${id}`)
          for (const [id, alias] of aliases) {
            const original = base.nodes[id]
            if (original.type === 'choice') add(alias, { ...original, stage: phaseStage, sceneId, options: original.options.map(option => ({ ...option, next: aliases.get(option.next) ?? finish })) }, time)
            if (original.type === 'dialogue') add(alias, { ...original, stage: phaseStage, sceneId, next: aliases.get(original.next) ?? finish }, time)
          }
          continuation = aliases.get(`${prefix}-q1`) ?? finish
          if (action.questions?.length) {
            action.questions.forEach((question, index) => {
              const questionId = `${phase.id}-${question.id}`, hintId = `${questionId}-hint`
              sequence(hintId, phase, [{ speakerId: 'narrator', text: question.hint }], questionId)
              add(questionId, { type: 'choice', stage: phaseStage, sceneId, prompt: question.prompt,
                options: question.choices.map(answer => ({ id: answer.id, label: reasoningLabels[question.id]?.[answer.id] ?? answer.text, next: answer.id === question.answer ? action.questions?.[index + 1] ? `${phase.id}-${action.questions[index + 1].id}` : finish : hintId,
                  condition: has(question.requires), updates: answer.id === question.answer ? [{ type: 'setFlag', id: `${question.id}-solved`, value: true }, ...grants(question.grants)] : [],
                })) }, time)
            })
            continuation = `${phase.id}-${action.questions[0].id}`
          }
        }
        options.push({ id: commandId, label: commandId === 'think' ? '考える' : '整理する',
          next: sequence(action.id, phase, action.lines, continuation, action.questionSetId ? [] : grants(action.grants)), condition: has(action.requires) })
      }
    }
    const nextPhase = phase.exit.nextSceneId ? phaseById.get(phase.exit.nextSceneId) : undefined
    const endingId = `${phase.id}-ending`, exitId = `${phase.id}-exit`
    const partEnd = !nextPhase || nextPhase.part !== phase.part
    let next = nextPhase ? `${nextPhase.id}-intro` : 'episode-complete'
    if (nextPhase && nextPhase.part !== phase.part) next = `${nextPhase.id}-start`
    // 外への退出と到着は、部の境界表示とは独立して接続する。
    if (nextPhase && nextPhase.locationId !== phase.locationId && nextPhase.sceneTime.slice(0, 10) === phase.sceneTime.slice(0, 10)) {
      const outsideId = `${phase.id}-outside`, mapId = `${phase.id}-map`, destinationId = `${phase.id}-destination`, destinationMap = `${phase.id}-destination-map`
      const exteriorScene = `${phase.id}-outside-scene`, targetExterior = `${phase.id}-destination-scene`
      const exterior = (place: string, stamp: string) => `${place}-exterior${['office', 'building'].includes(place) && Number(stamp.slice(11, 13)) >= 16 ? '-evening' : ''}`
      scenes[exteriorScene] = { backgroundId: exterior(phase.locationId, phase.sceneTime), characters: [{ characterId: 'minato', expression: 'normal', position: 'left' }], smokingAllowed: false }
      scenes[targetExterior] = { ...scenes[exteriorScene], backgroundId: exterior(nextPhase.locationId, nextPhase.sceneTime) }
      add(outsideId, { type: 'choice', stage: scenes[exteriorScene], sceneId: exteriorScene, prompt: `${placeNames[phase.locationId]}前`, options: [
        { id: 'map', label: '他に移動する', next: mapId }, { id: 'enter', label: '中に入る', next: menuId },
      ] }, time)
      add(mapId, { type: 'choice', stage: scenes[exteriorScene], sceneId: exteriorScene, prompt: '移動先', map: { current: phase.locationId, back: outsideId }, options: [
        { id: nextPhase.locationId, label: placeNames[nextPhase.locationId], next: nextPhase.roomId.endsWith('exterior') ? `${nextPhase.id}-intro` : destinationId }, { id: 'return', label: '戻る', next: outsideId },
      ] }, time)
      add(destinationId, { type: 'choice', stage: scenes[targetExterior], sceneId: targetExterior, prompt: `${placeNames[nextPhase.locationId]}前`, options: [
        { id: 'enter', label: '中に入る', next: arrival(nextPhase) }, { id: 'map', label: '他に移動する', next: destinationMap },
      ], entryUpdates: [information(`clock:${nextPhase.sceneTime}`)] }, timeLabel(nextPhase.sceneTime))
      add(destinationMap, { type: 'choice', stage: scenes[targetExterior], sceneId: targetExterior, prompt: '移動先', map: { current: nextPhase.locationId, back: destinationId }, options: [
        { id: phase.locationId, label: placeNames[phase.locationId], next: outsideId }, { id: 'return', label: '戻る', next: destinationId },
      ] }, timeLabel(nextPhase.sceneTime))
      next = outsideId
    } else if (nextPhase && nextPhase.roomId !== phase.roomId) next = arrival(nextPhase)
    const afterEnding = partEnd ? `${phase.id}-end` : next
    if (partEnd) boundary(afterEnding, phase, 'OUT', next)
    sequence(endingId, phase, phase.ending, afterEnding)
    add(exitId, { type: 'choice', stage: phaseStage, sceneId, prompt: '移動', options: [
      { id: 'proceed', label: nextPhase && nextPhase.sceneTime.slice(0, 10) !== phase.sceneTime.slice(0, 10) ? phase.exit.label : nextPhase && (nextPhase.locationId !== phase.locationId || nextPhase.roomId.endsWith('exterior')) ? '外に出る' : nextPhase && nextPhase.roomId !== phase.roomId ? roomNames[nextPhase.roomId] ?? placeNames[nextPhase.locationId] : '移動する', next: endingId },
      { id: 'return', label: '戻る', next: menuId },
    ] }, time)
    const automaticExit = !nextPhase || nextPhase.locationId===phase.locationId && nextPhase.roomId===phase.roomId
    if(!automaticExit) options.push({id:'move',label:'移動',next:exitId,condition:has(phase.exit.requires)})
    const fallback = sequence(`${phase.id}-fallback`, phase, [{ speakerId: 'narrator', text: 'まだ確かめることがある。' }], menuId)
    add(menuId, { type: 'choice', mode: 'free-action', keepQuestions: true, implementedCommands: ['speak', 'look', 'investigate', 'think', 'organize', 'move'], stage: phaseStage, sceneId, prompt: '次の行動', options, empty: { label: '続ける', next: fallback } }, time)
    for (const action of [...phase.ask, ...phase.speak, ...phase.inspect]) {
      if (action.grants.includes('search-photo')) {
        const acquisitionId = `${action.id}-acquisition`
        add(acquisitionId, { type: 'dialogue', stage: phaseStage, sceneId, speakerId: 'narrator', text: 'あかりから、直人の写真を受け取った。', next: returnTargets.get(action.id) ?? menuId,
          acquisition: { itemId: 'naoto-photo', title: formatNames('高瀬直人の写真'), imageSrc: resolveExpression('naoto', 'normal').imageSrc ?? '' }, updates: [{ type: 'addHeardTopic', id: action.id }, ...grants(action.grants)] }, time)
        let nodeId = action.id
        while (nodes[nodeId]?.type === 'dialogue') {
          const node = nodes[nodeId]
          if (node.type !== 'dialogue') break
          if (node.next === (returnTargets.get(action.id) ?? menuId)) { node.next = acquisitionId; node.updates = []; break }
          nodeId = node.next
        }
      }
      if (/写真/.test(action.label ?? '') && !action.grants.includes('search-photo')) uses.push({ itemId: 'naoto-photo', nodeIds: [menuId], next: action.id, condition: has(['search-photo', ...action.requires]) })
      if (action.itemId && action.itemId !== 'smartphone') uses.push({ itemId: ({ IT01: 'naoto-photo', IT02: 'journal-copy', IT03: 'report-copy', IT04: 'site-plan' } as Record<string, string>)[action.itemId] ?? action.itemId, label: `${resolveSpeakerName(personFor(action))}：${action.label ?? '提示する'}`, nodeIds: [menuId], next: action.id, condition: has(action.requires) })
      if (/名刺/.test(action.label ?? '')) uses.push({ itemId: 'business-card', nodeIds: [menuId], next: action.id, condition: has(action.requires) })
      if (action.interaction === 'phone' && !action.triggerMode) uses.push({ itemId: 'smartphone', label: `${resolveSpeakerName(personFor(action))}：${action.label ?? '連絡する'}`, nodeIds: [menuId], next: action.id, condition: has(action.requires) })
    }
    const phaseUses = uses.filter(use=>use.nodeIds.includes(menuId))
    for(const use of phaseUses){
      const original = use.next
      const owner = [...phase.ask,...phase.speak,...phase.inspect].find(action=>action.id===original)
      const person = owner ? personFor(owner) : undefined
      const origins = [menuId, `${phase.id}-speak-people`, ...(person ? [`${phase.id}-speak-${person}`] : []), `${phase.id}-targets`, `${phase.id}-investigate-targets`].filter(id=>Boolean(nodes[id]))
      // ルートの使用もルートに戻す。会話から選ぶ場合は従来どおり話題に戻る。
      for(const origin of origins){
        const start = `${original}-item-from-${origin}`
        const visited = new Set<string>(); let cursor = original
        while(!visited.has(cursor) && nodes[cursor]?.type==='dialogue'){
          visited.add(cursor); const source = nodes[cursor]
          if(source.type!=='dialogue') break
          const internal = nodes[source.next]?.type==='dialogue' && sceneOwners.get(nodes[source.next].sceneId ?? '')===phase.id
          const cloneId = cursor===original ? start : `${cursor}-item-from-${origin}`
          add(cloneId,{...source,next:internal ? `${source.next}-item-from-${origin}` : origin},times[cursor])
          if(!internal)break
          cursor=source.next
        }
        uses.push({...use,nodeIds:[origin],next:start})
      }
      use.nodeIds=[]
    }
    // 話題を一括で切り替えるつなぎの後は、次の行動をメイン一覧から選ぶ。
    const topicBranches = (phase.topicTransitions ?? []).map(bridge=>({condition:{type:'all' as const,conditions:[has(bridge.requires),{type:'not' as const,condition:has(bridge.unless)}]},next:sequence(bridge.id,phase,bridge.lines,menuId,grants(bridge.grants),bridge.personId)}))
    if(topicBranches.length) {
      const targets = new Set([menuId,...Object.keys(nodes).filter(id=>sceneOwners.get(nodes[id].sceneId ?? '')===phase.id && ['topic','inspect'].includes(nodes[id].type))])
      for(const node of Object.values(nodes)) if(node.type==='dialogue' && sceneOwners.get(node.sceneId ?? '')===phase.id && targets.has(node.next)) node.conditionalNext=topicBranches
    }
    if(automaticExit){
      const currentTargets = new Set([menuId,...Object.keys(nodes).filter(id=>sceneOwners.get(nodes[id].sceneId ?? '')===phase.id && ['topic','inspect'].includes(nodes[id].type))])
      for(const node of Object.values(nodes)) if(node.type==='dialogue' && sceneOwners.get(node.sceneId ?? '')===phase.id && currentTargets.has(node.next)) node.nextWhen={condition:has([...phase.exit.requires,...(farewell ? [farewell] : []), ...(closing ? [`${phase.id}-conversation-closed`] : [])]),next:endingId}
    }
    if (automaticBranches.length) {
      const targets = new Set([menuId, ...Object.keys(nodes).filter(id => sceneOwners.get(nodes[id].sceneId ?? '') === phase.id && ['topic', 'inspect'].includes(nodes[id].type))])
      for (const [id, node] of Object.entries(nodes)) {
        if (node.type === 'dialogue' && sceneOwners.get(node.sceneId ?? '') === phase.id && targets.has(node.next)) node.conditionalNext = [...(node.conditionalNext ?? []), ...automaticBranches]
        // 旧保存の一覧も、前提が揃った未読の段取りから再開する。
        if (targets.has(id)) node.automaticNext = automaticBranches
      }
    }
  }
  const last = data.scenes.at(-1)!
  // 旧部境界を保存していた場合も、会社へ向かう会話から新しい第1部へ続ける。
  for(const id of ['P1-06-end','P2-01-start']) if(!nodes[id]) add(id,{type:'dialogue',stage:stageFor(phaseById.get('P2-01')!),sceneId:'P2-01',speakerId:'narrator',text:'写真を持って、会社へ向かう。まずは勤務の記録を確かめる。',next:'P2-01-intro'},timeLabel(phaseById.get('P2-01')!.sceneTime))
  add('episode-complete', { type: 'end', stage: stageFor(last), sceneId: last.id, text: 'Episode 01「灰色の証言」完了。' }, timeLabel(last.sceneTime))
  const saveNodeAliases: Record<string, string> = {}
  for (const id of Object.keys(base.nodes)) {
    if (id === 'episode-complete') continue
    let target = 'P1-03-menu'
    if (/^opening/.test(id)) target = 'P1-01-start'
    else if (/^visitor/.test(id)) target = 'P1-02-intro'
    else if (/departure|after-|organize|contact-check|photo-inspect/.test(id)) target = 'P1-06-menu'
    else if (/^part2-start|travel-ready|travel-topics|destinations/.test(id)) target = 'P2-01-menu'
    else if (/company|leave-and|staff-followup|photo-company|card-company/.test(id)) target = 'P2-02-menu'
    else if (/kuroda|meeting-purpose|misaki-work/.test(id)) target = 'P2-03-menu'
    else if (/stairs-inspect/.test(id)) target = 'P2-06-menu'
    else if (/^building|naoto-sighting|old-building-life|^journal|^envelope|police-record|narumi-call/.test(id)) target = 'P2-04-menu'
    else if (/part2-office|part2-menu|part2-topics|mio-evidence|reason1|naoto-callback/.test(id)) target = 'P2-09-menu'
    else if (/^part3-start|part3-travel|part3-map/.test(id)) target = 'P3-01-menu'
    else if (/^naoto-meeting|^safety-call/.test(id)) target = 'P3-02-menu'
    else if (/brother|naoto-testimony|naoto-threat|witness-position|naoto-hidden|naoto-responsibility|part3-organize/.test(id)) target = 'P3-04-menu'
    else if (/part4|original|miyahara-testimony|segawa-caution|position-confirmation|reason2/.test(id)) target = 'P4-02-menu'
    else if (/confrontation|police-confirmation/.test(id)) target = 'P4-07-menu'
    else if (/reunion|epilogue/.test(id)) target = 'P4-09-menu'
    saveNodeAliases[id] = target
  }
  for(const phase of data.scenes){
    const following = phase.exit.nextSceneId ? phaseById.get(phase.exit.nextSceneId) : undefined
    if(!following || following.locationId===phase.locationId && following.roomId===phase.roomId){
      const ending=`${phase.id}-ending`
      const lastRequired=Object.entries(nodes).find(([,node])=>node.type==='dialogue' && sceneOwners.get(node.sceneId ?? '')===phase.id && node.nextWhen?.next===ending && node.updates?.some(update=>phase.exit.requires.includes(update.id)))?.[0]
      saveNodeAliases[`${phase.id}-exit`] = ['P1-05','P4-10'].includes(phase.id) ? `${phase.id}-farewell` : phase.ending.length ? ending : lastRequired ?? `${phase.id}-intro`
    }
  }
  const informationAliases = Object.entries({
    I01: ['F01', 'F02', 'F03', 'F04', 'F05', 'F06a', 'F06', 'F07', 'morning', 'contact', 'workplace', 'met-akari', 'named-akari', 'brother-profile', 'mentioned-naoto', 'named-naoto'],
    'search-photo': ['IT01', 'F08', 'request_accepted'], 'akari-contact': ['F09'],
    I02: ['F13', 'F14', 'F15', 'recognized-company-reception', 'met-company-reception', 'mentioned-kuroda', 'known-kuroda-title'],
    I03: ['F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'met-kuroda', 'named-kuroda', 'mentioned-misaki', 'mentioned-miyahara'],
    'I04-sighting': ['F23', 'F24', 'F25', 'F26', 'F27', 'met-miyahara', 'named-miyahara', 'recognized-miyahara', 'demolition-date'],
    E01: ['F28', 'F29', 'IT02', 'named-misaki'], E03: ['F30', 'IT03'], 'stair-layout': ['F31', 'F32', 'p2-lower-door-known', 'p2-landing-known', 'p2-upper-door-known'],
    E02: ['F33', 'F34', 'F35', 'F36', 'F37', 'met-okumura', 'named-okumura', 'met-segawa', 'named-segawa'],
    I04: ['F38', 'F39', 'F40', 'F41', 'F42', 'IT04', 'reason1-passed'], 'met-naoto': ['F43', 'named-naoto'], 'safety-reported': ['F44', 'F45'],
    'naoto-witness': ['F46', 'W01a'], 'naoto-threat': ['F47', 'F48', 'F49', 'W01b'], W01: ['F50', 'F51', 'F52'], 'witness-position': ['F53', 'F54', 'F55', 'F56', 'F57'],
    E04: ['F58', 'F59', 'F60', 'E04a', 'IT05'], W02: ['F61', 'F62', 'W02a', 'W02b'], I05: ['F63', 'F64', 'F65', 'F66'], W03: ['F67', 'F69', 'F70', 'F71', 'F72', 'F73'],
  }).map(([information, grants]) => ({ information, grants }))
  const firstPhase = data.scenes[0]
  const prologueScene = 'episode-prologue-scene'
  scenes[prologueScene] = { backgroundId: 'prologue', characters: [], smokingAllowed: false }
  episodePrologue.forEach((text, index) => add(`episode-prologue-${index + 1}`, {
    type: 'dialogue', stage: scenes[prologueScene], sceneId: prologueScene, speakerId: 'narrator', text,
    next: index === episodePrologue.length - 1 ? `${firstPhase.id}-start` : `episode-prologue-${index + 2}`,
  }, timeLabel(firstPhase.sceneTime)))
  // 改稿のgrantsを正本とし、旧稿の集約条件で未読の証言・意思を先取りしない。
  for (const [id, node] of Object.entries(nodes)) {
    const phase = [...data.scenes].sort((a,b)=>b.id.length-a.id.length).find(phase=>sceneOwners.get(node.sceneId ?? '')===phase.id || id===phase.id || id.startsWith(phase.id+'-'))
    if (phase) { node.savePhaseId=phase.id; node.savePhaseMarkers=(phase.topicTransitions??[]).flatMap(bridge=>bridge.grants) }
  }
  return { ...base, start: 'episode-prologue-1', scenes, nodes, nodeTimes: times, milestones: [], itemUses: uses.filter(use=>use.nodeIds.length), arrivalEvents: [], saveNodeAliases, informationAliases }
}
