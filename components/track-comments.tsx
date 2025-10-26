"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThumbsUp, Loader2, Edit2, Trash2 } from "lucide-react"
import type { Comment } from "@/types"
import { CommentService } from "@/services/comment-service"
import { CommentInput } from "@/components/common/comment-input"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TrackCommentsProps {
	trackId: string
	comments: Comment[]
	onCommentAdded?: () => void
	onCommentCountChange?: (count: number) => void
}

export function TrackComments({ trackId, comments, onCommentAdded, onCommentCountChange }: TrackCommentsProps) {
	const [submitting, setSubmitting] = useState(false)
	const [liking, setLiking] = useState<Record<string, boolean>>({})
	const [editing, setEditing] = useState<string | null>(null)
	const [deleting, setDeleting] = useState<Record<string, boolean>>({})
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
	const [localComments, setLocalComments] = useState<Comment[]>(comments)
	const { user, token } = useAuth()
	const { toast } = useToast()

	// Atualizar comentários locais quando o prop mudar
	useEffect(() => {
		setLocalComments(comments)
	}, [comments])

	const handleSubmitComment = async (data: { text?: string; media?: File }) => {
		if (!user || !token) return

		setSubmitting(true)
		try {
			const formData = new FormData()

			if (data.text) {
				formData.append("text", data.text)
			}

			if (data.media) {
				formData.append("media", data.media)
			}

			// Fazer upload com FormData
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/track/${trackId}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			})

			if (!response.ok) {
				throw new Error("Erro ao criar comentário")
			}

			const result = await response.json()

			// Adicionar o novo comentário ao array local (com isLiked = false)
			const newComment: Comment = {
				...result,
				isLiked: false,
			}
			setLocalComments(prev => [newComment, ...prev])

			// Atualizar contagem se veio na resposta
			if (result.totalComments !== undefined && onCommentCountChange) {
				onCommentCountChange(result.totalComments)
			}

			toast({
				title: "Comentário adicionado",
				description: "Seu comentário foi adicionado com sucesso!",
			})
		} catch (error) {
			console.error("Erro ao adicionar comentário:", error)
			toast({
				title: "Erro ao adicionar comentário",
				description: "Não foi possível adicionar seu comentário. Tente novamente mais tarde.",
				variant: "destructive",
			})
			throw error
		} finally {
			setSubmitting(false)
		}
	}

	const handleToggleLike = async (commentId: string) => {
		if (!user || !token) {
			toast({
				title: "Autenticação necessária",
				description: "Você precisa estar logado para curtir comentários.",
				variant: "destructive",
			})
			return
		}

		setLiking((prev) => ({ ...prev, [commentId]: true }))
		try {
			const comment = localComments.find(c => c.id === commentId);
			if (!comment) return;

			const isLiked = comment.isLiked;

			if (isLiked) {
				await CommentService.unlikeComment(commentId, token);
				// Atualização otimista local
				setLocalComments(prev => prev.map(c =>
					c.id === commentId ? {
						...c,
						isLiked: false,
						likes: c.likes - 1
					} : c
				));
			} else {
				await CommentService.likeComment(commentId, token);
				// Atualização otimista local
				setLocalComments(prev => prev.map(c =>
					c.id === commentId ? {
						...c,
						isLiked: true,
						likes: c.likes + 1
					} : c
				));
			}
		} catch (error) {
			console.error("Erro ao processar curtida:", error);
			toast({
				title: "Erro ao processar curtida",
				description: "Não foi possível processar sua interação. Tente novamente mais tarde.",
				variant: "destructive",
			})
		} finally {
			setLiking((prev) => ({ ...prev, [commentId]: false }))
		}
	}

	const handleEditComment = async (commentId: string, data: { text?: string }) => {
		if (!token) return

		try {
			await CommentService.updateComment(commentId, data, token)

			// Atualizar comentário localmente
			setLocalComments(prev => prev.map(c =>
				c.id === commentId ? {
					...c,
					text: data.text || c.text,
					updatedAt: new Date().toISOString(),
				} : c
			))

			setEditing(null)

			toast({
				title: "Comentário atualizado",
				description: "Seu comentário foi atualizado com sucesso!",
			})

			if (onCommentAdded) {
				onCommentAdded()
			}
		} catch (error) {
			console.error("Erro ao editar comentário:", error)
			toast({
				title: "Erro ao editar comentário",
				description: "Não foi possível editar seu comentário. Tente novamente mais tarde.",
				variant: "destructive",
			})
			throw error
		}
	}

	const handleDeleteComment = async (commentId: string) => {
		if (!token) return

		setDeleting(prev => ({ ...prev, [commentId]: true }))
		try {
			const result = await CommentService.deleteComment(commentId, token)

			// Remover comentário localmente (atualização otimista)
			setLocalComments(prev => prev.filter(c => c.id !== commentId))

			// Atualizar contagem se veio na resposta
			if (result.totalComments !== undefined && onCommentCountChange) {
				onCommentCountChange(result.totalComments)
			}

			toast({
				title: "Comentário excluído",
				description: "Seu comentário foi excluído com sucesso!",
			})
		} catch (error) {
			console.error("Erro ao excluir comentário:", error)

			// Reverter atualização otimista em caso de erro - buscar comentários novamente
			if (onCommentAdded) {
				onCommentAdded()
			}

			toast({
				title: "Erro ao excluir comentário",
				description: "Não foi possível excluir seu comentário. Tente novamente mais tarde.",
				variant: "destructive",
			})
		} finally {
			setDeleting(prev => ({ ...prev, [commentId]: false }))
			setConfirmDelete(null)
		}
	}

	return (
		<Card className="shadow-none border-0">
			<CardContent className="p-0">
				<div className="space-y-6">
					{user && (
						<CommentInput
							onSubmit={handleSubmitComment}
							placeholder="Adicione um comentário..."
							submitLabel="Comentar"
							allowMedia={true}
						/>
					)}

					{/* Modal de confirmação de exclusão */}
					<ConfirmDialog
						open={confirmDelete !== null}
						onOpenChange={(open) => !open && setConfirmDelete(null)}
						onConfirm={() => confirmDelete && handleDeleteComment(confirmDelete)}
						title="Excluir comentário"
						description="Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
						confirmText="Excluir"
						cancelText="Cancelar"
						variant="destructive"
					/>

					<div className="space-y-6">
						{localComments.length > 0 ? (
							localComments.map((comment) => (
								<div key={comment.id} className="flex gap-4">
									<Avatar className="h-10 w-10">
										<AvatarImage src={comment.author.avatarUrl || ""} alt={comment.author.name} />
										<AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">{comment.author.name}</span>
											<span className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
											</span>
											{comment.updatedAt && new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime() + 1000 && (
												<span className="text-xs text-muted-foreground">(editado)</span>
											)}
										</div>

										{/* Modo de edição */}
										{editing === comment.id ? (
											<div className="mt-2">
												<CommentInput
													onSubmit={(data) => handleEditComment(comment.id, {
														text: data.text,
													})}
													placeholder="Editar comentário..."
													submitLabel="Salvar"
													initialText={comment.text || ""}
													allowMedia={false}
												/>
												<Button
													variant="ghost"
													size="sm"
													className="mt-2"
													onClick={() => setEditing(null)}
												>
													Cancelar
												</Button>
											</div>
										) : (
											<>
												{/* Texto do comentário */}
												{comment.text && <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>}

												{/* Mídia do comentário */}
												{comment.mediaUrl && (
													<div className="mt-2">
														{comment.mediaType === "image" || comment.mediaType === "gif" ? (
															<img
																src={comment.mediaUrl}
																alt="Comment media"
																className="max-w-sm max-h-64 rounded-lg border cursor-pointer hover:opacity-90 transition"
																onClick={() => window.open(comment.mediaUrl, '_blank')}
															/>
														) : null}
													</div>
												)}

												{/* Ações */}
												<div className="mt-2 flex items-center gap-4">
													<Button
														variant="ghost"
														size="sm"
														className={`h-8 px-2 ${comment.isLiked ? 'text-primary' : 'text-muted-foreground'}`}
														onClick={() => handleToggleLike(comment.id)}
														disabled={liking[comment.id]}
													>
														{liking[comment.id] ? (
															<Loader2 className="mr-1 h-4 w-4 animate-spin" />
														) : (
															<ThumbsUp className={`mr-1 h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
														)}
														{comment.likes}
													</Button>

													{/* Botões de editar/deletar se for autor */}
													{user && user.id === comment.authorId && (
														<>
															<Button
																variant="ghost"
																size="sm"
																className="h-8 px-2 text-muted-foreground"
																onClick={() => setEditing(comment.id)}
															>
																<Edit2 className="mr-1 h-4 w-4" />
																Editar
															</Button>
															<Button
																variant="ghost"
																size="sm"
																className="h-8 px-2 text-muted-foreground hover:text-destructive"
																onClick={() => setConfirmDelete(comment.id)}
																disabled={deleting[comment.id]}
															>
																{deleting[comment.id] ? (
																	<Loader2 className="mr-1 h-4 w-4 animate-spin" />
																) : (
																	<Trash2 className="mr-1 h-4 w-4" />
																)}
																Excluir
															</Button>
														</>
													)}
												</div>
											</>
										)}
									</div>
								</div>
							))
						) : (
							<p className="text-center text-muted-foreground py-4">
								Nenhum comentário ainda. Seja o primeiro a comentar!
							</p>
						)}
					</div>

					{localComments.length > 5 && (
						<Button variant="outline" className="w-full">
							Ver mais comentários
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}