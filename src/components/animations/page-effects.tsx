'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface PulseEffectProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export function PulseEffect({ children, className = '', intensity = 1.05 }: PulseEffectProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: intensity }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

interface BackgroundBlurProps {
  children: ReactNode
  className?: string
  isVisible: boolean
}

export function BackgroundBlur({ children, className = '', isVisible }: BackgroundBlurProps) {
  return (
    <motion.div
      className={className}
      animate={{
        backdropFilter: isVisible ? 'blur(8px)' : 'blur(0px)',
        backgroundColor: isVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

interface ShimmerEffectProps {
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function ShimmerEffect({ className = '', direction = 'horizontal' }: ShimmerEffectProps) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        background: direction === 'horizontal' 
          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
          : 'linear-gradient(0deg, transparent, rgba(255,255,255,0.4), transparent)',
      }}
      animate={{
        x: direction === 'horizontal' ? [-200, 200] : 0,
        y: direction === 'vertical' ? [-200, 200] : 0,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}
