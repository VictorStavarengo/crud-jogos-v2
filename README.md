# Catálogo de Jogos v2

Reconstrução do meu primeiro projeto de catálogo de jogos, agora com TypeScript, testes automatizados e uma arquitetura mais organizada.

**[Ver demo ao vivo →](https://crud-jogos-v2.vercel.app)**

![Demonstração do Catálogo de Jogos: editar, arrastar, filtrar e ordenar](docs/demo.gif)

---

## 📖 Sobre o projeto

Aplicativo CRUD para organizar os jogos que você quer jogar, está jogando, já zerou ou abandonou. Busca dados de jogos em tempo real na [RAWG.io](https://rawg.io/apidocs) para autocompletar o cadastro (ou permite cadastrar manualmente, sem a API), com persistência local via `localStorage`.

- migrar para **TypeScript**, com tipagem no domínio (`Game`), nos serviços e nos componentes;
- separar responsabilidades em `hooks`, `services`, `types`, `utils` e `components`, em vez de um único arquivo grande;
- adicionar **testes automatizados** com Vitest e Testing Library;
- ter uma identidade visual própria (paleta e tipografia definidas), em vez do Tailwind padrão.

---

## ✨ Recursos

- Cadastro com autocomplete (RAWG) ou manual, com validação e aviso de jogo duplicado (mesmo nome na mesma plataforma).
- Cards com capa, gênero, plataforma, status e nota em estrelas; clique no título para abrir os detalhes.
- Arrastar e soltar para reordenar (mouse, toque e teclado) — disponível na ordenação "Minha ordem".
- Filtros por busca (sem acento), status, plataforma e gênero; ordenação por mais recentes, nome ou nota.
- Clique no status do card para avançar (Quero jogar → Jogando → Zerado → Abandonado).
- Plataforma e gênero: ao escolher um jogo da RAWG, todas as opções dela viram botões para escolher (ou digite a sua); o que já foi usado na biblioteca também vira sugestão.
- Capas no formato horizontal da RAWG, carregadas em tamanho reduzido (mais rápido); se a versão reduzida falhar, o app usa a original.
- Backup: exporte a biblioteca para um arquivo `.json` e importe depois (os jogos novos são somados, nada é apagado e duplicados são ignorados).
- Tema claro/escuro, com avisos quando o armazenamento do navegador não está disponível e quando a busca da RAWG está limitada.
- Acessibilidade: navegação por teclado, foco visível, janela de detalhes com foco preso, anúncios em português para leitor de tela ao arrastar.

---

## 📸 Telas

| Tema escuro | Tema claro |
| --- | --- |
| ![Tema escuro](docs/screenshot.png) | ![Tema claro](docs/screenshot-claro.png) |

<p align="center">
  <img src="docs/detalhes.png" width="520" alt="Janela de detalhes de um jogo" />
</p>

---

## 🚀 Tecnologias

- **React 18 + TypeScript**
- **Vite** — build e dev server
- **Tailwind CSS** — estilização com tokens de cor/tipografia customizados (veja `tailwind.config.js` e `src/index.css`)
- **dnd-kit** — arrastar e soltar acessível
- **react-toastify** — avisos
- **Vitest + React Testing Library** — testes de componentes, hooks e funções puras
- **RAWG.io API** — busca de jogos para autocomplete
- **ESLint** + **GitHub Actions** — padronização de código e integração contínua

---

## 🏗️ Arquitetura

```
src/
├── types/        # Tipos do domínio (Game, GameStatus, GAME_STATUSES...)
├── constants/    # Constantes compartilhadas (cores por status, chaves do storage)
├── services/     # Comunicação com a API externa (RAWG.io)
├── hooks/        # Lógica de estado reutilizável (useGames, useLocalStorage, useGameSearch...)
├── utils/        # Funções puras: filtros, ordenação, estatísticas, duplicados, backup, formato salvo
├── components/   # Componentes de UI; os principais têm teste ao lado
└── test/         # Setup do ambiente de testes
```

A lógica de CRUD fica isolada no hook `useGames`, e as regras (filtrar, ordenar, validar o que foi salvo, importar backup) ficam em funções puras em `utils/`. Isso permite testá-las sem renderizar nada na tela.

---

## 💻 Como rodar localmente

```bash
git clone https://github.com/VictorStavarengo/crud-jogos-v2.git
cd crud-jogos-v2
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

### Chave da RAWG (para o autocomplete)

Sem a chave o app funciona normalmente, só que com cadastro manual. Para ligar a busca:

1. Crie uma conta gratuita e gere uma chave em [rawg.io/apidocs](https://rawg.io/apidocs).
2. Copie o arquivo de exemplo (no Windows PowerShell: `Copy-Item .env.example .env.local`; no Mac/Linux: `cp .env.example .env.local`).
3. Preencha a variável no `.env.local`, sem aspas:

   ```
   VITE_RAWG_API_KEY=sua_chave_aqui
   ```

4. Reinicie o `npm run dev` (o Vite só lê o arquivo ao iniciar).

> Variáveis `VITE_*` ficam visíveis no navegador de quem usa o app. Para uma chave gratuita num projeto de portfólio isso é aceitável; nunca coloque uma chave paga ou secreta aqui. O `.env.local` está no `.gitignore`.

---

## ✅ Qualidade

```bash
npm test            # roda os testes uma vez
npm run test:watch  # modo observador
npm run lint        # ESLint
npm run check       # lint + testes + build
```

O GitHub Actions (`.github/workflows/ci.yml`) roda essas mesmas etapas a cada push na `main` e em pull requests.

---

## 💾 Dados salvos

Os jogos ficam no `localStorage` em formato versionado (`{ version, games }`). Ao carregar, cada item é validado e dados de versões anteriores são migrados automaticamente (por exemplo, a antiga "nota 0" virou "sem nota"). Se o armazenamento estiver indisponível ou o conteúdo estiver corrompido, o app começa vazio em vez de quebrar.

Como os dados existem só no navegador, use **Exportar jogos** (no fim da página) para guardar uma cópia e **Importar backup** para restaurá-la ou levá-la a outro aparelho.

---

## 🙏 Créditos

Dados e imagens de jogos fornecidos pela [RAWG](https://rawg.io). Os termos da API gratuita pedem atribuição com link ativo em toda página que usa os dados — por isso o rodapé do app tem esse link.

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).
