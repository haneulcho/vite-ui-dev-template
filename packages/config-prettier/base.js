const config = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  arrowParens: 'avoid',
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  overrides: [
    {
      files: '**/*.scss',
      options: {
        singleQuote: false,
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: '**/*.html',
      options: {
        htmlWhitespaceSensitivity: 'strict',
        printWidth: 120,
        singleAttributePerLine: false,
      },
    },
  ],
  plugins: [],
}

export default config
