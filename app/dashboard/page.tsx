/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import MapView from "@/components/MapView";

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([]);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedLink]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load links from localStorage
      const savedLinks = JSON.parse(
        localStorage.getItem("trackingLinks") || "[]"
      );
      setLinks(savedLinks);

      // Load analytics from API
      const analyticsUrl = selectedLink
        ? `/api/analytics?slug=${selectedLink.id}&photos=true`
        : "/api/analytics?photos=true";

      const analyticsResponse = await fetch(analyticsUrl);
      const analyticsData = await analyticsResponse.json();

      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

      // Load stats from API
      const statsUrl = selectedLink
        ? `/api/analytics/stats?slug=${selectedLink.id}`
        : "/api/analytics/stats";

      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to localStorage
      const savedAnalytics = JSON.parse(
        localStorage.getItem("trackingAnalytics") || "[]"
      );
      setAnalytics(savedAnalytics);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalytics = async () => {
    if (confirm("Are you sure you want to clear all analytics data?")) {
      try {
        // Clear localStorage analytics
        localStorage.removeItem("trackingAnalytics");

        // If you have a backend API, you can call it here:
        // const response = await fetch('/api/analytics', { method: 'DELETE' })

        setAnalytics([]);
        setStats({});

        // Reload the data to reflect changes
        loadDashboardData();

        alert("Analytics data cleared successfully!");
      } catch (error) {
        console.error("Error clearing analytics:", error);
        alert("Error clearing analytics data");
      }
    }
  };

  const deleteLinkAnalytics = async (linkId: string) => {
    if (confirm("Are you sure you want to clear analytics for this link?")) {
      try {
        // Filter out analytics for this specific link
        const updatedAnalytics = analytics.filter((a) => a.slug !== linkId);

        // Update localStorage
        localStorage.setItem(
          "trackingAnalytics",
          JSON.stringify(updatedAnalytics)
        );

        setAnalytics(updatedAnalytics);

        // If selected link is the one being cleared, reset selection
        if (selectedLink && selectedLink.id === linkId) {
          setSelectedLink(null);
        }

        alert("Link analytics cleared successfully!");
      } catch (error) {
        console.error("Error clearing link analytics:", error);
        alert("Error clearing link analytics");
      }
    }
  };

  // Function to get device icon based on device type
  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case "mobile":
        return "📱";
      case "tablet":
        return "📟";
      case "desktop":
        return "💻";
      default:
        return "🖥️";
    }
  };

  // Function to get browser icon
  const getBrowserIcon = (browser: string) => {
    switch (browser?.toLowerCase()) {
      case "chrome":
        return "🌐";
      case "firefox":
        return "🦊";
      case "safari":
        return "🧭";
      case "edge":
        return "🔷";
      default:
        return "🌐";
    }
  };

  // Function to get battery status
  const getBatteryStatus = (level: number) => {
    if (level >= 80) return "🟢";
    if (level >= 20) return "🟡";
    return "🔴";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-gray-900 text-xl font-bold">
                📊 Analytics Dashboard
              </span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create New Link
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">🔗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {links.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">👆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Clicks
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Mobile Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    analytics.filter(
                      (a) => a.deviceInfo?.device?.toLowerCase() === "mobile"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 text-xl">🌍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    new Set(
                      analytics.map((a) => a.location?.country).filter(Boolean)
                    ).size
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {analytics.length > 0 && (
          <div className="mb-6 flex justify-end">
            <div className="flex space-x-3">
              {selectedLink && (
                <button
                  onClick={() => deleteLinkAnalytics(selectedLink.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Clear Link Analytics
                </button>
              )}
              <button
                onClick={deleteAnalytics}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Clear All Analytics
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Links List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Your Links
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {links.length}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {links.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No links created yet
                  </div>
                ) : (
                  links.map((link) => (
                    <div
                      key={link.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group relative ${
                        selectedLink?.id === link.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => setSelectedLink(link)}
                    >
                      {/* Delete button for individual link */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLinkAnalytics(link.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600 transition-all"
                        title="Clear analytics for this link"
                      >
                        🗑️
                      </button>

                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900 truncate flex-1">
                          {link.shortUrl}
                        </p>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded ml-2">
                          {analytics.filter((a) => a.slug === link.id).length}{" "}
                          clicks
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {link.originalUrl}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Analytics Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedLink
                      ? `Analytics for ${selectedLink.shortUrl}`
                      : "All Analytics Data"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {
                        analytics.filter(
                          (a) => !selectedLink || a.slug === selectedLink?.id
                        ).length
                      }{" "}
                      clicks
                    </span>
                    {analytics.length > 0 && selectedLink && (
                      <button
                        onClick={() => deleteLinkAnalytics(selectedLink.id)}
                        className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600 transition-colors"
                        title="Clear analytics for this link"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {analytics.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">📊</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Analytics Data Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Share your tracking links to start collecting data
                    </p>
                    <Link
                      href="/create"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
                    >
                      Create Your First Link
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {analytics
                      .filter(
                        (data) =>
                          !selectedLink || data.slug === selectedLink?.id
                      )
                      .map((data, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          {/* Header with basic info */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {getDeviceIcon(data.deviceInfo?.device)}{" "}
                                {data.deviceInfo?.device || "Unknown Device"}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(data.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {data.location?.gps?.lat &&
                              data.location?.gps?.lon && (
                                <div className="mt-4">
                                  <MapView
                                    lat={data.location.gps.lat}
                                    lon={data.location.gps.lon}
                                  />
                                </div>
                              )}
                          </div>

                          {data.photos && data.photos.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex justify-between items-center mb-2">
                                <p className="font-medium text-gray-500">
                                  📸 Captured Photos (
                                  {data.photoCount || data.photos.length})
                                </p>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {Math.round(
                                    (data.totalPhotoSize || 0) / 1024
                                  )}{" "}
                                  KB total
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {data.photos.map(
                                  (photo: string, idx: number) => (
                                    <img
                                      key={idx}
                                      src={photo}
                                      alt={`Captured ${idx + 1}`}
                                      className="rounded-lg border border-gray-300 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                      onClick={() => {
                                        const modal = window.open("", "_blank");
                                        if (modal) {
                                          modal.document.write(`
                <html>
                <head>
                  <title>Captured Photo ${idx + 1}</title>
                  <style>
                    body { background: #111; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    img { max-width: 95vw; max-height: 95vh; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
                  </style>
                </head>
                <body><img src="${photo}" /></body>
                </html>
              `);
                                        }
                                      }}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Camera status indicator */}
                          {!data.photos && data.cameraStatus && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                📷 Camera: {data.cameraStatus}
                                {data.cameraStatus === "failed" &&
                                  " - User denied camera access"}
                              </p>
                            </div>
                          )}

                          {/* Detailed Information Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            {/* Device Information */}
                            <div className="space-y-2">
                              <p className="font-medium text-gray-500">
                                Device Information
                              </p>
                              <div className="space-y-1">
                                <p className="text-gray-900">
                                  <span className="inline-block w-4">
                                    {getDeviceIcon(data.deviceInfo?.device)}
                                  </span>
                                  {data.deviceInfo?.device || "Unknown"}
                                </p>
                                <p className="text-gray-900">
                                  <span className="inline-block w-4">
                                    {getBrowserIcon(data.deviceInfo?.browser)}
                                  </span>
                                  {data.deviceInfo?.browser ||
                                    "Unknown Browser"}
                                </p>
                                <p className="text-gray-900">
                                  🖥️ {data.deviceInfo?.os || "Unknown OS"}
                                </p>
                                {data.deviceInfo?.vendor && (
                                  <p className="text-gray-900">
                                    🏷️ {data.deviceInfo.vendor}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Location & Network */}
                            <div className="space-y-2">
                              <p className="font-medium text-gray-500">
                                Location & Network
                              </p>
                              <div className="space-y-1">
                                <p className="text-gray-900">
                                  🌍 {data.location?.country || "Unknown"}
                                </p>
                                <p className="text-gray-900">
                                  🏙️ {data.location?.city || "Unknown"}
                                </p>
                                <p className="text-gray-900 font-mono text-xs">
                                  📡 {data.ip || "Unknown IP"}
                                </p>
                                {data.location?.isp && (
                                  <p className="text-gray-900">
                                    📶 {data.location.isp}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Hardware Info */}
                            <div className="space-y-2">
                              <p className="font-medium text-gray-500">
                                Hardware
                              </p>
                              <div className="space-y-1">
                                {data.batteryLevel && (
                                  <p className="text-gray-900">
                                    {getBatteryStatus(data.batteryLevel)}{" "}
                                    Battery: {data.batteryLevel}%
                                  </p>
                                )}
                                {data.screenResolution && (
                                  <p className="text-gray-900">
                                    📐 Screen: {data.screenResolution}
                                  </p>
                                )}
                                {data.deviceInfo?.cores && (
                                  <p className="text-gray-900">
                                    ⚙️ Cores: {data.deviceInfo.cores}
                                  </p>
                                )}
                                {data.deviceInfo?.memory && (
                                  <p className="text-gray-900">
                                    💾 RAM: {data.deviceInfo.memory}GB
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Connection Info */}
                            <div className="space-y-2">
                              <p className="font-medium text-gray-500">
                                Connection
                              </p>
                              <div className="space-y-1">
                                {data.connectionType && (
                                  <p className="text-gray-900">
                                    📶 {data.connectionType}
                                  </p>
                                )}
                                {data.networkSpeed && (
                                  <p className="text-gray-900">
                                    🚀 Speed: {data.networkSpeed}
                                  </p>
                                )}
                                {data.language && (
                                  <p className="text-gray-900">
                                    🗣️ Language: {data.language}
                                  </p>
                                )}
                                {data.timezone && (
                                  <p className="text-gray-900">
                                    🕐 Timezone: {data.timezone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Additional Details */}
                          {(data.userAgent || data.referrer) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {data.userAgent && (
                                  <div>
                                    <p className="font-medium text-gray-500">
                                      User Agent
                                    </p>
                                    <p className="text-gray-600 font-mono truncate">
                                      {data.userAgent}
                                    </p>
                                  </div>
                                )}
                                {data.referrer &&
                                  data.referrer !== "direct" && (
                                    <div>
                                      <p className="font-medium text-gray-500">
                                        Referrer
                                      </p>
                                      <p className="text-gray-600 truncate">
                                        {data.referrer}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
