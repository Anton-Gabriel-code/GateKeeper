# 🔐 GateKeeper — RBAC com Firebase

Aplicação web com controle de acesso baseado em cargos (**Role-Based Access Control**) usando **Firebase Authentication** e **Firebase Realtime Database**.

---

## Alunos:
[Antonio Gabriel]([https://seu-link-aqui.com](https://github.com/Anton-Gabriel-code )
[Eudes OLiveira]([https://seu-link-aqui.com](https://github.com/eudesolv)



## 🗂️ Estrutura do Banco de Dados

```
firebase-rtdb/
├── users/
│   └── {uid}/
│       ├── email       → string   (e-mail do usuário)
│       ├── role        → "admin" | "user"
│       └── createdAt   → ISO 8601
│
├── public-data/
│   └── announcements/
│       └── {id}/
│           ├── title      → string
│           └── createdAt  → ISO 8601
│
├── admin-data/
│   ├── financeiro/
│   │   ├── receita_total  → number
│   │   ├── despesas       → number
│   │   ├── lucro          → number
│   │   └── mes            → string
│   ├── usuarios_ativos    → number
│   └── logs/
│       └── {id}/
│           ├── acao        → string
│           ├── usuario     → string
│           └── timestamp   → ISO 8601
│
└── reports/
    └── relatorio_mensal/
        ├── titulo   → string
        ├── kpis/
        │   ├── novos_usuarios → number
        │   ├── retencao       → string
        │   └── nps            → number
        └── geradoEm → ISO 8601
```

### Decisões de modelagem

| Nó | Motivo |
|---|---|
| `/users/{uid}` | Cada usuário só lê/escreve o próprio nó. O campo `role` é a fonte de verdade para as Rules. |
| `/public-data` | Todos autenticados leem; só admins escrevem. Útil para comunicados. |
| `/admin-data` | Restrito a admins. Centraliza dados sensíveis (financeiro, logs). |
| `/reports` | Relatórios gerenciais. Acesso exclusivo de admin. |

---

## 🛡️ Firebase Security Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "admin-data": {
      ".read":  "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "public-data": {
      ".read":  "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "reports": {
      ".read":  "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}
```

### Tabela de permissões

| Nó | admin (read) | admin (write) | user (read) | user (write) |
|---|:---:|:---:|:---:|:---:|
| `/users/{próprio uid}` | ✅ | ✅ | ✅ | ✅ |
| `/public-data` | ✅ | ✅ | ✅ | ❌ |
| `/admin-data` | ✅ | ✅ | ❌ | ❌ |
| `/reports` | ✅ | ✅ | ❌ | ❌ |

---

## 🔑 Autenticação e Cargo

1. O usuário cria conta via **Firebase Auth** (e-mail/senha)
2. Imediatamente após, o app escreve em `/users/{uid}` com o campo `role`
3. As Security Rules consultam `/users/{uid}/role` em tempo real
4. O app redireciona para o dashboard correto baseado no cargo

```js
// Ao criar conta:
const cred = await createUserWithEmailAndPassword(auth, email, senha);
await set(ref(db, `users/${cred.user.uid}`), {
  email, role: isAdmin ? "admin" : "user",
  createdAt: new Date().toISOString()
});
```

---

## 🖥️ Interface Visual

A interface possui três telas:

**1. Login / Register (`index.html`)**
- Formulário com e-mail e senha
- Checkbox "Adm Login" para selecionar o cargo ao cadastrar
- Redirecionamento automático baseado no cargo

**2. Dashboard Admin (`dashboard-admin.html`)**
- Badge ADMIN verde pulsando
- 4 cards com acesso permitido a todos os nós
- Dados em tempo real carregados do Firebase

**3. Dashboard User (`dashboard-user.html`)**
- Badge USER azul pulsando
- 2 cards com acesso permitido (`/users` e `/public-data`)
- 2 cards com 🔒 "Acesso bloqueado pelas Security Rules" (`/admin-data` e `/reports`)

---

## 📁 Estrutura do Projeto

```
GateKeeper/
├── interface/
│   ├── index.html              ← Tela de login/cadastro
│   ├── dashboard-admin.html    ← Painel do administrador
│   ├── dashboard-user.html     ← Painel do usuário comum
│   ├── app.js                  ← Lógica Firebase Auth + Realtime DB
│   ├── style.css               ← Estilos globais
│   └── img/
│       └── jellyfish_bg        ← Imagem de fundo
├── database.rules.json         ← Security Rules do Realtime Database
├── firebase.json               ← Configuração Firebase CLI
└── README.md
```

---

## 🚀 Como Rodar

### Pré-requisitos
- Conta Google com projeto Firebase criado
- Firebase Realtime Database habilitado
- Firebase Authentication → método E-mail/Senha habilitado
- VS Code com extensão **Live Server**

### Passos

```bash
# Clone o repositório
git clone https://github.com/Anton-Gabriel-code/GateKeeper.git
cd GateKeeper
```

1. Abra a pasta no **VS Code**
2. No Firebase Console → **Realtime Database → Regras**, cole o conteúdo de `database.rules.json`
3. Clique com botão direito em `interface/index.html` → **"Open with Live Server"**
4. Acesse `http://127.0.0.1:5500/interface/index.html`

### Contas de Demonstração

| E-mail | Senha | Cargo |
|---|---|---|
| `admin@demo.com` | `demo123` | admin |
| `user@demo.com` | `demo123` | user |

