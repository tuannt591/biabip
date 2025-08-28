'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconCamera, IconCameraOff } from '@tabler/icons-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimpleCameraProps {
  onError: (error: string) => void;
}

const SimpleCamera = ({ onError }: SimpleCameraProps) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError('Trình duyệt không hỗ trợ camera');
        return;
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 640 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        onError(
          'Không có quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.'
        );
      } else if (err.name === 'NotFoundError') {
        onError('Không tìm thấy camera trên thiết bị');
      } else {
        onError('Không thể khởi động camera: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-black'>
        <video
          ref={videoRef}
          className='h-full w-full object-cover'
          playsInline
          muted
          autoPlay
        />

        {!isStreaming && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
            <IconCameraOff className='h-16 w-16 text-white/70' />
          </div>
        )}
      </div>

      <div className='flex flex-col items-center space-y-2'>
        <Button
          variant={isStreaming ? 'destructive' : 'default'}
          size='sm'
          onClick={isStreaming ? stopCamera : startCamera}
          className='flex items-center gap-2'
        >
          {isStreaming ? (
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

        <p className='text-muted-foreground max-w-xs text-center text-sm'>
          {isStreaming
            ? 'Camera đang hoạt động. Nhập ID bàn thủ công bên dưới.'
            : 'Camera không khả dụng. Vui lòng nhập ID bàn thủ công.'}
        </p>
      </div>
    </div>
  );
};

export default SimpleCamera;
