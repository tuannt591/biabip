'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconCamera, IconCameraOff } from '@tabler/icons-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

const QRScanner = ({ onScanSuccess, onScanError }: QRScannerProps) => {
  const { t } = useLanguage();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startScanner = async () => {
    try {
      // Kiểm tra quyền camera trước
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
      onScanError?.(
        t('camera.permissionDenied') || 'Không có quyền truy cập camera'
      );
      return;
    }

    if (scannerRef.current) {
      await scannerRef.current.clear();
      scannerRef.current = null;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-scanner',
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: false, // Don't remember last camera to always prefer rear
        formatsToSupport: [0], // QR Code format
        videoConstraints: {
          facingMode: { ideal: 'environment' } // Prefer rear camera
        }
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText: string) => {
        // QR code scan success
        onScanSuccess(decodedText);
        stopScanner();
      },
      () => {
        // QR code scan error - usually means no QR code found, so we don't show this as error
        // This is expected when no QR code is in view
      }
    );

    setIsScanning(true);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch {
        // Error stopping scanner, ignore
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div
        id='qr-scanner'
        className={`w-full ${isScanning ? '' : 'hidden'}`}
        style={{ minHeight: '300px' }}
      />

      {!isScanning && (
        <div className='flex flex-col items-center space-y-4'>
          <div className='aspect-square w-full max-w-sm rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center'>
            <IconCamera className='mx-auto mb-4 h-16 w-16 text-gray-400' />
            <p className='text-sm text-gray-600'>
              {t('qrScanner.clickToStart') ||
                'Nhấn nút bên dưới để bắt đầu quét QR'}
            </p>
          </div>
        </div>
      )}

      <Button
        variant={isScanning ? 'destructive' : 'default'}
        onClick={isScanning ? stopScanner : startScanner}
        className='flex items-center gap-2'
        disabled={hasPermission === false}
      >
        {isScanning ? (
          <>
            <IconCameraOff className='h-4 w-4' />
            {t('common.stop') || 'Dừng quét'}
          </>
        ) : (
          <>
            <IconCamera className='h-4 w-4' />
            {t('common.start') || 'Bắt đầu quét'}
          </>
        )}
      </Button>

      {hasPermission === false && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
          <p className='text-sm text-red-800'>
            ⚠️ <strong>Không có quyền camera:</strong>
            <br />• Vui lòng cấp quyền camera trong cài đặt trình duyệt
            <br />• Tải lại trang sau khi cấp quyền
          </p>
        </div>
      )}

      <div className='max-w-sm text-center text-sm text-gray-600'>
        <p>
          {isScanning
            ? 'Hướng camera vào mã QR để quét. Mã QR sẽ được nhận diện tự động.'
            : 'Đảm bảo mã QR được chiếu sáng tốt và camera có thể nhìn rõ.'}
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
