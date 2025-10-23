import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    const { db } = await connectToDatabase()
    
    let matchStage = {}
    if (slug) {
      matchStage.slug = slug
    }

    const stats = await db.collection('analytics').aggregate([
      { $match: matchStage },
      {
        $facet: {
          totalClicks: [{ $count: "count" }],
          devices: [
            { $group: { _id: "$deviceInfo.device", count: { $sum: 1 } } }
          ],
          browsers: [
            { $group: { _id: "$deviceInfo.browser", count: { $sum: 1 } } }
          ],
          countries: [
            { $group: { _id: "$location.country", count: { $sum: 1 } } }
          ],
          os: [
            { $group: { _id: "$deviceInfo.os", count: { $sum: 1 } } }
          ],
          hourly: [
            {
              $group: {
                _id: { $hour: "$timestamp" },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]).toArray()

    return NextResponse.json({
      success: true,
      stats: stats[0]
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}