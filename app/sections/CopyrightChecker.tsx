'use client'
import React, { useState, useEffect } from 'react'
import { FiCheck, FiAlertTriangle, FiMusic, FiShield, FiLoader } from 'react-icons/fi'
import { Button } from '@/components/ui/button'

interface CopyrightCheckerProps {
  fileName: string
  isScanning: boolean
  onComplete: (result: 'clean' | 'flagged') => void
}

export default function CopyrightChecker({ fileName, isScanning, onComplete }: CopyrightCheckerProps) {
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<'clean' | 'flagged' | null>(null)
  const [scanPhase, setScanPhase] = useState('')

  useEffect(() => {
    if (!isScanning) {
      setScanProgress(0)
      setScanResult(null)
      setScanPhase('')
      return
    }
    setScanProgress(0)
    setScanResult(null)

    const phases = ['Analyzing audio tracks...', 'Checking content database...', 'Verifying visual assets...']
    let phaseIdx = 0
    setScanPhase(phases[0])

    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + Math.random() * 15 + 5
        if (next >= 100) {
          clearInterval(interval)
          const result = Math.random() > 0.5 ? 'clean' : 'flagged'
          setScanResult(result)
          onComplete(result)
          return 100
        }
        const newPhaseIdx = Math.floor((next / 100) * phases.length)
        if (newPhaseIdx !== phaseIdx && newPhaseIdx < phases.length) {
          phaseIdx = newPhaseIdx
          setScanPhase(phases[phaseIdx])
        }
        return next
      })
    }, 400)

    return () => clearInterval(interval)
  }, [isScanning, onComplete])

  if (!isScanning && !scanResult) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FiShield className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-semibold text-foreground">Copyright Check</span>
        <span className="text-xs text-muted-foreground ml-auto">{fileName}</span>
      </div>

      {isScanning && !scanResult && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FiLoader className="h-3 w-3 animate-spin" />
            <span>{scanPhase}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{Math.round(scanProgress)}% complete</p>
        </>
      )}

      {scanResult === 'clean' && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <FiCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-300">No copyrighted content detected</p>
            <p className="text-xs text-green-400/70 mt-1">Your content is clear for monetization.</p>
          </div>
        </div>
      )}

      {scanResult === 'flagged' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <FiAlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-300">Potential copyright match found</p>
              <p className="text-xs text-yellow-400/70 mt-1">This content cannot be monetized due to copyrighted music.</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs space-y-1">
            <div className="flex items-center gap-2">
              <FiMusic className="h-3 w-3 text-purple-400" />
              <span className="text-foreground font-medium">Midnight Dreams - Luna Eclipse</span>
            </div>
            <p className="text-muted-foreground ml-5">Matched at 02:14 - 03:47</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-xs h-7">Remove Audio Segment</Button>
            <Button size="sm" variant="outline" className="text-xs h-7">Dispute Claim</Button>
            <Button size="sm" variant="outline" className="text-xs h-7">Acknowledge</Button>
          </div>
        </div>
      )}
    </div>
  )
}
