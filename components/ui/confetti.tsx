"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ConfettiProps {
  isActive: boolean
  onComplete?: () => void
  className?: string
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  velocity: { x: number; y: number; rotation: number }
}

const COLORS = [
  "#f87171", // red
  "#fbbf24", // yellow
  "#34d399", // green
  "#60a5fa", // blue
  "#a78bfa", // purple
  "#f472b6", // pink
  "#10b981", // emerald
  "#f59e0b", // amber
]

export function Confetti({ isActive, onComplete, className }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!isActive) {
      setPieces([])
      return
    }

    // Create confetti pieces
    const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      velocity: {
        x: (Math.random() - 0.5) * 8,
        y: Math.random() * 3 + 2,
        rotation: (Math.random() - 0.5) * 10,
      },
    }))

    setPieces(newPieces)

    // Animate confetti
    const interval = setInterval(() => {
      setPieces((prev) =>
        prev.map((piece) => ({
          ...piece,
          x: piece.x + piece.velocity.x,
          y: piece.y + piece.velocity.y,
          rotation: piece.rotation + piece.velocity.rotation,
        }))
      )
    }, 50)

    // Stop animation after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setPieces([])
      onComplete?.()
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            backgroundColor: piece.color,
            transition: "all 0.05s linear",
          }}
        />
      ))}
    </div>
  )
}

// Hook for easy confetti usage
export function useConfetti() {
  const [isActive, setIsActive] = useState(false)

  const trigger = () => {
    setIsActive(true)
  }

  const stop = () => {
    setIsActive(false)
  }

  return { isActive, trigger, stop }
}
