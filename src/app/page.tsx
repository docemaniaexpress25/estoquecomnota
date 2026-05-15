'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Package,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  ClipboardList,
  ScrollText,
} from 'lucide-react'

// ==================== Types ====================

interface Produto {
  id: string
  nome: string
  estoque: number
  precoMedio: number
  createdAt: string
  updatedAt: string
}

interface ItemEntrada {
  produtoId: string
  quantidade: string
  preco: string
}

interface ItemSaida {
  produtoId: string
  quantidade: string
}

type Tela = 'pin' | 'menu' | 'entrada' | 'saida' | 'estoque' | 'log'

interface MovLog {
  id: string
  tipo: 'entrada' | 'saida'
  produtoNome: string
  quantidade: number
  preco: number
  dataNota: string
  observacao: string | null
  createdAt: string
}

// ==================== Component ====================

export default function Home() {
  const { toast } = useToast()

  // Tela
  const [tela, setTela] = useState<Tela>('pin')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pinShake, setPinShake] = useState(false)

  // Produtos
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Novo produto dialog
  const [dialogNovoProduto, setDialogNovoProduto] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoEstoque, setNovoEstoque] = useState('')
  const [novoPreco, setNovoPreco] = useState('')

  // Excluir dialog
  const [dialogExcluir, setDialogExcluir] = useState(false)
  const [excluirTarget, setExcluirTarget] = useState<Produto | null>(null)

  // Entrada
  const [itensEntrada, setItensEntrada] = useState<ItemEntrada[]>([])
  const [entradaRef, setEntradaRef] = useState('')

  // Saída
  const [itensSaida, setItensSaida] = useState<ItemSaida[]>([])
  const [saidaRef, setSaidaRef] = useState('')

  // Log
  const [movLog, setMovLog] = useState<MovLog[]>([])
  const [loadingLog, setLoadingLog] = useState(false)

  // ==================== PIN ====================

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === '233023') {
      setTela('menu')
      setPin('')
      setPinError(false)
      fetchProdutos()
    } else {
      setPinError(true)
      setPinShake(true)
      setTimeout(() => setPinShake(false), 500)
      setTimeout(() => setPinError(false), 2000)
    }
  }

  // ==================== Fetch ====================

  const fetchProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/produtos')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProdutos(data)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os produtos.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // ==================== Novo Produto ====================

  const handleCriarProduto = async () => {
    if (!novoNome.trim()) {
      toast({ title: 'Campo obrigatório', description: 'Informe o nome do produto.', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome.trim(),
          estoque: Number(novoEstoque) || 0,
          precoMedio: Number(novoPreco) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Produto criado', description: `"${novoNome.trim()}" adicionado ao estoque.` })
      setDialogNovoProduto(false)
      setNovoNome('')
      setNovoEstoque('')
      setNovoPreco('')
      fetchProdutos()
    } catch {
      toast({ title: 'Erro', description: 'Erro ao criar produto.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleExcluirProduto = async () => {
    if (!excluirTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/produtos?id=${excluirTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Excluído', description: `"${excluirTarget.nome}" removido.` })
      setDialogExcluir(false)
      setExcluirTarget(null)
      fetchProdutos()
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== Entrada ====================

  const openEntrada = () => {
    setItensEntrada(produtos.map(p => ({ produtoId: p.id, quantidade: '', preco: '' })))
    setEntradaRef('')
    setTela('entrada')
  }

  const updateEntrada = (produtoId: string, field: 'quantidade' | 'preco', value: string) => {
    setItensEntrada(prev => prev.map(i => i.produtoId === produtoId ? { ...i, [field]: value } : i))
  }

  const handleSubmitEntrada = async () => {
    const validos = itensEntrada.filter(i => Number(i.quantidade) > 0 && Number(i.preco) >= 0)
    if (validos.length === 0) {
      toast({ title: 'Nada para registrar', description: 'Preencha quantidade e preço de ao menos um produto.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/notas-entrada/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validos.map(i => ({
            produtoId: i.produtoId,
            quantidade: Number(i.quantidade),
            preco: Number(i.preco),
          })),
          referencia: entradaRef || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro')
      }
      toast({ title: 'Entrada registrada', description: `${validos.length} produto(s) adicionado(s) ao estoque.` })
      setTela('menu')
      fetchProdutos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== Saída ====================

  const openSaida = () => {
    const comEstoque = produtos.filter(p => p.estoque > 0)
    setItensSaida(comEstoque.map(p => ({ produtoId: p.id, quantidade: '' })))
    setSaidaRef('')
    setTela('saida')
  }

  const updateSaida = (produtoId: string, value: string) => {
    setItensSaida(prev => prev.map(i => i.produtoId === produtoId ? { ...i, quantidade: value } : i))
  }

  const handleSubmitSaida = async () => {
    const validos = itensSaida.filter(i => Number(i.quantidade) > 0)
    if (validos.length === 0) {
      toast({ title: 'Nada para registrar', description: 'Preencha quantidade de ao menos um produto.', variant: 'destructive' })
      return
    }

    // Validar estoque
    for (const item of validos) {
      const produto = produtos.find(p => p.id === item.produtoId)
      if (produto && Number(item.quantidade) > produto.estoque) {
        toast({
          title: 'Estoque insuficiente',
          description: `"${produto.nome}" — Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`,
          variant: 'destructive',
        })
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/notas-saida/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validos.map(i => ({
            produtoId: i.produtoId,
            quantidade: Number(i.quantidade),
          })),
          referencia: saidaRef || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro')
      }
      toast({ title: 'Saída registrada', description: `${validos.length} produto(s) removido(s) do estoque.` })
      setTela('menu')
      fetchProdutos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== Estoque / Log ====================

  const fetchLog = useCallback(async () => {
    setLoadingLog(true)
    try {
      const [resEntrada, resSaida] = await Promise.all([
        fetch('/api/notas-entrada'),
        fetch('/api/notas-saida'),
      ])
      if (!resEntrada.ok || !resSaida.ok) throw new Error()
      const [dataEntrada, dataSaida] = await Promise.all([resEntrada.json(), resSaida.json()])
      const logs: MovLog[] = [
        ...dataEntrada.map((n: { id: string; produto: { nome: string }; quantidade: number; preco: number; dataNota: string; observacao: string | null; createdAt: string }) => ({
          id: n.id,
          tipo: 'entrada' as const,
          produtoNome: n.produto.nome,
          quantidade: n.quantidade,
          preco: n.preco,
          dataNota: n.dataNota,
          observacao: n.observacao,
          createdAt: n.createdAt,
        })),
        ...dataSaida.map((n: { id: string; produto: { nome: string }; quantidade: number; precoUnit: number; dataNota: string; observacao: string | null; createdAt: string }) => ({
          id: n.id,
          tipo: 'saida' as const,
          produtoNome: n.produto.nome,
          quantidade: n.quantidade,
          preco: n.precoUnit,
          dataNota: n.dataNota,
          observacao: n.observacao,
          createdAt: n.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setMovLog(logs)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar as movimentações.', variant: 'destructive' })
    } finally {
      setLoadingLog(false)
    }
  }, [toast])

  const openEstoque = () => { fetchProdutos(); setTela('estoque') }
  const openLog = () => { fetchProdutos(); fetchLog(); setTela('log') }

  // ==================== Helpers ====================

  const formatCurrency = (value: number): string =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const getProdutoById = (id: string) => produtos.find(p => p.id === id)

  const totalEntradaItens = itensEntrada.filter(i => Number(i.quantidade) > 0).length
  const totalSaidaItens = itensSaida.filter(i => Number(i.quantidade) > 0).length
  const totalEstoqueGeral = produtos.reduce((acc, p) => acc + p.estoque, 0)
  const totalValorEstoque = produtos.reduce((acc, p) => acc + (p.estoque * p.precoMedio), 0)

  // ==================== Render: PIN ====================

  if (tela === 'pin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/30 mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Controle de Estoque</h1>
            <p className="text-slate-400 mt-1">Digite o PIN para acessar</p>
          </div>

          <form onSubmit={handlePinSubmit}>
            <div className="relative">
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="PIN de acesso"
                autoFocus
                className={`h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 ${pinError ? 'border-red-500 focus-visible:ring-red-500' : ''} ${pinShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 mt-4 text-lg font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              Entrar
            </Button>
          </form>

          {pinError && (
            <p className="text-center text-red-400 text-sm mt-3 font-medium">
              PIN incorreto. Tente novamente.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ==================== Render: Menu ====================

  if (tela === 'menu') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Controle de Estoque</h1>
                <p className="text-xs text-muted-foreground">{produtos.length} produto(s) cadastrado(s)</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setTela('pin'); setPin('') }}
              title="Sair"
            >
              <Lock className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-4">
            <Button
              onClick={openEntrada}
              className="w-full h-24 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 gap-3"
            >
              <ArrowDownCircle className="h-8 w-8" />
              Entrada de Produtos
            </Button>

            <Button
              onClick={openSaida}
              className="w-full h-24 text-lg font-bold rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 gap-3"
            >
              <ArrowUpCircle className="h-8 w-8" />
              Saída de Produtos
            </Button>

            <div className="pt-2 space-y-2">
              <Button
                variant="outline"
                onClick={openEstoque}
                className="w-full h-12 rounded-xl gap-2 justify-start px-4"
              >
                <ClipboardList className="h-4 w-4 text-blue-600" />
                Ver Estoque
              </Button>

              <Button
                variant="outline"
                onClick={openLog}
                className="w-full h-12 rounded-xl gap-2 justify-start px-4"
              >
                <ScrollText className="h-4 w-4 text-amber-600" />
                Ver Movimentações
              </Button>

              <Button
                variant="outline"
                onClick={() => setDialogNovoProduto(true)}
                className="w-full h-12 rounded-xl gap-2 justify-start px-4"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Novo Produto
              </Button>
            </div>
          </div>
        </main>

        {/* Dialog Novo Produto */}
        <Dialog open={dialogNovoProduto} onOpenChange={setDialogNovoProduto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
              <DialogDescription>Cadastre um novo produto no estoque.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input
                  placeholder="Ex: Camiseta Básica"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estoque Inicial</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={novoEstoque}
                    onChange={(e) => setNovoEstoque(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Médio (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={novoPreco}
                    onChange={(e) => setNovoPreco(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogNovoProduto(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleCriarProduto} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Excluir */}
        <Dialog open={dialogExcluir} onOpenChange={setDialogExcluir}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Excluir Produto</DialogTitle>
              <DialogDescription>
                Excluir <strong>{excluirTarget?.nome}</strong>? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogExcluir(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleExcluirProduto} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ==================== Render: Entrada ====================

  if (tela === 'entrada') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTela('menu')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5" />
                Entrada de Produtos
              </h1>
            </div>
            <Badge variant="secondary" className="font-mono">
              {totalEntradaItens} item(ns)
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 mx-auto w-full max-w-3xl p-4 space-y-4">
          {/* Referência */}
          <div className="bg-white rounded-xl border p-4">
            <Label className="text-sm font-medium text-muted-foreground">Referência / Nº Nota (opcional)</Label>
            <Input
              placeholder="Ex: NF 001234"
              value={entradaRef}
              onChange={(e) => setEntradaRef(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Lista de Produtos */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhum produto cadastrado</p>
              <Button variant="link" onClick={() => setTela('menu')} className="mt-2">
                Voltar ao menu
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {itensEntrada.map((item) => {
                const produto = getProdutoById(item.produtoId)
                if (!produto) return null
                const hasValue = Number(item.quantidade) > 0
                return (
                  <div
                    key={produto.id}
                    className={`bg-white rounded-xl border p-4 transition-all ${hasValue ? 'border-emerald-300 shadow-sm shadow-emerald-100 ring-1 ring-emerald-200' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">{produto.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Estoque atual: <span className="font-mono font-medium">{produto.estoque}</span> un.
                          {produto.precoMedio > 0 && (
                            <span className="ml-2">Preço médio: {formatCurrency(produto.precoMedio)}</span>
                          )}
                        </p>
                      </div>
                      {hasValue && (
                        <Badge className="bg-emerald-600 font-mono">
                          +{item.quantidade} un.
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="0"
                          value={item.quantidade}
                          onChange={(e) => updateEntrada(produto.id, 'quantidade', e.target.value)}
                          className="mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Preço Unit. (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                          value={item.preco}
                          onChange={(e) => updateEntrada(produto.id, 'preco', e.target.value)}
                          className="mt-1 font-mono"
                        />
                      </div>
                    </div>
                    {hasValue && Number(item.preco) > 0 && (
                      <div className="mt-2 pt-2 border-t flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold font-mono text-emerald-700">
                          {formatCurrency(Number(item.quantidade) * Number(item.preco))}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Botão Fixo */}
          {produtos.length > 0 && (
            <div className="sticky bottom-0 pt-2 pb-2">
              <Button
                onClick={handleSubmitEntrada}
                disabled={submitting || totalEntradaItens === 0}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ArrowDownCircle className="mr-2 h-5 w-5" />
                )}
                {submitting ? 'Processando...' : `Registrar Entrada (${totalEntradaItens})`}
              </Button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // ==================== Render: Saída ====================

  if (tela === 'saida') {
    const comEstoque = produtos.filter(p => p.estoque > 0)
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTela('menu')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-rose-700 flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                Saída de Produtos
              </h1>
            </div>
            <Badge variant="secondary" className="font-mono">
              {totalSaidaItens} item(ns)
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 mx-auto w-full max-w-3xl p-4 space-y-4">
          {/* Referência */}
          <div className="bg-white rounded-xl border p-4">
            <Label className="text-sm font-medium text-muted-foreground">Referência / Nº Nota (opcional)</Label>
            <Input
              placeholder="Ex: Pedido 5678"
              value={saidaRef}
              onChange={(e) => setSaidaRef(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Lista de Produtos com Estoque */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : comEstoque.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhum produto com estoque disponível</p>
              <Button variant="link" onClick={() => setTela('menu')} className="mt-2">
                Voltar ao menu
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {itensSaida.map((item) => {
                const produto = getProdutoById(item.produtoId)
                if (!produto) return null
                const qty = Number(item.quantidade)
                const excedeu = qty > produto.estoque && qty > 0
                const hasValue = qty > 0
                return (
                  <div
                    key={produto.id}
                    className={`bg-white rounded-xl border p-4 transition-all ${
                      excedeu
                        ? 'border-red-400 ring-1 ring-red-300'
                        : hasValue
                          ? 'border-rose-300 shadow-sm shadow-rose-100 ring-1 ring-rose-200'
                          : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">{produto.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Estoque:{' '}
                          <span className={`font-mono font-semibold ${excedeu ? 'text-red-600' : ''}`}>
                            {produto.estoque}
                          </span>{' '}
                          un.
                          {produto.precoMedio > 0 && (
                            <span className="ml-2">
                              R$ {produto.precoMedio.toFixed(2).replace('.', ',')}/un.
                            </span>
                          )}
                        </p>
                      </div>
                      {hasValue && !excedeu && (
                        <Badge variant="destructive" className="font-mono">
                          -{item.quantidade} un.
                        </Badge>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Quantidade a sair
                        {excedeu && (
                          <span className="text-red-500 ml-2 font-medium">Estoque insuficiente!</span>
                        )}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max={produto.estoque}
                        step="1"
                        placeholder="0"
                        value={item.quantidade}
                        onChange={(e) => updateSaida(produto.id, e.target.value)}
                        className={`mt-1 font-mono ${excedeu ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                      />
                    </div>
                    {hasValue && !excedeu && (
                      <div className="mt-2 pt-2 border-t flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor da saída</span>
                        <span className="font-semibold font-mono text-rose-700">
                          {formatCurrency(qty * produto.precoMedio)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Botão Fixo */}
          {comEstoque.length > 0 && (
            <div className="sticky bottom-0 pt-2 pb-2">
              <Button
                onClick={handleSubmitSaida}
                disabled={submitting || totalSaidaItens === 0}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUpCircle className="mr-2 h-5 w-5" />
                )}
                {submitting ? 'Processando...' : `Registrar Saída (${totalSaidaItens})`}
              </Button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // ==================== Render: Estoque ====================

  if (tela === 'estoque') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTela('menu')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Estoque Atual
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-3xl p-4 space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600 font-medium">Total de Produtos</p>
              <p className="text-2xl font-bold text-blue-800 font-mono mt-1">{produtos.length}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600 font-medium">Itens em Estoque</p>
              <p className="text-2xl font-bold text-blue-800 font-mono mt-1">{totalEstoqueGeral.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-xs text-muted-foreground font-medium">Valor Total em Estoque</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono mt-1">{formatCurrency(totalValorEstoque)}</p>
          </div>

          {/* Lista */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="bg-white rounded-xl border p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{produto.nome}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      R$ {produto.precoMedio.toFixed(2).replace('.', ',')}/un.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="text-sm font-semibold font-mono">
                        {formatCurrency(produto.estoque * produto.precoMedio)}
                      </p>
                    </div>
                    <Badge
                      variant={produto.estoque > 0 ? 'default' : 'destructive'}
                      className="font-mono text-base min-w-[3rem] justify-center"
                    >
                      {produto.estoque}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  // ==================== Render: Log (Cupom) ====================

  const formatLogDate = (dateStr: string): string => {
    if (!dateStr) return '-'
    const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  if (tela === 'log') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTela('menu')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-amber-700 flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Movimentações
              </h1>
            </div>
            <Badge variant="secondary" className="font-mono">
              {movLog.length} registro(s)
            </Badge>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-3xl p-4">
          {loadingLog ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : movLog.length === 0 ? (
            <div className="text-center py-20">
              <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {movLog.map((mov) => (
                <div
                  key={mov.id}
                  className="bg-white rounded-xl border shadow-sm overflow-hidden"
                >
                  {/* Cabeçalho do cupom */}
                  <div
                    className={`px-4 py-2 flex items-center justify-between ${
                      mov.tipo === 'entrada'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {mov.tipo === 'entrada' ? (
                        <ArrowDownCircle className="h-5 w-5" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5" />
                      )}
                      <span className="font-bold text-sm uppercase tracking-wide">
                        {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </div>
                    <span className="text-xs opacity-90 font-mono">
                      {formatLogDate(mov.dataNota)}
                    </span>
                  </div>

                  {/* Corpo do cupom */}
                  <div className="px-4 py-3 font-mono text-sm">
                    {/* Dashed top line */}
                    <div className="border-t-2 border-dashed border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Produto:</span>
                        <span className="font-semibold text-foreground">{mov.produtoNome}</span>
                      </div>

                      <div className="flex justify-between mt-1.5">
                        <span className="text-muted-foreground">Quantidade:</span>
                        <span className={`font-bold ${mov.tipo === 'entrada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade} un.
                        </span>
                      </div>

                      <div className="flex justify-between mt-1.5">
                        <span className="text-muted-foreground">Preço Unit.:</span>
                        <span>{formatCurrency(mov.preco)}</span>
                      </div>

                      {/* Separator */}
                      <div className="border-t border-dashed border-slate-200 mt-3 pt-2">
                        <div className="flex justify-between">
                          <span className="font-bold">TOTAL:</span>
                          <span className="font-bold text-base">
                            {formatCurrency(mov.quantidade * mov.preco)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dashed bottom line */}
                    <div className="border-t-2 border-dashed border-slate-200 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Registrado em {formatLogDate(mov.createdAt)}</span>
                        {mov.observacao && (
                          <span className="text-[11px] text-muted-foreground text-right max-w-[50%] truncate" title={mov.observacao}>
                            {mov.observacao}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Serrilhado inferior do cupom */}
                  <div className="h-2 bg-gradient-to-b from-white to-transparent" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  // ==================== Fallback ====================

  return null
}
