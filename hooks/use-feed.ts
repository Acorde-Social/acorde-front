"use client"

import { useState, useCallback } from 'react'
import { IFeedItem, getMockFeedItems, getMockStats } from '@/lib/mock-feed-data'

interface IStats {
  projects: number
  collaborations: number
  followers: number
  tracks: number
}

const initialValues: IStats = {
  projects: 0,
  collaborations: 0,
  followers: 0,
  tracks: 0
}

export function useFeed() {
  const [feedItems, setFeedItems] = useState<IFeedItem[]>([])
  const [stats, setStats] = useState<IStats>(initialValues)
  const [isLoading, setIsLoading] = useState(true)

  const loadFeed = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setFeedItems(getMockFeedItems())
      setStats(getMockStats())
      setIsLoading(false)
    }, 1000)
  }, [])

  return {
    feedItems,
    stats,
    isLoading,
    loadFeed
  }
}