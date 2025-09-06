'use client';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='vi'>
      <head>
        <title>Lỗi hệ thống - BiaBip</title>
        <meta
          name='description'
          content='Đã xảy ra lỗi hệ thống. Vui lòng thử lại.'
        />
        <meta name='robots' content='noindex,nofollow' />
      </head>
      <body className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='w-full max-w-md p-6 text-center'>
          <div className='mb-4 text-6xl'>😵</div>
          <h2 className='mb-2 text-2xl font-bold text-gray-900'>
            Oops! Có lỗi xảy ra
          </h2>
          <p className='mb-6 text-gray-600'>
            Đã xảy ra lỗi không mong muốn. Chúng tôi xin lỗi về sự bất tiện này.
          </p>
          <div className='space-y-3'>
            <button
              onClick={() => reset()}
              className='w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
            >
              Thử lại
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className='w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300'
            >
              Về trang chủ
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className='mt-6 text-left'>
              <summary className='cursor-pointer font-medium text-red-600'>
                Chi tiết lỗi (Development)
              </summary>
              <pre className='mt-2 overflow-auto rounded border bg-red-50 p-3 text-xs text-red-800'>
                {error?.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
