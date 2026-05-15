'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import { useToast } from '@/hooks/use-toast'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  PackagePlus,
  History,
  Trash2,
  Edit3,
  X,
  Printer,
} from 'lucide-react'

// Types
interface Product {
  id: string
  name: string
  costPrice: number
  stock: number
}

interface MovementItem {
  id: string
  type: string
  productId: string
  quantity: number
  unitPrice: number
  total: number
  cupomId: string
  createdAt: string
  product?: { name: string }
}

// ========================
// PIN Screen
// ========================
function PinScreen({ onAccess }: { onAccess: () => void }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const CORRECT_PIN = '233023'

  const handlePinInput = (value: string) => {
    if (pin.length < 6) {
      const newPin = pin + value
      setPin(newPin)
      if (newPin.length === 6) {
        if (newPin === CORRECT_PIN) {
          setTimeout(() => onAccess(), 200)
        } else {
          setShake(true)
          setTimeout(() => {
            setPin('')
            setShake(false)
          }, 500)
        }
      }
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <Package className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h1 className="text-white text-xl font-semibold">Estoque</h1>
        <p className="text-zinc-500 text-sm mt-1">Digite o PIN para acessar</p>
      </div>

      <div className={`flex gap-3 mb-8 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < pin.length ? 'bg-emerald-500 scale-110' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[240px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
          <Button
            key={key || 'empty'}
            variant="ghost"
            className={`h-16 text-xl font-medium rounded-2xl ${
              key === 'del'
                ? 'text-red-400 hover:text-red-300 hover:bg-zinc-800'
                : key
                  ? 'text-white hover:bg-zinc-800 bg-zinc-900'
                  : 'invisible'
            }`}
            onClick={() => {
              if (key === 'del') handleDelete()
              else if (key) handlePinInput(key)
            }}
          >
            {key === 'del' ? <X className="w-6 h-6" /> : key}
          </Button>
        ))}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}

// ========================
// Dashboard
// ========================
function Dashboard({
  onNavigate,
  productCount,
  todayMovements,
}: {
  onNavigate: (view: string) => void
  productCount: number
  todayMovements: number
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-950 text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Controle de Estoque</h1>
            <p className="text-zinc-400 text-xs">
              {productCount} produto{productCount !== 1 ? 's' : ''} cadastrado{productCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
            {todayMovements} mov. hoje
          </Badge>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-3">
        <Button
          className="w-full h-20 text-base bg-emerald-600 hover:bg-emerald-700 text-white justify-start gap-3 rounded-xl"
          onClick={() => onNavigate('entrada')}
        >
          <ArrowDownToLine className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Entrada</div>
            <div className="text-xs opacity-80">Registrar entrada de produtos</div>
          </div>
        </Button>

        <Button
          className="w-full h-20 text-base bg-orange-500 hover:bg-orange-600 text-white justify-start gap-3 rounded-xl"
          onClick={() => onNavigate('saida')}
        >
          <ArrowUpFromLine className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Saída</div>
            <div className="text-xs opacity-80">Registrar saída de produtos</div>
          </div>
        </Button>

        <Button
          className="w-full h-20 text-base bg-zinc-900 hover:bg-zinc-800 text-white justify-start gap-3 rounded-xl"
          onClick={() => onNavigate('produtos')}
        >
          <PackagePlus className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Produtos</div>
            <div className="text-xs opacity-80">Cadastrar e gerenciar</div>
          </div>
        </Button>

        <Button
          className="w-full h-20 text-base bg-zinc-200 hover:bg-zinc-300 text-zinc-900 justify-start gap-3 rounded-xl"
          onClick={() => onNavigate('movimentacoes')}
        >
          <History className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Movimentações</div>
            <div className="text-xs opacity-80">Histórico de entradas e saídas</div>
          </div>
        </Button>
      </div>
    </div>
  )
}

// ========================
// Product Registration
// ========================
function ProductsScreen({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stock, setStock] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [, startTransition] = useTransition()

  const loadProducts = useCallback(async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    startTransition(() => setProducts(data))
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleSubmit = async () => {
    if (!name.trim() || !costPrice || !stock) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name, costPrice, stock }),
        })
        toast({ title: 'Produto atualizado!' })
        setEditingId(null)
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, costPrice, stock }),
        })
        toast({ title: 'Produto cadastrado!' })
      }
      setName('')
      setCostPrice('')
      setStock('')
      loadProducts()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setLoading(false)
  }

  const handleEdit = (p: Product) => {
    setEditingId(p.id)
    setName(p.name)
    setCostPrice(p.costPrice.toString())
    setStock(p.stock.toString())
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este produto?')) return
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
    toast({ title: 'Produto removido' })
    loadProducts()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setCostPrice('')
    setStock('')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-950 text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Produtos</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Card className="border-zinc-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-500">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nome do produto"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                step="0.01"
                placeholder="Preço de custo (R$)"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Qtd. em estoque"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2">
            {products.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">Nenhum produto cadastrado</p>
            )}
            {products.map((p) => (
              <Card key={p.id} className="border-zinc-200">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-zinc-500">
                        R$ {p.costPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Estoque: {p.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}>
                      <Edit3 className="w-4 h-4 text-zinc-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// ========================
// Movement Screen (Entrada/Saída)
// ========================
function MovementScreen({
  type,
  onBack,
  onComplete,
}: {
  type: 'ENTRADA' | 'SAIDA'
  onBack: () => void
  onComplete: (cupomId: string) => void
}) {
  const isEntrada = type === 'ENTRADA'
  const [products, setProducts] = useState<Product[]>([])
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const setQty = (id: string, val: string) => {
    setQuantities((prev) => ({ ...prev, [id]: val }))
  }

  const selectedItems = Object.entries(quantities)
    .filter(([, q]) => q && parseInt(q) > 0)
    .map(([productId, quantity]) => ({ productId, quantity: parseInt(quantity) }))

  const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0)

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({ title: 'Selecione ao menos um produto', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, items: selectedItems }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error, variant: 'destructive' })
        setLoading(false)
        return
      }

      toast({ title: `${isEntrada ? 'Entrada' : 'Saída'} registrada!` })
      onComplete(data.cupomId)
    } catch {
      toast({ title: 'Erro ao registrar', variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className={`text-white px-4 py-4 ${isEntrada ? 'bg-emerald-700' : 'bg-orange-500'}`}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onBack}>
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {isEntrada ? 'Entrada' : 'Saída'}
            </h1>
          </div>
          <Badge variant="secondary" className={`${isEntrada ? 'bg-emerald-600' : 'bg-orange-600'} text-white text-xs`}>
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ScrollArea className="max-h-[55vh]">
          <div className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">
                {search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </p>
            )}
            {filtered.map((p) => (
              <Card key={p.id} className={`border-zinc-200 ${quantities[p.id] && parseInt(quantities[p.id]) > 0 ? 'ring-2 ring-emerald-500/50' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs text-zinc-500">R$ {p.costPrice.toFixed(2)}</span>
                        <span className="text-xs text-zinc-500">Estoque: {p.stock}</span>
                      </div>
                    </div>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Qtd"
                    value={quantities[p.id] || ''}
                    onChange={(e) => setQty(p.id, e.target.value)}
                    className="h-9 text-sm"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <Button
          onClick={handleSubmit}
          disabled={loading || selectedItems.length === 0}
          className={`w-full h-14 text-base font-semibold text-white rounded-xl ${
            isEntrada
              ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
              : 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
          }`}
        >
          {loading
            ? 'Registrando...'
            : `Confirmar ${isEntrada ? 'Entrada' : 'Saída'} (${selectedItems.length} ${selectedItems.length === 1 ? 'produto' : 'produtos'})`
          }
        </Button>
      </div>
    </div>
  )
}

// ========================
// Cupom / Receipt
// ========================
function CupomScreen({
  cupomId,
  onBack,
  onDashboard,
}: {
  cupomId: string
  onBack: () => void
  onDashboard: () => void
}) {
  const [movements, setMovements] = useState<MovementItem[]>([])
  const [printContent, setPrintContent] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetch(`/api/movements?cupomId=${cupomId}`)
      .then((r) => r.json())
      .then((data) => setMovements(data))
  }, [cupomId])

  const totalGeral = movements.reduce((sum, m) => sum + m.total, 0)
  const totalQtd = movements.reduce((sum, m) => sum + m.quantity, 0)
  const isEntrada = movements[0]?.type === 'ENTRADA'
  const date = movements[0]?.createdAt
    ? new Date(movements[0].createdAt).toLocaleString('pt-BR')
    : ''

  const handlePrint = () => {
    const lines = movements.map(
      (m) => `${m.quantity}x ${m.product?.name || 'Produto'}  R$ ${m.total.toFixed(2)}`
    )
    const text = [
      `=== ${isEntrada ? 'ENTRADA' : 'SAIDA'} ===`,
      `Data: ${date}`,
      `------------------------`,
      ...lines,
      `------------------------`,
      `Total: ${totalQtd} itens`,
      `Valor: R$ ${totalGeral.toFixed(2)}`,
      `ID: ${cupomId.slice(0, 8)}`,
      `========================`,
    ].join('\n')

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast({ title: 'Cupom copiado!' })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className={`text-white px-4 py-4 ${isEntrada ? 'bg-emerald-700' : 'bg-orange-500'}`}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onBack}>
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Cupom</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        <Card className="border-zinc-200">
          <CardContent className="p-0">
            {/* Cupom header */}
            <div className="bg-zinc-900 text-white text-center p-4">
              <Package className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-xs uppercase tracking-wider opacity-70">Controle de Estoque</p>
              <p className="font-bold text-lg mt-1">
                {isEntrada ? 'ENTRADA' : 'SAÍDA'}
              </p>
              <p className="text-xs opacity-60 mt-1">{date}</p>
            </div>

            <div className="p-4 space-y-0">
              {/* Items */}
              <div className="space-y-1">
                {movements.map((m, i) => (
                  <div key={m.id}>
                    <div className="flex justify-between items-start py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {m.product?.name || 'Produto'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {m.quantity} x R$ {m.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap ml-3">
                        R$ {m.total.toFixed(2)}
                      </p>
                    </div>
                    {i < movements.length - 1 && <Separator />}
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total de itens</span>
                  <span className="font-medium">{totalQtd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">VALOR TOTAL</span>
                  <span className="text-xl font-bold">R$ {totalGeral.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-3" />

              <p className="text-[10px] text-zinc-400 text-center">
                Cupom #{cupomId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onBack()
              setTimeout(onDashboard, 100)
            }}
          >
            Voltar ao Início
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Copiar Cupom
          </Button>
        </div>
      </div>
    </div>
  )
}

// ========================
// Movements History
// ========================
function MovementsScreen({ onBack }: { onBack: () => void }) {
  const [movements, setMovements] = useState<MovementItem[]>([])
  const [filter, setFilter] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS')

  useEffect(() => {
    const params = filter !== 'TODOS' ? `?type=${filter}` : ''
    fetch(`/api/movements${params}`)
      .then((r) => r.json())
      .then(setMovements)
  }, [filter])

  // Group by cupomId
  const grouped = movements.reduce<Record<string, MovementItem[]>>((acc, m) => {
    if (!acc[m.cupomId]) acc[m.cupomId] = []
    acc[m.cupomId].push(m)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-950 text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Movimentações</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Filter buttons */}
        <div className="flex gap-2">
          {(['TODOS', 'ENTRADA', 'SAIDA'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? f === 'ENTRADA'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : f === 'SAIDA'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : ''
              }
            >
              {f === 'TODOS' ? 'Todos' : f === 'ENTRADA' ? 'Entradas' : 'Saídas'}
            </Button>
          ))}
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-3">
            {Object.keys(grouped).length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">
                Nenhuma movimentação registrada
              </p>
            )}
            {Object.entries(grouped).map(([cupomId, items]) => {
              const isEntrada = items[0].type === 'ENTRADA'
              const total = items.reduce((sum, m) => sum + m.total, 0)
              const date = new Date(items[0].createdAt).toLocaleString('pt-BR')

              return (
                <Card key={cupomId} className="border-zinc-200">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}
                        >
                          {isEntrada ? 'ENTRADA' : 'SAÍDA'}
                        </Badge>
                        <span className="text-xs text-zinc-400">{date}</span>
                      </div>
                      <span className="font-bold text-sm">R$ {total.toFixed(2)}</span>
                    </div>
                    <Separator />
                    {items.map((m) => (
                      <div key={m.id} className="flex justify-between text-sm">
                        <span className="text-zinc-600 truncate">
                          {m.quantity}x {m.product?.name || 'Produto'}
                        </span>
                        <span className="text-zinc-400 whitespace-nowrap ml-2">
                          R$ {m.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// ========================
// Main App
// ========================
export default function Home() {
  const [view, setView] = useState<string>('pin')
  const [pinVerified, setPinVerified] = useState(false)
  const [lastCupomId, setLastCupomId] = useState<string | null>(null)
  const [productCount, setProductCount] = useState(0)
  const [todayMovements, setTodayMovements] = useState(0)
  const { toast } = useToast()

  // Fetch stats when on dashboard
  useEffect(() => {
    if (view !== 'dashboard') return
    fetch('/api/products').then((r) => r.json()).then((data) => setProductCount(data.length))
    fetch('/api/movements').then((r) => r.json()).then((data) => {
      const today = new Date().toISOString().slice(0, 10)
      const todayMov = (data as MovementItem[]).filter(
        (m) => m.createdAt && m.createdAt.slice(0, 10) === today
      )
      setTodayMovements(todayMov.length)
    })
  }, [view])

  const handleAccess = () => {
    setPinVerified(true)
    setView('dashboard')
  }

  const handleMovementComplete = (cupomId: string) => {
    setLastCupomId(cupomId)
    setView('cupom')
  }

  const navigateTo = (v: string) => setView(v)

  if (!pinVerified) {
    return <PinScreen onAccess={handleAccess} />
  }

  switch (view) {
    case 'dashboard':
      return (
        <Dashboard
          onNavigate={navigateTo}
          productCount={productCount}
          todayMovements={todayMovements}
        />
      )

    case 'produtos':
      return <ProductsScreen onBack={() => navigateTo('dashboard')} />

    case 'entrada':
      return (
        <MovementScreen
          type="ENTRADA"
          onBack={() => navigateTo('dashboard')}
          onComplete={handleMovementComplete}
        />
      )

    case 'saida':
      return (
        <MovementScreen
          type="SAIDA"
          onBack={() => navigateTo('dashboard')}
          onComplete={handleMovementComplete}
        />
      )

    case 'cupom':
      return lastCupomId ? (
        <CupomScreen
          cupomId={lastCupomId}
          onBack={() => navigateTo('dashboard')}
          onDashboard={() => navigateTo('dashboard')}
        />
      ) : null

    case 'movimentacoes':
      return <MovementsScreen onBack={() => navigateTo('dashboard')} />

    default:
      return null
  }
}
