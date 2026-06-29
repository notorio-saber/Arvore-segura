# Árvore Segura

MVP do sistema público de solicitação de manejo de árvores urbanas — cidadão reporta risco
(galho quebrado, árvore inclinada, tronco oco, conflito com rede elétrica) com foto e GPS;
a prefeitura recebe num painel, prioriza e despacha a equipe de poda/remoção.

Stack: **React + Vite + Tailwind** (frontend) · **Firebase** (Auth, Firestore, Storage) ·
deploy de frontend em **Netlify** (ou Firebase Hosting) · regras multi-tenant por município.

---

## 1. Pré-requisitos

- Node.js 18+ e npm
- Conta no [Firebase](https://console.firebase.google.com/)
- Firebase CLI: `npm install -g firebase-tools`

## 2. Criar o projeto Firebase

1. Console Firebase → **Criar projeto** → escolha um nome (ex: `arvore-segura`).
2. Em **Configurações do projeto → Geral**, defina a **localização padrão dos recursos**
   para `southamerica-east1` (São Paulo) — importante para LGPD e latência no Brasil.
   *(Isso é definido na primeira vez que você cria o Firestore — veja o passo 4.)*
3. Adicione um app **Web** (ícone `</>`) e copie as credenciais (`apiKey`, `authDomain`, etc.).
4. **Firestore Database** → criar banco → modo produção → região `southamerica-east1`.
5. **Storage** → começar a usar → mesma região.
6. **Authentication → Sign-in method** → habilite:
   - **Anônimo** (para os cidadãos reportarem sem cadastro)
   - **E-mail/senha** (para a equipe municipal)

## 3. Configurar o projeto local

```bash
git clone <seu-repo>
cd arvore-segura-app
npm install
cp .env.example .env
```

Preencha o `.env` com as credenciais do passo 2.3, e defina `VITE_MUNICIPIO_ID`
(ex: `irati-pr`) — é o identificador do município atendido por esta instância do app.

```bash
npm run dev
```

## 4. Cadastrar a equipe municipal

O app não tem tela de cadastro de equipe (de propósito — evita auto-cadastro indevido).
Para cada funcionário municipal:

1. Crie o usuário em **Authentication → Users → Add user** (e-mail/senha), copie o **UID**.
2. No **Firestore**, crie manualmente o documento `staff/{uid}` com:
   ```json
   {
     "nome": "Nome do funcionário",
     "email": "email@prefeitura.gov.br",
     "municipioId": "irati-pr",
     "role": "operador"
   }
   ```
   O `municipioId` deve ser **exatamente** o mesmo valor de `VITE_MUNICIPIO_ID` no `.env`.

Também crie o documento `municipios/{municipioId}` (ex: `municipios/irati-pr`) com
`{ "nome": "Irati", "uf": "PR", "ativo": true }` — usado para metadados públicos.

## 5. Publicar as regras de segurança

```bash
firebase login
firebase use --add        # selecione o projeto criado no passo 2
firebase deploy --only firestore:rules,storage:rules
```

As regras (`firestore.rules`, `storage.rules`) garantem multi-tenant: cada município só
acessa seus próprios reportes, e cidadãos só conseguem **criar**, nunca ler, os dados.

## 6. Deploy do frontend

### Opção A — Netlify
1. Suba o repo no GitHub.
2. No Netlify: **Add new site → Import from Git**.
3. Build command: `npm run build` · Publish directory: `dist`.
4. Em **Site settings → Environment variables**, adicione as mesmas chaves do `.env`.

### Opção B — Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## 7. Estrutura de dados (Firestore)

```
municipios/{municipioId}
  nome, uf, ativo

municipios/{municipioId}/reportes/{reporteId}
  categoria        // galho_quebrado | arvore_inclinada | tronco_oco | conflito_rede | outro
  descricao
  fotoUrl
  localizacao      // { lat, lng }
  status           // pendente | triagem | despachado | concluido
  reportadoPor     // uid (anônimo) de quem reportou
  criadoEm / atualizadoEm

staff/{uid}
  nome, email, municipioId, role
```

Esse modelo já nasce **multi-tenant**: para atender um segundo município, basta criar um
novo `municipios/{id}`, cadastrar a equipe em `staff/`, e fazer um novo deploy do frontend
com `VITE_MUNICIPIO_ID` diferente (mesmo projeto Firebase).

## 8. Próximos passos sugeridos

- Painel com mapa (atualmente cada reporte só linka para o Google Maps).
- Geo-busca por proximidade (Firestore não tem nativo — usar `geofirestore` ou geohash).
- Notificação por e-mail/WhatsApp à equipe quando um novo reporte de alta prioridade chegar.
- Métricas agregadas (tempo médio reporte → despacho) para comprovar o indicador de
  sucesso do Plano de Validação.
