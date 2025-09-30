'use client';

import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AgeVerificationModal({ isOpen, onConfirm, onCancel }: AgeVerificationModalProps) {
  const t = useTranslations('ageVerification');
  
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {t('title')}
        </h2>
        <p className="text-gray-600 mb-8 text-center text-lg">
          {t('question')}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {t('yes')}
          </button>
          <button
            onClick={onCancel}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {t('no')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}