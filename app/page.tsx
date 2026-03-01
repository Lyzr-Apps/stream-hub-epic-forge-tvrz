'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import HeroNav from './sections/HeroNav'
import ContentDiscovery from './sections/ContentDiscovery'
import LiveStream from './sections/LiveStream'
import CreatorStudio from './sections/CreatorStudio'
import StoreAdvisor from './sections/StoreAdvisor'
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

const agents = [
  { id: '69a42c6d34e600fdb1dca356', name: 'Content Recommendation', purpose: 'Personalized content discovery' },
  { id: '69a42c6e2ace987a4add1cbc', name: 'Creator Studio Assistant', purpose: 'Analytics and content strategy' },
  { id: '69a42c6e0ffa5766cb153469', name: 'Chat Moderation', purpose: 'Real-time chat safety' },
  { id: '69a42c6ec624d66f1359bd68', name: 'Store Advisor', purpose: 'Store optimization and pricing' },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState('home')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)

  const handleAgentActive = useCallback((id: string | null) => {
    setActiveAgentId(id)
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <HeroNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Sample Data Toggle */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center justify-end gap-2">
            <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground">Sample Data</Label>
            <Switch
              id="sample-toggle"
              checked={showSampleData}
              onCheckedChange={setShowSampleData}
            />
          </div>
        </div>

        {/* Active Tab Content */}
        <main>
          {activeTab === 'home' && <ContentDiscovery onAgentActive={handleAgentActive} />}
          {activeTab === 'live' && <LiveStream onAgentActive={handleAgentActive} />}
          {activeTab === 'studio' && <CreatorStudio onAgentActive={handleAgentActive} />}
          {activeTab === 'store' && <StoreAdvisor onAgentActive={handleAgentActive} />}
        </main>

        {/* Agent Status Panel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiRadio className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">AI Agents</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {agents.map((agent) => {
                  const isActive = activeAgentId === agent.id
                  return (
                    <div
                      key={agent.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${isActive ? 'border-accent bg-accent/10' : 'border-border bg-secondary/50'}`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-accent animate-pulse' : 'bg-muted-foreground/40'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{agent.purpose}</p>
                      </div>
                      {isActive && (
                        <FiActivity className="w-3.5 h-3.5 text-accent flex-shrink-0 animate-pulse ml-auto" />
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
