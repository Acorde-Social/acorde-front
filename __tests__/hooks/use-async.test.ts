import { renderHook, act } from "@testing-library/react"
import { useAsync } from "@/hooks/use-async"

describe("useAsync", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAsync())

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBeFalsy()
    expect(result.current.error).toBeNull()
  })

  it("should initialize with provided initial data", () => {
    const initialData = { name: "Test" }
    const { result } = renderHook(() => useAsync({ initialData }))

    expect(result.current.data).toEqual(initialData)
  })

  it("should handle successful async function execution", async () => {
    const mockData = { success: true }
    const mockAsyncFn = jest.fn().mockResolvedValue(mockData)
    const onSuccess = jest.fn()

    const { result } = renderHook(() => useAsync({ onSuccess }))

    await act(async () => {
      await result.current.execute(mockAsyncFn)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.loading).toBeFalsy()
    expect(result.current.error).toBeNull()
    expect(onSuccess).toHaveBeenCalledWith(mockData)
  })

  it("should handle async function errors", async () => {
    const mockError = new Error("Test error")
    const mockAsyncFn = jest.fn().mockRejectedValue(mockError)
    const onError = jest.fn()

    const { result } = renderHook(() => useAsync({ onError }))

    await act(async () => {
      try {
        await result.current.execute(mockAsyncFn)
      } catch (error) {
        // Expected error
      }
    })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBeFalsy()
    expect(result.current.error).toEqual(mockError)
    expect(onError).toHaveBeenCalledWith(mockError)
  })

  it("should reset state correctly", async () => {
    const mockData = { success: true }
    const mockAsyncFn = jest.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useAsync())

    await act(async () => {
      await result.current.execute(mockAsyncFn)
    })

    expect(result.current.data).toEqual(mockData)

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBeFalsy()
    expect(result.current.error).toBeNull()
  })
})

