"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getFriends, Friend } from "@/services/friendships.service";
import { useAuth } from "@/contexts/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fixImageUrl } from "@/lib/utils";

interface NewConversationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateConversation: (participantIds: string[], name?: string, isGroup?: boolean) => void;
}

export default function NewConversationModal({
	isOpen,
	onClose,
	onCreateConversation,
}: NewConversationModalProps) {
	const { token } = useAuth();
	const { toast } = useToast();
	const [searchTerm, setSearchTerm] = useState('');
	const [friends, setFriends] = useState<Friend[]>([]);
	const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<Friend[]>([]);
	const [isGroup, setIsGroup] = useState(false);
	const [groupName, setGroupName] = useState('');
	const [loading, setLoading] = useState(false);
	const [loadingFriends, setLoadingFriends] = useState(false);

	// Carregar amigos quando o modal abrir
	useEffect(() => {
		if (isOpen && token) {
			loadFriends();
		}
	}, [isOpen, token]);

	// Filtrar amigos quando o termo de busca mudar
	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredFriends(friends);
			return;
		}

		const term = searchTerm.toLowerCase();
		const filtered = friends.filter(friend =>
			friend.name.toLowerCase().includes(term) ||
			friend.login.toLowerCase().includes(term)
		);
		setFilteredFriends(filtered);
	}, [searchTerm, friends]);

	const loadFriends = async () => {
		if (!token) return;

		try {
			setLoadingFriends(true);
			const response = await getFriends(token);
			setFriends(response.friends);
			setFilteredFriends(response.friends);
		} catch (error) {
			console.error('Erro ao buscar amigos:', error);
			toast({
				title: "Erro ao carregar amigos",
				description: "Não foi possível carregar sua lista de amigos",
				variant: "destructive",
			});
		} finally {
			setLoadingFriends(false);
		}
	};

	// Resetar estado quando o modal fechar
	useEffect(() => {
		if (!isOpen) {
			setSearchTerm('');
			setSelectedUsers([]);
			setIsGroup(false);
			setGroupName('');
		}
	}, [isOpen]);

	// Adicionar usuário à seleção
	const handleSelectUser = (friend: Friend) => {
		if (selectedUsers.some(u => u.id === friend.id)) return;
		setSelectedUsers(prev => [...prev, friend]);
	};

	// Remover usuário da seleção
	const handleRemoveUser = (userId: string) => {
		setSelectedUsers(prev => prev.filter(user => user.id !== userId));
	};

	// Criar conversa
	const handleCreateConversation = async () => {
		if (selectedUsers.length === 0) {
			toast({
				title: "Selecione pelo menos um usuário",
				variant: "destructive",
			});
			return;
		}

		if (isGroup && !groupName.trim()) {
			toast({
				title: "Informe um nome para o grupo",
				variant: "destructive",
			});
			return;
		}

		try {
			setLoading(true);

			// Extrair IDs dos usuários selecionados
			const participantIds = selectedUsers.map(user => user.id);

			// Criar conversa
			onCreateConversation(
				participantIds,
				isGroup ? groupName.trim() : undefined,
				isGroup
			);

			// Resetar e fechar
			setLoading(false);
			onClose();
		} catch (error) {
			console.error('Erro ao criar conversa:', error);
			setLoading(false);
			toast({
				title: "Erro ao criar conversa",
				description: "Tente novamente mais tarde",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Nova Conversa</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					{/* Opção de grupo */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="is-group"
							checked={isGroup}
							onCheckedChange={(checked) => setIsGroup(checked as boolean)}
						/>
						<Label htmlFor="is-group">Criar grupo</Label>
					</div>

					{/* Nome do grupo (apenas se for grupo) */}
					{isGroup && (
						<div className="space-y-2">
							<Label htmlFor="group-name">Nome do grupo</Label>
							<Input
								id="group-name"
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								placeholder="Ex: Músicos do Bairro"
							/>
						</div>
					)}

					{/* Usuários selecionados */}
					{selectedUsers.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{selectedUsers.map(friend => (
								<div
									key={friend.id}
									className="flex items-center bg-accent px-2 py-1 rounded-full"
								>
									<Avatar className="h-6 w-6 mr-1 aspect-square">
										<AvatarImage src={fixImageUrl(friend.avatarUrl || '')} className="object-cover w-full h-full" />
										<AvatarFallback>{friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<span className="text-sm">{friend.name}</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 p-0 ml-1"
										onClick={() => handleRemoveUser(friend.id)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					)}

					{/* Busca de usuários */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<Search className="h-4 w-4 text-muted-foreground" />
						</div>
						<Input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar amigos..."
							className="pl-10"
						/>
					</div>

					{/* Resultados da busca */}
					{loadingFriends ? (
						<div className="flex justify-center p-4">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : filteredFriends.length > 0 ? (
						<div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
							{filteredFriends.map(friend => (
								<div
									key={friend.id}
									className="flex items-center p-2 hover:bg-accent cursor-pointer transition-colors"
									onClick={() => handleSelectUser(friend)}
								>
									<Avatar className="h-8 w-8 mr-2 aspect-square">
										<AvatarImage src={fixImageUrl(friend.avatarUrl || '')} className="object-cover w-full h-full" />
										<AvatarFallback>{friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="overflow-hidden flex-1">
										<p className="truncate font-medium">{friend.name}</p>
										<p className="truncate text-xs text-muted-foreground">@{friend.login}</p>
									</div>
								</div>
							))}
						</div>
					) : friends.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							Você ainda não tem amigos. Faça acordes para começar a conversar!
						</p>
					) : (
						<p className="text-sm text-muted-foreground text-center py-2">
							Nenhum amigo encontrado
						</p>
					)}

					{/* Botões de ação */}
					<div className="flex justify-end gap-2 mt-4">
						<Button variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						<Button
							onClick={handleCreateConversation}
							disabled={selectedUsers.length === 0 || (isGroup && !groupName.trim()) || loading}
						>
							{loading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Criando...
								</>
							) : (
								'Criar Conversa'
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}