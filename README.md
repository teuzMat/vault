# 🛡️ Vault.gg

Aplicativo mobile desenvolvido em React Native com Expo para gerenciamento e acompanhamento de bibliotecas pessoais de jogos. O Vault.gg permite organizar títulos, acompanhar o progresso de conquistas e ter um perfil gamificado focado na experiência de ecossistemas como PSN e Steam.

---

## 👥 Autoria
Projeto desenvolvido para fins acadêmicos na disciplina de Programação para Dispositivos Móveis.
- **Gabriel Candido** - Matrícula: 24214290023
- **Mateus Cantanhêde** - Matrícula: 24214290038
- **Matheus Henrique** - Matrícula: 24214290029

---

## 🚀 Status Atual do Projeto (Fase de Front-end e API), v. Alpha 0.2.0
O projeto superou a fase de setup estrutural e agora possui toda a navegação, interfaces principais e consumo de dados reais. Foram implementados:

- **Arquitetura Base e Roteamento:** Migração concluída para **Expo Router** (`app/`).
- **Navegação Interna (Bottom Tabs):** Estrutura de rotas dividida em abas (Explorar, Biblioteca, Perfil) com bloqueio de retorno para a tela de Login via `router.replace()`.
- **Identidade Visual (Dark Mode Premium):** Aplicação de paleta focada em fundos escuros (`#0B0F19`), painéis (`#151A27`) e destaques em Roxo Neon (`#7C3AED`). Responsividade Híbrida mantida (Regra 20-60-20 na Web).
- **Validação Nativa de Cadastro:** Formulário com Regex para força de senha (maiúsculas, minúsculas, números e símbolos), máscaras em tempo real para Data de Nascimento e **Validação Matemática Real de CPF**.
- **Integração IGDB API (Twitch):** A tela "Explorar" realiza autenticação via servidor e consome o catálogo global de jogos da IGDB via *APICalypse*, trazendo os títulos mais aclamados e permitindo busca em tempo real.
- **Mock de Biblioteca e Perfil:** Interfaces prontas aguardando o Backend. A Biblioteca já conta com barra de progresso gamificada, tags de status (Platinado, Jogando, Desejos) e plataformas. O Perfil exibe as estatísticas do jogador.
- **Workflow:** Resolução de conflitos de dependência React/React-DOM para suporte Web (`--legacy-peer-deps`) e versionamento seguindo estritamente o padrão **Git Flow** (branches `main`, `develop` e `feature/*`).

---

## 🛠️ Tecnologias e Bibliotecas Utilizadas até o momento
- React Native & Expo
- Expo Router (Navegação baseada em arquivos)
- TypeScript
- API Externa: **IGDB (Twitch)**
- Ícones Vetoriais: `@expo/vector-icons`
- React Native Safe Area Context & Screens

---

## ⚙️ Como executar o projeto localmente

1. Clone o repositório:
```bash
git clone [https://github.com/teuzMat/vault.gg.git](https://github.com/teuzMat/vault.gg.git)
```

2. Acesse a pasta do projeto:
```bash
cd vault-gg
```

3. Instale as dependências (utilize a flag de legacy devido ao suporte web do Expo Router):
```bash
npm install --legacy-peer-deps
```

4. Inicie o servidor de desenvolvimento:
```bash
npx expo start -c
```

5. Pressione `w` no terminal para abrir no navegador Web ou leia o QR Code com o aplicativo Expo Go no seu smartphone.