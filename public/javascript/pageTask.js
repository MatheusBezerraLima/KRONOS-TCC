
const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const dropDownStatus = document.querySelector(".selectStatusModal")
const statusOptions = document.querySelectorAll(".statusOption")
let selectedStatusValue = document.querySelector(".statusSelected")
const createTask = document.querySelector(".createTask")
const taskContainer = document.querySelector(".taskList")
const openOrderModalArea = document.querySelector(".orderTasks")
const orderModal = document.querySelector(".orderTaskModal")

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

//---------------------- Selecionar data ----------------------

function brazilDateFormat(dataObj) {

    const options = {day: "numeric", month: "numeric", year: "numeric"};

    return new Intl.DateTimeFormat("pt-br", options).format(dataObj);
}

function dateUpdate(dataObj){
    formattedDate = brazilDateFormat(dataObj);
    dateValue.textContent = formattedDate;

    if (dataObj){
        dateValue.classList.remove("noValue")
        dateValue.classList.add("withValue")
    } else {
        dateValue.classList.remove("withValue")
        dateValue.classList.add("noValue")
    }
}

/* Refatoração da função de data para ser usada em todas as tasks e ser chamada na função de inicialização */

function setupDatePickerForTask(taskElement) {
    const selectDate = taskElement.querySelector(".dueDateContainer");
    const invisibleDateInput = taskElement.querySelector(".invisibleDateInput");
    const dateValue = taskElement.querySelector(".dueDateValue");
    
    if (!invisibleDateInput) return;

    function dateUpdateForTask(dataObj, valueElement) {
        const formattedDate = brazilDateFormat(dataObj);
        valueElement.textContent = formattedDate;

        if (dataObj){
            valueElement.classList.remove("noValue");
            valueElement.classList.add("withValue");
        } else {
            valueElement.classList.remove("withValue");
            valueElement.classList.add("noValue");
        }
    }
    
    const fp = flatpickr(invisibleDateInput, {
        dateFormat: "d.m.y",
        allowInput: false,
        locale: flatpickr.l10ns.pt,
        appendTo: selectDate, 
        position: "below",
        onChange: function(selectedDates) {
            const selectedDate = selectedDates[0];
            dateUpdateForTask(selectedDate, dateValue); 
        }
    });
    
    // Listener para abrir o calendário
    selectDate.addEventListener("click", () => {
        fp.open();
    });

    dateUpdateForTask(null, dateValue); // Inicializa a data
}

// Sua função brazilDateFormat pode permanecer global
function brazilDateFormat(dataObj) {
    const options = {day: "numeric", month: "numeric", year: "numeric"};
    return new Intl.DateTimeFormat("pt-br", options).format(dataObj);
}


const statusClickArea = document.querySelector(".statusClickArea"); 
const selectedStatus = document.querySelector(".selectedStatus"); 
const selectStatusModal = document.querySelector(".selectStatusModal");
const statusOptionContainers = Array.from(document.querySelectorAll(".statusBadgeContainer")); 
const statusOptionsWrapper = document.getElementById('optionsWrapper'); 

let currentStatus = "toDo"; 

const statusMap = {
    toDo: { type: 'status', text: "Pendente", class: "toDoStatus", marker: "toDoMarker", allClasses: ["toDoStatus", "doingStatus", "doneStatus"], allMarkers: ["toDoMarker", "doingMarker", "doneMarker"] },
    doing: { type: 'status', text: "Em andamento", class: "doingStatus", marker: "doingMarker", allClasses: ["toDoStatus", "doingStatus", "doneStatus"], allMarkers: ["toDoMarker", "doingMarker", "doneMarker"] },
    done: { type: 'status', text: "Concluído", class: "doneStatus", marker: "doneMarker", allClasses: ["toDoStatus", "doingStatus", "doneStatus"], allMarkers: ["toDoMarker", "doingMarker", "doneMarker"] }
};


const priorityClickArea = document.querySelector(".priorityClickArea"); 
const selectedPriority = document.querySelector(".selectedPriority"); 
const selectPriorityModal = document.querySelector(".selectPriorityModal");
const priorityOptionContainers = Array.from(document.querySelectorAll(".priorityBadgeContainer")); 
const priorityOptionsWrapper = document.querySelector('.priorityOptionsWrapper'); 

let currentPriority = "high";

const priorityMap = {
    high: { type: 'priority', text: "Alta", class: "highPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] },
    medium: { type: 'priority', text: "Média", class: "mediumPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] },
    low: { type: 'priority', text: "Baixa", class: "lowPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] }
};


function toggleModal(type) {
    const modal = (type === 'status') ? selectStatusModal : selectPriorityModal;
    if (modal) {
        modal.classList.toggle('selectModalHidden'); // Usamos a mesma classe de esconder
    }
}

function updateBadges(type){
    const current = (type === 'status') ? currentStatus : currentPriority;
    const map = (type === 'status') ? statusMap : priorityMap;

    const info = map[current];
    const trigger = (type === 'status') ? statusClickArea : priorityClickArea;
    const header = (type === 'status') ? selectedStatus : selectedPriority;

    const updateBadge = (badgeElement) => {
        // 1. Limpeza
        // Remove TODAS as classes de status OU TODAS as de prioridade
        badgeElement.classList.remove(...info.allClasses);

        // 2. Adiciona nova classe
        badgeElement.classList.add(info.class);

        // 3. Atualiza texto
        const spanElement = badgeElement.querySelector("span");
        if (spanElement) { 
            spanElement.textContent = info.text;
        }
        
        // 4. Lógica CONDICIONAL do Marcador (Apenas para Status)
        if (info.marker) {
            const marker = badgeElement.querySelector(".statusMarker");
            if (marker) { 
                marker.classList.remove(...info.allMarkers);
                marker.classList.add(info.marker);
            }
        }
    };

    updateBadge(trigger);
    updateBadge(header);
    header.setAttribute(`data-${type}`, current); // Define data-status ou data-priority
}


function reorderList(type){
    const current = (type === 'status') ? currentStatus : currentPriority;
    const containers = (type === 'status') ? statusOptionContainers : priorityOptionContainers;
    const wrapper = (type === 'status') ? statusOptionsWrapper : priorityOptionsWrapper;
    const dataAttribute = `data-${type}`; // data-status ou data-priority

    let selectedContainer = null;
    let otherContainers = [];

    containers.forEach(container => {
        const badge = container.querySelector(".statusBadge") || container.querySelector(".priorityBadge");
        
        if (!badge) return; 
        
        const selectionValue = badge.getAttribute(dataAttribute);

        if (selectionValue === current){
            selectedContainer = container;
        } else {
            otherContainers.push(container);
        }
    });

    if (selectedContainer && wrapper){ 
        wrapper.innerHTML = ''; 
        wrapper.appendChild(selectedContainer);
        otherContainers.forEach(container => {
            wrapper.appendChild(container);
        });
    }
}

taskContainer.addEventListener('click', (event) => {
    
    let target = event.target.closest('.statusClickArea') || event.target.closest('.priorityClickArea');
    
    if (target) {
        event.stopPropagation();
        
        const task = target.closest('.task');
        const isStatus = target.classList.contains('statusClickArea');
        const modalClass = isStatus ? '.selectStatusModal' : '.selectPriorityModal';
        const modal = task.querySelector(modalClass);
        
        if (modal) {
            modal.classList.toggle('selectModalHidden');             
        }
    }
    
    let optionContainer = event.target.closest('.statusBadgeContainer') || event.target.closest('.priorityBadgeContainer');
    
    if (optionContainer) {
        event.stopPropagation();
        const task = optionContainer.closest('.task');
        const isStatus = !!optionContainer.querySelector('.statusBadge');
        const type = isStatus ? 'status' : 'priority';
        const dataAttribute = `data-${type}`;
        
        const badge = optionContainer.querySelector(`[${dataAttribute}]`);
        if (!badge) return;
        
        const newSelection = badge.getAttribute(dataAttribute);
        
        updateTaskBadges(task, type, newSelection);

        const modalClass = isStatus ? '.selectStatusModal' : '.selectPriorityModal';
        const modal = task.querySelector(modalClass);
        if (modal) {
            setTimeout(() => modal.classList.add('selectModalHidden'), 0);
        }
    }
    
    let categoryBadge = event.target.closest('.categoryBadge');
    if (categoryBadge && !categoryBadge.classList.contains('noCategorySelected') && !categoryBadge.closest('.selectCategoryModal')) {
         const task = categoryBadge.closest('.task');       
    }

});

document.addEventListener('click', (event) => {
    document.querySelectorAll('.selectModalHidden').forEach(modal => {
        if (!modal.contains(event.target)) {
            modal.classList.add('selectModalHidden');
        }
    });
});

taskContainer.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && event.target.classList.contains("invisibleTaskNameInput")){
        event.target.blur(); // Salva e remove foco
    }
});


// Função adaptada que agora aceita o elemento da tarefa e o novo valor
function updateTaskBadges(taskElement, type, newSelection) {
    const map = (type === 'status') ? statusMap : priorityMap;
    const info = map[newSelection];
    
    const triggerClass = (type === 'status') ? '.statusClickArea' : '.priorityClickArea';
    const headerClass = (type === 'status') ? '.selectedStatus' : '.selectedPriority';

    const trigger = taskElement.querySelector(triggerClass);
    const header = taskElement.querySelector(headerClass);
    
    const updateBadge = (badgeElement) => {
        badgeElement.classList.remove(...info.allClasses);
        badgeElement.classList.add(info.class);

        const spanElement = badgeElement.querySelector("span");
        if (spanElement) { spanElement.textContent = info.text; }
        
        if (type === 'status') {
            const marker = badgeElement.querySelector(".statusMarker");
            if (marker) { 
                marker.classList.remove(...info.allMarkers);
                marker.classList.add(info.marker);
            }
        }
    };
    
    if (trigger) updateBadge(trigger);
    if (header) {
        updateBadge(header);
        header.setAttribute(`data-${type}`, newSelection);
    }
}

/* Categoria */

function toggleCategoryModal (){
    selectCategoryModal.classList.toggle("selectCategoryHidden")
    createNewCategoryInput.focus()
}
document.addEventListener('click', (event) => {
    document.querySelectorAll('.selectModalHidden, .selectCategoryHidden').forEach(modal => {
    });
    
    // Simplificando o fechamento:
    document.querySelectorAll('.selectStatusModal, .selectPriorityModal, .selectCategoryModal').forEach(modal => {
        const modalIsVisible = !modal.classList.contains('selectModalHidden') && !modal.classList.contains('selectCategoryHidden');
        
        const task = modal.closest('.task');
        const openButton = task ? task.querySelector('.categoryContainer') : null; 
        
        if (modalIsVisible && !modal.contains(event.target) && (!openButton || !openButton.contains(event.target))) {
            modal.classList.add(modal.classList.contains('selectStatusModal') || modal.classList.contains('selectPriorityModal') ? 'selectModalHidden' : 'selectCategoryHidden');
        }
    });
});
const CATEGORY_COLOR_PAIRS = [
    { bg: '#FFDEDE', text: '#D32F2F'}, 
    { bg: '#E3F2FD', text: '#1976D2'}, 
    { bg: '#E8F5E9', text: '#388E3C'}, 
    { bg: '#FFFDE7', text: '#FBC02D'}, 
    { bg: '#F3E5F5', text: '#7B1FA2'}, 
    { bg: '#FBE9E7', text: '#E64A19'}, 
    { bg: '#ECEFF1', text: '#455A64'}, 
    { bg: '#FFF8E1', text: '#FF8F00'}, 
    { bg: '#D0F8FF', text: '#00BCD4'}, 
    { bg: '#FCE4EC', text: '#C2185B'}  
];

function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * CATEGORY_COLOR_PAIRS.length);
    return CATEGORY_COLOR_PAIRS[randomIndex];
}

function addCategoryOption(taskElement, name, bg, txt) {
    const container = document.createElement("div");
    container.className = "categoryBadgeContainer";

    const badgeDiv = document.createElement("div");
    badgeDiv.className = "categoryBadge";

    const spanName = document.createElement("span");
    spanName.className = "categoryNameText";
    spanName.textContent = name; 

    badgeDiv.style.backgroundColor = bg;
    badgeDiv.style.color = txt;

    badgeDiv.appendChild(spanName);

    badgeDiv.onclick = () => selectCategoryOption(taskElement, name, bg, txt);

    container.appendChild(badgeDiv);

    const categoryOptionsWrapper = taskElement.querySelector(".categoryOptionsWrapper");

    if (categoryOptionsWrapper) {
        categoryOptionsWrapper.appendChild(container);
    }
}


const selectedCategoryDisplay = document.querySelector(".categoryBadge"); 
const categoryBadgeHeader = document.querySelector('.categoryBadgeHeaderModal');

function selectCategoryOption(taskElement, name, bg, txt) {
    const selectedCategoryDisplay = taskElement.querySelector(".categoryBadge:not(.categoryBadgeHeaderModal)"); 
    const categoryBadgeHeader = taskElement.querySelector('.categoryBadgeHeaderModal');

    const updateBadge = (badgeElement) => {
        if (!badgeElement) return;

        badgeElement.classList.remove("noCategorySelected");
        badgeElement.style.backgroundColor = bg;
        badgeElement.style.color = txt;

        let textSpan = badgeElement.querySelector('.categoryNameText');

        if (!textSpan) {
            textSpan = document.createElement("span");
            textSpan.className = "categoryNameText";
            badgeElement.appendChild(textSpan);
        }
        
        textSpan.textContent = name;
    };

    // Atualiza o badge principal da tarefa
    updateBadge(selectedCategoryDisplay);
    
    // Atualiza o badge no cabeçalho do modal
    updateBadge(categoryBadgeHeader);
}

function initializeTaskFunctions(taskElement) {

    setupDatePickerForTask(taskElement); 
    addCheckEvent (taskElement);

    const categoryContainer = taskElement.querySelector(".categoryContainer");
    const createNewCategoryInput = categoryContainer.querySelector(".createNewCategory");
    const selectCategoryModal = categoryContainer.querySelector(".selectCategoryModal");
    const categoryOptionsWrapper = categoryContainer.querySelector(".categoryOptionsWrapper");

    categoryContainer.addEventListener('click', (event) => {
        const modal = categoryContainer.querySelector(".selectCategoryModal");
        const input = categoryContainer.querySelector(".createNewCategory");

        if (modal) {
            modal.classList.toggle("selectCategoryHidden");
            if (!modal.classList.contains('selectCategoryHidden') && input) {
                 input.focus();
            }
        }
    });

    createNewCategoryInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter"){
            const categoryName = createNewCategoryInput.value.trim();

            if (categoryName === "") return;

            const colorPair = getRandomColor();

            // Chamada adaptada: Passa o elemento da tarefa atual!
            addCategoryOption(taskElement, categoryName, colorPair.bg, colorPair.text);
            selectCategoryOption(taskElement, categoryName, colorPair.bg, colorPair.text);

            createNewCategoryInput.value = "";
            selectCategoryModal.classList.add("selectCategoryHidden");
        }
    });
    
    categoryOptionsWrapper.addEventListener('click', (event) => {
        const badge = event.target.closest('.categoryBadge');
        if (badge && !badge.closest('.categoryModalHeader')) {
            const name = badge.textContent.trim();
            const bg = badge.style.backgroundColor;
            const txt = badge.style.color;
            
            selectCategoryOption(taskElement, name, bg, txt);
            selectCategoryModal.classList.add("selectCategoryHidden");
        }
    });
}


function createNewTaskRow() {
    const taskRow = document.createElement("div");
    taskRow.classList.add("task");

    taskRow.innerHTML = `
        <div class="taskNameContainer">
            <input type="checkbox" class="checkBoxTask">
            <span class= "checkboxCustom">
                <svg class = "checkIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <input type="text" class="invisibleTaskNameInput">
        </div>

        <div class="dueDateContainer taskClickArea">
            <span class="dueDateValue"></span>
            <input type="text" class="invisibleDateInput" style="display: none;">
        </div>

        <div class="statusContainer">
            <div class="statusBadge toDoStatus statusClickArea">
                <div class="statusMarker toDoMarker"></div>
                <span>Pendente</span>
            </div>
            <div class="selectStatusModal selectModalHidden">
                <div class="statusModalHeader">
                    <div class="statusBadge toDoStatus selectedStatus" data-status="toDo">
                        <div class="statusMarker toDoMarker"></div>
                        <span>Pendente</span>
                    </div>
                </div>
                <div class="selectOptionText">Selecione uma opção</div>
                <div class="optionsWrapper">
                    <div class="statusBadgeContainer"><div class="statusBadge toDoStatus" data-status="toDo"><div class="statusMarker toDoMarker"></div><span>Pendente</span></div></div>
                    <div class="statusBadgeContainer"><div class="statusBadge doingStatus" data-status="doing"><div class="statusMarker doingMarker"></div><span>Em andamento</span></div></div>
                    <div class="statusBadgeContainer"><div class="statusBadge doneStatus" data-status="done"><div class="statusMarker doneMarker"></div><span>Concluído</span></div></div>
                </div>
            </div>
        </div>

        <div class="categoryContainer taskClickArea">
            <div class="categoryBadge noCategorySelected"></div>
            <div class="selectCategoryModal selectCategoryHidden">
                <div class="categoryModalHeader">
                    <div class="categoryBadgeHeader">
                        <div class="categoryBadgeHeaderModal noCategorySelected"></div> 
                    </div>
                    <input type="text" class="createNewCategory">
                </div>
                <div class="selectOptionText">Selecione uma opção ou crie uma</div>
                <div class="categoryOptionsWrapper"></div>
            </div>
        </div>

        <div class="priorityContainer">
            <div class="priorityBadge highPriority priorityClickArea">
                <span>Alta</span>
            </div>
            <div class="selectPriorityModal selectModalHidden">
                <div class="priorityModalHeader">
                    <div class="priorityBadge highPriority selectedPriority" data-priority="high">
                        <span>Alta</span>
                    </div>
                </div>
                <div class="selectOptionText">Selecione uma opção</div>
                <div class="priorityOptionsWrapper">
                    <div class="priorityBadgeContainer"><div class="priorityBadge highPriority" data-priority="high"><span>Alta</span></div></div>
                    <div class="priorityBadgeContainer"><div class="priorityBadge mediumPriority" data-priority="medium"><span>Média</span></div></div>
                    <div class="priorityBadgeContainer"><div class="priorityBadge lowPriority" data-priority="low"><span>Baixa</span></div></div>
                </div>
            </div>
        </div> 

        <div class="actionsContainer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </div>
    `; 

    initializeTaskFunctions(taskRow); 
    return taskRow;
}

createTask.addEventListener("click", () => {
    const newTaskElement = createNewTaskRow(); 
    taskContainer.insertAdjacentElement("beforeend", newTaskElement);

    const newTaskInput = newTaskElement.querySelector(".invisibleTaskNameInput");

    if (newTaskInput) {
        newTaskInput.select();
        newTaskInput.focus();
    }
});

/* Criar a tarefa assim que a pagina abrir */

document.addEventListener('DOMContentLoaded', () => {

    const newTaskElement = createNewTaskRow(); 


    if (taskContainer) {
        taskContainer.insertAdjacentElement("beforeend", newTaskElement);
    }

    const newTaskInput = newTaskElement.querySelector(".invisibleTaskNameInput");
    if (newTaskInput) {
        newTaskInput.select();
        newTaskInput.focus();
    }
});

/* Modal de ordenar por */

openOrderModalArea.addEventListener("click", () => {

    event.stopPropagation();
    openOrderModalArea.classList.toggle("orderTasksSelected")
    orderModal.classList.toggle("orderTaskModalHidden")
    
})

/* Fechar modal de ordenar tarefas clicando fora do modal  */
document.addEventListener("click", (event) => {
    const isModalOpen = !orderModal.classList.contains("orderTaskModalHidden")

    if(isModalOpen && !orderModal.contains(event.target) && !openOrderModalArea.contains(event.target)){
        openOrderModalArea.classList.remove("orderTasksSelected")
        orderModal.classList.add("orderTaskModalHidden")
    }
    console.log();
    
})

/* função para checar as boxes das tarefas */

function addCheckEvent (taskElement) {
    const customCheckboxes = taskElement.querySelector('.checkboxCustom'); 
    
    if (customCheckboxes) {
        customCheckboxes.addEventListener('click', () => {
            
            const inputCheckbox = customCheckboxes.previousElementSibling;
            const taskNameInput = customCheckboxes.nextElementSibling;
            const taskName = taskNameInput ? taskNameInput.value.trim() : ''; 

            if (taskName.length > 0) {
                
                if (inputCheckbox && inputCheckbox.type === 'checkbox') {
                    inputCheckbox.checked = !inputCheckbox.checked;
                    inputCheckbox.dispatchEvent(new Event('change'));
                }
            } else {
                showWarningMessage(2000)
            }
        });
    }
}

/* Função para mostrar mensagem de alerta */

const messageModal = document.querySelector(".errorMassage")

function showWarningMessage(duration = 2000) {
    
    messageModal.classList.remove("messageHidden")

    setTimeout(() => {

         messageModal.classList.add("messageHidden")

    }, duration)
}







