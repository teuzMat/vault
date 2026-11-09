# 🛡️ Vault.gg

Aplicativo mobile desenvolvido em React Native com Expo para gerenciamento e acompanhamento de bibliotecas pessoais de jogos. O Vault.gg permite organizar títulos, acompanhar o progresso de conquistas e ter um perfil gamificado focado na experiência de ecossistemas como PSN e Steam.

---

## 👥 Autoria
Projeto desenvolvido para fins acadêmicos na disciplina de Programação para Dispositivos Móveis.
* **Gabriel Candido** - Matrícula: 24214290023
* **Mateus Cantanhêde da Cruz** - Matrícula: 24214290038

---

## 🚀 Status Atual do Projeto (Fase de Setup)
O projeto encontra-se na etapa inicial de estruturação de arquitetura e interface gráfica. Até o momento, foram implementados:

* **Arquitetura Base e Roteamento:** Projeto inicializado limpo (`blank-typescript`), migrado com sucesso para o **Expo Router** para navegação baseada em arquivos (`app/`).
* **Identidade Visual (Dark Mode Premium):** Aplicação de paleta de cores focada em fundos escuros (`#0B0F19`) e destaques em Roxo Neon (`#7C3AED`), garantindo uma estética *gamer* imersiva.
* **Responsividade Híbrida (Regra 20-60-20):** Implementação de lógica via `Platform.OS` garantindo que, em dispositivos Web, o conteúdo seja centralizado ocupando 60% da tela (com 20% de margem em cada lado), enquanto no Mobile ocupa 100%.
* **Interface de Login (`index.tsx`):** Tela de boas-vindas contendo a logo do projeto, botões para acesso via E-mail/Senha, botões de provedores externos (Google, GitHub), link para cadastro e rodapé de autoria.
* **Interface de Cadastro (`cadastro.tsx`):** Formulário inicial estruturado com suporte a rolagem (`ScrollView`) e navegação de retorno programática (`router.back()`).
* **Workflow:** Resolução de conflitos de dependência React/React-DOM para suporte Web (`--legacy-peer-deps`) e versionamento seguindo estritamente o padrão **Git Flow** (branches `main`, `develop` e `feature/*`).

---

## 🛠️ Tecnologias e Bibliotecas Utilizadas até o momento
* React Native & Expo
* Expo Router (Navegação)
* TypeScript
* React Native Safe Area Context & Screens

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