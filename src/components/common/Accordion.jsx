import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
export default function Accordion({ items }) {
  const [open, setOpen] = useState(0)
  return <div className="divide-y divide-linen border-y border-linen">{items.map((item, i) => <div key={item.question}>
    <button className="flex w-full items-center justify-between py-5 text-left font-semibold" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{item.question}<ChevronDown className={`h-4 w-4 transition ${open === i ? 'rotate-180' : ''}`} /></button>
    {open === i && <p className="max-w-2xl pb-5 text-sm leading-7 text-black/65">{item.answer}</p>}
  </div>)}</div>
}
