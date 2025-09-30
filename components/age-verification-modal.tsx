'use client'

import { X } from "lucide-react"

interface AgeVerificationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function AgeVerificationModal({ isOpen, onConfirm, onCancel }: AgeVerificationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* 弹窗内容 */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div 
          className="relative rounded-xl p-6 backdrop-blur-md border bg-white"
          style={{
            borderColor: 'rgba(0, 0, 0, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* 内容 */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              年龄确认
            </h3>
            <p className="text-gray-600 mb-6">
              您是否已满18周岁？
            </p>
            
            {/* 按钮组 */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                否
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                是
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}