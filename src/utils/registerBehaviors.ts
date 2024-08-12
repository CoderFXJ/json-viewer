// import { updateStylle } from '../register/node'
// 注册行为
export function registerBehaviors(graph, nodeClickCb: (node: any) => void) {
  const handleCollapse = (e) => {
    e.stopPropagation()
    const target = e.target
    const id = target.get('modelId')
    const item = graph?.findById(id)
    const nodeModel = item.getModel()
    nodeModel.collapsed = !nodeModel.collapsed
    graph?.layout()
    graph?.setItemState(item, 'collapse', nodeModel.collapsed)
    // updateStylle(graph)
  }
  // 打印画布可以监听的事件
  const handleNodeMouseEnter = (e) => {
    e.stopPropagation()
    const node = e.item
    graph?.setItemState(node, 'hover', !node.hasState('hover')) // 切换选中
  }
  const handleNodeClick = (e) => {
    const node = e.item
    nodeClickCb(node)
  }
  const handleEdgeMouseOver = (e) => {
    const edge = e.item
    graph?.setItemState(edge, 'hover', true)
  }
  const handleEdgeMouseOut = (e) => {
    const edge = e.item
    graph?.setItemState(edge, 'hover', false)
  }
  graph.on('collapse-text:click', handleCollapse)
  graph.on('collapse-icon:click', handleCollapse)

  graph.on('node:mouseover', handleNodeMouseEnter)
  graph.on('node:mouseout', handleNodeMouseEnter)
  // 边
  graph.on('edge:mouseover', handleEdgeMouseOver)
  graph.on('edge:mouseout', handleEdgeMouseOut)

  graph.on('edge:mouseout', (e) => {
    const edge = e.item
    graph?.setItemState(edge, 'hover', false)
  })

  graph.on('node:click', handleNodeClick)
  graph.on('node:touchend', handleNodeClick)
}
