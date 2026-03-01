'use client'
import React, { useState, useRef, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import AdBanner from './AdBanner'
import { FiSend, FiHeart, FiAlertTriangle, FiShield, FiUsers, FiEye, FiScissors, FiGift } from 'react-icons/fi'

const MODERATION_AGENT = '69a42c6e0ffa5766cb153469'

interface LiveStreamProps {
  streamerName: string
  onSubscribe: (name: string) => void
  onNavigateToChannel: (name: string) => void
  onAgentActive: (id: string | null) => void
}

interface ChatMessage {
  id: number
  user: string
  text: string
  color: string
  flagged?: boolean
  severity?: string
  reason?: string
  recommendation?: string
}

const USER_COLORS = [
  'text-red-400', 'text-blue-400', 'text-green-400', 'text-pink-400',
  'text-cyan-400', 'text-amber-400', 'text-violet-400', 'text-emerald-400',
]

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, user: 'GameFan99', text: 'This stream is amazing!', color: USER_COLORS[0] },
  { id: 2, user: 'NightHawk', text: 'Just got here, whats up everyone?', color: USER_COLORS[1] },
  { id: 3, user: 'PixelDust', text: 'That play was insane omg', color: USER_COLORS[2] },
  { id: 4, user: 'StreamLover', text: 'Been watching for 2 hours straight', color: USER_COLORS[3] },
  { id: 5, user: 'CoolVibes', text: 'Can you explain that strategy again?', color: USER_COLORS[4] },
  { id: 6, user: 'ProPlayer42', text: 'Try flanking from the left side', color: USER_COLORS[5] },
  { id: 7, user: 'ChillWatcher', text: 'Love the chill vibes tonight', color: USER_COLORS[6] },
  { id: 8, user: 'NewFollower', text: 'First time here! Great content!', color: USER_COLORS[7] },
]

export default function LiveStream({ streamerName, onSubscribe, onNavigateToChannel, onAgentActive }: LiveStreamProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [chatInput, setChatInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [clipTitle, setClipTitle] = useState('')
  const [showClipForm, setShowClipForm] = useState(false)
  const [clipSaved, setClipSaved] = useState(false)
  const [clips, setClips] = useState<string[]>([])
  const [viewerCount] = useState(847)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(9)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || sending) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setSending(true)
    onAgentActive(MODERATION_AGENT)

    try {
      const result = await callAIAgent(
        `Check this chat message for moderation: "${userMsg}"`,
        MODERATION_AGENT
      )

      let parsed = result?.response?.result
      if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch { /* use as-is */ } }

      const action = (parsed?.action ?? '').toLowerCase()
      const severity = parsed?.severity ?? ''
      const reason = parsed?.reason ?? ''
      const recommendation = parsed?.recommendation ?? ''
      const isFlagged = action.includes('flag') || action.includes('block') || action.includes('warn') || action.includes('remove') || action.includes('reject')

      const newMsg: ChatMessage = {
        id: msgIdRef.current++,
        user: 'You',
        text: userMsg,
        color: 'text-purple-400',
        flagged: isFlagged,
        severity: isFlagged ? severity : undefined,
        reason: isFlagged ? reason : undefined,
        recommendation: isFlagged ? recommendation : undefined,
      }
      setMessages(prev => [...prev, newMsg])
    } catch {
      const newMsg: ChatMessage = {
        id: msgIdRef.current++,
        user: 'You',
        text: userMsg,
        color: 'text-purple-400',
      }
      setMessages(prev => [...prev, newMsg])
    } finally {
      setSending(false)
      onAgentActive(null)
    }
  }

  const handleClipSave = () => {
    if (!clipTitle.trim()) return
    setClips(prev => [...prev, clipTitle.trim()])
    setClipTitle('')
    setShowClipForm(false)
    setClipSaved(true)
    setTimeout(() => setClipSaved(false), 3000)
  }

  const handleSubscribeClick = () => {
    setIsSubscribed(prev => !prev)
    onSubscribe(streamerName)
  }

  const getSeverityColor = (sev: string) => {
    const s = (sev ?? '').toLowerCase()
    if (s.includes('high') || s.includes('critical')) return 'border-red-500/30 bg-red-500/10 text-red-300'
    if (s.includes('medium')) return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
    return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-border relative overflow-hidden flex items-center justify-center">
            <div className="text-center opacity-30">
              <FiUsers className="h-16 w-16 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Live Stream</p>
            </div>
            <Badge className="absolute top-4 left-4 bg-red-500 text-white animate-pulse">LIVE</Badge>
            <span className="absolute top-4 right-4 text-sm text-foreground bg-black/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <FiEye className="h-3.5 w-3.5" /> {viewerCount}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-foreground">Epic Live Session</h2>
              <button onClick={() => onNavigateToChannel(streamerName)} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                {streamerName}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <FiGift className="h-4 w-4" /> Tip
              </Button>
              <Button
                onClick={() => setShowClipForm(!showClipForm)}
                variant="outline"
                size="sm"
                className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <FiScissors className="h-4 w-4" /> Clip It!
              </Button>
              <Button
                onClick={handleSubscribeClick}
                variant={isSubscribed ? 'outline' : 'default'}
                size="sm"
                className={isSubscribed ? 'border-purple-500/30 text-purple-300' : 'bg-purple-600 hover:bg-purple-700 text-white'}
              >
                <FiHeart className={`h-4 w-4 mr-1 ${isSubscribed ? 'fill-purple-400 text-purple-400' : ''}`} />
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
            </div>
          </div>

          {showClipForm && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-2">
              <Input
                value={clipTitle}
                onChange={e => setClipTitle(e.target.value)}
                placeholder="Name this clip..."
                className="bg-muted/50 border-border text-sm"
                onKeyDown={e => e.key === 'Enter' && handleClipSave()}
              />
              <Button size="sm" onClick={handleClipSave} disabled={!clipTitle.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">Save</Button>
            </div>
          )}

          {clipSaved && (
            <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-300">
              Clip saved! ({clips.length} clips total)
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden h-[calc(100vh-140px)] lg:h-auto lg:min-h-[500px]">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiShield className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold text-foreground">Live Chat</span>
            </div>
            <span className="text-xs text-muted-foreground">{messages.length} messages</span>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {messages.map(msg => (
                <div key={msg.id}>
                  <div className="flex gap-2 text-sm">
                    <span className={`font-medium flex-shrink-0 ${msg.color}`}>{msg.user}:</span>
                    <span className="text-foreground/90 break-words">{msg.text}</span>
                  </div>
                  {msg.flagged && (
                    <div className={`mt-1 ml-4 p-2 rounded-md border text-xs flex items-start gap-1.5 ${getSeverityColor(msg.severity ?? '')}`}>
                      <FiAlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Moderation Alert</span>
                        {msg.severity && <span className="ml-1 opacity-75">({msg.severity})</span>}
                        {msg.reason && <p className="mt-0.5 opacity-80">{msg.reason}</p>}
                        {msg.recommendation && <p className="mt-0.5 opacity-70 italic">{msg.recommendation}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Checking message...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="p-3 pt-2">
            <AdBanner variant="sidebar" />
          </div>

          <div className="p-3 border-t border-border">
            <form onSubmit={e => { e.preventDefault(); handleSendMessage() }} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Send a message..."
                className="bg-muted/50 border-border text-sm"
                disabled={sending}
              />
              <Button type="submit" size="sm" disabled={!chatInput.trim() || sending} className="bg-purple-600 hover:bg-purple-700 text-white px-3">
                <FiSend className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
