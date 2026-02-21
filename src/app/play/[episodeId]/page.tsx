'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { playSound, toggleMute, isMuted } from '@/lib/sounds'
import { cn } from '@/lib/utils'
import Timer from '@/components/display/Timer'
import PrizeReveal from '@/components/display/PrizeReveal'
import Confetti from '@/components/display/Confetti'
import type { EpisodeQuestionWithDetails, GameState } from '@/types'

type EpisodeData = {
  id: string
  title: string
  status: string
  questions: EpisodeQuestionWithDetails[]
}

export default function PlayPage({ params }: { params: Promise<{ episodeId: string }> }) {
  const { episodeId } = use(params)
  const [episode, setEpisode] = useState<EpisodeData | null>(null)
  const [gameState, setGameState] = useState<GameState>('board')
  const [selectedQuestion, setSelectedQuestion] = useState<EpisodeQuestionWithDetails | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDuration] = useState(45)
  const [showConfetti, setShowConfetti] = useState(false)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const loadEpisode = useCallback(async () => {
    const res = await fetch(`/api/episodes/${episodeId}`)
    const data = await res.json()
    setEpisode(data)
  }, [episodeId])

  useEffect(() => {
    loadEpisode()
  }, [loadEpisode])

  // Select a number card
  const selectCard = useCallback((eq: EpisodeQuestionWithDetails) => {
    if (eq.status !== 'pending') return
    playSound('select')
    setSelectedQuestion(eq)
    setSelectedAnswer(null)
    setGameState('question')
    setTimerRunning(true)

    // Update status to revealed
    fetch(`/api/episodes/${episodeId}/questions/${eq.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'revealed' }),
    })

    setTimeout(() => playSound('reveal'), 400)
  }, [episodeId])

  // Select an answer (can change before reveal)
  const selectAnswer = useCallback((answer: string) => {
    if (gameState !== 'question') return
    setSelectedAnswer(answer)
  }, [gameState])

  // Reveal the answer (check if correct)
  const revealAnswer = useCallback(async () => {
    if (!selectedQuestion || !selectedAnswer) return

    const isCorrect = selectedAnswer === selectedQuestion.question.correct_answer
    const newStatus = isCorrect ? 'answered_correct' : 'answered_wrong'

    if (isCorrect) {
      playSound('correct')
      setGameState('answer_correct')
      setShowConfetti(true)

      // After 2 seconds, show prize
      setTimeout(() => {
        playSound('prize')
        setGameState('prize_reveal')
      }, 2500)

      // Stop confetti after a while
      setTimeout(() => setShowConfetti(false), 6000)
    } else {
      playSound('wrong')
      setGameState('answer_wrong')
    }

    // Update status in DB
    await fetch(`/api/episodes/${episodeId}/questions/${selectedQuestion.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    // Reload episode data
    loadEpisode()
  }, [selectedQuestion, selectedAnswer, episodeId, loadEpisode])

  // Return to board
  const returnToBoard = useCallback(() => {
    setGameState('board')
    setSelectedQuestion(null)
    setSelectedAnswer(null)
    setTimerRunning(false)
    setShowConfetti(false)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'board' && episode) {
        // Number keys 1-9, 0 for 10
        const num = e.key === '0' ? 10 : parseInt(e.key)
        if (num >= 1 && num <= 9) {
          const eq = episode.questions.find(q => q.display_order === num)
          if (eq && eq.status === 'pending') selectCard(eq)
        }
      }

      if (gameState === 'question') {
        const answerMap: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' }
        if (answerMap[e.key.toLowerCase()]) selectAnswer(answerMap[e.key.toLowerCase()])
        if (e.key === ' ') { e.preventDefault(); revealAnswer() }
      }

      if (gameState === 'answer_wrong' || gameState === 'prize_reveal') {
        if (e.key === 'Escape' || e.key === ' ') returnToBoard()
      }

      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
          setIsFullscreen(false)
        } else {
          document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      }

      if (e.key === 'm' || e.key === 'M') {
        const newMuted = toggleMute()
        setMuted(newMuted)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, episode, selectCard, selectAnswer, revealAnswer, returnToBoard])

  if (!episode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-dark to-bg-mid flex items-center justify-center">
        <div className="text-gold text-3xl font-bold animate-pulse">جاري التحميل...</div>
      </div>
    )
  }

  const answerLabels = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' } as const

  // Dynamic grid columns based on question count
  const qCount = episode.questions.length
  const gridCols = qCount <= 9 ? 'grid-cols-3' : qCount <= 16 ? 'grid-cols-4' : qCount <= 25 ? 'grid-cols-5' : 'grid-cols-6'

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-[#0D1B3E] to-bg-mid relative overflow-hidden select-none stars-bg ramadan-pattern">
      {/* Ramadan background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ramadan-light/5 rounded-full blur-3xl" />
        {/* Mosque silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 200%22><path d=%22M0,200 L0,120 Q50,100 100,120 L100,80 Q150,20 200,80 L200,120 Q250,100 300,120 L300,90 L320,40 L340,90 L340,120 Q400,100 450,120 L450,60 Q500,10 550,60 L550,120 Q600,100 650,120 L650,100 L670,50 L690,100 L690,120 Q750,100 800,120 L800,80 Q850,30 900,80 L900,120 Q950,100 1000,120 L1000,90 L1020,45 L1040,90 L1040,120 Q1100,100 1150,120 L1200,120 L1200,200 Z%22 fill=%22rgba(0,0,0,0.2)%22/></svg>')] bg-cover bg-bottom" />
        {/* Lanterns */}
        <div className="absolute top-4 right-[10%] text-3xl animate-float opacity-30 select-none">🏮</div>
        <div className="absolute top-8 left-[12%] text-2xl animate-float opacity-20 select-none" style={{ animationDelay: '1s' }}>🏮</div>
      </div>

      <Confetti active={showConfetti} />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <h1 className="text-2xl font-black text-white/80">{episode.title}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { const m = toggleMute(); setMuted(m) }}
            className="text-2xl opacity-50 hover:opacity-100 transition-opacity"
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <Image src="/images/logo.png" alt="اهبد مع عزيز" width={160} height={60} className="h-12 w-auto" />
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center pt-16 pb-8 px-8">
        <AnimatePresence mode="wait">
          {/* STATE: BOARD */}
          {gameState === 'board' && (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`grid ${gridCols} gap-4 w-full max-w-5xl`}
            >
              {episode.questions.map((eq) => {
                const isUsed = eq.status !== 'pending'
                const isCorrect = eq.status === 'answered_correct'
                const isWrong = eq.status === 'answered_wrong'

                return (
                  <motion.button
                    key={eq.id}
                    onClick={() => selectCard(eq)}
                    disabled={isUsed}
                    className={cn(
                      'relative aspect-square rounded-2xl flex items-center justify-center text-5xl font-black transition-all',
                      !isUsed && 'glass animate-card-glow cursor-pointer hover:scale-105 hover:bg-white/10 active:scale-95',
                      isUsed && 'bg-white/[0.02] border border-white/5 cursor-default',
                      isCorrect && 'border-correct/30',
                      isWrong && 'border-wrong/30',
                    )}
                    whileHover={!isUsed ? { y: -5 } : {}}
                    layout
                  >
                    <span className={cn(
                      isUsed ? 'text-white/20' : 'text-gold-gradient',
                    )}>
                      {eq.display_order}
                    </span>

                    {isCorrect && (
                      <span className="absolute top-2 left-2 text-correct text-lg">✓</span>
                    )}
                    {isWrong && (
                      <span className="absolute top-2 left-2 text-wrong text-lg">✗</span>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          )}

          {/* STATE: QUESTION */}
          {gameState === 'question' && selectedQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-full max-w-4xl space-y-8"
            >
              {/* Timer */}
              <div className="flex justify-center">
                <Timer
                  duration={timerDuration}
                  running={timerRunning}
                  onComplete={() => setTimerRunning(false)}
                />
              </div>

              {/* Question */}
              <motion.div
                className="glass rounded-2xl p-8 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-sm text-gold mb-2">السؤال رقم {selectedQuestion.display_order}</div>
                <h2 className="text-3xl font-bold leading-relaxed">{selectedQuestion.question.text}</h2>
              </motion.div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {(['A', 'B', 'C', 'D'] as const).map((opt, idx) => {
                  const optionKey = answerLabels[opt]
                  const isSelected = selectedAnswer === opt
                  const isCorrectOption = opt === selectedQuestion.question.correct_answer

                  return (
                    <motion.button
                      key={opt}
                      onClick={() => selectAnswer(opt)}
                      initial={{ x: idx % 2 === 0 ? -50 : 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className={cn(
                        'glass rounded-xl p-6 text-right transition-all text-lg cursor-pointer',
                        'hover:bg-white/10 hover:scale-[1.02]',
                        isSelected && 'bg-gold/20 border-gold/50 scale-[1.02]',
                        selectedAnswer && !isSelected && 'opacity-60',
                      )}
                    >
                      <span className={cn(
                        'inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ml-3',
                        isSelected ? 'bg-gold text-black' : 'bg-white/10',
                        selectedAnswer && isCorrectOption && !isSelected && 'bg-correct/20 text-correct'
                      )}>
                        {opt}
                      </span>
                      {selectedQuestion.question[optionKey]}
                    </motion.button>
                  )
                })}
              </div>

              {/* Reveal Button */}
              {selectedAnswer && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={revealAnswer}
                    className="px-12 py-4 bg-gradient-to-r from-gold to-gold-dark text-black font-black text-xl rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-gold/20"
                  >
                    كشف الإجابة
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STATE: CORRECT ANSWER */}
          {gameState === 'answer_correct' && selectedQuestion && (
            <motion.div
              key="correct"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl space-y-8 text-center"
            >
              <motion.div
                className="glass rounded-2xl p-8 animate-pulse-green"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <h2 className="text-3xl font-bold mb-4">{selectedQuestion.question.text}</h2>
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-correct/20 border border-correct/30 rounded-xl">
                  <span className="w-10 h-10 bg-correct text-black rounded-full flex items-center justify-center font-bold">
                    {selectedQuestion.question.correct_answer}
                  </span>
                  <span className="text-correct text-2xl font-bold">
                    {selectedQuestion.question[answerLabels[selectedQuestion.question.correct_answer]]}
                  </span>
                </div>
              </motion.div>

              <motion.p
                className="text-4xl font-black text-correct"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                إجابة صحيحة! ✓
              </motion.p>
            </motion.div>
          )}

          {/* STATE: WRONG ANSWER */}
          {gameState === 'answer_wrong' && selectedQuestion && (
            <motion.div
              key="wrong"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl space-y-8 text-center"
            >
              <motion.div
                className="glass rounded-2xl p-8 animate-shake"
              >
                <h2 className="text-3xl font-bold mb-6">{selectedQuestion.question.text}</h2>

                {/* Show selected wrong answer */}
                {selectedAnswer && selectedAnswer !== selectedQuestion.question.correct_answer && (
                  <motion.div
                    className="inline-flex items-center gap-3 px-8 py-4 bg-wrong/20 border border-wrong/30 rounded-xl mb-4 animate-pulse-red"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="w-10 h-10 bg-wrong text-white rounded-full flex items-center justify-center font-bold">✗</span>
                    <span className="text-wrong text-xl line-through">
                      {selectedQuestion.question[answerLabels[selectedAnswer as 'A' | 'B' | 'C' | 'D']]}
                    </span>
                  </motion.div>
                )}

                {/* Show correct answer */}
                <motion.div
                  className="inline-flex items-center gap-3 px-8 py-4 bg-correct/20 border border-correct/30 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <span className="w-10 h-10 bg-correct text-black rounded-full flex items-center justify-center font-bold">
                    {selectedQuestion.question.correct_answer}
                  </span>
                  <span className="text-correct text-xl font-bold">
                    {selectedQuestion.question[answerLabels[selectedQuestion.question.correct_answer]]}
                  </span>
                </motion.div>
              </motion.div>

              <motion.p
                className="text-4xl font-black text-wrong"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                حظاً أوفر!
              </motion.p>

              <motion.button
                onClick={returnToBoard}
                className="px-10 py-4 bg-white/10 border border-white/20 rounded-xl text-xl hover:bg-white/20 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                العودة للوحة
              </motion.button>
            </motion.div>
          )}

          {/* STATE: PRIZE REVEAL */}
          {gameState === 'prize_reveal' && selectedQuestion && (
            <motion.div
              key="prize"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center gap-8"
            >
              <PrizeReveal
                name={selectedQuestion.prize.name}
                value={selectedQuestion.prize.value}
                imageUrl={selectedQuestion.prize.image_url}
              />

              <motion.button
                onClick={returnToBoard}
                className="px-10 py-4 bg-white/10 border border-white/20 rounded-xl text-xl hover:bg-white/20 transition-colors mt-8 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                العودة للوحة
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar - controls hint */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white/20 text-xs">
        <div className="flex gap-4">
          <span>F - ملء الشاشة</span>
          <span>M - كتم الصوت</span>
          <span>Space - كشف الإجابة</span>
          <span>Esc - رجوع</span>
        </div>
        <div className="flex gap-4">
          <span>A/B/C/D - اختيار إجابة</span>
          <span>1-9 - اختيار سؤال</span>
        </div>
      </div>
    </div>
  )
}
