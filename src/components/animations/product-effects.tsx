'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface ProductCardEffectProps {
  children: ReactNode
  className?: string
  isOnSale?: boolean
  isOutOfStock?: boolean
}

export function ProductCardEffect({
  children,
  className = '',
  isOnSale = false,
  isOutOfStock = false
}: ProductCardEffectProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%', opacity: 0 }}
        animate={isHovered ? { x: '100%', opacity: 1 } : { x: '-100%', opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Status badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {isOnSale && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-red-500 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg"
          >
            Sale
          </motion.div>
        )}
        {isOutOfStock && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-500 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg"
          >
            Esgotado
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-5">
        {children}
      </div>

      {/* Shimmer effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  )
}

interface FilterAnimationProps {
  children: ReactNode
  isVisible: boolean
  animationType?: 'fade' | 'slide' | 'scale'
  delay?: number
}

export function FilterAnimation({
  children,
  isVisible,
  animationType = 'fade',
  delay = 0
}: FilterAnimationProps) {
  const getAnimationVariants = () => {
    switch (animationType) {
      case 'slide':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        }
      default: // fade
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
    }
  }

  return (
    <motion.div
      variants={getAnimationVariants()}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  )
}

interface CounterAnimationProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
}

export function CounterAnimation({ value, className = '', prefix = '', suffix = '' }: CounterAnimationProps) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {prefix}{value}{suffix}
    </motion.span>
  )
}
