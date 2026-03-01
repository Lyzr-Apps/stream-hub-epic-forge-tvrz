'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiUser, FiCalendar, FiVideo, FiScissors, FiInfo, FiArrowLeft, FiHeart, FiClock, FiEye, FiExternalLink } from 'react-icons/fi'

interface ChannelPageProps {
  channelName: string
  isSubscribed: boolean
  onSubscribe: (name: string) => void
  onBack: () => void
}

const GRADIENTS = [
  'from-purple-900/60 to-indigo-900/60',
  'from-blue-900/60 to-cyan-900/60',
  'from-pink-900/60 to-rose-900/60',
  'from-green-900/60 to-emerald-900/60',
  'from-amber-900/60 to-orange-900/60',
  'from-red-900/60 to-pink-900/60',
]

const SAMPLE_VIDEOS = [
  { title: 'Epic Gaming Session Highlights', views: '24K', date: '2 days ago', duration: '12:34' },
  { title: 'Tutorial: Advanced Strategies', views: '18K', date: '5 days ago', duration: '28:15' },
  { title: 'Community Game Night Recap', views: '9.2K', date: '1 week ago', duration: '45:22' },
  { title: 'Behind the Scenes: My Setup', views: '32K', date: '2 weeks ago', duration: '15:08' },
  { title: 'Speedrun Challenge Attempt', views: '41K', date: '2 weeks ago', duration: '1:02:30' },
  { title: 'Reacting to Your Clips', views: '15K', date: '3 weeks ago', duration: '22:45' },
  { title: 'Monthly Q&A Session', views: '8.7K', date: '1 month ago', duration: '55:12' },
  { title: 'Collab Stream with Friends', views: '27K', date: '1 month ago', duration: '2:15:00' },
]

const SAMPLE_CLIPS = [
  { title: 'Insane Clutch Play', views: '120K', duration: '0:28' },
  { title: 'Funniest Moment This Week', views: '85K', duration: '0:15' },
  { title: 'Reaction to Donation', views: '45K', duration: '0:32' },
  { title: 'Triple Kill Combo', views: '67K', duration: '0:22' },
  { title: 'Chat Made Me Do This', views: '38K', duration: '0:45' },
  { title: 'New Personal Record', views: '92K', duration: '0:18' },
]

const SCHEDULE = [
  { day: 'Monday', slots: [{ time: '7:00 PM', title: 'Ranked Grind' }] },
  { day: 'Tuesday', slots: [] },
  { day: 'Wednesday', slots: [{ time: '6:00 PM', title: 'Community Game Night' }] },
  { day: 'Thursday', slots: [{ time: '8:00 PM', title: 'Chill Stream' }] },
  { day: 'Friday', slots: [{ time: '5:00 PM', title: 'Variety Friday' }, { time: '10:00 PM', title: 'Late Night Horror' }] },
  { day: 'Saturday', slots: [{ time: '2:00 PM', title: 'Tournament Practice' }] },
  { day: 'Sunday', slots: [{ time: '12:00 PM', title: 'Sunday Funday' }] },
]

const TABS = [
  { id: 'about', label: 'About', icon: FiInfo },
  { id: 'videos', label: 'Videos', icon: FiVideo },
  { id: 'live', label: 'Live', icon: FiEye },
  { id: 'clips', label: 'Clips', icon: FiScissors },
  { id: 'schedule', label: 'Schedule', icon: FiCalendar },
]

export default function ChannelPage({ channelName, isSubscribed, onSubscribe, onBack }: ChannelPageProps) {
  const [activeTab, setActiveTab] = useState('about')

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-4 transition-colors">
        <FiArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="h-40 rounded-xl bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-blue-600/40 relative mb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-background">
            {channelName.charAt(0)}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-bold text-foreground">{channelName}</h1>
            <p className="text-sm text-muted-foreground">48.2K subscribers</p>
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={() => onSubscribe(channelName)}
            variant={isSubscribed ? 'outline' : 'default'}
            size="sm"
            className={isSubscribed ? 'border-purple-500/30 text-purple-300' : 'bg-purple-600 hover:bg-purple-700 text-white'}
          >
            <FiHeart className={`h-4 w-4 mr-1.5 ${isSubscribed ? 'fill-purple-400 text-purple-400' : ''}`} />
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-purple-500 text-purple-300' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <tab.icon className="h-3.5 w-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hey everyone! I&apos;m {channelName}, a passionate content creator focused on bringing you the best entertainment and educational content.
              I stream regularly and love interacting with my community. Whether it&apos;s gaming, tech, or just chatting, there&apos;s always something fun happening here!
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-300">Gaming</Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-300">Entertainment</Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-300">Education</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Joined', value: 'March 2022' },
                { label: 'Total Views', value: '2.4M' },
                { label: 'Subscribers', value: '48.2K' },
                { label: 'Total Streams', value: '342' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              {['Twitter', 'Discord', 'YouTube'].map(s => (
                <a key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <FiExternalLink className="h-3 w-3" /> {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SAMPLE_VIDEOS.map((vid, idx) => (
            <Card key={idx} className="bg-card border-border hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden">
              <CardContent className="p-0">
                <div className={`h-32 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} relative flex items-center justify-center`}>
                  <FiVideo className="h-6 w-6 text-muted-foreground/20" />
                  <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">{vid.duration}</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-purple-300 transition-colors">{vid.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><FiEye className="h-3 w-3" /> {vid.views}</span>
                    <span className="flex items-center gap-1"><FiClock className="h-3 w-3" /> {vid.date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'live' && (
        <div className="text-center py-16">
          <div className="h-14 w-14 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <FiVideo className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">{channelName} is not currently live</p>
          <p className="text-sm text-muted-foreground mt-1">Check the schedule for upcoming streams</p>
          <Button variant="outline" size="sm" className="mt-4 border-purple-500/30 text-purple-300" onClick={() => setActiveTab('schedule')}>
            View Schedule
          </Button>
        </div>
      )}

      {activeTab === 'clips' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_CLIPS.map((clip, idx) => (
            <Card key={idx} className="bg-card border-border hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden">
              <CardContent className="p-0">
                <div className={`h-28 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} relative flex items-center justify-center`}>
                  <FiScissors className="h-6 w-6 text-muted-foreground/20" />
                  <Badge className="absolute top-2 left-2 bg-blue-500/80 text-white text-[10px] px-1.5 py-0.5">Clip</Badge>
                  <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">{clip.duration}</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-purple-300 transition-colors">{clip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><FiEye className="h-3 w-3" /> {clip.views} views</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Weekly Stream Schedule</h3>
          {SCHEDULE.map(day => (
            <div key={day.day} className="flex items-start gap-4 p-3 rounded-lg bg-muted/10 border border-border/50">
              <span className="text-sm font-medium text-foreground w-24 flex-shrink-0">{day.day}</span>
              <div className="flex-1">
                {day.slots.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">No stream scheduled</span>
                ) : (
                  <div className="space-y-1.5">
                    {day.slots.map((slot, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 text-xs">{slot.time}</Badge>
                        <span className="text-sm text-foreground">{slot.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
