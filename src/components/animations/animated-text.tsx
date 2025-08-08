'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  size?: 'small' | 'normal' | 'large' | 'xl'
  variant?: 'slide' | 'fade' | 'typewriter' | 'wave'
}

export function AnimatedText({
  text,
  className = '',
  delay = 0,
  size = 'normal',
  variant = 'slide'
}: AnimatedTextProps) {
  const words = text.split(' ')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: variant === 'typewriter' ? 0.1 : 0.08,
        delayChildren: delay,
      },
    },
  }

  const getWordVariants = () => {
    switch (variant) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.6 } },
        }
      case 'typewriter':
        return {
          hidden: { opacity: 0, scale: 0 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { 
              duration: 0.3,
              type: "spring",
              stiffness: 100
            } 
          },
        }
      case 'wave':
        return {
          hidden: { opacity: 0, y: 20, rotateX: -90 },
          visible: { 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            transition: { 
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            } 
          },
        }
      default: // slide
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            } 
          },
        }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={getWordVariants()}
          className="inline-block mr-2"
          style={{ transformOrigin: 'center bottom' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

interface AnimatedLettersProps {
  text: string
  className?: string
  delay?: number
}

export function AnimatedLetters({
  text,
  className = '',
  delay = 0
}: AnimatedLettersProps) {
  const letters = Array.from(text)

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  }

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
          style={{ transformOrigin: 'center bottom' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}
