```js
     data.columns.forEach(column => {
        const columnEl = document.createElement('div');
        columnEl.className = 'w-80 bg-gray-200 rounded-lg p-3 flex-shrink-0';
        columnEl.dataset.columnId = column.id; // Guarda o ID da coluna

        // Conteúdo da coluna
        let tasksHtml = '';
        column.tasks.forEach(task => {
            tasksHtml += `
                <div class="bg-white p-4 rounded-md shadow mb-3 cursor-grab" draggable="true" data-task-id="${task.id}">
                    <h3 class="font-semibold text-gray-800">${task.titulo}</h3>
                    <p class="text-sm text-gray-600 mt-1">${task.descricao}</p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${task.progress}%"></div>
                    </div>
                </div>
            `;
        });

        columnEl.innerHTML = `
            <h2 class="font-bold text-gray-700 mb-4">${column.title} (${column.tasks.length})</h2>
            <div class="task-list space-y-3">
                ${tasksHtml}
            </div>
            <button class="w-full text-gray-500 hover:text-gray-700 mt-2 p-2">+ Adicionar tarefa</button>
        `;
        if (board) board.appendChild(columnEl);
    });
```