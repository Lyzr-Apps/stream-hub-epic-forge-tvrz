'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import AdBanner from './AdBanner'
import { FiEye, FiVideo, FiChevronLeft, FiChevronRight, FiStar, FiTrendingUp } from 'react-icons/fi'

const CONTENT_REC_AGENT = '69a42c6d34e600fdb1dca356'

interface HomePageProps {
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

interface CategoryRow {
  category?: string
  title?: string
  items?: ContentItem[]
}

const HERO_GRADIENTS = [
  'from-purple-600/60 via-indigo-600/40 to-blue-600/60',
  'from-red-600/60 via-pink-600/40 to-purple-600/60',
  'from-cyan-600/60 via-blue-600/40 to-indigo-600/60',
]

const CARD_GRADIENTS = [
  'from-purple-900/60 to-indigo-900/60',
  'from-blue-900/60 to-cyan-900/60',
  'from-pink-900/60 to-rose-900/60',
  'from-green-900/60 to-emerald-900/60',
  'from-amber-900/60 to-orange-900/60',
  'from-red-900/60 to-pink-900/60',
  'from-teal-900/60 to-cyan-900/60',
  'from-violet-900/60 to-purple-900/60',
]

export default function HomePage({ onNavigateToChannel, onAgentActive }: HomePageProps) {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const hasFetched = useRef(false)

  const fetchRecommendations = useCallback(async () => {
    if (hasFetched.current) return
    hasFetched.current = true
    setLoading(true)
    onAgentActive(CONTENT_REC_AGENT)
    try {
      const result = await callAIAgent(
        'Generate content recommendations prioritizing smaller growing creators first before large streamers. Include categories: Featured Live Now (prioritize creators with under 500 viewers), Discover Rising Stars (creators with 10-100 viewers), Trending in Gaming, New Uploads Today, Music & Creative Streams. Provide 5-6 items per category with realistic viewer counts.',
        CONTENT_REC_AGENT
      )
      if (result.success) {
        let parsed = result.response?.result
        if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch { /* use as-is */ } }
        const recs = Array.isArray(parsed?.recommendations) ? parsed.recommendations : []
        setCategories(recs)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
      onAgentActive(null)
    }
  }, [onAgentActive])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const heroItems = categories.length > 0 && Array.isArray(categories[0]?.items) ? categories[0].items.slice(0, 3) : []

  const nextHero = () => setHeroIndex(prev => (prev + 1) % Math.max(heroItems.length, 1))
  const prevHero = () => setHeroIndex(prev => (prev - 1 + Math.max(heroItems.length, 1)) % Math.max(heroItems.length, 1))

  const isRisingStarsRow = (cat: CategoryRow) => {
    const name = (cat.category ?? cat.title ?? '').toLowerCase()
    return name.includes('rising') || name.includes('growing') || name.includes('discover')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-44 w-56 rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      {heroItems.length > 0 && (
        <div className="relative">
          <div className={`h-64 md:h-72 rounded-xl bg-gradient-to-br ${HERO_GRADIENTS[heroIndex % HERO_GRADIENTS.length]} border border-border relative overflow-hidden cursor-pointer`} onClick={() => onNavigateToChannel(heroItems[heroIndex]?.creator ?? '')}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-500 text-white text-[10px]">LIVE</Badge>
                <span className="text-xs text-foreground/80 flex items-center gap-1"><FiEye className="h-3 w-3" /> {heroItems[heroIndex]?.viewers ?? '0'} viewers</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{heroItems[heroIndex]?.title ?? 'Featured Stream'}</h2>
              <p className="text-sm text-muted-foreground">{heroItems[heroIndex]?.creator ?? 'Creator'}</p>
              {Array.isArray(heroItems[heroIndex]?.tags) && (heroItems[heroIndex]?.tags?.length ?? 0) > 0 && (
                <div className="flex gap-1 mt-2">
                  {(heroItems[heroIndex]?.tags ?? []).slice(0, 3).map((tag, ti) => (
                    <span key={ti} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-foreground/80">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-foreground/60">
              <FiStar className="h-3 w-3" />
              <span>Featuring growing creators</span>
            </div>
          </div>
          {heroItems.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevHero() }} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextHero() }} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <FiChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {heroItems.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setHeroIndex(i) }} className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/30'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {categories.map((cat, catIdx) => {
        const items = Array.isArray(cat?.items) ? cat.items : []
        if (items.length === 0) return null
        const isRising = isRisingStarsRow(cat)

        return (
          <React.Fragment key={catIdx}>
            {catIdx === 2 && <AdBanner />}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {isRising && <FiTrendingUp className="h-4 w-4 text-green-400" />}
                <h3 className="text-base font-semibold text-foreground">{cat.title ?? cat.category ?? 'Recommendations'}</h3>
                {isRising && <Badge variant="secondary" className="bg-green-500/10 text-green-400 text-[10px]">Growth First</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">{items.length} items</span>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-4">
                  {items.map((item, idx) => (
                    <Card
                      key={item.content_id ?? idx}
                      className="bg-card border-border hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden flex-shrink-0 w-56"
                      onClick={() => onNavigateToChannel(item.creator ?? '')}
                    >
                      <CardContent className="p-0">
                        <div className={`h-32 bg-gradient-to-br ${CARD_GRADIENTS[(catIdx * 3 + idx) % CARD_GRADIENTS.length]} relative flex items-center justify-center`}>
                          <FiVideo className="h-6 w-6 text-muted-foreground/20" />
                          {(item.type ?? '').toLowerCase().includes('live') && (
                            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5">LIVE</Badge>
                          )}
                          {!(item.type ?? '').toLowerCase().includes('live') && item.type && (
                            <Badge className="absolute top-2 left-2 bg-muted/80 text-foreground text-[10px] px-1.5 py-0.5">{item.type}</Badge>
                          )}
                          {item.duration && (
                            <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">{item.duration}</span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-purple-300 transition-colors">{item.title ?? 'Untitled'}</p>
                          <p className="text-[11px] text-purple-400 mt-0.5 truncate">{item.creator ?? 'Unknown'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.viewers && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><FiEye className="h-2.5 w-2.5" /> {item.viewers}</span>
                            )}
                          </div>
                          {Array.isArray(item.tags) && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {item.tags.slice(0, 2).map((tag, ti) => (
                                <span key={ti} className="text-[9px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-300">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </React.Fragment>
        )
      })}

      {categories.length === 0 && !loading && (
        <div className="text-center py-16">
          <FiVideo className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground font-medium">No recommendations available</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon for personalized content</p>
        </div>
      )}
    </div>
  )
}
