export default function LoadingScreen({ label = 'Préparation de votre expérience' }) {
  return (
    <div className="fixed inset-0 z-[100] grid min-h-screen place-items-center bg-ivory px-6 text-center dark:bg-[#17140f]" role="status" aria-live="polite">
      <div>
        <div className="relative mx-auto h-24 w-24">
          <span className="absolute inset-0 rounded-full border border-gold/20" />
          <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-r-gold border-t-gold" />
          <span className="absolute inset-5 animate-[spin_1.6s_linear_infinite_reverse] rounded-full border border-transparent border-b-goldSoft border-l-goldSoft" />
          <span className="absolute inset-8 grid place-items-center rounded-full bg-gold font-display text-sm font-semibold text-white shadow-[0_8px_25px_rgba(179,138,44,.35)]">TK</span>
        </div>
        <p className="mt-6 font-display text-2xl">TK SHOP</p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[.24em] text-gold">{label}</p>
        <span className="mx-auto mt-5 block h-px w-24 overflow-hidden bg-gold/15">
          <span className="block h-full w-1/2 animate-pulse bg-gold" />
        </span>
      </div>
      <span className="sr-only">Chargement en cours</span>
    </div>
  )
}
