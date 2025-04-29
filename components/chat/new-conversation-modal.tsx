"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { userService } from "@/services/user-service";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
	id: string;
	name: string;
	avatarUrl?: string;
}

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
	const { toast } = useToast();
	const [searchTerm, setSearchTerm] = useState('');
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [isGroup, setIsGroup] = useState(false);
	const [groupName, setGroupName] = useState('');
	const [loading, setLoading] = useState(false);
	const [searching, setSearching] = useState(false);

	// Buscar usuários quando o termo de busca mudar
	useEffect(() => {
		if (!searchTerm.trim()) {
			setUsers([]);
			return;
		}

		const fetchUsers = async () => {
			try {
				setSearching(true);
				const response = await userService.searchUsers(searchTerm);
				setUsers(response.users || []);
				setSearching(false);
			} catch (error) {
				console.error('Erro ao buscar usuários:', error);
				setSearching(false);
			}
		};

		// Debounce para não fazer muitas requisições
		const timer = setTimeout(fetchUsers, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

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
	const handleSelectUser = (user: User) => {
		if (selectedUsers.some(u => u.id === user.id)) return;
		setSelectedUsers(prev => [...prev, user]);
		setSearchTerm('');
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
							{selectedUsers.map(user => (
								<div
									key={user.id}
									className="flex items-center bg-accent px-2 py-1 rounded-full"
								>
									<Avatar className="h-6 w-6 mr-1">
										<AvatarImage src={user.avatarUrl || ''} />
										<AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<span className="text-sm">{user.name}</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 p-0 ml-1"
										onClick={() => handleRemoveUser(user.id)}
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
							placeholder="Buscar usuários"
							className="pl-10"
						/>
					</div>

					{/* Resultados da busca */}
					{searching ? (
						<div className="flex justify-center p-4">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : searchTerm && users.length > 0 ? (
						<div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
							{users.map(user => (
								<div
									key={user.id}
									className="flex items-center p-2 hover:bg-accent cursor-pointer transition-colors"
									onClick={() => handleSelectUser(user)}
								>
									<Avatar className="h-8 w-8 mr-2">
										<AvatarImage src={user.avatarUrl || ''} />
										<AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="overflow-hidden">
										<p className="truncate">{user.name}</p>
									</div>
								</div>
							))}
						</div>
					) : searchTerm ? (
						<p className="text-sm text-muted-foreground text-center py-2">
							Nenhum usuário encontrado
						</p>
					) : null}

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