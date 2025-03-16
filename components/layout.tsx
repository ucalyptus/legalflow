"use client"

import React from 'react'
import LegalFlow from './legal-flow'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-white">
      <LegalFlow />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
} 