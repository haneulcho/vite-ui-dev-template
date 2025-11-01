import sharedConfig from '@repo/config-prettier'

const config = {
  ...sharedConfig,
  plugins: [...(sharedConfig.plugins ?? [])],
}

export default config
