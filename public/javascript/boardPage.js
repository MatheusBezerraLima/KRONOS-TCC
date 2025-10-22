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
const activitysModalSections = document.querySelectorAll(".activityTitle")
const subtaskContainer = document.querySelector(".listSubtasks")
const createSubtask = document.querySelector(".createSubtasks")
const taskNameInput = document.querySelector('.invisibleTaskNameInput');
const defaultPlaceholderText = 'Nova tarefa';
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
    taskNameInput.focus()
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

//---------------------- Nome da tarefa ----------------------
 

    taskNameInput.style.display = 'block'; 

    taskNameInput.focus();
    
    taskNameInput.addEventListener('click', () => {
        
        if (taskNameInput.textContent.trim() === defaultPlaceholderText) {
            taskNameInput.value = ''; 
        } else {
            taskNameInput.value = taskNameInput.textContent.trim();
        }
    });

    // Lógica para quando o usuário terminar de digitar (Perder o foco ou Pressionar Enter)
    taskNameInput.addEventListener('blur', () => {
        const newTaskName = taskNameInput.value.trim();
        // taskNameInput.classList.add(".invisibleCursor")
        // Se o usuário não digitar nada, volta para o texto padrão/placeholder
        if (newTaskName === '') {
            taskNameInput.textContent = defaultPlaceholderText; 
        } else {
            taskNameInput.textContent = newTaskName;
        }

        // Esconde o input e mostra o h2
    });

    taskNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            // taskNameInput.classList.add(".invisibleCursor")
            taskNameInput.blur();

        }
    });


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

//---------------------- Seleçao das checkboxs ----------------------

function addCheckEvent (newSubtaskRow) {
    const customCheckboxes = document.querySelectorAll('.checkboxCustom');
    customCheckboxes.forEach(customBox => {
        customBox.addEventListener('click', () => {
            // Encontra o input que é o irmão anterior (previousElementSibling)
            const inputCheckbox = customBox.previousElementSibling;
            
            // confere se realmente o irmão anterior (subtaskCheckbox) é uma checkbox
            if (inputCheckbox && inputCheckbox.type === 'checkbox') {
                // Alterna o estado "checked" do input real
                inputCheckbox.checked = !inputCheckbox.checked;
                
                // Dispara o evento 'change' (útil se o seu código depender dele)
                inputCheckbox.dispatchEvent(new Event('change'));
            }
        });
    });
}


//---------------------- Seleção das seções Subtarefas e Comentários ----------------------

activitysModalSections.forEach(section => {
    section.addEventListener("click", () => {
        activitysModalSections.forEach(i => {
            i.classList.remove("activitySectionSelected")
        })
        section.classList.add("activitySectionSelected")
    })
});

//----------------------  Nome da tarefa  ----------------------

//---------------------- Criação de novas tarefas ----------------------

createSubtask.addEventListener("click", ()=>{

    const newTask = `
                    <div class="subtask editing">
                            <div class="checkboxAndNameContainer">
                            <input class= "subtaskCheckbox" type="checkbox">

                            <span class="checkboxCustom">
                                <svg class="checkIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                            </span>

                             <input class= "insertNameInput" type="text" placeholder="Nova subtarefa">
                            </div>
                    </div> <!-- subtask -->
                    `
    // inserir estrutura HTML dentro da div subtasks depois de qualquer conteúdo existente dentro dela
    subtaskContainer.insertAdjacentHTML("beforeend", newTask)
    
    // armazenando em uma variavel o novo HTML adicionado a classe subtaskContainer
    const newSubtaskRow = subtaskContainer.querySelector(".subtask.editing")
    console.log(newSubtaskRow);
    
    // armazenando o elemento input, onde irá ser o campo que o usuário digita
    const inputField = newSubtaskRow.querySelector(".insertNameInput")

    // adiciona o foco do cursor no elemento (o negocinho piscando) 
    inputField.focus()

    if(newSubtaskRow){
            setListenerandConversion(newSubtaskRow, inputField)
    }
})

function setListenerandConversion(newSubtaskRow, inputField){
    inputField.addEventListener("keypress", (event) =>{
        if (event.key === "Enter") {
            const subtaskName = inputField.value.trim() // o metodo trim tira todos os espaços em branco

        if (subtaskName){
                convertToFinalSubtask(newSubtaskRow, subtaskName)
            } else  {
                newSubtaskRow.remove()
            }
        }        
    })

    inputField.addEventListener("blur", () => {
        const subtaskName = inputField.value.trim() // o metodo trim tira todos os espaços em branco

        if(subtaskName === "") {
            newSubtaskRow.remove()
        } else {
            convertToFinalSubtask(newSubtaskRow, subtaskName)   

        }
    })
}

function addDeleteListener(subtaskElement) {
    // 1. Encontra o ícone 'X' (deleteSubtask) dentro da nova subtarefa
    const deleteIcon = subtaskElement.querySelector(".deleteSubtask");
    
    if (deleteIcon) {
        // 2. Adiciona o evento de clique
        deleteIcon.addEventListener("click", () => {
            // 3. Remove todo o elemento pai (a div.subtask)
            subtaskElement.remove(); 
        });
    }
}
 function convertToFinalSubtask(newSubtaskRow, subtaskName){
    const finalSubtaskHTML = `
                            <div class="subtask">
                                <div class="checkboxAndNameContainer">
                                <input class= "subtaskCheckbox" type="checkbox">

                                <span class="checkboxCustom">
                                    <svg class="checkIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                                </span>

                                <span class="subtaskName">${subtaskName}</span>
                                </div>
                                <svg class = "deleteSubtask" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>

                            </div> <!-- subtask -->
                            `
    const tempElement = document.createElement('div');
    tempElement.innerHTML = finalSubtaskHTML.trim(); // .trim() é opcional, mas ajuda na limpeza

    // 2. Selecione o elemento filho real (a div.subtask finalizada)
    const finalSubtaskElement = tempElement.firstElementChild;

    // 3. Substitua o elemento de edição original pelo novo elemento finalizado
    newSubtaskRow.replaceWith(finalSubtaskElement); 
   
    addCheckEvent() 

    addDeleteListener(finalSubtaskElement);
}
