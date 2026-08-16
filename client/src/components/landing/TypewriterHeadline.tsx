import { useTypewriter } from '../../hooks/useTypewriter'

/*
 * Renders inside a heading element owned by the caller (see Hero.tsx) —
 * the animated text is aria-hidden and a full static phrase is kept in a
 * sr-only span, so screen readers get one stable heading instead of
 * character-by-character typing noise or a cycling announcement.
 */
export function TypewriterHeadline({ phrases }: { phrases: string[] }) {
  const { text, visible, reducedMotion, isFading } = useTypewriter(phrases)

  return (
    <>
      {/*
        The `typewriter-fade` transition class is only applied while fading
        out (and while paused at opacity 0, right before the next phrase
        starts). It's removed again the instant the next phrase snaps back
        to visible, so that transition never fires — typing back in has no
        fade-in, only the exit fades.
      */}
      <span
        aria-hidden="true"
        className={!reducedMotion && isFading ? 'typewriter-fade' : undefined}
        style={reducedMotion ? undefined : { opacity: visible ? 1 : 0 }}
      >
        {text}
        {!reducedMotion && <span className="typewriter-caret" />}
      </span>
      <span className="sr-only">{phrases[0]}</span>
    </>
  )
}
