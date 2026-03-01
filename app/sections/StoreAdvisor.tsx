'use client'

import { useState, useRef, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FiSend, FiPackage, FiDollarSign, FiTrendingUp, FiTag } from 'react-icons/fi'

const AGENT_ID = '69a42c6ec624d66f1359bd68'

interface Suggestion {
  area?: string
  current_status?: string
  recommendation?: string
  expected_impact?: string
}

interface AdvisorResponse {
  advice?: string
  suggestions?: Suggestion[]
  pricing_tips?: string[]
}

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  text: string
  data?: AdvisorResponse
  images?: string[]
}

const sampleProducts = [
  { name: 'Pro Gaming Mousepad XL', price: '$29.99', status: 'Active', sales: 142 },
  { name: 'StreamVault Hoodie', price: '$49.99', status: 'Active', sales: 87 },
  { name: 'Custom Emote Pack', price: '$9.99', status: 'Active', sales: 324 },
  { name: 'Channel Membership Badge Set', price: '$4.99', status: 'Draft', sales: 0 },
  { name: 'Signed Poster (Limited Edition)', price: '$24.99', status: 'Low Stock', sales: 56 },
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

function getStatusColor(status: string) {
  if (status === 'Active') return 'text-green-400 bg-green-500/10'
  if (status === 'Draft') return 'text-yellow-400 bg-yellow-500/10'
  if (status === 'Low Stock') return 'text-orange-400 bg-orange-500/10'
  return 'text-muted-foreground bg-secondary'
}

interface StoreAdvisorProps {
  onAgentActive?: (id: string | null) => void
}

export default function StoreAdvisor({ onAgentActive }: StoreAdvisorProps) {
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
      let parsed: AdvisorResponse = {}
      let images: string[] = []

      if (result.success) {
        let raw = result.response?.result
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw) } catch { /* use as-is */ }
        }
        if (raw && typeof raw === 'object') {
          parsed = raw as AdvisorResponse
        }
        const artifactFiles = result?.module_outputs?.artifact_files
        if (Array.isArray(artifactFiles)) {
          images = artifactFiles.map((f: { file_url?: string }) => f?.file_url ?? '').filter(Boolean)
        }
      }

      const assistantMsg: ChatMsg = {
        id: String(msgId + 1),
        role: 'assistant',
        text: parsed?.advice ?? 'Here is my store advice.',
        data: parsed,
        images,
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
      {/* Product Grid */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
          <FiPackage className="w-5 h-5 text-accent" />
          Your Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleProducts.map((product, pi) => (
            <Card key={pi} className="bg-card border-border shadow-lg hover:border-purple-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="h-24 rounded-lg bg-gradient-to-br from-purple-900/40 via-violet-800/30 to-indigo-900/40 mb-3 flex items-center justify-center">
                  <FiPackage className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground truncate mr-2">{product.name}</h3>
                  <Badge className={`text-xs flex-shrink-0 ${getStatusColor(product.status)}`}>{product.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground flex items-center gap-1">
                    <FiDollarSign className="w-4 h-4 text-accent" />
                    {product.price}
                  </span>
                  <span className="text-xs text-muted-foreground">{product.sales} sold</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FiTag className="w-4 h-4 text-accent" />
            Store Advisor
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Get advice on pricing, product descriptions, store layout, and sales strategy.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={scrollRef} className="h-[400px] overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12">
                <FiTag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Ask for store optimization tips, pricing strategies, or product description ideas.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {['Optimize my pricing', 'Write product descriptions', 'How to boost sales?'].map((suggestion) => (
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
                      {Array.isArray(msg.images) && msg.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {msg.images.map((url, imgIdx) => (
                            <img key={imgIdx} src={url} alt={`Store visual ${imgIdx + 1}`} className="rounded-lg border border-border w-full object-cover" />
                          ))}
                        </div>
                      )}
                      {Array.isArray(msg.data?.suggestions) && msg.data.suggestions.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-xs font-semibold text-muted-foreground">Suggestions</p>
                          {msg.data.suggestions.map((sug, si) => (
                            <div key={si} className="bg-card rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-foreground">{sug?.area ?? 'Area'}</span>
                                {sug?.expected_impact && (
                                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <FiTrendingUp className="w-3 h-3" />
                                    {sug.expected_impact}
                                  </Badge>
                                )}
                              </div>
                              {sug?.current_status && <p className="text-xs text-muted-foreground mb-1">Current: {sug.current_status}</p>}
                              {sug?.recommendation && <p className="text-xs text-foreground">{sug.recommendation}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      {Array.isArray(msg.data?.pricing_tips) && msg.data.pricing_tips.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground">Pricing Tips</p>
                          {msg.data.pricing_tips.map((tip, ti) => (
                            <div key={ti} className="flex items-start gap-2 text-sm">
                              <FiDollarSign className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">{tip}</span>
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
                Getting store advice...
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your store..."
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
