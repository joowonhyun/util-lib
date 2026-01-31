// lib/api.ts

import { cookies } from 'next/headers';

let refreshPromise: Promise<string | null> | null = null;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  const baseUrl = 'https://api.your-server.com'; // 실제 API 주소

  // 1. 요청 전송
  let response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // 2. 만약 401(Unauthorized)이 떴다면?
  if (response.status === 401) {
    const refreshToken = cookieStore.get('refreshToken')?.value;
    if (!refreshToken) throw new Error('No refresh token');

    // 3. 동시성 제어 (동시에 여러 요청이 와도 하나만 실행)
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const res = await fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) throw new Error('Refresh failed');

          const data = await res.json();
          const newToken = data.accessToken;

          // 새 토큰을 쿠키에 저장
          cookieStore.set('accessToken', newToken, { httpOnly: true, secure: true });
          return newToken;
        } catch (err) {
          return null;
        } finally {
          refreshPromise = null; // 완료 후 초기화
        }
      })();
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // 4. 새 토큰으로 재시도
      response = await fetch(`${baseUrl}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    }
  }

  return response;
}
