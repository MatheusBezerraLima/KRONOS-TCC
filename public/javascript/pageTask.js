
const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const dropDownStatus = document.querySelector(".selectStatusModal")
const statusOptions = document.querySelectorAll(".statusOption")
let selectedStatusValue = document.querySelector(".statusSelected")


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

const selectDate = document.querySelector(".dueDateContainer")
const invisibleDateInput = document.querySelector(".invisibleDateInput")
const dateValue = document.querySelector(".dueDateValue")

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


const statusClickArea = document.getElementById("statusClickArea"); 
const selectedStatus = document.getElementById("selectedStatus"); 
const selectStatusModal = document.querySelector(".selectStatusModal");
const statusOptionContainers = Array.from(document.querySelectorAll(".statusBadgeContainer")); 
const statusOptionsWrapper = document.getElementById('optionsWrapper'); 

let currentStatus = "toDo"; 

const statusMap = {
    toDo: { type: 'status', text: "Pendente", class: "toDoStatus", marker: "toDoMarker", allClasses: ["toDoStatus", "doingStatus", "doneStatus"], allMarkers: ["toDoMarker", "doingMarker", "doneMarker"] },
    doing: { type: 'status', text: "Em andamento", class: "doingStatus", marker: "doingMarker", allClasses: ["toDoStatus", "doingStatus", "doneStatus"], allMarkers: ["toDoMarker", "doingMarker", "doneMarker"] },
    done: { type: 'status', text: "Concluído", class: "doneStatus", marker: "doneMarker", allClasses: ["toDoStatus", "doingStatus", "doneStatus"], allMarkers: ["toDoMarker", "doingMarker", "doneMarker"] }
};


const priorityClickArea = document.getElementById("priorityClickArea"); 
const selectedPriority = document.getElementById("selectedPriority"); 
const selectPriorityModal = document.querySelector(".selectPriorityModal");
const priorityOptionContainers = Array.from(document.querySelectorAll(".priorityBadgeContainer")); 
const priorityOptionsWrapper = document.getElementById('priorityOptionsWrapper'); 

let currentPriority = "high";

const priorityMap = {
    high: { type: 'priority', text: "Alta", class: "highPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] },
    medium: { type: 'priority', text: "Média", class: "mediumPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] },
    low: { type: 'priority', text: "Baixa", class: "lowPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] }
};

/**
 * Alterna a visibilidade de qualquer modal.
 * @param {string} type - 'status' ou 'priority'.
 */
function toggleModal(type) {
    const modal = (type === 'status') ? selectStatusModal : selectPriorityModal;
    if (modal) {
        modal.classList.toggle('selectModalHidden'); // Usamos a mesma classe de esconder
    }
}

/**
 * Atualiza os badges (trigger e header do modal) para qualquer tipo.
 * @param {string} type - 'status' ou 'priority'.
 */
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

/**
 * Reordena as opções para qualquer tipo.
 * @param {string} type - 'status' ou 'priority'.
 */
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

/**
 * Função genérica para anexar listeners de Abertura/Fechamento e Seleção de Opções.
 * @param {string} type - 'status' ou 'priority'.
 */
function setupFieldListeners(type) {
    const clickArea = (type === 'status') ? statusClickArea : priorityClickArea;
    const containers = (type === 'status') ? statusOptionContainers : priorityOptionContainers;
    const dataAttribute = `data-${type}`;

    // 1. Listener de Abertura/Fechamento
    clickArea.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleModal(type);
    });

    // 2. Listener de Seleção de Opção (Anexado ao CONTÊINER para área maior)
    containers.forEach(container => {
        container.addEventListener('click', (event) => {
            event.stopPropagation(); 
            
            const badge = container.querySelector(`[${dataAttribute}]`);
            if (!badge) return; 
            
            const newSelection = badge.getAttribute(dataAttribute);
            
            let current = (type === 'status') ? currentStatus : currentPriority;
            
            // Se o status for diferente, atualiza
            if (newSelection !== current) {
                if (type === 'status') {
                    currentStatus = newSelection;
                } else {
                    currentPriority = newSelection;
                }

                updateBadges(type);
                reorderList(type);
            } 
            
            // Fechamento com delay
            setTimeout(() => toggleModal(type), 0); 
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupFieldListeners('status');
    setupFieldListeners('priority');

    updateBadges('status');
    reorderList('status');
    
    updateBadges('priority');
    reorderList('priority');
});


/* Categoria */

const openCategoryModal = document.querySelector(".categoryContainer")
const selectCategoryModal = document.querySelector(".selectCategoryModal")
const createNewCategoryInput = document.querySelector(".createNewCategory")
const categoryOptionsWrapper = document.getElementById("categoryOptionsWrapper")

function toggleCategoryModal (){
    selectCategoryModal.classList.toggle("selectCategoryHidden")
    createNewCategoryInput.focus()
}

/* CÓDIGO FALTANDO */
document.addEventListener('click', (event) => {
    if (!selectCategoryModal.contains(event.target) && !openCategoryModal.contains(event.target) && !selectCategoryModal.classList.contains('selectCategoryHidden')) {
        selectCategoryModal.classList.add('selectCategoryHidden');
 }
});

openCategoryModal.addEventListener("click", toggleCategoryModal);

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

createNewCategoryInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter"){
        const categoryName = createNewCategoryInput.value.trim()

        if (categoryName === "") return

        const colorPair = getRandomColor()

        addCategoryOption(categoryName, colorPair.bg, colorPair.text)
        selectCategoryOption(categoryName, colorPair.bg, colorPair.text)

        createNewCategoryInput.value = "";
        selectCategoryModal.classList.add("selectCategoryHidden")
    }
})

function addCategoryOption(name, bg, txt) {
    const container = document.createElement("div")
    container.className = "categoryBadgeContainer"

    const badgeDiv = document.createElement("div")
    badgeDiv.className = "categoryBadge"


    badgeDiv.style.backgroundColor = bg;
    badgeDiv.style.color = txt;

    badgeDiv.innerHTML = `${name}`

    badgeDiv.onclick = () => selectCategoryOption(name, bg, txt)

    container.appendChild(badgeDiv)

    categoryOptionsWrapper.appendChild(container)
    
}

// O badge que aparece no container principal (quando o modal está fechado)
const selectedCategoryDisplay = document.querySelector(".categoryBadge"); 

// O badge que aparece no header do modal (quando o modal está aberto)
const categoryBadgeHeader = document.querySelector('.categoryBadgeHeaderModal');

function selectCategoryOption(name, bg, txt) {
    const badgeContent = `${name}`

    if (selectedCategoryDisplay) {
        selectedCategoryDisplay.classList.remove("noCategorySelected")
        selectedCategoryDisplay.style.backgroundColor = bg
        selectedCategoryDisplay.style.color = txt
        selectedCategoryDisplay.innerHTML = badgeContent
    }

    if (categoryBadgeHeader) {
        categoryBadgeHeader.classList.remove('noCategorySelected');
        categoryBadgeHeader.style.backgroundColor = bg;
        categoryBadgeHeader.style.color = txt;
        categoryBadgeHeader.innerHTML = badgeContent; // O mesmo conteúdo

    }
}

/* Nome da tarefa  */

const taskNameInput = document.querySelector(".invisibleTaskNameInput")

taskNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter"){
        const newTaskName = taskNameInput.value.trim()
            console.log(newTaskName);
            taskNameInput.blur()
    }
})

/* Criar tarefa */

function createNewTaskRow () {
    const taskRow = document.createElement("div")
    taskRow.classList.add("task")

    taskRow.innerHTML = `

                            <div class="taskNameContainer">
                                <input type="checkbox" name="" id="">
                                <input type="text" class="invisibleTaskNameInput">
                            </div>

                            <div class="dueDateContainer">
                                <span class="dueDateValue"></span>
                                <input type="text" class="invisibleDateInput" style="display: none;">
                            </div>

                            <div class="statusContainer">
                                <div class="statusBadge toDoStatus" id="statusClickArea">
                                    <div class="statusMarker toDoMarker"></div>
                                    <span>Pendente</span>
                                </div>

                                <div class="selectStatusModal selectModalHidden">
                                    <div class="statusModalHeader" id="currentStatus">
                                        <div class="statusBadge toDoStatus" data-status="toDo" id="selectedStatus">
                                            <div class="statusMarker toDoMarker"></div>
                                                <span>Pendente</span>
                                        </div>
                                    </div>

                                    <div class="selectOptionText">Selecione uma opção</div>

                                    <div id="optionsWrapper">
                                        <div class="statusBadgeContainer">
                                            <div class="statusBadge toDoStatus" data-status="toDo">
                                                    <div class="statusMarker toDoMarker"></div>
                                                    <span>Pendente</span>
                                            </div>
                                        </div>

                                        <div class="statusBadgeContainer">
                                            <div class="statusBadge doingStatus" data-status="doing">
                                                <div class="statusMarker doingMarker"></div>
                                                <span>Em andamento</span>
                                            </div>
                                        </div>

                                        <div class="statusBadgeContainer">
                                            <div class="statusBadge doneStatus" data-status="done">
                                                <div class="statusMarker doneMarker"></div>
                                                <span>Concluído</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="categoryContainer">
                                    <div class="categoryBadge noCategorySelected">

                                    </div>

                               <div class="selectCategoryModal selectCategoryHidden">
                                    <div class="categoryModalHeader" id="currentCategory">
                                       <div class="categoryBadgeHeader">
                                            <div class="categoryBadgeHeaderModal noCategorySelected">

                                            </div>
                                        </div>

                                        <input type="text" class="createNewCategory">
                                    </div>

                                    <div class="selectOptionText">Selecione uma opção ou crie uma</div>

                                    <div id="categoryOptionsWrapper">
                                      
                                    </div>
                                </div>
                            </div>

                            <div class="priorityContainer">
                                 <div class="priorityBadge highPriority" id="priorityClickArea">
                                    <span>Alta</span>
                                </div>

                                <div class="selectPriorityModal selectModalHidden">
                                    <div class="priorityModalHeader" id="currentPriority">
                                        <div class="priorityBadge highPriority" data-priority="high" id="selectedPriority">
                                                <span>Pendente</span>
                                        </div>
                                    </div>
                                    <div class="selectOptionText">Selecione uma opção</div>

                                    <div id="priorityOptionsWrapper">
                                        <div class="priorityBadgeContainer">
                                            <div class="priorityBadge highPriority" data-priority="high">
                                                    <span>Alta</span>
                                            </div>
                                        </div>

                                         <div class="priorityBadgeContainer">
                                            <div class="priorityBadge mediumPriority" data-priority="medium">
                                                    <span>Média</span>
                                            </div>
                                        </div>

                                        <div class="priorityBadgeContainer">
                                            <div class="priorityBadge lowPriority" data-priority="low">
                                                    <span>Baixa</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>  

                            <div class="actionsContainer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                            </div>
    ` 

    // initializeTaskFunctions(taskRow)

    return taskRow;
}

const createTask = document.querySelector(".createTask")
const taskContainer = document.querySelector(".taskList")

createTask.addEventListener("click", () => {
    const newTaskElement = createNewTaskRow()
    taskContainer.prepend(newTaskElement);

    const newTaskInput = newTaskElement.querySelector(".invisibleTaskNameInput")

    if (newTaskInput) {
        newTaskInput.select()
        newTaskInput.focus()
    }
})







