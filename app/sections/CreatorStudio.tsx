'use client'

import { useState, useRef, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FiTrendingUp, FiTrendingDown, FiMinus, FiDollarSign, FiBarChart2, FiUsers, FiClock, FiSend, FiCheck } from 'react-icons/fi'
import { HiOutlineEye } from 'react-icons/hi'

const AGENT_ID = '69a42c6e2ace987a4add1cbc'

interface InsightItem {
  metric?: string
  value?: string
  trend?: string
  suggestion?: string
}

interface AssistantResponse {
  message?: string
  insights?: InsightItem[]
  action_items?: string[]
}

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  text: string
  data?: AssistantResponse
}

const statCards = [
  { label: 'Total Views', value: '2.4M', change: '+12.3%', icon: HiOutlineEye, positive: true },
  { label: 'Subscribers', value: '48.2K', change: '+5.7%', icon: FiUsers, positive: true },
  { label: 'Revenue', value: '$8,420', change: '+22.1%', icon: FiDollarSign, positive: true },
  { label: 'Watch Hours', value: '156K', change: '-2.4%', icon: FiClock, positive: false },
]

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

function getTrendIcon(trend?: string) {
  const t = (trend ?? '').toLowerCase()
  if (t.includes('up') || t.includes('increase') || t.includes('positive') || t.includes('+')) return <FiTrendingUp className="w-4 h-4 text-green-400" />
  if (t.includes('down') || t.includes('decrease') || t.includes('negative') || t.includes('-')) return <FiTrendingDown className="w-4 h-4 text-red-400" />
  return <FiMinus className="w-4 h-4 text-yellow-400" />
}

interface CreatorStudioProps {
  onAgentActive?: (id: string | null) => void
}

export default function CreatorStudio({ onAgentActive }: CreatorStudioProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [msgId, setMsgId] = useState(1)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || loading) return
    const text = inputText.trim()
    setInputText('')

    const userMsg: ChatMsg = { id: String(msgId), role: 'user', text }
    setMsgId((p) => p + 1)
    setMessages((prev) => [...prev, userMsg])

    setLoading(true)
    onAgentActive?.(AGENT_ID)

    try {
      const result = await callAIAgent(text, AGENT_ID)
      let parsed: AssistantResponse = {}
      if (result.success) {
        let raw = result.response?.result
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw) } catch { /* use as-is */ }
        }
        if (raw && typeof raw === 'object') {
          parsed = raw as AssistantResponse
        }
      }

      const assistantMsg: ChatMsg = {
        id: String(msgId + 1),
        role: 'assistant',
        text: parsed?.message ?? 'Here are my insights.',
        data: parsed,
      }
      setMsgId((p) => p + 1)
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errMsg: ChatMsg = { id: String(msgId + 1), role: 'assistant', text: 'Something went wrong. Please try again.' }
      setMsgId((p) => p + 1)
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
      onAgentActive?.(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border-border shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <Badge variant="secondary" className={`text-xs ${stat.positive ? 'text-green-400' : 'text-red-400'} bg-transparent`}>
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Chat Panel */}
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FiBarChart2 className="w-4 h-4 text-accent" />
            Creator Studio Assistant
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Ask about analytics, content strategy, revenue optimization, and more.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={scrollRef} className="h-[400px] overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12">
                <FiBarChart2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Ask me about your channel analytics, content strategy, or how to grow your audience.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {['How can I improve my CTR?', 'Best upload schedule?', 'Revenue breakdown'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputText(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-accent/20 border border-accent/30' : 'bg-secondary'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm text-foreground">{msg.text}</p>
                  ) : (
                    <div className="space-y-3">
                      {renderMarkdown(msg.text)}
                      {Array.isArray(msg.data?.insights) && msg.data.insights.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {msg.data.insights.map((insight, ii) => (
                            <div key={ii} className="bg-card rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-muted-foreground">{insight?.metric ?? 'Metric'}</span>
                                {getTrendIcon(insight?.trend)}
                              </div>
                              <p className="text-lg font-bold text-foreground">{insight?.value ?? '--'}</p>
                              {insight?.suggestion && <p className="text-xs text-muted-foreground mt-1">{insight.suggestion}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      {Array.isArray(msg.data?.action_items) && msg.data.action_items.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground">Action Items</p>
                          {msg.data.action_items.map((item, ai) => (
                            <div key={ai} className="flex items-start gap-2 text-sm">
                              <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Analyzing your data...
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your analytics..."
                className="bg-input border-border text-sm"
                disabled={loading}
              />
              <Button size="icon" onClick={handleSend} disabled={loading || !inputText.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 flex-shrink-0">
                <FiSend className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
