# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [1.0.0] - 2026-10-29

Primeira versão publicada.

### Adicionado
- Cadastro de jogos com autocomplete da RAWG ou manual, com validação e aviso de jogo duplicado (mesmo nome na mesma plataforma).
- Plataforma e gênero: opções da RAWG como botões, pré-seleção do que você mais usa e sugestões da própria biblioteca.
- Cards com capa, gênero, plataforma, status e nota em estrelas; janela de detalhes acessível.
- Arrastar e soltar para reordenar (mouse, toque e teclado).
- Filtros (busca sem acento, status, plataforma, gênero) e ordenação (minha ordem, mais recentes, nome, maior nota).
- Backup em `.json`: exportar e importar, somando aos jogos atuais ou substituindo tudo (com confirmação e desfazer).
- Atalhos de teclado: `/` busca, `N` novo jogo, `Esc` limpa a busca.
- Tema claro e escuro; avisos quando o armazenamento do navegador não funciona ou a busca da RAWG está limitada.
- Testes automatizados (Vitest + Testing Library), ESLint e integração contínua no GitHub Actions.
- Deploy na Vercel.
