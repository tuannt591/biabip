'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconCamera, IconCameraOff } from '@tabler/icons-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

const QRScanner = ({ onScanSuccess, onScanError }: QRScannerProps) => {
  const { t } = useLanguage();
  const scannerRef = useRef<Html5Qrcode | null>(null);
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
      await scannerRef.current.stop();
      scannerRef.current = null;
    }

    const scanner = new Html5Qrcode('qr-scanner');
    scannerRef.current = scanner;

    try {
      // Thử lấy danh sách cameras trước
      const cameras = await Html5Qrcode.getCameras();
      console.log('Available cameras:', cameras);

      // Sử dụng camera đầu tiên có sẵn
      const cameraId = cameras.length > 0 ? cameras[1].id : 'environment';

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: {
            width: 300,
            height: 300
          },
          aspectRatio: 1.0
        },
        (decodedText: string) => {
          // QR code scan success
          onScanSuccess(decodedText);
          stopScanner();
        },
        () => {
          // QR code scan error - usually means no QR code found
        }
      );
      setIsScanning(true);
    } catch (error) {
      console.error('Camera start error:', error);
      onScanError?.(t('camera.startError') || 'Không thể khởi động camera');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
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
    <div className='w-full'>
      <div className='relative min-h-[300px] w-full'>
        <div
          id='qr-scanner'
          className={`absolute top-0 left-0 h-full w-full ${isScanning ? 'visible' : 'invisible'}`}
          style={{ minHeight: '300px', maxWidth: '100%' }}
        />

        <div
          className={`absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center ${isScanning ? 'invisible' : 'visible'}`}
        >
          <div>
            <IconCamera className='mx-auto mb-4 h-16 w-16 text-gray-400' />
            <p className='text-sm text-gray-600'>
              {t('qrScanner.clickToStart') ||
                'Nhấn nút bên dưới để bắt đầu quét QR'}
            </p>
          </div>
        </div>
      </div>

      <div className='mt-6 flex items-center justify-center'>
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
      </div>
    </div>
  );
};

export default QRScanner;
