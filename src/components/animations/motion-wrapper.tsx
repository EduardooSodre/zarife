'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
}

export function MotionWrapper({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  direction = 'up'
}: MotionWrapperProps) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
      scale: direction === 'scale' ? 0.8 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

export function MotionContainer({ children, className = '', staggerChildren = 0.1 }: {
  children: ReactNode
  className?: string
  staggerChildren?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function MotionCard({ children, className = '', delay = 0 }: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  )
}

export function MotionText({ children, className = '', delay = 0, size = 'normal' }: {
  children: ReactNode
  className?: string
  delay?: number
  size?: 'small' | 'normal' | 'large'
}) {
  const yOffset = size === 'large' ? 60 : size === 'normal' ? 40 : 20

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  )
}
