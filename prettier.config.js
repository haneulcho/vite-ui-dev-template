export default {
  // 기본 설정
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,

  // 추가 설정
  endOfLine: 'lf',
  arrowParens: 'avoid',
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,

  // 파일별 설정
  overrides: [
    {
      files: '*.scss',
      options: {
        singleQuote: false,
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: '*.html',
      options: {
        htmlWhitespaceSensitivity: 'ignore',
        printWidth: 120,
      },
    },
  ],
};
