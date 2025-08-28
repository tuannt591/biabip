'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const QrCodeScanner = ({
  onScanSuccess,
  onScanFailure = () => {}
}: QrCodeScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((error) => {
        console.error('Failed to clear html5-qrcode-scanner.', error);
      });
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id='qr-reader' />;
};

export default QrCodeScanner;
