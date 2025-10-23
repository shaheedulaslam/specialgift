// app/api/test/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Test database connection
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    // Count documents
    const linksCount = await db.collection('links').countDocuments()
    const analyticsCount = await db.collection('analytics').countDocuments()
    
    return NextResponse.json({
      success: true,
      database: 'Connected',
      collections: collectionNames,
      counts: {
        links: linksCount,
        analytics: analyticsCount
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}