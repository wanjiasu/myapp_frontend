'use client'

import { useState } from "react"
import { X } from "lucide-react"
import { LoginForm } from "@/components/login-form"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div 
          className="relative rounded-xl p-6 backdrop-blur-md border bg-white"
          style={{
            borderColor: 'rgba(0, 0, 0, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* 登录表单 */}
          <div className="mt-2">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}