import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '~/components/ui/button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Envoyer la demande',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Quiet: Story = {
  args: {
    variant: 'quiet',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
