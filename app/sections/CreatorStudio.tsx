'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import CopyrightChecker from './CopyrightChecker'
import { FiTrendingUp, FiTrendingDown, FiMinus, FiDollarSign, FiBarChart2, FiUsers, FiClock, FiSend, FiCheck, FiEye, FiVideo, FiUpload, FiEdit, FiTrash2, FiStar } from 'react-icons/fi'

const AGENT_ID = '69a42c6e2ace987a4add1cbc'

interface InsightItem { metric?: string; value?: string; trend?: string; suggestion?: string }
interface AssistantResponse { message?: string; insights?: InsightItem[]; action_items?: string[] }
interface ChatMsg { id: number; role: 'user' | 'assistant'; text: string; data?: AssistantResponse }

const STAT_CARDS = [
  { label: 'Total Views', value: '2.4M', change: '+12.3%', icon: FiEye, positive: true },
  { label: 'Subscribers', value: '48.2K', change: '+5.7%', icon: FiUsers, positive: true },
  { label: 'Revenue', value: '$8,420', change: '+22.1%', icon: FiDollarSign, positive: true },
  { label: 'Watch Hours', value: '156K', change: '-2.4%', icon: FiClock, positive: false },
  { label: 'Avg Viewers', value: '1.2K', change: '+8.1%', icon: FiBarChart2, positive: true },
  { label: 'Total Streams', value: '342', change: '+3', icon: FiVideo, positive: true },
]

const CONTENT_TABLE = [
  { title: 'Epic Boss Fight Compilation', status: 'Published', views: '24K', likes: '1.8K', revenue: '$142', date: '2 days ago' },
  { title: 'Tutorial: Advanced Strategies', status: 'Published', views: '18K', likes: '1.2K', revenue: '$98', date: '5 days ago' },
  { title: 'Community Game Night', status: 'Published', views: '9.2K', likes: '890', revenue: '$45', date: '1 week ago' },
  { title: 'Behind the Scenes: My Setup', status: 'Published', views: '32K', likes: '2.4K', revenue: '$210', date: '2 weeks ago' },
  { title: 'Upcoming Collab Preview', status: 'Draft', views: '-', likes: '-', revenue: '-', date: 'Draft' },
  { title: 'Speedrun Attempt #47', status: 'Processing', views: '-', likes: '-', revenue: '-', date: 'Uploading' },
]

const REVENUE_SPLIT = [
  { label: 'Ad Revenue', amount: '$4,210', pct: 50 },
  { label: 'Subscriptions', amount: '$2,526', pct: 30 },
  { label: 'Tips & Donations', amount: '$1,264', pct: 15 },
  { label: 'Store Sales', amount: '$420', pct: 5 },
]

const GRADIENTS = ['from-purple-900/60 to-indigo-900/60', 'from-blue-900/60 to-cyan-900/60', 'from-pink-900/60 to-rose-900/60', 'from-green-900/60 to-emerald-900/60', 'from-amber-900/60 to-orange-900/60', 'from-red-900/60 to-pink-900/60']

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{fmtInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{fmtInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{fmtInline(line)}</p>
      })}
    </div>
  )
}

function fmtInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

function getTrendIcon(trend?: string) {
  const t = (trend ?? '').toLowerCase()
  if (t.includes('up') || t.includes('increase') || t.includes('positive') || t.includes('+')) return <FiTrendingUp className="h-4 w-4 text-green-400" />
  if (t.includes('down') || t.includes('decrease') || t.includes('negative') || t.includes('-')) return <FiTrendingDown className="h-4 w-4 text-red-400" />
  return <FiMinus className="h-4 w-4 text-yellow-400" />
}

interface CreatorStudioProps { onAgentActive: (id: string | null) => void }

export default function CreatorStudio({ onAgentActive }: CreatorStudioProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'upload' | 'chat'>('overview')
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', category: '', tags: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [showCopyrightCheck, setShowCopyrightCheck] = useState(false)
  const [copyrightScanning, setCopyrightScanning] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(1)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleChatSend = useCallback(async (text?: string) => {
    const msg = text ?? chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    const userMsg: ChatMsg = { id: msgIdRef.current++, role: 'user', text: msg }
    setChatMessages(prev => [...prev, userMsg])
    setChatLoading(true)
    onAgentActive(AGENT_ID)

    try {
      const result = await callAIAgent(msg, AGENT_ID)
      let parsed: AssistantResponse = {}
      if (result.success) {
        let raw = result.response?.result
        if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch { /* as-is */ } }
        if (raw && typeof raw === 'object') parsed = raw as AssistantResponse
      }
      setChatMessages(prev => [...prev, { id: msgIdRef.current++, role: 'assistant', text: parsed?.message ?? 'Here are my insights.', data: parsed }])
    } catch {
      setChatMessages(prev => [...prev, { id: msgIdRef.current++, role: 'assistant', text: 'Something went wrong. Please try again.' }])
    } finally {
      setChatLoading(false)
      onAgentActive(null)
    }
  }, [chatInput, chatLoading, onAgentActive])

  const handleUpload = () => {
    if (!uploadForm.title.trim()) return
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setShowCopyrightCheck(true)
      setCopyrightScanning(true)
    }, 1500)
  }

  const sectionTabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'upload' as const, label: 'Upload' },
    { id: 'chat' as const, label: 'Assistant' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><FiBarChart2 className="h-5 w-5 text-purple-400" /> Creator Studio</h1>
        <div className="flex gap-1">
          {sectionTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection === tab.id ? 'bg-purple-500/20 text-purple-300' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {STAT_CARDS.map(stat => (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center"><stat.icon className="h-4 w-4 text-purple-400" /></div>
                    <span className={`text-xs font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>{stat.change}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Content Management</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2.5 px-4 font-medium">Thumbnail</th>
                    <th className="text-left py-2.5 px-4 font-medium">Title</th>
                    <th className="text-left py-2.5 px-4 font-medium">Status</th>
                    <th className="text-left py-2.5 px-4 font-medium">Views</th>
                    <th className="text-left py-2.5 px-4 font-medium">Likes</th>
                    <th className="text-left py-2.5 px-4 font-medium">Revenue</th>
                    <th className="text-left py-2.5 px-4 font-medium">Date</th>
                    <th className="text-left py-2.5 px-4 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {CONTENT_TABLE.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-2.5 px-4"><div className={`h-8 w-14 rounded bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`} /></td>
                        <td className="py-2.5 px-4 font-medium text-foreground max-w-[200px] truncate">{row.title}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant="secondary" className={`text-[10px] ${row.status === 'Published' ? 'bg-green-500/10 text-green-400' : row.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>{row.status}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground">{row.views}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{row.likes}</td>
                        <td className="py-2.5 px-4 text-foreground font-medium">{row.revenue}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{row.date}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex gap-1">
                            <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"><FiEdit className="h-3.5 w-3.5" /></button>
                            <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"><FiBarChart2 className="h-3.5 w-3.5" /></button>
                            <button className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><FiTrash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Revenue Breakdown</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {REVENUE_SPLIT.map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">{item.amount}</span>
                  </div>
                  <Progress value={item.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {activeSection === 'upload' && (
        <Card className="bg-card border-border">
          <CardHeader className="py-4 px-5"><CardTitle className="text-sm flex items-center gap-2"><FiUpload className="h-4 w-4 text-purple-400" /> Upload Video</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-purple-500/30 transition-colors">
              <div className="text-center">
                <FiUpload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Drag and drop your video or click to browse</p>
              </div>
            </div>
            <div><Label className="text-xs text-muted-foreground mb-1.5">Title *</Label><Input value={uploadForm.title} onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Video title" className="bg-muted/50 border-border" /></div>
            <div><Label className="text-xs text-muted-foreground mb-1.5">Description</Label><Textarea value={uploadForm.description} onChange={e => setUploadForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your video..." className="bg-muted/50 border-border min-h-[80px]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground mb-1.5">Category</Label><Input value={uploadForm.category} onChange={e => setUploadForm(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g., Gaming" className="bg-muted/50 border-border" /></div>
              <div><Label className="text-xs text-muted-foreground mb-1.5">Tags (comma-separated)</Label><Input value={uploadForm.tags} onChange={e => setUploadForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="e.g., tutorial, gaming" className="bg-muted/50 border-border" /></div>
            </div>
            <Button onClick={handleUpload} disabled={!uploadForm.title.trim() || isUploading} className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
              {isUploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><FiUpload className="h-4 w-4" /> Upload</>}
            </Button>
            {showCopyrightCheck && (
              <CopyrightChecker fileName={uploadForm.title || 'video.mp4'} isScanning={copyrightScanning} onComplete={() => setCopyrightScanning(false)} />
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'chat' && (
        <Card className="bg-card border-border">
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2"><FiStar className="h-4 w-4 text-purple-400" /> Creator Studio Assistant</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Ask about analytics, content strategy, revenue optimization, and more.</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-4 py-4">
              <div className="space-y-4">
                {chatMessages.length === 0 && !chatLoading && (
                  <div className="text-center py-12">
                    <FiBarChart2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Ask me about your channel analytics, content strategy, or how to grow your audience.</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['How can I improve my CTR?', 'Best upload schedule?', 'Revenue breakdown', 'Content optimization tips'].map(s => (
                        <button key={s} onClick={() => handleChatSend(s)} className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-muted/30 border border-border'}`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm text-foreground">{msg.text}</p>
                      ) : (
                        <div className="space-y-3">
                          {renderMarkdown(msg.text)}
                          {Array.isArray(msg.data?.insights) && msg.data.insights.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                              {msg.data.insights.map((ins, ii) => (
                                <div key={ii} className="bg-card rounded-lg p-3 border border-border">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-muted-foreground">{ins?.metric ?? 'Metric'}</span>
                                    {getTrendIcon(ins?.trend)}
                                  </div>
                                  <p className="text-lg font-bold text-foreground">{ins?.value ?? '--'}</p>
                                  {ins?.suggestion && <p className="text-xs text-muted-foreground mt-1">{ins.suggestion}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                          {Array.isArray(msg.data?.action_items) && msg.data.action_items.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              <p className="text-xs font-semibold text-muted-foreground">Action Items</p>
                              {msg.data.action_items.map((item, ai) => (
                                <div key={ai} className="flex items-start gap-2 text-sm"><FiCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" /><span className="text-foreground">{item}</span></div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    Analyzing your data...
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} placeholder="Ask about your analytics..." className="bg-muted/50 border-border text-sm" disabled={chatLoading} />
                <Button size="sm" onClick={() => handleChatSend()} disabled={chatLoading || !chatInput.trim()} className="bg-purple-600 hover:bg-purple-700 text-white px-3"><FiSend className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
