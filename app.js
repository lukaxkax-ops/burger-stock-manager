// =============================================================
// BurguerStock - Lógica da Aplicação (Vanilla JS)
// Versão online: https://lukaxkax-ops.github.io/burger-stock-manager/
// =============================================================

// Mock inicial para demonstração com categorias reais
const MOCK_PRODUCTS = [
    { id: '1', name: 'Pão de Brioche', quantityPerPackage: 12, minQuantity: 60, currentStock: 48, category: 'Mega G', unitPrice: 1.50 },
    { id: '2', name: 'Blend Bovino 150g', quantityPerPackage: 10, minQuantity: 120, currentStock: 120, category: 'Negri', unitPrice: 5.50 },
    { id: '3', name: 'Queijo Cheddar Fatiado', quantityPerPackage: 24, minQuantity: 96, currentStock: 60, category: 'Creme Americano', unitPrice: 0.90 },
    { id: '4', name: 'Bacon Fatiado (Pacote)', quantityPerPackage: 1, minQuantity: 10, currentStock: 4, category: 'Mercado', unitPrice: 28.90 },
    { id: '5', name: 'Maionese Verde (Bisnaga)', quantityPerPackage: 1, minQuantity: 6, currentStock: 7, category: 'Mercado', unitPrice: 12.00 },
    { id: '6', name: 'Refrigerante Coca-Cola Lata', quantityPerPackage: 6, minQuantity: 24, currentStock: 18, category: 'Bebidas', unitPrice: 4.50 },
    { id: '7', name: 'Batata Congelada Pré-Frita', quantityPerPackage: 2.5, minQuantity: 10, currentStock: 5, category: 'Tanque Velho', unitPrice: 18.50 }
];

// Estado da Aplicação
let state = {
    products: [],
    activeTab: 'closing',
    editingProductId: null,
    searchClosing: '',
    searchProducts: '',
    searchPrices: '',
    filterClosing: 'all', // 'all' ou 'low'
    sortClosing: 'name', // 'name' ou 'category'
    sortProducts: 'name', // 'name' ou 'category'
    theme: 'dark',
    uncheckedShoppingItems: new Set() // Guarda IDs de produtos desmarcados da lista de compras
};

// Seletores DOM
const dom = {
    themeToggle: document.getElementById('themeToggle'),
    themeIconSun: document.getElementById('themeIconSun'),
    themeIconMoon: document.getElementById('themeIconMoon'),
    backupBtn: document.getElementById('backupBtn'),
    backupPanel: document.getElementById('backupPanel'),
    closeBackupBtn: document.getElementById('closeBackupBtn'),
    exportData: document.getElementById('exportData'),
    importFile: document.getElementById('importFile'),
    clearData: document.getElementById('clearData'),
    tabs: document.querySelectorAll('.nav-tab'),
    sections: document.querySelectorAll('.tab-section'),
    
    // Aba Fechamento
    statTotalItems: document.getElementById('statTotalItems'),
    statLowStock: document.getElementById('statLowStock'),
    statPacksToBuy: document.getElementById('statPacksToBuy'),
    statStockValue: document.getElementById('statStockValue'),
    searchClosing: document.getElementById('searchClosing'),
    filterButtons: document.querySelectorAll('.btn-filter'),
    sortClosing: document.getElementById('sortClosing'),
    closingEmptyState: document.getElementById('closingEmptyState'),
    closingTableContainer: document.getElementById('closingTableContainer'),
    closingTableBody: document.getElementById('closingTableBody'),
    goToRegisterBtn: document.querySelector('.go-to-register-btn'),
    
    // Lista de Compras
    shoppingListCard: document.getElementById('shoppingListCard'),
    shoppingListCounter: document.getElementById('shoppingListCounter'),
    shoppingListItems: document.getElementById('shoppingListItems'),
    copyListBtn: document.getElementById('copyListBtn'),
    whatsappListBtn: document.getElementById('whatsappListBtn'),
    
    // Aba Cadastro
    formTitle: document.getElementById('formTitle'),
    productForm: document.getElementById('productForm'),
    productId: document.getElementById('productId'),
    productName: document.getElementById('productName'),
    productCategory: document.getElementById('productCategory'),
    productActive: document.getElementById('productActive'),
    quantityPerPackage: document.getElementById('quantityPerPackage'),
    minQuantity: document.getElementById('minQuantity'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    saveProductBtn: document.getElementById('saveProductBtn'),
    searchProducts: document.getElementById('searchProducts'),
    sortProducts: document.getElementById('sortProducts'),
    productsEmptyState: document.getElementById('productsEmptyState'),
    productsListContainer: document.getElementById('productsListContainer'),
    productsList: document.getElementById('productsList'),

    // Aba Preços
    searchPrices: document.getElementById('searchPrices'),
    pricesEmptyState: document.getElementById('pricesEmptyState'),
    pricesTableContainer: document.getElementById('pricesTableContainer'),
    pricesTableBody: document.getElementById('pricesTableBody'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// -------------------------------------------------------------
// Inicialização
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadData();
    initEventListeners();
    render();
});

// -------------------------------------------------------------
// Gerenciamento de Dados & LocalStorage
// -------------------------------------------------------------
function loadData() {
    const savedProducts = localStorage.getItem('burguerstock_products');
    if (savedProducts) {
        try {
            state.products = JSON.parse(savedProducts);
        } catch (e) {
            console.error('Erro ao ler localStorage. Usando mock.', e);
            state.products = [...MOCK_PRODUCTS];
        }
    } else {
        // Primeira execução: carrega mock para não ficar em branco
        state.products = [...MOCK_PRODUCTS];
        saveData();
    }
}

function saveData() {
    localStorage.setItem('burguerstock_products', JSON.stringify(state.products));
}

// Tema Claro/Escuro
function loadTheme() {
    const savedTheme = localStorage.getItem('burguerstock_theme') || 'dark';
    state.theme = savedTheme;
    if (state.theme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        dom.themeIconSun.classList.remove('hidden');
        dom.themeIconMoon.classList.add('hidden');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        dom.themeIconSun.classList.add('hidden');
        dom.themeIconMoon.classList.remove('hidden');
    }
}

function toggleTheme() {
    if (state.theme === 'dark') {
        state.theme = 'light';
    } else {
        state.theme = 'dark';
    }
    localStorage.setItem('burguerstock_theme', state.theme);
    loadTheme();
    showToast(`Tema alterado para modo ${state.theme === 'dark' ? 'Escuro' : 'Claro'}`);
}

// -------------------------------------------------------------
// Event Listeners
// -------------------------------------------------------------
function initEventListeners() {
    // Tema
    dom.themeToggle.addEventListener('click', toggleTheme);

    // Abas
    dom.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.getAttribute('data-tab'));
        });
    });

    // Painel de Backup
    dom.backupBtn.addEventListener('click', () => dom.backupPanel.classList.toggle('hidden'));
    dom.closeBackupBtn.addEventListener('click', () => dom.backupPanel.classList.add('hidden'));
    dom.exportData.addEventListener('click', exportData);
    dom.importFile.addEventListener('change', importData);
    dom.clearData.addEventListener('click', clearAllData);

    // Busca e Filtros - Fechamento
    dom.searchClosing.addEventListener('input', (e) => {
        state.searchClosing = e.target.value.toLowerCase();
        renderClosingTable();
    });

    dom.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filterClosing = btn.getAttribute('data-filter');
            renderClosingTable();
        });
    });

    dom.sortClosing.addEventListener('change', (e) => {
        state.sortClosing = e.target.value;
        renderClosingTable();
    });

    dom.goToRegisterBtn.addEventListener('click', () => {
        switchTab('products');
    });

    // Cadastro de Produto - Form
    dom.productForm.addEventListener('submit', handleProductSubmit);
    dom.cancelEditBtn.addEventListener('click', cancelEdit);
    
    // Busca - Cadastro
    dom.searchProducts.addEventListener('input', (e) => {
        state.searchProducts = e.target.value.toLowerCase();
        renderProductsList();
    });

    dom.sortProducts.addEventListener('change', (e) => {
        state.sortProducts = e.target.value;
        renderProductsList();
    });

    // Busca - Preços
    dom.searchPrices.addEventListener('input', (e) => {
        state.searchPrices = e.target.value.toLowerCase();
        renderPricesTable();
    });

    // Lista de Compras Ações
    dom.copyListBtn.addEventListener('click', copyShoppingList);
    dom.whatsappListBtn.addEventListener('click', sendWhatsappShoppingList);
}

// Alternar Abas
function switchTab(tabName) {
    state.activeTab = tabName;
    
    dom.tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    dom.sections.forEach(section => {
        if (section.id === `tab-${tabName}`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    render();
}

// -------------------------------------------------------------
// Lógica de Cadastro (CRUD)
// -------------------------------------------------------------
function handleProductSubmit(e) {
    e.preventDefault();

    const id = dom.productId.value;
    const name = dom.productName.value.trim();
    const category = dom.productCategory.value;
    const qtyPerPack = parseFloat(dom.quantityPerPackage.value) || 1;
    const minQty = parseFloat(dom.minQuantity.value) || 0;
    const active = dom.productActive.checked;

    if (!name || !category) return;

    if (id) {
        // Modo Edição
        const productIndex = state.products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            state.products[productIndex].name = name;
            state.products[productIndex].category = category;
            state.products[productIndex].quantityPerPackage = qtyPerPack;
            state.products[productIndex].minQuantity = minQty;
            state.products[productIndex].active = active;
            
            // Garante que o estoque atual seja numérico
            if (state.products[productIndex].currentStock === undefined) {
                state.products[productIndex].currentStock = 0;
            }
            
            showToast('Produto atualizado com sucesso!');
        }
    } else {
        // Novo Produto
        const newProduct = {
            id: Date.now().toString(),
            name,
            category,
            quantityPerPackage: qtyPerPack,
            minQuantity: minQty,
            currentStock: 0, // Começa zerado por padrão
            active: true
        };
        state.products.push(newProduct);
        showToast('Produto cadastrado com sucesso!');
    }

    saveData();
    cancelEdit();
    render();
}

function editProduct(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    state.editingProductId = id;
    dom.productId.value = product.id;
    dom.productName.value = product.name;
    dom.productCategory.value = product.category || '';
    dom.quantityPerPackage.value = product.quantityPerPackage;
    dom.minQuantity.value = product.minQuantity;
    dom.productActive.checked = product.active !== false;

    dom.formTitle.innerText = 'Editar Produto';
    dom.saveProductBtn.innerText = 'Salvar Alterações';
    dom.cancelEditBtn.classList.remove('hidden');

    // Scroll suave até o formulário no mobile
    dom.productForm.scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    state.editingProductId = null;
    dom.productForm.reset();
    dom.productId.value = '';
    dom.productCategory.value = '';
    dom.productActive.checked = true;
    
    dom.formTitle.innerText = 'Novo Produto';
    dom.saveProductBtn.innerText = 'Salvar Produto';
    dom.cancelEditBtn.classList.add('hidden');
}

function deleteProduct(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
        state.products = state.products.filter(p => p.id !== id);
        saveData();
        showToast('Produto excluído com sucesso!');
        render();
    }
}

function toggleProductActiveState(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    product.active = product.active === false; // Inverte o status ativo
    
    // Se estiver editando este produto no formulário, atualiza a checkbox do formulário também
    if (state.editingProductId === id) {
        dom.productActive.checked = product.active;
    }

    saveData();
    render();
    
    showToast(`Produto "${product.name}" foi ${product.active ? 'ativado' : 'desativado'}.`);
}

// -------------------------------------------------------------
// Controle de Estoque (Fechamento) Lógica
// -------------------------------------------------------------
function updateStock(id, newValue) {
    const productIndex = state.products.findIndex(p => p.id === id);
    if (productIndex === -1) return;

    // Garante que o valor não seja negativo e aceita float
    const val = Math.max(0, parseFloat(newValue) || 0);
    state.products[productIndex].currentStock = val;
    
    saveData();
    renderStats();
    renderShoppingList();
    
    // Atualiza a linha específica do fechamento sem remontar a tabela inteira 
    // se o usuário estiver digitando, para não perder o foco do input.
    updateTableRowMetrics(id);
}

function changeStockBy(id, amount) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    const currentVal = product.currentStock || 0;
    // Evita erros de arredondamento de float em JavaScript
    const newVal = Math.max(0, parseFloat((currentVal + amount).toFixed(3)));
    
    const input = document.querySelector(`.stock-input[data-id="${id}"]`);
    if (input) {
        input.value = newVal;
        updateStock(id, newVal);
    }
}

// -------------------------------------------------------------
// Renderização de Telas
// -------------------------------------------------------------
function render() {
    renderStats();
    renderClosingTable();
    renderProductsList();
    renderShoppingList();
    renderPricesTable();
}

function renderStats() {
    const total = state.products.length;
    let lowStockCount = 0;
    let totalPacksToBuy = 0;
    let totalStockValue = 0;

    state.products.forEach(p => {
        // Apenas contabiliza alertas de estoque para produtos ativos
        if (p.active !== false) {
            const stock = p.currentStock || 0;
            const missing = p.minQuantity - stock;
            if (missing > 0) {
                lowStockCount++;
                const packs = Math.ceil(missing / p.quantityPerPackage);
                totalPacksToBuy += packs;
            }
            
            // Calcula o valor em estoque
            const price = p.unitPrice || 0;
            totalStockValue += stock * price;
        }
    });

    dom.statTotalItems.innerText = total;
    dom.statLowStock.innerText = lowStockCount;
    dom.statPacksToBuy.innerText = totalPacksToBuy;
    dom.statStockValue.innerText = totalStockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formata números decimais de forma limpa (ex: 2.5 -> 2.5, 3.0 -> 3)
function formatNumber(val) {
    if (val === undefined || val === null) return '0';
    return parseFloat(Number(val).toFixed(2)).toString();
}

// Normaliza categoria para slug de classe CSS (remove acentos e espaços)
function getCategorySlug(cat) {
    if (!cat) return 'mercado';
    return cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
}

function renderClosingTable() {
    if (state.products.length === 0) {
        dom.closingEmptyState.classList.remove('hidden');
        dom.closingTableContainer.classList.add('hidden');
        dom.shoppingListCard.classList.add('hidden');
        return;
    }

    dom.closingEmptyState.classList.add('hidden');
    dom.closingTableContainer.classList.remove('hidden');

    // Filtra apenas produtos ativos para o fechamento
    let filtered = state.products.filter(p => p.active !== false && p.name.toLowerCase().includes(state.searchClosing));

    if (state.filterClosing === 'low') {
        filtered = filtered.filter(p => {
            const stock = p.currentStock || 0;
            return (p.minQuantity - stock) > 0;
        });
    }

    // Ordenar conforme preferência (nome ou categoria)
    if (state.sortClosing === 'category') {
        filtered.sort((a, b) => {
            const catA = a.category || 'Mercado';
            const catB = b.category || 'Mercado';
            const catCompare = catA.localeCompare(catB);
            // Se as categorias forem iguais, ordena por nome
            if (catCompare !== 0) return catCompare;
            return a.name.localeCompare(b.name);
        });
    } else {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (filtered.length === 0) {
        dom.closingTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    Nenhum produto ativo encontrado com os filtros atuais.
                </td>
            </tr>
        `;
        return;
    }

    dom.closingTableBody.innerHTML = filtered.map(p => {
        const stock = p.currentStock !== undefined ? p.currentStock : 0;
        const missing = Math.max(0, p.minQuantity - stock);
        const packs = missing > 0 ? Math.ceil(missing / p.quantityPerPackage) : 0;
        const totalItemsInPacks = packs * p.quantityPerPackage;

        const isLow = missing > 0;
        const catClass = getCategorySlug(p.category);
        const catName = p.category || 'Mercado';

        return `
            <tr data-id="${p.id}" class="${isLow ? 'row-low-stock' : ''}">
                <td data-label="Produto" style="font-weight: 600;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                            <span>${p.name}</span>
                            <span class="badge-category ${catClass}">${catName}</span>
                        </div>
                        <span class="mobile-only-detail" style="font-size: 0.75rem; color: var(--text-muted); display: none;">
                            Mín: ${formatNumber(p.minQuantity)} un | Emb: ${formatNumber(p.quantityPerPackage)} un
                        </span>
                    </div>
                </td>
                <td data-label="Qtd. Mínima" class="text-center font-tabular">${formatNumber(p.minQuantity)} un</td>
                <td data-label="Qtd. p/ Pacote" class="text-center font-tabular">${formatNumber(p.quantityPerPackage)} un</td>
                <td data-label="Estoque Atual" class="text-center">
                    <div class="quantity-input-cell">
                        <button type="button" class="btn-spin" onclick="changeStockBy('${p.id}', -1)">−</button>
                        <input type="number" 
                               class="stock-input" 
                               data-id="${p.id}" 
                               value="${stock}" 
                               step="any"
                               min="0" 
                               oninput="updateStock('${p.id}', this.value)">
                        <button type="button" class="btn-spin" onclick="changeStockBy('${p.id}', 1)">+</button>
                    </div>
                </td>
                <td data-label="Falta" class="text-center font-tabular metric-missing" data-val="${missing}">
                    ${missing > 0 ? `<span class="pill pill-danger">${formatNumber(missing)} un</span>` : `<span class="pill pill-ok">0 un</span>`}
                </td>
                <td data-label="Pacotes" class="text-center font-tabular metric-packs" data-val="${packs}">
                    ${packs > 0 
                        ? `<span class="pill pill-warning" style="font-weight: 700;">${packs} pct${p.quantityPerPackage > 1 ? ` (${formatNumber(totalItemsInPacks)} un)` : ''}</span>` 
                        : `<span class="pill pill-ok">0 pct</span>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// Atualizar apenas métricas de uma linha específica sem re-renderizar para manter foco/digitação fluida
function updateTableRowMetrics(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    const stock = product.currentStock || 0;
    const missing = Math.max(0, product.minQuantity - stock);
    const packs = missing > 0 ? Math.ceil(missing / product.quantityPerPackage) : 0;
    const totalItemsInPacks = packs * product.quantityPerPackage;

    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    // Atualiza classe de destaque da linha
    if (missing > 0) {
        row.classList.add('row-low-stock');
    } else {
        row.classList.remove('row-low-stock');
    }

    // Atualiza célula de Falta
    const cellMissing = row.querySelector('.metric-missing');
    if (cellMissing) {
        cellMissing.setAttribute('data-val', missing);
        cellMissing.innerHTML = missing > 0 
            ? `<span class="pill pill-danger">${formatNumber(missing)} un</span>` 
            : `<span class="pill pill-ok">0 un</span>`;
    }

    // Atualiza célula de Pacotes
    const cellPacks = row.querySelector('.metric-packs');
    if (cellPacks) {
        cellPacks.setAttribute('data-val', packs);
        cellPacks.innerHTML = packs > 0 
            ? `<span class="pill pill-warning" style="font-weight: 700;">${packs} pct${product.quantityPerPackage > 1 ? ` (${formatNumber(totalItemsInPacks)} un)` : ''}</span>` 
            : `<span class="pill pill-ok">0 pct</span>`;
    }
}

function renderProductsList() {
    const total = state.products.length;
    
    if (total === 0) {
        dom.productsEmptyState.classList.remove('hidden');
        dom.productsListContainer.classList.add('hidden');
        return;
    }

    dom.productsEmptyState.classList.add('hidden');
    dom.productsListContainer.classList.remove('hidden');

    let filtered = state.products.filter(p => p.name.toLowerCase().includes(state.searchProducts));
    
    // Ordenação
    if (state.sortProducts === 'category') {
        filtered.sort((a, b) => {
            const catA = a.category || 'Mercado';
            const catB = b.category || 'Mercado';
            const catCompare = catA.localeCompare(catB);
            // Se as categorias forem iguais, ordena por nome
            if (catCompare !== 0) return catCompare;
            return a.name.localeCompare(b.name);
        });
    } else {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (filtered.length === 0) {
        dom.productsList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                Nenhum produto cadastrado corresponde à busca.
            </div>
        `;
        return;
    }

    dom.productsList.innerHTML = filtered.map(p => {
        const catClass = getCategorySlug(p.category);
        const catName = p.category || 'Mercado';
        const isActive = p.active !== false;
        return `
        <div class="product-item ${isActive ? '' : 'inactive'}" data-id="${p.id}">
            <div class="product-item-details">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; flex-wrap: wrap;">
                    <h4 style="margin-bottom: 0;">${p.name}</h4>
                    <span class="badge-category ${catClass}">${catName}</span>
                    ${isActive ? '' : '<span class="badge-status-inactive">Inativo</span>'}
                </div>
                <p>
                    <strong>Embalagem:</strong> ${formatNumber(p.quantityPerPackage)} un/pct | 
                    <strong>Qtd. Mínima Semana:</strong> ${formatNumber(p.minQuantity)} un
                </p>
            </div>
            <div class="product-item-actions">
                <button type="button" class="btn-toggle-active ${isActive ? 'active' : 'inactive'}" onclick="toggleProductActiveState('${p.id}')" aria-label="Ativar/Desativar produto">
                    ${isActive 
                        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                               <circle cx="12" cy="12" r="3"></circle>
                           </svg>`
                        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                               <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                               <line x1="1" y1="1" x2="23" y2="23"></line>
                           </svg>`
                    }
                </button>
                <button type="button" class="btn-edit" onclick="editProduct('${p.id}')" aria-label="Editar produto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                </button>
                <button type="button" class="btn-delete" onclick="deleteProduct('${p.id}')" aria-label="Excluir produto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    }).join('');
}

function renderShoppingList() {
    const listItems = [];
    
    state.products.forEach(p => {
        // Apenas inclui se o produto estiver ativo!
        if (p.active !== false) {
            const stock = p.currentStock || 0;
            const missing = p.minQuantity - stock;
            if (missing > 0) {
                const packs = Math.ceil(missing / p.quantityPerPackage);
                listItems.push({
                    id: p.id,
                    name: p.name,
                    missing,
                    packs,
                    qtyPerPack: p.quantityPerPackage,
                    category: p.category || 'Mercado'
                });
            }
        }
    });

    // Ordenar alfabeticamente
    listItems.sort((a, b) => a.name.localeCompare(b.name));

    if (listItems.length === 0) {
        dom.shoppingListCard.classList.add('hidden');
        return;
    }

    dom.shoppingListCard.classList.remove('hidden');
    
    // Calcular quantos estão selecionados
    const selectedCount = listItems.filter(item => !state.uncheckedShoppingItems.has(item.id)).length;
    dom.shoppingListCounter.innerText = `${selectedCount} de ${listItems.length} selecionado(s)`;

    // Agrupar itens por categoria para exibição
    const groups = {};
    listItems.forEach(item => {
        const cat = item.category;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
    });

    // Ordenar nomes de categorias
    const sortedCategories = Object.keys(groups).sort();

    dom.shoppingListItems.innerHTML = sortedCategories.map(cat => {
        const catClass = getCategorySlug(cat);
        const itemsHtml = groups[cat].map(item => {
            const isChecked = !state.uncheckedShoppingItems.has(item.id);
            return `
                <label class="shopping-item-tag ${isChecked ? '' : 'unchecked'}">
                    <input type="checkbox" 
                           class="shopping-item-checkbox" 
                           data-id="${item.id}" 
                           ${isChecked ? 'checked' : ''} 
                           onchange="toggleShoppingItemSelection('${item.id}', this.checked)">
                    <span class="shopping-item-name">${item.name}</span>
                    <span class="shopping-item-qty">${formatNumber(item.missing)} un</span>
                    <span class="shopping-item-packs">(${item.packs} pct${item.qtyPerPack > 1 ? ` de ${formatNumber(item.qtyPerPack)}` : ''})</span>
                </label>
            `;
        }).join('');

        return `
            <div class="shopping-list-category-group">
                <div class="category-group-title">
                    <span class="badge-category ${catClass}" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${cat}</span>
                </div>
                <div class="shopping-list-items-flex">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Alternar seleção de item na lista de compras
function toggleShoppingItemSelection(id, isChecked) {
    if (isChecked) {
        state.uncheckedShoppingItems.delete(id);
    } else {
        state.uncheckedShoppingItems.add(id);
    }
    
    // Atualizar estilo visual da tag sem remontar a lista inteira
    const checkbox = document.querySelector(`.shopping-item-checkbox[data-id="${id}"]`);
    if (checkbox) {
        const tag = checkbox.closest('.shopping-item-tag');
        if (tag) {
            if (isChecked) {
                tag.classList.remove('unchecked');
            } else {
                tag.classList.add('unchecked');
            }
        }
    }
    
    // Atualizar o contador no cabeçalho
    const totalCheckboxes = document.querySelectorAll('.shopping-item-checkbox').length;
    const selectedCheckboxes = document.querySelectorAll('.shopping-item-checkbox:checked').length;
    dom.shoppingListCounter.innerText = `${selectedCheckboxes} de ${totalCheckboxes} selecionado(s)`;
}

// -------------------------------------------------------------
// Geração e Compartilhamento de Listas
// -------------------------------------------------------------
function generateTextList() {
    const listItems = [];
    state.products.forEach(p => {
        // Apenas adiciona se o produto estiver ativo!
        if (p.active !== false) {
            const stock = p.currentStock || 0;
            const missing = p.minQuantity - stock;
            // Apenas adiciona se estiver abaixo do mínimo AND estiver selecionado (não desmarcado)
            if (missing > 0 && !state.uncheckedShoppingItems.has(p.id)) {
                const packs = Math.ceil(missing / p.quantityPerPackage);
                listItems.push({
                    name: p.name,
                    missing,
                    packs,
                    qtyPerPack: p.quantityPerPackage,
                    category: p.category || 'Mercado'
                });
            }
        }
    });

    listItems.sort((a, b) => a.name.localeCompare(b.name));

    if (listItems.length === 0) return null;

    const dateStr = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let text = `🍔 *Lista de Reposição - BurguerStock*\n`;
    text += `*Fechamento Semanal:* ${dateStr}\n\n`;
    text += `Precisamos comprar os seguintes itens para o estoque (separados por fornecedor):\n\n`;

    // Agrupar itens por categoria/fornecedor
    const categories = {};
    listItems.forEach(item => {
        const cat = item.category;
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(item);
    });

    // Ordenar categorias
    const sortedCategories = Object.keys(categories).sort();

    sortedCategories.forEach(cat => {
        text += `*🔹 ${cat.toUpperCase()}*\n`;
        categories[cat].forEach(item => {
            if (item.qtyPerPack > 1) {
                text += `• *${item.name}*: ${item.packs} pacote(s) (Falta: ${formatNumber(item.missing)} un, contendo ${formatNumber(item.qtyPerPack)} un/pct)\n`;
            } else {
                text += `• *${item.name}*: ${formatNumber(item.missing)} unidade(s) / pacote(s)\n`;
            }
        });
        text += `\n`;
    });

    text += `_Gerado automaticamente pelo BurguerStock_`;
    return text;
}

function copyShoppingList() {
    const text = generateTextList();
    if (!text) {
        showToast('Nenhum item selecionado para reposição!');
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast('Lista de compras copiada para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        showToast('Erro ao copiar lista. Tente novamente.');
    });
}

function sendWhatsappShoppingList() {
    const text = generateTextList();
    if (!text) {
        showToast('Nenhum item selecionado para reposição!');
        return;
    }

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
}

// -------------------------------------------------------------
// Backup de Dados (JSON Import/Export)
// -------------------------------------------------------------
function exportData() {
    if (state.products.length === 0) {
        showToast('Não há dados de produtos para exportar.');
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.products, null, 2));
    const downloadAnchor = document.createElement('a');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `burguerstock_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    showToast('Backup exportado com sucesso!');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            if (Array.isArray(imported)) {
                // Validação básica dos campos
                const isValid = imported.every(item => 
                    item.id && 
                    item.name && 
                    typeof item.quantityPerPackage === 'number' && 
                    typeof item.minQuantity === 'number'
                );

                if (isValid) {
                    // Garante que haja o campo currentStock, category e unitPrice em todos
                    const processed = imported.map(item => ({
                        ...item,
                        category: item.category || 'Mercado',
                        currentStock: typeof item.currentStock === 'number' ? item.currentStock : 0,
                        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0
                    }));

                    state.products = processed;
                    saveData();
                    render();
                    dom.backupPanel.classList.add('hidden');
                    showToast('Backup importado com sucesso!');
                } else {
                    showToast('Erro: Estrutura do arquivo de backup inválida.');
                }
            } else {
                showToast('Erro: O arquivo de backup deve ser uma lista de produtos.');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao ler arquivo. Certifique-se de que é um JSON de backup válido.');
        }
    };
    reader.readAsText(file);
    // Limpa valor para permitir importar o mesmo arquivo novamente
    e.target.value = '';
}

function clearAllData() {
    if (confirm('ATENÇÃO: Isso apagará TODOS os produtos cadastrados e estoques atuais permanentemente. Deseja continuar?')) {
        state.products = [];
        saveData();
        cancelEdit();
        render();
        dom.backupPanel.classList.add('hidden');
        showToast('Todos os dados foram apagados.');
    }
}

// -------------------------------------------------------------
// Toast Notificações Auxiliares
// -------------------------------------------------------------
let toastTimeout;
function showToast(message) {
    clearTimeout(toastTimeout);
    dom.toastMessage.innerText = message;
    dom.toast.classList.remove('hidden');
    
    // Efeito sutil de fade in via animação e reset de opacidade
    dom.toast.style.opacity = '1';
    dom.toast.style.transform = 'translateY(0)';

    toastTimeout = setTimeout(() => {
        dom.toast.style.opacity = '0';
        dom.toast.style.transform = 'translateY(10px)';
        // Aguarda transição terminar antes de ocultar no DOM
        setTimeout(() => {
            dom.toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// -------------------------------------------------------------
// Aba Preços Lógica de Renderização
// -------------------------------------------------------------
function renderPricesTable() {
    const total = state.products.length;
    
    if (total === 0) {
        dom.pricesEmptyState.classList.remove('hidden');
        dom.pricesTableContainer.classList.add('hidden');
        return;
    }

    dom.pricesEmptyState.classList.add('hidden');
    dom.pricesTableContainer.classList.remove('hidden');

    let filtered = state.products.filter(p => p.name.toLowerCase().includes(state.searchPrices));
    
    // Ordenar alfabeticamente
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0) {
        dom.pricesTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    Nenhum produto cadastrado corresponde à busca.
                </td>
            </tr>
        `;
        return;
    }

    dom.pricesTableBody.innerHTML = filtered.map(p => {
        const catClass = getCategorySlug(p.category);
        const catName = p.category || 'Mercado';
        const price = p.unitPrice !== undefined ? p.unitPrice : '';
        const isActive = p.active !== false;
        
        return `
            <tr data-id="${p.id}" class="${isActive ? '' : 'row-inactive-price'}" style="${isActive ? '' : 'opacity: 0.6;'}">
                <td data-label="Produto" style="font-weight: 600;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <span>${p.name}</span>
                        ${isActive ? '' : '<span class="badge-status-inactive" style="font-size: 0.65rem;">Inativo</span>'}
                    </div>
                </td>
                <td data-label="Categoria">
                    <span class="badge-category ${catClass}">${catName}</span>
                </td>
                <td data-label="Preço Unitário" class="text-center">
                    <div style="display: inline-flex; align-items: center; gap: 0.35rem; position: relative;">
                        <span style="color: var(--text-muted); font-weight: 600;">R$</span>
                        <input type="number" 
                               class="price-input" 
                               data-id="${p.id}" 
                               value="${price}" 
                               placeholder="0,00"
                               step="0.01"
                               min="0" 
                               style="width: 120px; padding: 0.4rem 0.6rem; text-align: right; font-weight: 600;"
                               oninput="updateUnitPrice('${p.id}', this.value)">
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateUnitPrice(id, value) {
    const productIndex = state.products.findIndex(p => p.id === id);
    if (productIndex === -1) return;

    const val = value === '' ? 0 : Math.max(0, parseFloat(value) || 0);
    state.products[productIndex].unitPrice = val;

    saveData();
    renderStats();
}

// Expor funções chamadas inline no HTML para o escopo global (objeto window)
// Isso é necessário porque o bundler de produção do Vite encapsula o script em escopo de módulo
window.toggleProductActiveState = toggleProductActiveState;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.changeStockBy = changeStockBy;
window.updateStock = updateStock;
window.toggleShoppingItemSelection = toggleShoppingItemSelection;
window.updateUnitPrice = updateUnitPrice;
