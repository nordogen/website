export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={['mx-auto w-full max-w-[1240px] px-5 lg:px-14', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
