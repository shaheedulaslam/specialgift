/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [activeTab, setActiveTab] = useState('create')

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-purple-700">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">🔗 URLTracker</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Advanced URL Shortener with Analytics
        </h1>
        <p className="text-xl text-blue-100 mb-12">
          Create short links and track detailed analytics including location, device info, and more
        </p>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">📍</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Location Tracking</h3>
            <p className="text-blue-200">Get real-time location data of your visitors</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">📱</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Device Analytics</h3>
            <p className="text-blue-200">Track devices, browsers, and operating systems</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">🔋</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Advanced Metrics</h3>
            <p className="text-blue-200">Battery level, screen resolution, and more</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-x-4">
          <Link 
            href="/create"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Create Short Link
          </Link>
          <Link 
            href="/dashboard"
            className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  )
}