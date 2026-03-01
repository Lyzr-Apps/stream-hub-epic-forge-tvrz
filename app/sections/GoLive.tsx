'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FiVideo, FiClock, FiEye, FiUpload, FiCopy, FiPlay, FiSquare, FiScissors } from 'react-icons/fi'

interface GoLiveProps {
  onAgentActive: (id: string | null) => void
}

export default function GoLive({ onAgentActive: _onAgentActive }: GoLiveProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    description: '',
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const [showKey, setShowKey] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const [clipSaved, setClipSaved] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const viewerRef = useRef<NodeJS.Timeout | null>(null)

  const STREAM_KEY = 'svk_live_a8f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5'

  const startStream = useCallback(() => {
    if (!formData.title.trim()) return
    setIsStreaming(true)
    setElapsedSeconds(0)
    setViewerCount(0)
  }, [formData.title])

  const endStream = useCallback(() => {
    setIsStreaming(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (viewerRef.current) clearInterval(viewerRef.current)
  }, [])

  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000)
      viewerRef.current = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5) + 1)
      }, 2000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (viewerRef.current) clearInterval(viewerRef.current)
    }
  }, [isStreaming])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const copyKey = () => {
    navigator.clipboard.writeText(STREAM_KEY).catch(() => {})
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const handleClip = () => {
    setClipSaved(true)
    setTimeout(() => setClipSaved(false), 3000)
  }

  const categories = ['Gaming', 'Music', 'Creative', 'Just Chatting', 'Tech', 'Education', 'Sports']

  if (isStreaming) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-border relative overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <FiVideo className="h-16 w-16 text-purple-400/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Stream Preview</p>
              </div>
              <Badge className="absolute top-4 left-4 bg-red-500 text-white animate-pulse">LIVE</Badge>
              <div className="absolute top-4 right-4 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-foreground bg-black/40 px-2 py-1 rounded"><FiClock className="h-3 w-3" /> {formatTime(elapsedSeconds)}</span>
                <span className="flex items-center gap-1 text-foreground bg-black/40 px-2 py-1 rounded"><FiEye className="h-3 w-3" /> {viewerCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground flex-1 truncate">{formData.title}</h2>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-300">{formData.category || 'General'}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={endStream} className="gap-2">
                <FiSquare className="h-4 w-4" /> End Stream
              </Button>
              <Button variant="outline" onClick={handleClip} className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <FiScissors className="h-4 w-4" /> Clip This Moment
              </Button>
            </div>
            {clipSaved && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-300">
                Clip saved! You can find it in your clips library.
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Stream Stats</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground font-medium">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Viewers</span>
                  <span className="text-foreground font-medium">{viewerCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peak Viewers</span>
                  <span className="text-foreground font-medium">{viewerCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-foreground font-medium">{formData.category || 'General'}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Chat Preview</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2 text-xs">
                  {[
                    { user: 'ChatFan42', msg: 'Great stream!' },
                    { user: 'GamerPro', msg: 'Lets gooo!' },
                    { user: 'NightViewer', msg: 'Just joined, what did I miss?' },
                  ].map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-purple-400 font-medium flex-shrink-0">{c.user}:</span>
                      <span className="text-muted-foreground">{c.msg}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <FiVideo className="h-5 w-5 text-purple-400" /> Go Live
      </h1>

      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader className="py-4 px-5">
            <CardTitle className="text-sm">Stream Setup</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Stream Title *</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your stream title..."
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., fps, competitive, tutorial"
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell viewers what this stream is about..."
                className="bg-muted/50 border-border min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Thumbnail</Label>
              <div className="h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-purple-500/30 transition-colors">
                <div className="text-center">
                  <FiUpload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="py-4 px-5">
            <CardTitle className="text-sm">Stream Key</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-2">
              <Input
                value={showKey ? STREAM_KEY : '************************************'}
                readOnly
                className="bg-muted/50 border-border font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)} className="border-border text-xs flex-shrink-0">
                {showKey ? 'Hide' : 'Show'}
              </Button>
              <Button variant="outline" size="sm" onClick={copyKey} className="border-border flex-shrink-0">
                <FiCopy className="h-3.5 w-3.5" />
              </Button>
            </div>
            {keyCopied && <p className="text-xs text-green-400 mt-1">Copied to clipboard</p>}
          </CardContent>
        </Card>

        <Button
          onClick={startStream}
          disabled={!formData.title.trim()}
          className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white h-12 text-base"
        >
          <FiPlay className="h-5 w-5" /> Start Stream
        </Button>
      </div>
    </div>
  )
}
