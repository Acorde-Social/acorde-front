import * as z from "zod"

// Schemas de validação para formulários

// Schema para login
export const loginSchema = z.object({
  identifier: z.string().min(1, "Email ou login é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// Schema para registro
export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  login: z.string().min(3, "Login deve ter pelo menos 3 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Login deve conter apenas letras, números, _ e -"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  role: z.enum(["COMPOSER", "MUSICIAN", "PRODUCER", "SONGWRITER", "VOCALIST", "BEATMAKER", "ENGINEER", "ARRANGER", "MIXER", "DJ", "LISTENER"]).optional(),
  terms: z.boolean().refine(value => value === true, {
    message: "Você deve aceitar os termos de uso",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export type RegisterFormValues = z.infer<typeof registerSchema>

// Schema para criação de projetos
export const projectSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  genre: z.string().min(2, "O gênero é obrigatório"),
  bpm: z.coerce.number().int().min(40).max(300),
  key: z.string().min(1, "A tonalidade é obrigatória"),
  image: z.any().optional(),
  neededInstruments: z.array(z.string()).min(0).optional().default([]),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

// Schema para comentários
export const commentSchema = z.object({
  content: z.string().min(1, "O comentário não pode estar vazio"),
})

export type CommentFormValues = z.infer<typeof commentSchema>