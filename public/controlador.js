// A variável 'routes' global não será mais a fonte principal de dados,
// mas pode ser usada temporariamente para armazenar os dados recebidos do servidor para filtragem local.
let currentRoutes = [];

// Funções de comunicação com a API (server.js)

/**
 * Adiciona uma nova rota ao banco de dados através da API.
 * @param {object} rotaData - Os dados da rota a serem enviados.
 * @returns {Promise<object>} - O objeto de resposta da API.
 */
async function adicionarRotaAPI(rotaData) {
    try {
        const response = await fetch('http://localhost:3000/api/rotas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rotaData)
        });

        const result = await response.json();

        if (!response.ok) {
            // Lida com erros da API, como validação ou duplicidade
            throw new Error(result.error || 'Erro desconhecido ao adicionar rota.');
        }

        return result; // Pode conter o ID da nova rota
    } catch (error) {
        console.error('Erro ao adicionar rota na API:', error.message);
        throw error;
    }
}

/**
 * Busca todas as rotas do banco de dados através da API.
 * @returns {Promise<Array<object>>} - Um array de objetos de rota.
 */
async function buscarTodasRotasAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/rotas');
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro desconhecido ao buscar rotas.');
        }

        return result.rotas; // Seu server.js retorna { rotas: [...] }
    } catch (error) {
        console.error('Erro ao buscar todas as rotas da API:', error.message);
        throw error;
    }
}

/**
 * Busca rotas por nome de funcionário através da API.
 * @param {string} nomeFuncionario - O nome do funcionário para filtrar.
 * @returns {Promise<Array<object>>} - Um array de objetos de rota.
 */
async function buscarRotasPorFuncionarioAPI(nomeFuncionario) {
    try {
        const response = await fetch(`http://localhost:3000/api/rotas/funcionario/${encodeURIComponent(nomeFuncionario)}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro desconhecido ao buscar rotas por funcionário.');
        }

        return result.rotas;
    } catch (error) {
        console.error(`Erro ao buscar rotas para o funcionário ${nomeFuncionario} na API:`, error.message);
        throw error;
    }
}

/**
 * Atualiza uma rota existente no banco de dados através da API.
 * @param {number} id - O ID da rota a ser atualizada (ID_ROTA no seu DB).
 * @param {object} dadosAtualizados - Um objeto contendo os campos a serem atualizados.
 * @returns {Promise<object>} - O objeto de resposta da API.
 */
async function atualizarRotaAPI(id, dadosAtualizados) {
    try {
        const response = await fetch(`http://localhost:3000/api/rotas/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dadosAtualizados)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro desconhecido ao atualizar rota.');
        }

        return result;
    } catch (error) {
        console.error(`Erro ao atualizar rota com ID ${id} na API:`, error.message);
        throw error;
    }
}

/**
 * Deleta uma rota do banco de dados através da API.
 * @param {number} id - O ID da rota a ser deletada (ID_ROTA no seu DB).
 * @returns {Promise<object>} - O objeto de resposta da API.
 */
async function deletarRotaAPI(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/rotas/${id}`, {method: 'DELETE'});
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Erro desconhecido ao deletar rota.');
        return result;
    } catch (error) {
        console.error(`Erro ao deletar rota com ID ${id} na API:`, error.message);
        throw error;
    }
}

/**
 * Limpa todas as rotas do banco de dados através da API.
 * @returns {Promise<object>} - O objeto de resposta da API.
*/
async function limparTodasRotasAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/rotas/limpar-todas', {method: 'DELETE'});
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro desconhecido ao limpar todas as rotas.');
        }

        return result;
    } catch (error) {
        console.error('Erro ao limpar todas as rotas na API:', error.message);
        throw error;
    }
}

/**
 * Limpa as rotas de um funcionário específico do banco de dados através da API.
 * @param {string} funcionario - O nome do funcionário cujas rotas serão limpas.
 * @returns {Promise<object>} - O objeto de resposta da API.
 */
async function limparRotasPorFuncionarioAPI(funcionario) {
    try {
        const response = await fetch(`http://localhost:3000/api/rotas/limpar-por-funcionario/${encodeURIComponent(funcionario)}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro desconhecido ao limpar rotas por funcionário.');
        }

        return result;
    } catch (error) {
        console.error(`Erro ao limpar rotas do funcionário ${funcionario} na API:`, error.message);
        throw error;
    }
}

// --- Funções principais do controlador (adaptadas para usar as funções da API) ---

// Função para adicionar uma nova rota
async function addRoute() {
    const rotaData = {
        colaborador: document.getElementById('employee').value,
        endereco: document.getElementById('address').value,
        numero: document.getElementById('number').value,
        complemento: document.getElementById('complement').value,
        funcionario: document.getElementById('employee').value, // Assumindo que 'employee' é 'funcionario'
        submission_id: document.getElementById('submissionId').value, // Novo campo para submissionId
        dataEntrega: document.getElementById('dataEntrega').value,
        prioridade: document.getElementById('prioridade').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        cep: document.getElementById('cep').value,
        observacao: document.getElementById('observacao').value,
        // status, dataCriacao e origem serão definidos no server.js
    };

    // Validação básica
    if (!rotaData.colaborador || !rotaData.endereco || !rotaData.numero || !rotaData.funcionario) {
        showStatus('Campos obrigatórios (colaborador, endereço, número, funcionário) ausentes.', 'error');
        return;
    }

    try {
        await adicionarRotaAPI(rotaData);
        document.getElementById('routeForm').reset();
        showStatus('Rota adicionada com sucesso!', 'success');
        await loadAndDisplayRoutes(); // Recarrega e exibe todas as rotas
    } catch (error) {
        showStatus('Erro ao adicionar rota: ' + error.message, 'error');
    }
}

// Função para carregar e exibir as rotas (substitui loadRoutes e parte de updateRoutesTable)
async function loadAndDisplayRoutes() {
    try {
        currentRoutes = await buscarTodasRotasAPI();
        updateEmployeeFilters(); // Atualiza os filtros com base nos funcionários carregados
        // Redefine os filtros para "todos" ou o padrão após recarregar
        document.getElementById('statusFilter').value = 'pendente'; // Ou 'all' se preferir mostrar tudo inicialmente
        document.getElementById('employeeFilter').value = 'all';
        document.getElementById('searchInput').value = '';
        filterRoutes(); // Chama o filtro para exibir as rotas corretas

        updateCounters(); // Atualiza os contadores
    } catch (error) {
        showStatus('Erro ao carregar rotas: ' + error.message, 'error');
        currentRoutes = []; // Limpa as rotas se houver erro
        updateRoutesTable(); // Limpa a tabela
        updateExecutedRoutesTable();
        updateCounters();
    }
}

// Função para exibir as rotas na tabela (agora usa `currentRoutes` que vem do servidor)
function updateRoutesTable(routesToDisplay = currentRoutes) {
    const tableBody = document.getElementById('routesTableBody');
    tableBody.innerHTML = '';

    const pendingRoutes = routesToDisplay.filter(route => route.status !== 'executado');

    if (pendingRoutes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="9" class="no-routes">Nenhuma rota pendente!</td>';
        tableBody.appendChild(tr);
        return;
    }

    pendingRoutes.forEach((route) => {
        const row = tableBody.insertRow();
        row.className = `route-row status-${route.status || 'pendente'}`;
        // Note: As colunas devem corresponder aos nomes do seu banco de dados
        row.innerHTML = `
            <td>${route.ID}</td>
            <td>${route.funcionario}</td>
            <td>${route.endereco}</td>
            <td>${route.numero}</td>
            <td>${route.complemento || '-'}</td>
            <td>
                <span class="status-badge ${route.status || 'pendente'}">
                    ${route.status === 'executado' ? 'Executado' : 'Pendente'}
                </span>
            </td>
            <td>
                <span class="route-source ${route.origem === 'excel' ? 'excel-source' : 'manual-source'}">
                    ${route.origem === 'excel' ? 'Planilha' : 'Manual'}
                </span>
            </td>
            <td>
                <button onclick="openJotForm('${route.submission_id}', ${route.ID})" class="action-button execute-button">
                    EXECUTAR
                </button>
            </td>
            <td>
                <button onclick="deleteRoute(${route.ID})" class="action-button delete-button">
                    Excluir
                </button>
            </td>
        `;
    });
}

// Função para excluir uma rota
async function deleteRoute(id) {
    if (confirm('Tem certeza que deseja excluir esta rota?')) {
        try {
            await deletarRotaAPI(id);
            showStatus('Rota excluída com sucesso!', 'success');
            await loadAndDisplayRoutes(); // Recarrega e exibe
        } catch (error) {
            showStatus('Erro ao excluir rota: ' + error.message, 'error');
        }
    }
}

// Função para limpar todas as rotas
async function clearAllRoutes() {
    try {
        const response = await fetch('http://localhost:3000/api/rotas/limpar-todas', {method: 'DELETE'});
        if (!response.ok) {
            // Handle non-2xx responses (e.g., 404, 500)
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido ao limpar todas as rotas.');
        }
        const data = await response.json();
        console.log(data.message);
        // Optionally, refresh your UI or perform other actions
    } catch (error) {
        console.error('Erro ao limpar todas as rotas na API:', error.message);
    }
}

// Função para limpar rotas por funcionário
async function clearRoutesByEmployee() {
    const employeeName = document.getElementById('clearEmployeeName').value;

    if (!employeeName) {
        showStatus('Digite o nome do funcionário!', 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja limpar as rotas de ${employeeName}?`)) {
        try {
            await limparRotasPorFuncionarioAPI(employeeName);
            showStatus(`Rotas de ${employeeName} removidas com sucesso!`, 'success');
            document.getElementById('clearEmployeeName').value = ''; // Limpa o input
            await loadAndDisplayRoutes(); // Recarrega e exibe
        } catch (error) {
            showStatus('Erro ao limpar rotas por funcionário: ' + error.message, 'error');
        }
    }
}

// Função para atualizar os filtros de funcionários (usa currentRoutes)
function updateEmployeeFilters() {
    const employeeFilter = document.getElementById('employeeFilter');
    const reportEmployeeFilter = document.getElementById('reportEmployeeFilter');

    employeeFilter.innerHTML = '<option value="all">Todos os Colaboradores</option>';
    reportEmployeeFilter.innerHTML = '<option value="">Selecione um Colaborador</option>';

    // Usa currentRoutes (que vem do DB) para pegar os funcionários
    const employees = [...new Set(currentRoutes.map(route => route.funcionario))].sort();

    employees.forEach(employee => {
        employeeFilter.innerHTML += `<option value="${employee}">${employee}</option>`;
        reportEmployeeFilter.innerHTML += `<option value="${employee}">${employee}</option>`;
    });
}

// Função para filtrar rotas (usa currentRoutes)
function filterRoutes() {
    const statusFilter = document.getElementById('statusFilter').value;
    const employeeFilter = document.getElementById('employeeFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    let filteredRoutes = currentRoutes; // Filtra a partir dos dados do servidor

    if (statusFilter !== 'all') {
        filteredRoutes = filteredRoutes.filter(route => route.status === statusFilter);
    }

    if (employeeFilter !== 'all') {
        filteredRoutes = filteredRoutes.filter(route => route.funcionario === employeeFilter);
    }

    if (searchInput) {
        filteredRoutes = filteredRoutes.filter(route =>
            (route.endereco && route.endereco.toLowerCase().includes(searchInput)) ||
            (route.numero && route.numero.toLowerCase().includes(searchInput)) ||
            (route.complemento && route.complemento.toLowerCase().includes(searchInput)) ||
            (route.funcionario && route.funcionario.toLowerCase().includes(searchInput)) ||
            (route.bairro && route.bairro.toLowerCase().includes(searchInput)) ||
            (route.cidade && route.cidade.toLowerCase().includes(searchInput)) ||
            (route.estado && route.estado.toLowerCase().includes(searchInput)) ||
            (route.cep && route.cep.toLowerCase().includes(searchInput)) ||
            (route.observacao && route.observacao.toLowerCase().includes(searchInput)) ||
            (route.ID && String(route.ID).toLowerCase().includes(searchInput)) ||
            (route.submission_id && route.submission_id.toLowerCase().includes(searchInput))
        );
    }

    // Exibe apenas as rotas pendentes ou executadas na tabela principal, dependendo da aba ativa
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;
    if (activeTab === 'pending') {
        updateRoutesTable(filteredRoutes); // Passa as rotas filtradas para a tabela de pendentes
    } else if (activeTab === 'executed') {
        updateExecutedRoutesTable(filteredRoutes); // Passa as rotas filtradas para a tabela de executadas
    }
}


// Função para importar rotas de um arquivo Excel (agora envia para a API)
async function importExcel() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    console.log("foi");
    if (!file) {
        showStatus('Por favor, selecione um arquivo Excel!', 'error');
        return;
    }

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showStatus('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)!', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onerror = function() {
        showStatus('Erro ao ler o arquivo!', 'error');
        console.error('Erro na leitura do arquivo:', reader.error);
    };
    
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                showStatus('A planilha está vazia ou não contém dados!', 'error');
                return;
            }

            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (!jsonData || jsonData.length <= 1) {
                showStatus('A planilha não contém dados suficientes!', 'error');
                return;
            }

            const headers = jsonData[0];
            // Importante: Estes são os cabeçalhos OBRIGATÓRIOS na sua planilha Excel, com a exata capitalização e acentos.
            const requiredHeaders = ['Submission ID', 'Funcionário', 'Endereço', 'Número']; // 'ID' removido daqui pois é AUTOINCREMENT no DB
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

            if (missingHeaders.length > 0) {
                showStatus(`Cabeçalhos obrigatórios faltando: ${missingHeaders.join(', ')}`, 'error');
                return;
            }

            const processedData = jsonData.slice(1).map(row => {
                const obj = {};
                // Mapeia os dados da linha para um objeto usando os nomes dos cabeçalhos como chaves
                headers.forEach((header, index) => {obj[header] = row[index] || '';});
                return obj;
            });

            let importedCount = 0;
            let skippedCount = 0;
            
            // Para cada linha da planilha, tente adicionar via API
            for (const row of processedData) {
                const newRouteData = {
                    submission_id: String(row['Submission ID'] || Date.now()),
                    colaborador: row['Colaborador'] || row['Funcionário'] || '', // Prioriza 'Colaborador', senão usa 'Funcionário'
                    funcionario: row['Funcionário'] || '',
                    endereco: row['Endereço'] || '',
                    numero: String(row['Número'] || ''), 
                    complemento: row['Complemento'] || '',
                    bairro: row['Bairro'] || '',
                    cidade: row['Cidade'] || '',
                    estado: row['Estado'] || '',
                    cep: row['CEP'] || '',
                    observacao: row['Observacao'] || '',
                    dataEntrega: row['Data de Entrega'] || '',
                    prioridade: row['Prioridade'] || '',
                    origem: 'excel' // Definir a origem como 'excel'
                };

                // Remove o campo ID se ele não for relevante para o INSERT (será AUTOINCREMENT no DB)
                // Se a coluna 'ID' da sua planilha for uma referência externa que você queira armazenar,
                // crie uma nova coluna no DB para isso, por exemplo 'excel_id_referencia'.
                const { ID, ...rotaParaAPI } = newRouteData;

                try {
                    // Tenta adicionar a rota
                    await adicionarRotaAPI(rotaParaAPI);
                    importedCount++;
                } catch (apiError) {
                    // Se o erro for "UNIQUE constraint failed" para submission_id, ignora
                    if (apiError.message.includes('Já existe uma rota com este Submission ID.')) {
                        skippedCount++;
                    } else {
                        console.error('Erro ao importar rota da planilha:', apiError.message);
                        showStatus(`Erro ao importar rota: ${apiError.message}`, 'error');
                    }
                }
            }

            showStatus(`Importação concluída! ${importedCount} rotas importadas, ${skippedCount} rotas ignoradas (duplicadas ou com erro).`, 'success');
            fileInput.value = ''; // Limpa o input do arquivo
            await loadAndDisplayRoutes(); // Recarrega e exibe todas as rotas após a importação
        } catch (error) {
            showStatus('Erro ao processar o arquivo Excel! Verifique o formato da planilha e os cabeçalhos.', 'error');
            console.error('Erro na importação Excel:', error);
        }
    };

    reader.readAsArrayBuffer(file);
}

// Função para mostrar o status (mantida)
function showStatus(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type}`;
    statusDiv.textContent = message;
    document.body.appendChild(statusDiv);
    setTimeout(() => {statusDiv.remove();}, 3000);
}

// Função para abrir o JotForm e atualizar o status da rota (agora interage com a API)
async function openJotForm(submissionId, rotaDbId) {
    // Busca a rota específica pelo ID do DB
    const route = currentRoutes.find(r => r.ID === rotaDbId);
    if (route) {
        // Abre o JotForm em uma nova janela usando o Submission ID
        const jotformUrl = submissionId
            ? `https://www.jotform.com/edit/${submissionId}`
            : 'https://www.jotform.com/edit/';
        window.open(jotformUrl, '_blank');

        // Atualiza o status da rota para 'executado' e 'executedAt' no DB
        try {
            await atualizarRotaAPI(rotaDbId, {
                status: 'executado',
                executedAt: new Date().toISOString()
            });
            showStatus('Status atualizado para executado!', 'success');
            await loadAndDisplayRoutes(); // Recarrega e exibe
        } catch (error) {
            showStatus('Erro ao atualizar status da rota: ' + error.message, 'error');
        }
    } else {
        showStatus('Rota não encontrada para atualização.', 'error');
    }
}

// Função para alternar entre as abas
function showTab(tabName) {
    // Atualiza os botões das abas
    document.getElementById('pendingTab').classList.toggle('active', tabName === 'pending');
    document.getElementById('executedTab').classList.toggle('active', tabName === 'executed');

    // Atualiza o conteúdo das abas
    document.getElementById('pendingTabContent').classList.toggle('active', tabName === 'pending');
    document.getElementById('executedTabContent').classList.toggle('active', tabName === 'executed');

    // Recarrega as tabelas para aplicar o filtro correto da aba
    if (tabName === 'pending') updateRoutesTable(currentRoutes); // Exibe as rotas pendentes (já filtradas por status no render)
    else if (tabName === 'executed') updateExecutedRoutesTable(currentRoutes); // Exibe as rotas executadas (já filtradas por status no render)
}

// Função para atualizar a tabela de rotas executadas
function updateExecutedRoutesTable(routesToDisplay = currentRoutes) {
    const tableBody = document.getElementById('executedRoutesTableBody');
    tableBody.innerHTML = '';

    const executedRoutes = routesToDisplay.filter(route => route.status === 'executado');

    if (executedRoutes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" class="no-routes">Nenhuma rota executada!</td>';
        tableBody.appendChild(tr);
        return;
    }

    executedRoutes.forEach(route => {
        const row = tableBody.insertRow();
        row.className = 'route-row status-executado';
        row.innerHTML = `
            <td>${route.ID}</td>
            <td>${route.funcionario}</td>
            <td>${route.endereco}</td>
            <td>${route.numero}</td>
            <td>${route.complemento || '-'}</td>
            <td>
                <span class="status-badge executado">
                    Executado
                </span>
            </td>
            <td>
                <span class="route-source ${route.origem === 'excel' ? 'excel-source' : 'manual-source'}">
                    ${route.origem === 'excel' ? 'Planilha' : 'Manual'}
                </span>
            </td>
            <td>${new Date(route.executedAt).toLocaleString()}</td>
        `;
    });
}

// Função para exportar para Excel (ainda pode usar currentRoutes)
function exportToExcel() {
    // Usar currentRoutes que já estão carregadas do DB
    const ws = XLSX.utils.json_to_sheet(currentRoutes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rotas");
    XLSX.writeFile(wb, "rotas_exportadas.xlsx");
}

// Função para imprimir rotas (ainda pode usar currentRoutes)
function printRoutes() {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <html>
            <head>
                <title>Impressão de Rotas</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    @media print {
                        body { margin: 0; padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <h1>Relatório de Rotas</h1>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Funcionário</th>
                            <th>Endereço</th>
                            <th>Número</th>
                            <th>Complemento</th>
                            <th>Status</th>
                            <th>Origem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentRoutes.map(route => `
                            <tr>
                                <td>${route.ID}</td>
                                <td>${route.funcionario}</td>
                                <td>${route.endereco}</td>
                                <td>${route.numero}</td>
                                <td>${route.complemento || '-'}</td>
                                <td>${route.status}</td>
                                <td>${route.origem}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

// Função para gerar relatório por WhatsApp (ainda pode usar currentRoutes)
function generateWhatsAppReport() {
    const employee = document.getElementById('reportEmployeeFilter').value;
    const date = document.getElementById('reportDate').value;
    if (!employee) {
        showStatus('Selecione um colaborador!', 'error');
        return;
    }

    let employeeRoutes = currentRoutes.filter(route => route.funcionario === employee);
    if (date) {
        employeeRoutes = employeeRoutes.filter(route => {
            // Ajustar para os nomes de coluna do seu DB
            const routeDate = (route.executedAt || route.dataCriacao || '').split('T')[0];
            return routeDate === date;
        });
    }

    const executedRoutes = employeeRoutes.filter(route => route.status === 'executado');
    const pendingRoutes = employeeRoutes.filter(route => route.status === 'pendente');

    let reportMessage = `*Relatório de Rotas - ${employee}*\n`;
    if (date) {
        reportMessage += `Data: ${new Date(date).toLocaleDateString('pt-BR')}\n`;
    }
    reportMessage += `Total de Rotas: ${employeeRoutes.length}\n`;
    reportMessage += `Executadas: ${executedRoutes.length}\n`;
    reportMessage += `Pendentes: ${pendingRoutes.length}`;

    const encodedMessage = encodeURIComponent(reportMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}

// Função para atualizar os contadores (agora usa currentRoutes)
function updateCounters() {
    document.getElementById('totalRoutes').textContent = currentRoutes.length;
    document.getElementById('executedRoutes').textContent = currentRoutes.filter(r => r.status === 'executado').length;
    document.getElementById('pendingRoutes').textContent = currentRoutes.filter(r => r.status === 'pendente').length;
}

console.log('--- controlador.js carregado ---');
// Inicializa a tabela quando a página carrega
document.addEventListener('DOMContentLoaded', async function() {
    // Remove a chamada a loadRoutes(), que usava localStorage
    await loadAndDisplayRoutes(); // Carrega e exibe as rotas do DB

    // Adiciona o evento de submit ao formulário
    document.getElementById('routeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addRoute(); // Chama a função que agora interage com a API
    });

    // Adiciona os eventos para os filtros
    document.getElementById('searchInput').addEventListener('input', filterRoutes);
    document.getElementById('statusFilter').addEventListener('change', filterRoutes);
    document.getElementById('employeeFilter').addEventListener('change', filterRoutes);

    // Adiciona eventos para os botões de ação (limpeza, importação, etc.)
    document.getElementById('clearAllRoutesButton').addEventListener('click', clearAllRoutes);
    document.getElementById('clearRoutesByEmployeeButton').addEventListener('click', clearRoutesByEmployee);

    document.getElementById('importExcelButton').addEventListener('click', importExcel);
    /*document.getElementById('importForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o recarregamento da página pelo formulário
        await importExcel(); // Chama a função de importação
    });*/

    document.getElementById('exportExcelButton').addEventListener('click', exportToExcel);
    document.getElementById('printRoutesButton').addEventListener('click', printRoutes);
    document.getElementById('generateWhatsAppReportButton').addEventListener('click', generateWhatsAppReport);

    // Eventos para as abas (seus IDs no HTML devem ser 'pendingTab' e 'executedTab')
    document.getElementById('pendingTab').addEventListener('click', () => showTab('pending'));
    document.getElementById('executedTab').addEventListener('click', () => showTab('executed'));

    // Garante que a aba "pendentes" esteja ativa e atualizada ao carregar
    showTab('pending');
});