'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FiHome, FiVideo, FiGrid, FiUsers, FiBell, FiSearch, FiUser, FiChevronDown, FiSettings, FiBarChart2, FiShoppingBag, FiMonitor } from 'react-icons/fi'

interface NavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  searchQuery: string
  onSearch: (query: string) => void
  onNotificationClick: () => void
  notificationCount: number
}

export default function Navbar({ activeTab, onTabChange, searchQuery, onSearch, onNotificationClick, notificationCount }: NavbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (localSearch.trim()) {
      onSearch(localSearch.trim())
    }
  }

  const navPills = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'live', label: 'Live', icon: FiMonitor },
    { id: 'categories', label: 'Categories', icon: FiGrid },
    { id: 'subscriptions', label: 'Subscriptions', icon: FiUsers },
  ]

  const profileMenuItems = [
    { id: 'channel', label: 'Your Channel', icon: FiUser },
    { id: 'studio', label: 'Creator Studio', icon: FiBarChart2 },
    { id: 'store', label: 'Your Store', icon: FiShoppingBag },
    { id: 'subscriptions', label: 'Subscriptions', icon: FiUsers },
  ]

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center gap-4 px-4 h-14">
        <button onClick={() => onTabChange('home')} className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <FiVideo className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-foreground hidden sm:block">StreamVault</span>
        </button>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-auto flex items-center gap-0">
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search streams, creators, categories..."
            className="rounded-r-none border-r-0 bg-muted/50 border-border h-9 text-sm focus-visible:ring-purple-500/30"
          />
          <Button type="submit" variant="outline" size="sm" className="rounded-l-none h-9 px-3 border-border bg-muted/30 hover:bg-muted">
            <FiSearch className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onTabChange('golive')} className="gap-1.5 text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-500/10">
            <FiVideo className="h-4 w-4" />
            <span className="hidden md:inline">Go Live</span>
          </Button>

          <button onClick={onNotificationClick} className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <FiBell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-card" />
            )}
          </button>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1 p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                SV
              </div>
              <FiChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-52 rounded-xl border border-border bg-card shadow-2xl shadow-black/50 py-1 z-50">
                {profileMenuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </button>
                ))}
                <div className="h-px bg-border my-1" />
                <button disabled className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground opacity-50 cursor-not-allowed">
                  <FiSettings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {navPills.map(pill => (
          <button
            key={pill.id}
            onClick={() => onTabChange(pill.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${activeTab === pill.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            <pill.icon className="h-3.5 w-3.5" />
            {pill.label}
          </button>
        ))}
      </div>
    </header>
  )
}
