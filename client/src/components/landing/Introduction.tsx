import { HeartIcon, SparklesIcon, UsersIcon } from '../icons'

const POINTS = [
  {
    icon: UsersIcon,
    title: 'Real people, not just a feed',
    body: "A membership places you in a small support circle with a peer lead looking out for you — never left to scroll alone with what you're going through.",
  },
  {
    icon: HeartIcon,
    title: 'A lead who actually knows you',
    body: "Every circle has a peer support lead checking in and looking out for its members — not an algorithm, an actual person.",
  },
  {
    icon: SparklesIcon,
    title: 'Built to grow with you',
    body: 'Circles and a support feed today — more mental health resources and community tools are on the way.',
  },
]

export function Introduction() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-4 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          What is Haven Circle?
        </h2>
        <p className="mt-4 text-slate-600">
          We're a peer-support community built around mental health awareness. Subscribe to get
          placed in a small circle of people who get it, with a peer support lead looking out for
          you. Want a comfort box without joining a circle? The Goodie Box is a separate one-time
          purchase — no subscription needed.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-slate-200 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1.5 font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
