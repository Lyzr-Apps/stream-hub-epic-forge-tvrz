'use client'
import React, { useState, useRef, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiSend, FiPackage, FiDollarSign, FiTrendingUp, FiTag, FiPlus, FiX } from 'react-icons/fi'

const AGENT_ID = '69a42c6ec624d66f1359bd68'

interface Suggestion { area?: string; current_status?: string; recommendation?: string; expected_impact?: string }
interface AdvisorResponse { advice?: string; suggestions?: Suggestion[]; pricing_tips?: string[] }
interface ChatMsg { id: number; role: 'user' | 'assistant'; text: string; data?: AdvisorResponse; images?: string[] }
interface Product { name: string; price: string; status: string; sales: number; description?: string }

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

function getStatusColor(status: string) {
  if (status === 'Active') return 'bg-green-500/10 text-green-400'
  if (status === 'Draft') return 'bg-yellow-500/10 text-yellow-400'
  if (status === 'Sold Out') return 'bg-red-500/10 text-red-400'
  return 'bg-muted text-muted-foreground'
}

interface StoreAdvisorProps { onAgentActive: (id: string | null) => void }

export default function StoreAdvisor({ onAgentActive }: StoreAdvisorProps) {
  const [products, setProducts] = useState<Product[]>([
    { name: 'Pro Gaming Mousepad XL', price: '$29.99', status: 'Active', sales: 142 },
    { name: 'StreamVault Hoodie', price: '$49.99', status: 'Active', sales: 87 },
    { name: 'Custom Emote Pack', price: '$9.99', status: 'Active', sales: 324 },
    { name: 'Channel Membership Badge Set', price: '$4.99', status: 'Draft', sales: 0 },
    { name: 'Signed Poster (Limited)', price: '$24.99', status: 'Sold Out', sales: 56 },
    { name: 'Stream Sound Effects Pack', price: '$7.99', status: 'Active', sales: 198 },
  ])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '' })
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(1)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const msg = text ?? inputText.trim()
    if (!msg || loading) return
    setInputText('')
    const userMsg: ChatMsg = { id: msgIdRef.current++, role: 'user', text: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    onAgentActive(AGENT_ID)

    try {
      const result = await callAIAgent(msg, AGENT_ID)
      let parsed: AdvisorResponse = {}
      let images: string[] = []
      if (result.success) {
        let raw = result.response?.result
        if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch { /* as-is */ } }
        if (raw && typeof raw === 'object') parsed = raw as AdvisorResponse
        const af = result?.module_outputs?.artifact_files
        if (Array.isArray(af)) images = af.map((f: { file_url?: string }) => f?.file_url ?? '').filter(Boolean)
      }
      setMessages(prev => [...prev, { id: msgIdRef.current++, role: 'assistant', text: parsed?.advice ?? 'Here is my store advice.', data: parsed, images }])
    } catch {
      setMessages(prev => [...prev, { id: msgIdRef.current++, role: 'assistant', text: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      onAgentActive(null)
    }
  }

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price.trim()) return
    setProducts(prev => [...prev, { name: newProduct.name, price: `$${newProduct.price}`, status: 'Draft', sales: 0, description: newProduct.description }])
    setNewProduct({ name: '', price: '', description: '', category: '' })
    setShowAddProduct(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><FiPackage className="h-5 w-5 text-purple-400" /> Your Store</h1>
        <Button size="sm" onClick={() => setShowAddProduct(!showAddProduct)} variant="outline" className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
          {showAddProduct ? <FiX className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
          {showAddProduct ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {showAddProduct && (
        <Card className="bg-card border-border">
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">New Product</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground mb-1">Name *</Label><Input value={newProduct.name} onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" className="bg-muted/50 border-border" /></div>
              <div><Label className="text-xs text-muted-foreground mb-1">Price *</Label><Input value={newProduct.price} onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))} placeholder="19.99" type="number" className="bg-muted/50 border-border" /></div>
            </div>
            <div><Label className="text-xs text-muted-foreground mb-1">Description</Label><Textarea value={newProduct.description} onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))} placeholder="Product description..." className="bg-muted/50 border-border min-h-[60px]" /></div>
            <div><Label className="text-xs text-muted-foreground mb-1">Category</Label><Input value={newProduct.category} onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g., Merch, Digital" className="bg-muted/50 border-border" /></div>
            <Button onClick={handleAddProduct} disabled={!newProduct.name.trim() || !newProduct.price.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">Add Product</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, pi) => (
          <Card key={pi} className="bg-card border-border hover:border-purple-500/30 transition-colors">
            <CardContent className="p-4">
              <div className="h-20 rounded-lg bg-gradient-to-br from-purple-900/40 via-violet-800/30 to-indigo-900/40 mb-3 flex items-center justify-center">
                <FiPackage className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground truncate mr-2">{product.name}</h3>
                <Badge className={`text-[10px] flex-shrink-0 ${getStatusColor(product.status)}`}>{product.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{product.price}</span>
                <span className="text-xs text-muted-foreground">{product.sales} sold</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-sm flex items-center gap-2"><FiTag className="h-4 w-4 text-purple-400" /> Store Advisor</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Get advice on pricing, product descriptions, store layout, and sales strategy.</p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] px-4 py-4">
            <div className="space-y-4">
              {messages.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FiTag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Ask for store optimization tips, pricing strategies, or product description ideas.</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['Optimize my pricing', 'Write product descriptions', 'How to boost sales?'].map(s => (
                      <button key={s} onClick={() => handleSend(s)} className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-muted/30 border border-border'}`}>
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
                                  {sug?.expected_impact && <Badge variant="secondary" className="text-xs flex items-center gap-1"><FiTrendingUp className="h-3 w-3" />{sug.expected_impact}</Badge>}
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
                                <FiDollarSign className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
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
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Getting store advice...
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask about your store..." className="bg-muted/50 border-border text-sm" disabled={loading} />
              <Button size="sm" onClick={() => handleSend()} disabled={loading || !inputText.trim()} className="bg-purple-600 hover:bg-purple-700 text-white px-3"><FiSend className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
