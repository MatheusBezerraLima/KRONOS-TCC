const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const openOrderModalArea = document.querySelector(".orderProjects")
const orderModal = document.querySelector(".orderProjectModal")
const projectNameInput = document.querySelector(".invisibleProjectNameInput")
const openModalProjectDiv = document.querySelector(".addProjectContainer")
const defaultPlaceholderText = 'Novo projeto';
const categoryModal = document.querySelector(".categoryModal");


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

openOrderModalArea.addEventListener("click", () => {

    event.stopPropagation()
    openOrderModalArea.classList.toggle("orderProjectsSelected")
    orderModal.classList.toggle("orderProjectModalHidden")
    
})

document.addEventListener("click", (event) => {
    const isModalOpen = !orderModal.classList.contains("orderProjectModalHidden")

    if(isModalOpen && !orderModal.contains(event.target) && !openOrderModalArea.contains(event.target)){
        openOrderModalArea.classList.remove("orderProjectsSelected")
        orderModal.classList.add("orderProjectModalHidden")
    }
    console.log();
    
})

/* Função de abrir o modal*/

const projectModal = document.querySelector(".createProjectModal")
const filter = document.querySelector(".filter")
const openProjectModal = document.querySelector(".createProject")
const closeModal = document.querySelector(".closeModalIcon")

openProjectModal.addEventListener("click", ()=>{
    filter.classList.remove("hidden")
    projectModal.classList.remove("hidden")
    projectNameInput.focus()
})

closeModal.addEventListener("click", ()=>{
    filter.classList.add("hidden")
    projectModal.classList.add("hidden")
})

filter.addEventListener("click", ()=>{
     filter.classList.add("hidden")
    projectModal.classList.add("hidden")
})

openModalProjectDiv.addEventListener("click", ()=>{
    filter.classList.remove("hidden")
    projectModal.classList.remove("hidden")
    projectNameInput.focus()
})

/* Selecionar data */

const selectDate = document.querySelector(".selectDateContainer")
const invisibleDateInput = document.querySelector(".invisibleDateInput")
const dateValue = document.querySelector(".dateValue")

function brazilDateFormat(dataObj) {
    if (!dataObj) return "Adicionar prazo";

    const options = {day: "numeric", month: "numeric", year: "numeric"};

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

/* Adicionar membro */

const addMemberButton = document.querySelector(".addMemberContainer")
const modalAddMember = document.querySelector(".atribuitionModal")
const closeAtribuitionModal = document.querySelector(".closeAtribuitionModal")
const inputAddMember = document.querySelector(".inviteMemberInput")


addMemberButton.addEventListener("click", ()=>{
    modalAddMember.classList.remove("hidden")
})

closeAtribuitionModal.addEventListener("click", () =>{
    modalAddMember.classList.add("hidden")
})

document.addEventListener("click", (event) => {
    const isModalOpen = !modalAddMember.classList.contains("hidden")

    if(isModalOpen && !modalAddMember.contains(event.target) && !addMemberButton.contains(event.target)){
        modalAddMember.classList.add("hidden")
    }
    console.log();
})

/* Categoria */

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

function addCategoryOption(name, bg, txt) {
    const container = document.createElement("div");
    container.className = "categoryBadge";

    const badgeDiv = document.createElement("div");
    badgeDiv.className = "projectCategoryBadgeModal";

    const spanName = document.createElement("span");
    spanName.className = "categoryNameText";
    spanName.textContent = name; 

    badgeDiv.style.backgroundColor = bg;
    badgeDiv.style.color = txt;

    badgeDiv.appendChild(spanName);

    badgeDiv.onclick = () => selectCategoryOption(name, bg, txt);

    container.appendChild(badgeDiv);

    const categoryOptionsWrapper = document.querySelector(".categoryOptionsWrapper");

    if (categoryOptionsWrapper) {
        categoryOptionsWrapper.appendChild(container);
    }
}

const selectedCategoryDisplay = document.querySelector(".projectCategoryBadgeModal"); 
const categoryBadgeHeader = document.querySelector('.categoryBadgeHeaderModal');

function selectCategoryOption( name, bg, txt) {

    const mainBadge = document.querySelector(".projectCategoryBadgeModal");     
    const modalBadge = document.querySelector('.categoryBadgeHeaderModal');
    const projectBadge = document.querySelector(".projectCategoryBadge")


    const updateBadgeElement = (badgeElement) => {
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

    updateBadgeElement(mainBadge);     
    updateBadgeElement(modalBadge); 
    updateBadgeElement(projectBadge); 
}

 selectedCategoryDisplay.addEventListener('click', () => {
        const modal = document.querySelector(".categoryModal");
        const input = document.querySelector(".createNewCategory");

        if (modal) {
            modal.classList.toggle("hidden");
            if (!modal.classList.contains('hidden') && input) {
                 input.focus();
            }
        }
    });

    const createNewCategoryInput = document.querySelector(".createNewCategory");


    createNewCategoryInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter"){
            const categoryName = createNewCategoryInput.value.trim();

            if (categoryName === "") return;

            const colorPair = getRandomColor();

            addCategoryOption(categoryName, colorPair.bg, colorPair.text);
            selectCategoryOption(categoryName, colorPair.bg, colorPair.text);

            createNewCategoryInput.value = "";
            categoryModal.classList.add("hidden");
        }
    });

const categoryOptionsWrapper = document.querySelector(".categoryOptionsWrapper");

    categoryOptionsWrapper.addEventListener('click', (event) => {
        const badge = event.target.closest('.categoryBadgeModal');
        if (badge && !badge.closest('.categoryModalHeader')) {
            const name = badge.textContent.trim();
            const bg = badge.style.backgroundColor;
            const txt = badge.style.color;
            
            selectCategoryOption(name, bg, txt);
            categoryModal.classList.add("hidden");
        }
    });

    const projectBadge = document.querySelector(".projectCategoryBadge")

    projectNameInput.style.display = 'block'; 
    
    projectNameInput.addEventListener('click', () => {
        
        if (projectNameInput.textContent.trim() === defaultPlaceholderText) {
            projectNameInput.value = ''; 
        } else {
            projectNameInput.value = projectNameInput.textContent.trim();
        }
    });

    projectNameInput.addEventListener('blur', () => {
        const newProjectName = projectNameInput.value.trim();
        if (newProjectName === '') {
            projectNameInput.textContent = defaultPlaceholderText; 
        } else {
            projectNameInput.textContent = newProjectName;
        }
    });

    projectNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            projectNameInput.blur();

        }
    });

    function initializeProjectFunctions(){
        dataUpdate()
    }

/* Criar/listar projeto */

function createNewProject(name, categoryName, categoryBg, categoryTxt, dueDateText) {
    const newProject = document.createElement("div");
    newProject.classList.add("project");

    const fullProjectName = name;
    const fullCategoryName = categoryName;

    newProject.innerHTML = `
        <div class="projectTop">
            <strong class="projectTitle">${fullProjectName}</strong>
            <div class="projectCategoryBadge" style="background-color: ${categoryBg}; color: ${categoryTxt};">
                 <span class="categoryNameText">${fullCategoryName}</span>
            </div>
        </div>

        <div class="progressBarContainer">
            <div class="progressBar"></div>
            <div class="dueDateContainer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-clock-icon lucide-calendar-clock"><path d="M16 14v2.2l1.6 1"/><path d="M16 2v4"/><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M3 10h5"/><path d="M8 2v4"/><circle cx="16" cy="16" r="6"/></svg>
                <p>Prazo: <span class="dueDateProjectSubtitle">${dueDateText}</span></p>
            </div> 
        </div>

           <div class="projectBottom">   
                <p class="shareWithText">Compartilhado com</p>                     
                <div class="projectMembers">
                    <div class="member" style="background-color: aqua;"></div>
                    <div class="member" style="background-color: bisque;"></div>
                    <div class="member" style="background-color: bisque;"></div>

                    <div class="membersQuantity" style="background-color: gray;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        <p class="quantityNumber">6</p>
                    </div>
                </div>
            </div>
    `;
    return newProject;
}

const createProjectButton = document.querySelector(".createProjectButton")
const projectList = document.querySelector(".projectList")
const selectedCategoryBadge = document.querySelector(".projectCategoryBadgeModal");

createProjectButton.addEventListener("click", () => {

    const projectName = projectNameInput.value.trim() || defaultPlaceholderText;

    const categoryNameElement = selectedCategoryBadge.querySelector(".categoryNameText");

    const categoryName = categoryNameElement ? categoryNameElement.textContent : 'Geral';
    const categoryBg = selectedCategoryBadge.style.backgroundColor || '#ECEFF1'; // Cor padrão
    const categoryTxt = selectedCategoryBadge.style.color || '#455A64'; // Cor padrão

    const formattedDueDate = dateValue.textContent; 

    const newProject = createNewProject(projectName, categoryName, categoryBg, categoryTxt, formattedDueDate,);

    projectList.appendChild(newProject);
    projectModal.classList.add("hidden");
    filter.classList.add("hidden");

    /* Limpar o modal depois da criação do projeto */

    projectNameInput.value = "";     
    invisibleDateInput._flatpickr.clear(); 
    dateValue.textContent = "Adicionar prazo"; 
    dateValue.classList.remove("withValue");
    dateValue.classList.add("placeholder");

    /* Falta resetar as badges, voce faz ;) */

});




