import { useEffect, useState } from 'react'

const TYPING_SPEED_MS = 55
const HOLD_MS = 4800
export const TYPEWRITER_FADE_MS = 500
const PAUSE_BEFORE_NEXT_MS = 300

type Phase = 'typing' | 'holding' | 'fading' | 'paused'

export function useTypewriter(phrases: string[]) {
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [text, setText] = useState(reducedMotion ? phrases[0] : '')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (reducedMotion) return
    const current = phrases[phraseIndex]

    if (phase === 'typing') {
      if (text.length < current.length) {
        const timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPING_SPEED_MS)
        return () => clearTimeout(timeout)
      }
      setPhase('holding')
      return
    }

    if (phase === 'holding') {
      const timeout = setTimeout(() => setPhase('fading'), HOLD_MS)
      return () => clearTimeout(timeout)
    }

    if (phase === 'fading') {
      setVisible(false)
      const timeout = setTimeout(() => setPhase('paused'), TYPEWRITER_FADE_MS)
      return () => clearTimeout(timeout)
    }

    // paused — text is already faded out; swap to the next phrase and snap back to
    // visible (no fade-in — only the exit fades, typing back in should look instant)
    const timeout = setTimeout(() => {
      setText('')
      setPhraseIndex((i) => (i + 1) % phrases.length)
      setVisible(true)
      setPhase('typing')
    }, PAUSE_BEFORE_NEXT_MS)
    return () => clearTimeout(timeout)
  }, [text, phase, phraseIndex, phrases, reducedMotion])

  return { text, visible, reducedMotion, isFading: phase === 'fading' || phase === 'paused' }
}
