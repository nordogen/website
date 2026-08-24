export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={['mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
