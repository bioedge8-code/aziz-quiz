'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type PrizeRevealProps = {
  name: string
  value: string | number
  imageUrl?: string | null
}

// Confetti particle component
function Confetti() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 800,
    y: -(Math.random() * 600 + 200),
    rotate: Math.random() * 720 - 360,
    scale: Math.random() * 0.8 + 0.4,
    color: ['#C9A84C', '#FFD700', '#1E90FF', '#FF6B6B', '#4ECDC4', '#FF69B4', '#FFA500'][Math.floor(Math.random() * 7)],
    delay: Math.random() * 0.5,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: p.shape === 'circle' ? 10 : 8,
            height: p.shape === 'circle' ? 10 : 14,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: p.scale,
            rotate: p.rotate,
          }}
          transition={{
            duration: 2.5,
            delay: p.delay + 1.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  )
}

// Sparkle/star burst
function Sparkles() {
  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    distance: 180 + Math.random() * 120,
    size: Math.random() * 16 + 8,
    delay: Math.random() * 0.3,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => {
        const rad = (s.angle * Math.PI) / 180
        return (
          <motion.div
            key={s.id}
            className="absolute text-gold"
            style={{
              left: '50%',
              top: '50%',
              fontSize: s.size,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos(rad) * s.distance,
              y: Math.sin(rad) * s.distance,
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 1.2,
              delay: s.delay + 1.8,
              ease: 'easeOut',
            }}
          >
            ✦
          </motion.div>
        )
      })}
    </div>
  )
}

export default function PrizeReveal({ name, value, imageUrl }: PrizeRevealProps) {
  const [stage, setStage] = useState<'box' | 'shaking' | 'opening' | 'revealed'>('box')

  useEffect(() => {
    // Stage 1: Box appears (0s)
    // Stage 2: Box shakes (0.8s)
    const t1 = setTimeout(() => setStage('shaking'), 800)
    // Stage 3: Lid opens (2s)
    const t2 = setTimeout(() => setStage('opening'), 2000)
    // Stage 4: Prize revealed (2.5s)
    const t3 = setTimeout(() => setStage('revealed'), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: 500 }}>
      {/* Background glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: stage === 'revealed' ? [1, 1.3, 1] : 1,
          opacity: stage === 'revealed' ? 1 : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: stage === 'revealed' ? Infinity : 0,
          repeatType: 'reverse',
        }}
      />

      {/* Confetti & sparkles on reveal */}
      {stage === 'revealed' && (
        <>
          <Confetti />
          <Sparkles />
        </>
      )}

      {/* Gift Box */}
      <AnimatePresence>
        {stage !== 'revealed' && (
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0, y: 100 }}
            animate={{
              scale: 1,
              y: 0,
              x: stage === 'shaking' ? [0, -8, 8, -12, 12, -8, 8, -4, 4, 0] : 0,
              rotate: stage === 'shaking' ? [0, -3, 3, -5, 5, -3, 3, -1, 1, 0] : 0,
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={
              stage === 'shaking'
                ? { duration: 1, ease: 'easeInOut' }
                : { type: 'spring', bounce: 0.5, duration: 0.8 }
            }
          >
            {/* Lid */}
            <motion.div
              className="relative z-10"
              animate={
                stage === 'opening'
                  ? { y: -120, rotateX: -60, opacity: 0 }
                  : {}
              }
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Lid top */}
              <div
                className="w-[220px] h-[50px] rounded-t-2xl relative"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #FFD700 50%, #C9A84C 100%)',
                  boxShadow: '0 -4px 20px rgba(201,168,76,0.3)',
                }}
              >
                {/* Ribbon bow on top */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-end">
                  <div
                    className="w-8 h-8 rounded-full border-4 border-red-500"
                    style={{ background: 'radial-gradient(circle, #FF6B6B, #CC0000)', transform: 'rotate(-30deg) translateX(4px)' }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-4 border-red-500"
                    style={{ background: 'radial-gradient(circle, #FF6B6B, #CC0000)', transform: 'rotate(30deg) translateX(-4px)' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Box body */}
            <div
              className="w-[200px] h-[160px] rounded-b-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #B8941F 0%, #E8C84A 50%, #B8941F 100%)',
                boxShadow: '0 10px 40px rgba(201,168,76,0.3), inset 0 -5px 15px rgba(0,0,0,0.2)',
              }}
            >
              {/* Vertical ribbon */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-red-600/80" />
              {/* Horizontal ribbon */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-8 bg-red-600/80" />

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, transparent 50%)',
                }}
                animate={{ x: [-200, 200] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </div>

            {/* Question marks floating around box during shake */}
            {stage === 'shaking' && (
              <>
                {['؟', '!', '؟'].map((char, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-3xl text-gold/60 font-bold"
                    style={{
                      left: i === 0 ? -40 : i === 1 ? '50%' : 'auto',
                      right: i === 2 ? -40 : 'auto',
                      top: i === 1 ? -50 : 20 + i * 40,
                    }}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -30 }}
                    transition={{ duration: 1, delay: i * 0.3 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealed prize content */}
      <AnimatePresence>
        {stage === 'revealed' && (
          <motion.div
            className="flex flex-col items-center gap-6 relative z-10"
            initial={{ scale: 0, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          >
            {/* Prize image */}
            {imageUrl && (
              <motion.div
                className="w-52 h-52 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  border: '4px solid rgba(201,168,76,0.7)',
                  boxShadow: '0 0 40px rgba(201,168,76,0.3), 0 20px 60px rgba(0,0,0,0.4)',
                }}
                initial={{ y: 60, opacity: 0, rotateY: 90 }}
                animate={{ y: 0, opacity: 1, rotateY: 0 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
              >
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              </motion.div>
            )}

            {/* Prize name */}
            <motion.h2
              className="text-5xl font-black text-gold-gradient"
              initial={{ y: 40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', bounce: 0.4 }}
            >
              {name}
            </motion.h2>

            {/* Prize value */}
            {parseFloat(String(value)) > 0 && (
              <motion.div
                className="glass rounded-2xl px-10 py-4"
                initial={{ y: 30, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', bounce: 0.3 }}
              >
                <span className="text-3xl font-bold text-gold">
                  {typeof value === 'number' ? value.toLocaleString('ar-SA') : parseFloat(String(value)).toLocaleString('ar-SA')} ريال
                </span>
              </motion.div>
            )}

            {/* Celebration text */}
            <motion.p
              className="text-3xl text-correct font-black"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [0, 1.3, 1] }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              🎉 مبروك! 🎉
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
