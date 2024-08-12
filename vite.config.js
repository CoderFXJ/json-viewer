import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
// 引入element-plus自动按需导入插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
// import cdn from 'vite-plugin-cdn-import'
import { setupPrintBuildInfo } from './build/print-build-info'

const lifecycle = process.env.npm_lifecycle_event
// 获取npm命令
export default defineConfig(({ _, mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: env.VITE_BASE_URL,
    plugins: [
      vue(),
      // {
      //   name: 'html-transform',
      //   transformIndexHtml(html) {
      //     return html
      //   },
      // },
      setupPrintBuildInfo(),
      UnoCSS(),
      // visualizer(),//打包分析
      lifecycle === 'report'
        ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
        : null, // 打包分析
      AutoImport({
        // dirs: ['src/hooks'],
        include: [
          // 导入目标文件类型
          /\.[tj]s(x|on)?$/, // .ts, .tsx, .js, .jsx .json
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        imports: [
          // 预定义
          'vue', // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
          'pinia',
          '@vueuse/core',
          {
            '@antv/g6': ['Graph', 'treeToGraphData', 'register', 'ExtensionCategory', 'iconfont', 'NodeEvent', 'CanvasEvent'],
          },
        ],
        dts: 'src/types/auto-imports.d.ts', // 方案二:生成自动导入的auto-imports.d.ts声明文件, 解决 '找不到名称“Elxxx”' 报错
        resolvers: [ElementPlusResolver()], // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-components.d.ts',
        dirs: ['src/components/sync'],
      }),
      // cdn({
      //   modules: [
      //     {
      //       name: '@antv/g6',
      //       var: 'G6',
      //       path: `https://unpkg.com/@antv/g6@4.8.24/dist/g6.min.js`,
      //     },
      //   ],
      // }),
      VitePWA({
        outDir: 'dist',
        manifest: {
          lang: 'zh-CN',
          name: 'json-viewer',
          short_name: 'json-viewer',
          scope: '/json-viewer/',
          start_url: '/json-viewer/',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          icons: [
            {
              src: '/json-viewer/logo_512.png',
              types: 'img/png',
              sizes: '512x512',
              purpose: 'any',
            },
            {
              src: '/json-viewer/logo_192.png',
              types: 'img/png',
              sizes: '192x192',
              purpose: 'maskable',
            },
            {
              src: '/json-viewer/logo_144.png',
              types: 'img/png',
              sizes: '144x144',
              purpose: 'any',
            },
            {
              src: '/json-viewer/logo_120.png',
              types: 'img/png',
              sizes: '120x120',
              purpose: 'any',
            },
            {
              src: '/json-viewer/logo_72.png',
              types: 'img/png',
              sizes: '72x72',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    // 指定@为src目录
    resolve: {
      // Vite路径别名配置
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    eslintrc: {
      enabled: true, // Default `false`
      filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
      globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
    },
    esbuild: {
      pure: ['console', 'debugger'],
    },
    server: {
      host: true,
      open: true,
    },
    // 打包配置
    build: {
      outDir: env.VITE_OUTDIR,
      // 手动分包，把第三方库单独打包
      rollupOptions: {
        // external: ['@antv/g6'],
        output: {
          entryFileNames: 'entries/[name]-[hash].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@antv/g6')) {
                return 'antv-g6'
              }
              // if (id.includes('element-plus')) {
              //   return 'element-plus'
              // }
              // if (id.includes('codemirror')) {
              //   return 'codemirror'
              // }
              // 默认所有node_modules库都放到vendor包中
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
