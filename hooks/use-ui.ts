import { useState } from 'react'

export function useUI() {
  const [activeTab, setActiveTab] = useState('feed')
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  
  return {
    activeTab,
    setActiveTab,
    isPostModalOpen,
    setIsPostModalOpen
  }
}