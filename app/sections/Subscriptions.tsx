'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiBell, FiUser, FiVideo, FiGrid, FiTrash2 } from 'react-icons/fi'

interface SubscriptionsProps {
  subscriptions: string[]
  onNavigateToChannel: (name: string) => void
  onUnsubscribe: (name: string) => void
}

const CHANNEL_DATA: Record<string, { color: string; live: boolean; lastStream: string; category: string }> = {
  'StreamerPro': { color: 'from-red-500 to-orange-500', live: true, lastStream: 'Epic Gaming Marathon', category: 'Gaming' },
  'NightOwlGamer': { color: 'from-blue-500 to-cyan-500', live: true, lastStream: 'Late Night Ranked Grind', category: 'Gaming' },
  'TechWizard42': { color: 'from-green-500 to-emerald-500', live: false, lastStream: 'Building a Smart Mirror', category: 'Technology' },
  'PixelQueen': { color: 'from-pink-500 to-rose-500', live: false, lastStream: 'Digital Art Commission', category: 'Creative Arts' },
  'MusicMaven': { color: 'from-purple-500 to-violet-500', live: true, lastStream: 'Chill Lo-fi Session', category: 'Music & DJ' },
  'CozyCreator': { color: 'from-amber-500 to-yellow-500', live: false, lastStream: 'Cozy Craft Sunday', category: 'Creative Arts' },
  'FitnessFlex': { color: 'from-lime-500 to-green-500', live: false, lastStream: 'Morning HIIT Blast', category: 'Sports & Fitness' },
  'RetroKing': { color: 'from-indigo-500 to-blue-500', live: false, lastStream: 'N64 Classics Marathon', category: 'Gaming' },
}

const RECENT_CONTENT = [
  { title: 'Epic Boss Fight Compilation', creator: 'StreamerPro', views: '24K', duration: '12:34', type: 'Video' },
  { title: 'Midnight Ranked Session', creator: 'NightOwlGamer', views: '8.2K', duration: '2:45:00', type: 'VOD' },
  { title: 'Keyboard Build Timelapse', creator: 'TechWizard42', views: '15K', duration: '18:22', type: 'Video' },
  { title: 'Commission Speed Paint', creator: 'PixelQueen', views: '5.1K', duration: '1:05:30', type: 'VOD' },
  { title: 'Acoustic Guitar Cover', creator: 'MusicMaven', views: '12K', duration: '4:15', type: 'Video' },
  { title: 'Cozy Room Makeover', creator: 'CozyCreator', views: '9.8K', duration: '22:10', type: 'Video' },
]

export default function Subscriptions({ subscriptions, onNavigateToChannel, onUnsubscribe }: SubscriptionsProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <FiUser className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">No Subscriptions Yet</h2>
        <p className="text-sm text-muted-foreground mb-6">Find creators you love and subscribe to stay updated on their content.</p>
        <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
          <FiGrid className="h-4 w-4 mr-2" /> Browse Categories
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiBell className="h-5 w-5 text-purple-400" />
          <h1 className="text-xl font-bold text-foreground">Your Subscriptions</h1>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">{subscriptions.length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Channels</h3>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-1 pr-2">
              {subscriptions.map(name => {
                const data = CHANNEL_DATA[name]
                return (
                  <div key={name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors group">
                    <button onClick={() => onNavigateToChannel(name)} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${data?.color ?? 'from-purple-500 to-indigo-500'} flex items-center justify-center text-white text-xs font-bold`}>
                          {name.charAt(0)}
                        </div>
                        {data?.live && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-card" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {data?.live ? 'LIVE NOW' : data?.lastStream ?? 'Offline'}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => onUnsubscribe(name)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Unsubscribe"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Content</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RECENT_CONTENT.filter(c => subscriptions.includes(c.creator)).map((item, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-purple-500/30 transition-colors cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-28 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 relative flex items-center justify-center">
                    <FiVideo className="h-8 w-8 text-muted-foreground/30" />
                    <Badge className="absolute top-2 left-2 bg-muted/80 text-foreground text-[10px] px-1.5 py-0.5">{item.type}</Badge>
                    <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">{item.duration}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <button onClick={() => onNavigateToChannel(item.creator)} className="text-xs text-purple-400 hover:text-purple-300 mt-0.5 transition-colors">{item.creator}</button>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.views} views</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {RECENT_CONTENT.filter(c => subscriptions.includes(c.creator)).length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">No recent content from your subscriptions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
