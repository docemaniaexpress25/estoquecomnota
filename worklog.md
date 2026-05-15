---
Task ID: 1
Agent: Main Agent
Task: Criar sistema de controle de estoque com notas de entrada e saída

Work Log:
- Definido schema Prisma com modelos: Produto, NotaEntrada, NotaSaida
- Criadas API routes: /api/produtos (CRUD), /api/notas-entrada (GET/POST), /api/notas-saida (GET/POST)
- Construída página principal com header, stats cards, tabs (Produtos, Notas de Entrada, Relatório de Saídas)
- Implementados modais para criar/editar produto, registrar entrada e saída
- Relatório de saídas com resumo de totais
- Lint passou sem erros, dev server compilando com sucesso

Stage Summary:
- Sistema completo de controle de estoque funcional
- APIs respondendo 200/201
- Preço médio recalculado automaticamente nas entradas
- Validação de estoque nas saídas
- Formatação em PT-BR (moeda R$, datas)

---
Task ID: 3
Agent: Task 3 Agent
Task: Adicionar funcionalidade de entrada e saída em lote (batch) ao sistema de controle de estoque

Work Log:
- Adicionados tipos `ItemLoteEntrada` e `ItemLoteSaida` com campo `_tempId` para controle de lista dinâmica
- Adicionado import de `Select` (shadcn/ui) e ícone `XCircle` (lucide-react)
- Adicionados 12 novos estados para formulários de lote (dialog, itens, data, referência, observação para entrada e saída)
- Implementadas funções `openEntradaLote` / `openSaidaLote` para inicializar formulários de lote
- Implementadas funções `addEntradaLoteItem` / `removeEntradaLoteItem` / `updateEntradaLoteItem` para gerenciar itens dinâmicos de entrada
- Implementadas funções `addSaidaLoteItem` / `removeSaidaLoteItem` / `updateSaidaLoteItem` para gerenciar itens dinâmicos de saída
- Implementada `handleSubmitEntradaLote` com validação completa (produto selecionado, quantidade > 0, preço >= 0, sem duplicatas) e POST para `/api/notas-entrada/batch`
- Implementada `handleSubmitSaidaLote` com validação completa (produto selecionado, quantidade > 0, sem duplicatas) e POST para `/api/notas-saida/batch`
- Implementado `renderDialogEntradaLote` com Select para produto, campos de quantidade/preço, botão remover, contador de itens, layout responsivo
- Implementado `renderDialogSaidaLote` com Select mostrando nome + estoque, campo de quantidade, mesmo padrão visual
- Adicionados botões "Entrada em Lote" (emerald) e "Saída em Lote" (rose) no header da aba Produtos
- Diálogos de lote renderizados junto com os demais diálogos existentes
- Lint passou sem erros, dev server compilando com sucesso

Stage Summary:
- Funcionalidade de batch entrada/saída completamente integrada ao sistema existente
- Toda funcionalidade individual preservada (entrada/saída individual por produto)
- Validação robusta com mensagens em PT-BR
- Diálogos largos (sm:max-w-3xl) com lista scrollável (max-h-[300px])
- Design responsivo: botões empilhados no mobile, lado a lado no desktop
