import { render, screen } from "@testing-library/react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Mock dos hooks
jest.mock("@/contexts/auth-context")
jest.mock("next/navigation")

describe("AuthGuard", () => {
  const mockUseAuth = useAuth as jest.Mock
  const mockUseRouter = useRouter as jest.Mock
  const mockPush = jest.fn()

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  it("should render children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test User", role: "COMPOSER" },
      isLoading: false,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    expect(screen.getByTestId("protected-content")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("should redirect to login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("should show loading state when authentication is in progress", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument() // Loader
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("should redirect when required role does not match", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test User", role: "MUSICIAN" },
      isLoading: false,
    })

    render(
      <AuthGuard requiredRole="COMPOSER">
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith("/")
  })
})

