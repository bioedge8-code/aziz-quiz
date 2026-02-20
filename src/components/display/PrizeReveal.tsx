'use client'

import { motion } from 'framer-motion'

type PrizeRevealProps = {
  name: string
  value: string | number
  imageUrl?: string | null
}

export default function PrizeReveal({ name, value, imageUrl }: PrizeRevealProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
    >
      {/* Spotlight ring */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {imageUrl && (
        <motion.div
          className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-gold/50 shadow-2xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </motion.div>
      )}

      <motion.h2
        className="text-5xl font-black text-gold-gradient"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {name}
      </motion.h2>

      {parseFloat(String(value)) > 0 && (
        <motion.div
          className="glass rounded-2xl px-10 py-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-3xl font-bold text-gold">
            {typeof value === 'number' ? value.toLocaleString('ar-SA') : parseFloat(String(value)).toLocaleString('ar-SA')} ريال
          </span>
        </motion.div>
      )}

      <motion.p
        className="text-2xl text-correct font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        مبروك! 🎉
      </motion.p>
    </motion.div>
  )
}
