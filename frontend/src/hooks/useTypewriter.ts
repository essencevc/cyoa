"use client"

import { skip } from "node:test"
import { useState, useEffect, useCallback } from "react"

interface TypewriterOptions {
  startDelay?: number
  onComplete?: () => void
  skipAnimation?: boolean
}

export function useTypewriter(
  text: string, 
  options: TypewriterOptions = {},
  speed = 30
) {
  const { startDelay = 0, onComplete, skipAnimation = false } = options
  const [displayText, setDisplayText] = useState(skipAnimation ? text : "")
  const [isComplete, setIsComplete] = useState(skipAnimation)


  const reset = useCallback(() => {
    setDisplayText("")
    setIsComplete(false)
  }, [])

  const animate = useCallback(() => {
    let currentIndex = 0
    let timeoutId: NodeJS.Timeout

    const typeNextCharacter = () => {
      if(currentIndex > text.length) {
        return
      }

      setDisplayText(text.slice(0, currentIndex))
      
      
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        currentIndex++
        
        if (currentIndex <= text.length) {
          timeoutId = setTimeout(typeNextCharacter, speed)
        } else {
          setIsComplete(true)
          onComplete?.()
        }
      }
    }

    const initialTimeout = setTimeout(() => {
      typeNextCharacter()
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(initialTimeout)
    }
  }, [text, speed, startDelay])

  useEffect(() => {
    if (!skipAnimation) {
      
      reset()
      const cleanup = animate()
      return cleanup
    }
  }, [animate, reset, text, skipAnimation])

  return { text: displayText, isComplete, reset }
}
