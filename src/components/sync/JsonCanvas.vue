<script lang="ts" setup>
import type { Graph } from '@antv/g6'
import ExtendCircle from '@/register/ExtendCircle'
import { dealDataToTree, registerBehaviors, registerNodes, updateStylle } from '@/utils'
import { useCodeStore, useGlobalStore, useLayoutStore } from '@/store'

const props = defineProps({
  isExpand: {
    type: Boolean,
    default: false,
  },
  isExpandEditor: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['nodeClick'])
register(ExtensionCategory.NODE, 'extend-circle', ExtendCircle)
const { json } = toRefs(useCodeStore())
const { isDark, colors, themeColor, keyword, focusCount, autoRender } = toRefs(useGlobalStore())

const graph = ref<Graph>()
const ratio = defineModel<number>('ratio')
const { activeConfig } = toRefs(useLayoutStore())
const jsonCanvas = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(jsonCanvas)

function render() {
  drawGraph(json.value)
  // updateStylle(graph.value)
  // 触发聚焦搜索
  setTimeout(() => {
    // focusNode(keyword.value)
  }, 500)
}
watch(json, () => {
  if (!autoRender.value)
    return
  render()
}, { deep: true })
// watch(isDark, () => {
//   updateStylle(graph.value)
// })
watch(themeColor, () => {
  window.location.reload()
})

// function updateTheme(g) {
//   const nodes = g.getNodes()
//   nodes.forEach(node => {
//     g.clearItemStates(node, ['dark', 'light','hover','focus','theme-change']);
//     g.setItemState(node, 'theme-change', true)
//   })
//   g.paint()
// }
// 转换配置:两种布局特殊处理 把vgap/hgap转化为箭头函数返回形式
function convertLayoutConfig(config) {
  const hvgapLayout = ['mindmap', 'compactBox']
  if (hvgapLayout.includes(config.type)) {
    const gap = {
      getVGap: () => {
        return config.vgap
      },
      getHGap: () => {
        return config.hgap
      },
    }
    config = { ...config, ...gap }
  }
  return config
}

// 监听到布局配置变化,重新布局
watch(activeConfig, (val: any) => {
  if (!graph.value)
    return
  const layoutConfig = convertLayoutConfig(val)
  // 重新布局后居中展示
  graph.value?.stopLayout()
  graph.value?.setLayout(layoutConfig)
  graph.value?.layout()
  graph.value.fitView({
    direction: 'both',
    when: 'overflow',
  })
}, { deep: true })

const nodeDetail = ref({})
function nodeClickHandler(e) {
  const { item } = e
  const model = item.getModel()
  nodeDetail.value = model
}

// 初始化
// const toolbar = new G6.ToolBar({
//   getContent: () => {
//     const outDiv = document.createElement('div')
//     outDiv.style.display = 'none'
//     // 隐藏outDiv
//     return outDiv
//   },
// })
function initGraph() {
  graph.value = new Graph({
    container: jsonCanvas.value as HTMLElement,
    width: width.value,
    height: height.value,
    autoFit: 'view',
    node: {
      type: 'extend-circle',
      style: {
        labelText: (data): string => {
          return data.keyName || JSON.stringify(data.entries)
        },
        labelPlacement: 'center',
        labelMaxWidth: 200,
        radius: 4,
        size: 30,
        fill: '#EFF4FF',
        lineWidth: 1,
        stroke: '#5F95FF',
      },
      animation: {
        enter: false,
      },
    },
    edge: {
      type: 'cubic-horizontal',
      animation: {
        enter: false,
      },
      style: {
        stroke: '#9ca3af88',
      },
      state: {
        hover: {
          stroke: '#9ca3af88',
          lineWidth: 2,
        },
      },
    },
    behaviors: ['drag-canvas', 'zoom-canvas'],
    // plugins: [toolbar],
    layout: convertLayoutConfig(activeConfig.value),
    // layout: {
    //   type: 'compact-box',
    //   direction: 'LR',
    //   getHeight: function getHeight() {
    //     return 32
    //   },
    //   getWidth: function getWidth() {
    //     return 32
    //   },
    //   getVGap: function getVGap() {
    //     return 10
    //   },
    //   getHGap: function getHGap() {
    //     return 100
    //   },
    // },
  })
  // registerNodes(colors.value, themeColor.value) // 注册节点
  // registerBehaviors(graph.value, openNodeDetail) // 注册行为

  graph.value?.on(CanvasEvent.WHEEL, () => ratio.value = graph.value?.getZoom())
  graph.value.on(NodeEvent.CLICK, nodeClickHandler)
}
function drawGraph(data) {
  const treeData = dealDataToTree(data)
  graph.value.setData(treeToGraphData(treeData))
  graph.value?.render()
}

watchDebounced([width, height], ([w, h]) => {
  if (graph.value)
    graph.value.resize(w, h)
}, { debounce: 600 })

onMounted(() => {
  initGraph()
  drawGraph(json.value)
  // focusNode(keyword.value)
})

// 展开/收起
watch(
  () => props.isExpand,
  (newVal) => {
    // 获取图数据,修改collapsed属性,重新布局
    const data = graph.value?.save() as any
    data.collapsed = !newVal
    graph.value?.layout()
    if (newVal)
      graph.value?.fitView(20)
    else
      graph.value?.moveTo(width.value / 2, height.value / 2)
  },
)
// 保存为图片
async function saveImage(name = 'json-viewer', type) {
  const dataURL = await graph.value?.toDataURL({
    encoderOptions: 1,
    mode: 'overall',
    type,
  })
  const [head, content] = dataURL.split(',')
  const contentType = head.match(/:(.*?);/)![1]

  const bstr = atob(content)
  let length = bstr.length
  const u8arr = new Uint8Array(length)
  while (length--) {
    u8arr[length] = bstr.charCodeAt(length)
  }
  const blob = new Blob([u8arr], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const extMap = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
  }
  const ext = extMap[type] || 'png'
  a.download = `${name}.${ext}`
  a.click()
}

// 清除节点聚焦状态
function clearState(graph) {
  if (!graph)
    return
  const selectedNodes = graph.findAllByState('node', 'focus')
  selectedNodes.forEach((node) => {
    graph.setItemState(node, 'focus', false)
  })
}
// 搜索聚焦节点
// function focusNode(keyword: string) {
//   clearState(graph.value)
//   const kw = keyword.trim()
//   if (!kw) {
//     focusCount.value = 0
//     graph.value?.fitView(20)
//   }
//   else if ('root'.includes(kw)) {
//     const node = graph.value?.findById('root')
//     if (node) {
//       graph.value?.setItemState(node, 'focus', true) // 切换选中
//       focusCount.value = 1
//     }
//     graph.value?.focusItem('root', true, {
//       easing: 'easeCubic',
//       duration: 400,
//     })
//   }
//   else {
//     const findHandle = (node) => {
//       // 查找规则:entries键值对包含 或 keyName 包含keywork
//       let isInclude = false
//       const keyName = node.get('model').keyName || ''
//       const entries = node.get('model').entries
//       if (keyName?.includes(kw)) {
//         isInclude = true
//         return isInclude
//       }
//       for (const key in entries) {
//         const keyStr = `${key}`
//         const valStr = `${entries[key]}`
//         if (keyStr?.includes(kw) || valStr?.includes(kw)) {
//           isInclude = true
//           break
//         }
//       }
//       return isInclude
//     }
//     const findNodes = graph.value?.findAll('node', findHandle) || []
//     focusCount.value = findNodes.length
//     // 动画地移动，并配置动画
//     if (findNodes.length > 0) {
//       graph.value?.focusItem(findNodes[0], true, {
//         easing: 'easeCubic',
//         duration: 400,
//       })
//       // 清除所有节点的选中状态
//       findNodes.forEach((node) => {
//         graph.value?.setItemState(node, 'focus', true) // 切换选中
//       })
//     }
//     else {
//       graph.value?.fitView(20)
//     }
//   }
// }
// watchDebounced(keyword, focusNode, { debounce: 300 })
onUnmounted(() => {
  graph.value?.clear()
  graph.value?.off()
  graph.value?.destroy()
})
defineExpose({
  saveImage,
  // toolbar,
  graph,
  render,
})
</script>

<template>
  <div ref="jsonCanvas" class="wh-full" />
</template>
