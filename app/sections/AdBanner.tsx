'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { FiZap } from 'react-icons/fi'

interface AdBannerProps {
  variant?: 'banner' | 'sidebar'
}

export default function AdBanner({ variant = 'banner' }: AdBannerProps) {
  if (variant === 'sidebar') {
    return (
      <div className="rounded-xl border border-border bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-4 relative overflow-hidden">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground absolute top-2 right-2">Sponsored</span>
        <div className="flex items-center gap-2 mb-2 mt-2">
          <FiZap className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-semibold text-foreground">StreamVault Pro</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Ad-free viewing, exclusive emotes, and priority support.</p>
        <Button size="sm" variant="outline" className="w-full text-xs h-7 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
          Learn More
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-4 my-4 rounded-xl border border-border bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-900/30 p-4 relative overflow-hidden">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground absolute top-3 right-4">Sponsored</span>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <FiZap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Upgrade to StreamVault Pro</h4>
            <p className="text-xs text-muted-foreground">Ad-free viewing, exclusive emotes, and priority support</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
          Learn More
        </Button>
      </div>
    </div>
  )
}
