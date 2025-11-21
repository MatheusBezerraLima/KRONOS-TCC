// const { localsName } = require("ejs")

const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const createTask = document.querySelector(".createTask")
const taskContainer = document.querySelector(".taskList")
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


const statusClickArea = document.getElementById("statusClickArea"); 
const selectedStatus = document.getElementById("selectedStatus"); 
const selectStatusModal = document.querySelector(".selectStatusModal");
const statusOptionContainers = Array.from(document.querySelectorAll(".statusBadgeContainer")); 
const optionsWrapper = document.getElementById('optionsWrapper'); 

let currentStatus = "toDo"; 

const statusMap = {
    toDo: { text: "Pendente", class: "toDoStatus", marker: "toDoMarker"},
    doing: { text: "Em andamento", class: "doingStatus", marker: "doingMarker"},
    done: { text: "Concluído", class: "doneStatus", marker: "doneMarker"}
};

function updateMainBadges(){
    const info = statusMap[currentStatus];
    const newClass = info.class;
    const newMarker = info.marker;

    const updateBadge = (badgeElement) => {
        badgeElement.classList.remove("toDoStatus", "doingStatus", "doneStatus");
        badgeElement.classList.add(newClass);

        const spanElement = badgeElement.querySelector("span");
        if (spanElement) { 
            spanElement.textContent = info.text;
        }
        
        const marker = badgeElement.querySelector(".statusMarker");
        if (marker) { 
            marker.classList.remove("toDoMarker", "doingMarker", "doneMarker");
            marker.classList.add(newMarker);
        }
    };

    updateBadge(statusClickArea);
    
    updateBadge(selectedStatus);
    selectedStatus.setAttribute("data-status", currentStatus);
}


function reorderBadgesList(){
    let selectedContainer = null;
    let otherContainers = [];

    statusOptionContainers.forEach(container => {
        const statusBadge = container.querySelector(".statusBadge"); 
        
        if (!statusBadge) return; 
        
        const status = statusBadge.getAttribute("data-status");

        if (status === currentStatus){
            selectedContainer = container;
        } else {
            otherContainers.push(container);
        }
    });

    if (selectedContainer && optionsWrapper){ 
        
        optionsWrapper.innerHTML = ''; 
        
        optionsWrapper.appendChild(selectedContainer);
        
        otherContainers.forEach(container => {
            optionsWrapper.appendChild(container);
        });
    }
}

function toggleModal() {
    selectStatusModal.classList.toggle('selectStatusModalHidden');
}


statusClickArea.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleModal();
});

statusOptionContainers.forEach(container => {
    const statusBadge = container.querySelector('.statusBadge'); 
    
    statusBadge.addEventListener('click', (event) => {
        event.stopPropagation(); 
        
        const newStatus = statusBadge.getAttribute('data-status');
        
        if (newStatus !== currentStatus) {
            currentStatus = newStatus;

            updateMainBadges();
            reorderBadgesList();
        } 
        setTimeout(toggleModal, 0); 
    });
});


document.addEventListener('click', (event) => {
    if (!selectStatusModal.classList.contains('selectStatusModalHidden')) {
        
        const clickedInsideModal = selectStatusModal.contains(event.target);
        const clickedOnTrigger = statusClickArea.contains(event.target);
        
        if (!clickedInsideModal && !clickedOnTrigger) {
            toggleModal();
        }
    }
});



document.addEventListener('DOMContentLoaded', () => {
    updateMainBadges();
    reorderBadgesList();
});
// createTask.addEventListener("click", ()=>{

//     newTask = `
//                      <div class="task editing">
//                             <div class="taskNameContainer">
//                                 <span class="taskName"></p>
//                                     <input type="text" class="writeNewTaskName">
//                             </div>

//                             <div class="dueDateContainer">
//                                 <span class="dueDate"></span>
//                             </div>

//                             <div class="statusContainer">
//                                 <div class="statusBadge toDoStatus">
//                                     <div class="statusMarker toDoMarker"></div>
//                                     <span>Pendente</span>
//                                 </div>
//                             </div>

//                             <div class="categoryContainer">

//                             </div>

//                             <div class="priorityContainer">
                                 
//                             </div>

//                              <div class="actionsContainer">
                                
//                             </div>
//                         </div>
//     `

//     taskContainer.insertAdjacentHTML("beforeend", newTask)

//     const newTaskRow = document.querySelector(".task.editing")

//     const taskInput = document.querySelector(".writeNewTaskName")    

//     taskInput.focus()

// })


