'use client'

import { useState, useEffect, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FiPlay, FiEye, FiClock } from 'react-icons/fi'

const AGENT_ID = '69a42c6d34e600fdb1dca356'

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

interface Recommendation {
  category?: string
  title?: string
  items?: ContentItem[]
}

interface ContentResponse {
  status?: string
  recommendations?: Recommendation[]
}

const gradientPalettes = [
  'from-purple-600 via-violet-500 to-indigo-600',
  'from-pink-600 via-rose-500 to-red-500',
  'from-blue-600 via-cyan-500 to-teal-500',
  'from-orange-500 via-amber-500 to-yellow-500',
  'from-emerald-600 via-green-500 to-lime-500',
  'from-fuchsia-600 via-purple-500 to-pink-500',
  'from-sky-500 via-blue-500 to-indigo-600',
  'from-rose-500 via-pink-500 to-fuchsia-500',
]

function getGradient(index: number) {
  return gradientPalettes[index % gradientPalettes.length]
}

interface ContentDiscoveryProps {
  onAgentActive?: (id: string | null) => void
}

export default function ContentDiscovery({ onAgentActive }: ContentDiscoveryProps) {
  const [data, setData] = useState<ContentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    async function fetchRecommendations() {
      setLoading(true)
      setError(null)
      onAgentActive?.(AGENT_ID)
      try {
        const result = await callAIAgent(
          'Generate personalized content recommendations for a viewer interested in gaming, technology, and music. Include categories: Trending Live Now, Recommended For You, Popular in Gaming, New Uploads, Top Creators This Week. Provide 5 items per category.',
          AGENT_ID
        )
        if (result.success) {
          let parsed = result.response?.result
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed) } catch { /* use as-is */ }
          }
          setData(parsed as ContentResponse)
        } else {
          setError('Failed to load recommendations')
        }
      } catch {
        setError('Failed to load recommendations')
      } finally {
        setLoading(false)
        onAgentActive?.(null)
      }
    }
    fetchRecommendations()
  }, [onAgentActive])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {[1, 2, 3].map((row) => (
          <div key={row} className="space-y-4">
            <Skeleton className="h-7 w-48 bg-muted rounded-lg" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((card) => (
                <Skeleton key={card} className="min-w-[240px] h-[180px] bg-muted rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : []

  if (recommendations.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <FiPlay className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Discover Content</h2>
        <p className="text-muted-foreground">Loading personalized recommendations for you...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {recommendations.map((rec, rowIndex) => {
        const items = Array.isArray(rec?.items) ? rec.items : []
        return (
          <section key={rowIndex}>
            <h2 className="text-lg font-bold tracking-tight mb-4 text-foreground">
              {rec?.title ?? rec?.category ?? 'Recommendations'}
            </h2>
            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {items.map((item, cardIndex) => {
                  const isLive = (item?.type ?? '').toLowerCase().includes('live')
                  return (
                    <Card
                      key={item?.content_id ?? cardIndex}
                      className="min-w-[240px] max-w-[240px] flex-shrink-0 snap-start bg-card border-border overflow-hidden group/card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30"
                    >
                      <div className={`relative h-[135px] bg-gradient-to-br ${getGradient(rowIndex * 5 + cardIndex)} flex items-center justify-center`}>
                        <FiPlay className="w-8 h-8 text-white/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        {isLive && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white border-none text-xs px-2 py-0.5">LIVE</Badge>
                        )}
                        {!isLive && item?.duration && (
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {item.duration}
                          </span>
                        )}
                        {item?.viewers && (
                          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <FiEye className="w-3 h-3" />
                            {item.viewers}
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-1.5">
                        <h3 className="text-sm font-semibold text-foreground truncate">{item?.title ?? 'Untitled'}</h3>
                        <p className="text-xs text-muted-foreground truncate">{item?.creator ?? 'Unknown Creator'}</p>
                        {Array.isArray(item?.tags) && item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.slice(0, 3).map((tag, ti) => (
                              <Badge key={ti} variant="secondary" className="text-xs px-1.5 py-0 bg-secondary text-muted-foreground">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
