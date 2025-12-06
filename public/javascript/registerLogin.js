let card = document.querySelector(".card");
let loginButton = document.querySelector(".loginButton");
let cadastroButton = document.querySelector(".cadastroButton");
const filter = document.querySelector(".filter")
const modal = document.querySelector(".modalTermsAndConditions")
const closeModalIcon = document.querySelector(".closeModal")
const acceptTermsButton = document.querySelector(".acceptTermsAndConditions")
const refuseTermsButton = document.querySelector(".refuseTermsAndConditions")
const openModal = document.querySelector(".openModal")
const registerButton = document.querySelector(".inputSubmit")
const checkbox = document.querySelector(".checkbox")
const submitForm = document.querySelector(".submitForm")

loginButton.onclick = () => {
    card.classList.remove("cadastroActive")
    card.classList.add("loginActive")
}

cadastroButton.onclick = () => {
    card.classList.remove("loginActive")
    card.classList.add("cadastroActive")
}

/* Abrir modal */

openModal.addEventListener("click", ()=>{
    modal.classList.remove("hidden")
    filter.classList.remove("hidden")
    
})

/* Fechar o modal */

closeModalIcon.addEventListener("click", ()=>{
    filter.classList.add("hidden")
    modal.classList.add("hidden")
})

filter.addEventListener("click", () => {
    filter.classList.add("hidden");
    modal.classList.add("hidden");
});


acceptTermsButton.addEventListener("click", ()=>{
    checkbox.checked = true
    filter.classList.add("hidden")
    modal.classList.add("hidden")
})

refuseTermsButton.addEventListener("click", ()=>{
    checkbox.checked = false
    filter.classList.add("hidden")
    modal.classList.add("hidden")
})

function startLoading() {
    registerButton.classList.add("loading");
    registerButton.disabled = true; 
}

function stopLoading() {
    registerButton.classList.remove("loading");
    registerButton.disabled = false;
}

if (submitForm && registerButton) {
    submitForm.addEventListener('submit', function(event) {
        
        if (!checkbox.checked) {
            event.preventDefault(); 
            alert("Você deve aceitar os termos.");
            return; 
        }
        startLoading(); 
        
    });
}