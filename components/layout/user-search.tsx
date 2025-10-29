"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Music, Guitar, Loader2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn, fixImageUrl } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

interface SearchUser {
	id: string
	name: string
	email: string
	login: string
	role: "COMPOSER" | "MUSICIAN"
	avatarUrl: string | null
	city?: string
}

export function UserSearch() {
	const { token } = useAuth()
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [results, setResults] = useState<SearchUser[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const searchRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	// Fechar ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	// Buscar usuários
	useEffect(() => {
		const searchUsers = async () => {
			if (!query.trim() || query.length < 2) {
				setResults([])
				return
			}

			setIsLoading(true)
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${encodeURIComponent(query)}`,
					{
						headers: token ? { Authorization: `Bearer ${token}` } : {},
					}
				)

				if (response.ok) {
					const data = await response.json()
					setResults(data)
				}
			} catch (error) {
				console.error("Error searching users:", error)
			} finally {
				setIsLoading(false)
			}
		}

		const debounce = setTimeout(searchUsers, 300)
		return () => clearTimeout(debounce)
	}, [query, token])

	const handleOpen = () => {
		setIsOpen(true)
		setTimeout(() => inputRef.current?.focus(), 100)
	}

	const handleClose = () => {
		setIsOpen(false)
		setQuery("")
		setResults([])
	}

	return (
		<div ref={searchRef} className="relative">
			{/* Mobile: Botão de busca */}
			{!isOpen && (
				<Button
					variant="ghost"
					size="icon"
					onClick={handleOpen}
					className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-primary/5 md:hidden"
				>
					<Search className="h-4 w-4 sm:h-5 sm:w-5" />
					<span className="sr-only">Buscar usuários</span>
				</Button>
			)}

			{/* Desktop: Campo sempre visível (colapsado ou expandido) */}
			<div className="hidden md:flex items-center gap-2">
				{!isOpen ? (
					<Button
						variant="ghost"
						size="icon"
						onClick={handleOpen}
						className="h-10 w-10 hover:bg-primary/5"
					>
						<Search className="h-5 w-5" />
						<span className="sr-only">Buscar usuários</span>
					</Button>
				) : (
					<div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 w-64 lg:w-80">
						<Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
						<Input
							ref={inputRef}
							type="text"
							placeholder="Buscar usuários..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-7 px-0 text-sm"
						/>
						{isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClose}
							className="h-7 w-7 flex-shrink-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{/* Overlay mobile full-screen */}
			{isOpen && (
				<>
					<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] md:hidden" onClick={handleClose} />

					{/* Container mobile */}
					<div className="fixed inset-0 z-[101] bg-background p-4 md:hidden">
						<div className="relative bg-background border border-border rounded-lg shadow-lg overflow-hidden">
							<div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
								<Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
								<Input
									ref={inputRef}
									type="text"
									placeholder="Buscar músicos, compositores..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-0"
								/>
								{isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
								<Button
									variant="ghost"
									size="icon"
									onClick={handleClose}
									className="h-8 w-8 flex-shrink-0"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Resultados mobile */}
							<div className="max-h-[60vh] overflow-y-auto">
								{query.length >= 2 && !isLoading && results.length === 0 && (
									<div className="p-8 text-center text-muted-foreground">
										<Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
										<p className="text-sm">Nenhum usuário encontrado</p>
									</div>
								)}

								{results.length > 0 && (
									<div className="py-2">
										{results.map((user) => (
											<Link
												key={user.id}
												href={`/${user.login}`}
												onClick={handleClose}
												className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
											>
												<Avatar className="h-10 w-10 aspect-square">
													<AvatarImage
														src={fixImageUrl(user.avatarUrl || "")}
														alt={user.name}
														className="object-cover w-full h-full"
													/>
													<AvatarFallback className="text-sm">
														{user.name[0]?.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<p className="font-medium text-sm truncate">{user.name}</p>
														<Badge variant="outline" className="flex-shrink-0 h-5 px-1.5 text-xs">
															{user.role === "COMPOSER" ? (
																<>
																	<Music className="h-3 w-3 mr-1" />
																	Compositor
																</>
															) : (
																<>
																	<Guitar className="h-3 w-3 mr-1" />
																	Músico
																</>
															)}
														</Badge>
													</div>
													{user.city && (
														<p className="text-xs text-muted-foreground truncate">{user.city}</p>
													)}
												</div>
											</Link>
										))}
									</div>
								)}

								{query.length > 0 && query.length < 2 && (
									<div className="p-8 text-center text-muted-foreground">
										<p className="text-sm">Digite pelo menos 2 caracteres</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Dropdown desktop - resultados abaixo do campo */}
					{query.trim() && (
						<div className="hidden md:block absolute right-0 top-full mt-2 w-80 lg:w-96 bg-background border border-border rounded-lg shadow-xl overflow-hidden z-50">
							<div className="max-h-96 overflow-y-auto">
								{query.length >= 2 && !isLoading && results.length === 0 && (
									<div className="p-8 text-center text-muted-foreground">
										<Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
										<p className="text-sm">Nenhum usuário encontrado</p>
									</div>
								)}

								{results.length > 0 && (
									<div className="py-2">
										{results.map((user) => (
											<Link
												key={user.id}
												href={`/${user.login}`}
												onClick={handleClose}
												className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
											>
												<Avatar className="h-10 w-10 aspect-square">
													<AvatarImage
														src={fixImageUrl(user.avatarUrl || "")}
														alt={user.name}
														className="object-cover w-full h-full"
													/>
													<AvatarFallback className="text-sm">
														{user.name[0]?.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<p className="font-medium text-sm truncate">{user.name}</p>
														<Badge variant="outline" className="flex-shrink-0 h-5 px-1.5 text-xs">
															{user.role === "COMPOSER" ? (
																<>
																	<Music className="h-3 w-3 mr-1" />
																	Compositor
																</>
															) : (
																<>
																	<Guitar className="h-3 w-3 mr-1" />
																	Músico
																</>
															)}
														</Badge>
													</div>
													{user.city && (
														<p className="text-xs text-muted-foreground truncate">{user.city}</p>
													)}
												</div>
											</Link>
										))}
									</div>
								)}

								{query.length > 0 && query.length < 2 && (
									<div className="p-8 text-center text-muted-foreground">
										<p className="text-sm">Digite pelo menos 2 caracteres</p>
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}
