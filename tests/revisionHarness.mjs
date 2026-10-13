import { createServer } from './viteServer.mjs'
export async function loadRevision() {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { episode1Part1: scenario } = await server.ssrLoadModule('/src/data/scenario/episode1Part1.ts')
    const { revisionData } = await server.ssrLoadModule('/src/data/scenario/revisionData.ts')
    const state = await server.ssrLoadModule('/src/features/story/state.ts')
    const free = await server.ssrLoadModule('/src/features/story/freeAction.ts')
    const saves = await server.ssrLoadModule('/src/features/story/saveData.ts')
    const records = await server.ssrLoadModule('/src/features/story/investigation.ts')
    const commands = await server.ssrLoadModule('/src/data/scenario/revisionCommands.ts')
    const dates = await server.ssrLoadModule('/src/features/story/dateTime.ts')
    return { scenario, revisionData, ...state, ...free, ...saves, ...records, ...dates, ...commands }
  } finally { await server.close() }
}
export function buildPlaythrough(api, requiredOnly = false) {
  const { scenario, revisionData, createInitialState, reduceGameState, visibleChoices, matchesCondition, applyUpdates } = api
  let state=createInitialState(scenario), count=0
  const operations=[], checkpoints=[], boundaries=[]
  const phaseFor=node=>[...revisionData.scenes].sort((a,b)=>b.id.length-a.id.length).find(phase=>node.sceneId===phase.id||node.sceneId?.startsWith(phase.id+'-'))
  const actions=new Map(revisionData.scenes.flatMap(phase=>[...phase.ask,...phase.speak,...phase.inspect,...phase.think,...(phase.organize??[])].map(action=>[action.id,action])))
  const checkpoint=(phase,value)=>{
    if(!phase||checkpoints.some(point=>point.phase===phase.id)) return
    const missing=phase.exit.requires.filter(id=>!value.acquiredInformation.includes(id))
    if(missing.length) throw new Error('必要情報未取得 '+phase.id+': '+missing.join(','))
    checkpoints.push({phase:phase.id,state:{...value,nodeId:phase.id+'-menu'},actions:[...value.heardTopics,...value.inspectedTargets].filter(id=>actions.has(id))})
  }
  const input=action=>{
    const node=scenario.nodes[state.nodeId],phase=phaseFor(node)
    const option=action.type==='choose'?visibleChoices(node,state).find(item=>item.id===action.choiceId):undefined
    const updated=applyUpdates(state,node.type==='dialogue'?node.updates??[]:[])
    if(node.type==='dialogue' && node.nextWhen && action.type==='advance' && !node.conditionalNext?.some(branch=>matchesCondition(updated,branch.condition)) && matchesCondition(updated,node.nextWhen.condition)) checkpoint(phase,updated)
    if(node.type==='choice'&&node.mode==='free-action'&&action.choiceId==='move')checkpoint(phase,state)
    const before=state,after=reduceGameState(scenario,state,action)
    if(after===before)throw new Error('拒否された操作 '+state.nodeId+' '+JSON.stringify(action))
    operations.push({before:before.nodeId,after:after.nodeId,action,label:option?.label,map:Boolean(node.map)})
    state=after;if(++count>6000)throw new Error('進行ループ')
  }
  const choose=id=>input({type:'choose',choiceId:id})
  while(state.nodeId!=='episode-complete'){
    const node=scenario.nodes[state.nodeId]
    if(node.type==='dialogue'){
      if(node.illustration)boundaries.push(node.illustration.id)
      input({type:'advance'});continue
    }
    if(node.type==='topic'||node.type==='inspect'){choose('return');continue}
    if(node.type!=='choice')throw new Error('不明な状態 '+state.nodeId)
    const options=visibleChoices(node,state)
    if(node.mode==='free-action'){
      const candidates=[]
      for(const command of options){
        const target=scenario.nodes[command.next]
        if(target.type==='topic')for(const person of visibleChoices(target,state).filter(item=>item.id!=='return')){
          const topics=scenario.nodes[person.next]
          for(const topic of visibleChoices(topics,state).filter(item=>item.id!=='return'))candidates.push({command:command.id,person:person.id,topic,kind:'topic'})
        }
        else if(target.type==='inspect')for(const topic of visibleChoices(target,state).filter(item=>item.id!=='return'))candidates.push({command:command.id,topic,kind:'inspect'})
        else if(['think','organize'].includes(command.id))candidates.push({command:command.id,topic:{id:command.next},kind:'thought'})
      }
      const available=candidates.filter(item=>{
        const action=actions.get(item.topic.id)
        if(requiredOnly&&!(action?.required??item.topic.required))return false
        return !(item.kind==='inspect'?state.inspectedTargets:state.heardTopics).includes(item.topic.id) && !(item.kind==='thought'&&action?.grants.every(id=>state.acquiredInformation.includes(id)))
      }).sort((a,b)=>Number(actions.get(a.topic.id)?.required??a.topic.required??false)-Number(actions.get(b.topic.id)?.required??b.topic.required??false))
      const selected=available[0]
      if(selected){choose(selected.command);if(selected.person)choose(selected.person);if(selected.kind!=='thought')choose(selected.topic.id);continue}
      if(options.some(item=>item.id==='move')){choose('move');continue}
      throw new Error('未解決の進行 '+state.nodeId+' '+JSON.stringify(options.map(item=>item.id)))
    }
    const correct=options.find(option=>option.updates?.some(update=>update.type==='setFlag'))
    if(correct){choose(correct.id);continue}
    if(node.map){choose(options.find(item=>item.id!=='return').id);continue}
    const move=options.find(item=>['proceed','map','enter'].includes(item.id))
    if(move){choose(move.id);continue}
    throw new Error('未知の選択 '+state.nodeId)
  }
  return {state,operations,checkpoints,boundaries}
}
