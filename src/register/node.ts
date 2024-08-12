import type { GraphOptions } from '@antv/g6'
import chroma from 'chroma-js'
import { Rect } from '@antv/g6'
import { computeNodeSize } from '../utils/computeNodeSize'

function FlowRect(cfg: any, group: any) {
  return {
    shapeType: 'flow-rect',
    draw(cfg: any, group) {
      if (!group)
        return
      const { collapsed = true } = cfg as GraphOptionsPlus
      // 计算矩形节点高度
      const [width, height, entriesStr] = computeNodeSize(cfg)
      // 矩形框配置
      const rectConfig = {
        width: width + 20,
        height: height + 20,
        lineWidth: 1,
        fontSize: 12,
        fill: clevels[2], // 设置透明度
        radius: 4,
        stroke: clevels[8],
        opacity: 1,
      }

      const nodeOrigin = {
        x: -rectConfig.width / 2,
        y: -rectConfig.height / 2,
      }

      const rect = group.addShape('rect', {
        name: 'bg-rect',
        attrs: {
          x: nodeOrigin.x,
          y: nodeOrigin.y,
          ...rectConfig,
        },
      })

      // 文本内容
      group.addShape('text', {
        name: 'node-text',
        attrs: {
          textAlign: 'left',
          textBaseline: 'bottom',
          x: nodeOrigin.x + 8,
          y: -nodeOrigin.y - 12,
          text: entriesStr,
          fontSize: 12,
          lineHeight: 12 * 1.5,
          fill: textColor,
          cursor: 'pointer',
          fontFamily: 'Arial',
        } as any,
      })

      // 折叠按钮
      const { id, children = [] } = cfg
      if (children.length) {
        group.addShape('rect', {
          name: 'collapse-rect',
          attrs: {
            x: rectConfig.width / 2 - 6,
            y: -6,
            width: 12,
            height: 12,
            stroke: clevels[6],
            cursor: 'pointer',
            fill: clevels[1],
            radius: 2,
            zIndex: 10,
          },
          modelId: id,
        })

        // 折叠按钮上的文字
        group.addShape('text', {
          name: 'collapse-text',
          attrs: {
            x: rectConfig.width / 2,
            y: -1,
            textAlign: 'center',
            textBaseline: 'middle',
            text: collapsed ? '+' : '-',
            fontSize: 16,
            cursor: 'pointer',
            fill: foldColor,
          },
          modelId: id,
        })
      }
      return rect
    },
    setState(name, value, item) {
      const group = item.getContainer()
      const byName = (e, name) => e.get('name') === name
      const nodeRect = group.find(e => byName(e, 'bg-rect'))
      // const collapseRect = group.find(e => byName(e, 'collapse-rect'))
      const nodeText = group.find(e => byName(e, 'node-text'))
      const collapseText = group.find(e => byName(e, 'collapse-text'))
      const pcolor = getPrimaryColor()
      const { textColor, rectColorMap, foldColor } = handleColors([args[0], pcolor])
      if (value) {
        /* 暗黑模式切换 */
        if (['dark', 'light'].includes(name)) {
          nodeText.attr('fill', textColor)
          // 折叠按钮
          if (collapseText)
            collapseText.attr('fill', foldColor)
        }
        else if (name === 'collapse') {
          if (collapseText)
            collapseText.attr({ text: value ? '+' : '-' })
        }
        // else if (name === 'theme-change') {
        //   // 主题色切换
        //   nodeText.attr('fill', textColor)
        //   nodeRect.attr('fill', clevels[2])
        //   nodeRect.attr('stroke', clevels[8])

        //   collapseText?.attr('fill', foldColor)
        //   collapseRect?.attr('fill', clevels[1])
        //   collapseRect?.attr('stroke', clevels[6])
        // }
      }

      if (name === 'hover') {
        const isFocus = item.hasState('focus')
        nodeRect.attr('stroke', rectColorMap.stroke(value, isFocus))
        nodeRect.attr('fill', rectColorMap.fill(value, isFocus))
      }
      else if (name === 'focus') {
        nodeRect.attr('stroke', rectColorMap.stroke(false, value))
        nodeRect.attr('fill', rectColorMap.fill(false, value))
      }
    },
    getAnchorPoints() {
      return [
        [0, 0.5],
        [1, 0.5],
      ]
    },
  }
}
register(ExtensionCategory.NODE, 'flow-rect', FlowRect, Rect)

// register(ExtensionCategory.NODE, 'g', GNode)
interface GraphOptionsPlus extends GraphOptions {
  id: string
  entries: string
  keyName: string
  collapsed?: boolean
  [propName: string]: any
}
type bos = boolean | string

function getPrimaryColor() {
  return document.documentElement.style.getPropertyValue('--el-color-primary')
}

// export function updateStylle(g) {
//   const nodes = g.getNodes()
//   const isDark = useDark()
//   const state = isDark.value ? 'dark' : 'light'
//   nodes.forEach((node) => {
//     g.clearItemStates(node, [isDark.value ? 'light' : 'dark', 'hover'])
//     g.setItemState(node, state, true)
//   })
// }

// export function handleColors([colors, colorValue]) {
//   const focusColor = ['#00DC82', '#2dd4bf'].includes(colorValue) ? colors.amber : '#33BB69'
//   const focusColorMap = {
//     fill: chroma(focusColor).alpha(0.2).hex(),
//     stroke: focusColor,
//   }
//   const clevels = Array.from({ length: 10 }).fill(0).map((_, i) => chroma(colorValue).alpha(i / 10).hex())

//   const rectColorMap = {
//     stroke: (isHover: bos, isFocus: bos) => isFocus ? focusColorMap.stroke : (isHover ? colorValue : clevels[8]),
//     fill: (isHover: bos, isFocus: bos) => isFocus ? focusColorMap.fill : (isHover ? clevels[3] : clevels[2]),
//   }
//   const isDark = useDark()
//   const textColor = isDark.value ? '#fff' : '#333'
//   const foldColor = chroma(textColor).alpha(0.8).hex()

//   return { focusColorMap, clevels, textColor, foldColor, rectColorMap }
// }

// export function registerNodes(...args: any[]) {
//   const { clevels, textColor, foldColor } = handleColors(args)
//   G6.registerNode(
//     'flow-rect',
//  ,
//     'rect',
//   )
// }
