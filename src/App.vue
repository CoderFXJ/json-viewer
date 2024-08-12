<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { useCodeStore, useGlobalStore } from '@/store'
import { toggleDarkAnimate, useMobile } from '@/hooks'
import { isObject } from '@/utils'
import 'splitpanes/dist/splitpanes.css'

const ExportImage = defineAsyncComponent(() => import('@/components/async/ExportImage.vue'))
const FieldsCustom = defineAsyncComponent(() => import('@/components/async/FieldsCustom.vue'))
const NodeDialog = defineAsyncComponent(() => import('@/components/async/NodeDialog.vue'))
const LayoutCustom = defineAsyncComponent(() => import('@/components/async/LayoutCustom.vue'))
const { originCode, formatCode, json, jsonValid } = toRefs(useCodeStore())
const { isDark, paneSize, autoRender, isExpandEditor } = toRefs(
  useGlobalStore(),
)
const { toggleEditor, toggleExecuteMode, toggleLanguage } = useGlobalStore()
const drawerVisible = ref(false)
function openLayoutConfig() {
  drawerVisible.value = !drawerVisible.value
}
const ratio = ref(1)
const ratioText = computed(() => {
  return `${(ratio.value * 100).toFixed(2)}%`
})
const isMobile = useMobile()
const [isExpandNode, toggleNode] = useToggle(true)

const editorIconStyle = computed(() => {
  const transform = isMobile.value
    ? `rotate(${isExpandEditor.value ? '90deg' : '270deg'})`
    : `rotate(${isExpandEditor.value ? '0deg' : '180deg'})`
  return {
    transform,
  }
})
function onUpdateCode(codeStr: string) {
  originCode.value = codeStr
}
const debounceUpdate = useDebounceFn(onUpdateCode, 500)

// 导出json
function onExport() {
  const filename = 'json-viewer.json'
  const jsonStr = isObject(json.value)
    ? JSON.stringify(json.value, undefined, 2)
    : json.value
  const blob = new Blob([jsonStr as any], { type: 'text/plain' })
  const link = document.createElement('a')
  link.setAttribute('style', 'display: none')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
// 导入json
function onImport() {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', '.json')
  input.click()
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file)
      return
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      const jsonStr = reader.result
      originCode.value = jsonStr as string
    }
  }
}

const jsonCanvasRef = ref()
const exportVisible = ref(false)
function onRender() {
  jsonCanvasRef.value.render()
}
function showExportImage() {
  exportVisible.value = true
}
function onZoomOut() {
  if (jsonCanvasRef?.value) {
    (jsonCanvasRef?.value?.toolbar as any).zoomOut()
    ratio.value = jsonCanvasRef?.value?.graph.getZoom()
  }
}
function onZoomIn() {
  if (jsonCanvasRef?.value) {
    (jsonCanvasRef?.value?.toolbar as any).zoomIn()
    ratio.value = jsonCanvasRef?.value?.graph.getZoom()
  }
}
function onAutoZoom() {
  if (jsonCanvasRef?.value) {
    (jsonCanvasRef?.value?.toolbar as any).autoZoom()
    ratio.value = jsonCanvasRef?.value?.graph.getZoom()
  }
}
// 关键词搜索
const nodeDetailVisible = ref(false)
const nodeDetail = ref({})
function nodeClickHandler(node: any) {
  nodeDetail.value = node
  nodeDetailVisible.value = true
}
// 全屏/退出全屏
const isFullScreen = ref(false)
function onFullScreen() {
  isFullScreen.value = !isFullScreen.value
  if (isFullScreen.value)
    document.documentElement.requestFullscreen()
  else document.exitFullscreen()
}
// 自定义需要额外解析的字段
const fieldsVisible = ref(false)
function openFieldsDialog() {
  fieldsVisible.value = true
}

const editorIconList = [
  {
    icon: 'icon-node-layout',
    content: 'layoutConfig',
    onClick: openLayoutConfig,
  },
  {
    icon: 'icon-zidingyi',
    content: 'parseField',
    onClick: openFieldsDialog,
  },
  {
    icon: 'icon-import-json',
    content: 'import',
    onClick: onImport,
  },
  {
    icon: 'icon-export-json',
    content: 'export',
    onClick: onExport,
  },
  {
    icon: 'icon-clear-json',
    content: 'clear',
    onClick: () => {
      originCode.value = ''
    },
  },
]
const canvasIconList = [
  {
    icon: 'icon-jia',
    content: 'zoomIn',
    onClick: onZoomOut,
  },
  {
    icon: 'icon-jian',
    content: 'zoomOut',
    onClick: onZoomIn,
  },
  {
    icon: 'icon-center-focus',
    content: 'center',
    onClick: onAutoZoom,
  },
  {
    icon: 'icon-save-image',
    content: 'saveImage',
    onClick: showExportImage,
  },
  {
    icon: 'icon-language',
    content: 'language',
    onClick: toggleLanguage,
  },
]
</script>

<template>
  <div>
    <Splitpanes
      class="default-theme"
      style="height: 100vh"
      :horizontal="isMobile"
    >
      <Pane max-size="50" :size="paneSize[0]">
        <div
          border="b gray/20"
          class="h-10 flex items-center bg-gray/10 px-2 space-x-3"
        >
          <template v-for="item, idx in editorIconList" :key="idx">
            <el-tooltip :content="$t(item.content)">
              <span class="iconfont" :class="item.icon" @click="item.onClick" />
            </el-tooltip>
          </template>

          <el-tooltip :content="$t(autoRender ? 'autoRender' : 'manualRender')">
            <span
              class="iconfont icon-auto"
              :class="autoRender ? '!text-green-500' : ''"
              @click="toggleExecuteMode()"
            />
          </el-tooltip>
          <el-tooltip content="渲染">
            <Transition name="slide">
              <el-button
                v-show="!autoRender"
                class="iconfont icon-execute"
                :class="[
                  !autoRender && jsonValid ? '!text-green-500' : '',
                  jsonValid ? '' : '!text-gray-300',
                ]"
                link
                :disabled="!jsonValid"
                @click="onRender"
              />
            </Transition>
          </el-tooltip>
        </div>

        <VueCodeMirror
          :value="formatCode"
          :style="{ height: 'calc(100% - 40px);' }"
          @update-code="debounceUpdate"
        />
      </Pane>
      <Pane :size="paneSize[1]">
        <div h-full>
          <div
            border="b gray/20"
            class="bg-gray/10 px-2 md:(h-10 flex-between-center)"
          >
            <div class="flex-y-center space-x-3">
              <el-tooltip
                :content="`${
                  isExpandEditor ? $t('collapse') : $t('expand')
                }${$t('editor')}`"
              >
                <span
                  class="iconfont icon-editor-expand"
                  :style="editorIconStyle"
                  @click="toggleEditor()"
                />
              </el-tooltip>
              <el-tooltip
                :content="`${isExpandNode ? $t('collapse') : $t('expand')}${$t(
                  'nodes',
                )}`"
              >
                <span
                  class="iconfont"
                  :class="
                    isExpandNode ? 'icon-node-collapse' : 'icon-node-expand'
                  "
                  @click="toggleNode()"
                />
              </el-tooltip>

              <template v-for="item, idx in canvasIconList" :key="idx">
                <el-tooltip :content="$t(item.content)">
                  <span
                    class="iconfont"
                    :class="item.icon"
                    @click="item.onClick"
                  />
                </el-tooltip>
              </template>

              <el-tooltip
                :content="`${isFullScreen ? $t('exit') : $t('enter')}${$t(
                  'fullscreen',
                )}`"
              >
                <span
                  class="iconfont"
                  :class="
                    isFullScreen
                      ? 'icon-exit-fullscreen'
                      : 'icon-enter-fullscreen'
                  "
                  @click="onFullScreen"
                />
              </el-tooltip>
              <span
                class="iconfont"
                :class="isDark ? 'icon-night' : 'icon-day'"
                @click="toggleDarkAnimate"
              />
              <ColorPicker>
                <template #icon>
                  <span class="iconfont icon-theme" />
                </template>
              </ColorPicker>
              <div op60>
                {{ ratioText }}
              </div>
            </div>
            <SearchInput />
          </div>
          <JsonCanvas
            ref="jsonCanvasRef"
            v-model:ratio="ratio"
            :is-expand="isExpandNode"
            :is-expand-editor="isExpandEditor"
            @node-click="nodeClickHandler"
          />
        </div>
      </Pane>
    </Splitpanes>
    <ExportImage v-if="exportVisible" v-model="exportVisible" @confirm="({ name, type }) => jsonCanvasRef?.saveImage(name, type)" />
    <FieldsCustom v-if="fieldsVisible" v-model="fieldsVisible" />
    <NodeDialog v-if="nodeDetailVisible" v-model="nodeDetailVisible" :node-detail="nodeDetail" />
    <LayoutCustom v-if="drawerVisible" v-model="drawerVisible" />
  </div>
</template>

<style lang="scss" scoped>
* {
  font-size: 13px;
}

.splitpanes {
  &.default-theme {
    .splitpanes__pane {
      background-color: transparent;
    }

    :deep(.splitpanes__splitter) {
      background-color: #d1d5db26;
      border-color: #d1d5db26 !important;
    }
  }
}

.iconfont {
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  color: #9ca3af;

  &:hover {
    color: #222;
  }
}

.dark .iconfont:hover {
  color: #fff;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.15s ease-in-out;
}

.slide-enter-from {
  transform: translateY(-100%);
}

.slide-leave-to {
  transform: translateY(-100%);
}
</style>
