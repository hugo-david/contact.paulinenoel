import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from '~/components/ui/text-input'

const meta = {
  title: 'UI/Text input',
  component: TextInput,
  args: {
    label: 'Prénom',
    name: 'firstName',
    placeholder: 'Pauline',
  },
} satisfies Meta<typeof TextInput>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    hint: 'Utilisé uniquement pour personnaliser les échanges.',
  },
}

export const WithError: Story = {
  args: {
    defaultValue: 'P',
    error: 'Saisissez au moins deux caractères.',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 'Pauline',
    disabled: true,
  },
}
