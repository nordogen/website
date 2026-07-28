import { Logo } from '@/components/brand/Logo'

export default function TokenCheck() {
  return (
    <main className="p-8">
      <p className="bg-brand-teal text-surface p-4">teal on surface — šđčćž</p>
      <p className="text-brand-crimson">crimson — šđčćž</p>
      <div className="mt-8 flex flex-col gap-6">
        <Logo tagline="UROLOGIJA • GINEKOLOGIJA • REGENERACIJA" className="text-brand-teal" />
        <Logo tagline="UROLOGIJA • GINEKOLOGIJA • REGENERACIJA" className="text-brand-crimson" />
      </div>
    </main>
  )
}
