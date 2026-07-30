import { useState } from 'react'
import { ChevronDownIcon } from '../icons'

const QUESTIONS = [
  {
    q: 'What exactly is the care package?',
    a: "A small box of comfort items — things like journals, teas, and gentle self-care goodies — shipped to your address each month (quarterly on Starter). Contents change often; it's a small surprise meant to land at the right time.",
  },
  {
    q: 'How do support circles work?',
    a: "When you join, you land in an unassigned pool until we place you in a circle. Each circle has a peer support lead — a trained team member or admin — looking out for its members.",
  },
  {
    q: 'Can I change my plan later?',
    a: 'Yes. You can change your plan from your dashboard at any time — no contracts, no cancellation fees.',
  },
  {
    q: 'Is my payment information required to sign up?',
    a: "No. Registering only needs an email and password. Payment is only needed if you choose a paid support plan, and it's processed securely by PayMongo — we never see or store your card details.",
  },
  {
    q: 'What if I want to leave?',
    a: "Cancel anytime from your subscription page. Your profile and circle stay put — you just stop being billed, and you're welcome back whenever you're ready.",
  },
  {
    q: "What if I'm in crisis right now?",
    a: 'Haven Circle is a peer-support and awareness community — it is not a crisis line or a substitute for professional care. If you or someone you know is in danger or needs immediate help, please contact the NCMH Crisis Hotline (1553, or 0966-351-4518 / 0917-899-8727) or your local emergency services right away.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">
        Frequently asked questions
      </h2>
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
        {QUESTIONS.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-slate-900">{item.q}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && <p className="px-5 pb-4 text-sm text-slate-600">{item.a}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
