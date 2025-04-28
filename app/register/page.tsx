"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Music, Guitar, Loader2, Headphones, Mic, Volume2, SlidersHorizontal, PenTool, Radio, Disc, ArrowDownWideNarrow } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

// Interface para os tipos de usuário
interface UserType {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "composer"
  const [selectedTab, setSelectedTab] = useState(role)
  const { register, isLoading, error } = useAuth()
  const { toast } = useToast()

  // Campos comuns
  const [name, setName] = useState("")
  const [login, setLogin] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Campos específicos
  const [style, setStyle] = useState("")
  const [instrument, setInstrument] = useState("")
  const [experience, setExperience] = useState("")
  const [bio, setBio] = useState("")

  // Definição dos tipos de usuário para o formulário
  const userTypes: UserType[] = [
    {
      value: "composer",
      label: "Compositor",
      icon: <Music className="h-4 w-4" />,
      description: "Crie partituras e peças musicais"
    },
    {
      value: "musician",
      label: "Músico",
      icon: <Guitar className="h-4 w-4" />,
      description: "Toque instrumentos em projetos"
    },
    {
      value: "producer",
      label: "Produtor",
      icon: <SlidersHorizontal className="h-4 w-4" />,
      description: "Mixe e masterize projetos musicais"
    },
    {
      value: "songwriter",
      label: "Compositor Letra",
      icon: <PenTool className="h-4 w-4" />,
      description: "Escreva letras e composições"
    },
    {
      value: "vocalist",
      label: "Vocalista",
      icon: <Mic className="h-4 w-4" />,
      description: "Cante em projetos musicais"
    },
    {
      value: "beatmaker",
      label: "Beatmaker",
      icon: <Volume2 className="h-4 w-4" />,
      description: "Crie beats e bases instrumentais"
    },
    {
      value: "engineer",
      label: "Engenheiro",
      icon: <ArrowDownWideNarrow className="h-4 w-4" />,
      description: "Faça engenharia de som"
    },
    {
      value: "mixer",
      label: "Mixer",
      icon: <SlidersHorizontal className="h-4 w-4" />,
      description: "Especialista em mixagem"
    },
    {
      value: "dj",
      label: "DJ",
      icon: <Disc className="h-4 w-4" />,
      description: "Crie playlists e remixes"
    },
    {
      value: "listener",
      label: "Ouvinte",
      icon: <Headphones className="h-4 w-4" />,
      description: "Apenas escute e acompanhe"
    },
  ]

  const instruments = [
    "Violão/Guitarra",
    "Baixo",
    "Bateria",
    "Piano/Teclado",
    "Violino",
    "Viola",
    "Violoncelo",
    "Contrabaixo",
    "Flauta",
    "Saxofone",
    "Trompete",
    "Trombone",
    "Voz",
    "Percussão",
    "Produção/Beatmaking",
    "Outros",
  ]

  // Função para mapear o valor do tab para o enum UserRole
  const getRoleFromTab = (tab: string): string => {
    const roleMap: { [key: string]: string } = {
      composer: "COMPOSER",
      musician: "MUSICIAN",
      producer: "PRODUCER",
      songwriter: "SONGWRITER",
      vocalist: "VOCALIST",
      beatmaker: "BEATMAKER",
      engineer: "ENGINEER",
      mixer: "MIXER",
      dj: "DJ",
      listener: "LISTENER"
    }

    return roleMap[tab] || "LISTENER"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      toast({
        title: "Termos não aceitos",
        description: "Você precisa aceitar os termos de serviço para continuar",
        variant: "destructive",
      })
      return
    }

    try {
      const userData: any = {
        name,
        login,
        email,
        password,
        role: getRoleFromTab(selectedTab),
        experience: experience || undefined,
        bio: bio || undefined
      }

      // Adicionar instrumentos apenas para perfis relevantes
      if (["musician", "vocalist", "producer", "beatmaker"].includes(selectedTab) && instrument) {
        userData.instruments = [instrument]
      }

      await register(userData)

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao MusicCollab",
      })
    } catch (err) {
      toast({
        title: "Erro ao criar conta",
        description: error || "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Dividimos os tipos de usuário em grupos para mostrar em múltiplas linhas
  const userTypesGroup1 = userTypes.slice(0, 5);  // Primeiros 5 tipos
  const userTypesGroup2 = userTypes.slice(5);     // Restantes 5 tipos

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Criar uma conta</CardTitle>
          <CardDescription className="text-center">Escolha seu perfil e comece a colaborar</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="space-y-2">
              <TabsList className="grid w-full grid-cols-5">
                {userTypesGroup1.map((type) => (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="flex flex-col items-center gap-1 py-2"
                    title={type.description}
                  >
                    {type.icon}
                    <span className="text-xs">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid w-full grid-cols-5">
                {userTypesGroup2.map((type) => (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="flex flex-col items-center gap-1 py-2"
                    title={type.description}
                  >
                    {type.icon}
                    <span className="text-xs">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mt-4">{error}</div>}

              {/* Campos comuns para todos os tipos de usuário */}
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login">Login</Label>
                    <Input
                      id="login"
                      placeholder="Seu nome de usuário"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {selectedTab !== "listener" && (
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio/Descrição</Label>
                    <Input
                      id="bio"
                      placeholder="Conte um pouco sobre você e sua experiência musical"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                )}

                {/* Campos específicos por tipo de perfil */}
                {["musician", "vocalist", "producer", "beatmaker"].includes(selectedTab) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instrument">Instrumento principal</Label>
                      <Select value={instrument} onValueChange={setInstrument}>
                        <SelectTrigger id="instrument">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {instruments.map((inst) => (
                            <SelectItem key={inst} value={inst.toLowerCase().replace(/\//g, "-")}>
                              {inst}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experiência</Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Iniciante (0-2 anos)</SelectItem>
                          <SelectItem value="intermediate">Intermediário (2-5 anos)</SelectItem>
                          <SelectItem value="advanced">Avançado (5-10 anos)</SelectItem>
                          <SelectItem value="professional">Profissional (10+ anos)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {["composer", "songwriter", "dj", "engineer", "mixer"].includes(selectedTab) && (
                  <div className="space-y-2">
                    <Label htmlFor="style">Estilo musical principal</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="classical">Clássica</SelectItem>
                        <SelectItem value="electronic">Eletrônica</SelectItem>
                        <SelectItem value="hiphop">Hip Hop</SelectItem>
                        <SelectItem value="mpb">MPB</SelectItem>
                        <SelectItem value="sertanejo">Sertanejo</SelectItem>
                        <SelectItem value="indie">Indie</SelectItem>
                        <SelectItem value="funk">Funk</SelectItem>
                        <SelectItem value="reggae">Reggae</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {["producer", "engineer", "mixer"].includes(selectedTab) && (
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experiência</Label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante (0-2 anos)</SelectItem>
                        <SelectItem value="intermediate">Intermediário (2-5 anos)</SelectItem>
                        <SelectItem value="advanced">Avançado (5-10 anos)</SelectItem>
                        <SelectItem value="professional">Profissional (10+ anos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Concordo com os{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      termos de serviço
                    </Link>{" "}
                    e{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      política de privacidade
                    </Link>
                  </Label>
                </div>
              </div>

              <div className="mt-6">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

