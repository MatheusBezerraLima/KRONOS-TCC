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

// dropDownStatus.addEventListener("click", (event) => {
     
//     dropDownStatus.classList.toggle("statusOpen");
 
//     event.stopPropagation();

//     const turnOffStatusStyle = document.querySelectorAll(".statusBadgeContainer")
//     turnOffStatusStyle.classList.add("turnOffstatusBadgeContainer")

// });

// document.addEventListener('click', (event) => {
//     // Fecha se o clique for fora do dropdown E ele estiver aberto
//     if (!dropDownStatus.contains(event.target) && dropDownStatus.classList.contains('statusOpen')) {
//         dropDownStatus.classList.remove('statusOpen');
//     }    
// });

// // Mudar status

// statusOptions.forEach(option => {
//     option.addEventListener("click", () =>{
//         if (dropDownStatus.classList.contains("statusOpen")) {

//             statusOptions.forEach(opt => opt.classList.remove("statusSelected"));
            
//             option.classList.add("statusSelected");

//             selectedStatusValue = option.getAttribute("data-status");
//         }
//     })
// })


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
