'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { IFeedItem, PaginatedResponse } from '@/types/feed';

interface UsePaginatedFeedOptions {
  initialPage?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export function usePaginatedFeed(
  fetcher: (page: number, options: { pageSize: number; filters?: Record<string, any> }) => Promise<PaginatedResponse<IFeedItem>>,
  options: UsePaginatedFeedOptions = {}
) {
  const {
    initialPage = 1,
    pageSize = 10,
    filters,
    enabled = true
  } = options;

  const [items, setItems] = useState<IFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const currentPageRef = useRef(initialPage);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !enabled) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await fetcher(currentPageRef.current, { pageSize, filters });

      setItems(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = response.items.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });

      setHasMore(response.hasNextPage);
      currentPageRef.current = response.nextPage || currentPageRef.current;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar feed'));
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetcher, pageSize, filters, enabled, hasMore]);

  const refresh = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
    currentPageRef.current = 1;
    isLoadingRef.current = false;
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (enabled && items.length === 0) {
      loadMore();
    }
  }, [enabled, items.length, loadMore]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    isEmpty: items.length === 0 && !loading && !error
  };
}
