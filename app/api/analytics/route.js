import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getDeviceInfo, getClientIP } from '@/lib/utils'

export async function POST(request) {
  try {
    const { slug, deviceInfo, batteryLevel, screenResolution, connectionType, networkSpeed, userAgent, referrer, location } = await request.json()
    
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const clientIP = getClientIP(request)
    
    // Get location from IP
    let ipLocation = null
    try {
      const locationResponse = await fetch(`http://ip-api.com/json/${clientIP}`)
      ipLocation = await locationResponse.json()
    } catch (error) {
      console.log('IP location fetch failed:', error)
    }

    // Enhanced device info
    const enhancedDeviceInfo = {
      ...deviceInfo,
      userAgent: userAgent,
      ...getDeviceInfo(userAgent)
    }

    // Create analytics record
    const analyticsData = {
      slug,
      ip: clientIP,
      deviceInfo: enhancedDeviceInfo,
      batteryLevel,
      screenResolution,
      connectionType,
      networkSpeed,
      referrer: referrer || 'direct',
      location: {
        ...ipLocation,
        gps: location // GPS coordinates if available
      },
      timestamp: new Date(),
      userAgent: userAgent
    }

    // Save to database
    await db.collection('analytics').insertOne(analyticsData)

    // Update link click count
    await db.collection('links').updateOne(
      { slug },
      { 
        $inc: { clicks: 1 }, 
        $set: { lastClicked: new Date() } 
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Analytics data saved successfully'
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    const { db } = await connectToDatabase()
    
    let query = {}
    if (slug) {
      query.slug = slug
    }

    const analytics = await db.collection('analytics')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({
      success: true,
      data: analytics,
      total: analytics.length
    })

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}