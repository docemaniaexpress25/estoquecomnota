import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// NF-e XML namespace
const NFE_NS = 'http://www.portalfiscal.inf.br/nfe'

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

function getTagText(node: Element, tagName: string, ns: string = NFE_NS): string {
  // Try with namespace first
  let el = node.getElementsByTagNameNS(ns, tagName)
  if (el.length > 0) return el[0].textContent?.trim() || ''

  // Try without namespace
  el = node.getElementsByTagName(tagName)
  if (el.length > 0) return el[0].textContent?.trim() || ''

  return ''
}

function parseNfeXml(xmlString: string): NfeParsed {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  // Check for parse errors
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('XML inválido: erro ao analisar o arquivo')
  }

  // Try to find infNFe - try with namespace and without
  let infNFe = doc.getElementsByTagNameNS(NFE_NS, 'infNFe')[0]
  if (!infNFe) {
    infNFe = doc.getElementsByTagName('infNFe')[0]
  }
  if (!infNFe) {
    throw new Error('XML não é uma NF-e válida: tag infNFe não encontrada')
  }

  // Extract NFe header data
  const ide = infNFe.getElementsByTagName('ide')[0] || infNFe.getElementsByTagNameNS(NFE_NS, 'ide')[0]
  const emit = infNFe.getElementsByTagName('emit')[0] || infNFe.getElementsByTagNameNS(NFE_NS, 'emit')[0]

  const numero = getTagText(ide, 'nNF')
  const serie = getTagText(ide, 'serie')
  const dhEmi = getTagText(ide, 'dhEmi') || getTagText(ide, 'dEmi')

  // Format date
  let dataEmissao = dhEmi
  if (dhEmi) {
    try {
      const d = new Date(dhEmi)
      dataEmissao = d.toLocaleDateString('pt-BR')
    } catch {
      // Keep original if parse fails
    }
  }

  // Emitente
  const emitente = {
    cnpj: getTagText(emit, 'CNPJ') || getTagText(emit, 'CPF'),
    nome: getTagText(emit, 'xNome') || getTagText(emit, 'xFant'),
    uf: getTagText(emit, 'UF'),
  }

  // Destinatario
  let destinatario: NfeParsed['destinatario'] = undefined
  const dest = infNFe.getElementsByTagName('dest')[0] || infNFe.getElementsByTagNameNS(NFE_NS, 'dest')[0]
  if (dest) {
    const destNome = getTagText(dest, 'xNome')
    const destCnpj = getTagText(dest, 'CNPJ') || getTagText(dest, 'CPF')
    if (destNome || destCnpj) {
      destinatario = { cnpj: destCnpj, nome: destNome }
    }
  }

  // Total
  const total = infNFe.getElementsByTagName('total')[0] || infNFe.getElementsByTagNameNS(NFE_NS, 'total')[0]
  const icmstot = total?.getElementsByTagName('ICMSTot')[0] || total?.getElementsByTagNameNS(NFE_NS, 'ICMSTot')[0]
  const valorTotal = parseFloat(getTagText(icmstot, 'vNF') || '0')
  const valorProdutos = parseFloat(getTagText(icmstot, 'vProd') || '0')

  // Products (det nodes)
  const produtos: NfeProduct[] = []
  const detNodes = infNFe.getElementsByTagName('det')

  for (let i = 0; i < detNodes.length; i++) {
    const det = detNodes[i]
    const prod = det.getElementsByTagName('prod')[0] || det.getElementsByTagNameNS(NFE_NS, 'prod')[0]
    if (!prod) continue

    const name = getTagText(prod, 'xProd')
    const quantity = parseFloat(getTagText(prod, 'qCom') || '0')
    const unit = getTagText(prod, 'uCom') || 'UN'
    const unitCost = parseFloat(getTagText(prod, 'vUnCom') || '0')
    const total = parseFloat(getTagText(prod, 'vProd') || '0')
    const ncm = getTagText(prod, 'NCM')
    const cfop = getTagText(prod, 'CFOP')
    const codBarras = getTagText(prod, 'cEAN') || getTagText(prod, 'cEANTrib')

    if (!name) continue

    produtos.push({
      name,
      quantity: Math.round(quantity * 1000) / 1000, // avoid floating point issues
      unit,
      unitCost,
      total,
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