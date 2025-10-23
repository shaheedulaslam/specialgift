/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect } from "react";

export default function ClientTracker({
  slug,
  redirectUrl,
}: {
  slug: string;
  redirectUrl: string;
}) {
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
          }),
        });
      } catch (err) {
        console.error("Analytics post failed:", err);
      }
    };

    collectAnalytics();
  }, [slug]);

  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-black"
      style={{
        backgroundImage: "url(/monkey.gif)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
    />
  );
}
