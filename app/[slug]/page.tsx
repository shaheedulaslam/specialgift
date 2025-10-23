// app/[slug]/page.tsx
import ClientTracker from './client-tracker'
import { connectToDatabase } from '@/lib/db'

export default async function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params // ✅ await the params Promise

  const { db } = await connectToDatabase()
  const link = await db.collection('links').findOne({ slug })

  if (!link) {
    return <div>404 | Link not found</div>
  }

  return <ClientTracker slug={slug} redirectUrl={link.originalUrl} />
}
