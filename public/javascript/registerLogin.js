// --- SELETORES GERAIS ---
const loginButton = document.querySelector(".loginButton");
const cadastroButton = document.querySelector(".cadastroButton");
const filter = document.querySelector(".filter");
const modal = document.querySelector(".modalTermsAndConditions");
const closeModalIcon = document.querySelector(".closeModal");
const acceptTermsButton = document.querySelector(".acceptTermsAndConditions");
const refuseTermsButton = document.querySelector(".refuseTermsAndConditions");
const openModal = document.querySelector(".openModal");
const registerButton = document.querySelector(".inputSubmit");
const checkbox = document.querySelector(".checkbox");
const card = document.querySelector(".card");

// Defina a URL base da sua API aqui
const API_BASE_URL = "http://localhost:3333";

// --- 1. ANIMAÇÃO DE TROCA DE TELA (LOGIN / CADASTRO) ---
if (loginButton && cadastroButton && card) {
    loginButton.addEventListener("click", () => {
        card.classList.remove("cadastroActive");
        card.classList.add("loginActive");
    });

    cadastroButton.addEventListener("click", () => {
        card.classList.add("cadastroActive");
        card.classList.remove("loginActive");
    });
}

// --- 2. MODAL DE TERMOS ---
if (openModal && modal && filter) {
    openModal.addEventListener("click", (e) => {
        e.preventDefault(); // Previne comportamento de link se houver
        modal.classList.remove("hidden");
        filter.classList.remove("hidden");
    });
}

function closeModalFunc() {
    if (filter) filter.classList.add("hidden");
    if (modal) modal.classList.add("hidden");
}

if (closeModalIcon) closeModalIcon.addEventListener("click", closeModalFunc);
if (filter) filter.addEventListener("click", closeModalFunc);

if (acceptTermsButton) {
    acceptTermsButton.addEventListener("click", () => {
        if (checkbox) checkbox.checked = true;
        closeModalFunc();
    });
}

if (refuseTermsButton) {
    refuseTermsButton.addEventListener("click", () => {
        if (checkbox) checkbox.checked = false;
        closeModalFunc();
    });
}

// --- 3. FUNÇÕES AUXILIARES ---
function saveSessionAndRedirect(data) {
    try {
        // 1. Salva o Token
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        // 2. Salva o ID do usuário
        if (data.user && data.user.id) {
            localStorage.setItem('userId', data.user.id);
            // Cuidado ao salvar objetos inteiros, prefira JSON.stringify
            localStorage.setItem('user', JSON.stringify(data.user)); 
        } else if (data.id) {
            localStorage.setItem('userId', data.id);
        }

        // 3. Redireciona
        window.location.href = '/'; // ou './index.html' dependendo da estrutura
    } catch (e) {
        console.error("Erro ao salvar sessão:", e);
    }
}

function startLoading() {
    if (registerButton) {
        registerButton.classList.add("loading");
        registerButton.disabled = true;
        registerButton.value = "Carregando..."; // Feedback visual opcional
    }
}

function stopLoading() {
    if (registerButton) {
        registerButton.classList.remove("loading");
        registerButton.disabled = false;
        registerButton.value = "Cadastrar"; // Restaura texto original
    }
}

// --- 4. LÓGICA DE CADASTRO ---
// Unifiquei a lógica aqui. Use o ID do formulário para garantir o alvo correto.
const registerForm = document.getElementById('registerForm'); // Certifique-se que seu <form> tem id="registerForm"

if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        // CRUCIAL: Impede o reload da página
        event.preventDefault(); 

        // Validação do Checkbox
        if (checkbox && !checkbox.checked) {
            alert("Você deve aceitar os termos.");
            return;
        }

        startLoading();

        // Coleta de dados
        // Use o Optional Chaining (?.) para evitar erro se o campo não existir
        const name = document.getElementById('registerName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const phone = document.getElementById('registerPhone')?.value;

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone })
            });

            const data = await response.json();

            if (response.ok) {
                saveSessionAndRedirect(data);
            } else {
                alert(data.message || "Erro ao cadastrar.");
                stopLoading();
            }
        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert("Erro de conexão ao tentar cadastrar.");
            stopLoading();
        }
    });
}

// --- 5. LÓGICA DE LOGIN ---
// Agora fora do bloco de cadastro!
const loginForm = document.getElementById('loginForm'); // Certifique-se que seu <form> tem id="loginForm"

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        // CRUCIAL: Impede o reload da página
        event.preventDefault();

        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;

        // Feedback visual simples no botão de login (opcional)
        const btnLogin = loginForm.querySelector('button') || loginForm.querySelector('input[type="submit"]');
        const originalText = btnLogin ? btnLogin.innerText || btnLogin.value : "";
        if(btnLogin) {
            btnLogin.disabled = true;
            if(btnLogin.innerText) btnLogin.innerText = "Entrando...";
            else btnLogin.value = "Entrando...";
        }

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
                if(btnLogin) {
                    btnLogin.disabled = false;
                    if(btnLogin.innerText) btnLogin.innerText = originalText;
                    else btnLogin.value = originalText;
                }
            }
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Erro de conexão com o servidor.");
            if(btnLogin) {
                btnLogin.disabled = false;
                if(btnLogin.innerText) btnLogin.innerText = originalText;
                else btnLogin.value = originalText;
            }
        }
    });
}