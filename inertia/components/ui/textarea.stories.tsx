import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from '~/components/ui/textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  args: {
    label: 'Votre message',
    name: 'message',
    placeholder: 'Décrivez votre projet…',
    rows: 5,
  },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    hint: 'Quelques phrases suffisent pour démarrer.',
  },
}

export const WithError: Story = {
  args: {
    error: 'Le message doit comporter au moins 20 caractères.',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 'Merci pour votre retour.',
    disabled: true,
  },
}
