import { resolve } from 'node:path'
import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

const config: StorybookConfig = {
  stories: ['../inertia/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), tailwindcss()],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '~/': `${resolve(import.meta.dirname, '../inertia')}/`,
        },
      },
    }
  },
}

export default config
