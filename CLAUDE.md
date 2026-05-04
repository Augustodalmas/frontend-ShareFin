# ShareFin — Frontend

Next.js 16 + React 19 + TypeScript. App Router. Tailwind CSS + shadcn/ui.

## Estrutura

```
app/
  page.jsx              # Dashboard (gráficos, saldo, filtros de período/conta)
  transacoes/page.tsx   # CRUD de transações + importação CSV Nubank
  contas/page.tsx       # Gerenciamento de contas bancárias
  categorias/page.tsx   # Gerenciamento de categorias
  recorrencias/page.tsx # Transações recorrentes
  compartilhadas/page.tsx
  perfil/page.tsx
  usuarios/page.tsx     # Admin only
components/
  transaction-dialog.jsx  # Modal de criar/editar transação
  global-fab.tsx          # Botão flutuante de nova transação (presente em todas as telas)
  sidebar.jsx
  data-table.jsx
  feedback-widget.jsx
lib/
  api.ts                # Cliente HTTP centralizado + helpers de token
middleware.ts           # Redirect para /login se não autenticado
```

## Integração com a API

Base URL via `NEXT_PUBLIC_API_URL` (`.env.local`). O cliente em `lib/api.ts` injeta o JWT do `localStorage` em todas as requisições. Em 401, limpa o token e redireciona para `/login`. Mensagens de erro do backend (`erro` ou `error` no JSON) são propagadas diretamente ao usuário.

Formato de criação de transação enviado ao backend:
```ts
{ user, account, category, value, name, date_transaction }
```

`value` negativo = despesa, positivo = receita. `name` é opcional. O tipo visual (entrada/saída) é derivado do sinal do valor.

## Componentes principais

### GlobalFAB (`components/global-fab.tsx`)
Botão `+` flutuante fixo no canto inferior direito, renderizado no `layout.tsx` em todas as páginas autenticadas. Oculto nas rotas `/login` e `/register`. Abre o `TransactionDialog` com `handleSave` próprio e dispara `router.refresh()` após salvar.

### TransactionDialog (`components/transaction-dialog.jsx`)
Dialog de criar/editar transação. Ordem dos campos:
1. **Valor** — foco automático ao abrir
2. **Tipo** — toggle Despesa/Receita; ao mudar, limpa a categoria selecionada
3. **Categoria** — lista filtrada pelo tipo escolhido; botão `+` para criar inline
4. **Descrição** — opcional
5. **Data** — padrão: hoje
6. **Conta** — pré-selecionada pela última usada; botão `+` para criar inline

A última conta usada é persistida em `localStorage` sob a chave `sharefin_last_account`.

### DataTable (`components/data-table.jsx`)
Aceita props `emptyMessage` e `emptyDescription` para estado vazio contextual. Quando `data` está vazio e `onAdd` está definido, exibe o botão de adicionar em destaque no corpo da tabela.

## Decisões de design importantes

- **Categorias filtradas por tipo no dialog**: ao selecionar "Despesa", só aparecem categorias `type=1`; ao selecionar "Receita", só `type=2` — elimina risco de categorizar errado
- **Tipo definido antes da categoria**: o toggle de tipo fica acima da seleção de categoria para guiar o fluxo naturalmente
- **Onboarding zero-config**: novo usuário já tem categorias e conta padrão criadas pelo backend — pode adicionar a primeira transação imediatamente
- **FAB disponível em todas as telas**: o gesto mais frequente (nova transação) está a 1 toque de qualquer lugar do app
- **Filtros de transação persistidos**: `localStorage` salva os filtros ativos entre sessões
- **Metas e Assistente ocultos**: itens comentados no menu da sidebar até serem implementados
- **Recorrências ocultas**: também comentada no menu — página existe mas ainda não integrada ao fluxo principal

## O que está bem

- **Centralização da API**: `lib/api.ts` cobre todos os endpoints com tipagem, tratamento de 401 automático e propagação de erros do backend
- **UX fluida**: skeleton loaders, toasts de feedback, filtros persistidos, dialog com criação inline de categoria/conta, última conta memorizada
- **Responsividade**: layout sidebar + `MobileFilters` adaptado para mobile com rota `dev:mobile` para testes em rede local
- **Dashboard completo**: gráficos de pizza por categoria, barchart dos últimos 6 meses, saldo do período, filtros em tempo real — uma única chamada à API
- **Importação CSV Nubank**: upload com autenticação, pré-visualização dos dados antes de salvar, type inferido automaticamente

## Melhorias para pós-lançamento

- **Implementar ou remover Metas e Recorrências**: as páginas existem mas estão fora do menu
- **Formatação de moeda multimoeda**: `formatCurrency` sempre usa BRL, mas contas podem ter moedas diferentes (`coin` no backend)
- **Filtro de tipo enviado ao backend**: hoje o filtro entrada/saída é aplicado client-side após buscar todos os dados; o backend já suporta o parâmetro `type`
- **Testes automatizados**: nenhum teste de componente ou E2E existe ainda
