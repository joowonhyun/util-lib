// app/actions.ts
'use server'

import { fetchWithAuth } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  try {
    const response = await fetchWithAuth('/posts', {
      method: 'POST',
      body: JSON.stringify({https://github.com/joowonhyun/util-lib/tree/main
        title: formData.get('title'),
        content: formData.get('content'),
      }),
    });

    if (!response.ok) {
      // API 서버가 에러를 던졌을 때 처리
      const errorData = await response.json();
      return { success: false, message: errorData.message || "등록 실패" };
    }

    // 성공 시 데이터 캐시 갱신
    revalidatePath('/posts');
    return { success: true, message: "게시글이 성공적으로 등록되었습니다!" };

  } catch (error) {
    // 네트워크 에러 등 예외 처리
    return { success: false, message: "서버 연결에 실패했습니다." };
  }
}
