import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        $: 'readonly',
        jQuery: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // 기본 규칙
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',

      // Import 규칙
      'import/order': 'off', // 임시로 비활성화
      'import/no-unresolved': 'off', // Vite에서 처리
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'static/**',
      'node_modules/**',
      '*.min.js',
      '*.min.css',
      '*.log',
    ],
  },
];
