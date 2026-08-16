import { HeartIcon, SparklesIcon, UsersIcon } from '../icons'

const POINTS = [
  {
    icon: UsersIcon,
    title: 'Real people, not just a feed',
    body: "A membership places you in a small support circle with a peer lead looking out for you — never left to scroll alone with what you're going through.",
    tint: '#7FB3CC',
  },
  {
    icon: HeartIcon,
    title: 'A lead who actually knows you',
    body: 'Every circle has a peer support lead checking in and looking out for its members — not an algorithm, an actual person.',
    tint: '#E888A0',
  },
  {
    icon: SparklesIcon,
    title: 'Built to grow with you',
    body: 'Circles and a support feed today — more mental health resources and community tools are on the way.',
    tint: '#8FAE86',
  },
]

export function Introduction() {
  return (
    <section id="about" className="bg-[#FFFDF9] px-4 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-body text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
          What is Haven Circle?
        </h2>
        <p className="font-body mt-4 text-[15px] leading-relaxed text-[#4B5A73]">
          We're a peer-support community built around mental health awareness. Subscribe to get
          placed in a small circle of people who get it, with a peer support lead looking out for
          you. Want a comfort box without joining a circle? The Goodie Box is a separate one-time
          purchase — no subscription needed.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, body, tint }) => (
          <div
            key={title}
            className="stationery-card rounded-2xl px-6 pt-7 pb-6"
            style={{ borderColor: `${tint}55` }}
          >
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${tint}26`, color: '#2C4870' }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-body mb-1.5 font-bold text-[#2C4870]">{title}</h3>
            <p className="font-body text-sm text-[#4B5A73]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
