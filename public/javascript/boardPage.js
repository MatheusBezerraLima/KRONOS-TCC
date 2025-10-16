const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const filter = document.querySelector(".filter")
const addTaskModal = document.querySelector(".addTaskModal")
const addTaskButton = document.querySelector(".addTask")
const closeModalIcon = document.querySelector(".closeModalIcon")
const selector= document.getElementById("statusSelector")
const statusOptions = document.querySelectorAll(".statusOption")
let selectedStatusValue = selector.querySelector(".statusSelected")



// Função de seleção dos links do menu lateral

menuLinksSelection.forEach(item => {

    // adicionado evento de clique para cada item do link
    item.addEventListener("click", () => {

        // para cada link do menu estou removendo a classe select
        menuLinksSelection.forEach(i => {
            i.classList.remove("selected");
        });

        // depois estou colocando elas de novo
        item.classList.add("selected");
    });
});

// Função de seleção dos links de categoria do board

categoryBoardSelection.forEach(item => {
    item.addEventListener("click", () => {
        
        categoryBoardSelection.forEach(i =>{
            i.classList.remove("selectedCategory");
        });

        item.classList.add("selectedCategory");
    });
});

// Função de fechar e abrir menu

closeMenu.addEventListener("click", toggleMenu);

function toggleMenu() {
    sideMenu.classList.toggle("asideClosed");
}

// Função para abrir o modal

addTaskButton.addEventListener("click", openModalTask);

function openModalTask() {
    filter.classList.add("filterOn")
    addTaskModal.classList.add("modalOn")
}

// Função para fechar modal de criação de tarefas clicando no icone X

closeModalIcon.addEventListener("click", closeModalTask);
filter.addEventListener("click", closeModalTask);

function closeModalTask() {
    filter.classList.remove("filterOn")
    addTaskModal.classList.remove("modalOn")
}

// Abrir e fechar dropdown de escolher o status

selector.addEventListener("click", (event) =>{
    if (!event.target.closest(".statusOption")) {
        selector.classList.toggle('statusSelector--open')
    }
});





















