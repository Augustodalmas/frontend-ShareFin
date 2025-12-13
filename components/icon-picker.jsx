'use client'

import { ShoppingCart, Home, Car, Coffee, Utensils, Briefcase, Heart, Zap, Gift, Plane, Smartphone, Shirt } from 'lucide-react'
import { Label } from '@/components/ui/label'

const AVAILABLE_ICONS = [
  { name: 'ShoppingCart', Icon: ShoppingCart },
  { name: 'Home', Icon: Home },
  { name: 'Car', Icon: Car },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Utensils', Icon: Utensils },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'Heart', Icon: Heart },
  { name: 'Zap', Icon: Zap },
  { name: 'Gift', Icon: Gift },
  { name: 'Plane', Icon: Plane },
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'Shirt', Icon: Shirt },
]

export function IconPicker({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>Ícone</Label>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {AVAILABLE_ICONS.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            className={`flex h-12 items-center justify-center rounded-lg border-2 transition-all hover:bg-accent ${
              value === name
                ? 'border-primary bg-primary/10'
                : 'border-border'
            }`}
            onClick={() => {
              console.log('Ícone selecionado:', name)
              onChange(name)
            }}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function getIconComponent(iconName) {
  const icon = AVAILABLE_ICONS.find(i => i.name === iconName)
  return icon?.Icon || ShoppingCart
}
