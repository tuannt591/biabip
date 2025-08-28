'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { IconCamera, IconCameraOff } from '@tabler/icons-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SimpleCamera from './simple-camera';

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const QrCodeScanner = ({
  onScanSuccess,
  onScanFailure
}: QrCodeScannerProps) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [useFallback, setUseFallback] = useState(false);

  const startScanning = useCallback(async () => {
    if (!qrScannerRef.current) return;

    try {
      await qrScannerRef.current.start();
      setIsScanning(true);
      setError('');
    } catch (error) {
      setError(t('messages.failedToStartCamera') || 'Failed to start camera');
      setIsScanning(false);
    }
  }, [t]);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) return;

      try {
        setIsInitializing(true);
        setError('');

        // Kiểm tra HTTPS
        const isSecure =
          window.location.protocol === 'https:' ||
          window.location.hostname === 'localhost';
        if (!isSecure) {
          setError('Camera chỉ hoạt động trên HTTPS hoặc localhost');
          setDebugInfo('Protocol: ' + window.location.protocol);
          return;
        }

        // Kiểm tra MediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Trình duyệt không hỗ trợ camera');
          setDebugInfo('MediaDevices API not supported');
          return;
        }

        // Yêu cầu quyền camera trước
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          stream.getTracks().forEach((track) => track.stop()); // Dừng stream tạm thời
          setDebugInfo('Camera permission granted');
        } catch (permissionError) {
          setError(
            'Không có quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.'
          );
          setDebugInfo(
            'Permission denied: ' + (permissionError as Error).message
          );
          return;
        }

        // Kiểm tra xem có camera không
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);

        if (!hasCamera) {
          // Thử liệt kê các thiết bị
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
              (device) => device.kind === 'videoinput'
            );
            setDebugInfo(`Found ${videoDevices.length} video devices`);

            if (videoDevices.length === 0) {
              setError('Không tìm thấy camera nào trên thiết bị');
            } else {
              setError('Có camera nhưng QrScanner không thể khởi tạo');
              setUseFallback(true); // Sử dụng fallback camera
            }
          } catch {
            setError('Không thể kiểm tra thiết bị camera');
          }
          return;
        }

        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            onScanSuccess(result.data);
          },
          {
            onDecodeError: () => {
              // Không hiển thị lỗi decode vì nó sẽ liên tục xuất hiện khi không có QR code
            },
            preferredCamera: 'environment', // Sử dụng camera sau nếu có
            highlightScanRegion: true,
            highlightCodeOutline: true
          }
        );

        qrScannerRef.current = qrScanner;
        setDebugInfo('QR Scanner initialized successfully');

        // Tự động bắt đầu scan
        await startScanning();
      } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown error';
        setError(
          t('messages.failedToInitializeCamera') ||
            'Failed to initialize camera'
        );
        setDebugInfo('Init error: ' + errorMessage);
        if (onScanFailure) {
          onScanFailure(error);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, [onScanSuccess, onScanFailure, startScanning, t]);

  const stopScanning = () => {
    if (!qrScannerRef.current) return;

    qrScannerRef.current.stop();
    setIsScanning(false);
  };

  if (isInitializing) {
    return (
      <div className='flex flex-col items-center space-y-4 p-6'>
        <IconCamera className='h-16 w-16 animate-pulse text-blue-600' />
        <p className='text-muted-foreground text-center'>
          Đang kiểm tra camera...
        </p>
      </div>
    );
  }

  if (!hasCamera) {
    return (
      <div className='flex flex-col items-center space-y-4 p-6'>
        <IconCameraOff className='text-muted-foreground h-16 w-16' />
        <p className='text-muted-foreground text-center'>
          {t('messages.noCameraFound') || 'No camera found on this device'}
        </p>
        {debugInfo && (
          <p className='text-muted-foreground rounded bg-gray-100 p-2 text-xs'>
            Debug: {debugInfo}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    // Nếu có lỗi nhưng vẫn có camera, hiển thị fallback camera
    if (useFallback) {
      return (
        <div className='flex flex-col items-center space-y-4'>
          <p className='mb-2 text-center text-sm text-amber-600'>
            QR Scanner không khả dụng, sử dụng camera thông thường:
          </p>
          <SimpleCamera onError={(err) => setError(err)} />
          <p className='text-muted-foreground text-center text-xs'>
            Vui lòng nhập ID bàn thủ công vào ô bên dưới
          </p>
        </div>
      );
    }

    return (
      <div className='flex flex-col items-center space-y-4 p-6'>
        <IconCameraOff className='text-destructive h-16 w-16' />
        <p className='text-destructive text-center text-sm'>{error}</p>
        {debugInfo && (
          <p className='text-muted-foreground max-w-xs rounded bg-gray-100 p-2 text-xs'>
            Debug: {debugInfo}
          </p>
        )}
        <Button variant='outline' onClick={startScanning}>
          {t('common.retry') || 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-black'>
        <video
          ref={videoRef}
          className='h-full w-full object-cover'
          playsInline
          muted
        />

        {/* Overlay hướng dẫn */}
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute inset-4 rounded-lg border-2 border-white/50'>
            <div className='absolute top-0 left-0 h-6 w-6 rounded-tl-lg border-t-2 border-l-2 border-blue-500'></div>
            <div className='absolute top-0 right-0 h-6 w-6 rounded-tr-lg border-t-2 border-r-2 border-blue-500'></div>
            <div className='absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-blue-500'></div>
            <div className='absolute right-0 bottom-0 h-6 w-6 rounded-br-lg border-r-2 border-b-2 border-blue-500'></div>
          </div>
        </div>
      </div>

      <div className='flex flex-col items-center space-y-2'>
        <div className='flex items-center gap-2'>
          <Button
            variant={isScanning ? 'destructive' : 'default'}
            size='sm'
            onClick={isScanning ? stopScanning : startScanning}
            className='flex items-center gap-2'
          >
            {isScanning ? (
              <>
                <IconCameraOff className='h-4 w-4' />
                {t('common.stop') || 'Stop'}
              </>
            ) : (
              <>
                <IconCamera className='h-4 w-4' />
                {t('common.start') || 'Start'}
              </>
            )}
          </Button>
        </div>

        <p className='text-muted-foreground max-w-xs text-center text-sm'>
          {isScanning
            ? t('messages.pointCameraToQR') ||
              'Point your camera at a QR code to scan'
            : t('messages.clickStartToScan') || 'Click start to begin scanning'}
        </p>
      </div>
    </div>
  );
};

export default QrCodeScanner;
