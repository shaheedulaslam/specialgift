/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useEffect } from 'react'

export default function ClientTracker({ slug, redirectUrl }) {
  useEffect(() => {
    const collectAnalytics = async () => {
      try {
        const deviceInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          memory: navigator.deviceMemory || null,
          cores: navigator.hardwareConcurrency || null,
        }

        let batteryLevel = null
        if ('getBattery' in navigator) {
          const battery = await navigator.getBattery()
          batteryLevel = Math.round(battery.level * 100)
        }

        const screenResolution = `${screen.width}x${screen.height}`
        const connectionType = navigator.connection?.effectiveType || null
        const networkSpeed = navigator.connection?.downlink || null
        const referrer = document.referrer || 'direct'

        let location = null
        if (navigator.geolocation) {
          try {
            const pos = await new Promise((res, rej) =>
              navigator.geolocation.getCurrentPosition(res, rej, { timeout: 2000 })
            )
            location = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            }
          } catch (e) {
            location = null
          }
        }

        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            deviceInfo,
            batteryLevel,
            screenResolution,
            connectionType,
            networkSpeed,
            userAgent: navigator.userAgent,
            referrer,
            location,
          }),
        })
      } catch (err) {
        console.error('Analytics post failed:', err)
      } finally {
        window.location.href = redirectUrl
      }
    }

    collectAnalytics()
  }, [slug, redirectUrl])

  return (
    <div className="flex h-screen items-center justify-center text-gray-700">
      Redirecting...
    </div>
  )
}
