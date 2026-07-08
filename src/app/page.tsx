'use client'

import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  User,
  Wallet,
  Minus,
  Plus,
  ChevronDown,
  CalendarDays,
  FileUp,
} from 'lucide-react'

// Types
interface Product {
  id: string
  name: string
  stock: number
  averageCost: number
}

interface MovementItem {
  id: string
  type: string
  productId: string
  quantity: number
  unitPrice: number
  averageCost: number | null
  total: number
  cupomId: string | null
  clientName: string | null
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center px-4 pb-safe">
      <div className="mb-10 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-150" />
          <div className="relative bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700/50">
            <Package className="w-10 h-10 text-emerald-400 mx-auto" />
          </div>
        </div>
        <h1 className="text-white text-xl font-bold mt-5 tracking-tight">Estoque</h1>
        <p className="text-zinc-500 text-sm mt-1.5">Digite o PIN para acessar</p>
      </div>

      <div className={`flex gap-4 mb-10 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < pin.length
                ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] scale-125'
                : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
          <button
            key={key || 'empty'}
            className={`h-[4.5rem] text-xl font-medium rounded-2xl transition-all active:scale-95 ${
              key === 'del'
                ? 'text-red-400 hover:text-red-300 hover:bg-zinc-800/80 active:bg-zinc-700'
                : key
                  ? 'text-white hover:bg-zinc-800/80 bg-zinc-800/50 border border-zinc-700/50 active:bg-zinc-700'
                  : 'invisible'
            }`}
            onClick={() => {
              if (key === 'del') handleDelete()
              else if (key) handlePinInput(key)
            }}
          >
            {key === 'del' ? <X className="w-6 h-6 mx-auto" /> : key}
          </button>
        ))}
      </div>

      <style>{`
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
  totalStockValue,
  negativeStockCount,
}: {
  onNavigate: (view: string) => void
  productCount: number
  todayMovements: number
  totalStockValue: number
  negativeStockCount: number
}) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-5 pt-safe pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {today}
            </p>
            <h1 className="text-xl font-bold mt-1 tracking-tight">Controle de Estoque</h1>
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs border-0 backdrop-blur-sm">
            {todayMovements} mov. hoje
          </Badge>
        </div>
      </header>

      <div className="px-4 -mt-1 space-y-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Valor Total em Estoque</p>
                <p className="text-3xl font-bold mt-0.5 tabular-nums tracking-tight">
                  R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-emerald-100 text-xs">{productCount} produto{productCount !== 1 ? 's' : ''}</span>
              <span className="text-emerald-100 text-xs">{todayMovements} movimentação{todayMovements !== 1 ? 'ões' : ''} hoje</span>
            </div>
          </CardContent>
        </Card>

        {negativeStockCount > 0 && (
          <button
            onClick={() => onNavigate('produtos')}
            className="w-full border-0 shadow-sm bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative rounded-2xl"
          >
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-red-100 text-[10px] font-medium uppercase tracking-wider">Estoque Negativo</p>
                  <p className="text-base font-bold mt-0.5">
                    {negativeStockCount} produto{negativeStockCount !== 1 ? 's' : ''} sem estoque
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-white/50 rotate-[-90deg]" />
              </div>
            </CardContent>
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('entrada')}
            className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 text-left transition-all active:scale-[0.97] hover:shadow-md group"
          >
            <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-active:bg-emerald-200 transition-colors">
              <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="font-semibold text-sm text-zinc-900">Entrada</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-tight">Registrar entrada de produtos</p>
          </button>

          <button
            onClick={() => onNavigate('saida')}
            className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 text-left transition-all active:scale-[0.97] hover:shadow-md group"
          >
            <div className="h-11 w-11 rounded-xl bg-red-100 flex items-center justify-center mb-3 group-active:bg-red-200 transition-colors">
              <ArrowUpFromLine className="w-5 h-5 text-red-600" />
            </div>
            <p className="font-semibold text-sm text-zinc-900">Saída</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-tight">Registrar venda/saída</p>
          </button>

          <button
            onClick={() => onNavigate('produtos')}
            className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 text-left transition-all active:scale-[0.97] hover:shadow-md group"
          >
            <div className="h-11 w-11 rounded-xl bg-zinc-100 flex items-center justify-center mb-3 group-active:bg-zinc-200 transition-colors">
              <PackagePlus className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="font-semibold text-sm text-zinc-900">Produtos</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-tight">Cadastrar e gerenciar</p>
          </button>

          <button
            onClick={() => onNavigate('movimentacoes')}
            className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 text-left transition-all active:scale-[0.97] hover:shadow-md group"
          >
            <div className="h-11 w-11 rounded-xl bg-zinc-100 flex items-center justify-center mb-3 group-active:bg-zinc-200 transition-colors">
              <History className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="font-semibold text-sm text-zinc-900">Histórico</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-tight">Entradas e saídas</p>
          </button>
          <button
            onClick={() => onNavigate('nfe')}
            className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 text-left transition-all active:scale-[0.97] hover:shadow-md group"
          >
            <div className="h-11 w-11 rounded-xl bg-teal-100 flex items-center justify-center mb-3 group-active:bg-teal-200 transition-colors"><FileUp className="w-5 h-5 text-teal-600" /></div>
            <p className="font-semibold text-sm text-zinc-900">Entrada NF-e</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-tight">Importar XML de entrada</p>
          </button>

          <button
            onClick={() => onNavigate('nfe_saida')}
            className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 text-left transition-all active:scale-[0.97] hover:shadow-md group"
          >
            <div className="h-11 w-11 rounded-xl bg-orange-100 flex items-center justify-center mb-3 group-active:bg-orange-200 transition-colors"><ArrowUpFromLine className="w-5 h-5 text-orange-600" /></div>
            <p className="font-semibold text-sm text-zinc-900">Saída NF-e</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-tight">Importar XML de saída</p>
          </button>
        </div>
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
  const [stock, setStock] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [, startTransition] = useTransition()

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (Array.isArray(data)) {
        startTransition(() => setProducts(data))
      }
    } catch {
      toast({ title: 'Erro ao carregar produtos', variant: 'destructive' })
    }
  }, [toast, startTransition])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name, stock: stock || undefined }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast({ title: data.error || 'Erro ao atualizar', variant: 'destructive' })
          setLoading(false)
          return
        }
        toast({ title: 'Produto atualizado!' })
        setEditingId(null)
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast({ title: data.error || 'Erro ao cadastrar', variant: 'destructive' })
          setLoading(false)
          return
        }
        toast({ title: 'Produto cadastrado!' })
      }
      setName('')
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
    setStock(p.stock > 0 ? p.stock.toString() : '')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este produto e todas suas entradas/movimentações?')) return
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: data.error || 'Erro ao deletar', variant: 'destructive' })
        return
      }
      toast({ title: 'Produto removido' })
      loadProducts()
    } catch {
      toast({ title: 'Erro ao deletar', variant: 'destructive' })
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setStock('')
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Produtos</h1>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm text-zinc-500 font-medium">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <Input
              placeholder="Nome do produto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            {editingId && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 font-medium">Estoque</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="h-11 text-sm"
                />
                <p className="text-[10px] text-zinc-400">Ajuste manual. Entradas/saídas movem o estoque automaticamente.</p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl"
              >
                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={cancelEdit} className="h-11 rounded-xl">Cancelar</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2.5">
            {products.length === 0 && (
              <p className="text-center text-zinc-400 py-12 text-sm">Nenhum produto cadastrado</p>
            )}
            {products.map((p) => (
              <Card key={p.id} className={`border-0 shadow-sm overflow-hidden ${p.stock < 0 ? 'ring-1 ring-red-300' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex">
                    <div className={`w-1 shrink-0 ${p.stock > 0 ? 'bg-emerald-500' : p.stock === 0 ? 'bg-zinc-300' : 'bg-red-500'}`} />
                    <div className="flex-1 p-3.5 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{p.name}</p>
                          {p.stock < 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0 border-0 shrink-0">
                              NEGATIVO
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-zinc-500">
                            Custo médio: R$ {p.averageCost.toFixed(2)}
                          </span>
                        </div>
                        <span className={`text-xs font-medium mt-1 inline-block ${p.stock > 0 ? 'text-zinc-500' : p.stock < 0 ? 'text-red-600 font-bold' : 'text-zinc-400'}`}>
                          Estoque: {p.stock} un.
                          {p.stock < 0 && (
                            <> <span className="text-red-400">— necessario repor {Math.abs(p.stock)} un.</span></>
                          )}
                          {p.stock > 0 && p.averageCost > 0 && (
                            <> · Valor: R$ {(p.stock * p.averageCost).toFixed(2)}</>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-0.5 ml-3">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handleEdit(p)}>
                          <Edit3 className="w-4 h-4 text-zinc-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
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
  const [costPrices, setCostPrices] = useState<Record<string, string>>({})
  const [salePrices, setSalePrices] = useState<Record<string, string>>({})
  const [averageCosts, setAverageCosts] = useState<Record<string, number>>({})
  const [clientName, setClientName] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((data: Product[]) => {
      if (!Array.isArray(data)) return
      setProducts(data)
      const avgs: Record<string, number> = {}
      data.forEach((p) => { avgs[p.id] = p.averageCost })
      setAverageCosts(avgs)
    })
  }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const getQty = (id: string) => parseInt(quantities[id] || '0') || 0

  const adjustQty = (id: string, delta: number) => {
    const current = getQty(id)
    const next = Math.max(0, current + delta)
    setQuantities((prev) => ({ ...prev, [id]: next === 0 ? '' : String(next) }))
  }

  const handleQtyInput = (id: string, val: string) => {
    setQuantities((prev) => ({ ...prev, [id]: val }))
  }

  const setCost = (id: string, val: string) => {
    setCostPrices((prev) => ({ ...prev, [id]: val }))
  }

  const setSale = (id: string, val: string) => {
    setSalePrices((prev) => ({ ...prev, [id]: val }))
  }

  const selectedItems = Object.entries(quantities)
    .filter(([, q]) => q && parseInt(q) > 0)
    .map(([productId, quantity]) => ({
      productId,
      quantity: parseInt(quantity),
      costPrice: costPrices[productId] || '0',
      salePrice: salePrices[productId] || '0',
    }))

  const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalValue = selectedItems.reduce((sum, item) => {
    if (isEntrada) {
      return sum + (parseFloat(item.costPrice) || 0) * item.quantity
    }
    return sum + (parseFloat(item.salePrice) || 0) * item.quantity
  }, 0)

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({ title: 'Selecione ao menos um produto', variant: 'destructive' })
      return
    }

    if (!clientName.trim()) {
      toast({ title: isEntrada ? 'Informe o nome do fornecedor' : 'Informe o nome do cliente', variant: 'destructive' })
      return
    }

    if (isEntrada) {
      const missingCost = selectedItems.find(i => !i.costPrice || parseFloat(i.costPrice) <= 0)
      if (missingCost) {
        const p = products.find(pr => pr.id === missingCost.productId)
        toast({ title: `Informe o custo para ${p?.name || 'o produto'}`, variant: 'destructive' })
        return
      }
    }

    if (!isEntrada) {
      const missingSale = selectedItems.find(i => !i.salePrice || parseFloat(i.salePrice) <= 0)
      if (missingSale) {
        const p = products.find(pr => pr.id === missingSale.productId)
        toast({ title: `Informe o preço de venda para ${p?.name || 'o produto'}`, variant: 'destructive' })
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          items: selectedItems,
          clientName: clientName.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error, variant: 'destructive' })
        setLoading(false)
        return
      }

      toast({ title: `${isEntrada ? 'Entrada' : 'Venda'} registrada!` })
      onComplete(data.cupomId)
    } catch {
      toast({ title: 'Erro ao registrar', variant: 'destructive' })
    }
    setLoading(false)
  }

  const accentColor = isEntrada
    ? { active: 'bg-emerald-50 border-emerald-300', btn: 'bg-emerald-500 hover:bg-emerald-600 text-white', badge: 'bg-emerald-500/15 text-emerald-700' }
    : { active: 'bg-red-50 border-red-300', btn: 'bg-red-500 hover:bg-red-600 text-white', badge: 'bg-red-500/15 text-red-700' }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-safe">
      <header className={`text-white px-4 py-4 pt-safe shrink-0 ${
        isEntrada
          ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
          : 'bg-gradient-to-br from-red-500 to-red-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 -ml-2" onClick={onBack}>
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">
                {isEntrada ? 'Entrada' : 'Venda'}
              </h1>
              <p className="text-[11px] opacity-70">
                {isEntrada ? 'Registrar entrada' : 'Registrar venda'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tabular-nums">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] opacity-70">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </p>
          </div>
        </div>
      </header>

      <div className="w-full px-4 pt-4 space-y-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2.5 bg-white border border-zinc-200 shadow-sm rounded-xl px-3.5 py-3 shrink-0">
          <User className={`w-4 h-4 shrink-0 ${isEntrada ? 'text-emerald-500' : 'text-red-500'}`} />
          <input
            type="text"
            placeholder={isEntrada ? 'Nome do fornecedor' : 'Nome do cliente'}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent min-w-0"
          />
        </div>

        <div className="shrink-0">
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 text-sm shadow-sm border-zinc-200 rounded-xl"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pb-2">
          <div className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-center text-zinc-400 py-12 text-sm">
                {search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </p>
            )}
            {filtered.map((p) => {
              const qty = getQty(p.id)
              const isActive = qty > 0
              const avgCost = averageCosts[p.id] || 0

              return (
                <div
                  key={p.id}
                  className={`border rounded-xl p-3 transition-all shadow-sm ${isActive ? accentColor.active : 'border-zinc-200 bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-semibold truncate leading-tight">{p.name}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${isActive ? accentColor.badge : 'bg-zinc-100 text-zinc-400'}`}>
                      {p.stock} un.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEntrada ? (
                      <div className="shrink-0">
                        <label className="text-[9px] text-zinc-400 font-medium block mb-0.5">Custo (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={costPrices[p.id] || ''}
                          onChange={(e) => setCost(p.id, e.target.value)}
                          className="w-[72px] text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-400 text-right tabular-nums h-8"
                        />
                      </div>
                    ) : (
                      <div className="shrink-0">
                        <label className="text-[9px] text-zinc-400 font-medium block mb-0.5">Venda (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={salePrices[p.id] || ''}
                          onChange={(e) => setSale(p.id, e.target.value)}
                          className="w-[72px] text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-red-400 text-right tabular-nums h-8"
                        />
                      </div>
                    )}

                    {!isEntrada && avgCost > 0 && (
                      <div className="shrink-0">
                        <label className="text-[9px] text-zinc-400 font-medium block mb-0.5">Custo médio</label>
                        <span className="text-[10px] text-amber-600 font-medium tabular-nums flex items-center h-8">
                          R$ {avgCost.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1" />

                    {isActive && (
                      <span className="text-xs font-bold text-zinc-700 mr-1 shrink-0 tabular-nums">
                        R$ {(isEntrada
                          ? (parseFloat(costPrices[p.id] || '0') * qty)
                          : (parseFloat(salePrices[p.id] || '0') * qty)
                        ).toFixed(2)}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => adjustQty(p.id, -1)}
                        disabled={qty <= 0}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          qty > 0
                            ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700 active:bg-zinc-400'
                            : 'bg-zinc-100 text-zinc-300'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={qty || ''}
                        onChange={(e) => handleQtyInput(p.id, e.target.value)}
                        placeholder="0"
                        className={`w-12 h-10 text-center text-sm font-bold rounded-xl border outline-none tabular-nums ${
                          isActive
                            ? isEntrada
                              ? 'border-emerald-300 bg-white'
                              : 'border-red-300 bg-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-800'
                        }`}
                      />

                      <button
                        onClick={() => adjustQty(p.id, 1)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${accentColor.btn}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-4 space-y-3 shrink-0 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{selectedItems.length} produto{selectedItems.length !== 1 ? 's' : ''} · {totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
              <span className="font-bold text-lg tabular-nums">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full h-12 text-base font-semibold text-white rounded-xl ${
                isEntrada
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading
                ? 'Registrando...'
                : isEntrada
                  ? 'Confirmar Entrada'
                  : 'Confirmar Venda'}
            </Button>
          </div>
        )}
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
}: {
  cupomId: string
  onBack: () => void
}) {
  const [movements, setMovements] = useState<MovementItem[]>([])
  const [deleted, setDeleted] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch(`/api/movements?cupomId=${cupomId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMovements(data)
      })
  }, [cupomId])

  const totalGeral = movements.reduce((sum, m) => sum + m.total, 0)
  const totalQtd = movements.reduce((sum, m) => sum + m.quantity, 0)
  const isEntrada = movements[0]?.type === 'ENTRADA'
  const clientName = movements[0]?.clientName
  const date = movements[0]?.createdAt
    ? new Date(movements[0].createdAt).toLocaleString('pt-BR')
    : ''
  const shortId = cupomId.slice(0, 8).toUpperCase()

  const totalCost = movements.reduce((sum, m) => sum + ((m.averageCost || 0) * m.quantity), 0)
  const profit = totalGeral - totalCost

  const handleDelete = async () => {
    if (!confirm(`Excluir esta ${movements[0]?.type === 'ENTRADA' ? 'entrada' : 'venda'}?\nO estoque será revertido automaticamente.`)) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/movements?cupomId=${cupomId}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error || 'Erro ao excluir', variant: 'destructive' })
        setDeleting(false)
        return
      }

      toast({ title: `${movements[0]?.type === 'ENTRADA' ? 'Entrada' : 'Venda'} excluída! Estoque revertido.` })
      setDeleted(true)
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
    setDeleting(false)
  }

  const handleCopy = () => {
    const separator = '------------------------------------------------'
    const itemLines = movements.map((m) => {
      if (m.type === 'ENTRADA') {
        return `  ${String(m.quantity).padStart(3)}x  ${(m.product?.name || 'Produto').padEnd(22)} ${m.unitPrice.toFixed(2).padStart(7)}  ${m.total.toFixed(2).padStart(10)}`
      }
      return `  ${String(m.quantity).padStart(3)}x  ${(m.product?.name || 'Produto').padEnd(18)} ${m.unitPrice.toFixed(2).padStart(7)}  ${(m.averageCost || 0).toFixed(2).padStart(7)}  ${m.total.toFixed(2).padStart(10)}`
    })
    const headerLine = isEntrada
      ? '  QTD  PRODUTO                   CUSTO      TOTAL'
      : '  QTD  PRODUTO              VENDA  CUSTO_M     TOTAL'
    const text = [
      '',
      '             CONTROLE DE ESTOQUE',
      '',
      `  ${isEntrada ? 'ENTRADA DE MERCADORIA' : '   COMPROVANTE DE VENDA'}`,
      '',
      `  Data: ${date}`,
      clientName ? `  ${isEntrada ? 'Fornecedor' : 'Cliente'}: ${clientName}` : '',
      '',
      separator,
      headerLine,
      separator,
      ...itemLines,
      separator,
      '',
      `  Total de itens: ${totalQtd}`,
      `  VALOR TOTAL: R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      !isEntrada ? `  Custo total:  R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '',
      !isEntrada ? `  Lucro:        R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '',
      '',
      `  Cupom: #${shortId}`,
      '',
    ].filter(Boolean).join('\n')

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast({ title: 'Cupom copiado!' })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 pb-safe">
      <header className={`text-white px-4 py-4 pt-safe ${
        isEntrada
          ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
          : 'bg-gradient-to-br from-red-500 to-red-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 -ml-2" onClick={onBack}>
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {isEntrada ? 'Cupom de Entrada' : 'Comprovante de Venda'}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/15"
            onClick={handleCopy}
          >
            <Printer className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-zinc-900 text-white text-center py-6 px-4 relative">
            <div className="absolute top-0 left-0 right-0 h-3 bg-zinc-100 rounded-b-3xl" />
            <div className="relative z-10 mt-2">
              <Package className="w-7 h-7 mx-auto mb-2 text-emerald-400" />
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Controle de Estoque</p>
              <h2 className="font-bold text-lg mt-1 tracking-wide">
                {isEntrada ? 'ENTRADA' : 'VENDA'}
              </h2>
              <p className="text-xs opacity-50 mt-1">{date}</p>
            </div>
          </div>

          {clientName && (
            <div className={`${isEntrada ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} border-b px-4 py-3`}>
              <div className="flex items-center gap-2">
                <User className={`w-4 h-4 ${isEntrada ? 'text-emerald-500' : 'text-red-500'}`} />
                <span className={`text-xs font-medium uppercase tracking-wide ${isEntrada ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isEntrada ? 'Fornecedor' : 'Cliente'}
                </span>
              </div>
              <p className="font-semibold text-sm mt-0.5">{clientName}</p>
            </div>
          )}

          <div className="px-4 py-3">
            {isEntrada ? (
              <>
                <div className="flex text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2 px-1">
                  <span className="flex-1">Produto</span>
                  <span className="w-10 text-right">Qtd</span>
                  <span className="w-16 text-right">Custo</span>
                  <span className="w-20 text-right">Total</span>
                </div>
                {movements.map((m, i) => (
                  <div key={m.id}>
                    <div className="flex items-center py-2.5 px-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">
                          {m.product?.name || 'Produto'}
                        </p>
                      </div>
                      <span className="w-10 text-right text-sm text-zinc-600">{m.quantity}</span>
                      <span className="w-16 text-right text-sm text-zinc-600 tabular-nums">
                        R$ {m.unitPrice.toFixed(2)}
                      </span>
                      <span className="w-20 text-right text-sm font-semibold text-zinc-800 tabular-nums">
                        R$ {m.total.toFixed(2)}
                      </span>
                    </div>
                    {i < movements.length - 1 && (
                      <div className="border-b border-dashed border-zinc-200 mx-1" />
                    )}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2 px-1">
                  <span className="flex-1">Produto</span>
                  <span className="w-10 text-right">Qtd</span>
                  <span className="w-16 text-right">Venda</span>
                  <span className="w-16 text-right">Custo M.</span>
                  <span className="w-20 text-right">Total</span>
                </div>
                {movements.map((m, i) => (
                  <div key={m.id}>
                    <div className="flex items-center py-2.5 px-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">
                          {m.product?.name || 'Produto'}
                        </p>
                      </div>
                      <span className="w-10 text-right text-sm text-zinc-600">{m.quantity}</span>
                      <span className="w-16 text-right text-sm text-zinc-600 tabular-nums">
                        R$ {m.unitPrice.toFixed(2)}
                      </span>
                      <span className="w-16 text-right text-xs text-amber-600 tabular-nums">
                        R$ {(m.averageCost || 0).toFixed(2)}
                      </span>
                      <span className="w-20 text-right text-sm font-semibold text-zinc-800 tabular-nums">
                        R$ {m.total.toFixed(2)}
                      </span>
                    </div>
                    {i < movements.length - 1 && (
                      <div className="border-b border-dashed border-zinc-200 mx-1" />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="border-t-2 border-zinc-900 px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-zinc-400">{totalQtd} {totalQtd === 1 ? 'item' : 'itens'}</p>
                {!isEntrada && (
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    Custo médio total: R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {profit >= 0 ? (
                      <span className="text-emerald-600 ml-2">+R$ {profit.toFixed(2)}</span>
                    ) : (
                      <span className="text-red-500 ml-2">R$ {profit.toFixed(2)}</span>
                    )}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Total</p>
                <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                  R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 border-t border-dashed border-zinc-200 px-4 py-3 text-center relative">
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-zinc-100 rounded-t-3xl" />
            <div className="relative z-10 mb-2">
              <p className="text-[10px] text-zinc-400 tracking-widest uppercase">
                Cupom #{shortId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={onBack}>
            Voltar ao Início
          </Button>
          <Button onClick={handleCopy} className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl">
            <Printer className="w-4 h-4 mr-2" />
            Copiar
          </Button>
        </div>

        {!deleted && (
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full h-11 text-red-500 hover:text-red-600 hover:bg-red-50 text-sm mt-2 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Excluindo...' : 'Excluir esta movimentação'}
          </Button>
        )}

        {deleted && (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-red-600">Movimentação excluída</p>
            <p className="text-xs text-zinc-400 mt-1">O estoque foi revertido com sucesso.</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={onBack}>
              Voltar ao Início
            </Button>
          </div>
        )}
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { toast } = useToast()

  const [, startTransition] = useTransition()

  const loadMovements = useCallback(async () => {
    try {
      const params = filter !== 'TODOS' ? `?type=${filter}` : ''
      const res = await fetch(`/api/movements${params}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        startTransition(() => setMovements(data))
      }
    } catch {
      toast({ title: 'Erro ao carregar movimentações', variant: 'destructive' })
    }
  }, [filter, toast, startTransition])

  useEffect(() => { loadMovements() }, [loadMovements])

  const grouped = movements.reduce<Record<string, MovementItem[]>>((acc, m) => {
    if (!acc[m.cupomId || 'orphan']) acc[m.cupomId || 'orphan'] = []
    acc[m.cupomId || 'orphan'].push(m)
    return acc
  }, {})

  const handleDelete = async (cupomIdVal: string, type: string) => {
    if (!confirm(`Excluir esta ${type === 'ENTRADA' ? 'entrada' : 'venda'}?\nO estoque será revertido automaticamente.`)) return

    try {
      const res = await fetch(`/api/movements?cupomId=${cupomIdVal}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error || 'Erro ao excluir', variant: 'destructive' })
        return
      }

      toast({ title: `${type === 'ENTRADA' ? 'Entrada' : 'Venda'} excluída! Estoque revertido.` })
      setExpandedId(null)
      loadMovements()
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Movimentações</h1>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="flex gap-2">
          {(['TODOS', 'ENTRADA', 'SAIDA'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? f === 'ENTRADA'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : f === 'SAIDA'
                      ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                      : 'bg-zinc-900 text-white shadow-sm shadow-zinc-300'
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {f === 'TODOS' ? 'Todos' : f === 'ENTRADA' ? 'Entradas' : 'Vendas'}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pb-4">
          <div className="space-y-2.5">
            {Object.keys(grouped).length === 0 && (
              <p className="text-center text-zinc-400 py-12 text-sm">
                Nenhuma movimentação registrada
              </p>
            )}
            {Object.entries(grouped).map(([cupomId, items]) => {
              const isEntrada = items[0].type === 'ENTRADA'
              const total = items.reduce((sum, m) => sum + m.total, 0)
              const totalQtd = items.reduce((sum, m) => sum + m.quantity, 0)
              const dateShort = new Date(items[0].createdAt).toLocaleDateString('pt-BR')
              const dateFull = new Date(items[0].createdAt).toLocaleString('pt-BR')
              const client = items[0].clientName
              const isExpanded = expandedId === cupomId

              return (
                <div key={cupomId}>
                  <div
                    onClick={() => setExpandedId((prev) => prev === cupomId ? null : cupomId)}
                    className={`border rounded-xl p-3.5 transition-all cursor-pointer active:scale-[0.99] shadow-sm ${
                      isExpanded
                        ? isEntrada
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-red-300 bg-red-50/50'
                        : 'border-zinc-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isEntrada ? 'ENTRADA' : 'VENDA'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-zinc-400">{dateShort}</span>
                          {client && (
                            <>
                              <span className="text-zinc-300">·</span>
                              <span className={`text-xs font-medium truncate ${
                                isEntrada ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {client}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {totalQtd} {totalQtd === 1 ? 'item' : 'itens'}
                          {!isExpanded && ' · toque para detalhes'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-bold text-sm tabular-nums mr-1">
                          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-x border-b rounded-b-xl bg-white shadow-sm overflow-hidden">
                      <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-100">
                        <div className="flex justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                          <span className="flex-1">Produto</span>
                          <span className="w-10 text-right">Qtd</span>
                          <span className="w-16 text-right">Unit.</span>
                          {!isEntrada && <span className="w-16 text-right">Custo M.</span>}
                          <span className={`w-[72px] text-right`}>Total</span>
                        </div>
                      </div>
                      {items.map((m) => (
                        <div key={m.id} className="flex items-center px-3.5 py-2">
                          <span className="flex-1 text-xs text-zinc-700 truncate">
                            {m.product?.name || 'Produto'}
                          </span>
                          <span className="w-10 text-right text-xs text-zinc-500">{m.quantity}</span>
                          <span className="w-16 text-right text-xs text-zinc-500 tabular-nums">
                            R$ {m.unitPrice.toFixed(2)}
                          </span>
                          {!isEntrada && (
                            <span className="w-16 text-right text-[10px] text-amber-600 tabular-nums">
                              R$ {(m.averageCost || 0).toFixed(2)}
                            </span>
                          )}
                          <span className={`w-[72px] text-right text-xs font-semibold text-zinc-800 tabular-nums`}>
                            R$ {m.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="px-3.5 py-2.5 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-[11px] text-zinc-400">{dateFull}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tabular-nums">
                            Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(cupomId, items[0].type) }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-red-500 hover:text-white hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ========================
// NF-e Upload Screen
// ========================
interface NfeProduct {
  name: string
  quantity: number
  unit: string
  unitCost: number
  total: number
  ncm: string
  cfop: string
}

interface NfeData {
  numero: string
  serie: string
  dataEmissao: string
  emitente: { cnpj: string; nome: string; uf: string }
  produtos: NfeProduct[]
  valorTotal: number
  valorProdutos: number
}

function NfeScreen({ onBack }: { onBack: () => void }) {
  const [nfeData, setNfeData] = useState<NfeData | null>(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { toast } = useToast()

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xml')) {
      toast({ title: 'Apenas arquivos .xml', variant: 'destructive' })
      return
    }

    setFileName(file.name)
    setLoading(true)
    setNfeData(null)

    const formData = new FormData()
    formData.append('xml', file)
    formData.append('action', 'parse')

    try {
      const res = await fetch('/api/nfe', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error || 'Erro ao ler NF-e', variant: 'destructive' })
        setLoading(false)
        return
      }

      setNfeData(data.data)
      toast({ title: `${data.data.produtos.length} produto(s) encontrados!` })
    } catch {
      toast({ title: 'Erro ao processar arquivo', variant: 'destructive' })
    }
    setLoading(false)
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const storedFileRef = React.useRef<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      storedFileRef.current = file
      handleFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      storedFileRef.current = file
      handleFile(file)
    }
  }

  const handleConfirmImport = async () => {
    if (!nfeData || !storedFileRef.current) {
      toast({ title: 'Arquivo nao encontrado, faca upload novamente', variant: 'destructive' })
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append('xml', storedFileRef.current)
    formData.append('action', 'confirm')

    try {
      const res = await fetch('/api/nfe', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error || 'Erro ao importar', variant: 'destructive' })
        setImporting(false)
        return
      }

      toast({ title: `NF-e importada! ${data.totalItens} itens importados` })
      onBack()
    } catch {
      toast({ title: 'Erro ao importar NF-e', variant: 'destructive' })
    }
    setImporting(false)
  }

  const totalQtd = nfeData?.produtos.reduce((s, p) => s + p.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-safe">
      <header className="bg-gradient-to-br from-teal-600 to-teal-700 text-white px-4 py-4 pt-safe shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 -ml-2" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Entrada por NF-e</h1>
            <p className="text-[11px] opacity-70">Importar Nota Fiscal eletronica</p>
          </div>
        </div>
      </header>

      <div className="w-full px-4 pt-4 space-y-4 flex-1 flex flex-col min-h-0">
        {/* Upload area */}
        {!nfeData && (
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragOver ? 'border-teal-400 bg-teal-50' : 'border-zinc-300 bg-white hover:border-zinc-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              className="hidden"
              onChange={handleFileChange}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-teal-500 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500">Lendo NF-e...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-3">
                  <FileUp className="w-7 h-7 text-teal-600" />
                </div>
                <p className="font-semibold text-sm text-zinc-700">
                  {dragOver ? 'Solte o arquivo aqui' : 'Toque para selecionar o XML'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Arraste o arquivo .xml da NF-e ou toque para buscar
                </p>
              </>
            )}
          </div>
        )}

        {/* NF-e Data */}
        {nfeData && (
          <>
            {/* NF Header */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Nota Fiscal Eletronica</p>
                    <p className="font-bold text-base text-zinc-900 mt-0.5">
                      NF-e {nfeData.numero?.padStart(9, '0')}{nfeData.serie ? ` Serie ${nfeData.serie}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs border-0 shrink-0 mt-3">
                    {nfeData.dataEmissao}
                  </Badge>
                </div>
                <div className="text-xs text-zinc-500 space-y-0.5">
                  <p><span className="font-medium text-zinc-700">Emitente:</span> {nfeData.emitente.nome}</p>
                  {nfeData.emitente.cnpj && <p><span className="font-medium text-zinc-700">CNPJ:</span> {nfeData.emitente.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</p>}
                  {nfeData.emitente.uf && <p><span className="font-medium text-zinc-700">UF:</span> {nfeData.emitente.uf}</p>}
                </div>
                <div className="flex gap-3 pt-1">
                  <div className="flex-1 bg-zinc-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-zinc-400">Produtos</p>
                    <p className="text-lg font-bold text-zinc-800">{nfeData.produtos.length}</p>
                  </div>
                  <div className="flex-1 bg-zinc-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-zinc-400">Itens total</p>
                    <p className="text-lg font-bold text-zinc-800">{totalQtd}</p>
                  </div>
                  <div className="flex-1 bg-teal-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-teal-600">Valor NF</p>
                    <p className="text-lg font-bold text-teal-700 tabular-nums">
                      R$ {nfeData.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2 px-1 flex">
                <span className="flex-1">Produto</span>
                <span className="w-12 text-right">Qtd</span>
                <span className="w-14 text-right">Unit.</span>
                <span className="w-14 text-right">Un.</span>
                <span className="w-20 text-right">Total</span>
              </div>
              <div className="space-y-1.5">
                {nfeData.produtos.map((p, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-zinc-800 leading-tight mb-1.5">{p.name}</p>
                      <div className="flex items-center text-xs">
                        <span className="flex-1 text-zinc-400 truncate">
                          {p.ncm ? `NCM: ${p.ncm}` : ''}{p.cfop ? ` · CFOP: ${p.cfop}` : ''}
                        </span>
                        <span className="w-12 text-right text-zinc-600">{p.quantity}</span>
                        <span className="w-14 text-right text-zinc-600 tabular-nums">R$ {p.unitCost.toFixed(2)}</span>
                        <span className="w-14 text-right text-zinc-400">{p.unit}</span>
                        <span className="w-20 text-right font-semibold text-zinc-800 tabular-nums">R$ {p.total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 shrink-0 mt-2">
              <Button
                onClick={handleConfirmImport}
                disabled={importing}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"
              >
                {importing ? 'Importando...' : `Confirmar Importacao de ${nfeData.produtos.length} produto(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setNfeData(null); setFileName('') }}
                className="w-full h-10 rounded-xl"
              >
                Enviar outro XML
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ========================
// NF-e Saida Screen
// ========================
interface NfeProductStock {
  name: string
  exists: boolean
  currentStock: number
  dbId?: string
}

function NfeSaidaScreen({ onBack }: { onBack: () => void }) {
  const [nfeData, setNfeData] = useState<NfeData | null>(null)
  const [productsWithStock, setProductsWithStock] = useState<NfeProductStock[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [importResult, setImportResult] = useState<{
    totalItens: number
    negativeStockCount: number
    negativeItems: { name: string; previousStock: number; newStock: number }[]
  } | null>(null)
  const { toast } = useToast()

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const storedFileRef = React.useRef<File | null>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xml')) {
      toast({ title: 'Apenas arquivos .xml', variant: 'destructive' })
      return
    }

    setFileName(file.name)
    setLoading(true)
    setNfeData(null)
    setProductsWithStock([])
    setImportResult(null)

    const formData = new FormData()
    formData.append('xml', file)
    formData.append('action', 'parse')
    formData.append('nfeType', 'saida')

    try {
      const res = await fetch('/api/nfe', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error || 'Erro ao ler NF-e', variant: 'destructive' })
        setLoading(false)
        return
      }

      setNfeData(data.data)
      setProductsWithStock(data.productsWithStock || [])
      toast({ title: `${data.data.produtos.length} produto(s) encontrados!` })
    } catch {
      toast({ title: 'Erro ao processar arquivo', variant: 'destructive' })
    }
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      storedFileRef.current = file
      handleFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      storedFileRef.current = file
      handleFile(file)
    }
  }

  const handleConfirmImport = async () => {
    if (!nfeData || !storedFileRef.current) {
      toast({ title: 'Arquivo nao encontrado, faca upload novamente', variant: 'destructive' })
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append('xml', storedFileRef.current)
    formData.append('action', 'confirm')
    formData.append('nfeType', 'saida')

    try {
      const res = await fetch('/api/nfe', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error || 'Erro ao importar', variant: 'destructive' })
        setImporting(false)
        return
      }

      if (data.negativeStockCount > 0) {
        toast({
          title: `Saida importada! ${data.negativeStockCount} produto(s) com estoque negativo`,
          description: 'Verifique os itens em vermelho abaixo',
          variant: 'destructive',
        })
      } else {
        toast({ title: `NF-e de saida importada! ${data.totalItens} itens` })
      }

      setImportResult({
        totalItens: data.totalItens,
        negativeStockCount: data.negativeStockCount,
        negativeItems: data.negativeItems || [],
      })
    } catch {
      toast({ title: 'Erro ao importar NF-e', variant: 'destructive' })
    }
    setImporting(false)
  }

  const getStockInfo = (productName: string) => {
    return productsWithStock.find(p => p.name === productName)
  }

  const totalQtd = nfeData?.produtos.reduce((s, p) => s + p.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-safe">
      <header className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 py-4 pt-safe shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 -ml-2" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Saida por NF-e</h1>
            <p className="text-[11px] opacity-70">Importar Nota Fiscal de saida</p>
          </div>
        </div>
      </header>

      <div className="w-full px-4 pt-4 space-y-4 flex-1 flex flex-col min-h-0">
        {/* Upload area */}
        {!nfeData && !importResult && (
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragOver ? 'border-orange-400 bg-orange-50' : 'border-zinc-300 bg-white hover:border-zinc-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              className="hidden"
              onChange={handleFileChange}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500">Lendo NF-e de saida...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <FileUp className="w-7 h-7 text-orange-600" />
                </div>
                <p className="font-semibold text-sm text-zinc-700">
                  {dragOver ? 'Solte o arquivo aqui' : 'Toque para selecionar o XML'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Arraste o XML da NF-e de saida ou toque para buscar
                </p>
              </>
            )}
          </div>
        )}

        {/* Import Result Summary */}
        {importResult && (
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${importResult.negativeStockCount > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                  {importResult.negativeStockCount > 0
                    ? <Package className="w-5 h-5 text-red-600" />
                    : <Package className="w-5 h-5 text-emerald-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-zinc-900">
                    {importResult.totalItens} produto(s) saida registrada
                  </p>
                  <p className="text-xs text-zinc-500">
                    {importResult.negativeStockCount > 0
                      ? `${importResult.negativeStockCount} com estoque negativo`
                      : 'Todos com estoque suficiente'}
                  </p>
                </div>
              </div>

              {importResult.negativeItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Itens com estoque negativo</p>
                  {importResult.negativeItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-red-800 font-medium truncate mr-2">{item.name}</span>
                      <span className="text-red-600 font-bold tabular-nums shrink-0">
                        {item.newStock} un.
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-red-500 pt-1">
                    Estes itens precisam ser repostos. O estoque negativo indica saida sem estoque disponivel.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={onBack}
                  className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl"
                >
                  Voltar ao Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setNfeData(null); setProductsWithStock([]); setImportResult(null); setFileName('') }}
                  className="h-11 rounded-xl"
                >
                  Importar outra
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NF-e Data Preview */}
        {nfeData && !importResult && (
          <>
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Nota Fiscal de Saida</p>
                    <p className="font-bold text-base text-zinc-900 mt-0.5">
                      NF-e {nfeData.numero?.padStart(9, '0')}{nfeData.serie ? ` Serie ${nfeData.serie}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs border-0 shrink-0 mt-3">
                    {nfeData.dataEmissao}
                  </Badge>
                </div>
                <div className="text-xs text-zinc-500 space-y-0.5">
                  <p><span className="font-medium text-zinc-700">Emitente:</span> {nfeData.emitente.nome}</p>
                  {nfeData.emitente.cnpj && <p><span className="font-medium text-zinc-700">CNPJ:</span> {nfeData.emitente.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</p>}
                </div>
                <div className="flex gap-3 pt-1">
                  <div className="flex-1 bg-zinc-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-zinc-400">Produtos</p>
                    <p className="text-lg font-bold text-zinc-800">{nfeData.produtos.length}</p>
                  </div>
                  <div className="flex-1 bg-zinc-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-zinc-400">Itens total</p>
                    <p className="text-lg font-bold text-zinc-800">{totalQtd}</p>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-orange-600">Valor NF</p>
                    <p className="text-lg font-bold text-orange-700 tabular-nums">
                      R$ {nfeData.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products list with stock info */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2 px-1 flex">
                <span className="flex-1">Produto</span>
                <span className="w-14 text-right">Estoque</span>
                <span className="w-12 text-right">Qtd</span>
                <span className="w-20 text-right">V. Unit.</span>
                <span className="w-20 text-right">Total</span>
              </div>
              <div className="space-y-1.5">
                {nfeData.produtos.map((p, i) => {
                  const stockInfo = getStockInfo(p.name)
                  const willGoNegative = stockInfo && (stockInfo.currentStock - Math.round(p.quantity)) < 0
                  const newStock = stockInfo ? stockInfo.currentStock - Math.round(p.quantity) : -Math.round(p.quantity)

                  return (
                    <div key={i} className={`bg-white border rounded-lg p-2.5 text-xs ${willGoNegative ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}>
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className={`font-medium truncate leading-tight ${willGoNegative ? 'text-red-800' : 'text-zinc-800'}`}>{p.name}</p>
                          {stockInfo && !stockInfo.exists && (
                            <p className="text-[9px] text-amber-600 mt-0.5">Produto sera criado automaticamente</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`w-14 text-right tabular-nums font-medium ${willGoNegative ? 'text-red-600' : 'text-zinc-600'}`}>
                            {stockInfo ? `${stockInfo.currentStock}` : '0'}
                            {willGoNegative && (
                              <span className="block text-[9px] text-red-500">
                                {'>'} {newStock}
                              </span>
                            )}
                          </span>
                          <span className="w-12 text-right text-zinc-800 font-bold tabular-nums">{Math.round(p.quantity)}</span>
                          <span className="w-20 text-right text-zinc-600 tabular-nums">
                            R$ {p.unitCost.toFixed(2)}
                          </span>
                          <span className="w-20 text-right text-zinc-800 font-semibold tabular-nums">
                            R$ {p.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 shrink-0 pt-2">
              {productsWithStock.some(s => s.exists && (s.currentStock - Math.round(nfeData.produtos.find(p => p.name === s.name)?.quantity || 0)) < 0) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-xs text-red-700">
                    <span className="font-bold">Atencao:</span> Alguns produtos ficarao com estoque negativo. A saida sera registrada mesmo assim.
                  </p>
                </div>
              )}

              <Button
                onClick={handleConfirmImport}
                disabled={importing}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl"
              >
                {importing ? 'Importando...' : `Confirmar Saida de ${nfeData.produtos.length} produto(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setNfeData(null); setProductsWithStock([]); setFileName('') }}
                className="w-full h-10 rounded-xl"
              >
                Enviar outro XML
              </Button>
            </div>
          </>
        )}
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
  const [totalStockValue, setTotalStockValue] = useState(0)
  const [negativeStockCount, setNegativeStockCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [, startTransition] = useTransition()

  const loadStats = useCallback(async () => {
    try {
      const [productsRes, movementsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/movements'),
      ])
      const products: Product[] = await productsRes.json()
      const movements: MovementItem[] = await movementsRes.json()

      if (!Array.isArray(products) || !Array.isArray(movements)) return

      const count = products.length
      const today = new Date().toISOString().slice(0, 10)
      const todayMov = movements.filter(
        (m) => m.createdAt && m.createdAt.slice(0, 10) === today
      ).length
      const stockVal = products.reduce((sum, p) => {
        const avgCost = p.averageCost || 0
        return sum + (avgCost * p.stock)
      }, 0)

      const negCount = products.filter(p => p.stock < 0).length

      startTransition(() => {
        setProductCount(count)
        setTodayMovements(todayMov)
        setTotalStockValue(stockVal)
        setNegativeStockCount(negCount)
      })
    } catch {
      // silently fail
    }
  }, [startTransition])

  useEffect(() => {
    if (view !== 'dashboard') return
    loadStats()
  }, [view, refreshKey, loadStats])

  const handleAccess = () => {
    setPinVerified(true)
    setView('dashboard')
  }

  const handleMovementComplete = (cupomId: string) => {
    setLastCupomId(cupomId)
    setView('cupom')
  }

  const navigateTo = (v: string) => {
    setView(v)
  }

  const handleBackToDashboard = () => {
    setRefreshKey((k) => k + 1)
    setView('dashboard')
  }

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
          totalStockValue={totalStockValue}
          negativeStockCount={negativeStockCount}
        />
      )

    case 'produtos':
      return <ProductsScreen onBack={handleBackToDashboard} />

    case 'entrada':
      return (
        <MovementScreen
          type="ENTRADA"
          onBack={handleBackToDashboard}
          onComplete={handleMovementComplete}
        />
      )

    case 'saida':
      return (
        <MovementScreen
          type="SAIDA"
          onBack={handleBackToDashboard}
          onComplete={handleMovementComplete}
        />
      )

    case 'cupom':
      return lastCupomId ? (
        <CupomScreen
          cupomId={lastCupomId}
          onBack={handleBackToDashboard}
        />
      ) : null

    case 'movimentacoes':
      return <MovementsScreen onBack={handleBackToDashboard} />

    case 'nfe':
      return <NfeScreen onBack={handleBackToDashboard} />

    case 'nfe_saida':
      return <NfeSaidaScreen onBack={handleBackToDashboard} />

    default:
      return null
  }
}
