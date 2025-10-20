// const { localsName } = require("ejs")

const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const filter = document.querySelector(".filter")
const addTaskModal = document.querySelector(".addTaskModal")
const addTaskButton = document.querySelector(".addTask")
const closeModalIcon = document.querySelector(".closeModalIcon")
const dropDownStatus = document.querySelector(".selectStatusModal")
const statusOptions = document.querySelectorAll(".statusOption")
let selectedStatusValue = document.querySelector(".statusSelected")
const dropDownCategory = document.querySelector(".selectCategoryModal")
const categoryOptions = document.querySelectorAll(".categoryOption")
let selectedCategoryValue = document.querySelectorAll(".categorySelected")
const selectDate = document.querySelector(".selectDate")
const invisibleDateInput = document.querySelector(".invisibleDateInput")
const dateValue = document.querySelector(".dateValue")
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

//---------------------- Abrir e fechar dropdown do status ----------------------

dropDownStatus.addEventListener("click", (event) => {
     
    dropDownStatus.classList.toggle("statusOpen");

    event.stopPropagation();
});

document.addEventListener('click', (event) => {
    // Fecha se o clique for fora do dropdown E ele estiver aberto
    if (!dropDownStatus.contains(event.target) && dropDownStatus.classList.contains('statusOpen')) {
        dropDownStatus.classList.remove('statusOpen');
    }    
});

// Mudar status

statusOptions.forEach(option => {
    option.addEventListener("click", () =>{
        if (dropDownStatus.classList.contains("statusOpen")) {

            statusOptions.forEach(opt => opt.classList.remove("statusSelected"));
            
            option.classList.add("statusSelected");

            selectedStatusValue = option.getAttribute("data-status");
        }
    })
})

//---------------------- Abrir e fechar dropdown de categoria ----------------------

dropDownCategory.addEventListener("click", (event) => {
     
    dropDownCategory.classList.toggle("categoryOpen");

    event.stopPropagation();
});

document.addEventListener('click', (event) => {
    // Fecha se o clique for fora do dropdown E ele estiver aberto
    if (!dropDownCategory.contains(event.target) && dropDownCategory.classList.contains('categoryOpen')) {
        dropDownCategory.classList.remove('categoryOpen');
    }
});

// Mudar categoria

categoryOptions.forEach(option => {
    option.addEventListener("click", () =>{
        if (dropDownCategory.classList.contains("categoryOpen")) {

            categoryOptions.forEach(opt => opt.classList.remove("categorySelected"));
            
            option.classList.add("categorySelected");

            selectedCategoryValue = option.getAttribute("data-category");
        }
    })
})

//---------------------- Selecionar data ----------------------

function brazilDateFormat(dataObj) {
    if (!dataObj) return "Nenhuma data definida";

    const options = {day: "numeric", month: "long", year: "numeric"};

    return new Intl.DateTimeFormat("pt-br", options).format(dataObj);
}

function dateUpdate(dataObj){
    formattedDate = brazilDateFormat(dataObj);
    dateValue.textContent = formattedDate;

    if (dataObj){
        dateValue.classList.remove("placeholder")
        dateValue.classList.add("withValue")
    } else {
        dateValue.classList.remove("withValue")
        dateValue.classList.add("placeholder")
    }
}

const fp = flatpickr(invisibleDateInput, {
    dateFormat: "d.m.y",
    allowInput: false,
    locale: flatpickr.l10ns.pt,

    appendTo: selectDate, 
    position: "below",

    onChange: function(selectedDates, dateStr, instance) {
        const selectedDate = selectedDates[0];
        dateUpdate(selectedDate);
    }
})

console.log(fp);

dateUpdate(null);

selectDate.addEventListener("click", () =>{
    fp.open()
})


























