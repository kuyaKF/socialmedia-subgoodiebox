/*
 * Shared hero background — the photo layer plus a diagonal palette-tinted
 * wash — used by both the homepage Hero and any other surface that wants
 * the same treatment (currently LoginPage). Extracted so the two don't
 * drift out of sync.
 */
export function HeroBackground() {
  return (
    <>
      {/* Photo layer — a poppy/wheat field (Unsplash, Enrico Bet) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/enrico-bet-IicyiaPYGGI-unsplash.jpg')" }}
      />
      {/* Diagonal, semi-transparent tint — ink in one corner warming to blush in the
          other, photo showing through clearly in between — for a bit of styled depth
          without reintroducing the animated wash. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-[#2C4870]/45 via-transparent to-[#E888A0]/25"
      />
    </>
  )
}
