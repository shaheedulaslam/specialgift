import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { slug } = params
    
    const { db } = await connectToDatabase()
    
    const analytics = await db.collection('analytics')
      .find({ slug })
      .sort({ timestamp: -1 })
      .toArray()

    const link = await db.collection('links').findOne({ slug })

    return NextResponse.json({
      success: true,
      data: analytics,
      link: link,
      total: analytics.length
    })

  } catch (error) {
    console.error('Link analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}