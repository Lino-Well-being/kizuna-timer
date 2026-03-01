'use client';

import { Suspense } from 'react';
import TimerPageContent from './TimerPageContent';

// 動的レンダリングを強制（useSearchParamsを使用するため）
export const dynamic = 'force-dynamic';

export default function TimerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-pink-50">
          <div className="text-xl text-gray-600">読み込み中...</div>
        </div>
      }
    >
      <TimerPageContent />
    </Suspense>
  );
}
