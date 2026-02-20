'use client'

type SoundName = 'select' | 'reveal' | 'tick' | 'correct' | 'wrong' | 'prize'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

function playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
  frequencies.forEach(f => playTone(f, duration, type, volume))
}

const soundGenerators: Record<SoundName, () => void> = {
  select: () => {
    playTone(600, 0.15, 'sine', 0.3)
    setTimeout(() => playTone(800, 0.15, 'sine', 0.3), 80)
  },
  reveal: () => {
    playTone(400, 0.3, 'sine', 0.2)
    setTimeout(() => playTone(500, 0.3, 'sine', 0.2), 150)
    setTimeout(() => playTone(600, 0.4, 'sine', 0.2), 300)
  },
  tick: () => {
    playTone(1000, 0.05, 'square', 0.15)
  },
  correct: () => {
    playChord([523, 659, 784], 0.3)
    setTimeout(() => playChord([587, 740, 880], 0.3), 200)
    setTimeout(() => playChord([659, 831, 1047], 0.5), 400)
  },
  wrong: () => {
    playTone(200, 0.5, 'sawtooth', 0.2)
    setTimeout(() => playTone(180, 0.5, 'sawtooth', 0.2), 200)
  },
  prize: () => {
    const notes = [523, 587, 659, 784, 880, 1047]
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.2, 'sine', 0.2), i * 100)
    })
  },
}

let muted = false

export function playSound(name: SoundName) {
  if (muted) return
  try {
    soundGenerators[name]()
  } catch {
    // Audio context not available
  }
}

export function toggleMute(): boolean {
  muted = !muted
  return muted
}

export function isMuted(): boolean {
  return muted
}
