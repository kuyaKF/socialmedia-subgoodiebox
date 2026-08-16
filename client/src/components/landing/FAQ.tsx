import { useState } from 'react'
import { ChevronDownIcon } from '../icons'

const QUESTIONS = [
  {
    q: "What's the difference between a membership and the Goodie Box?",
    a: 'A membership subscribes you to a private support circle — a small group of people with a peer lead looking out for you. The Goodie Box is a separate, one-time ₱799 purchase of a physical comfort package; it does not include circle access and does not require a subscription.',
  },
  {
    q: 'Do I need a subscription to get a Goodie Box?',
    a: "No — the Goodie Box is open to anyone, whether or not you're on a paid plan. A subscription is only needed if you want to be part of a private community circle.",
  },
  {
    q: 'How do support circles work?',
    a: 'When you join, you land in an unassigned pool until we place you in a circle. Each circle has a peer support lead — a trained team member or admin — looking out for its members.',
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
    <section id="faq" className="bg-[#FFFDF9] px-4 py-20">
      <h2 className="font-body mb-10 text-center text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
        Frequently asked questions
      </h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {QUESTIONS.map((item, i) => {
          const isOpen = openIndex === i
          const isCrisisNote = item.q.toLowerCase().includes('crisis')
          return (
            <div
              key={item.q}
              className={`stationery-card overflow-hidden rounded-2xl transition-shadow duration-300 ${isOpen ? 'shadow-[0_16px_32px_rgba(44,72,112,0.18)]' : ''} ${isCrisisNote ? 'ring-2 ring-[#E888A0]/60' : ''}`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#2C4870]/5"
              >
                <span className="font-body text-sm font-bold text-[#2C4870]">{item.q}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 shrink-0 text-[#4B5A73] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`faq-panel ${isOpen ? 'is-open' : ''}`}>
                <div>
                  <p className="font-body px-5 pb-4 text-sm leading-relaxed text-[#4B5A73]">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
