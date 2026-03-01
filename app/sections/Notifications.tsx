'use client'
import React, { useState } from 'react'
import { FiVideo, FiBell, FiScissors, FiBarChart2, FiX, FiCheck } from 'react-icons/fi'

interface NotificationsProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_NOTIFICATIONS = [
  { id: 1, icon: 'live', text: 'NightOwlGamer went live!', sub: 'Playing Elden Ring', time: '2 min ago', unread: true },
  { id: 2, icon: 'video', text: 'TechWizard42 uploaded a new video', sub: '"Building a Custom Keyboard from Scratch"', time: '15 min ago', unread: true },
  { id: 3, icon: 'clip', text: 'PixelQueen clipped: "Insane Clutch Play"', sub: 'From yesterday\'s stream', time: '1 hour ago', unread: true },
  { id: 4, icon: 'analytics', text: 'Your stream received 1.2K views', sub: 'Last stream performance update', time: '2 hours ago', unread: true },
  { id: 5, icon: 'live', text: 'StreamerPro went live!', sub: 'Just Chatting', time: '3 hours ago', unread: true },
  { id: 6, icon: 'video', text: 'CozyCreator uploaded a new video', sub: '"Watercolor Tutorial: Ocean Sunset"', time: '5 hours ago', unread: false },
  { id: 7, icon: 'clip', text: 'RetroKing clipped: "World Record Speed Run"', sub: 'Super Mario Bros', time: '8 hours ago', unread: false },
  { id: 8, icon: 'analytics', text: 'Weekly analytics ready', sub: 'You gained 234 new subscribers this week', time: '12 hours ago', unread: false },
  { id: 9, icon: 'live', text: 'MusicMaven went live!', sub: 'Live DJ Set - Chill Vibes', time: '1 day ago', unread: false },
  { id: 10, icon: 'video', text: 'FitnessFlex uploaded a new video', sub: '"30 Min HIIT Workout"', time: '1 day ago', unread: false },
]

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'live': return <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center"><FiBell className="h-4 w-4 text-red-400" /></div>
    case 'video': return <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center"><FiVideo className="h-4 w-4 text-purple-400" /></div>
    case 'clip': return <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center"><FiScissors className="h-4 w-4 text-blue-400" /></div>
    case 'analytics': return <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><FiBarChart2 className="h-4 w-4 text-green-400" /></div>
    default: return <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><FiBell className="h-4 w-4 text-muted-foreground" /></div>
  }
}

export default function Notifications({ isOpen, onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-4 top-14 z-50 w-96 max-h-[70vh] rounded-xl border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              <FiCheck className="h-3 w-3" /> Mark all read
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-3 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${notif.unread ? 'bg-purple-500/5' : ''}`}
            >
              <NotifIcon type={notif.icon} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{notif.text}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.sub}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
              {notif.unread && <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
