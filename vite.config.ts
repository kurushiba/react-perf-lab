import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mockApi } from './plugins/mock-api.ts'

// ===========================================================================
// ↓↓↓ Sec.2-4「Compilerを導入する」で、この2行のコメントを外す ↓↓↓
//
//   Vite 8 の @vitejs/plugin-react は oxc ベースなので、React Compiler は
//   babel プラグイン経由で挿し込む。実プロジェクトでは先に次を実行する：
//     npm i -D @rolldown/plugin-babel @babel/core babel-plugin-react-compiler
//   （この教材リポジトリでは devDependencies に入れてあるのでインストールは不要）
//
// import { reactCompilerPreset } from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'
// ===========================================================================

// Sec.8-2「バンドルの中身を見る」でこのコメントを外す
// import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),

    // =======================================================================
    // ↓↓↓ Sec.2-4 で、この1行のコメントを外す ↓↓↓
    //
    //   Sec.2-5 では compilationMode を切り替えて段階導入を体験する：
    //     babel({ presets: [reactCompilerPreset({ compilationMode: 'annotation' })] })
    //       → "use memo" を書いたコンポーネントだけが対象
    //     babel({ presets: [reactCompilerPreset()] })
    //       → 全体が対象（infer）
    //
    // babel({ presets: [reactCompilerPreset()] }),
    // =======================================================================

    mockApi(),

    // =======================================================================
    // ↓↓↓ Sec.8-2 で、この5行のコメントを外す ↓↓↓
    //
    // visualizer({
    //   filename: 'dist/stats.html',
    //   gzipSize: true,
    //   open: true,
    // }),
    // =======================================================================
  ],
})
