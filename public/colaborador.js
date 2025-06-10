document.addEventListener('DOMContentLoaded', () => {
    // Elementos da interface
    const employeeForm = document.getElementById('employeeForm');
    const employeeNameInput = document.getElementById('employeeName');
    const totalRoutesSpan = document.getElementById('totalRoutes');
    const executedRoutesSpan = document.getElementById('executedRoutes');
    const pendingRoutesSpan = document.getElementById('pendingRoutes');
    const routesTableBody = document.getElementById('routesTableBody');
    const statusFilterSelect = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    let currentEmployeeName = ''; // Armazena o nome do funcionário logado
    let allEmployeeRoutes = []; // Armazena todas as rotas do funcionário logado

    // --- Funções de interação com a API ---

    // Função para buscar as rotas de um funcionário específico
    async function fetchRoutesByEmployee(employeeName) {
        try {
            const response = await fetch(`/api/rotas/funcionario/${encodeURIComponent(employeeName)}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.rotas;
        } catch (error) {
            console.error('Erro ao buscar rotas do funcionário:', error);
            alert(`Erro ao carregar suas rotas: ${error.message}`);
            return [];
        }
    }

    // Função para atualizar o status de uma rota (requer um campo 'status' no DB da rota)
    async function updateRouteStatus(routeId, newStatus) {
        try {
            const response = await fetch(`/api/rotas/${routeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }) // Envia apenas o status, ou outros campos se necessário
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP! Status: ${response.status}`);
            }

            const result = await response.json();
            alert(result.message);
            await loadMyRoutes(currentEmployeeName); // Recarrega as rotas após a atualização
        } catch (error) {
            console.error('Erro ao atualizar status da rota:', error);
            alert(`Erro ao atualizar status: ${error.message}`);
        }
    }

    // --- Funções de UI e Lógica de Negócio ---

    // Função para carregar e exibir as rotas do funcionário
    async function loadMyRoutes() {
        const employeeName = employeeNameInput.value.trim();
        if (!employeeName) {
            alert('Por favor, digite seu nome para ver as rotas.');
            return;
        }

        currentEmployeeName = employeeName; // Armazena o nome do funcionário
        allEmployeeRoutes = await fetchRoutesByEmployee(employeeName);

        updateDashboardStats(allEmployeeRoutes);
        filterAndDisplayRoutes(); // Exibe as rotas (já aplica filtros)
    }

    // Função para atualizar os cartões de estatísticas
    function updateDashboardStats(routes) {
        totalRoutesSpan.textContent = routes.length;
        const executed = routes.filter(route => route.status === 'executado').length;
        const pending = routes.filter(route => route.status === 'pendente').length; // Assumindo status 'pendente'
        executedRoutesSpan.textContent = executed;
        pendingRoutesSpan.textContent = pending;
    }

    // Função para exibir as rotas na tabela (com filtros)
    function displayRoutesInTable(routesToDisplay) {
        routesTableBody.innerHTML = ''; // Limpa as linhas existentes
        if (routesToDisplay.length === 0) {
            routesTableBody.innerHTML = '<tr><td colspan="5">Nenhuma rota encontrada para este funcionário ou com os filtros aplicados.</td></tr>';
            return;
        }

        routesToDisplay.forEach(route => {
            const row = routesTableBody.insertRow();
            row.setAttribute('data-id', route.ID_ROTA); // ID_ROTA do banco
            row.setAttribute('data-status', route.status || 'pendente'); // Atributo para facilitar filtragem
            row.insertCell(0).textContent = route.endereco;
            row.insertCell(1).textContent = route.numero;
            row.insertCell(2).textContent = route.complemento || '';
            const statusCell = row.insertCell(3);
            statusCell.textContent = route.status || 'pendente'; // Exibe o status atual
            const actionsCell = row.insertCell(4);
            const toggleStatusButton = document.createElement('button');
            toggleStatusButton.textContent = route.status === 'executado' ? 'Marcar como Pendente' : 'Marcar como Executada';
            toggleStatusButton.classList.add('action-button');
            toggleStatusButton.onclick = () => {
                const newStatus = route.status === 'executado' ? 'pendente' : 'executado';
                updateRouteStatus(route.ID_ROTA, newStatus);
            };
            actionsCell.appendChild(toggleStatusButton);
        });
    }

    // Função para aplicar filtros e pesquisa e exibir as rotas
    function filterAndDisplayRoutes() {
        let filteredRoutes = [...allEmployeeRoutes]; // Começa com todas as rotas do funcionário

        // Filtrar por status
        const selectedStatus = statusFilterSelect.value;
        if (selectedStatus !== 'all') filteredRoutes = filteredRoutes.filter(e => (e.status || 'pendente') === selectedStatus);

        // Pesquisar por endereço
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) filteredRoutes = filteredRoutes.filter(e => e.endereco.toLowerCase().includes(searchTerm));

        displayRoutesInTable(filteredRoutes);
        updateDashboardStats(filteredRoutes); // Atualiza os contadores com base nas rotas filtradas
    }

    // --- Funções de Eventos ---

    // Evento de submit do formulário de identificação
    if (employeeForm) {
        employeeForm.addEventListener('submit', (event) => {
            event.preventDefault();
            loadMyRoutes();
        });
    }

    // Evento de mudança no filtro de status
    if (statusFilterSelect) statusFilterSelect.addEventListener('change', filterAndDisplayRoutes); // Chama a função global no HTML

    // Evento de input na barra de pesquisa
    if (searchInput) searchInput.addEventListener('input', filterAndDisplayRoutes); // Chama a função global no HTML

    // Expor funções globais para o HTML (onchange, onclick)
    window.loadMyRoutes = loadMyRoutes;
    window.filterRoutes = filterAndDisplayRoutes;
    window.generateMyWhatsAppReport = generateMyWhatsAppReport; // Definida abaixo

    // --- Gerar Relatório WhatsApp ---
    function generateMyWhatsAppReport() {
        if (!currentEmployeeName) {
            alert('Por favor, identifique-se primeiro para gerar o relatório.');
            return;
        }

        const executedCount = allEmployeeRoutes.filter(route => route.status === 'executado').length;
        const pendingCount = allEmployeeRoutes.filter(route => route.status === 'pendente').length;
        const totalCount = allEmployeeRoutes.length;

        let message = `*Relatório de Rotas - ${currentEmployeeName}*\n\n`;
        message += `📊 Total de Rotas: ${totalCount}\n`;
        message += `✅ Rotas Executadas: ${executedCount}\n`;
        message += `⏳ Rotas Pendentes: ${pendingCount}\n\n`;

        message += `*Detalhes das Rotas Pendentes:*\n`;
        const pendingRoutes = allEmployeeRoutes.filter(route => route.status !== 'executado');
        if (pendingRoutes.length > 0) {
            pendingRoutes.forEach((route, index) => {
                message += `${index + 1}. ${route.endereco}, ${route.numero} ${route.complemento ? '(' + route.complemento + ')' : ''}\n`;
            });
        } else {
            message += 'Todas as rotas foram executadas! 🎉';
        }

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // --- Configuração Inicial ---
    // Você pode querer pré-carregar o nome do funcionário se ele estiver em uma sessão ou cookie
    // Por enquanto, o formulário será o ponto de entrada.
});
