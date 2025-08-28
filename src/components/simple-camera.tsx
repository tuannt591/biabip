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

      // Thử các constraint khác nhau cho mobile
      const constraints = [
        // Ưu tiên camera sau cho mobile
        {
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          }
        },
        // Fallback với ideal
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 }
          }
        },
        // Fallback cơ bản
        {
          video: {
            facingMode: 'environment'
          }
        },
        // Fallback cuối - bất kỳ camera nào
        {
          video: true
        }
      ];

      let stream: MediaStream | null = null;

      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break; // Thành công, thoát khỏi loop
        } catch (error) {
          // Constraint failed, trying next one
          continue; // Thử constraint tiếp theo
        }
      }

      if (!stream) {
        onError('Không thể khởi động camera với bất kỳ cài đặt nào');
        return;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Đợi video load xong
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve(true);
          }
        });

        setIsStreaming(true);
      }
    } catch (error) {
      const err = error as Error;
      let errorMsg = 'Không thể khởi động camera';

      if (err.name === 'NotAllowedError') {
        errorMsg =
          'Không có quyền truy cập camera. Vui lòng cấp quyền và tải lại trang.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'Không tìm thấy camera trên thiết bị';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera đang được sử dụng bởi ứng dụng khác';
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'Camera không hỗ trợ cài đặt yêu cầu';
      } else {
        errorMsg = 'Lỗi camera: ' + err.message;
      }

      onError(errorMsg);
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
            : 'Nhấn Start để khởi động camera'}
        </p>

        {!isStreaming && (
          <div className='text-muted-foreground max-w-xs text-center text-xs'>
            <p className='mb-1'>
              <strong>Nếu camera không hoạt động:</strong>
            </p>
            <ul className='space-y-1 text-left'>
              <li>• Kiểm tra quyền camera</li>
              <li>• Tải lại trang</li>
              <li>• Đóng ứng dụng camera khác</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCamera;
