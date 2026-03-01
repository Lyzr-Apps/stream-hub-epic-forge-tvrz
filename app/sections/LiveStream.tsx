'use client'

import { useState, useRef, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FiSend, FiHeart, FiAlertTriangle, FiShield, FiUsers, FiEye } from 'react-icons/fi'

const AGENT_ID = '69a42c6e0ffa5766cb153469'

interface ChatMessage {
  id: string
  user: string
  text: string
  timestamp: string
  moderation?: {
    action?: string
    reason?: string
    severity?: string
    flagged_content?: string
    recommendation?: string
  }
}

const initialMessages: ChatMessage[] = [
  { id: '1', user: 'NightOwlGamer', text: 'This stream is amazing! Love the setup.', timestamp: '2m ago' },
  { id: '2', user: 'TechWizard42', text: 'What GPU are you using? The graphics look incredible', timestamp: '2m ago' },
  { id: '3', user: 'PixelQueen', text: 'First time here, loving the vibes!', timestamp: '1m ago' },
  { id: '4', user: 'StreamFanatic', text: 'Can you play some requests?', timestamp: '1m ago' },
  { id: '5', user: 'ProGamer99', text: 'GG! That was an insane play', timestamp: '1m ago' },
  { id: '6', user: 'ChillVibes', text: 'The music in the background is perfect', timestamp: '45s ago' },
  { id: '7', user: 'NewViewer2024', text: 'Subbed! Keep up the great content', timestamp: '30s ago' },
  { id: '8', user: 'GameMaster', text: 'Try the new update, it has great features', timestamp: '15s ago' },
]

function getSeverityColor(severity?: string) {
  const s = (severity ?? '').toLowerCase()
  if (s === 'high' || s === 'critical') return 'text-red-400 bg-red-500/10 border-red-500/30'
  if (s === 'medium') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
  return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
}

interface LiveStreamProps {
  onAgentActive?: (id: string | null) => void
}

export default function LiveStream({ onAgentActive }: LiveStreamProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [msgIdCounter, setMsgIdCounter] = useState(9)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || loading) return
    const text = inputText.trim()
    setInputText('')
    setLoading(true)
    onAgentActive?.(AGENT_ID)

    const newId = String(msgIdCounter)
    setMsgIdCounter((p) => p + 1)

    try {
      const result = await callAIAgent(text, AGENT_ID)
      let parsed: Record<string, unknown> = {}
      if (result.success) {
        let raw = result.response?.result
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw) } catch { /* use as-is */ }
        }
        parsed = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {}
      }

      const action = (parsed?.action as string ?? '').toLowerCase()
      const isAllowed = action === 'allow' || action === 'approved' || action === ''

      const msg: ChatMessage = {
        id: newId,
        user: 'You',
        text,
        timestamp: 'now',
        moderation: isAllowed ? undefined : {
          action: parsed?.action as string ?? '',
          reason: parsed?.reason as string ?? '',
          severity: parsed?.severity as string ?? '',
          flagged_content: parsed?.flagged_content as string ?? '',
          recommendation: parsed?.recommendation as string ?? '',
        },
      }
      setMessages((prev) => [...prev, msg])
    } catch {
      const msg: ChatMessage = {
        id: newId,
        user: 'You',
        text,
        timestamp: 'now',
      }
      setMessages((prev) => [...prev, msg])
    } finally {
      setLoading(false)
      onAgentActive?.(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 flex items-center justify-center shadow-2xl shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="text-center z-10">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-white/60 text-sm">Stream Preview</p>
            </div>
            <Badge className="absolute top-4 left-4 bg-red-500 text-white border-none text-sm px-3 py-1 font-semibold">LIVE</Badge>
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              <FiEye className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">12.4K</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Epic Gaming Marathon - Day 3</h2>
              <p className="text-sm text-muted-foreground">StreamerPro | Gaming, Entertainment</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-border bg-secondary hover:bg-muted gap-2">
                <FiHeart className="w-4 h-4" />
                <span>Follow</span>
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                <span>Subscribe</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><FiUsers className="w-4 h-4" /> 12.4K viewers</span>
            <span className="flex items-center gap-1"><FiShield className="w-4 h-4 text-green-400" /> Chat Moderation Active</span>
          </div>
        </div>

        {/* Chat Panel */}
        <Card className="bg-card border-border flex flex-col h-[600px] lg:h-auto shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FiShield className="w-4 h-4 text-accent" />
              Live Chat
              <Badge variant="secondary" className="ml-auto text-xs bg-secondary text-muted-foreground">{messages.length} msgs</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div ref={scrollRef} className="h-[420px] overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex items-start gap-2 ${msg.user === 'You' ? 'justify-end' : ''}`}>
                    <div className={`max-w-[85%] ${msg.user === 'You' ? 'bg-accent/20 border border-accent/30' : 'bg-secondary'} rounded-xl px-3 py-2`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold ${msg.user === 'You' ? 'text-accent' : 'text-purple-400'}`}>{msg.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{msg.text}</p>
                    </div>
                  </div>
                  {msg.moderation && (
                    <div className={`mt-1.5 ml-2 p-2.5 rounded-lg border text-xs ${getSeverityColor(msg.moderation.severity)}`}>
                      <div className="flex items-center gap-1.5 mb-1 font-semibold">
                        <FiAlertTriangle className="w-3.5 h-3.5" />
                        Moderation: {msg.moderation.action}
                        {msg.moderation.severity && (
                          <Badge variant="outline" className="ml-1 text-xs px-1.5 py-0 border-current">{msg.moderation.severity}</Badge>
                        )}
                      </div>
                      {msg.moderation.reason && <p className="opacity-80">Reason: {msg.moderation.reason}</p>}
                      {msg.moderation.recommendation && <p className="opacity-70 mt-0.5">Recommendation: {msg.moderation.recommendation}</p>}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Checking message...
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="bg-input border-border text-sm"
                disabled={loading}
              />
              <Button size="icon" onClick={handleSend} disabled={loading || !inputText.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 flex-shrink-0">
                <FiSend className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
