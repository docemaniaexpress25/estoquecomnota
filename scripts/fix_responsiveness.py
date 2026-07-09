#!/usr/bin/env python3
"""Fix mobile responsiveness issues in page.tsx"""

import re

FILE_PATH = '/home/z/my-project/src/app/page.tsx'

with open(FILE_PATH, 'r') as f:
    content = f.read()

# ============================================================
# FIX 1: MovementScreen - Product card layout (flex-wrap overflow)
# Change from horizontal flex-wrap to vertical stack layout
# ============================================================
old_product_card = '''                  <div className="flex flex-wrap items-center gap-2">
                    {isEntrada ? (
                      <div className="shrink-0">
                        <label className="text-[9px] text-zinc-400 font-medium block mb-0.5">Custo (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={costPrices[p.id] || ''}
                          onChange={(e) => setCost(p.id, e.target.value)}
                          className="w-16 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-400 text-right tabular-nums h-8"
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
                          className="w-16 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-red-400 text-right tabular-nums h-8"
                        />
                      </div>
                    )}

                    {!isEntrada && avgCost > 0 && (
                      <div className="shrink-0">
                        <label className="text-[9px] text-zinc-400 font-medium block mb-0.5">Custo medio</label>
                        <span className="text-[10px] text-amber-600 font-medium tabular-nums flex items-center h-8">
                          R$ {avgCost.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0" />

                    {isActive && (
                      <span className="text-xs font-bold text-zinc-700 shrink-0 tabular-nums">
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
                  </div>'''

new_product_card = '''                  <div className="flex items-end justify-between gap-2">
                    <div className="flex items-end gap-2 flex-1 min-w-0">
                      {isEntrada ? (
                        <div className="shrink-0">
                          <label className="text-[9px] text-zinc-400 font-medium block mb-0.5">Custo (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={costPrices[p.id] || ''}
                            onChange={(e) => setCost(p.id, e.target.value)}
                            className="w-16 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-400 text-right tabular-nums h-9"
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
                            className="w-16 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-red-400 text-right tabular-nums h-9"
                          />
                        </div>
                      )}

                      {!isEntrada && avgCost > 0 && (
                        <div className="shrink-0 pb-0.5">
                          <p className="text-[9px] text-zinc-400 font-medium leading-none">C.M.</p>
                          <p className="text-[10px] text-amber-600 font-bold tabular-nums leading-tight mt-0.5">
                            R$ {avgCost.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
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

                  {isActive && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">Subtotal</span>
                      <span className="text-sm font-bold text-zinc-800 tabular-nums">
                        R$ {(isEntrada
                          ? (parseFloat(costPrices[p.id] || '0') * qty)
                          : (parseFloat(salePrices[p.id] || '0') * qty)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}'''

if old_product_card in content:
    content = content.replace(old_product_card, new_product_card)
    print("OK Fix 1: MovementScreen product card layout fixed")
else:
    print("WARN Fix 1: Could not find MovementScreen product card - checking for encoding differences...")
    # Try without the special char
    alt = old_product_card.replace('Custo medio', 'Custo médio')
    if alt in content:
        content = content.replace(alt, new_product_card)
        print("OK Fix 1 (alt): MovementScreen product card layout fixed")
    else:
        print("FAIL Fix 1: Could not find product card at all!")

# ============================================================
# FIX 2: MovementScreen container - use dvh for mobile viewport
# ============================================================
old_movement_container = '    <div className="min-h-screen overflow-x-hidden bg-zinc-50 flex flex-col pb-safe">'
new_movement_container = '    <div className="h-dvh overflow-hidden bg-zinc-50 flex flex-col">'
if old_movement_container in content:
    content = content.replace(old_movement_container, new_movement_container, 1)
    print("OK Fix 2: MovementScreen container changed to h-dvh")
else:
    print("FAIL Fix 2: Could not find MovementScreen container!")

# ============================================================
# FIX 3: MovementScreen submit bar - add bottom safe area
# ============================================================
old_submit_bar = '          <div className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-4 space-y-3 shrink-0 mt-2">'
new_submit_bar = '          <div className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-4 space-y-3 shrink-0 mt-2 mb-2 pb-[max(1rem,env(safe-area-inset-bottom))]">'
if old_submit_bar in content:
    content = content.replace(old_submit_bar, new_submit_bar, 1)
    print("OK Fix 3: MovementScreen submit bar safe area padding added")
else:
    print("FAIL Fix 3: Could not find MovementScreen submit bar!")

# ============================================================
# FIX 4: NfeScreen container - use dvh
# ============================================================
old_nfe_container = '    <div className="min-h-screen overflow-x-hidden bg-zinc-50 flex flex-col pb-safe">\n      <header className="bg-gradient-to-br from-teal-600 to-teal-700'
new_nfe_container = '    <div className="h-dvh overflow-hidden bg-zinc-50 flex flex-col">\n      <header className="bg-gradient-to-br from-teal-600 to-teal-700'
if old_nfe_container in content:
    content = content.replace(old_nfe_container, new_nfe_container, 1)
    print("OK Fix 4: NfeScreen container changed to h-dvh")
else:
    print("FAIL Fix 4: Could not find NfeScreen container!")

# ============================================================
# FIX 5: NfeScreen product list - convert table to mobile cards
# ============================================================
old_nfe_product_list = '''            <div className="flex-1 min-h-0 overflow-y-auto">
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
                          {p.ncm ? `NCM: ${p.ncm}` : ''}{p.cfop ? ` \\u00b7 CFOP: ${p.cfop}` : ''}
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
            </div>'''

new_nfe_product_list = '''            <div className="flex-1 min-h-0 overflow-y-auto pb-2">
              <div className="space-y-2">
                {nfeData.produtos.map((p, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-3 shadow-sm">
                    <p className="text-sm font-medium text-zinc-800 leading-tight">{p.name}</p>
                    {(p.ncm || p.cfop) && (
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                        {p.ncm ? `NCM: ${p.ncm}` : ''}{p.ncm && p.cfop ? ' \\u00b7 ' : ''}{p.cfop ? `CFOP: ${p.cfop}` : ''}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-600 font-medium">{p.quantity} {p.unit}</span>
                        <span className="text-zinc-400 tabular-nums">R$ {p.unitCost.toFixed(2)}/un.</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-800 tabular-nums">R$ {p.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>'''

if old_nfe_product_list in content:
    content = content.replace(old_nfe_product_list, new_nfe_product_list, 1)
    print("OK Fix 5: NfeScreen product list converted to mobile cards")
else:
    print("FAIL Fix 5: Could not find NfeScreen product list!")

# ============================================================
# FIX 6: NfeSaidaScreen container - use dvh
# ============================================================
old_nfe_saida_container = '    <div className="min-h-screen overflow-x-hidden bg-zinc-50 flex flex-col pb-safe">\n      <header className="bg-gradient-to-br from-orange-500 to-orange-600'
new_nfe_saida_container = '    <div className="h-dvh overflow-hidden bg-zinc-50 flex flex-col">\n      <header className="bg-gradient-to-br from-orange-500 to-orange-600'
if old_nfe_saida_container in content:
    content = content.replace(old_nfe_saida_container, new_nfe_saida_container, 1)
    print("OK Fix 6: NfeSaidaScreen container changed to h-dvh")
else:
    print("FAIL Fix 6: Could not find NfeSaidaScreen container!")

# ============================================================
# FIX 7: NfeSaidaScreen action buttons - add safe area
# ============================================================
old_nfe_saida_buttons = '            <div className="space-y-2 shrink-0 pt-2">\n              {productsWithStock.some(s => s.exists && (s.currentStock - Math.round(nfeData.produtos.find(p => p.name === s.name)?.quantity || 0)) < 0) && ('
new_nfe_saida_buttons = '            <div className="space-y-2 shrink-0 pt-2 pb-[env(safe-area-inset-bottom)]">\n              {productsWithStock.some(s => s.exists && (s.currentStock - Math.round(nfeData.produtos.find(p => p.name === s.name)?.quantity || 0)) < 0) && ('
if old_nfe_saida_buttons in content:
    content = content.replace(old_nfe_saida_buttons, new_nfe_saida_buttons, 1)
    print("OK Fix 7: NfeSaidaScreen buttons safe area added")
else:
    print("FAIL Fix 7: Could not find NfeSaidaScreen buttons!")

# ============================================================
# FIX 8: NfeScreen action buttons - add safe area
# ============================================================
old_nfe_buttons = '            <div className="space-y-2 shrink-0 mt-2">\n              <Button\n                onClick={handleConfirmImport}\n                disabled={importing}\n                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"\n              >\n                {importing ? \'Importando...\' : `Confirmar Importacao de ${nfeData.produtos.length} produto(s)`}'
new_nfe_buttons = '            <div className="space-y-2 shrink-0 mt-2 pb-[env(safe-area-inset-bottom)]">\n              <Button\n                onClick={handleConfirmImport}\n                disabled={importing}\n                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"\n              >\n                {importing ? \'Importando...\' : `Confirmar Importacao de ${nfeData.produtos.length} produto(s)`}'
if old_nfe_buttons in content:
    content = content.replace(old_nfe_buttons, new_nfe_buttons, 1)
    print("OK Fix 8: NfeScreen buttons safe area added")
else:
    print("FAIL Fix 8: Could not find NfeScreen buttons!")

# ============================================================
# FIX 9: Dashboard - add safe area bottom padding
# ============================================================
old_dashboard = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8">'
new_dashboard = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8 pb-safe">'
if old_dashboard in content:
    content = content.replace(old_dashboard, new_dashboard, 1)
    print("OK Fix 9: Dashboard safe area bottom padding added")
else:
    print("FAIL Fix 9: Could not find Dashboard container!")

# ============================================================
# FIX 10: ProductsScreen - add safe area bottom padding
# ============================================================
old_products = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8">\n      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">\n        <div className="flex items-center gap-3">\n          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>\n            <X className="w-5 h-5" />\n          </Button>\n          <h1 className="text-lg font-semibold">Produtos</h1>'
new_products = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8 pb-safe">\n      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">\n        <div className="flex items-center gap-3">\n          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>\n            <X className="w-5 h-5" />\n          </Button>\n          <h1 className="text-lg font-semibold">Produtos</h1>'
if old_products in content:
    content = content.replace(old_products, new_products, 1)
    print("OK Fix 10: ProductsScreen safe area bottom padding added")
else:
    print("FAIL Fix 10: Could not find ProductsScreen container!")

# ============================================================
# FIX 11: MovementsScreen - add safe area bottom padding
# ============================================================
old_movements = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8">\n      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">\n        <div className="flex items-center gap-3">\n          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>\n            <X className="w-5 h-5" />\n          </Button>\n          <h1 className="text-lg font-semibold">Movimentações</h1>'
new_movements = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8 pb-safe">\n      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">\n        <div className="flex items-center gap-3">\n          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>\n            <X className="w-5 h-5" />\n          </Button>\n          <h1 className="text-lg font-semibold">Movimentações</h1>'
if old_movements in content:
    content = content.replace(old_movements, new_movements, 1)
    print("OK Fix 11: MovementsScreen safe area bottom padding added")
else:
    print("FAIL Fix 11: Could not find MovementsScreen container!")

# ============================================================
# FIX 12: CupomScreen - improve bottom padding
# ============================================================
old_cupom = '<div className="min-h-screen overflow-x-hidden bg-zinc-100 pb-safe">'
new_cupom = '<div className="min-h-screen overflow-x-hidden bg-zinc-100 pb-8 pb-safe">'
if old_cupom in content:
    content = content.replace(old_cupom, new_cupom, 1)
    print("OK Fix 12: CupomScreen bottom padding improved")
else:
    print("FAIL Fix 12: Could not find CupomScreen container!")

# ============================================================
# FIX 13: ReportScreen - add safe area bottom padding
# ============================================================
old_report = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8">\n      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">\n        <div className="flex items-center gap-3">\n          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>\n            <X className="w-5 h-5" />\n          </Button>\n          <h1 className="text-lg font-semibold">Relatório</h1>'
new_report = '<div className="min-h-screen overflow-x-hidden bg-zinc-50 pb-8 pb-safe">\n      <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white px-4 py-4 pt-safe">\n        <div className="flex items-center gap-3">\n          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={onBack}>\n            <X className="w-5 h-5" />\n          </Button>\n          <h1 className="text-lg font-semibold">Relatório</h1>'
if old_report in content:
    content = content.replace(old_report, new_report, 1)
    print("OK Fix 13: ReportScreen safe area bottom padding added")
else:
    print("FAIL Fix 13: Could not find ReportScreen container!")

# ============================================================
# Write the fixed file
# ============================================================
with open(FILE_PATH, 'w') as f:
    f.write(content)

print("\n All responsiveness fixes applied!")