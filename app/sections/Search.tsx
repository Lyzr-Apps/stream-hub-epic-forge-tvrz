'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FiSearch, FiVideo, FiUser, FiEye } from 'react-icons/fi'

const CONTENT_REC_AGENT = '69a42c6d34e600fdb1dca356'

interface SearchProps {
  query: string
  onNavigateToChannel: (name: string) => void
  onAgentActive: (id: string | null) => void
}

interface ContentItem {
  content_id?: string
  title?: string
  creator?: string
  thumbnail_description?: string
  type?: string
  viewers?: string
  duration?: string
  tags?: string[]
}

const FILTERS = ['All', 'Live', 'Videos', 'Clips', 'Channels']
const GRADIENT_POOL = [
  'from-purple-900/60 to-indigo-900/60',
  'from-blue-900/60 to-cyan-900/60',
  'from-pink-900/60 to-rose-900/60',
  'from-green-900/60 to-emerald-900/60',
  'from-amber-900/60 to-orange-900/60',
  'from-red-900/60 to-pink-900/60',
]

export default function Search({ query, onNavigateToChannel, onAgentActive }: SearchProps) {
  const [localQuery, setLocalQuery] = useState(query)
  const [activeFilter, setActiveFilter] = useState('All')
  const [results, setResults] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    onAgentActive(CONTENT_REC_AGENT)
    try {
      const result = await callAIAgent(
        `Search for content matching '${q}'. Return results across categories including live streams, videos, clips, and channels. Include 8-10 results.`,
        CONTENT_REC_AGENT
      )
      if (result.success) {
        let parsed = result.response?.result
        if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch { /* use as-is */ } }
        const recs = Array.isArray(parsed?.recommendations) ? parsed.recommendations : []
        const allItems: ContentItem[] = []
        recs.forEach((rec: { items?: ContentItem[] }) => {
          if (Array.isArray(rec?.items)) {
            rec.items.forEach(item => allItems.push(item))
          }
        })
        setResults(allItems)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
      onAgentActive(null)
    }
  }, [onAgentActive])

  useEffect(() => {
    if (query) {
      setLocalQuery(query)
      doSearch(query)
    }
  }, [query, doSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) doSearch(localQuery.trim())
  }

  const filtered = activeFilter === 'All'
    ? results
    : results.filter(r => {
        const t = (r.type ?? '').toLowerCase()
        if (activeFilter === 'Live') return t.includes('live')
        if (activeFilter === 'Videos') return t.includes('video') || t.includes('vod')
        if (activeFilter === 'Clips') return t.includes('clip')
        if (activeFilter === 'Channels') return t.includes('channel')
        return true
      })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            placeholder="Search..."
            className="pl-9 bg-muted/50 border-border"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${activeFilter === f ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && query && (
        <div className="text-center py-16">
          <FiSearch className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground font-medium">No results found for &quot;{query}&quot;</p>
          <p className="text-sm text-muted-foreground mt-1">Try different keywords or browse categories</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <Card key={item.content_id ?? idx} className="bg-card border-border hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden">
              <CardContent className="p-0">
                <div className={`h-36 bg-gradient-to-br ${GRADIENT_POOL[idx % GRADIENT_POOL.length]} relative flex items-center justify-center`}>
                  <FiVideo className="h-8 w-8 text-muted-foreground/20" />
                  {(item.type ?? '').toLowerCase().includes('live') && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5">LIVE</Badge>
                  )}
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">{item.duration}</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-purple-300 transition-colors">{item.title ?? 'Untitled'}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateToChannel(item.creator ?? '') }}
                    className="text-xs text-purple-400 hover:text-purple-300 mt-1 flex items-center gap-1 transition-colors"
                  >
                    <FiUser className="h-3 w-3" /> {item.creator ?? 'Unknown'}
                  </button>
                  <div className="flex items-center gap-2 mt-1">
                    {item.viewers && <span className="text-xs text-muted-foreground flex items-center gap-1"><FiEye className="h-3 w-3" /> {item.viewers}</span>}
                    {item.type && !((item.type).toLowerCase().includes('live')) && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">{item.type}</Badge>
                    )}
                  </div>
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.slice(0, 3).map((tag, ti) => (
                        <span key={ti} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
