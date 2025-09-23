'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface TelegramQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // 添加用户ID属性
}

export default function TelegramQRModal({ isOpen, onClose, userId }: TelegramQRModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  // 使用用户ID生成个性化链接，如果没有用户ID则使用默认值
  const telegramBotUrl = `https://t.me/betaione_bot?start=${userId || 'betaione'}`;

  useEffect(() => {
    if (isOpen) {
      // 生成二维码URL，使用免费的二维码API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(telegramBotUrl)}`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [isOpen, telegramBotUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">添加 Telegram 机器人</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* 二维码区域 */}
        <div className="text-center mb-6">
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            {qrCodeUrl && (
              <Image 
                src={qrCodeUrl} 
                alt="Telegram Bot QR Code" 
                className="w-48 h-48 mx-auto"
                width={192}
                height={192}
              />
            )}
          </div>
          <p className="text-white/80 text-sm mb-4">
            扫描二维码或点击下方按钮添加 Telegram 机器人
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="space-y-3">
          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            在 Telegram 中打开
          </a>
          
          <button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors border border-white/20"
          >
            取消
          </button>
        </div>

        {/* 说明文字 */}
        <div className="mt-4 text-xs text-white/60 text-center">
          <p>添加机器人后，您将收到来自 BetaOne 的通知和更新</p>
        </div>
      </div>
    </div>
  );
}