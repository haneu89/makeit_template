/**
 * @version 1.0.0
 * @date 2024-09-24
 * @author jinhyung
 * @description HTTP 헤더에서 기기 정보를 추출하는 유틸리티
 */

export interface DeviceInfo {
  platform: string;
  domain: string;
  appVersion?: string;
  osVersion?: string;
  deviceModel?: string;
  userAgent?: string;
}

export interface ParsedUserAgent {
  platform?: string;
  osVersion?: string;
  deviceModel?: string;
}

/**
 * User-Agent 문자열을 파싱하여 기기 정보 추출
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  if (!userAgent) return {};

  const ua = userAgent.toLowerCase();
  const result: ParsedUserAgent = {};

  // 플랫폼 감지
  if (ua.includes('android')) {
    result.platform = 'android';
    // Android 버전 추출 (Android 13, Android 12 등)
    const androidMatch = userAgent.match(/Android\s+([0-9.]+)/i);
    if (androidMatch) result.osVersion = androidMatch[1];

    // 안드로이드 기기 모델 추출
    const modelMatch = userAgent.match(/\)\s+([A-Z0-9-]+)/);
    if (modelMatch) result.deviceModel = modelMatch[1];
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    result.platform = ua.includes('ipad') ? 'ios_tablet' : 'ios';
    // iOS 버전 추출 (CPU iPhone OS 16_0 like Mac OS X)
    const iosMatch = userAgent.match(/OS\s+([0-9_]+)/i);
    if (iosMatch) result.osVersion = iosMatch[1].replace(/_/g, '.');

    // iPhone 모델 추출은 복잡하므로 기본값 사용
    result.deviceModel = ua.includes('ipad') ? 'iPad' : 'iPhone';
  } else if (ua.includes('windows')) {
    result.platform = 'web';
    result.osVersion = 'Windows';
  } else if (ua.includes('mac')) {
    result.platform = 'web';
    result.osVersion = 'macOS';
  } else if (ua.includes('linux')) {
    result.platform = 'web';
    result.osVersion = 'Linux';
  } else {
    result.platform = 'web';
  }

  return result;
}

/**
 * HTTP 헤더들로부터 종합적인 기기 정보 추출
 * 우선순위: 명시적 헤더 → User-Agent 파싱 → 기본값
 */
export function extractDeviceInfo(headers: Record<string, string>): DeviceInfo {
  const userAgent = headers['user-agent'] || '';
  const parsedUA = parseUserAgent(userAgent);

  // 기본 정보
  const deviceInfo: DeviceInfo = {
    platform: 'unknown',
    domain: 'unknown',
    userAgent,
  };

  // 1순위: 명시적 커스텀 헤더
  if (headers['x-platform']) {
    deviceInfo.platform = headers['x-platform'];
  } else if (parsedUA.platform) {
    // 2순위: User-Agent에서 파싱
    deviceInfo.platform = parsedUA.platform;
  }

  if (headers['x-app-domain']) {
    deviceInfo.domain = headers['x-app-domain'];
  } else {
    // 기본 도메인 설정 (환경변수나 설정에서 가져올 수 있음)
    deviceInfo.domain = process.env.DEFAULT_APP_DOMAIN || 'default';
  }

  // 추가 정보
  deviceInfo.appVersion = headers['x-app-version'] || undefined;
  deviceInfo.osVersion = headers['x-os-version'] || parsedUA.osVersion || undefined;
  deviceInfo.deviceModel = headers['x-device-model'] || parsedUA.deviceModel || undefined;

  return deviceInfo;
}

/**
 * 기기별 고유 UUID 생성 (임시용)
 * 실제로는 클라이언트에서 생성해서 보내는 것이 좋음
 */
export function generateDeviceUuid(userId: number, deviceInfo: DeviceInfo): string {
  // 실제 디바이스 UUID가 없는 경우 임시로 생성
  const timestamp = Date.now();
  return `temp_${userId}_${deviceInfo.platform}_${timestamp}`;
}