const API_BASE_URL = '/api';
 const projectTitleEl = document.querySelector('h1.projectName');
const membersHeaderContainer = document.querySelector('.membersIconandQuantity');
const boardColumnsContainer = document.querySelector('.boardColumns');
const membersSidebarContainer = document.querySelector('.members .container-memberTasks');
const addTaskButton = document.querySelector(".addTask")


let currentProjectId = window.location.pathname.split('/').filter(Boolean).pop();

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
    
    // Remove listeners antigos clonando o elemento (truque rápido)
    const newTitleInput = titleInput.cloneNode(true);
    titleInput.parentNode.replaceChild(newTitleInput, titleInput);
    
    newTitleInput.addEventListener('input', () => {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(() => {
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

// Função central que chama sua API e atualiza a tela
// Função central que chama a API e pede para atualizar a tela
async function triggerUpdate(dataToUpdate) {
    if (!currentEditingTaskId) return;
    console.log("🚀🚀🚀🚀🚀🚀",currentEditingTaskId);
    
    console.log("Salvando...", dataToUpdate);

    if (dataToUpdate.hasOwnProperty('status_id')) {
        
        const newColumnId = dataToUpdate.status_id;
        console.log("🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏",newColumnId);
        
        
        // 1. Chama a rota específica de MOVER
        const movedTask = await requestMoveTask(currentEditingTaskId, newColumnId);
        
        if (movedTask) {
            // 2. Move visualmente o card para a nova coluna
            moveTaskToColumn(currentEditingTaskId, newColumnId);
            
            // 3. Atualiza os dados do card (caso a cor ou tags tenham mudado no processo)
            updateTaskCardInDOM(movedTask);
            
            // 4. (Opcional) Atualiza os contadores das colunas visualmente
            updateColumnCounters(); 
        }
        return; // Sai da função, pois já resolvemos o move
    }

    try {
        // 1. Chama a API
        const updatedTask = await requestUpdateTask(dataToUpdate, currentEditingTaskId);
        console.log("✨✨✨✨✨✨✨✨✨✨", updatedTask);
        
        
        if (updatedTask) {
            // 2. REUTILIZAÇÃO: Chama sua função para atualizar o visual do card
            updateTaskCardInDOM(updatedTask);
            console.log("🥲🥲🥲🥲🥲🥲🥲🥲🥲🥲");

            
            // 3. Lógica extra: Se mudou o STATUS, precisa mudar de COLUNA também
            if (dataToUpdate.status_id) {
                 moveTaskToColumn(currentEditingTaskId, dataToUpdate.status_id);
            }
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
        populateModalSelectors(boardData.columns, boardData.categories);
        
        addCardClickListeners();

    } catch (error) {
        console.error(error);
    }
    
}

 function populateModalSelectors(columns, categories) {
        // 1. Encontra TODOS os containers de status nos dois modais
        const allStatusContainers = document.querySelectorAll('.selectStatusModal');
        const AllCategoriesContainers = document.querySelectorAll('.categoryOptionsWrapper');

        // --- 2. Popula o "STATUS" (usando as COLUNAS) ---
        const columnHtml = columns.map((col, index) => `
            <div class="statusOption ${col.title.toLowerCase().replace(/[\sçã]/g, '')}Status ${index === 0 ? 'statusSelected' : ''}" data-status="${col.id}">
                <div class="statusBadge ${col.title.toLowerCase().replace(/[\sçã]/g, '')}Badge">
                    <p>${col.title}</p> 
                </div>
            </div>
        `).join('');

        const categoriesHtml = categories.map((cat, index) => `
        <div class="categoryBadgeContainer" data-category="${cat.id}">
            <div class="categoryBadge" style="background-color: ${cat.cor_fundo}; color: ${cat.cor_texto};"  data-category="${cat.id}">
                <p>${cat.nome}</p>
            </div>
        </div>
        `).join(''); 

        allStatusContainers.forEach(container => container.innerHTML = columnHtml);
        AllCategoriesContainers.forEach(container => container.innerHTML = categoriesHtml);

        addStatusListeners();
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

function criarModais(){
    const addTaskModal = document.createElement('section');
    addTaskModal.classList.add('addTaskModal')

    addTaskModal.innerHTML = `
         <div class="modalTop">
                <button onclick="requestCreateTask()">Criar</button>
                <div class="taskNameContainer">
                    <input type="text" class="invisibleTaskNameInput" placeholder="Nova tarefa" style="display: none;">
                </div> <!-- taskNameContainer -->
                <svg class="closeModalIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div> <!-- modalTop -->
            <div class="formModal">
                <div class="dateFormModal">
                    <div class="dateTitle">
                        <p>Data</p>
                    </div>
                    <div class="formModalInfo">
                        <div class="selectDate">
                            <span class="dateValue">Nenhuma data definida</span>
                        </div>
                        <input type="text" class="invisibleDateInput" style="display: none;">
                    </div>
                </div> <!-- dateFormModal -->

                <div class="modalForm categoryFormModal">
                    <div class="categoryTitle">
                        <p>Categoria</p>
                    </div>
                    <div class="formModalInfo">
                        <div class="selectCategoryModal">
                            <div class="categoryOption designCategory categorySelected" data-category="1">
                                <div class="categoryBadge designBadge">
                                    <p>Design</p>
                                </div> <!-- designBadge  -->
                            </div> <!-- categoryOption designCategory-->

                            <div class="categoryOption backendCategory" data-category="2">
                                <div class="categoryBadge backendBadge">
                                    <p>Backend</p>
                                </div> <!-- backendBadge -->
                            </div> <!-- categoryOption backendCategory -->

                            <div class="categoryOption frontendCategory" data-category="3">
                                <div class="categoryBadge frontendBadge">
                                    <p>Frontend</p>
                                </div> <!-- frontendBadge -->
                            </div> <!--categoryOption frontendCategory-->
                        </div> <!-- selectCategoryModal -->
                    </div> <!-- formModalInfo -->
                </div> <!-- categoryFormModal -->

                <div class="modalForm statusFormModal">
                     <div class="statusTitle">
                        <p>Status</p>
                    </div>
                    <div class="formModalInfo"> 
                        <!-- Caixinha para escolher status do projeto -->
                        <div class="selectStatusModal" id="statusSelector">
                        </div> <!-- selectStatusModal -->
                    </div> <!-- formModalInfo -->
                </div> <!-- categoryFormModal -->

                <div class="atribuitionFormModal">
                    <div class="atribuitionTitle">
                        <p>Atribuições</p>
                    </div>

                    <div class="formModalInfo">
                        <div class="atribuitionMembersModal">
                            <div class="memberModal">
                                <div class="memberIconModal" style="background-color: pink;"></div>
                                <div class="memberIconModal" style="background-color: red;"></div>
                                <div class="memberIconModal" style="background-color: blue;"></div>
                            </div>

                                <div class="addMoreMembersModal">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                </div> <!-- addMoreMembers -->
                        </div> <!-- atribuitionMembersModal -->
                    </div> <!-- formModalInfo -->
                </div> <!-- atribuitionFormModal -->
            </div> <!-- formModal -->

            <div class="activitysTaskModal">
                <div class="sectionsTitleActivitys">
                    <div class="activityTitle activitySectionSelected">
                        <p>Subtarefas</p>
                    </div> <!-- subtasksTitle-->

                    <div class="activityTitle">
                        <p>Comentários</p>
                    </div> <!-- Comentários -->
                </div> <!--sectionsTitleActivitys -->

                <div class="ContainerSubtask">
                    <span class="subtaskQuantitysandButton">
                         Subtarefas 1/20
                         <button class="createSubtasks">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                         </button>
                    </span>

                    <div class="listSubtasks">
                         
                    </div> <!-- subtask -->

                </div> <!-- ContainerSubtask -->

            </div> <!-- activitysTaskModal -->
    `
    document.body.appendChild(addTaskModal)

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
    const editModal = document.querySelector('#editTaskModal');
    const filterEd = document.querySelector('.filterEd');
    const currentEditingTaskId = taskId; 
    editModal.classList.add('modalOn'); 
    filterEd.classList.add('filterOn')

    const editTaskTitleEl = editModal.querySelector('.invisibleTaskNameInput');
    const editDateValueEl = editModal.querySelector('.dateValue');
    const description = editModal.querySelector('.descriptionInput'); 
    const editSubtaskListEl = document.querySelector('.listSubtasks');
    const taskIdDiv = document.querySelector(".taskId")

    try {
        // 1. Busca os detalhes completos da tarefa
        const taskData = await fetchTaskDetails(taskId);

        console.log(taskData);
        

        // 2. Preenche o modal com os dados
        taskIdDiv.setAttribute("task-id", taskData.id);
        editTaskTitleEl.textContent = taskData.titulo;
        editTaskTitleEl.value = taskData.titulo;
        description.value = taskData.descricao;
        editDateValueEl.textContent = taskData.data_termino ? new Date(taskData.data_termino).toLocaleDateString('pt-BR') : 'Nenhuma data definida';
        
        // (Lógica para preencher status, categoria, membros)
        // Exemplo para subtarefas:
        editSubtaskListEl.innerHTML = taskData.subTasks.map(subtask => {
            return `
                <div class="subtask-item" style="display: flex; align-items: center; margin-bottom: 5px;">
                    <input type="checkbox" ${subtask.status_id === 1 ? 'checked' : ''} data-subtask-id="${subtask.id} style="margin-right: 10px;">
                    <span contenteditable="true">${subtask.titulo}</span>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.log("Erro ao carregar os dados da tarefa: " + error.message);
        editModal.classList.remove('modalOn');
        filterEd.classList.remove('filterOn');
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

function createTaskHtml(dataTask){
    console.log(dataTask);
    
    
    const categoriaNome = dataTask.categoryTask ? dataTask.categoryTask.nome : "Nenhuma" ;
    const categoriaCor = dataTask.categoryTask ? dataTask.categoryTask.cor_fundo : "#bbbbbbff" ;
    const taskTitle = dataTask.titulo ? dataTask.titulo : "" ;
    const taskDesc = dataTask.descricao ? dataTask.descricao : "Sem descrição" ;
    console.log("➡️➡️➡️➡️➡️➡️",categoriaNome, taskTitle);

    // 3. Crie a tag UMA VEZ
    const tag = `<div class="tag ${categoriaNome}" style="background-color: ${categoriaCor}";>
                <p>${categoriaNome}</p>
                </div>`;

        return `
        <div class="tasksToDoBoard task-card-draggable" data-task-id="${dataTask.id}"  draggable="true">
                                <div class="topTaskSection">
                                    <div class="taskTop">
                                    ${tag}
                                        <div class="taskHeaderIcons">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                        </div> <!-- taskHeaderIcons -->
                                    </div> <!-- taskTop-->

                                    <div class="boardTaskInfo">
                                        <h4>${taskTitle}</h4>
                                        <p class="taskDescription"> ${taskDesc} </p>
                                        
                                    <div class="progressBarContainer loading">
        <div class="progressBar"></div> 
    </div>
                                    
                                    </div> <!-- boarTaskInfo -->
                                </div> <!--topTaskSection-->

                                <div class="taskFooterInfo">
                                    <div class="taskMetrics">
                                        <div class="commentStatus">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-more-icon lucide-message-circle-more"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                                            <p>0</p>
                                        </div> <!--commentStatus-->
                                        <div class="attachmentStatus">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip-icon lucide-paperclip"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/></svg>
                                            <p>0</p>
                                        </div>
                                    </div> <!--taskMetrics-->

                                    <div class="taskMembersandQuantity">
                                        <div class="memberIconTask" style="background-color: aquamarine;"></div>
                                        <div class="memberIconTask" style="background-color: blueviolet;"></div>
                                        <div class="memberIconTask" style="background-color: blue;"></div>
                                        <div class="taskQuantityMembers">
                                            +2
                                        </div>
                                    </div> <!-- taskMembersandQuantity -->
                                </div> <!--taskFooterInfo-->
                            </div> <!-- tasksToDoBoard -->`
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

initializeBoard()

const botaoFake = document.querySelector('.activityTitle');

botaoFake.addEventListener('click', requestCreateTask);