import { ProjectService } from "@/services/project-service"
import { API_URL } from "@/lib/api-config"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock fetch
global.fetch = jest.fn()

describe("ProjectService", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe("getProjects", () => {
    it("should fetch projects with no filters", async () => {
      const mockProjects = [{ id: "1", title: "Test Project" }]

      // Mock da resposta do fetch
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      })

      const result = await ProjectService.getProjects()

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/projects`, {
        headers: { "Content-Type": "application/json" },
      })
      expect(result).toEqual(mockProjects)
    })

    it("should fetch projects with filters", async () => {
      const mockProjects = [{ id: "1", title: "Test Project" }]
      const filters = { genre: "Rock", minBpm: 100, maxBpm: 120 }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      })

      const result = await ProjectService.getProjects(filters)

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/projects?genre=Rock&minBpm=100&maxBpm=120`, {
        headers: { "Content-Type": "application/json" },
      })
      expect(result).toEqual(mockProjects)
    })

    it("should handle API errors", async () => {
      const errorMessage = "API Error"
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      })

      await expect(ProjectService.getProjects()).rejects.toThrow(errorMessage)
    })
  })

  describe("getProjectById", () => {
    it("should fetch a project by ID", async () => {
      const mockProject = { id: "1", title: "Test Project" }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      })

      const result = await ProjectService.getProjectById("1")

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/projects/1`, {
        headers: { "Content-Type": "application/json" },
      })
      expect(result).toEqual(mockProject)
    })

    it("should include auth token when provided", async () => {
      const mockProject = { id: "1", title: "Test Project" }
      const token = "test-token"
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      })

      await ProjectService.getProjectById("1", token)

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/projects/1`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    })
  })

  describe("createProject", () => {
    it("should create a new project", async () => {
      const projectData = {
        title: "New Project",
        genre: "Rock",
        key: "C Major",
        bpm: 120,
        neededInstruments: ["Guitar"],
      }

      const mockResponse = { id: "1", ...projectData }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await ProjectService.createProject(projectData, "test-token")

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(projectData),
      })
      expect(result).toEqual(mockResponse)
    })
  })
})

