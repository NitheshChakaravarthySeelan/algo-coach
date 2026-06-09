import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  index?: number
}

export function Card({ children, className = '', hover = true, index = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${hover ? 'glass-card-hover' : 'glass-card'} p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
