import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
// Sec.3-5 でこの import を使う
// import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist', 'src/vendor'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // 教材の before はわざと「使っていないメモ化」を残しているので緩める
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // ===========================================================================
  // ↓↓↓ Sec.3-5「eslint-plugin-react-hooks で機械的に検出する」でここを有効化する ↓↓↓
  //
  //   このプラグインには Rules of Hooks に加えて、React Compiler が
  //   最適化を諦める（bail out する）書き方を検出するルールが含まれている。
  //   有効化すると src/labs/02-feed/violations/ の違反が一括で洗い出される。
  //
  //   プラグインが配布している configs は eslintrc 形式なので、
  //   Flat Config では plugins を自分で束ねて rules だけ借りる。
  //
  // {
  //   files: ['**/*.{ts,tsx}'],
  //   plugins: { 'react-hooks': reactHooks },
  //   rules: reactHooks.configs['recommended-latest'].rules,
  // },
  //
  //   3-6 で 'use no memo' を選んだファイルは、lint でも対象外にする。
  //   「Compilerの管轄から外す」という判断を、道具の設定にも一貫させるため。
  //
  // {
  //   files: ['**/violations/solutions/06-ThirdParty.tsx'],
  //   rules: { 'react-hooks/refs': 'off' },
  // },
  // ===========================================================================
)
