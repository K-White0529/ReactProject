import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    // バンドルサイズ分析（ビルド時のみ）
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // sunburst, treemap, network
    }) as any,
  ],
  build: {
    // ビルド最適化
    target: 'es2015',
    // esbuildを使用（デフォルト、高速）
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // チャンク分割の最適化
        manualChunks: {
          // Reactライブラリを別チャンクに
          'react-vendor': ['react', 'react-dom'],
          // Chart.jsを別チャンクに
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          // アイコンライブラリを別チャンクに
          'icons-vendor': ['react-icons'],
        },
      },
    },
    // チャンクサイズ警告の閾値（デフォルトは500KB）
    chunkSizeWarningLimit: 1000,
    // ソースマップ生成（本番環境では無効化推奨）
    sourcemap: false,
  },
  esbuild: {
    // 本番ビルド時にconsole、debugger、consoleメソッドを削除
    drop: ['console', 'debugger'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    // Playwrightのテストディレクトリを除外
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/tests/**', // Playwrightのテストを除外
    ],
    // または、src内のファイルのみを対象にする
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
