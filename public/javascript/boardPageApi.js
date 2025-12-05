const socket = io();

let currentProjectId = window.location.pathname.split('/').filter(Boolean).pop();

socket.emit('joinRoom', currentProjectId);

const API_BASE_URL = '/api';
const projectTitleEl = document.querySelector('h1.projectName');
const membersHeaderContainer = document.querySelector('.membersIconandQuantity');
const boardColumnsContainer = document.querySelector('.boardColumns');
const membersSidebarContainer = document.querySelector('.members .container-memberTasks');
const addTaskButton = document.querySelector(".addTask")
const createSubtask = document.querySelector(".createSubtasks")
const subtaskContainer = document.querySelector(".listSubtasks")


// Adicione junto com suas outras variáveis globais
let currentEditingTaskId = null; 
let autosaveTimeout = null;

addTaskButton.addEventListener("click", openModalTask);


async function openModalTask() {
    try {
        // 1. Cria a tarefa vazia no banco imediatamente
        const newTask = await requestCreateTask();
        currentEditingTaskId = newTask.id; // Guarda o ID para o autosave usar

        // 2. Abre o Modal
        filter.classList.add("filterOn");
        addTaskModal.classList.add("modalOn");
        
        // 3. Limpa/Reseta os campos visuais do modal para não mostrar dados antigos
        taskNameInput.value = ""; 
        document.querySelector(".dateValue").textContent = "Nenhuma data definida";
        document.querySelector(".dateValue").classList.remove("withValue");
        
        // Foca no título
        taskNameInput.focus();

        // 4. RENDERIZA O CARD NA COLUNA IMEDIATAMENTE
        const taskHtml = createTaskHtml(newTask);
        const targetColumnId = newTask.coluna_id || 1; // ID da coluna "A Fazer"
        const columnEl = document.querySelector(`.column[data-column-id="${targetColumnId}"]`);

        if (columnEl) {
            const taskListEl = columnEl.querySelector('.task-list-dropzone');
            
            // Tira a classe 'noRender' se for a primeira tarefa
            if (taskListEl.classList.contains('noRender')) {
                taskListEl.classList.remove('noRender');
            }
            
            // Adiciona o card
            taskListEl.insertAdjacentHTML('beforeend', taskHtml);

            // Atualiza contador da coluna
            const counterEl = columnEl.querySelector('.columnTaskQuantity');
            if (counterEl) counterEl.textContent = parseInt(counterEl.textContent || 0) + 1;

            // Adiciona listeners de clique no novo card
            addCardClickListeners();
        }

        // 5. ATIVA O AUTOSAVE
        // Liga os eventos nos campos para salvar assim que você alterar algo
        setupDateUpdateLogic();
        setupAutoSave();
      

    } catch (error) {
        console.error("Erro ao abrir modal:", error);
        alert("Erro ao iniciar a criação da tarefa.");
    }
}

function setupAutoSave() {
    const modal = document.querySelector('.addTaskModal');
    
    // --- A. TÍTULO (Salva 1 segundo após parar de digitar) ---
    const titleInput = modal.querySelector('.invisibleTaskNameInput');
    console.log("🚀🚀🟨",titleInput);
    
    
    // Remove listeners antigos clonando o elemento (truque rápido)
    const newTitleInput = titleInput.cloneNode(true);
    titleInput.parentNode.replaceChild(newTitleInput, titleInput);
    
    newTitleInput.addEventListener('input', () => {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(() => {
            console.log("🕜");
            
            triggerUpdate({ titulo: newTitleInput.value });
        }, 1000); 
    });
    // Foca novamente pois o clone perde o foco
    newTitleInput.focus(); 

    const descriptionInput = modal.querySelector('.descriptionInput');
    
    // 1. Clona para limpar ouvintes antigos
    const newDescriptionInput = descriptionInput.cloneNode(true);
    
    // 2. CORREÇÃO AQUI: Usa o pai do descriptionInput, não do titleInput
    descriptionInput.parentNode.replaceChild(newDescriptionInput, descriptionInput);
    
    // 3. Adiciona o ouvinte no novo elemento
    newDescriptionInput.addEventListener('input', () => {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(() => {
            // Chama o update passando apenas o campo que mudou
            triggerUpdate({ descricao: newDescriptionInput.value });
        }, 1000); 
    });

    // --- B. CATEGORIA (Salva ao clicar) ---
    const categoryOptions = modal.querySelectorAll('.categoryOption');
    categoryOptions.forEach(option => {
        option.addEventListener('click', () => {
            const categoryId = option.getAttribute('data-category');
            triggerUpdate({ categoria_id: categoryId });
        });
    });

    // --- C. STATUS (Salva e move de coluna ao clicar) ---
    const statusOptions = modal.querySelectorAll('.statusOption');
    statusOptions.forEach(option => {
        option.addEventListener('click', () => {
            const statusId = option.getAttribute('data-status');
            triggerUpdate({ status_id: statusId });
        });
    });
}

function updateColumnCounters() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(col => {
        const count = col.querySelectorAll('.task-card-draggable').length;
        const counterEl = col.querySelector('.columnTaskQuantity');
        if (counterEl) counterEl.textContent = count;
    });
}


async function triggerUpdate(dataToUpdate) {
    if (!currentEditingTaskId) return;
    
    console.log("🚀 Iniciando update na tarefa:", currentEditingTaskId);
    console.log("📦 Payload:", dataToUpdate);

    // --- CASO 1: Mover de Coluna (Status) ---
    if (dataToUpdate.hasOwnProperty('status_id')) {
        const newColumnId = dataToUpdate.status_id;
        
        // Chama API de mover
        const movedTask = await requestMoveTask(currentEditingTaskId, newColumnId);
        requestUpdateTask({status_id: 3}, currentEditingTaskId);

        if (movedTask) {
            moveTaskToColumn(currentEditingTaskId, newColumnId);
            updateTaskCardInDOM(movedTask);
            updateColumnCounters();
        }
        return; // Sai da função
    }

    // --- CASO 2: Adicionar Membro ---
    if (dataToUpdate.hasOwnProperty('add_member_id')) {
        const memberId = dataToUpdate.add_member_id;
        try {
            // Chama API específica para adicionar membro
            const updatedTask = await requestAddMember(currentEditingTaskId, memberId);
            
            if (updatedTask) {
                console.log("✅ Membro adicionado com sucesso!");
                // Atualiza o card (para mostrar o avatar lá fora também)
                updateTaskCardInDOM(updatedTask);
            }
        } catch (error) {
            console.error("Erro ao adicionar membro:", error);
            alert("Erro ao adicionar membro.");
            // Opcional: Reverter visualmente (remover a bolinha do modal)
        }
        return; // Sai da função
    }

    // --- CASO 3: Remover Membro ---
    if (dataToUpdate.hasOwnProperty('remove_member_id')) {
        const memberId = dataToUpdate.remove_member_id;
        try {
            // Chama API específica para remover membro
            const updatedTask = await requestRemoveMember(currentEditingTaskId, memberId);
            
            if (updatedTask) {
                console.log("🗑️ Membro removido com sucesso!");
                updateTaskCardInDOM(updatedTask);
            }
        } catch (error) {
            console.error("Erro ao remover membro:", error);
            alert("Erro ao remover membro.");
        }
        return; // Sai da função
    }

    // --- CASO 4: Update Genérico (Título, Descrição, Data, etc.) ---
    try {
        const updatedTask = await requestUpdateTask(dataToUpdate, currentEditingTaskId);
        
        if (updatedTask) {
            updateTaskCardInDOM(updatedTask);
            console.log("✨ Tarefa atualizada!");
        }
    } catch (error) {
        console.error("Erro no autosave:", error);
    }
}


async function initializeBoard() {
    const projectId = getProjectIdFromUrl();    

    if (!projectId) {
         console.log("sem projeto id");   
        return;
    }

    try {
        const response = await fetch(`/api/projetos/${projectId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status}`);
        }
        const boardData = await response.json();
        console.log(boardData);
        
        console.log('✨👣GERAL', boardData);
        
        renderHeader(boardData.project, boardData.members);
        renderMembersSidebar(boardData.members, boardData.columns); 
        renderColumns(boardData.columns);
        populateModalSelectors(boardData.columns, boardData.categories, boardData.members);
        
        addCardClickListeners();

        setupDropdownLogic()
    
    const catTrigger = document.getElementById('categoryTrigger');
    const catDropdown = document.getElementById('categoryDropdown');
    const statTrigger = document.getElementById('statusTrigger');
    const statDropdown = document.getElementById('statusDropdown');
    var searchInput = document.querySelector(".categorySearchInput")
    // Toggle Categoria
    catTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(); // Fecha outros
        catDropdown.classList.toggle('dropdown-active');
        // Foca no input se abriu
        if(catDropdown.classList.contains('dropdown-active')) {
            document.querySelector('.categorySearchInput').focus();
        }
    });

    // Toggle Status
    statTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        statDropdown.classList.toggle('dropdown-active');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        // Se o clique não foi dentro de nenhum dropdown ou gatilho
        if (!e.target.closest('.categoryContainer') && !e.target.closest('.statusContainer')) {
            closeAllDropdowns();
        }
    });

    function closeAllDropdowns() {
        catDropdown.classList.remove('dropdown-active');
        statDropdown.classList.remove('dropdown-active');
    }

       // Função Global chamada pelo onclick do HTML gerado
    window.selectCategory = async function(element) {
        const name = element.innerText;
        const color = element.dataset.color;
        const textColor = element.dataset.text;
        const id = element.getAttribute("data-category");

        // Atualiza o gatilho visualmente
        catTrigger.style.backgroundColor = color;
        catTrigger.style.color = textColor;
        catTrigger.querySelector('.categoryNameText').innerText = name;

        triggerUpdate({ categoria_id: id });

        console.log(`Categoria Selecionada ID: ${id}`); // Aqui você chamaria sua API update
        closeAllDropdowns();
    };

    window.selectStatus = function(element) {
        console.log(element);
        
        const name = element.innerText;
        const id = element.getAttribute("data-status");

        // Atualiza o gatilho
        statTrigger.querySelector('.statusNameText').innerText = name;

        triggerUpdate({ status_id: id });

        console.log(`Status Selecionado ID: ${id}`); // Aqui você chamaria sua API update
        closeAllDropdowns();
    };

    // --- 4. FILTRO DE BUSCA (CATEGORIA) ---
    // const searchInput = document.querySelector('.categorySearchInput');
    // searchInput.addEventListener('input', (e) => {
    //     const term = e.target.value.toLowerCase();
    //     const options = document.querySelectorAll('.category-option');
        
    //     options.forEach(opt => {
    //         const text = opt.innerText.toLowerCase();
    //         opt.style.display = text.includes(term) ? 'flex' : 'none';
    //     });
    // });

     searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita reload de form se houver
            const categoryName = searchInput.value.trim();
            console.log(categoryName);
            
            if (!categoryName) return;

            const colorPair = getRandomColor();
            // Dados da nova categoria (pode gerar cor aleatória ou padrão)
            const dataNewCategory = {
                nome: categoryName,
                projeto_id: currentProjectId,
                cor_fundo: colorPair.bg, // Ex: Azul padrão
                cor_texto: colorPair.text
            };

            console.log(dataNewCategory);

            // Chama sua função de criar
            const newCategory = await requestCreateCategory(dataNewCategory);

            if (newCategory) {
                // 1. Cria o HTML da nova opção
                const textColor = newCategory.cor_texto || '#fff';

                const newOptionHTML = `
                    <div class="option-item categoryOption" 
                         data-category="${newCategory.id}"
                         data-color="${newCategory.cor_fundo}"
                         data-text="${textColor}"
                         onclick="selectCategory(this)">
                        <div class="categoryBadge" style="background-color: ${newCategory.cor_fundo}; color: ${textColor}; padding: 2px 8px; border-radius: 4px; pointer-events: none;">
                            <p style="margin: 0; font-size: 13px;">${newCategory.nome}</p>
                        </div>
                    </div>
                `;

                // 2. Anexa na lista
                const wrapper = document.querySelector('.categoryOptionsWrapper');
                wrapper.insertAdjacentHTML('beforeend', newOptionHTML);

                // 3. Limpa o input e reseta o filtro visual
                searchInput.value = '';
                const options = document.querySelectorAll('.categoryOption');
                options.forEach(opt => opt.style.display = 'flex');

                // 4. (Opcional) Seleciona automaticamente a categoria criada
                // const createdElement = wrapper.lastElementChild;
                // selectCategory(createdElement);
            }
        }
    });

    
const createSubtaskBtn = document.querySelector(".createSubtasks"); // Ajustei o seletor para sua classe// Ajustei para o container correto

createSubtaskBtn.addEventListener("click", () => {
    console.log("click");
    
    // HTML da linha de edição (input visível)
    const newTaskHTML = `
        <div class="subtask editing">
            <div class="checkboxAndNameContainer">
                <input class="subtaskCheckbox" type="checkbox" disabled> <!-- Desabilitado enquanto cria -->
                <span class="checkboxCustom">
                    <svg class="checkIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <input class="insertNameInput" type="text" placeholder="Nova subtarefa" autofocus>
            </div>
        </div>`;

    // Insere no final da lista
    subtaskContainer.insertAdjacentHTML("beforeend", newTaskHTML);
    
    // Pega a referência do elemento criado
    const newSubtaskRow = subtaskContainer.lastElementChild;
    const inputField = newSubtaskRow.querySelector(".insertNameInput");

    // Foca no input
    inputField.focus();

    // Configura os eventos de salvar (Enter/Blur)
    setListenerandConversion(newSubtaskRow, inputField);
});

function setListenerandConversion(newSubtaskRow, inputField) {
    let isSaving = false; // Flag para evitar duplicidade (Enter + Blur)

    const saveAction = async () => {
        if (isSaving) return; // Se já está salvando, ignora
        
        const subtaskName = inputField.value.trim();

        if (!subtaskName) {
            // Se estiver vazio, remove a linha visualmente e para
            newSubtaskRow.remove();
            return;
        }

        isSaving = true; // Bloqueia novas chamadas
        inputField.disabled = true; // Desabilita input visualmente para dar feedback

        try {
            // 1. CHAMA A API (Usa a variável global currentEditingTaskId)
            const savedSubtask = await requestCreateSubTask(currentEditingTaskId, subtaskName);

            if (savedSubtask) {
                // 2. Se deu certo, converte para visual final usando os dados reais do banco
                convertToFinalSubtask(newSubtaskRow, savedSubtask);
            } else {
                // Se falhou (retornou null), destrava para tentar de novo ou remove
                inputField.disabled = false;
                inputField.focus();
                isSaving = false; 
            }
        } catch (error) {
            console.error(error);
            newSubtaskRow.remove(); // Remove em caso de erro crítico
        }
    };

    // Evento ENTER
    inputField.addEventListener("keypress", async (event) => {
        if (event.key === "Enter") {
            await saveAction();
        }
    });

    // Evento BLUR (Clicar fora)
    inputField.addEventListener("blur", async () => {
        // Pequeno delay para garantir que não foi um Enter que causou o blur
        setTimeout(() => {
            if (document.body.contains(newSubtaskRow) && !newSubtaskRow.classList.contains('saved')) {
                saveAction();
            }
        }, 100);
    });
}

function convertToFinalSubtask(tempRowElement, subtaskData) {
    // subtaskData deve conter { id, titulo, status_id, ... }

    const isChecked = subtaskData.status_id === 1 ? 'checked' : '';
    
    const finalSubtaskHTML = `
        <div class="subtask" data-subtask-id="${subtaskData.id}">
            <div class="checkboxAndNameContainer">
                <input class="subtaskCheckbox" type="checkbox" ${isChecked}>
                
                <span class="checkboxCustom">
                    <svg class="checkIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>

                <span class="subtaskName">${subtaskData.titulo}</span>
            </div>
            <svg class="deleteSubtask" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </div>
    `;

    // Cria um elemento temporário para gerar o DOM
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = finalSubtaskHTML.trim();
    const finalElement = tempContainer.firstElementChild;

    // Substitui a linha de edição (input) pela linha final (texto)
    tempRowElement.replaceWith(finalElement);
    
    // Adiciona funcionalidades aos novos elementos
    addDeleteListener(finalElement);
    
    // Se você tiver uma função para ouvir o click do checkbox, chame aqui:
    // addCheckEvent(finalElement); 
}

function addDeleteListener(subtaskElement) {
    const deleteIcon = subtaskElement.querySelector(".deleteSubtask");
    const subtaskId = subtaskElement.getAttribute("data-subtask-id");

    if (deleteIcon) {
        deleteIcon.addEventListener("click", async () => {
            if(confirm("Deseja excluir esta subtarefa?")) {
                try {
                    // Chame sua API de delete aqui se tiver
                    // await requestDeleteSubTask(subtaskId); 
                    subtaskElement.remove(); 
                } catch (e) {
                    alert("Erro ao excluir");
                }
            }
        });
    }
}


const optionChat = document.querySelector('.option-chat');
const optionBoard = document.querySelector('.option-board');

const mainChat = document.querySelector('.main-content-chat')
const mainBoard = document.querySelector('.main-content')

optionChat.addEventListener('click', () => {
    optionChat.classList.add("selected");
    optionBoard.classList.remove("selected");

    
    mainChat.classList.remove('display-none')
    mainBoard.classList.add('display-none')

    loadChatMessages()
});

optionBoard.addEventListener('click', () => {
    optionChat.classList.remove("selected");
    optionBoard.classList.add("selected");

    
    mainChat.classList.add('display-none')
    mainBoard.classList.remove('display-none')
});

const messageInput = document.querySelector('.writeMessageInput');


if (messageInput) {
    messageInput.addEventListener('keypress', (event) => {
        // Verifica se a tecla pressionada foi "Enter"
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita quebra de linha se for textarea (opcional)
            requestSendMessage();
        }
    });
}

async function requestSendMessage(){
    const text = messageInput.value.trim(); // Pega o valor e remove espaços extras

    // Validação: não envia se estiver vazio
    if (!text) return;
    console.log("1", text);
    
    try {
        // URL da sua rota (ajuste conforme seu padrão)
        const url = `${API_BASE_URL}/projetos/${currentProjectId}/mensagens`;
         console.log("2", url);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: text
            })
        });

         console.log("3", response);

        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao enviar mensagem');
        }

        const newMessage = await response.json();

        // 1. Limpa o input para a próxima mensagem
        messageInput.value = '';

        const socketPayload = {
            ...newMessage,           // Espalha os dados da mensagem (id, conteudo, usuario_id, etc)
            projectId: currentProjectId // Adiciona explicitamente o ID da sala
        };

        socket.emit('chatMessage', socketPayload);

        console.log("Mensagem enviada com sucesso:", newMessage);

    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Não foi possível enviar a mensagem.");
    }
}

const currentUserId = localStorage.getItem('userId'); 

async function loadChatMessages() {
    console.log("ENtrouuuuuuu");
    
    const chatContainer = document.querySelector('.messagesContainer');
    
    // Validação básica para evitar erros se a página não tiver chat
    if (!chatContainer || typeof currentProjectId === 'undefined') return;

    try {
        // Limpa o chat antes de carregar (opcional)
        chatContainer.innerHTML = ''; 
        
        // 1. Busca as mensagens na API
        const response = await fetch(`${API_BASE_URL}/projetos/${currentProjectId}/mensagens`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Pega o token direto do localStorage para autenticação
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            // Se o token expirou ou é inválido, talvez redirecionar para login?
            if (response.status === 401) {
                alert("Sessão expirada. Faça login novamente.");
                window.location.href = '../html/login.html'; // Ajuste o caminho
                return;
            }
            throw new Error('Falha ao buscar mensagens');
        }

        const messages = await response.json();

        // 2. Itera sobre as mensagens e renderiza cada uma na ordem recebida
        messages.forEach(message => {
            console.log("Mensagem: ", message);
            
            appendMessageToChat(message);
        });

        // 3. Rola para o final para mostrar as mensagens mais recentes
        scrollToBottom();

    } catch (error) {
        console.error("Erro ao carregar chat:", error);
        chatContainer.innerHTML = `<p class="errorChat">Não foi possível carregar o histórico.</p>`;
    }
}

socket.on('chatMessage', (dataFromServer) => {
    console.log("Mensagem recebida do servidor:", dataFromServer);

    // O servidor (server.js) está mandando um objeto 'data' genérico.
    // Sua função 'appendMessageToChat' espera uma estrutura específica (message.usuario.nome, etc).
    // Aqui fazemos a adaptação dos dados para casar com o que a função espera.
    
    const messageFormatted = {
        usuario_id: dataFromServer.usuario_id,       // Mapeia userId -> usuario_id
        conteudo: dataFromServer.conteudo,        // Mapeia message -> conteudo
        data_envio: new Date(),                  // Define data atual ou usa dataFromServer.time
        usuario: {
            nome: dataFromServer.usuario.nome,       // Mapeia username -> usuario.nome
            avatar: dataFromServer.usuario.foto_perfil || ''  // Avatar (se vier do server)
        }
    };

    // Chama sua função de renderização
    appendMessageToChat(messageFormatted);

    // Auto-scroll para o final do chat
    const chatContainer = document.querySelector('.messagesContainer');
    if (chatContainer) {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
});


function appendMessageToChat(message) {
    const chatContainer = document.querySelector('.messagesContainer');
    if (!chatContainer) return;

    // --- NOVA LÓGICA: Verificar remetente anterior ---
    const lastMessage = chatContainer.lastElementChild;
    let isSameUser = false;
    
    // Verifica se existe mensagem anterior e compara os IDs (usando dataset que adicionaremos abaixo)
    if (lastMessage && lastMessage.dataset.userId === String(message.usuario_id)) {
        isSameUser = true;
    }
    // -------------------------------------------------

    const messageInfo = document.createElement('div');
    messageInfo.className = 'messageContainerInfo';
    
    // Guarda o ID no elemento para a próxima comparação
    messageInfo.dataset.userId = message.usuario_id;

    // Lógica para adicionar classe 'myMessage'
    if (currentUserId && String(message.usuario_id) === String(currentUserId)) {
        messageInfo.classList.add('myMessage');
    }

    // Tratamento de dados (Fallback seguro)
    const userName = message.usuario ? message.usuario.nome : 'Usuário';
    
    // Lógica de Avatar
    let userAvatar = message.usuario && message.usuario.avatar ? message.usuario.avatar : ''; 
    if (userAvatar === '') {
        if (message.usuario && message.usuario.profile && message.usuario.profile.foto_perfil) {
             userAvatar = message.usuario.profile.foto_perfil;
        }
    }

    const conteudo = message.conteudo || message.content || ""; 
    
    // Formatação da hora
    let time = '--:--';
    if (message.data_envio || message.created_at) {
        const dateRaw = message.data_envio || message.created_at;
        const dateObj = new Date(dateRaw);
        if (!isNaN(dateObj)) {
            time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    // --- CONSTRUÇÃO DO HTML CONDICIONAL ---
    
    // 1. Avatar: Se for o mesmo usuário, usamos visibility: hidden para manter o espaçamento sem mostrar a imagem
    const avatarStyle = userAvatar ? `background-image: url('${userAvatar}');` : 'background-color: #ccc;';
    const avatarHTML = isSameUser 
        ? `<div class="userProfileChat" style="visibility: hidden;"></div>` 
        : `<div class="userProfileChat" style="${avatarStyle} background-size: cover; background-position: center;"></div>`;

    // 2. Cabeçalho (Nome): Se for o mesmo usuário, não mostramos o nome, apenas a hora (opcional)
    let headerHTML = '';
    if (isSameUser) {
        // Se for continuação, não mostra o nome, talvez nem a hora se quiser ultra compacto,
        // mas aqui mantive a hora para referência.
        headerHTML = `
            <div class="messageOwnerAndTime"> <!-- Ajuste para alinhar hora se necessário -->
                <p class="messageTime">${time}</p>
            </div>`;
    } else {
        headerHTML = `
            <div class="messageOwnerAndTime">
                <p class="ownerMessage">${userName}</p>
                <p class="messageTime">${time}</p>
            </div>`;
    }

    messageInfo.innerHTML = `
        <div class="userProfileChatContainer">
            ${avatarHTML}
        </div>
        <div class="messageContainer" ${isSameUser ? 'style="margin-top: 2px;"' : ''}> <!-- Margem menor se for agrupado -->
            ${headerHTML}
            <div class="message">
                <p>${conteudo}</p>
            </div>
        </div>
    `;

    chatContainer.appendChild(messageInfo);
}

function scrollToBottom() {
    const chatContainer = document.querySelector('.messagesContainer');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

        const addColumn = document.querySelector('.addColumnHeader')
        console.log(addColumn);

        addColumn.addEventListener('click',  () => {
            createColumnHtml(addColumn)
        })


    } catch (error) {
        console.error(error);
    }
    
}

initializeBoard()

function populateModalSelectors(columns, categories, members) {
    // 1. Encontra TODOS os containers de status e categoria na página.
    console.log("categorias do projeto: ", categories);
    console.log("colunas:", columns);
    
    // Alvo para as opções de Status (dentro dos modais de status)
    const allStatusContainers = document.querySelectorAll('.statusOptionsWrapper'); 
    console.log(allStatusContainers);
    
    
    // Alvo para as opções de Categoria (Compatível com a sua estrutura: .categoryOptionsWrapper)
    const allCategoriesContainers = document.querySelectorAll('.categoryOptionsWrapper'); 

    const statusHtml = columns.map((col, index) => {
        const titleClass = col.title.toLowerCase().replace(/[\sçã]/g, '');
        return `
            <div class="option-item status-option ${titleClass}Status ${index === 0 ? 'statusSelected' : ''}" data-status="${col.id}" onclick="selectStatus(this)">
                <span>${col.title}</span>
            </div>
        `;
    }).join('');

    // --- 3. Geração do HTML de Categorias (Novo Formato Visual) ---
    const categoriesHtml = categories.map((cat, index) => {
        console.log("Cat:",cat);
        
        const categoryClass = cat.nome.toLowerCase().replace(/\s/g, '') + 'Category';
        return `
            <div class="categoryOption ${categoryClass}" data-category="${cat.id}">
                <div class="categoryBadge" style="background-color: ${cat.cor_fundo};">
                    <p style="color: ${cat.cor_texto}">${cat.nome}</p>
                </div>
            </div>
        `;
    }).join(''); 

     const allMembersContainers = document.querySelectorAll('.membersOptionsWrapper');
    allMembersContainers. innerHTML = ''

    if (members && members.length > 0) {
        const membersHtml = members.map(member => {
            console.log(member);
            
            return `
                <div class="memberOption" 
                     data-id="${member.id}" 
                     data-name="${member.nome}" 
                     data-avatar="${member.avatarUrl}" 
                     onclick="selectMember(this)"
                     style="display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-radius: 6px;">
                     
                    <!-- Avatar -->
                    <div class="memberAvatarOption" 
                         style="width: 24px; height: 24px; border-radius: 50%; background-image: url('${member.avatarUrl}'); background-size: cover; background-position: center; background-color: #e5e7eb;">
                    </div>
                    
                    <!-- Info -->
                    <div style="display:flex; flex-direction:column;">
                        <span class="memberNameOption" style="font-size: 13px; font-weight: 500; color: #374151;">${member.nome}</span>
                        <span class="memberRoleOption" style="font-size: 11px; color: #9ca3af;">${member.funcaoNoProjeto || ''}</span>
                    </div>
                </div>
            `;
        }).join('');

        allMembersContainers.forEach(container => {
            console.log("onoooooooooooooasiçvkuçhb",container);
            
            container.innerHTML = membersHtml;
        });
    } else {
        // Fallback se não houver membros
        allMembersContainers.forEach(container => {
            container.innerHTML = '<div style="padding:10px; font-size:12px; color:#999;">Nenhum membro encontrado</div>';
        });
    }

    // --- 4. Inserção no DOM ---
    
    // Popula o Status
    allStatusContainers.forEach(container => {
        container.innerHTML = statusHtml; 
    });
    
    // Popula a Categoria
    allCategoriesContainers.forEach(container => {
        container.innerHTML = categoriesHtml;
    });

    // IMPORTANTE: Após popular, você precisa anexar os event listeners
    // Ex: addStatusListeners(); 
    // Ex: addCategoryListeners(); 
}

function toggleCategoryModal (){
    selectCategoryModal.classList.toggle("selectCategoryHidden")
    createNewCategoryInput.focus()
}

function criarOptionsColunas(columns){
    const modalOptions = document.querySelector('.selectStatusModal');

     columns.forEach(column => {
        const option = ` <div class="statusOption toDoStatus statusSelected" data-status="${column.id}">
                                <div class="statusBadge toDoBadge">
                                    <p>A fazer </p>
                                </div> <!-- toDoCategory  -->
                            </div>`

        modalOptions.appendChild(option);
        
     });

     return
}

function getProjectIdFromUrl() {
    try {
        const pathParts = window.location.pathname.split('/');
        // Encontra o ID que vem depois de "projetos"
        const projectIndex = pathParts.indexOf('projetos');
        if (projectIndex !== -1 && pathParts.length > projectIndex + 1) {
            return pathParts[projectIndex + 1];
        }
        return null;
    } catch (e) {
        return null;
    }
}

function moveTaskToColumn(taskId, newColumnId) {
    // Passo A: Encontre o card da tarefa na tela
    const taskCardElement = document.querySelector(`.task-card-draggable[data-task-id="${taskId}"]`);

    // Passo B: Encontre a div da NOVA coluna para onde o card deve ir
    // (Adapte '.tasks-column' para a classe correta da sua coluna)
    const newColumnElement = document.querySelector(`.column[data-column-id="${newColumnId}"]`);

    // Passo C: Mova o elemento
    if (taskCardElement && newColumnElement) {
        // .appendChild() remove o card da coluna antiga e o adiciona na nova
        newColumnElement.appendChild(taskCardElement);
    } else {
        console.warn(`Não foi possível mover o card ${taskId} para a coluna ${newColumnId} no DOM.`);
    }
}

async function saveTaskChanges() {
        const editModal = document.querySelector('#editTaskModal');
        const filter = document.querySelector(".filterEd")


        const editTaskTitleEl = editModal.querySelector('.invisibleTaskNameInput').value;
        
          const dateInput = document.querySelector(".invisibleDateInput").value; // Ex: "23/10/2025"
        let dateToEnd = null;

        if (dateInput) {
            // O locale 'pt' do flatpickr usa o formato "DD/MM/YYYY"
            // Vamos dividir por "/" em vez de "."
            const parts = dateInput.split('/'); 
            if (parts.length === 3) {
                // Converte de DD/MM/YYYY para YYYY-MM-DD (formato do MySQL)
                dateToEnd = `${parts[2]}-${parts[1]}-${parts[0]}`; 
            } else {
                console.warn(`Formato de data inesperado recebido: ${dateInput}. A data de término será nula.`);
            }
        }

        const editCategoryId = editModal.querySelector(".categorySelected").getAttribute('data-category');
        const editStatusId = editModal.querySelector(".statusSelected").getAttribute('data-status');
        const taskId = editModal.querySelector('.taskId').getAttribute('task-id');

        const dataToUpdate = {
            data_termino: dateToEnd, // Agora envia "2025-10-23" ou null
            titulo: editTaskTitleEl,
            status_id: 1,
            categoria_id: editCategoryId,
            coluna_id: editStatusId, 
        };

        

        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate)
            });
            if (!response.ok) throw new Error(await response.json().message);

            const updatedTask = await response.json();
            
            // 5. Atualiza o card na UI e fecha o modal
            updateTaskCardInDOM(updatedTask);
            moveTaskToColumn(taskId, editStatusId);// Dentro do seu boardPageApi.js

            filter.classList.remove("filterOn")
            editModal.classList.remove('modalOn'); // (Ajuste a sua classe 'active')
            showSuccessModal("Tarefa atualizada!");

        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        }
    }

async function fetchTaskDetails(taskId) {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
        if (!response.ok) {
            const errorData = await response.json();            
            throw new Error(errorData.message || `Erro ao listar dados da tarefa ${response.status}`);
        }

        return await response.json();
}

 async function deleteTask() {
        if (!currentEditingTaskId) return;
        
        if (!confirm("Tem a certeza que quer apagar esta tarefa? Esta ação não pode ser revertida.")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${currentEditingTaskId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                 // Tenta ler a mensagem de erro se o status não for 204
                if (response.status !== 204) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
            }

            // 6. Remove o card da UI e fecha o modal
            const taskCard = document.querySelector(`.task-card-draggable[data-task-id="${currentEditingTaskId}"]`);
            if (taskCard) taskCard.remove();
            
            editModal.classList.remove('active'); // (Ajuste a sua classe 'active')
            showSuccessModal("Tarefa apagada.");
            currentEditingTaskId = null;

        } catch (error) {
            alert("Erro ao apagar: " + error.message);
        }
    }

function renderHeader(project, members) {
        console.log(project);
    
        if (projectTitleEl) {
            projectTitleEl.textContent = project.title;
        }
        
        if (membersHeaderContainer) {
            // Limpa os ícones estáticos do HTML
            membersHeaderContainer.innerHTML = ''; 
            
            // Adiciona os 3 primeiros membros
            members.slice(0, 3).forEach(member => {
                const memberIcon = document.createElement('div');
                memberIcon.className = 'memberIcon';
                memberIcon.style.backgroundImage = `url(${member.avatarUrl})`;
                memberIcon.title = member.nome; // Texto que aparece ao passar o rato
                membersHeaderContainer.appendChild(memberIcon);
            });

            // Adiciona a contagem "+X" se houver mais de 3 membros
            if (members.length > 3) {
                const membersQuantity = document.createElement('div');
                membersQuantity.className = 'membersQuantity';
                membersQuantity.textContent = `+${members.length - 3}`;
                membersHeaderContainer.appendChild(membersQuantity);
            }
        }
    }

function renderMembersSidebar(members, columns) {
    if (!membersSidebarContainer) return;

    // Limpa o conteúdo estático
    membersSidebarContainer.innerHTML = '';

    members.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'memberInfo';
        memberDiv.innerHTML = `
            <img class="memberPhoto" src="${member.avatarUrl}" alt="${member.nome}">
            <p class="memberName">${member.nome}</p>
        `;
        // Nota: O seu JSON não fornece tarefas agrupadas por membro.
        // Para implementar a lista de tarefas abaixo de cada membro,
        // o seu backend precisaria de enviar esses dados ou o JS
        // precisaria de filtrar todas as tarefas.
        // Por agora, vamos manter simples e apenas listar os membros.
        membersSidebarContainer.appendChild(memberDiv);
    });
}

function updateTaskCardInDOM(updatedTask) {
    console.log(updatedTask.id);
    
        const taskCard = document.querySelector(`div[data-task-id="${updatedTask.id}"]`); 
        console.log("☁️taskCard", taskCard);
        
        if (taskCard) {
            // Recria o HTML para o card atualizado
            const newTaskHtml = createTaskHtml(updatedTask);
            // Substitui o card antigo pelo novo
            taskCard.outerHTML = newTaskHtml;
            // Re-ativa os handlers para o card que acabou de ser substituído
            // addDragAndDropHandlers();
            addCardClickListeners();
        }
    }

function addCardClickListeners() {
    const tasks = document.querySelectorAll('.task-card-draggable');
    console.log(tasks);
    
    tasks.forEach(taskCard => {
        // Remove listener antigo para evitar duplicados
        taskCard.onclick = null; 
        // Adiciona o novo listener
        taskCard.onclick = (e) => {
            // Impede que o clique seja acionado se for o início de um 'drag'
            if (e.target.closest('a') || taskCard.classList.contains('opacity-50')) {
                return; 
            }

            const taskId = e.currentTarget.dataset.taskId;
            console.log(taskId);
            
            openEditModal(taskId);
        };
    });
}

async function openEditModal(taskId) {
    const editModal = document.querySelector('.addTaskModal');
    const filterEd = document.querySelector('.filter'); // Verifique se a classe é .filter ou .filterEd no seu HTML
    
    currentEditingTaskId = taskId; 
    
    // Abre o modal
    editModal.classList.add('modalOn'); 
    if(filterEd) filterEd.classList.add('filterOn');

    // Elementos do DOM
    const editTaskTitleEl = editModal.querySelector('.invisibleTaskNameInput');
    const editDateValueEl = editModal.querySelector('.dateValue');
    const description = editModal.querySelector('.descriptionInput'); 
    const editSubtaskListEl = document.querySelector('.listSubtasks');
    const taskIdDiv = document.querySelector(".taskId"); // Se você tiver esse elemento escondido

    try {
        // 1. Busca os dados atualizados
        const taskData = await fetchTaskDetails(taskId);
        console.log("Dados carregados:", taskData);
        
        // 2. Preenche os campos principais
        if(taskIdDiv) taskIdDiv.setAttribute("task-id", taskData.id);
        
        editTaskTitleEl.value = taskData.titulo || ""; // Use value para inputs
        // Se for um elemento de texto (span/h1), use textContent. Se for input, value.
        // editTaskTitleEl.textContent = taskData.titulo; 
        
        description.value = taskData.descricao || "";
        
        // Formata data
        if (taskData.data_termino) {
            // Ajuste para evitar problemas de fuso horário se necessário, ou use string direta
            const dateObj = new Date(taskData.data_termino);
            editDateValueEl.textContent = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); 
        } else {
            editDateValueEl.textContent = 'Nenhuma data definida';
        }
        
        // 3. Renderiza as Subtarefas
        if (taskData.subTasks && taskData.subTasks.length > 0) {
            editSubtaskListEl.innerHTML = taskData.subTasks.map(subtask => {
                const isChecked = subtask.status_id === 1 ? 'checked' : '';
                return `
                    <div class="subtask" data-subtask-id="${subtask.id}">
                        <div class="checkboxAndNameContainer">
                            <input class="subtaskCheckbox" type="checkbox" ${isChecked} data-subtask-id="${subtask.id}">
                            
                            <span class="checkboxCustom">
                                <svg class="checkIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </span>

                            <span class="subtaskName">${subtask.titulo}</span>
                        </div>
                        <svg class="deleteSubtask" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </div>
                `;
            }).join('');

            // --- PASSO CRUCIAL: REANEXAR OS EVENTOS ---
            // Como usamos innerHTML, os elementos são novos e não têm listeners.
            // Precisamos selecioná-los e adicionar a função de deletar (e check) um por um.
            
            const renderedSubtasks = editSubtaskListEl.querySelectorAll('.subtask');
            renderedSubtasks.forEach(subtaskElement => {
                // 1. Adiciona listener de deletar
                addDeleteListener(subtaskElement);
                
                // 2. (Opcional) Se você tiver função para o checkbox, adicione aqui também
                // addCheckListener(subtaskElement); 
            });

        } else {
            editSubtaskListEl.innerHTML = ''; // Limpa se não houver subtarefas
        }

        // Reativa o autosave para os campos de texto
        setupAutoSave();
        
    } catch (error) {
        console.error("Erro ao carregar os dados da tarefa: ", error);
        alert("Erro ao carregar tarefa.");
        editModal.classList.remove('modalOn');
        if(filterEd) filterEd.classList.remove('filterOn');
    }
}


function renderColumns(columns) {
    if (!boardColumnsContainer) return;

    boardColumnsContainer.innerHTML = ''; // Limpa colunas estáticas

    columns.forEach(column => {
        const columnEl = document.createElement('section');
        columnEl.className = `column ${column.title.toLowerCase().replace(' ', '')}Column`;
        columnEl.dataset.columnId = column.id;
        
        // Gera o HTML de todas as tarefas primeiro
        const tasksHtml = column.tasks.map(task => createTaskHtml(task)).join('');
        console.log("Saiuuuuuuuuuuuu🟨");
        
        const classTaskContainer = column.tasks.length > 0 
            ? `tasksToDoBoard task-list-dropzone` 
            : 'tasksToDoBoard task-list-dropzone noRender';

        columnEl.innerHTML = `
              <div class="actionsColumn">
                                <div class="actions deleteColumnContainer">
                                    <div class="optionsName">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        <span>Deletar</span>
                                    </div>
                                </div>
                            <div class="actions renameColumnContainer">
                                <div class="optionsName">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                                    <span>Renomear</span>
                                </div>
                            </div>
                        </div>
            <div class="columnHeader">
                <div class="statusColumnHeader">
                    <h4>${column.title.toUpperCase()}</h4>
                    <div class="columnTaskQuantity">${column.tasks.length}</div>
                </div>
                    <div class="iconsColumnHeader">
                            <svg class="addTaskToTheColumn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <svg class="seeColumnOptions" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </div>
            </div>

            <div class="${classTaskContainer}">
                ${tasksHtml}
            </div>
        `;

        boardColumnsContainer.appendChild(columnEl);

    });

    const columnAddEl = document.createElement('section');
        columnAddEl.classList.add('addColumn');

        columnAddEl.innerHTML = `
        <div class="addColumnHeader">
                            <div class="statusColumnHeader">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>

                                <h4>Adicionar</h4>
                            </div> <!-- statusColumnHeader -->
                        </div> <!-- columnHeader-->`
    boardColumnsContainer.appendChild(columnAddEl);

}

function createTaskHtml(dataTask) {
    // --- 1. PREPARAÇÃO DOS DADOS ---

    // Badges de Categoria e Prioridade
    const categoriaNome = dataTask.categoryTask ? dataTask.categoryTask.nome : "Geral";
    const categoriaCor = dataTask.categoryTask ? dataTask.categoryTask.cor_fundo : "#cccccc";
    
    // Tag Categoria
    const tagCategoria = `
        <div class="tag" style="background-color: ${categoriaCor};">
            <p>${categoriaNome}</p>
        </div>`;

    // Tag Prioridade (Exemplo simples baseada no texto)
    const prioridade = dataTask.prioridade || "Baixa";
    let prioridadeCor = "#dbeafe"; // Azul (Baixa)
    if(prioridade === 'Alta') prioridadeCor = "#fee2e2"; // Vermelho
    if(prioridade === 'Média' || prioridade === 'Media') prioridadeCor = "#ffedd5"; // Laranja

    const tagPrioridade = `
        <div class="tag" style="background-color: ${prioridadeCor}; color: #333;">
            <p>${prioridade}</p>
        </div>`;


    // --- 2. NOVAS FUNCIONALIDADES (Data, Status, Subtarefas) ---

    // A. Data de Término
    let dateHtml = '';
    if (dataTask.data_termino) {
        console.log(dataTask.data_termino);
        
        const dateObj = new Date(dataTask.data_termino);
        const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        
        // Verifica atraso
        const isLate = new Date() > dateObj;
        const colorStyle = isLate ? 'color: #ef4444; font-weight: bold;' : 'color: #6b7280;';

        dateHtml = `
            <div class="infoBadge" style="display: flex; align-items: center; gap: 4px; font-size: 12px; ${colorStyle}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>${dateStr}</span>
            </div>
        `;
    }

    // B. Status (Texto pequeno)
    // Assume que dataTask.status é um objeto { nome: "Em andamento" } ou string
    const statusNome = dataTask.coluna ? dataTask.coluna.nome : (dataTask.status_nome || "");
    const statusHtml = `
        <div class="infoBadge" style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${statusNome}</span>
        </div>
    `;

    // C. Contador de Subtarefas (Substitui os ícones antigos)
    const subtasks = dataTask.subTasks || [];
    const totalSub = subtasks.length;
    const doneSub = subtasks.filter(s => s.status_id === 1).length;
    
    // Só mostra se tiver subtarefas
    const subtaskHtml = totalSub > 0 ? `
        <div class="subtaskCounter" style="display: inline-flex; height: 25px; align-items: center; gap: 6px; line-height: 1; background: #f3f4f6; padding: 5px 10px; border-radius: 6px; font-size: 12px; color: #4b5563; font-weight: 500;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>${totalSub}</span>
        </div>
    ` : `<div class="subtaskCounter" style="display: inline-flex; height: 25px; align-items: center; gap: 6px; line-height: 1; background: #f3f4f6; padding: 5px 10px; border-radius: 6px; font-size: 12px; color: #4b5563; font-weight: 500;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>0</span>
        </div>`;


    // --- 3. RETORNO DO HTML (Inserindo as variáveis nos lugares certos) ---
    return `
    <div class="tasksToDoBoard task-card-draggable" data-task-id="${dataTask.id}" draggable="true">
        
        <div class="topTaskSection">
            <div class="taskTop">
                <div class="badgesTop" style="display: flex; gap: 5px;">
                    ${tagCategoria}
                    ${tagPrioridade}
                </div>
                
                <div class="taskHeaderIcons">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div> 
            </div> 

            <div class="boardTaskInfo">
                <h4>${dataTask.titulo}</h4>
                <p class="taskDescription"> ${dataTask.descricao || "Sem descrição"} </p>
                
                <!-- NOVA DIV: Informações de Data e Status -->
                <div class="taskInfoBadges" style="display: flex; gap: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0f0f0;">
                    ${dateHtml}
                    ${statusHtml}
                </div>
            </div> 
        </div>

        <div class="taskFooterInfo">
            <div class="taskMetrics">
                <!-- AQUI: Contador de Subtarefas (No lugar dos ícones antigos) -->
                ${subtaskHtml}
            </div>

            <div class="taskMembersandQuantity">
                <div class="taskQuantityMembers">+2</div>
            </div> 
        </div>
    </div>
    `;
}


async function requestCreateTaskOld() {
        // 1. Coleta os dados do seu formulário modal
        const title = document.querySelector(".invisibleTaskNameInput").textContent; 
        if (!title || title.trim() === '') {
            alert("O título da tarefa não pode estar vazio.");
            return; 
        }

        // --- CORREÇÃO DA LÓGICA DE DATA ---
        const dateInput = document.querySelector(".invisibleDateInput").value; // Ex: "23/10/2025"
        let dateToEnd = null;

        if (dateInput) {
            // O locale 'pt' do flatpickr usa o formato "DD/MM/YYYY"
            // Vamos dividir por "/" em vez de "."
            const parts = dateInput.split('/'); 
            if (parts.length === 3) {
                // Converte de DD/MM/YYYY para YYYY-MM-DD (formato do MySQL)
                dateToEnd = `${parts[2]}-${parts[1]}-${parts[0]}`; 
            } else {
                console.warn(`Formato de data inesperado recebido: ${dateInput}. A data de término será nula.`);
            }
        }
        // --- FIM DA CORREÇÃO ---

        const description = document.querySelector(".descriptionInput").value || null; // (Pode buscar de um <textarea> se tiver)
        console.log(description);
        const statusSelected = parseInt(document.querySelector(".statusSelected").getAttribute('data-status'));
        const categorySelected = parseInt(document.querySelector(".categorySelected").getAttribute('data-category'));
        const subtasksNodeList = document.querySelectorAll('.subtaskName');

        const subtaskNames = Array.from(subtasksNodeList).map(subtask => subtask.innerText);
        
        const firstColumnEl = document.querySelector('.column[data-column-id]');
        const defaultColumnId = firstColumnEl ? parseInt(firstColumnEl.dataset.columnId) : 1; 

        // 2. Monta o objeto JSON (Payload)
        const taskData = {
            data_termino: dateToEnd, // Agora envia "2025-10-23" ou null
            projeto_id: parseInt(currentProjectId), 
            titulo: title,
            criador_id: 1, // !!! MOCK: Substitua pelo ID real do usuário logado
            descricao: description,
            status_id: 1,
            categoria_id: categorySelected,
            coluna_id: statusSelected, 
            assignedMemberIds: [], 
            prioridade: "Média", // CORRIGIDO: "Média" com acento
            subTasksNames: subtaskNames // CORRIGIDO: de 'subTasks' para 'subTasksNames'
        };

        try{
            // 3. Envia o 'fetch' para a API
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            console.log("Resposta da api para criar:", response);
            
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao criar a tarefa.');
            }

            const newTask = await response.json();
            console.log("🟩Nova tarefa:", newTask);
            
            // 4a. Gera o HTML para o novo card
            const taskHtml = createTaskHtml(newTask);
            
            // 4b. Encontra o container (lista de tarefas) da coluna correta
            const columnEl = document.querySelector(`.column[data-column-id="${newTask.coluna_id}"]`);
            if (columnEl) {
                // --- CORREÇÃO: Procura pela classe 'task-list-dropzone' ---
                const taskListEl = columnEl.querySelector('.task-list-dropzone');
                taskListEl.classList.remove('noRender');
                
                // 4c. Adiciona o novo card ao final da lista
                // Esta verificação impede o erro 'cannot read properties of null'
                if (taskListEl) {
                    taskListEl.insertAdjacentHTML('beforeend', taskHtml);
                } else {
                    console.error("Não foi possível encontrar o container '.task-list-dropzone' para adicionar a nova tarefa.");
                    return;
                }

                // 4d. Atualiza a contagem de tarefas no cabeçalho da coluna
                const taskCountEl = columnEl.querySelector('.columnTaskQuantity');
                const newCount = taskListEl.children.length;
                taskCountEl.textContent = newCount;

                // 4e. Re-ativa o drag-and-drop para que o novo card também funcione
                // addDragAndDropHandlers();
                closeModalTask();
                addCardClickListeners()
                showSuccessModal("Tarefa criada com sucesso!");
                // 4f. (Opcional) Feche o modal
                // Ex: document.querySelector('.addTaskModal').classList.remove('active');
            } else {
                console.error(`Coluna com ID ${newTask.coluna_id} não encontrada no DOM.`);
            }
            
        } catch(error) {
            console.error("Falha ao criar a tarefa:", error);
            alert("Não foi possível criar a tarefa: " + error.message);
        }
}
    
async function requestCreateTask(){
    const dataDefaultTask = {
        "titulo": "Nova Tarefa",
        "projeto_id": currentProjectId,
        "prioridade": "Media",
        "status_id": 1
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
        const taskHtml = createTaskHtml(newTask);

        return newTask;
        
    }catch(error){
        console.error("Falha ao chamar api para criar tarefa:", error);
        alert("Não foi possível chamar api para criar a tarefa: " + error.message);
        return;
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


async function requestMoveTask(taskId, newColumnId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move`, {
            method: 'PATCH', // Ou 'POST', dependendo de como seu backend foi definido
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                newColumnId: parseInt(newColumnId) // O corpo que você pediu
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao mover tarefa');
        }

        return await response.json(); // Espera-se que retorne a tarefa atualizada

    } catch (error) {
        console.error("Erro na API de mover:", error);
        alert("Não foi possível mover a tarefa: " + error.message);
        return null;
    }
}


function showSuccessModal(message) {
    // Cria o elemento do overlay (fundo)
    const overlay = document.createElement('div');
    overlay.className = 'addTaskModal';
    
    // Cria o conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl p-6 flex flex-col items-center max-w-sm mx-4';

    // Ícone de Sucesso (SVG)
    const iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    `;

    // Mensagem
    const messageEl = document.createElement('h3');
    messageEl.className = 'text-xl font-semibold text-gray-800 mt-4 text-center';
    messageEl.textContent = message;

    // Adiciona o ícone e a mensagem ao modal
    modalContent.innerHTML = iconSvg;
    modalContent.appendChild(messageEl);
    
    // Adiciona o modal ao overlay
    overlay.appendChild(modalContent);
    
    // Adiciona o overlay à página
    document.body.appendChild(overlay);

    // Remove o modal após 2 segundos
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}



const botaoFake = document.querySelector('.activityTitle');

botaoFake.addEventListener('click', requestCreateTask);


async function requestCreateColumn(columnName){
    if(!columnName || columnName.length <= 0) return null;

    try{
        const response = await fetch(`${API_BASE_URL}/projetos/${currentProjectId}/colunas/`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                columnName: columnName
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao mover tarefa');
        }

        return await response.json();
    }catch(error){
        console.error("Erro na API ao criar coluna:", error);
        alert("Não foi criar coluna: " + error.message);
        return null;
    }
}

// --------------- MUDAR MAIN -------------------


// --------------- COLUNA -------------------

function renderSingleColumn(column) {
    // 1. Encontra o botão "Adicionar" (ponto de referência para a inserção)
    const addColumn = document.querySelector('.addColumn'); 
    
    // Inicializa tasks como array vazio para evitar erros, caso não venha da API
    const tasks = column.tasks || []; 
    
    // 2. Cria a nova coluna
    const columnEl = document.createElement('section');
    // Ajusta a classe para usar o título da coluna
    columnEl.className = `column ${column.nome.toLowerCase().replace(/\s/g, '')}Column`;
    columnEl.dataset.columnId = column.id;
    
    // Como não há tarefas, o container começa sem o HTML das tarefas
    const tasksHtml = '';
    const classTaskContainer = 'tasksToDoBoard task-list-dropzone noRender'; // Sempre noRender no início

    // 3. Define o HTML
    columnEl.innerHTML = `
        <div class="actionsColumn">
            <div class="actions deleteColumnContainer">
                <div class="optionsName">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span>Deletar</span>
                </div>
            </div>
            <div class="actions renameColumnContainer">
                <div class="optionsName">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                    <span>Renomear</span>
                </div>
            </div>
        </div>
        
        <div class="columnHeader">
            <div class="statusColumnHeader">
                <h4>${column.nome.toUpperCase()}</h4>
                <div class="columnTaskQuantity">0</div> </div>
            <div class="iconsColumnHeader">
                <svg class="addTaskToTheColumn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <svg class="seeColumnOptions" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </div>
        </div>

        <div class="${classTaskContainer}">
            ${tasksHtml} </div>
    `;
    
    // 4. Insere a nova coluna ANTES do botão "Adicionar"
    if (addColumn) {
        addColumn.before(columnEl);
        // Opcional: Anexar event listeners aqui (Deletar, Renomear)
    } else {
        console.error("Referência '.addColumn' não encontrada para inserção.");
    }
}

async function createColumnHtml(){
    const addColumn = document.querySelector('.addColumn');
    
    const sectionColumn = document.createElement('section');
    sectionColumn.classList.add('column', 'is-creating');
    
    // HTML para o formulário de criação (Input e Cancelar)
    sectionColumn.innerHTML = `
        <div class="columnHeader creating-mode">
            <input 
                type="text" 
                class="new-column-input" 
                placeholder="Nome da coluna"
                maxlength="50"
            />
            <div class="cancel-new-column">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
        </div>
    `;
    
    // Inserção no DOM
    if (addColumn) {
        addColumn.before(sectionColumn); 
    } else {
        console.error("Referência 'addColumn' não encontrada.");
        return;
    }

    const newColumnInput = sectionColumn.querySelector('.new-column-input');
    const cancelButton = sectionColumn.querySelector('.cancel-new-column');

    if (newColumnInput) {
        newColumnInput.focus();

        // --------------------------------------------------------
        // NOVO: EVENT LISTENER PARA CAPTURAR O 'ENTER'
        // --------------------------------------------------------
        newColumnInput.addEventListener('keydown', async(event) => {
            // Verifica se a tecla pressionada é 'Enter' (código 13 ou 'Enter')
            if (event.key === 'Enter') {
                event.preventDefault(); // Impede que o formulário tente enviar (se for um form)
                
                const columnName = newColumnInput.value.trim();
                
                if (columnName) {
                    // Chama a função externa com o nome digitado
                    const response = await requestCreateColumn(columnName);
                    console.log(response);
                    sectionColumn.remove();
                    renderSingleColumn(response)
                    
                    // Opcional: Remova o estado de edição/criação
                    // (Você provavelmente vai querer fazer isso DENTRO de requestCreateColumn 
                    // ou após o sucesso da requisição, mas deixo aqui como exemplo)
                    // sectionColumn.remove(); 
                } else {
                    // Trate o caso em que o nome está vazio
                    alert('O nome da coluna não pode ser vazio.');
                }
            }
        });
    }

    // Configuração do Botão de Cancelar
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            sectionColumn.remove();
            console.log("Criação de coluna cancelada.");
        });
    }

    console.log("Colunha de criação exibida com foco.");
}


// --------------- categoria -------------------

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



// ------------------------ CHAT -----------------------



// -------------------------------------------------------
// OUVINTE DO EVENTO: Escuta quando o servidor manda 'message'
// -------------------------------------------------------













// --------------------- CATEFORIA E STATUS EFEITOS --------------------------



async function requestCreateCategory(dataCategory){
    console.log(dataCategory);
    
    try{
        const response = await fetch(`${API_BASE_URL}/category/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataCategory)
        }); 
        console.log(response);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar a categoria.');
        }
        
        
        const newCategory = await response.json();
        console.log(newCategory);
        return newCategory;

    }catch(error){
        console.error("Falha ao chamar api para criar tarefa:", error);
        alert("Não foi possível chamar api para criar a tarefa: " + error.message);
        return;
    }
}



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




function setupDropdownLogic() {
    // --- A. Lógica do Dropdown de Categoria ---
    const categoryContainer = document.querySelector('.categoryContainer');
    const categoryTrigger = document.getElementById('categoryTrigger');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const searchInput = document.querySelector('.categorySearchInput');
    const optionsWrapper = document.querySelector('.categoryOptionsWrapper');

    if (categoryTrigger && categoryDropdown) {
        // 1. Toggle (Abrir/Fechar)
        categoryTrigger.onclick = (e) => {
            e.stopPropagation(); // Impede que o clique feche imediatamente
            const isActive = categoryDropdown.classList.contains('active');
            
            // Fecha todos outros antes de abrir este (se tiver status dropdown)
            closeAllDropdowns(); 
            
            if (!isActive) {
                categoryDropdown.classList.add('active');
                if (searchInput) {
                    searchInput.value = ''; // Limpa busca
                    setTimeout(() => searchInput.focus(), 100); // Foca no input
                }
            }
        };

        // 2. Filtro de Busca (Input)
        if (searchInput && optionsWrapper) {
            
            // Impede que clicar no input feche o dropdown
            searchInput.onclick = (e) => e.stopPropagation();
        }
    }


    // --- B. Fechar ao clicar fora ---
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.categoryContainer')) {
            if (categoryDropdown) categoryDropdown.classList.remove('active');
        }
        // Repita para Status se aplicar
    });
}

function closeAllDropdowns() {
    document.querySelectorAll('.selectCategoryModal').forEach(el => el.classList.remove('active'));
    // Adicione status aqui se necessário
}


 const categoriesData = [
        { id: 1, nome: 'Trabalho', cor: '#dbeafe', texto: '#1e40af' },
        { id: 2, nome: 'Pessoal', cor: '#fce7f3', texto: '#9d174d' },
        { id: 3, nome: 'Estudos', cor: '#fef3c7', texto: '#92400e' },
        { id: 4, nome: 'Saúde', cor: '#d1fae5', texto: '#065f46' }
    ];

    const statusData = [
        { id: 1, nome: 'A Fazer' },
        { id: 2, nome: 'Em Andamento' },
        { id: 3, nome: 'Concluído' }
    ];

    const prioritiesDB = [
        { id: 'Alta', nome: 'Alta', class: 'priority-badge-alta' },
        { id: 'Media', nome: 'Média', class: 'priority-badge-media' },
        { id: 'Baixa', nome: 'Baixa', class: 'priority-badge-baixa' }
    ];



    

    // --- 3. LÓGICA DE SELEÇÃO ---



    // --------------------------------------------------------------------------------




   //---------------------- Criação de novas subtarefas ----------------------

async function requestCreateSubTask(taskId, subTaskTitle) {
    // Validação simples antes de chamar a API
    if (!taskId || !subTaskTitle.trim()) {
        alert("A subtarefa precisa de um título e uma tarefa pai.");
        return null;
    }

    try {
        // Recupera o token do localStorage (ajuste a chave se o seu for diferente)
        const token = localStorage.getItem('token'); 

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Envia o token para o middleware verificar
            },
            body: JSON.stringify({
                titulo: subTaskTitle
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar subtarefa');
        }

        const newSubTask = await response.json();
        console.log("Subtarefa criada:", newSubTask);
        
        return newSubTask;

    } catch (error) {
        console.error("Erro na API de subtarefa:", error);
        alert("Não foi possível criar a subtarefa: " + error.message);
        return null;
    }
}




function setupDateUpdateLogic() {
    const dateInput = document.querySelector(".invisibleDateInput");
    const dateTrigger = document.querySelector(".selectDate"); // A div clicável
    const dateValueSpan = document.querySelector(".dateValue"); // O texto onde aparece a data

    if (!dateInput || !dateTrigger) return;

    flatpickr(dateInput, {
        locale: "pt",          // Português
        dateFormat: "d/m/Y",   // Formato visual (Brasileiro)
        disableMobile: true,   // Força o calendário customizado mesmo no celular
        allowInput: true,      // Permite digitar se necessário (mas o trigger é click)
        positionElement: dateTrigger, // <--- FIX: Usa a div visível como âncora para o posicionamento
        
        // Conecta o clique na div .selectDate para abrir o calendário
        onReady: (selectedDates, dateStr, instance) => {
            dateTrigger.addEventListener("click", () => {
                instance.open();
            });
        },

        // Função disparada ao selecionar uma data
        onChange: async (selectedDates, dateStr, instance) => {
            
            // 1. Atualização Visual Imediata
            if (selectedDates.length > 0) {
                dateValueSpan.textContent = dateStr; // Mostra "25/10/2025"
                dateValueSpan.style.color = "#111827"; // Deixa o texto mais escuro (ativo)
            } else {
                dateValueSpan.textContent = "Nenhuma data definida";
            }

            // 2. Formata para o Banco de Dados (YYYY-MM-DD)
            // O backend geralmente espera o formato ISO ou Y-m-d
            const dateForDB = selectedDates.length > 0 
                ? instance.formatDate(selectedDates[0], "Y-m-d") 
                : null;

            console.log("📅 Data selecionada:", dateForDB);

            // 3. Atualiza no Banco
            if (typeof currentEditingTaskId !== 'undefined' && currentEditingTaskId) {
                try {
                    // Chama sua função existente de update
                    const updatedTask = await requestUpdateTask(
                        { data_termino: dateForDB }, 
                        currentEditingTaskId
                    );

                    if (updatedTask) {
                        console.log("✅ Data salva com sucesso!");
                        
                        // Opcional: Atualiza o card no quadro (se a função existir)
                        if (typeof updateTaskCardInDOM === 'function') {
                            updateTaskCardInDOM(updatedTask);
                        }
                    }
                } catch (error) {
                    console.error("Erro ao salvar data:", error);
                    // Opcional: Reverter visualmente em caso de erro
                }
            } else {
                console.warn("Nenhuma tarefa selecionada para atualizar.");
            }
        }
    });
}


// --------------------- MODAL ADD MEMBERS TO TASK -------------------------




