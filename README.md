# Catálogo de Jogos v2

Reconstrução do meu primeiro projeto de catálogo de jogos, agora com TypeScript, testes automatizados e uma arquitetura mais organizada.

**[Ver demo ao vivo →](#)** _(atualize depois do deploy)_

---

## 📖 Sobre o projeto

Aplicativo CRUD para organizar os jogos que você quer jogar, está jogando, já zerou ou abandonou. Busca dados de jogos em tempo real na [RAWG.io](https://rawg.io/apidocs) para autocompletar o cadastro (ou permite cadastrar manualmente, sem a API), com persistência local via `localStorage`.

Este projeto é a segunda versão de um catálogo de jogos que eu já tinha feito em JavaScript puro (veja o [projeto original](https://github.com/VictorStavarengo/crud-jogos)). Refiz do zero para:

- migrar para **TypeScript**, com tipagem no domínio (`Game`), nos serviços e nos componentes;
- separar responsabilidades em `hooks`, `services`, `types` e `components`, em vez de um único arquivo grande;
- adicionar **testes automatizados** com Vitest e Testing Library;
- ter uma identidade visual própria (paleta e tipografia definidas), em vez do Tailwind padrão.

---

## 🚀 Tecnologias

- **React 18 + TypeScript**
- **Vite** — build e dev server
- **Tailwind CSS** — estilização com tokens de cor/tipografia customizados (veja `tailwind.config.js`)
- **Vitest + React Testing Library** — testes de componentes e hooks
- **RAWG.io API** — busca de jogos para autocomplete
- **ESLint** — padronização de código

---

## 🏗️ Arquitetura

```
src/
├── types/        # Tipos do domínio (Game, GameStatus, GAME_STATUSES...)
├── constants/    # Constantes compartilhadas (cores por status, chaves do storage)
├── services/     # Comunicação com a API externa (RAWG.io)
├── hooks/        # Lógica de estado reutilizável (useGames, useLocalStorage, useGameSearch...)
├── utils/        # Funções puras: filtros, ordenação, estatísticas, duplicados, formato salvo
├── components/   # Componentes de UI; os principais têm teste ao lado
└── test/         # Setup do ambiente de testes
```

A lógica de CRUD fica isolada no hook `useGames`, sem depender de nenhum componente — isso permite testá-la sem precisar renderizar nada na tela.

---

## 💻 Como rodar localmente

```bash
git clone https://github.com/VictorStavarengo/crud-jogos-v2.git
cd crud-jogos-v2
npm install
cp .env.example .env.local   # depois preencha com sua chave da RAWG.io
npm run dev
```

## 🧪 Rodando os testes

```bash
npm test          # roda uma vez
npm run test:watch # modo observador
```

## 🔍 Lint

```bash
npm run lint
```

---

## 💾 Dados salvos

Os jogos ficam no `localStorage` em formato versionado (`{ version, games }`). Ao carregar, cada item é validado e dados de versões anteriores são migrados automaticamente (por exemplo, a antiga "nota 0" virou "sem nota"). Se o armazenamento estiver indisponível ou o conteúdo estiver corrompido, o app começa vazio em vez de quebrar.

## 🙏 Créditos

Dados e imagens de jogos fornecidos pela [RAWG](https://rawg.io). Os termos da API gratuita pedem atribuição com link ativo em toda página que usa os dados — por isso o rodapé do app tem esse link.

## ✨ Recursos

- Cadastro com autocomplete (RAWG) ou manual, com validação e aviso de jogo duplicado (mesmo nome na mesma plataforma).
- Cards com capa, gênero, plataforma, status e nota em estrelas; clique no título para abrir os detalhes.
- Arrastar e soltar para reordenar (mouse, toque e teclado) — disponível na ordenação "Minha ordem".
- Filtros por busca (sem acento), status, plataforma e gênero; ordenação por mais recentes, nome ou nota.
- Clique no status do card para avançar (Quero jogar → Jogando → Zerado → Abandonado).
- Plataforma e gênero: ao escolher um jogo da RAWG, todas as opções dela viram botões para você escolher (ou digite a sua); o que já foi usado na biblioteca também vira sugestão.
- Capas no formato horizontal da RAWG, carregadas em tamanho reduzido (mais rápido); se a versão reduzida falhar, o app usa a original.
- Backup: exporte a biblioteca para um arquivo `.json` e importe depois (os jogos novos são somados, nada é apagado e duplicados são ignorados).
- Tema claro/escuro, avisos quando o armazenamento do navegador não está disponível e quando a busca da RAWG está limitada.

## ✅ Qualidade

```bash
npm run check   # lint + testes + build
```

O GitHub Actions (`.github/workflows/ci.yml`) roda essas mesmas etapas a cada push.
