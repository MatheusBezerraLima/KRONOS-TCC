// const { localsName } = require("ejs")

const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const filter = document.querySelector(".filter")
const filterEd = document.querySelector(".filterEd")
const addTaskModal = document.querySelector(".addTaskModal")
const editTaskModal = document.querySelector("#editTaskModal")
const closeModalIcon = document.querySelector(".closeModalIcon")
const closeModalIconEd = document.querySelector(".closeModalIconEd")
// --- CORREÇÃO: Seleciona TODOS os dropdowns de status ---
const allDropDownStatuses = document.querySelectorAll(".selectStatusModal") 
// --- CORREÇÃO: Seleciona TODOS os dropdowns de categoria ---
const allDropDownCategories = document.querySelectorAll(".selectCategoryModal")
console.log("🟩🟩🟩🟩🟩🟩🟩",closeModalIcon);

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

closeModalIcon.addEventListener("click", closeModalTask);
filter.addEventListener("click", closeModalTask);

closeModalIconEd.addEventListener("click", closeModalTaskEd);

function closeModalTask() {
    filter.classList.remove("filterOn")
    addTaskModal.classList.remove("modalOn")
}

function closeModalTaskEd() {
    filterEd.classList.remove("filterOn")
    editTaskModal.classList.remove("modalOn")
}

//---------------------- Abrir e fechar dropdown do status ----------------------

function addStatusListeners(){
    allDropDownStatuses.forEach(dropDown => {
    console.log(dropDown);
    // Adiciona o clique para abrir/fechar este dropdown específico
    dropDown.addEventListener("click", (event) => {
        dropDown.classList.toggle("statusOpen");
        event.stopPropagation();
    });

    // Pega todas as opções DENTRO deste dropdown
    const optionsInThisDropdown = dropDown.querySelectorAll(".statusOption");
    console.log('options', optionsInThisDropdown);
    
    // Mudar status (lógica agora dentro do loop)
    optionsInThisDropdown.forEach(option => {
        option.addEventListener("click", (event) => {
            console.log(1);            
            if (dropDown.classList.contains("statusOpen")) {

                console.log(2);

                // CORREÇÃO: Remove 'statusSelected' apenas das opções IRMÃS
                optionsInThisDropdown.forEach(opt => opt.classList.remove("statusSelected"));

                console.log(2);
                
                
                option.classList.add("statusSelected");
                            console.log(3);


                // Atualiza o valor selecionado
                // (Note que 'selectedStatusValue' ainda é global, o que pode ser um bug se 
                // você precisar saber o valor de *ambos* os modais ao mesmo tempo)
                selectedStatusValue = option.getAttribute("data-status");
            }
        });
    });
});

// Lógica para fechar QUALQUER dropdown de status aberto ao clicar fora
document.addEventListener('click', (event) => {
    allDropDownStatuses.forEach(dropDown => {
        if (!dropDown.contains(event.target) && dropDown.classList.contains('statusOpen')) {
            dropDown.classList.remove('statusOpen');
        }
    });
});
}



//---------------------- Abrir e fechar dropdown de categoria (CORRIGIDO) ----------------------

// Aplica a lógica a CADA dropdown de categoria encontrado
allDropDownCategories.forEach(dropDown => {

    // Adiciona o clique para abrir/fechar este dropdown específico
    console.log("⭕⭕⭕⭕⭕", dropDown);
    
    dropDown.addEventListener("click", (event) => {
        dropDown.classList.toggle("categoryOpen");
        console.log("foi");
        
        event.stopPropagation();
    });

    // Pega todas as opções DENTRO deste dropdown
    const optionsInThisDropdown = dropDown.querySelectorAll(".categoryOption");

    // Mudar categoria (lógica agora dentro do loop)
    optionsInThisDropdown.forEach(option => {
        option.addEventListener("click", () => {
            if (dropDown.classList.contains("categoryOpen")) {
                // CORREÇÃO: Remove 'categorySelected' apenas das opções IRMÃS
                optionsInThisDropdown.forEach(opt => opt.classList.remove("categorySelected"));
                
                option.classList.add("categorySelected");

                selectedCategoryValue = option.getAttribute("data-category");
            }
        });
    });
});

// Lógica para fechar QUALQUER dropdown de categoria aberto ao clicar fora
document.addEventListener('click', (event) => {
    allDropDownCategories.forEach(dropDown => {
        if (!dropDown.contains(event.target) && dropDown.classList.contains('categoryOpen')) {
            dropDown.classList.remove('categoryOpen');
        }
    });
});

//---------------------- Nome da tarefa ----------------------
 

    taskNameInput.style.display = 'block'; 
    
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

//----------------------  Modal add membros no projeto ----------------------

openMembersModal.addEventListener("click", ()=> {
    memberModal.classList.add("memberModalOpen")
    searchMembersInput.focus()

})

closeMemberModal.addEventListener("click", ()=>{
        memberModal.classList.remove("memberModalOpen")

})


document.addEventListener('click', (event) => {
    
    const modalAberto = document.querySelector('.addMemberModal.memberModalOpen');

    if (modalAberto) {
        
        const isClickOutsideModal = !modalAberto.contains(event.target);
        
        const isClickOnOpenIcon = event.target.closest('.addMoreMembers');

        if (isClickOutsideModal && !isClickOnOpenIcon) {
            modalAberto.classList.remove('memberModalOpen');
        }
    }
});
//----------------------  Modal de opções da coluna: deletar e renomear ----------------------


document.addEventListener('click', (event) => {
    
    const modalAberto = document.querySelector('.actionsColumn.openActions');

    if (modalAberto) {
        
        const isClickOutsideModal = !modalAberto.contains(event.target);
        
        const isClickOnOpenIcon = event.target.closest('.seeColumnOptions');

        if (isClickOutsideModal && !isClickOnOpenIcon) {
            modalAberto.classList.remove('openActions');
        }
    }
});


// 2. Lógica para ABRIR e Fechar Outros Modais
seeColumnOptions.forEach((item) => {
    
    item.addEventListener("click", (event) => {
        console.log("Clicou no botao!!!!!!");
        
        const columnContainer = item.closest(".column");
        const targetModal = columnContainer ? columnContainer.querySelector(".actionsColumn") : null;
        
        if (targetModal) {
            
            document.querySelectorAll('.actionsColumn.openActions').forEach(openModal => {
                if (openModal !== targetModal) {
                    openModal.classList.remove('openActions');
                }
            });
            
            targetModal.classList.toggle("openActions");
        }
    });
});

//----------------------  Modal de opções da tarefa: deletar e renomear ----------------------

document.addEventListener('click', (event) => {
    
    const modalAberto = document.querySelector('.actionsTask.openActions');

    if (modalAberto) {
        
        const isClickOutsideModal = !modalAberto.contains(event.target);
        
        const isClickOnOpenIcon = event.target.closest('.seeTaskOptions');

        if (isClickOutsideModal && !isClickOnOpenIcon) {
            modalAberto.classList.remove('openActions');
        }
    }
});

seeTaskOptions.forEach((item) => {
    
    item.addEventListener("click", (event) => {
        const taskContainer = item.closest('.tasksToDoBoard'); 
        
        const targetModal = taskContainer ? taskContainer.querySelector(".actionsTask") : null;
        
        if (targetModal) {
            
            document.querySelectorAll('.actionsTask.openActions').forEach(openModal => {
                if (openModal !== targetModal) {
                    openModal.classList.remove('openActions');
                    
                    const associatedIcon = openModal.closest('.tasksToDoBoard')?.querySelector('.seeTaskOptions');
                    if (associatedIcon) {
                        associatedIcon.classList.remove('activeOptionsIcon');
                    }
                }
            });
            
            targetModal.classList.toggle("openActions");
            
            item.classList.toggle("activeOptionsIcon"); 
        }
    });
});

function setupAsideCheckboxes() {
    
    const taskCheckboxesCustom = document.querySelectorAll('.taskAsidecheckboxCustom');

    taskCheckboxesCustom.forEach(customBox => {
        customBox.addEventListener('click', () => {
            // A checkbox real é o irmão anterior (previousElementSibling)
            const inputCheckbox = customBox.previousElementSibling;
            
            if (inputCheckbox && inputCheckbox.type === 'checkbox') {
                // Alterna o estado 'checked'. O CSS se encarrega do resto.
                inputCheckbox.checked = !inputCheckbox.checked;
            }
        });
    });

    const subtaskCheckboxesCustom = document.querySelectorAll('.subtaskAsidecheckboxCustom');

    subtaskCheckboxesCustom.forEach(customBox => {
        customBox.addEventListener('click', () => {
            // A checkbox real é o irmão anterior (previousElementSibling)
            const inputCheckbox = customBox.previousElementSibling;
            
            if (inputCheckbox && inputCheckbox.type === 'checkbox') {
                // Alterna o estado 'checked'. O CSS se encarrega do resto.
                inputCheckbox.checked = !inputCheckbox.checked;
            }
        });
    });
}


// Chame a função para anexar os eventos de clique quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', setupAsideCheckboxes);

