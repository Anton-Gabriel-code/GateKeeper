import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyATOJfKg5KYjcgoBBrceV9z1Afle-iBqz4",
  authDomain: "gatekeeper-2f6de-5fda9.firebaseapp.com",
  databaseURL: "https://gatekeeper-2f6de-5fda9-default-rtdb.firebaseio.com",
  projectId: "gatekeeper-2f6de-5fda9",
  storageBucket: "gatekeeper-2f6de-5fda9.firebasestorage.app",
  messagingSenderId: "891828283856",
  appId: "1:891828283856:web:1422ffb3724a746a14f1d5",
  measurementId: "G-KZ6L5XJ7VZ"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

const form          = document.querySelector("form");
const emailInput    = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');
const loginBtn      = document.querySelector(".login");
const registerLink  = document.querySelector(".register-link a");
const forgotLink    = document.querySelector(".adm-forgot a");
const adminCheckbox = document.querySelector('.adm-forgot input[type="checkbox"]');
const formTitle     = document.querySelector("h1");
const registerText  = document.querySelector(".register-link p");

let isRegisterMode = false;

registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;

  if (isRegisterMode) {
    formTitle.textContent    = "Register";
    loginBtn.textContent     = "Create Account";
    registerText.textContent = "Already have an account?";
    registerLink.textContent = "Login";
  } else {
    formTitle.textContent    = "Login";
    loginBtn.textContent     = "Login";
    registerText.textContent = "Don't have an account?";
    registerLink.textContent = "Register";
  }
});

forgotLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) { showToast("Digite seu e-mail primeiro.", "error"); return; }

  try {
    await sendPasswordResetEmail(auth, email);
    showToast("E-mail de redefinição enviado!", "success");
  } catch (err) {
    showToast(friendlyError(err.code), "error");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = emailInput.value.trim();
  const password = passwordInput.value;
  const isAdmin  = adminCheckbox.checked;

  if (!email || !password) {
    showToast("Preencha todos os campos.", "error");
    return;
  }

  loginBtn.textContent = "Aguarde...";
  loginBtn.disabled    = true;

  try {
    if (isRegisterMode) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, `users/${cred.user.uid}`), {
        email:     email,
        role:      isAdmin ? "admin" : "user",
        createdAt: new Date().toISOString()
      });
      showToast("Conta criada com sucesso!", "success");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    showToast(friendlyError(err.code), "error");
    loginBtn.textContent = isRegisterMode ? "Create Account" : "Login";
    loginBtn.disabled    = false;
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const snap = await get(ref(db, `users/${user.uid}`));
    const data = snap.val();

    if (!data) {
      showToast("Perfil não encontrado no banco.", "error");
      await signOut(auth);
      return;
    }

    if (data.role === "admin") {
      window.location.href = "dashboard-admin.html";
    } else {
      window.location.href = "dashboard-user.html";
    }
  } catch (err) {
    showToast("Erro ao buscar perfil.", "error");
    await signOut(auth);
  }
});

function friendlyError(code) {
  const map = {
    "auth/user-not-found":        "Usuário não encontrado.",
    "auth/wrong-password":        "Senha incorreta.",
    "auth/invalid-credential":    "E-mail ou senha inválidos.",
    "auth/email-already-in-use":  "Este e-mail já está cadastrado.",
    "auth/weak-password":         "Senha fraca. Use no mínimo 6 caracteres.",
    "auth/invalid-email":         "Formato de e-mail inválido.",
    "auth/too-many-requests":     "Muitas tentativas. Tente mais tarde.",
    "auth/network-request-failed":"Sem conexão. Verifique sua internet."
  };
  return map[code] || "Erro inesperado. Tente novamente.";
}

function showToast(message, type = "success") {
  const old = document.getElementById("gk-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "gk-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === "success" ? "#4a3690" : "#c0392b"};
    color: #fff;
    padding: 12px 24px;
    border-radius: 50px;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 9999;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}