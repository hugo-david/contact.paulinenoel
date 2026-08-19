import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from '~/components/ui/select'

const options = [
  { label: 'Un projet de branding', value: 'branding' },
  { label: 'Un site internet', value: 'website' },
  { label: 'Une campagne', value: 'campaign' },
] as const

const meta = {
  title: 'UI/Select',
  component: Select,
  args: {
    label: 'Votre besoin',
    name: 'need',
    options,
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = {
  args: {
    defaultValue: 'website',
  },
}

export const WithHint: Story = {
  args: {
    hint: 'Choisissez l’option la plus proche de votre projet.',
  },
}

export const WithError: Story = {
  args: {
    error: 'Sélectionnez une option pour continuer.',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 'branding',
    disabled: true,
  },
}
