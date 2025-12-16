"use client"

import { useState, useCallback } from 'react'
import { FeedItem, getMockFeedItems, getMockStats } from '@/app/(app)/home/data/mock-feed-data'

interface Stats {
  projects: number
  collaborations: number
  followers: number
  tracks: number
}

export function useFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    collaborations: 0,
    followers: 0,
    tracks: 0
  })
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