"use client"

import { useState, useEffect } from 'react'
import { fetchPaginatedFeed, getMockStats } from '@/lib/mock-feed-data'
import { usePaginatedFeed } from './use-paginated-feed'

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

export function useFeed(enabled: boolean = true) {
  const result = usePaginatedFeed(fetchPaginatedFeed, { enabled });
  const [stats, setStats] = useState(initialValues)
  const isInitialLoading = result.loading && result.items.length === 0
  const isLoadingMore = result.loading && result.items.length > 0

  useEffect(() => {
    setStats(getMockStats())
  }, [])

  return {
    feedItems: result.items,
    stats: stats,
    isLoading: result.loading,
    isInitialLoading,
    isLoadingMore,
    hasMore: result.hasMore,
    loadMore: result.loadMore
  }
}
