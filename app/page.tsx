'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Navbar from './sections/Navbar'
import HomePage from './sections/HomePage'
import LiveStream from './sections/LiveStream'
import GoLive from './sections/GoLive'
import ChannelPage from './sections/ChannelPage'
import Categories from './sections/Categories'
import Search from './sections/Search'
import Subscriptions from './sections/Subscriptions'
import CreatorStudio from './sections/CreatorStudio'
import StoreAdvisor from './sections/StoreAdvisor'
import Notifications from './sections/Notifications'
import { FiRadio, FiActivity } from 'react-icons/fi'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const AGENTS = [
  { id: '69a42c6d34e600fdb1dca356', name: 'Content Recommendation', purpose: 'Personalized content discovery' },
  { id: '69a42c6e2ace987a4add1cbc', name: 'Creator Studio Assistant', purpose: 'Analytics and content strategy' },
  { id: '69a42c6e0ffa5766cb153469', name: 'Chat Moderation', purpose: 'Real-time chat safety' },
  { id: '69a42c6ec624d66f1359bd68', name: 'Store Advisor', purpose: 'Store optimization and pricing' },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [subscriptions, setSubscriptions] = useState<string[]>(['StreamerPro', 'NightOwlGamer', 'TechWizard42', 'PixelQueen'])
  const [selectedChannel, setSelectedChannel] = useState('')
  const [selectedStreamer, setSelectedStreamer] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)

  const handleAgentActive = useCallback((id: string | null) => {
    setActiveAgentId(id)
  }, [])

  const handleSubscribe = useCallback((name: string) => {
    setSubscriptions(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    )
  }, [])

  const handleNavigateToChannel = useCallback((name: string) => {
    if (!name) return
    setSelectedChannel(name)
    setActiveTab('channel')
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setActiveTab('search')
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
          notificationCount={5}
        />
        <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        <div className="max-w-7xl mx-auto px-4 pt-3">
          <div className="flex items-center justify-end gap-2">
            <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground">Sample Data</Label>
            <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
          </div>
        </div>

        <main className="pb-4">
          {activeTab === 'home' && <HomePage onNavigateToChannel={handleNavigateToChannel} onAgentActive={handleAgentActive} />}
          {activeTab === 'live' && (
            <LiveStream
              streamerName={selectedStreamer || 'StreamerPro'}
              onSubscribe={handleSubscribe}
              onNavigateToChannel={handleNavigateToChannel}
              onAgentActive={handleAgentActive}
            />
          )}
          {activeTab === 'golive' && <GoLive onAgentActive={handleAgentActive} />}
          {activeTab === 'channel' && (
            <ChannelPage
              channelName={selectedChannel || 'StreamerPro'}
              isSubscribed={subscriptions.includes(selectedChannel || 'StreamerPro')}
              onSubscribe={handleSubscribe}
              onBack={() => setActiveTab('home')}
            />
          )}
          {activeTab === 'categories' && <Categories onNavigateToChannel={handleNavigateToChannel} onAgentActive={handleAgentActive} />}
          {activeTab === 'search' && <Search query={searchQuery} onNavigateToChannel={handleNavigateToChannel} onAgentActive={handleAgentActive} />}
          {activeTab === 'subscriptions' && (
            <Subscriptions
              subscriptions={subscriptions}
              onNavigateToChannel={handleNavigateToChannel}
              onUnsubscribe={handleSubscribe}
            />
          )}
          {activeTab === 'studio' && <CreatorStudio onAgentActive={handleAgentActive} />}
          {activeTab === 'store' && <StoreAdvisor onAgentActive={handleAgentActive} />}
        </main>

        <div className="max-w-7xl mx-auto px-4 pb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiRadio className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold text-foreground">AI Agents</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {AGENTS.map(agent => {
                  const isActive = activeAgentId === agent.id
                  return (
                    <div
                      key={agent.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${isActive ? 'border-purple-500/30 bg-purple-500/10' : 'border-border bg-muted/20'}`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-purple-400 animate-pulse' : 'bg-muted-foreground/40'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{agent.purpose}</p>
                      </div>
                      {isActive && (
                        <FiActivity className="h-3.5 w-3.5 text-purple-400 flex-shrink-0 animate-pulse ml-auto" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
