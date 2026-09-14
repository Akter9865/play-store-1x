export interface DeviceInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isMobile: boolean;
  deviceType: 'android' | 'ios' | 'desktop';
  deviceName: string;
  browserName: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isAndroid: false,
      isIOS: false,
      isDesktop: true,
      isSafari: false,
      isChrome: false,
      isEdge: false,
      isMobile: false,
      deviceType: 'desktop',
      deviceName: 'Desktop Computer',
      browserName: 'Unknown Browser',
    };
  }

  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';

  // Check Android
  const isAndroid = /android/i.test(ua);

  // Check iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Check Mobile
  const isMobile = isAndroid || isIOS || /Mobi|Android/i.test(ua);

  // Check Desktop
  const isDesktop = !isMobile;

  // Check Browser
  const isEdge = /Edg\//.test(ua);
  const isChrome = /Chrome\//.test(ua) && !isEdge;
  const isSafari = /Safari\//.test(ua) && !isChrome && !isEdge;

  let deviceType: 'android' | 'ios' | 'desktop' = 'desktop';
  let deviceName = 'Computer';

  if (isAndroid) {
    deviceType = 'android';
    deviceName = 'Android Device';
  } else if (isIOS) {
    deviceType = 'ios';
    deviceName = /iPad/.test(ua) ? 'iPad' : 'iPhone';
  } else {
    deviceType = 'desktop';
    if (/Mac/.test(ua)) deviceName = 'Mac';
    else if (/Win/.test(ua)) deviceName = 'Windows PC';
    else deviceName = 'Computer';
  }

  let browserName = 'Browser';
  if (isChrome) browserName = 'Chrome';
  else if (isSafari) browserName = 'Safari';
  else if (isEdge) browserName = 'Edge';
  else if (/Firefox\//.test(ua)) browserName = 'Firefox';

  return {
    isAndroid,
    isIOS,
    isDesktop,
    isSafari,
    isChrome,
    isEdge,
    isMobile,
    deviceType,
    deviceName,
    browserName,
  };
}
