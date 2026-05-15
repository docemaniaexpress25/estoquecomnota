'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Trash2,
  Edit,
  FileText,
  BarChart3,
  DollarSign,
  Loader2,
  ShoppingCart,
} from 'lucide-react'

// ==================== Types ====================

interface Produto {
  id: string
  nome: string
  estoque: number
  precoMedio: number
  createdAt: string
  updatedAt: string
  _count: { entradas: number; saidas: number }
}

interface NotaEntrada {
  id: string
  produtoId: string
  quantidade: number
  preco: number
  dataNota: string
  observacao: string | null
  createdAt: string
  produto: { nome: string }
}

interface NotaSaida {
  id: string
  produtoId: string
  quantidade: number
  precoUnit: number
  dataNota: string
  observacao: string | null
  createdAt: string
  produto: { nome: string }
}

// ==================== Helpers ====================

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR')
}

const getTodayISO = (): string => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// ==================== Component ====================

export default function Home() {
  const { toast } = useToast()

  // Data states
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [notasEntrada, setNotasEntrada] = useState<NotaEntrada[]>([])
  const [notasSaida, setNotasSaida] = useState<NotaSaida[]>([])

  // Loading states
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [loadingEntradas, setLoadingEntradas] = useState(true)
  const [loadingSaidas, setLoadingSaidas] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Dialog states
  const [dialogProdutoOpen, setDialogProdutoOpen] = useState(false)
  const [dialogEntradaOpen, setDialogEntradaOpen] = useState(false)
  const [dialogSaidaOpen, setDialogSaidaOpen] = useState(false)
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)

  // Form states
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null)

  // Produto form
  const [formNome, setFormNome] = useState('')
  const [formEstoque, setFormEstoque] = useState('0')
  const [formPrecoMedio, setFormPrecoMedio] = useState('0')

  // Entrada form
  const [entradaQuantidade, setEntradaQuantidade] = useState('')
  const [entradaPreco, setEntradaPreco] = useState('')
  const [entradaData, setEntradaData] = useState(getTodayISO())
  const [entradaObservacao, setEntradaObservacao] = useState('')

  // Saida form
  const [saidaQuantidade, setSaidaQuantidade] = useState('')
  const [saidaData, setSaidaData] = useState(getTodayISO())
  const [saidaObservacao, setSaidaObservacao] = useState('')

  // ==================== Fetch Functions ====================

  const fetchProdutos = useCallback(async () => {
    setLoadingProdutos(true)
    try {
      const res = await fetch('/api/produtos')
      if (!res.ok) throw new Error('Erro ao buscar produtos')
      const data = await res.json()
      setProdutos(data)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os produtos.', variant: 'destructive' })
    } finally {
      setLoadingProdutos(false)
    }
  }, [toast])

  const fetchNotasEntrada = useCallback(async () => {
    setLoadingEntradas(true)
    try {
      const res = await fetch('/api/notas-entrada')
      if (!res.ok) throw new Error('Erro ao buscar notas')
      const data = await res.json()
      setNotasEntrada(data)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar as notas de entrada.', variant: 'destructive' })
    } finally {
      setLoadingEntradas(false)
    }
  }, [toast])

  const fetchNotasSaida = useCallback(async () => {
    setLoadingSaidas(true)
    try {
      const res = await fetch('/api/notas-saida')
      if (!res.ok) throw new Error('Erro ao buscar notas')
      const data = await res.json()
      setNotasSaida(data)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar as notas de saída.', variant: 'destructive' })
    } finally {
      setLoadingSaidas(false)
    }
  }, [toast])

  const fetchAll = useCallback(() => {
    fetchProdutos()
    fetchNotasEntrada()
    fetchNotasSaida()
  }, [fetchProdutos, fetchNotasEntrada, fetchNotasSaida])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ==================== Stats ====================

  const totalItensSaidos = notasSaida.reduce((acc, n) => acc + n.quantidade, 0)
  const totalValorSaidas = notasSaida.reduce((acc, n) => acc + n.quantidade * n.precoUnit, 0)

  // ==================== Produto CRUD ====================

  const openCreateProduto = () => {
    setEditingProduto(null)
    setFormNome('')
    setFormEstoque('0')
    setFormPrecoMedio('0')
    setDialogProdutoOpen(true)
  }

  const openEditProduto = (produto: Produto) => {
    setEditingProduto(produto)
    setFormNome(produto.nome)
    setFormEstoque(String(produto.estoque))
    setFormPrecoMedio(String(produto.precoMedio))
    setDialogProdutoOpen(true)
  }

  const handleSubmitProduto = async () => {
    if (!formNome.trim()) {
      toast({ title: 'Campo obrigatório', description: 'Informe o nome do produto.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const body = {
        nome: formNome.trim(),
        estoque: Number(formEstoque) || 0,
        precoMedio: Number(formPrecoMedio) || 0,
      }

      if (editingProduto) {
        const res = await fetch('/api/produtos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduto.id, ...body }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao atualizar')
        }
        toast({ title: 'Produto atualizado', description: `"${formNome.trim()}" foi atualizado com sucesso.` })
      } else {
        const res = await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao criar')
        }
        toast({ title: 'Produto criado', description: `"${formNome.trim()}" foi adicionado ao estoque.` })
      }

      setDialogProdutoOpen(false)
      fetchAll()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduto = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/produtos?id=${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao excluir')
      }
      toast({ title: 'Produto excluído', description: `"${deleteTarget.nome}" foi removido permanentemente.` })
      setDialogDeleteOpen(false)
      setDeleteTarget(null)
      fetchAll()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== Entrada / Saída ====================

  const openEntrada = (produto: Produto) => {
    setSelectedProduto(produto)
    setEntradaQuantidade('')
    setEntradaPreco('')
    setEntradaData(getTodayISO())
    setEntradaObservacao('')
    setDialogEntradaOpen(true)
  }

  const openSaida = (produto: Produto) => {
    setSelectedProduto(produto)
    setSaidaQuantidade('')
    setSaidaData(getTodayISO())
    setSaidaObservacao('')
    setDialogSaidaOpen(true)
  }

  const handleSubmitEntrada = async () => {
    if (!selectedProduto) return
    const qty = Number(entradaQuantidade)
    if (!qty || qty <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe uma quantidade válida maior que zero.', variant: 'destructive' })
      return
    }
    const preco = Number(entradaPreco)
    if (isNaN(preco) || preco < 0) {
      toast({ title: 'Valor inválido', description: 'Informe um preço unitário válido.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/notas-entrada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: selectedProduto.id,
          quantidade: qty,
          preco,
          dataNota: entradaData || undefined,
          observacao: entradaObservacao.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao registrar entrada')
      }
      toast({ title: 'Entrada registrada', description: `+${qty} un. de "${selectedProduto.nome}" adicionadas ao estoque.` })
      setDialogEntradaOpen(false)
      fetchAll()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitSaida = async () => {
    if (!selectedProduto) return
    const qty = Number(saidaQuantidade)
    if (!qty || qty <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe uma quantidade válida maior que zero.', variant: 'destructive' })
      return
    }
    if (qty > selectedProduto.estoque) {
      toast({
        title: 'Estoque insuficiente',
        description: `Disponível: ${selectedProduto.estoque} un. Solicitado: ${qty} un.`,
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/notas-saida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: selectedProduto.id,
          quantidade: qty,
          dataNota: saidaData || undefined,
          observacao: saidaObservacao.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao registrar saída')
      }
      toast({ title: 'Saída registrada', description: `-${qty} un. de "${selectedProduto.nome}" removidas do estoque.` })
      setDialogSaidaOpen(false)
      fetchAll()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== Render: Produtos Tab ====================

  const renderProdutosTab = () => (
    <Card className="py-0">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-emerald-600" />
            Produtos
          </CardTitle>
          <CardDescription>Gerencie o cadastro de produtos e movimentações de estoque</CardDescription>
        </div>
        <Button onClick={openCreateProduto} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 px-0">
        {loadingProdutos ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum produto cadastrado</p>
            <p className="text-muted-foreground text-sm mt-1">Clique em &quot;Novo Produto&quot; para começar</p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Nome</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="text-right">Preço Médio</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Entradas</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Saídas</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="pl-6 font-medium">{produto.nome}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={produto.estoque > 0 ? 'default' : 'destructive'} className="font-mono">
                        {produto.estoque}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(produto.precoMedio)}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{produto._count.entradas}</span>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <span className="text-rose-600 dark:text-rose-400 font-medium">{produto._count.saidas}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          onClick={() => openEntrada(produto)}
                          title="Registrar Entrada"
                        >
                          <ArrowDownCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                          onClick={() => openSaida(produto)}
                          title="Registrar Saída"
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditProduto(produto)}
                          title="Editar Produto"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeleteTarget(produto)
                            setDialogDeleteOpen(true)
                          }}
                          title="Excluir Produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // ==================== Render: Notas de Entrada Tab ====================

  const renderNotasEntradaTab = () => (
    <Card className="py-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
          Notas de Entrada
        </CardTitle>
        <CardDescription>Histórico completo de todas as entradas de mercadorias no estoque</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 px-0">
        {loadingEntradas ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notasEntrada.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowDownCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhuma nota de entrada registrada</p>
            <p className="text-muted-foreground text-sm mt-1">As entradas aparecerão aqui ao registrar movimentações</p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="pr-6 hidden sm:table-cell">Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasEntrada.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell className="pl-6 text-muted-foreground">{formatDate(nota.dataNota)}</TableCell>
                    <TableCell className="font-medium">{nota.produto.nome}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 font-mono">
                        +{nota.quantidade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(nota.preco)}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(nota.quantidade * nota.preco)}
                    </TableCell>
                    <TableCell className="pr-6 text-muted-foreground text-sm max-w-[200px] truncate hidden sm:table-cell">
                      {nota.observacao || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // ==================== Render: Relatório de Saídas Tab ====================

  const renderRelatorioSaidasTab = () => (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="py-4">
          <CardContent className="flex items-center gap-4 px-6 py-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
              <ShoppingCart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Itens Saídos</p>
              <p className="text-2xl font-bold">{totalItensSaidos.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-4 px-6 py-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total das Saídas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValorSaidas)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="py-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpCircle className="h-5 w-5 text-rose-600" />
            Relatório de Saídas
          </CardTitle>
          <CardDescription>Detalhamento de todas as saídas de produtos do estoque</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 px-0">
          {loadingSaidas ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notasSaida.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ArrowUpCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Nenhuma saída registrada</p>
              <p className="text-muted-foreground text-sm mt-1">As saídas aparecerão aqui ao registrar movimentações</p>
            </div>
          ) : (
            <div className="max-h-[460px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="pr-6 hidden sm:table-cell">Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notasSaida.map((nota) => (
                    <TableRow key={nota.id}>
                      <TableCell className="pl-6 text-muted-foreground">{formatDate(nota.dataNota)}</TableCell>
                      <TableCell className="font-medium">{nota.produto.nome}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive" className="font-mono">
                          -{nota.quantidade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(nota.precoUnit)}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(nota.quantidade * nota.precoUnit)}
                      </TableCell>
                      <TableCell className="pr-6 text-muted-foreground text-sm max-w-[200px] truncate hidden sm:table-cell">
                        {nota.observacao || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // ==================== Render: Dialogs ====================

  const renderDialogProduto = () => (
    <Dialog open={dialogProdutoOpen} onOpenChange={setDialogProdutoOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {editingProduto
              ? 'Atualize as informações do produto abaixo.'
              : 'Preencha os dados para cadastrar um novo produto no estoque.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="produto-nome">Nome do Produto *</Label>
            <Input
              id="produto-nome"
              placeholder="Ex: Camiseta Básica"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="produto-estoque">Estoque Inicial</Label>
              <Input
                id="produto-estoque"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={formEstoque}
                onChange={(e) => setFormEstoque(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="produto-preco">Preço Médio (R$)</Label>
              <Input
                id="produto-preco"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formPrecoMedio}
                onChange={(e) => setFormPrecoMedio(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogProdutoOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitProduto} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const renderDialogEntrada = () => (
    <Dialog open={dialogEntradaOpen} onOpenChange={setDialogEntradaOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
            Registrar Entrada
          </DialogTitle>
          <DialogDescription>
            Adicione estoque para <strong className="text-foreground">{selectedProduto?.nome}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entrada-qtd">Quantidade *</Label>
              <Input
                id="entrada-qtd"
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={entradaQuantidade}
                onChange={(e) => setEntradaQuantidade(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entrada-preco">Preço Unitário (R$) *</Label>
              <Input
                id="entrada-preco"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={entradaPreco}
                onChange={(e) => setEntradaPreco(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entrada-data">Data</Label>
            <Input
              id="entrada-data"
              type="date"
              value={entradaData}
              onChange={(e) => setEntradaData(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entrada-obs">Observação</Label>
            <Input
              id="entrada-obs"
              placeholder="Ex: Compra fornecedor X"
              value={entradaObservacao}
              onChange={(e) => setEntradaObservacao(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogEntradaOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitEntrada} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Entrada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const renderDialogSaida = () => (
    <Dialog open={dialogSaidaOpen} onOpenChange={setDialogSaidaOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-rose-600" />
            Registrar Saída
          </DialogTitle>
          <DialogDescription>
            Remova estoque de <strong className="text-foreground">{selectedProduto?.nome}</strong>
            {selectedProduto && (
              <span className="block mt-1 text-sm">
                Estoque disponível:{' '}
                <Badge variant={selectedProduto.estoque > 0 ? 'default' : 'destructive'} className="ml-1 font-mono">
                  {selectedProduto.estoque}
                </Badge>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="saida-qtd">Quantidade *</Label>
            <Input
              id="saida-qtd"
              type="number"
              min="1"
              max={selectedProduto?.estoque}
              step="1"
              placeholder="0"
              value={saidaQuantidade}
              onChange={(e) => setSaidaQuantidade(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saida-data">Data</Label>
            <Input
              id="saida-data"
              type="date"
              value={saidaData}
              onChange={(e) => setSaidaData(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saida-obs">Observação</Label>
            <Input
              id="saida-obs"
              placeholder="Ex: Venda para cliente Y"
              value={saidaObservacao}
              onChange={(e) => setSaidaObservacao(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogSaidaOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitSaida} disabled={submitting} className="bg-rose-600 hover:bg-rose-700">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Saída
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const renderDialogDelete = () => (
    <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong className="text-foreground">{deleteTarget?.nome}</strong>?
            <br />
            Esta ação irá remover o produto e todas as suas notas de entrada e saída. Esta operação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogDeleteOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDeleteProduto} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir Permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // ==================== Main Render ====================

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Controle de Estoque
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie produtos, entradas e saídas em um só lugar
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="produtos" className="gap-1.5">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="entradas" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Notas de Entrada</span>
            </TabsTrigger>
            <TabsTrigger value="saidas" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Relatório de Saídas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="mt-4">
            {renderProdutosTab()}
          </TabsContent>
          <TabsContent value="entradas" className="mt-4">
            {renderNotasEntradaTab()}
          </TabsContent>
          <TabsContent value="saidas" className="mt-4">
            {renderRelatorioSaidasTab()}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Sistema de Controle de Estoque &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Dialogs */}
      {renderDialogProduto()}
      {renderDialogEntrada()}
      {renderDialogSaida()}
      {renderDialogDelete()}
    </div>
  )
}
