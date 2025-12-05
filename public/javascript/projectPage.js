const API_BASE_URL = '/api';
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
const currentUserId = localStorage.getItem('userId'); 
const inputPesquisa = document.getElementById('inputPesquisaUsuario');
const inputFiltro = document.getElementById('inputFiltroAmigo');
const listaResultados = document.getElementById('listaResultados');
const containerLista = document.getElementById('containerListaAmigos');
const areaAdicionados = document.getElementById('areaMembrosAdicionados');
let debounceTimer;

let todosAmigos = [];    // Armazena a lista vinda do banco
let selecionadosIDs = [];

inputPesquisa.addEventListener('input', function(e) {
    const termo = e.target.value;

    // 1. Limpa o timer anterior (se o usuário digitar rápido)
    clearTimeout(debounceTimer);

    // 2. Esconde a lista se o campo estiver vazio
    if (termo.length === 0) {
        listaResultados.classList.add('hidden');
        return;
    }

    // 3. Cria um novo timer de 500ms (Meio segundo)
    debounceTimer = setTimeout(async () => {
        try {
            // Faz a requisição ao seu Backend
            const response = await fetch(`/users/search?termo=${termo}`);
            const usuarios = await response.json();
            
            renderizarResultados(usuarios);
        } catch (error) {
            console.error('Erro na pesquisa:', error);
        }
    }, 500); // Só executa 500ms depois que parar de digitar
});

function renderizarResultados(usuarios) {
    const listaResultados = document.getElementById('listaResultados'); // Garanta que pegou o elemento
    const inputPesquisa = document.getElementById('inputPesquisaUsuario'); // Seu input

    // 1. Limpa resultados anteriores
    listaResultados.innerHTML = '';

    // 2. Se não vier nada ou array vazio, esconde
    if (!usuarios || usuarios.length === 0) {
        listaResultados.classList.add('hidden');
        return;
    }

    // 3. Cria os elementos da lista
    usuarios.forEach(usuario => {
        const div = document.createElement('div');
        div.classList.add('result-item');

        // Tratamento de erro: Se o profile for null ou a foto for null, usa uma padrão
        // A API ui-avatars já faz um fallback legal, mas é bom garantir
        const avatarUrl = usuario.profile?.foto_perfil 
            || `https://ui-avatars.com/api/?name=${usuario.nome}&background=random`;

        // Monta o HTML interno (Foto + Nome na esquerda, Botão na direita)
        div.innerHTML = `
            <div class="user-info">
                <img src="${avatarUrl}" alt="${usuario.nome}" class="user-avatar">
                <div class="user-details">
                    <span class="font-bold">${usuario.nome}</span>
                    <br>
                    <span style="font-size: 10px; color: #666;">${usuario.email}</span>
                </div>
            </div>
            <button class="btn-add-user" data-id="${usuario.id}">Adicionar</button>
        `;

        const btnAdd = div.querySelector('.btn-add-user');

        btnAdd.addEventListener('click', async (e) => {
            e.stopPropagation(); // Não fecha o menu ao clicar
            
            // 1. Feedback visual imediato (UX)
            btnAdd.textContent = "Enviando...";
            btnAdd.disabled = true; // Evita cliques duplos

            try {
                // 2. Chama a função que faz o FETCH
                await enviarSolicitacaoAmizade(usuario.id, btnAdd);
                
            } catch (error) {
                console.error("Erro ao enviar:", error);
                // Reverte em caso de erro
                btnAdd.textContent = "Erro";
                setTimeout(() => {
                    btnAdd.textContent = "Adicionar";
                    btnAdd.disabled = false;
                }, 2000);
            }
        });

        listaResultados.appendChild(div);
    });

    listaResultados.classList.remove('hidden');
}

// --- FUNÇÃO SEPARADA PARA ORGANIZAR O FETCH ---
async function enviarSolicitacaoAmizade(targetId, btnElement) {
    const response = await fetch(`${API_BASE_URL}/friendships/`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            addressee_id: targetId // O ID que você pediu no body
        })
    });

    if (!response.ok) {
        throw new Error('Falha na requisição');
    }

    // 3. Sucesso: Atualiza o botão permanentemente
    btnElement.textContent = "Enviado ✔";
    btnElement.classList.add('enviado'); // Fica verde pelo CSS
    // Opcional: Se quiser esconder a lista após o sucesso, descomente abaixo:
    // document.getElementById('listaResultados').classList.add('hidden');
}


// Fechar a lista se clicar fora dela
document.addEventListener('click', (e) => {
    if (!inputPesquisa.contains(e.target) && !listaResultados.contains(e.target)) {
        listaResultados.classList.add('hidden');
    }
});

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

function addCategoryOption(name, bg, txt, categoryId) {
    const newCategoyContainer = document.createElement('div');
    newCategoyContainer.classList.add("categoryBadgeContainer");
    newCategoyContainer.setAttribute("data-category", categoryId); 

    const newCategoybadge = document.createElement("div");
    newCategoybadge.classList.add("categoryBadge");
    newCategoybadge.setAttribute("data-category", categoryId); 

    const projectCategoryBadgeModal = document.createElement('div');
    projectCategoryBadgeModal.classList.add("projectCategoryBadgeModal");
    projectCategoryBadgeModal.setAttribute("data-category", categoryId); 
    projectCategoryBadgeModal.style.backgroundColor = `${bg}`
    projectCategoryBadgeModal.style.color = `${txt}`



    const span = document.createElement('span');
    span.classList.add("categoryNameText");
    span.innerHTML = `${name}`
    
    projectCategoryBadgeModal.appendChild(span)
    newCategoybadge.appendChild(projectCategoryBadgeModal);
    newCategoyContainer.appendChild(newCategoybadge);
    newCategoyContainer.insertAdjacentElement("beforeend", newCategoybadge);


    categoryOptionsWrapper.appendChild(newCategoyContainer)
}

const selectedCategoryDisplay = document.querySelector(".projectCategoryBadgeModal"); 
const categoryBadgeHeader = document.querySelector('.categoryBadgeHeaderModal');

function selectCategoryOption( name, bg, txt, categoryId) {
    const modal = document.querySelector('.categoryModal');
    const mainBadge = document.querySelector(".projectCategoryBadgeModal");   
    const modalBadge = document.querySelector('.categoryBadgeHeaderModal');
    const projectBadge = document.querySelector(".projectCategoryBadge")

    mainBadge.setAttribute('data-category', categoryId)
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

    modal.classList.add('hidden')
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


    createNewCategoryInput.addEventListener("keyup", async(event) => {
        if (event.key === "Enter"){
            const categoryName = createNewCategoryInput.value.trim();

            if (categoryName === "") return;

            const colorPair = getRandomColor();

            const createdCategory = await requestCreateCategory({nome: categoryName, cor_fundo: colorPair.bg, cor_texto: colorPair.text});

            addCategoryOption(createdCategory.nome, createdCategory.cor_fundo, createdCategory.cor_texto, createdCategory.id);

            selectCategoryOption(createdCategory.nome, createdCategory.cor_fundo, createdCategory.cor_texto, createdCategory.id);

            createNewCategoryInput.value = "";
            categoryModal.classList.add("hidden");

            

            console.log("Categoria Criada:", createdCategory);

        }
    });

const categoryOptionsWrapper = document.querySelector(".categoryOptionsWrapper");

    categoryOptionsWrapper.addEventListener('click', (event) => {
        const badge = event.target.closest('.categoryBadgeModal');
        if (badge && !badge.closest('.categoryModalHeader')) {
            const name = badge.textContent.trim();
            const bg = badge.style.backgroundColor;
            const txt = badge.style.color;
            const categoryId = badge.getAttribute('data-category');
            
            selectCategoryOption(name, bg, txt, categoryId);
            categoryModal.classList.add("hidden");             // ------------------ 
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

function createNewProject(name, categoryName, categoryBg, categoryTxt, dueDateText, projectId, projectProgress, totalTasks) {
    const newProject = document.createElement("div");
    newProject.classList.add("project");
    newProject.setAttribute('data-project-id', projectId);

    // 1. Lógica de Cor (Verde se completou, senão Azul padrão ou a cor da sua variável --blue)
    const progressColor = projectProgress >= 100 ? '#119500' : '#000080'; 
    
    // 2. Garante que não quebre se vier null/undefined
    const safeProgress = projectProgress || 0;
    const safeTotal = totalTasks || 0;

    newProject.innerHTML = `
        <div class="projectTop">
            <strong class="projectTitle">${name}</strong>
            <div class="projectCategoryBadge" style="background-color: ${categoryBg}; color: ${categoryTxt};">
                 <span class="categoryNameText">${categoryName}</span>
            </div>
        </div>

        <div class="progressBarContainer" style="display: flex; flex-direction: column; gap: 5px;">
            
            <!-- Texto Informativo (Opcional, mas bom para UX) -->
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; font-weight: 500;">
                <span>Progresso</span>
                <span>${safeProgress}% (${safeTotal} tasks)</span>
            </div>

            <!-- TRILHO DA BARRA (Fundo Cinza) -->
            <div style="width: 100%; background-color: #e5e7eb; border-radius: 10px; height: 8px; overflow: hidden;">
                <!-- A BARRA (Preenchimento Dinâmico) -->
                <div class="progressBar" 
                     style="width: ${safeProgress}%; background-color: ${progressColor}; height: 100%; border-radius: 10px; transition: width 0.5s ease;">
                </div>
            </div>

            <div class="dueDateContainer" style="margin-top: 8px;">
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


createProjectButton.addEventListener("click", async() => {

    const selectedCategoryBadge = document.querySelector(".projectCategoryBadgeModal");
    const dateCurrentValue = document.querySelector(".dateValue")

    const projectName = projectNameInput.value.trim() || defaultPlaceholderText;

    const categoryNameElement = selectedCategoryBadge.querySelector(".categoryNameText");
    const categoryId = selectedCategoryBadge.getAttribute("data-category");
    console.log(selectedCategoryBadge);
    
    

    const categoryName = categoryNameElement ? categoryNameElement.textContent : 'Geral';

    const categoryBg = selectedCategoryBadge.style.backgroundColor || '#ECEFF1'; // Cor padrão
    const categoryTxt = selectedCategoryBadge.style.color || '#455A64'; // Cor padrão

  const formattedDueDate = dateCurrentValue.textContent; // Exemplo: "10/12/2012"

// 1. Divide a string nos separadores (assumindo "/")
const parts = formattedDueDate.split('/'); 

// Verifica se a string foi dividida corretamente e tem 3 partes
if (parts.length === 3) {
    // 2. Extrai as partes. Elas estarão como strings.
    const day = parseInt(parts[0], 10);   // Ex: 10
    const month = parseInt(parts[1], 10); // Ex: 12 (Dezembro)
    const year = parseInt(parts[2], 10);  // Ex: 2012
    
    // 3. Cria o objeto Date usando os componentes numéricos.
    // O mês é `month - 1` porque é baseado em ZERO.
    const dateObject = new Date(year, month - 1, day);

    // --- CONTINUAÇÃO DO SEU CÓDIGO ---

    // Verifica se o objeto Date é válido antes de prosseguir
    if (!isNaN(dateObject)) {
        // 4. Formata a data para o padrão YYYY-MM-DD para o servidor
        const finalYear = dateObject.getFullYear();        
        // O método getMonth() retorna o mês baseado em zero. Adicionamos +1 para o valor real (1 a 12).
        const finalMonth = String(dateObject.getMonth() + 1).padStart(2, '0');
        const finalDay = String(dateObject.getDate()).padStart(2, '0');
        
        // Formato final YYYY-MM-DD
        const dateToSend = `${finalYear}-${finalMonth}-${finalDay}`;
        
        const newProjectDB = await requestCreateProject({projectName, categoryId, dateToSend});

        console.log("Projeto criado:", newProjectDB);

         const newProject = createNewProject(newProjectDB.titulo, newProjectDB.categoryTask.nome, newProjectDB.categoryTask.cor_fundo, newProjectDB.categoryTask.cor_texto, formattedDueDate, newProjectDB.id);

        projectList.appendChild(newProject);

        newProject.addEventListener('click', (event) => {
            const project = event.target.closest('.project');

            // Segurança: garante que achou o projeto antes de tentar pegar o ID
            if (project) {
                const projectId = project.getAttribute('data-project-id');
                console.log("ID encontrado:", projectId);
                
                window.location.href = `/projetos/${projectId}`;
            }
        })

        projectModal.classList.add("hidden");
        filter.classList.add("hidden");

        /* Limpar o modal depois da criação do projeto */

        projectNameInput.value = "";     
        invisibleDateInput._flatpickr.clear(); 
        dateValue.textContent = "Adicionar prazo"; 
        dateValue.classList.remove("withValue");
        dateValue.classList.add("placeholder");

        salvarMembrosNoProjeto(newProjectDB.id)
    } else {
        console.error("Data inválida após a criação do objeto Date:", formattedDueDate);
    }

    } else {
    console.error("Formato de data inesperado:", formattedDueDate);
}

});

async function salvarMembrosNoProjeto(projectId) {
    const listUsersAddProject = document.querySelectorAll('.adicionado');

    if(!listUsersAddProject || listUsersAddProject.length <= 0) return null;
    
    const requests = Array.from(listUsersAddProject).map(async (userDiv) => {
        
    const userId = userDiv.getAttribute('data-user-id');
    console.log(userId);
    
    
    if (!userId) return null;

        const bodyData = {
            userIdToAdd: parseInt(userId), 
            role: "Membro"
        };

        try {
            const response = await fetch(`${API_BASE_URL}/projetos/${projectId}/membros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) throw new Error(`Erro ao adicionar user ${userId}`);


            userDiv.classList.remove('.adicionado')
            return await response.json(); 
        } catch (error) {
            console.error(error);
            return null;
        }
    });

    try {
        console.log("Enviando convites...");
        const resultados = await Promise.all(requests);
        
        console.log("Processo finalizado!", resultados);
        alert("Membros adicionados com sucesso!");
    } catch (error) {
        console.error("Erro geral:", error);
    }
}



function formatDateForDisplay(dateString) {
    if (!dateString) return "Nenhuma data definida";
    
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return "Data inválida";
    
    // Opção 1: Usar toLocaleDateString (Mais simples e robusto)
    // O 'pt-BR' garante o formato dia/mês/ano
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    });
}

document.addEventListener('DOMContentLoaded', async() => {
    const categoryOptionsWrapper = document.querySelector(".categoryOptionsWrapper");

    const categories = await requestCategoriesForUser();
    const projects = await requestListProjects();
    console.log(projects);
    
    for(const project of projects){
        const dateValue = formatDateForDisplay(project.data_termino)

        const newProject = createNewProject(project.titulo, project.categoryTask.nome, project.categoryTask.cor_fundo, project.categoryTask.cor_texto, dateValue, project.id, project.progress, project.total_tasks);

        projectList.appendChild(newProject);

        newProject.addEventListener('click', (event) => {
            const project = event.target.closest('.project');

            // Segurança: garante que achou o projeto antes de tentar pegar o ID
            if (project) {
                const projectId = project.getAttribute('data-project-id');
                console.log("ID encontrado:", projectId);
                
                window.location.href = `/projetos/${projectId}`;
            }
        })
    }

    for (const category of categories){
        const newCategoyContainer = document.createElement('div');
        newCategoyContainer.classList.add("categoryBadgeContainer");
        newCategoyContainer.setAttribute("data-category", category.id); 

        const newCategoybadge = document.createElement("div");
        newCategoybadge.classList.add("categoryBadge");
        newCategoybadge.setAttribute("data-category", category.id); 

        const projectCategoryBadgeModal = document.createElement('div');
        projectCategoryBadgeModal.classList.add("projectCategoryBadgeModal");
        projectCategoryBadgeModal.setAttribute("data-category", category.id); 
        projectCategoryBadgeModal.style.backgroundColor = `${category.cor_fundo}`
        projectCategoryBadgeModal.style.color = `${category.cor_texto}`



        const span = document.createElement('span');
        span.classList.add("categoryNameText");
        span.innerHTML = `${category.nome}`
        
        projectCategoryBadgeModal.appendChild(span)
        newCategoybadge.appendChild(projectCategoryBadgeModal);
        newCategoyContainer.appendChild(newCategoybadge);
        newCategoyContainer.insertAdjacentElement("beforeend", newCategoybadge);

        projectCategoryBadgeModal.onclick = () => selectCategoryOption(category.nome, category.cor_fundo, category.cor_texto, category.id);

        categoryOptionsWrapper.appendChild(newCategoyContainer)
    }

    carregarListaInicial();
});

async function carregarListaInicial() {
    try {
        const response = await fetch('http://localhost:3333/api/friendships/');
        const data = await response.json();
        
        // Separa os dados corretos dos amigos
        todosAmigos = data
        
        renderizarLista(data);

    } catch (error) {
        containerLista.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar</p>';
    }
}

function renderizarLista(lista) {
    containerLista.innerHTML = '';

    if (lista.length === 0) {
        containerLista.innerHTML = '<p style="padding:10px; text-align:center; color:#999;">Nenhum amigo encontrado.</p>';
        return;
    }

    lista.forEach(amigo => {
        // Verifica se já foi adicionado para mudar o estilo
        const jaAdicionado = selecionadosIDs.includes(amigo.id);
        
        const divRow = document.createElement('div');
        divRow.classList.add('item-amigo-row');
        divRow.setAttribute('data-user-id', amigo.id)
        if (jaAdicionado) divRow.classList.add('adicionado'); // Fica cinza se já adicionou

        const foto = amigo.profile?.foto_perfil || `https://ui-avatars.com/api/?name=${amigo.nome}&background=random`;

        divRow.innerHTML = `
            <div class="info-amigo">
                <div class="foto-p" style="background-image: url('${foto}');"></div>
                <span class="nome-p">${amigo.nome}</span>
            </div>
            
            <button class="btn-add-amigo" title="${jaAdicionado ? 'Já adicionado' : 'Adicionar ao projeto'}">
                ${jaAdicionado ? '✓' : '+'}
            </button>
        `;

        // Evento de clique no botão +
        if (!jaAdicionado) {
            divRow.querySelector('.btn-add-amigo').addEventListener('click', () => {
                adicionarAoProjeto(amigo);
            });
        }

        containerLista.appendChild(divRow);
    });
}

inputFiltro.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    
    const filtrados = todosAmigos.filter(amigo => 
        amigo.nome.toLowerCase().includes(termo)
    );
    
    renderizarLista(filtrados);
});

const inputBusca = document.getElementById('inputBuscaMembro');
const divSugestoes = document.getElementById('sugestoesMembros');

function adicionarAoProjeto(amigo) {
    console.log(amigo);
    
    console.log(amigo);
    
    selecionadosIDs.push(amigo.id);

    // Cria o elemento visual na área "Membros Adicionados"
    const divMember = document.createElement('div');
    divMember.classList.add('invitedMember'); // Sua classe original
    divMember.id = `membro-projeto-${amigo.id}`;

    const foto = amigo.profile?.foto_perfil || `https://ui-avatars.com/api/?name=${amigo.nome}&background=random`;

    divMember.innerHTML = `
        <div class="memberProfilePhoto" style="background-image: url('${foto}');"></div>
        <span class="memberName">${amigo.nome}</span>
        <span style="margin-left:auto; color:red; cursor:pointer; font-weight:bold;" onclick="removerDoProjeto(${amigo.id})">×</span>
    `;

    areaAdicionados.appendChild(divMember);

    // Re-renderiza a lista de cima para bloquear esse amigo (marcar como adicionado)
    renderizarLista(todosAmigos.filter(a => a.nome.toLowerCase().includes(inputFiltro.value.toLowerCase())));
}

// 5. Remover do Projeto
function removerDoProjeto(id) {
    selecionadosIDs = selecionadosIDs.filter(uid => uid !== id);
    document.getElementById(`membro-projeto-${id}`).remove();
    
    // Libera o amigo na lista de cima novamente
    renderizarLista(todosAmigos.filter(a => a.nome.toLowerCase().includes(inputFiltro.value.toLowerCase())));
}



async function requestCategoriesForUser(){
    try{
        const response = await fetch(`${API_BASE_URL}/categories/tasks`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao listar categorias do usuario');
        }

        const categories = await response.json();

        return categories;
    }catch(error){
        console.error("Falha ao buscar categorias na api:", error);
        alert("Não buscar categorias na api: " + error.message);
        return;
    }
}


async function requestCreateCategory(dataCategory){
    try{
        const response = await fetch(`${API_BASE_URL}/category/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataCategory)
        }); 

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar a categoria.');
        }

        const newCategory = await response.json();
        
        return newCategory;

    }catch(error){
        console.error("Falha ao chamar api para criar tarefa:", error);
        alert("Não foi possível chamar api para criar a tarefa: " + error.message);
        return;
    }
}

async function requestCreateProject(dataProject){

    const dataProjectJson = {
        titulo: dataProject.projectName,
        dataTermino: dataProject.dateToSend,
        categoria: dataProject.categoryId
    }

    try{
        const response = await fetch(`${API_BASE_URL}/projetos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataProjectJson)
        }); 

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar a tarefa.');
        }

        const newProject = await response.json();
        
        return newProject;
    }catch(error){
        console.error("Falha ao chamar api para criar tarefa:", error);
        alert("Não foi possível chamar api para criar a tarefa: " + error.message);
        return;
    }
    
}
async function requestListProjects(dataProject){
    try{
        const response = await fetch(`${API_BASE_URL}/projetos`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }); 

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar a tarefa.');
        }

        const projects = await response.json();
        
        return projects;
    }catch(error){
        console.error("Falha ao chamar api para listar projetos :", error);
        alert("Não foi possível chamar api para listar projetos: " + error.message);
        return;
    }
    
}


document.addEventListener('DOMContentLoaded', function() {

        const optionSectionProject = document.querySelector("#optionSectionProject");
        const optionSectionTask = document.querySelector("#optionSectionTask");
        const optionSectionHome = document.querySelector("#optionSectionHome");


        optionSectionProject.addEventListener('click', () => {
            window.location.href = '/projetos'
        })

        optionSectionTask.addEventListener('click', () => {
            window.location.href = '/tasks'
        })

        optionSectionHome.addEventListener('click', () => {
             window.location.href = '/'
        })

        // --- Lógica de Abrir/Fechar o Drawer ---
        const openBtn = document.getElementById('openFriendsSidebarBtn');
        const closeBtn = document.getElementById('closeFriendsSidebarBtn');
        const overlay = document.getElementById('sidebarOverlay');
        const body = document.body;

        function toggleSidebar(open) {
            if (open) {
                body.classList.add('sidebar-open');
            } else {
                body.classList.remove('sidebar-open');
            }
        }

        // Abrir ao clicar no ícone do header
        if(openBtn) openBtn.addEventListener('click', () => toggleSidebar(true));
        
        // Fechar ao clicar no X
        if(closeBtn) closeBtn.addEventListener('click', () => toggleSidebar(false));
        
        // Fechar ao clicar no fundo escuro (overlay)
        if(overlay) overlay.addEventListener('click', () => toggleSidebar(false));


        // --- Lógica das Abas ---
        const tabBtns = document.querySelectorAll('.drawer-tabs .tab-btn');
        const tabPanes = document.querySelectorAll('.drawer-content .tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Remove 'active' de todos os botões e painéis
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                // 2. Adiciona 'active' no botão clicado
                btn.classList.add('active');

                // 3. Mostra o painel correspondente ao data-target do botão
                const targetPaneId = btn.getAttribute('data-target');
                document.getElementById(targetPaneId).classList.add('active');
            });
        });
});



async function carregarListaAmigos() {
    const listaElement = document.getElementById('lista-amigos');
    
    try {
        // 1. Busca os dados da API
        const response = await fetch(`${API_BASE_URL}/friendships`);
        
        if (!response.ok) throw new Error('Erro ao buscar amizades');
        
        const amizades = await response.json();

        // Limpa a lista (remove o "Carregando...")
        listaElement.innerHTML = '';

        if (amizades.length === 0) {
            listaElement.innerHTML = '<li style="padding:20px; text-align:center; color:#999;">Você ainda não tem amigos adicionados.</li>';
            return;
        }

        // 2. Itera sobre cada amizade
        amizades.forEach(amizade => {
            // LÓGICA: Descobrir quem é o amigo e quem sou eu
           

            // Tratamento de segurança para foto (caso venha null)
            const foto = amizade.profile?.foto_perfil || `https://ui-avatars.com/api/?name=${amizade.nome}&background=random`;
            
            // Simulação de Status (Já que o banco não retorna online/offline ainda)
            // Futuramente você pode conectar isso a um WebSocket
            const isOnline = Math.random() > 0.5; // Random só pra visualização agora
            const statusClass = isOnline ? 'status-online' : 'status-offline';
            const statusText = isOnline ? 'Online' : 'Offline';

            // 3. Cria o HTML do Item
            const li = document.createElement('li');
            li.classList.add('friend-item');
            
            // Adiciona ID da amizade para facilitar chat ou remoção futura
            li.dataset.friendshipId = amizade.id;
            li.dataset.friendId = amizade.id;

            li.innerHTML = `
                <div class="friend-avatar-container ${statusClass}">
                    <img src="${foto}" alt="${amizade.nome}" class="friend-avatar">
                </div>
                <div class="friend-info">
                    <span class="friend-name">${amizade.nome}</span>
                    <span class="friend-status-text">${statusText}</span>
                </div>
                <button class="btn-more-options" style="background:none; border:none; color:#ccc; cursor:pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
            `;

            // Clique no amigo (Ex: para abrir chat)
            li.addEventListener('click', () => {
                console.log(`Abrir chat com ${amizade.nome} (ID: ${amizade.id})`);
                // window.location.href = `/chat/${amigoData.id}`;
            });

            listaElement.appendChild(li);
        });

        // Atualiza o contador na aba (se houver contador de amigos)
        // document.querySelector('.tab-count-friends').textContent = `(${amizades.length})`;

    } catch (error) {
        console.error(error);
        listaElement.innerHTML = '<li style="color:red; padding:20px; text-align:center;">Erro ao carregar amigos.</li>';
    }
}

// Chamar a função quando o botão do menu for clicado (para economizar dados)
document.getElementById('openFriendsSidebarBtn').addEventListener('click', () => {
    carregarListaAmigos();
});




async function carregarSolicitacoes() {
    const listaElement = document.getElementById('lista-recebidas');
    const contadorElement = document.querySelector('.tab-count');  
    const titleElement = document.querySelector('.request-section-title');  
    
    try {
        // 1. Busca os dados da rota que você passou
        const response = await fetch(`${API_BASE_URL}/friendships/received`);
        
        if (!response.ok) throw new Error('Erro ao buscar solicitações');
        
        const solicitacoes = await response.json();

        // 2. Atualiza o contador na aba
        if(contadorElement) contadorElement.textContent = `(${solicitacoes.length})`;
        if(contadorElement) titleElement.textContent = `Recebidas (${solicitacoes.length})`;


        // Limpa a lista
        listaElement.innerHTML = '';

        if (solicitacoes.length === 0) {
            listaElement.innerHTML = '<li style="padding:20px; text-align:center; color:#999; font-size: 0.9rem;">Nenhuma solicitação pendente.</li>';
            return;
        }

        // 3. Renderiza cada solicitação
        solicitacoes.forEach(req => {
            // Como é /received, mostramos os dados do REQUESTER (quem pediu)
            const pessoa = req.Requester;
            console.log(pessoa);
            
            
            // Tratamento da foto
            const foto = pessoa.profile?.foto_perfil || `https://ui-avatars.com/api/?name=${pessoa.nome}&background=random`;

            const li = document.createElement('li');
            li.classList.add('friend-item', 'request-item'); // Classes de estilo que definimos antes
            li.id = `request-${pessoa.id}`; // ID único para remover da tela ao aceitar

            li.innerHTML = `
                <div class="friend-avatar-container">
                    <img src="${foto}" alt="${pessoa.nome}" class="friend-avatar">
                </div>
                <div class="friend-info">
                    <span class="friend-name">${pessoa.nome}</span>
                    <div class="request-actions">
                        <button class="btn-request btn-accept" onclick="responderSolicitacao('${pessoa.id}', 'accepted', '${req.id}')">Aceitar</button>
                        
                        <button class="btn-request btn-reject" onclick="responderSolicitacao('${pessoa.id}', 'rejected', '${req.id}')">Recusar</button>
                    </div>
                </div>
            `;

            listaElement.appendChild(li);
        });

    } catch (error) {
        console.error(error);
        listaElement.innerHTML = '<li style="color:red; text-align:center; padding:10px;">Erro ao carregar.</li>';
    }
}

// --- FUNÇÃO PARA ACEITAR OU RECUSAR ---
async function responderSolicitacao(requesterId, novoStatus, friendshipId) {

    console.log(requesterId);
    
    
    // Feedback visual imediato: Desabilita os botões para não clicar 2x
    const itemLi = document.getElementById(`request-${requesterId}`);
    const botoes = itemLi.querySelectorAll('button');
    botoes.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = 0.5;
        if(btn.classList.contains(novoStatus === 'accepted' ? 'btn-accept' : 'btn-reject')) {
            btn.textContent = "Processando...";
        }
    });

    try {
        // AJUSTE AQUI: Use a rota que criamos para responder (sendRequest ou updateStatus)
        // Estou assumindo uma rota genérica baseada no seu controller anterior
        const response = await fetch(`${API_BASE_URL}/friendships/${requesterId}`, { 
            method: 'PATCH', // ou PUT, dependendo da sua rota
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                newStatus: novoStatus // 'accepted' ou 'rejected'
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Erro ao responder');
        }

        // Sucesso! Remove o item da lista visualmente
        itemLi.style.transition = "all 0.5s";
        itemLi.style.opacity = "0";
        itemLi.style.transform = "translateX(50px)";
        
        setTimeout(() => {
            itemLi.remove();
            // Atualiza o contador visualmente (-1)
            const contadorElement = document.getElementById('contador-solicitacoes');
            const atual = parseInt(contadorElement.textContent.replace(/\D/g,'')) || 0;
            if(atual > 0) contadorElement.textContent = `(${atual - 1})`;
            
            // Opcional: Se aceitou, recarrega a lista de amigos na outra aba
            if(novoStatus === 'accepted') carregarListaAmigos();
        }, 500);

    } catch (error) {
        console.error(error);
        alert("Erro: " + error.message);
        // Reabilita botões em caso de erro
        botoes.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = 1;
            btn.textContent = btn.classList.contains('btn-accept') ? 'Aceitar' : 'Recusar';
        });
    }
}

// Gatilhos
document.getElementById('openFriendsSidebarBtn').addEventListener('click', () => {
    carregarSolicitacoes(); // Carrega solicitações ao abrir
    // carregarListaAmigos(); // (Opcional) Carrega amigos também
});

// Se clicar na aba especificamente, recarrega para garantir
document.querySelector('[data-target="tab-requests"]').addEventListener('click', carregarSolicitacoes);








// ------------------------------ NOTIFICAÇÕES -----------------------------

let notifications = [
    {
        id: 1,
        user: 'Ana Silva',
        action: 'curtiu sua publicação',
        time: '2 min atrás',
        colorClass: 'color-pink',
        read: false,
        icon: 'heart'
    },
    {
        id: 2,
        user: 'João Souza',
        action: 'comentou no seu post: "Ficou ótimo!"',
        time: '15 min atrás',
        colorClass: 'color-blue',
        read: false,
        icon: 'message-square'
    },
    {
        id: 3,
        user: 'Sistema',
        action: 'Sua senha foi alterada com sucesso.',
        time: '1h atrás',
        colorClass: 'color-gray',
        read: true,
        icon: 'settings'
    },
    {
        id: 4,
        user: 'Carlos Miguel',
        action: 'começou a seguir você',
        time: '3h atrás',
        colorClass: 'color-green',
        read: true,
        icon: 'check-circle-2'
    },
    {
        id: 5,
        user: 'Segurança',
        action: 'Novo login detectado em São Paulo',
        time: 'Ontem',
        colorClass: 'color-yellow',
        read: true,
        icon: 'bell'
    }
];

let currentTab = 'all';

// --- Elementos DOM ---
const overlay = document.getElementById('sidebarOverlay');
const drawer = document.getElementById('notificationDrawer');
const openBtn = document.getElementById('openDrawerBtn');
console.log(openBtn);

const closeBtn = document.getElementById('closeDrawerBtn');
const listContainer = document.getElementById('notificationList');
const searchInput = document.getElementById('searchInput');
const unreadCountBadge = document.getElementById('unreadCount');
const tabBtns = document.querySelectorAll('.tab-btn');

// --- Inicialização ---
renderList();

// --- Funções de Drawer ---
function openDrawer() {
    overlay.classList.add('active');
    drawer.classList.add('active');
    openBtn.style.opacity = '0'; // Ocultar botão para não sobrepor visualmente se quiser
}

function closeDrawer() {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    openBtn.style.opacity = '1';
}

openBtn.addEventListener('click', openDrawer);
closeBtn.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

// --- Lógica de Negócio ---

function setTab(tab) {
    currentTab = tab;
    
    // Atualizar UI das abas
    tabBtns.forEach(btn => {
        if(btn.dataset.target === tab) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    renderList();
}

function filterNotifications() {
    renderList();
}

function toggleRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
        notif.read = !notif.read;
        renderList();
    }
}

function markAllRead() {
    notifications.forEach(n => n.read = true);
    renderList();
}

function renderList() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filtered = notifications.filter(n => {
        const matchesSearch = n.user.toLowerCase().includes(searchTerm) || n.action.toLowerCase().includes(searchTerm);
        const matchesTab = currentTab === 'all' ? true : !n.read;
        return matchesSearch && matchesTab;
    });

    // Atualizar contador
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        unreadCountBadge.innerText = unreadCount;
        unreadCountBadge.style.display = 'inline-flex';
    } else {
        unreadCountBadge.style.display = 'none';
    }

    // Limpar lista
    listContainer.innerHTML = '';

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <li class="empty-state">
                <i data-lucide="bell-off" width="32" height="32"></i>
                <p>Nenhuma notificação encontrada.</p>
            </li>
        `;
    } else {
        filtered.forEach(item => {
            const li = document.createElement('li');
            li.className = `notification-item ${!item.read ? 'unread' : ''}`;
            li.onclick = () => toggleRead(item.id);

            li.innerHTML = `
                <div class="notif-icon-box ${item.colorClass}">
                    <i data-lucide="${item.icon}" width="18" height="18"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-header">
                        <span class="notif-user">${item.user}</span>
                        <span class="notif-time">${item.time}</span>
                    </div>
                    <p class="notif-action">${item.action}</p>
                </div>
                ${!item.read ? '<div class="unread-indicator"></div>' : ''}
            `;
            listContainer.appendChild(li);
        });
    }

    // Reinicializar ícones Lucide para os novos elementos
    lucide.createIcons();
}
