import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  textNodeName: '#text',
})

interface NfeProduct {
  name: string
  quantity: number
  unit: string
  unitCost: number
  total: number
  ncm: string
  cfop: string
  codBarras: string
}

interface NfeParsed {
  numero: string
  serie: string
  dataEmissao: string
  emitente: {
    cnpj: string
    nome: string
    uf: string
  }
  destinatario?: {
    cnpj: string
    nome: string
  }
  produtos: NfeProduct[]
  valorTotal: number
  valorProdutos: number
}

// Helper: safely get a nested value from parsed object
function getVal(obj: unknown, ...paths: string[]): string {
  if (!obj || typeof obj !== 'object') return ''
  for (const path of paths) {
    const keys = path.split('.')
    let current: unknown = obj
    for (const key of keys) {
      if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, key)) {
        current = undefined
        break
      }
      current = (current as Record<string, unknown>)[key]
    }
    if (current !== undefined && current !== null) {
      if (typeof current === 'string') return current.trim()
      if (typeof current === 'number') return String(current)
      if (typeof current === 'object' && '#text' in (current as Record<string, unknown>)) {
        return String((current as Record<string, unknown>)['#text']).trim()
      }
    }
  }
  return ''
}

function parseNfeXml(xmlString: string): NfeParsed {
  let parsed: Record<string, unknown>
  try {
    parsed = parser.parse(xmlString)
  } catch {
    throw new Error('XML inválido: erro ao analisar o arquivo')
  }

  // Navigate to infNFe - handle both with and without nfeProc wrapper
  const nfeProc = parsed.nfeProc || parsed
  const nfe = nfeProc.NFe || nfeProc.nfe || nfeProc
  const infNFe = nfe.infNFe || nfe

  if (!infNFe || typeof infNFe !== 'object') {
    throw new Error('XML não é uma NF-e válida: tag infNFe não encontrada')
  }

  const ide = infNFe.ide
  const emit = infNFe.emit
  const dest = infNFe.dest

  // Header
  const numero = getVal(ide, 'nNF')
  const serie = getVal(ide, 'serie')
  const dhEmi = getVal(ide, 'dhEmi', 'dEmi')

  // Format date
  let dataEmissao = dhEmi
  if (dhEmi) {
    try {
      const d = new Date(dhEmi)
      if (!isNaN(d.getTime())) {
        dataEmissao = d.toLocaleDateString('pt-BR')
      }
    } catch {
      // Keep original if parse fails
    }
  }

  // Emitente
  const emitente = {
    cnpj: getVal(emit, 'CNPJ', 'CPF'),
    nome: getVal(emit, 'xNome', 'xFant'),
    uf: getVal(emit, 'enderEmit.UF', 'UF'),
  }

  // Destinatario
  let destinatario: NfeParsed['destinatario'] = undefined
  if (dest && typeof dest === 'object') {
    const destNome = getVal(dest, 'xNome')
    const destCnpj = getVal(dest, 'CNPJ', 'CPF')
    if (destNome || destCnpj) {
      destinatario = { cnpj: destCnpj, nome: destNome }
    }
  }

  // Totals
  const total = infNFe.total
  const icmstot = total?.ICMSTot || total
  const valorTotal = parseFloat(getVal(icmstot, 'vNF') || '0')
  const valorProdutos = parseFloat(getVal(icmstot, 'vProd') || '0')

  // Products
  const produtos: NfeProduct[] = []

  // det can be an array or a single object
  const detArray = infNFe.det
  const dets: Record<string, unknown>[] = Array.isArray(detArray) ? detArray : detArray ? [detArray] : []

  for (const det of dets) {
    const prod = det.prod
    if (!prod || typeof prod !== 'object') continue

    const name = getVal(prod, 'xProd')
    if (!name) continue

    const quantity = parseFloat(getVal(prod, 'qCom') || '0')
    const unit = getVal(prod, 'uCom') || 'UN'
    const unitCost = parseFloat(getVal(prod, 'vUnCom') || '0')
    const totalProd = parseFloat(getVal(prod, 'vProd') || '0')
    const ncm = getVal(prod, 'NCM')
    const cfop = getVal(prod, 'CFOP')
    const codBarras = getVal(prod, 'cEAN', 'cEANTrib')

    produtos.push({
      name,
      quantity: Math.round(quantity * 1000) / 1000,
      unit,
      unitCost,
      total: totalProd,
      ncm,
      cfop,
      codBarras,
    })
  }

  if (produtos.length === 0) {
    throw new Error('Nenhum produto encontrado na NF-e')
  }

  return {
    numero,
    serie,
    dataEmissao,
    emitente,
    destinatario,
    produtos,
    valorTotal,
    valorProdutos,
  }
}

// POST: Parse and import NF-e XML
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('xml') as File | null
    const action = formData.get('action') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo XML é obrigatório' }, { status: 400 })
    }

    if (!file.name.endsWith('.xml')) {
      return NextResponse.json({ error: 'Apenas arquivos .xml são aceitos' }, { status: 400 })
    }

    const xmlString = await file.text()

    // Parse the XML
    const nfe = parseNfeXml(xmlString)

    // If action is 'parse', just return the parsed data (preview mode)
    if (action === 'parse') {
      return NextResponse.json({ action: 'parsed', data: nfe })
    }

    // If action is 'confirm', import into database
    if (action === 'confirm') {
      const cupomId = randomUUID()
      const fornecedor = nfe.emitente?.nome || nfe.emitente?.cnpj || 'NF-e Importada'

      const results = []

      for (const item of nfe.produtos) {
        if (item.quantity <= 0) continue

        // Find or create product
        let product = await db.product.findFirst({
          where: { name: item.name },
        })

        if (!product) {
          product = await db.product.create({
            data: { name: item.name },
          })
        }

        const total = item.unitCost * item.quantity

        // Create entry
        await db.entry.create({
          data: {
            productId: product.id,
            quantity: Math.round(item.quantity),
            unitCost: item.unitCost,
            total,
            cupomId,
          },
        })

        // Create movement
        await db.movement.create({
          data: {
            type: 'ENTRADA',
            productId: product.id,
            quantity: Math.round(item.quantity),
            unitPrice: item.unitCost,
            total,
            cupomId,
            clientName: fornecedor,
          },
        })

        // Update stock
        await db.product.update({
          where: { id: product.id },
          data: { stock: product.stock + Math.round(item.quantity) },
        })

        results.push({
          productName: item.name,
          productId: product.id,
          isNew: !product,
          quantity: Math.round(item.quantity),
          unitCost: item.unitCost,
          total,
        })
      }

      return NextResponse.json({
        action: 'imported',
        cupomId,
        fornecedor,
        nfeNumero: nfe.numero,
        nfeSerie: nfe.serie,
        dataEmissao: nfe.dataEmissao,
        totalItens: results.length,
        valorTotal: nfe.valorTotal,
        items: results,
      })
    }

    return NextResponse.json({ error: 'Ação inválida. Use "parse" ou "confirm"' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao processar NF-e:', error)
    const message = error instanceof Error ? error.message : 'Erro ao processar NF-e'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}