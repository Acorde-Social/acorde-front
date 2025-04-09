"use client"

import { useState, useCallback } from "react"

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  initialData?: T
}

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsync<T = any>(options: UseAsyncOptions<T> = {}) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: options.initialData || null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState((prevState) => ({ ...prevState, loading: true, error: null }))

      try {
        const data = await asyncFunction()
        setState({ data, loading: false, error: null })

        if (options.onSuccess) {
          options.onSuccess(data)
        }

        return data
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error(String(error))
        setState({ data: null, loading: false, error: errorObject })

        if (options.onError) {
          options.onError(errorObject)
        }

        throw errorObject
      }
    },
    [options.onSuccess, options.onError],
  )

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({
        data: options.initialData || null,
        loading: false,
        error: null,
      })
    }, [options.initialData]),
  }
}

