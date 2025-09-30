'use client'

import { useState } from "react"
import { X } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { SignupModal } from "@/components/signup-modal"
import { createPortal } from 'react-dom'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showSignupModal, setShowSignupModal] = useState(false)

  const handleShowSignup = () => {
    setShowSignupModal(true)
  }

  const handleCloseSignup = () => {
    setShowSignupModal(false)
  }

  if (!isOpen) return null

  const modal = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* 背景遮罩 - 模糊背景但不阻止页面滚动 */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ position: 'fixed' }}
      />
      
      {/* 弹窗内容 - 固定在视口中央 */}
      <div 
        className="fixed z-10 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '28rem',
          width: 'calc(100% - 2rem)'
        }}
      >
        <div 
          className="relative rounded-xl p-6 border bg-white shadow-2xl"
          style={{
            borderColor: 'rgba(0, 0, 0, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto'
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
            <LoginForm onShowSignup={handleShowSignup} />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {createPortal(modal, document.body)}
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={handleCloseSignup} 
      />
    </>
  )
}