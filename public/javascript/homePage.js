const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const userProfile = document.querySelector(".userProfile")
const userProfileModal = document.querySelector(".userModal")
const currentUserId = localStorage.getItem('userId'); 
let currentProjectId = window.location.pathname.split('/').filter(Boolean).pop();

const API_BASE_URL = '/api';


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

closeMenu.addEventListener("click", toggleMenu);

function toggleMenu() {
    sideMenu.classList.toggle("asideClosed");
}

/* Abrir modal do usuario */

userProfile.addEventListener("click", ()=>{
    userProfileModal.classList.toggle("hidden")
    userProfile.classList.toggle("userProfileSelected")
})


// ----------------------------- PESQUISAR USUÁRIO -------------------

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

// --------------------------------------------------------------------



// ----------------------- COMUNIDADE --------------------------------

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

// ------------------------------------------------------------------



// ---------------------- CARREGAR PROJETOS --------------------------
const projectList = document.querySelector(".projectList")

document.addEventListener('DOMContentLoaded', async() => {
    // const categoryOptionsWrapper = document.querySelector(".categoryOptionsWrapper");

    // const categories = await requestCategoriesForUser();
    const projects = await requestListProjects();
    console.log(projects);
    
    for(const project of projects){
        const dateValue = formatDateForDisplay(project.data_termino)

        const newProject = createNewProject(project.titulo, project.categoryTask.nome, project.categoryTask.cor_fundo, project.categoryTask.cor_texto, dateValue, project.id);

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

    carregarListaAmigosPage()
});

async function requestListProjects(dataProject){
    try{
        const response = await fetch(`${API_BASE_URL}/projetos`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }); 

        if (!response.ok) {
            const errorData = await response.json();
            if(response.status === 401 || response.status === 403){
                window.location.href = '/register';
            }
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

function createNewProject(name, categoryName, categoryBg, categoryTxt, dueDateText, projectId) {
    const newProject = document.createElement("div");
    newProject.classList.add("project");
    newProject.setAttribute('data-project-id', projectId)

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






// ---------------------- LISTAR AMIGOS ---------------------

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


//  -----------------------------------------------------------


// ---------------------- LISTAR TAREFAS -------------------------

 const taskList = document.querySelector('.tasksList');

document.addEventListener('DOMContentLoaded', async() => {
    const tasks = await requestTasksForUser();
    if(tasks){
        taskList.innerHTML = ""
    }

    for (const task of tasks) {
        const newTaskElement = await createNewTaskRow(task); 
        
        taskList.insertAdjacentElement("beforeend", newTaskElement);
    }

});

async function requestTasksForUser(){
    try{
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }); 

        if (!response.ok) {
            const errorData = await response.json();
            if(response.status === 401 || response.status === 403){
                window.location.href = '/register';
            }
            throw new Error(errorData.message || 'Falha ao listar tarefas do usuario');
        }

        const tasks = await response.json();
        console.log(tasks);

        return tasks;
    }catch(error){
        console.error("Falha ao criar a tarefa:", error);
        alert("Não foi possível criar a tarefa: " + error.message);
        return;
    }
}

async function createNewTaskRow(taskDeafult) {
    console.log("Tarefa Padrão:", taskDeafult);

    if(!taskDeafult.titulo){
        taskDeafult.titulo = ""
    }
    
    if(taskDeafult.prioridade === "Alta"){
        classPriority = "highPriority";
    }else if(taskDeafult.prioridade === "Media"){
        classPriority = "mediumPriority"
    }else{
        classPriority = "lowPriority"
    }
    
    
    const dateValue = formatDateForDisplay(taskDeafult.data_termino);
    
    
    const taskRow = document.createElement("div");
    taskRow.classList.add("homeTask");
    taskRow.setAttribute(`data-task-id`, `${taskDeafult.id}`)

    taskRow.innerHTML = `
                                <div class="taskInfo">
                                    <span class="checkboxCustom"></span>
                                    <div class="nameAndDateTask">
                                        <p class="taskName">${taskDeafult.titulo}</p> 
                                        <p class="dueDateTask" data-id="${taskDeafult.id}">${dateValue}</p>
                                    </div>
                                </div>
                                <div class="priorityBadge">
                                    ${taskDeafult.prioridade}
                                </div>
                            `; 

    addCheckEvent(taskRow); 
    taskRow.addEventListener('click', () => {
        window.location.href = '/tasks'
    })
    return taskRow;
}

async function addCheckEvent (taskElement) {
    const customCheckboxes = taskElement.querySelector('.checkboxCustom'); 
    const taskId = taskElement.getAttribute("data-task-id");
    console.log(customCheckboxes, taskElement, taskId);
    
    
    if (customCheckboxes) {
        customCheckboxes.addEventListener('click', async() => {
            checkBox(taskElement, customCheckboxes, parseInt(taskId))
        });
    }
}

async function checkBox(taskElement, customCheckboxSpan, taskId) {
    // 1. Encontra os elementos relacionados
    const inputCheckbox = customCheckboxSpan.previousElementSibling;
    console.log();
    
    const taskName = taskElement.querySelector('.taskName').textContent; 
    console.log(taskName);
    


    if (taskName.trim().length > 0) {
        console.log("opa");
        
        if (inputCheckbox && inputCheckbox.type === 'checkbox') {

            
            // 2. Inverte o estado atual (Toggle)
            inputCheckbox.checked = !inputCheckbox.checked;
            inputCheckbox.dispatchEvent(new Event('change'));

            console.log("Checked:", inputCheckbox.checked);
            
            const newStatusId = inputCheckbox.checked ? 3 : 2;
            
            try {
                // 4. Chama a API com o ID dinâmico
                console.log(`Atualizando tarefa ${taskId} para status ${newStatusId}...`);
                const updatedTask = await requestUpdateTask({ status_id: newStatusId }, taskId);
            } catch (error) {
                console.error("Erro ao atualizar checkbox:", error);
                inputCheckbox.checked = !inputCheckbox.checked; 
                alert("Erro ao atualizar o status da tarefa.");
            }
        }
    } else {
            showWarningMessage(2000)
    }
}

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
            if(response.status === 401 || response.status === 403){
                window.location.href = '/register';
            }
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

function showWarningMessage(duration = 2000) {
    
    messageModal.classList.remove("messageHidden")

    setTimeout(() => {

         messageModal.classList.add("messageHidden")

    }, duration)
}

//  ---------------------------------------------------------------------





// ---------------------------- LISTAR AMIZADES -------------------------

async function carregarListaAmigosPage() {
    const listaElement = document.querySelector('.usersList');
    
    try {
        // 1. Busca os dados da API
        const response = await fetch(`${API_BASE_URL}/friendships/`);
        
        if (!response.ok){
            if(response.status === 401 || response.status === 403){
                window.location.href = '/register';
            }
             throw new Error('Erro ao buscar amizades');
        }
        
        const amizades = await response.json();

        // Limpa a lista (remove o "Carregando...")
        listaElement.innerHTML = '';

        if (amizades.length === 0) {
            listaElement.innerHTML = '<li style="padding:20px; text-align:center; color:#999;">Você ainda não tem amigos adicionados.</li>';
            return;
        }

        // 2. Itera sobre cada amizade
        amizades.forEach(amizade => {
            console.log(amizade);
            
        
            // Tratamento de segurança para foto (caso venha null)
            const foto = amizade.profile?.foto_perfil || `https://ui-avatars.com/api/?name=${amizade.nome}&background=random`;
            
            // Simulação de Status (Já que o banco não retorna online/offline ainda)
            // Futuramente você pode conectar isso a um WebSocket
            const isOnline = Math.random() > 0.5; // Random só pra visualização agora
            const statusClass = isOnline ? 'status-online' : 'status-offline';
            const statusText = isOnline ? 'Online' : 'Offline';

            // 3. Cria o HTML do Item
            const li = document.createElement('div');
            li.classList.add('userHome');
            
            // Adiciona ID da amizade para facilitar chat ou remoção futura
            li.dataset.friendshipId = amizade.id;
            li.dataset.friendId = amizade.id;

            li.innerHTML = `
                <div class="friend-avatar-container ${statusClass}">
                    <img src="${foto}" alt="${amizade.nome}" class="friend-avatar">
                </div>
                    <p class="userName">${amizade.nome}</p>
            `;

            // Clique no amigo (Ex: para abrir chat)
            li.addEventListener('click', () => {
                console.log(`Abrir chat com ${amizade.nome} (ID: ${amizade.id})`);
                // window.location.href = `/chat/${amigoData.id}`;
            });

            listaElement.appendChild(li);
        });

    } catch (error) {
        console.error(error);
        listaElement.innerHTML = '<li style="color:red; padding:20px; text-align:center;">Erro ao carregar amigos.</li>';
    }
}

//  ---------------------------------------------------------------------