/* eslint-disable @typescript-eslint/no-unused-vars */
// app/create/page.tsx - UPDATED
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateLink() {
  const [originalUrl, setOriginalUrl] = useState('https://www.google.com/search?q=example')
  const [customSlug, setCustomSlug] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [actualLink, setActualLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const createShortLink = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: `${originalUrl}/${customSlug}`,
          customSlug: customSlug || undefined
        }),
      })

      const data = await response.json()

        if (data.success) {
        // Get the current domain from window.location
        const currentDomain = window.location.origin
        const displayUrl = `${currentDomain}/${data.slug}`
        
        console.log('Current domain:', currentDomain)
        console.log('Generated display URL:', displayUrl)
        
        setGeneratedLink(displayUrl)
        setActualLink(data.shortUrl)
        
        // Save to localStorage for dashboard
        const existingLinks = JSON.parse(localStorage.getItem('trackingLinks') || '[]')
        const newLink = {
          id: data.slug,
          originalUrl,
          shortUrl: data.shortUrl, // Actual tracking URL
          displayUrl: displayUrl,  // Fake display URL
          createdAt: new Date().toISOString()
        }
        localStorage.setItem('trackingLinks', JSON.stringify([...existingLinks, newLink]))
      } else {
        alert(data.message || 'Error creating link')
      }
    } catch (error) {
      alert('Error creating link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-purple-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">Create Short Link</h1>
          <p className="text-blue-100 mb-8">Create a shortened URL that tracks detailed analytics</p>

          {!generatedLink ? (
            <form onSubmit={createShortLink} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Destination URL</label>
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://www.google.com/search?q=example"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-custom-link"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <p className="text-blue-200 text-sm mt-2">
                  Leave empty for auto-generated slug
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Short Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-500/20 border border-green-400 rounded-lg p-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Link Created Successfully!</h3>
                <p className="text-green-100">Your link looks like a real Google short URL!</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white font-medium mb-2">Your Short Link:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-black/20 border border-white/20 rounded text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink)
                      alert('Copied to clipboard!')
                    }}
                    className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-blue-200 text-xs mt-2">
                  🔗 This will redirect to: {originalUrl}
                </p>
              </div>

              {/* Test the link */}
              <div className="bg-blue-500/20 rounded-lg p-4">
                <p className="text-white mb-2">Test your link:</p>
                <a
                  href={actualLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50"
                >
                  Click to Test Redirect
                </a>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setGeneratedLink('')
                    setActualLink('')
                    setOriginalUrl('https://www.google.com/search?q=example')
                    setCustomSlug('')
                  }}
                  className="flex-1 bg-transparent border border-white text-white py-3 rounded-lg font-bold hover:bg-white/10"
                >
                  Create Another
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50"
                >
                  View Analytics
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}