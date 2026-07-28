import { Link } from 'react-router-dom'

export default function Button({ to, variant = 'dark', className = '', children, ...props }) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-wide transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${variant === 'outline' ? 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-white dark:border-goldSoft dark:text-white' : 'bg-gradient-to-r from-gold to-goldSoft text-white shadow-gold hover:brightness-105'} ${className}`
  return to ? <Link className={classes} to={to}>{children}</Link> : <button className={classes} {...props}>{children}</button>
}
