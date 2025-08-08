// Configurações de animação para o projeto
export const animationConfig = {
  // Durações padrão
  durations: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.8,
    verySlow: 1.2
  },

  // Delays padrão
  delays: {
    none: 0,
    short: 0.1,
    medium: 0.3,
    long: 0.6
  },

  // Easing curves
  easing: {
    easeOut: [0.25, 0.46, 0.45, 0.94],
    easeIn: [0.4, 0.0, 1, 1],
    easeInOut: [0.4, 0.0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: { type: "spring", stiffness: 100, damping: 10 }
  },

  // Variantes de animação reutilizáveis
  variants: {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    },
    slideDown: {
      hidden: { opacity: 0, y: -30 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 30 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: -30 },
      visible: { opacity: 1, x: 0 }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    rotateIn: {
      hidden: { opacity: 0, rotate: -10 },
      visible: { opacity: 1, rotate: 0 }
    },
    container: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.3
        }
      }
    }
  },

  // Configurações de hover
  hover: {
    scale: 1.05,
    y: -5,
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // Configurações de tap
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

// Tipos TypeScript para melhor autocompletar
export type AnimationVariant = keyof typeof animationConfig.variants
export type EasingType = keyof typeof animationConfig.easing
export type DurationType = keyof typeof animationConfig.durations
export type DelayType = keyof typeof animationConfig.delays
