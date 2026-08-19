import type { Preview } from '@storybook/react-vite'
import '../inertia/css/app.css'

const preview = {
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-surface-subtle p-8 sm:p-12">
        <div className="mx-auto w-full max-w-xl rounded-card bg-surface p-6 shadow-card sm:p-8">
          <Story />
        </div>
      </main>
    ),
  ],
  parameters: {
    a11y: {
      test: 'todo',
    },
    controls: {
      expanded: true,
    },
  },
} satisfies Preview

export default preview
