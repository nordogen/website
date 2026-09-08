import { serialize } from '@/lib/structured-data'

/**
 * One `<script type="application/ld+json">`. The payload is escaped by
 * `serialize`, so `dangerouslySetInnerHTML` here cannot break out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />
  )
}
