import { LogoMark } from './LogoMark'
import { LogoWordmark } from './LogoWordmark'

type Props = {
  tagline: string
  orientation?: 'stacked' | 'horizontal'
  className?: string
}

export function Logo({ tagline, orientation = 'horizontal', className }: Props) {
  const stacked = orientation === 'stacked'
  return (
    <span
      className={[
        'inline-flex items-center',
        stacked ? 'flex-col gap-2' : 'flex-row gap-2.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <LogoMark className={stacked ? 'block w-16' : 'block w-9 shrink-0'} />
      <span className={stacked ? 'flex flex-col items-center' : 'flex flex-col'}>
        <LogoWordmark className="block w-32" />
        <span className="mt-1 text-[0.5rem] uppercase tracking-[0.16em]">{tagline}</span>
      </span>
    </span>
  )
}
