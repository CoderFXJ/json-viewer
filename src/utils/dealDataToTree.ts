// 生成随机 id
function randomId(count = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + count)
}

function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function isArray(value) {
  return Array.isArray(value)
}
function hasOwnProperty(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key)
}
// 处理数据结构
export function dealDataToTree(data, keyName = '') {
  const node = {
    id: randomId(),
    keyName: keyName || undefined,
    entries: {},
    children: [],
  }

  if (isObject(data)) {
    for (const key in data) {
      if (hasOwnProperty(data, key)) {
        const value = data[key]

        if (isObject(value)) {
          const childNode = {
            id: randomId(),
            keyName: key,
            entries: {},
            children: [],
          }

          const grandChildNode = {
            id: randomId(),
            entries: {},
            children: [],
          }

          for (const subKey in value) {
            if (hasOwnProperty(value, subKey)) {
              const subValue = value[subKey]
              if (!isObject(subValue) && !isArray(subValue)) {
                grandChildNode.entries[subKey] = subValue
              }
              else {
                grandChildNode.children.push(dealDataToTree(subValue, subKey))
              }
            }
          }

          childNode.children.push(grandChildNode)
          node.children.push(childNode)
        }
        else if (isArray(value)) {
          const arrayNode = {
            id: randomId(),
            keyName: key,
            entries: {},
            children: value.map(item => ({
              id: randomId(),
              keyName: item,
              entries: {},
              children: [],
            })),
          }

          node.children.push(arrayNode)
        }
        else {
          node.entries[key] = value
        }
      }
    }
  }
  else if (isArray(data)) {
    node.children = data.map(item => ({
      id: randomId(),
      keyName: item,
      entries: {},
      children: [],
    }))
  }

  return node
}
