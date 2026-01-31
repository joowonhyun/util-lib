'use client'

import { useActionState, useEffect } from 'react';
import { createPost } from './actions';
import { toast } from 'sonner';

export default function PostForm() {
  // state: 서버 액션의 리턴값, formAction: form에 연결할 함수, isPending: 로딩 상태
  const [state, formAction, isPending] = useActionState(createPost, null);

  // state(서버 응답)가 변할 때마다 토스트 실행
  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input name="title" />
      <button type="submit" disabled={isPending}>등록</button>
    </form>
  );
}
