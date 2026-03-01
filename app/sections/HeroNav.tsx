'use client'

import { FiHome, FiVideo, FiBarChart2, FiShoppingBag } from 'react-icons/fi'

interface HeroNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'home', label: 'Home', icon: FiHome },
  { id: 'live', label: 'Live', icon: FiVideo },
  { id: 'studio', label: 'Creator Studio', icon: FiBarChart2 },
  { id: 'store', label: 'Store', icon: FiShoppingBag },
]

export default function HeroNav({ activeTab, onTabChange }: HeroNavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <FiVideo className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">StreamVault</span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-accent text-accent-foreground shadow-lg shadow-purple-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-semibold text-muted-foreground">SV</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
