import { Circle, subStyleProps } from '@antv/g6'
import { Text } from '@antv/g'

import type { Group } from '@antv/g'
import type { CircleStyleProps } from '@antv/g6'

interface ExtendCircleStyleProps extends CircleStyleProps {
  // 自定义属性
  paragraph: string
}

class ExtendCircle extends Circle {
  protected getTextStyle(attributes: Required<ExtendCircleStyleProps>) {
    console.log('[ attributes ]-14', attributes)
    // 获取以 paragraph 开头的样式属性，例如 paragraphFontSize
    const paragraphStyle = subStyleProps(attributes, 'paragraph')
    return { ...paragraphStyle, text: attributes.paragraph }
  }

  protected drawTextShape(attributes: Required<ExtendCircleStyleProps>, container: Group) {
    // 自定义绘制逻辑，创建一个 G.Text
    // return this.upsert('text', Text, this.getTextStyle(attributes), container)
    // 让文本颜色为红色
  }

  protected render(attrs: Required<ExtendCircleStyleProps>, container: Group) {
    super.render(attrs, container)
    // 调用自定义绘制逻辑
    // this.drawTextShape(attrs, container)
  }
}
export default ExtendCircle
