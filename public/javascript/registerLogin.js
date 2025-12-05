// Defina a URL base da sua API aqui
const API_BASE_URL = "http://localhost:3333"; // Ajuste se necessário

// --- LÓGICA DE TROCA DE TELA (ANIMAÇÃO) ---
const loginBtn = document.querySelector(".loginButton");
const cadastroBtn = document.querySelector(".cadastroButton");
const card = document.querySelector(".card");

if(loginBtn && cadastroBtn && card) {
    loginBtn.addEventListener("click", () => {
        card.classList.remove("cadastroActive");
         card.classList.add("loginActive")
    });

    cadastroBtn.addEventListener("click", () => {
        card.classList.add("cadastroActive");
        card.classList.remove("loginActive")
    });
}

// --- FUNÇÃO AUXILIAR PARA SALVAR SESSÃO ---
function saveSessionAndRedirect(data) {
    // 1. Salva o Token
    if (data.token) {
        localStorage.setItem('token', data.token);
    }

    // 2. Salva o ID do usuário
    // Verifica estruturas comuns: data.user.id ou data.id
    if (data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id);
    } else if (data.id) {
        localStorage.setItem('userId', data.id);
    }

    // 3. Redireciona
    window.location.href = '/';
}

// --- LÓGICA DE LOGIN ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                saveSessionAndRedirect(data);
            } else {
                alert(data.message || "Erro ao fazer login.");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Erro de conexão com o servidor.");
        }
    });
}

// --- LÓGICA DE CADASTRO (ATUALIZADA) ---
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value; // Usando o campo selecionado
        const phone = document.getElementById('registerPhone').value;

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: name, 
                    email: email, 
                    password: password, 
                    phone: phone 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCESSO!
                // Como o backend já devolve o token, tratamos igual ao login
                saveSessionAndRedirect(data); 
            } else {
                alert(data.message || "Erro ao cadastrar.");
            }

        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert("Erro de conexão ao tentar cadastrar.");
        }
    });
}