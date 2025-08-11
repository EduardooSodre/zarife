'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface HoverCardProps {
  children: ReactNode
  className?: string
  hoverScale?: number
  hoverY?: number
  tapScale?: number
}

export function HoverCard({
  children,
  className = '',
  hoverScale = 1.02,
  hoverY = -8,
  tapScale = 0.98
}: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        scale: hoverScale, 
        y: hoverY,
        transition: { 
          duration: 0.3, 
          ease: "easeOut" 
        }
      }}
      whileTap={{ 
        scale: tapScale,
        transition: { 
          duration: 0.1 
        }
      }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingButtonProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FloatingButton({
  children,
  className = '',
  delay = 0
}: FloatingButtonProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay,
      }}
      whileHover={{
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  distance?: number
}

export function RevealOnScroll({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  distance = 50
}: RevealOnScrollProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, y: 0 }
      case 'right':
        return { x: distance, y: 0 }
      case 'down':
        return { x: 0, y: -distance }
      default: // up
        return { x: 0, y: distance }
    }
  }

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...getInitialPosition()
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
