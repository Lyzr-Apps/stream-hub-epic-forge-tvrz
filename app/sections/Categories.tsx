'use client'
import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FiMonitor, FiMusic, FiEdit, FiMessageCircle, FiCpu, FiBook, FiActivity, FiCoffee, FiGlobe, FiZap, FiRadio, FiHeadphones, FiArrowLeft, FiVideo, FiUser, FiEye } from 'react-icons/fi'

const CONTENT_REC_AGENT = '69a42c6d34e600fdb1dca356'

interface CategoriesProps {
  onNavigateToChannel: (name: string) => void
  onAgentActive: (id: string | null) => void
}

interface ContentItem {
  content_id?: string
  title?: string
  creator?: string
  type?: string
  viewers?: string
  duration?: string
  tags?: string[]
}

const CATEGORIES = [
  { name: 'Gaming', icon: FiMonitor, color: 'from-red-500 to-orange-500', live: 1240 },
  { name: 'Music & DJ', icon: FiMusic, color: 'from-purple-500 to-pink-500', live: 420 },
  { name: 'Creative Arts', icon: FiEdit, color: 'from-blue-500 to-cyan-500', live: 310 },
  { name: 'Just Chatting', icon: FiMessageCircle, color: 'from-green-500 to-emerald-500', live: 890 },
  { name: 'Technology', icon: FiCpu, color: 'from-indigo-500 to-blue-500', live: 185 },
  { name: 'Education', icon: FiBook, color: 'from-amber-500 to-yellow-500', live: 156 },
  { name: 'Sports & Fitness', icon: FiActivity, color: 'from-lime-500 to-green-500', live: 275 },
  { name: 'Cooking', icon: FiCoffee, color: 'from-orange-500 to-red-500', live: 98 },
  { name: 'Travel & Outdoors', icon: FiGlobe, color: 'from-teal-500 to-cyan-500', live: 67 },
  { name: 'Science', icon: FiZap, color: 'from-violet-500 to-purple-500', live: 43 },
  { name: 'News & Politics', icon: FiRadio, color: 'from-slate-500 to-gray-500', live: 112 },
  { name: 'ASMR', icon: FiHeadphones, color: 'from-pink-500 to-rose-500', live: 204 },
]

const GRADIENTS = [
  'from-purple-900/60 to-indigo-900/60',
  'from-blue-900/60 to-cyan-900/60',
  'from-pink-900/60 to-rose-900/60',
  'from-green-900/60 to-emerald-900/60',
  'from-amber-900/60 to-orange-900/60',
  'from-red-900/60 to-pink-900/60',
]

export default function Categories({ onNavigateToChannel, onAgentActive }: CategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryResults, setCategoryResults] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleCategoryClick = useCallback(async (catName: string) => {
    setSelectedCategory(catName)
    setCategoryResults([])
    setLoading(true)
    onAgentActive(CONTENT_REC_AGENT)
    try {
      const result = await callAIAgent(
        `Show me live and recent content in the ${catName} category. Include 6 items with realistic viewer counts and durations.`,
        CONTENT_REC_AGENT
      )
      if (result.success) {
        let parsed = result.response?.result
        if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch { /* use as-is */ } }
        const recs = Array.isArray(parsed?.recommendations) ? parsed.recommendations : []
        const allItems: ContentItem[] = []
        recs.forEach((rec: { items?: ContentItem[] }) => {
          if (Array.isArray(rec?.items)) rec.items.forEach(item => allItems.push(item))
        })
        setCategoryResults(allItems)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
      onAgentActive(null)
    }
  }, [onAgentActive])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {selectedCategory && (
        <button onClick={() => { setSelectedCategory(null); setCategoryResults([]) }} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-4 transition-colors">
          <FiArrowLeft className="h-4 w-4" /> Back to Categories
        </button>
      )}

      {!selectedCategory && (
        <>
          <h1 className="text-xl font-bold text-foreground mb-6">Browse Categories</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <button key={cat.name} onClick={() => handleCategoryClick(cat.name)} className="text-left group">
                <Card className="bg-card border-border hover:border-purple-500/30 transition-all overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-24 bg-gradient-to-br ${cat.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                      <cat.icon className="h-10 w-10 text-white/80" />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">{cat.live} live</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedCategory && (
        <>
          <h2 className="text-lg font-bold text-foreground mb-4">{selectedCategory}</h2>
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}
          {!loading && categoryResults.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No results found. Try another category.</p>
          )}
          {!loading && categoryResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryResults.map((item, idx) => (
                <Card key={item.content_id ?? idx} className="bg-card border-border hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-36 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} relative flex items-center justify-center`}>
                      <FiVideo className="h-8 w-8 text-muted-foreground/20" />
                      {(item.type ?? '').toLowerCase().includes('live') && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5">LIVE</Badge>
                      )}
                      {item.duration && <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">{item.duration}</span>}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground truncate">{item.title ?? 'Untitled'}</p>
                      <button onClick={() => onNavigateToChannel(item.creator ?? '')} className="text-xs text-purple-400 hover:text-purple-300 mt-1 flex items-center gap-1 transition-colors">
                        <FiUser className="h-3 w-3" /> {item.creator ?? 'Unknown'}
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        {item.viewers && <span className="text-xs text-muted-foreground flex items-center gap-1"><FiEye className="h-3 w-3" /> {item.viewers}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
