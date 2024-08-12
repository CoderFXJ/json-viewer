import { BaseNode, Rect } from '@antv/g6'

// import type { Group } from '@antv/g'
import type { RectStyleProps } from '@antv/g6'

interface FlowRect extends RectStyleProps {
  // 自定义属性
  // radius: number
}

export class FlowRect extends Rect {
  protected getKeyStyle(attributes: Required<FlowRect>) {
    return { ...super.getKeyStyle(attributes) }
  }

  // 重写方法
  protected drawKeyShape(attributes: Required<FlowRect>, container: Group) {
    // 自定义绘制逻辑，创建一个 G.Circle
    return this.upsert('key', Circle, this.getKeyStyle(attributes), container)
  }
}
