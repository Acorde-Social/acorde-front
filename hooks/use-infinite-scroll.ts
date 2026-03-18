'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100,
  rootMargin = '0px'
}: UseInfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    }, {
      threshold: 0.1,
      rootMargin: `${threshold}px ${rootMargin}`
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, onLoadMore, threshold, rootMargin]);

  return { lastElementRef };
}
