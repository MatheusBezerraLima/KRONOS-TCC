const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const filter = document.querySelector(".filter")
const filterEd = document.querySelector(".filterEd")
const addTaskModal = document.querySelector(".addTaskModal")
const editTaskModal = document.querySelector(".editTaskModal")
const addTaskButton = document.querySelector(".addTask")
const closeModalIcon = document.querySelector(".closeModalIcon")
const closeModalIconEd = document.querySelector(".closeModalIconEd")
// --- CORREÇÃO: Seleciona TODOS os dropdowns de status ---
const allDropDownStatuses = document.querySelectorAll(".selectStatusModal") 
// --- CORREÇÃO: Seleciona TODOS os dropdowns de categoria ---
const allDropDownCategories = document.querySelectorAll(".selectCategoryModal")

// Estas variáveis globais podem ser problemáticas, mas vamos mantê-las por agora
let selectedStatusValue = document.querySelector(".statusSelected")
let selectedCategoryValue = document.querySelectorAll(".categorySelected")

const selectDate = document.querySelector(".selectDate")
const invisibleDateInput = document.querySelector(".invisibleDateInput")
const dateValue = document.querySelector(".dateValue")
const activitysModalSections = document.querySelectorAll(".activityTitle")
const subtaskContainer = document.querySelector(".listSubtasks")
const createSubtask = document.querySelector(".createSubtasks")
const taskNameInput = document.querySelector('.invisibleTaskNameInput');
const defaultPlaceholderText = 'Nova tarefa';
const openMembersModal = document.querySelector(".addMoreMembers")
const memberModal = document.querySelector(".addMemberModal")
const closeMemberModal = document.querySelector(".closeMemberModal")
const searchMembersInput = document.querySelector(".searchMembers")
const seeColumnOptions = document.querySelectorAll(".seeColumnOptions")
const columnOptionsModal = document.querySelectorAll(".actionsColumn")
const taskOptionsModal = document.querySelectorAll(".actionsTask")
const seeTaskOptions = document.querySelectorAll(".seeTaskOptions")

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

closeMenu.addEventListener("click", toggleMenu);

function toggleMenu() {
    sideMenu.classList.toggle("asideClosed");
}

// Função para abrir o modal

addTaskButton.addEventListener("click", openModalTask);


function openModalTask() {
    filter.classList.add("filterOn")
    addTaskModal.classList.add("modalOn")
    taskNameInput.focus()
}

categoryBoardSelection.forEach(item => {
    item.addEventListener("click", () => {
        
        categoryBoardSelection.forEach(i =>{
            i.classList.remove("selectedCategory");
        });

        item.classList.add("selectedCategory");
    });
});


