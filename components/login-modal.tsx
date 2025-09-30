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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative z-[10000] w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div 
          className="relative rounded-xl p-6 border bg-white shadow-2xl max-h-[80vh] overflow-auto"
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