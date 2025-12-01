const API_BASE_URL = '/api';
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

const inputPesquisa = document.getElementById('inputPesquisaUsuario');
let debounceTimer;
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
    
    // Tenta pegar o ID da tarefa (do próprio container ou do span)
    const taskId = taskElement.dataset.taskId || dateValue.getAttribute("data-id");

    if (!invisibleDateInput) return;

    // --- 1. Lógica para ler a data inicial do HTML (Texto -> Objeto Date) ---
    let initialDate = null;
    const rawText = dateValue.textContent.trim();
    
    // Se o texto for uma data válida (ex: 27/11/2025), convertemos
    if (rawText.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const parts = rawText.split('/');
        console.log(parts);
        
        // Nota: Mês em JS começa em 0 (Janeiro = 0, Novembro = 10)
        initialDate = new Date(parts[2], parts[1] -1, parts[0]);
    }

    // --- 2. Atualiza APENAS o visual (Classes CSS) ---
    // Isto roda no início para garantir que a cor está certa
    if (initialDate) {
        dateValue.classList.remove("noValue");
        dateValue.classList.add("withValue");
    } else {
        dateValue.classList.remove("withValue");
        dateValue.classList.add("noValue");
    }

    async function handleDateChange(selectedDates) {
        // O flatpickr devolve a data selecionada como objeto Date
        // e já ajustada para o meio-dia local para evitar problemas de fuso,
        // mas para garantir, vamos usar os métodos 'get' locais.
        const dateObj = selectedDates[0];
        
        if (!dateObj) {
            // Se o utilizador limpou a data
            dateValue.textContent = "Nenhuma data definida";
            dateValue.classList.remove("withValue");
            dateValue.classList.add("noValue");
            
            console.log(`Removendo data para tarefa ${taskId}...`);
            try {
                await requestUpdateTask({data_termino: null}, taskId);
                console.log("🟩 Data removida com sucesso!");
            } catch (error) {
                console.error("Erro ao remover data:", error);
            }
            return;
        }

        // Atualiza visualmente (DD/MM/YYYY)
        const formattedDate = brazilDateFormat(dateObj);
        dateValue.textContent = formattedDate;
        dateValue.classList.remove("noValue");
        dateValue.classList.add("withValue");

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateToSend = `${year}-${month}-${day}`;

        // Salva no Banco
        console.log(`Salvando data ${dateToSend} para tarefa ${taskId}...`);
        try {
            await requestUpdateTask({data_termino: dateToSend}, taskId);
            console.log("🟩 Data salva com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar data:", error);
            // Opcional: Reverter visualmente se falhar
        }
    }
    // --- 4. Inicializa o Flatpickr ---
    const fp = flatpickr(invisibleDateInput, {
        dateFormat: "d.m.Y",
        allowInput: false,
        defaultDate: initialDate, // <<< IMPORTANTE: Diz ao calendário qual é a data atual!
        locale: flatpickr.l10ns.pt,
        appendTo: selectDate, 
        position: "below",
        onChange: handleDateChange // Só chama a função de salvar quando o usuário muda algo
    });
    
    selectDate.addEventListener("click", () => {
        fp.open();
    });
}

// Sua função brazilDateFormat pode permanecer global
function brazilDateFormat(dataObj) {
    console.log(dataObj);
    
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

let currentPriority = "Media";

const priorityMap = {
    Alta: { type: 'priority', text: "Alta", class: "highPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] },
    Media: { type: 'priority', text: "Média", class: "mediumPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] },
    Baixa: { type: 'priority', text: "Baixa", class: "lowPriority", allClasses: ["highPriority", "mediumPriority", "lowPriority"] }
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

        if(type === "status"){
            const dataAttributeId = `data-${type}-id`
            const newSelectionId = badge.getAttribute(dataAttributeId)

            updateTaskBadges(task, type, newSelection, newSelectionId);
        }else{
            updateTaskBadges(task, type, newSelection, {newSelectionId: null});
        }
        
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
    document.querySelectorAll('.selectModal').forEach(modal => {
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
async function updateTaskBadges(taskElement, type, newSelection, newSelectionId) {
    const map = (type === 'status') ? statusMap : priorityMap;
    const info = map[newSelection];
    
    const triggerClass = (type === 'status') ? '.statusClickArea' : '.priorityClickArea';
    const headerClass = (type === 'status') ? '.selectedStatus' : '.selectedPriority';

    const trigger = taskElement.querySelector(triggerClass);
    const header = taskElement.querySelector(headerClass);
    const idTask = taskElement.getAttribute("data-task-id");
    
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

    console.log("⭕DADOS", taskElement, type, newSelection, newSelectionId, idTask);

    if(type === "status"){
        const updatedTask = await requestUpdateTask({status_id: newSelectionId}, idTask)
        if(newSelectionId === "3" || newSelectionId === "2"){
        const customCheckboxes = taskElement.querySelector('.checkboxCustom'); 
        checkBox(taskElement, customCheckboxes, idTask)  
        }
        console.log("🟩Tarefa Atualizada:", updatedTask);
    }else{
        const updatedTask = await requestUpdateTask({prioridade: newSelection}, idTask)
        console.log("🟩Tarefa Atualizada:", updatedTask);
    }
    
    
    
}

/* Categoria */

function toggleCategoryModal (){
    selectCategoryModal.classList.toggle("selectCategoryHidden")
    createNewCategoryInput.focus()
}

document.addEventListener('click', (event) => {
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


document.addEventListener('DOMContentLoaded', function() {
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


const currentUserId = 3



async function carregarListaAmigos() {
    const listaElement = document.getElementById('lista-amigos');
    
    try {
        // 1. Busca os dados da API
        const response = await fetch(`${API_BASE_URL}/friendships/`);
        
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
            let amigoData;

            if (amizade.requester_id === currentUserId) {
                // Se eu pedi, o amigo é o Addressee
                amigoData = amizade.Addressee;
            } else {
                // Se eu recebi, o amigo é o Requester
                amigoData = amizade.Requester;
            }

            // Tratamento de segurança para foto (caso venha null)
            const foto = amigoData.profile?.foto_perfil || `https://ui-avatars.com/api/?name=${amigoData.nome}&background=random`;
            
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
            li.dataset.friendId = amigoData.id;

            li.innerHTML = `
                <div class="friend-avatar-container ${statusClass}">
                    <img src="${foto}" alt="${amigoData.nome}" class="friend-avatar">
                </div>
                <div class="friend-info">
                    <span class="friend-name">${amigoData.nome}</span>
                    <span class="friend-status-text">${statusText}</span>
                </div>
                <button class="btn-more-options" style="background:none; border:none; color:#ccc; cursor:pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
            `;

            // Clique no amigo (Ex: para abrir chat)
            li.addEventListener('click', () => {
                console.log(`Abrir chat com ${amigoData.nome} (ID: ${amigoData.id})`);
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
    console.log(listaElement);
    
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
        const response = await fetch(`${API_URL}/friendships/${requesterId}`, { 
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

async function selectCategoryOption(taskElement, name, bg, txt, categoryId) {
    const selectedCategoryDisplay = taskElement.querySelector(".categoryBadge:not(.categoryBadgeHeaderModal)"); 
    const taskId = taskElement.getAttribute("data-task-id")  
    
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

    const updatedTask = await requestUpdateTask({categoria_id: categoryId}, taskId);

    console.log("🟩Tarefa Atualizada:", updatedTask);


    
}

function initializeTaskFunctions(taskElement) {

    setupDatePickerForTask(taskElement); 
    addCheckEvent(taskElement);

    const categoryContainer = taskElement.querySelector(".categoryContainer");
    const taskId = taskElement.getAttribute("data-task-id")
    console.log("idhudddd:", taskId);
    
    
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

    createNewCategoryInput.addEventListener("keyup", async(event) => {
        if (event.key === "Enter"){
            const categoryName = createNewCategoryInput.value.trim();

            if (categoryName === "") return;
            
            const colorPair = getRandomColor();
            console.log(colorPair);

            // Chamada adaptada: Passa o elemento da tarefa atual!
            addCategoryOption(taskElement, categoryName, colorPair.bg, colorPair.text);
            selectCategoryOption(taskElement, categoryName, colorPair.bg, colorPair.text);

            createNewCategoryInput.value = "";
            selectCategoryModal.classList.add("selectCategoryHidden");

            console.log("Category:", { "Nome": categoryName, "Back": colorPair.bg, "Text:": colorPair.text});
            

            const createdCategory = await requestCreateCategory({nome: categoryName, cor_fundo: colorPair.bg, cor_texto: colorPair.text});

            const updatedTask = await requestUpdateTask({categoria_id: createdCategory.id}, taskId)
            
        }
    });
    
    categoryOptionsWrapper.addEventListener('click', (event) => {
        const badge = event.target.closest('.categoryBadge');
        if (badge && !badge.closest('.categoryModalHeader')) {
            const name = badge.textContent.trim();
            const bg = badge.style.backgroundColor;
            const txt = badge.style.color;
            const categoryId = badge.getAttribute("data-category");
            
            
            selectCategoryOption(taskElement, name, bg, txt, categoryId);
            selectCategoryModal.classList.add("selectCategoryHidden");
        }
    });
}

async function handleTaskUpdate(event) {
    const inputTarget = event.target;
    
    const newText = inputTarget.value.trim();
    const idItem = inputTarget.dataset.id;

    console.log(`A salvar o item ${idItem} com o texto: "${newText}"`);

    const taskUpdated = await requestUpdateTask({titulo: newText}, idItem);

    console.log("🟩Tarefa Atualizada:", taskUpdated);
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

// Chamar API para criar tarefa
async function requestCreateTask(){
    const dataDefaultTask = {
        "status_id": 1,
        "prioridade": "Media",
    }

    try{
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataDefaultTask)
        }); 

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar a tarefa.');
        }

        const newTask = await response.json();
        
        return newTask;
        
    }catch(error){
        console.error("Falha ao chamar api para criar tarefa:", error);
        alert("Não foi possível chamar api para criar a tarefa: " + error.message);
        return;
    }
    
}

// Chamar a api para atualizar tarefa 
async function requestUpdateTask(dataTaskUpdated, taskId){
    try{
        if(!dataTaskUpdated || !taskId){
            alert("Necessário um dado para atualizar e o id da tarefa");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body:  JSON.stringify(dataTaskUpdated)
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar a tarefa.');
        }

        const updatedTask = await response.json();

        return updatedTask;
    }catch(error){
        console.error("Falha chamar api para atualizar tarefa:", error);
        alert("Não ao atualizar tarefa na api: " + error.message);
        return;
    }
}

// Buscar todas as categorias na API
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

async function createNewTaskRow(taskDeafult, categories) {
    console.log("Tarefa Padrão:", taskDeafult);
    console.log("Categorias:", categories);

    var classStatus;
    var classPriority;
    var classCategory;
    var valueCategoryName;
    var statusCheckBox;
    let badgeDeafult = ` <div class="categoryBadge noCategorySelected"></div>` 

    if(!taskDeafult.titulo){
        taskDeafult.titulo = ""
    }

    if(!taskDeafult.categoryTask){
        classCategory = "noCategorySelected";
        valueCategoryName = ""
    }else{
        classCategory = ""
        valueCategoryName = taskDeafult.categoryTask.nome

        badgeDeafult = ` <div class="categoryBadge" style="background-color: ${taskDeafult.categoryTask.cor_fundo}; color: ${taskDeafult.categoryTask.cor_texto};"  data-category="${taskDeafult.categoryTask.id}"><span class="categoryNameText">${valueCategoryName}</span></div>` 
    }
    
    if(taskDeafult.statusTask.nome === "Pendente"){
        classStatus = "toDoStatus"
    }else if(taskDeafult.statusTask.nome === "Em Andamento"){
        classStatus = "doingStatus"
    }else{
        classStatus = "doneStatus"
        statusCheckBox = "checked"
    }
    
    if(taskDeafult.prioridade === "Alta"){
        classPriority = "highPriority";
    }else if(taskDeafult.prioridade === "Media"){
        classPriority = "mediumPriority"
    }else{
        classPriority = "lowPriority"
    }
    
    
    const dateValue = formatDateForDisplay(taskDeafult.data_termino);
    
    
    const categoriesHtml = categories.map((cat, index) => {
    return `
        <div class="categoryBadgeContainer" data-category="${cat.id}">
            <div class="categoryBadge" style="background-color: ${cat.cor_fundo}; color: ${cat.cor_texto};"  data-category="${cat.id}">
                <p>${cat.nome}</p>
            </div>
        </div>
    `;
    }).join('');
    
    const taskRow = document.createElement("div");
    taskRow.classList.add("task");
    taskRow.setAttribute(`data-task-id`, `${taskDeafult.id}`)

    taskRow.innerHTML = `
        <div class="taskNameContainer">
            <input type="checkbox" class="checkBoxTask" ${statusCheckBox}>
            <span class= "checkboxCustom">
                <svg class = "checkIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <input type="text" class="invisibleTaskNameInput" data-id="${taskDeafult.id}" value="${taskDeafult.titulo}">
        </div>

        <div class="dueDateContainer taskClickArea">
            <span class="dueDateValue" data-id="${taskDeafult.id}">${dateValue}</span>
            <input type="text" class="invisibleDateInput" style="display: none;">
        </div>

        <div class="statusContainer">
            <div class="statusBadge ${classStatus} statusClickArea">
                <div class="statusMarker toDoMarker"></div>
                <span>${taskDeafult.statusTask.nome}</span>
            </div>
            <div class="selectStatusModal selectModalHidden">
                <div class="statusModalHeader">
                    <div class="statusBadge toDoStatus selectedStatus" data-status="toDo" data-status-id="1">
                        <div class="statusMarker toDoMarker"></div>
                        <span>Pendente</span>
                    </div>
                </div>
                <div class="selectOptionText">Selecione uma opção</div>
                <div class="optionsWrapper">
                    <div class="statusBadgeContainer"><div class="statusBadge toDoStatus" data-status="toDo" data-status-id="1"><div class="statusMarker toDoMarker"></div><span>Pendente</span></div></div>
                    <div class="statusBadgeContainer"><div class="statusBadge doingStatus" data-status="doing" data-status-id="2"><div class="statusMarker doingMarker"></div><span>Em andamento</span></div></div>
                    <div class="statusBadgeContainer"><div class="statusBadge doneStatus" data-status="done" data-status-id="3"><div class="statusMarker doneMarker"></div><span>Concluído</span></div></div>
                </div>
            </div>
        </div>

        <div class="categoryContainer taskClickArea">
            ${badgeDeafult}
            <div class="selectCategoryModal selectCategoryHidden">
                <div class="categoryModalHeader">
                    <div class="categoryBadgeHeader">
                        <div class="categoryBadgeHeaderModal noCategorySelected"></div> 
                    </div>
                    <input type="text" class="createNewCategory">
                </div>
                <div class="selectOptionText">Selecione uma opção ou crie uma</div>
                <div class="categoryOptionsWrapper">
                ${categoriesHtml}
                </div>
            </div>
        </div>

        <div class="priorityContainer">
            <div class="priorityBadge ${classPriority} priorityClickArea">
                <span>${taskDeafult.prioridade}</span>
            </div>
            <div class="selectPriorityModal selectModalHidden">
                <div class="priorityModalHeader">
                    <div class="priorityBadge ${classPriority} selectedPriority" data-priority="${taskDeafult.prioridade}">
                        <span>${taskDeafult.prioridade}</span>
                    </div>
                </div>
                <div class="selectOptionText">Selecione uma opção</div>
                <div class="priorityOptionsWrapper">
                    <div class="priorityBadgeContainer"><div class="priorityBadge highPriority" data-priority="Alta"><span>Alta</span></div></div>
                    <div class="priorityBadgeContainer"><div class="priorityBadge mediumPriority" data-priority="Media"><span>Média</span></div></div>
                    <div class="priorityBadgeContainer"><div class="priorityBadge lowPriority" data-priority="Baixa"><span>Baixa</span></div></div>
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

createTask.addEventListener("click", async() => {
    const taskDeafult = await requestCreateTask()
    const categories = await requestCategoriesForUser();
    const newTaskElement = await createNewTaskRow(taskDeafult, categories); 
    taskContainer.insertAdjacentElement("beforeend", newTaskElement);
    taskContainer.scrollTop = taskContainer.scrollHeight;
                        
    // Se quiser uma animação suave (opcional, mas bonito):
    taskContainer.scrollTo({
        top: taskContainer.scrollHeight,
        behavior: 'smooth'
    });


    const newTaskInput = newTaskElement.querySelector(".invisibleTaskNameInput");

    newTaskInput.addEventListener('blur', (event) => {
    handleTaskUpdate(event);
    });

    newTaskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {      
            event.preventDefault(); 
            newTaskInput.blur(event); 
        }
    });

    if (newTaskInput) {
        newTaskInput.select();
        newTaskInput.focus();
    }
});

// Buscar tarefas do usuário na API

async function requestTasksForUser(){
    try{
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }); 

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao listar tarefas do usuario');
        }

        const tasks = await response.json();

        return tasks;
    }catch(error){
        console.error("Falha ao criar a tarefa:", error);
        alert("Não foi possível criar a tarefa: " + error.message);
        return;
    }
}


/* Criar a tarefa assim que a pagina abrir */
document.addEventListener('DOMContentLoaded', async() => {
    const tasks = await requestTasksForUser();
    const categories = await requestCategoriesForUser();

    for (const task of tasks) {
        const newTaskElement = await createNewTaskRow(task, categories); 
        
        taskContainer.insertAdjacentElement("beforeend", newTaskElement);

        const newTaskInput = newTaskElement.querySelector(".invisibleTaskNameInput");

        newTaskInput.addEventListener('blur', (event) => {
        handleTaskUpdate(event);
        });

        newTaskInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {      
                event.preventDefault(); 
                newTaskInput.blur(event); 
            }
        });
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


async function checkBox(taskElement, customCheckboxSpan, taskId) {
    // 1. Encontra os elementos relacionados
    const inputCheckbox = customCheckboxSpan.previousElementSibling;
    const taskNameInput = customCheckboxSpan.nextElementSibling; // ou onde estiver o input do nome
    const taskName = taskNameInput ? (taskNameInput.value || taskNameInput.textContent).trim() : '';

    if (taskName.length > 0) {
        if (inputCheckbox && inputCheckbox.type === 'checkbox') {
            
            // 2. Inverte o estado atual (Toggle)
            inputCheckbox.checked = !inputCheckbox.checked;
            inputCheckbox.dispatchEvent(new Event('change'));

            console.log("Checked:", inputCheckbox.checked);
            
            const newStatusId = inputCheckbox.checked ? 3 : 2;

            const newStatusClass = inputCheckbox.checked ? "done" : "doing"
            
            try {
                // 4. Chama a API com o ID dinâmico
                console.log(`Atualizando tarefa ${taskId} para status ${newStatusId}...`);
                const updatedTask = await requestUpdateTask({ status_id: newStatusId }, taskId);
                updateTaskBadges(taskElement, "status", newStatusClass, newStatusId)
            } catch (error) {
                console.error("Erro ao atualizar checkbox:", error);
                // Reverte o checkbox se a API falhar
                inputCheckbox.checked = !inputCheckbox.checked; 
                alert("Erro ao atualizar o status da tarefa.");
            }
        }
    } else {
            showWarningMessage(2000)
    }
}


/* função para checar as boxes das tarefas */

async function addCheckEvent (taskElement) {
    const customCheckboxes = taskElement.querySelector('.checkboxCustom'); 
    const taskId = taskElement.getAttribute("data-task-id");
    
    if (customCheckboxes) {
        customCheckboxes.addEventListener('click', async() => {
            checkBox(taskElement, customCheckboxes, taskId)
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

