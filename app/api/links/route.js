// app/api/links/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { generateShortCode } from '@/lib/utils'

export async function POST(request) {
  try {
    const { originalUrl, customSlug } = await request.json()
    
    if (!originalUrl) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    let slug = customSlug || generateShortCode()
    
    const existingLink = await db.collection('links').findOne({ slug })
    if (existingLink) {
      if (customSlug) {
        return NextResponse.json(
          { success: false, message: 'Custom slug already exists' },
          { status: 400 }
        )
      }
      slug = generateShortCode()
    }

    const newLink = {
      slug,
      originalUrl,
      createdAt: new Date(),
      clicks: 0,
      lastClicked: null
    }

    await db.collection('links').insertOne(newLink)

    // Get the base URL from the request
    const requestHeaders = new Headers(request.headers)
    const origin = requestHeaders.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const shortUrl = `${origin}/${slug}`

    return NextResponse.json({
      success: true,
      slug,
      shortUrl: shortUrl,
      // Also return the slug separately for client-side construction
      slugOnly: slug
    })

  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}