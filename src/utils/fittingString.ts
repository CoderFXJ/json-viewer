// 节点文本溢出省略
export function fittingString(str: string, maxWidth: number, fontSize: number = 12) {
  const ellipsis = '...'
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0]
  let currentWidth = 0
  let res = str
  const pattern = /[\u4E00-\u9FA5]+/
  str.split('').forEach((letter, i) => {
    if (currentWidth > maxWidth - ellipsisLength)
      return
    if (pattern.test(letter))
      currentWidth += fontSize
    else
      currentWidth += G6.Util.getLetterWidth(letter, fontSize)

    if (currentWidth > maxWidth - ellipsisLength)
      res = `${str.substr(0, i)}${ellipsis}`
  })
  return res
}
