'use client';

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body>
        <h2>Đã xảy ra lỗi không xác định.</h2>
        <pre style={{ color: 'red' }}>{error?.message}</pre>
      </body>
    </html>
  );
}
