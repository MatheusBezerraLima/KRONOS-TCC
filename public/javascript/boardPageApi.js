const API_BASE_URL = '/api';
 const projectTitleEl = document.querySelector('h1.projectName');
const membersHeaderContainer = document.querySelector('.membersIconandQuantity');
const boardColumnsContainer = document.querySelector('.boardColumns');
const membersSidebarContainer = document.querySelector('.members .container-memberTasks');

let currentProjectId = null;


async function initializeBoard() {
    const projectId = getProjectIdFromUrl();
    

    if (!projectId) {
         console.log("sem projeto id");
            
        return;
    }

    try {
        const response = await fetch(`/api/projetos/1`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status}`);
        }
        const boardData = await response.json();

        console.log(boardData);
        
        renderHeader(boardData.project, boardData.members);
        renderMembersSidebar(boardData.members, boardData.columns); 
        renderColumns(boardData.columns);

    } catch (error) {
        console.error(error);
    }
    
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

function renderHeader(project, members) {
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

function renderColumns(columns) {
    if (!boardColumnsContainer) return;

    boardColumnsContainer.innerHTML = ''; // Limpa colunas estáticas

    columns.forEach(column => {
        const columnEl = document.createElement('section');
        columnEl.className = `column ${column.title.toLowerCase().replace(' ', '')}Column`;
        columnEl.dataset.columnId = column.id;
        
        // --- A CORREÇÃO ESTÁ AQUI ---
        // 1. Gera a string HTML de TODAS as tarefas primeiro
        const tasksHtml = column.tasks.map(task => createTaskHtml(task)).join('');

        // 2. Insere a string HTML de uma só vez
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
                    <svg class="addTaskToTheColumn" data-column-id="${column.id}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>

                    <svg class="seeColumnOptions"  data-column-id="${column.id}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div>
            </div>
            <div class="tasksToDoBoard">
                ${tasksHtml} <!-- As tarefas são inseridas aqui como HTML -->
            </div>
        `;

        boardColumnsContainer.appendChild(columnEl);
    });

    // Adiciona a coluna "Adicionar Coluna" de volta
    const addColumnEl = document.createElement('section');
    addColumnEl.className = 'addColumn';
    addColumnEl.innerHTML = `
        <div class="addColumnHeader">
            <div class="statusColumnHeader">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <h4>Adicionar Coluna</h4>
            </div>
        </div>
    `;
    boardColumnsContainer.appendChild(addColumnEl);
}

function createTaskHtml(dataTask){
    return `
    <div class="tasksToDoBoard">
                            <div class="topTaskSection">
                                <div class="taskTop">
                                    <div class="tag">UX/UI</div>
                                    <div class="taskHeaderIcons">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                    </div> <!-- taskHeaderIcons -->
                                </div> <!-- taskTop-->

                                <div class="boardTaskInfo">
                                    <h4>${dataTask.titulo}</h4>
                                    <p class="taskDescription"> Sem descrição </p>
                                    
                                    <div class="progressBarContainer">
                                        <div class="progressBar"></div>
                                        <p>50%</p>
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

async function requestCreateTask() {
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

        const description = null; // (Pode buscar de um <textarea> se tiver)
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
            criador_id: 3, // !!! MOCK: Substitua pelo ID real do usuário logado
            descricao: description,
            status_id: statusSelected,
            categoria_id: categorySelected,
            coluna_id: defaultColumnId, 
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
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao criar a tarefa.');
            }

            const newTask = await response.json();
            console.log("🟩Nova tarefa:", newTask);

            // --- 4. ATUALIZA A UI DINAMICAMENTE ---
            const taskHtml = createTaskHtml(newTask);
            
            const columnEl = document.querySelector(`.column[data-column-id="${newTask.coluna_id}"]`);
            if (columnEl) {
                const taskListEl = columnEl.querySelector('.task-list-dropzone');
                taskListEl.insertAdjacentHTML('beforeend', taskHtml);

                const taskCountEl = columnEl.querySelector('.columnTaskQuantity');
                const newCount = taskListEl.children.length;
                taskCountEl.textContent = newCount;

                addDragAndDropHandlers();
                
                // (Opcional) Feche o modal
                // Ex: document.querySelector('.addTaskModal').classList.remove('active');
            }
            
        } catch(error) {
            console.error("Falha ao criar a tarefa:", error);
            alert("Não foi possível criar a tarefa: " + error.message);
        }
    }
    
initializeBoard()

const botaoFake = document.querySelector('.activityTitle');

botaoFake.addEventListener('click', requestCreateTask);