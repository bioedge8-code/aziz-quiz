'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { playSound } from '@/lib/sounds'

type TimerProps = {
  duration: number
  running: boolean
  onComplete: () => void
}

export default function Timer({ duration, running, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        onComplete()
        return 0
      }
      if (prev <= 11) {
        playSound('tick')
      }
      return prev - 1
    })
  }, [onComplete])

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, tick, timeLeft])

  const percentage = (timeLeft / duration) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage > 60) return '#00FF88'
    if (percentage > 30) return '#FFD700'
    return '#FF4444'
  }

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={getColor()}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>
      <span
        className="text-3xl font-black"
        style={{ color: getColor(), transition: 'color 0.5s ease' }}
      >
        {timeLeft}
      </span>
    </div>
  )
}
