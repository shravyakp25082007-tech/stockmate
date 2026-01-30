// ===== APPLICATION STATE =====
const app = {
    products: [],
    dailyPlan: {
        date: new Date().toISOString().split('T')[0],
        toBuy: [],
        toSell: [],
        notes: ''
    },
    transactions: [],
    darkMode: localStorage.getItem('darkMode') === 'true',
    
    // Initialize app
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDarkMode();
        this.loadSampleProducts();
        this.updateDashboard();
        this.updateCurrentDate();
        this.initializeProductSelects();
        this.setupTooltips();
    },

    // Sample data for new users
    loadSampleProducts() {
        if (this.products.length === 0) {
            this.products = [
                {
                    id: 1,
                    name: 'Wheat Flour (10kg)',
                    category: 'Groceries',
                    quantity: 15,
                    minQuantity: 5,
                    buyingPrice: 450,
                    sellingPrice: 550
                },
                {
                    id: 2,
                    name: 'Rice (5kg)',
                    category: 'Groceries',
                    quantity: 8,
                    minQuantity: 4,
                    buyingPrice: 400,
                    sellingPrice: 500
                },
                {
                    id: 3,
                    name: 'Sugar (2kg)',
                    category: 'Groceries',
                    quantity: 2,
                    minQuantity: 3,
                    buyingPrice: 200,
                    sellingPrice: 280
                },
                {
                    id: 4,
                    name: 'Salt (1kg)',
                    category: 'Groceries',
                    quantity: 25,
                    minQuantity: 10,
                    buyingPrice: 50,
                    sellingPrice: 80
                },
                {
                    id: 5,
                    name: 'Cooking Oil (5L)',
                    category: 'Groceries',
                    quantity: 0,
                    minQuantity: 3,
                    buyingPrice: 500,
                    sellingPrice: 650
                },
                {
                    id: 6,
                    name: 'Notebook (100 pages)',
                    category: 'Books',
                    quantity: 30,
                    minQuantity: 15,
                    buyingPrice: 40,
                    sellingPrice: 60
                },
                {
                    id: 7,
                    name: 'LED Bulb (9W)',
                    category: 'Electronics',
                    quantity: 12,
                    minQuantity: 5,
                    buyingPrice: 150,
                    sellingPrice: 250
                },
                {
                    id: 8,
                    name: 'Aspirin Tablets (100)',
                    category: 'Medicines',
                    quantity: 5,
                    minQuantity: 2,
                    buyingPrice: 120,
                    sellingPrice: 200
                }
            ];
            this.saveData();
        }
    }
};

// ===== DATA MANAGEMENT =====
function saveData() {
    localStorage.setItem('shopProducts', JSON.stringify(app.products));
    localStorage.setItem('dailyPlan', JSON.stringify(app.dailyPlan));
    localStorage.setItem('transactions', JSON.stringify(app.transactions));
}

function loadData() {
    const savedProducts = localStorage.getItem('shopProducts');
    const savedPlan = localStorage.getItem('dailyPlan');
    const savedTransactions = localStorage.getItem('transactions');
    
    if (savedProducts) app.products = JSON.parse(savedProducts);
    if (savedPlan) app.dailyPlan = JSON.parse(savedPlan);
    if (savedTransactions) app.transactions = JSON.parse(savedTransactions);
}

app.loadData = loadData;
app.saveData = function() { saveData(); };

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Product modal
    document.getElementById('addProductBtn').addEventListener('click', openProductModal);
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);
    document.getElementById('productForm').addEventListener('submit', saveProduct);

    // Search and filters
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('statusFilter').addEventListener('change', filterProducts);
    document.getElementById('planningFilter').addEventListener('change', filterProducts);

    // View toggle
    document.getElementById('tableViewBtn').addEventListener('click', (e) => toggleView('table', e.target.closest('.view-btn')));
    document.getElementById('cardViewBtn').addEventListener('click', (e) => toggleView('card', e.target.closest('.view-btn')));

    // Daily planning
    document.getElementById('planningDate').addEventListener('change', (e) => {
        app.dailyPlan.date = e.target.value;
        updatePlanning();
    });

    document.getElementById('savePlanBtn').addEventListener('click', saveDailyPlan);
    document.getElementById('planningNotes').addEventListener('change', (e) => {
        app.dailyPlan.notes = e.target.value;
    });

    // Quick buy/sell
    document.getElementById('buyQtyMinus').addEventListener('click', () => updateQty('buyQty', -1));
    document.getElementById('buyQtyPlus').addEventListener('click', () => updateQty('buyQty', 1));
    document.getElementById('sellQtyMinus').addEventListener('click', () => updateQty('sellQty', -1));
    document.getElementById('sellQtyPlus').addEventListener('click', () => updateQty('sellQty', 1));

    document.getElementById('addBuyBtn').addEventListener('click', addQuickBuy);
    document.getElementById('addSellBtn').addEventListener('click', addQuickSell);

    // Bottom action bar
    document.getElementById('dashboardQuickBtn').addEventListener('click', () => switchTab('dashboard'));
    document.getElementById('addQuickBtn').addEventListener('click', openProductModal);
    document.getElementById('quickStatsBtn').addEventListener('click', () => switchTab('dashboard'));

    // Modal close on outside click
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target.id === 'productModal') closeProductModal();
    });
}

app.setupEventListeners = setupEventListeners;

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName)?.classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update bottom nav
    updateBottomNav(tabName);

    // Refresh relevant data
    if (tabName === 'inventory') {
        renderProducts();
    } else if (tabName === 'planning') {
        updatePlanning();
    } else if (tabName === 'transactions') {
        renderTransactions();
    } else if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// ===== DARK MODE =====
function toggleDarkMode() {
    app.darkMode = !app.darkMode;
    updateDarkMode();
    localStorage.setItem('darkMode', app.darkMode);
}

function updateDarkMode() {
    if (app.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
}

app.updateDarkMode = updateDarkMode;

// ===== DASHBOARD UPDATES =====
function updateDashboard() {
    const lowStockThreshold = 5;
    let totalValue = 0;
    let lowStockCount = 0;
    let buyToday = 0;
    let sellToday = 0;
    let goodStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    app.products.forEach(product => {
        totalValue += product.quantity * product.sellingPrice;
        
        if (product.quantity === 0) {
            outOfStock++;
        } else if (product.quantity <= product.minQuantity) {
            lowStock++;
            lowStockCount++;
        } else {
            goodStock++;
        }
    });

    buyToday = app.dailyPlan.toBuy.length;
    sellToday = app.dailyPlan.toSell.length;

    // Update stat cards
    document.getElementById('totalStockValue').textContent = '₹' + totalValue.toLocaleString();
    document.getElementById('totalItems').textContent = app.products.length + ' items';
    document.getElementById('buyToday').textContent = buyToday;
    document.getElementById('sellToday').textContent = sellToday;
    document.getElementById('lowStockCount').textContent = lowStockCount;

    // Update chart
    document.getElementById('goodStockNum').textContent = goodStock;
    document.getElementById('lowStockNum').textContent = lowStock;
    document.getElementById('outOfStockNum').textContent = outOfStock;

    // Update bars width
    const total = goodStock + lowStock + outOfStock || 1;
    document.getElementById('goodStockBar').querySelector('.bar-fill').style.width = ((goodStock / total) * 100) + '%';
    document.getElementById('lowStockBar').querySelector('.bar-fill').style.width = ((lowStock / total) * 100) + '%';
    document.getElementById('outOfStockBar').querySelector('.bar-fill').style.width = ((outOfStock / total) * 100) + '%';

    // Update alerts
    updateAlerts();
}

function updateAlerts() {
    const alertsList = document.getElementById('alertsList');
    const alerts = [];

    app.products.forEach(product => {
        if (product.quantity === 0) {
            alerts.push({
                type: 'danger',
                icon: 'fa-exclamation-circle',
                title: 'Out of Stock',
                message: `${product.name} is completely out of stock!`
            });
        } else if (product.quantity <= product.minQuantity) {
            alerts.push({
                type: 'warning',
                icon: 'fa-triangle-exclamation',
                title: 'Low Stock',
                message: `${product.name} is running low (${product.quantity} units)`
            });
        }
    });

    if (alerts.length === 0) {
        alertsList.innerHTML = '<p class="empty-state">No alerts yet. Everything looks good!</p>';
        return;
    }

    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <i class="fas ${alert.icon}"></i>
            <div class="alert-text">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
        </div>
    `).join('');
}

app.updateDashboard = updateDashboard;

// ===== PRODUCTS MANAGEMENT =====
function getProductStatus(product) {
    if (product.quantity === 0) return { status: 'out', label: 'Out of Stock', color: 'status-out' };
    if (product.quantity <= product.minQuantity) return { status: 'low', label: 'Low Stock', color: 'status-low' };
    return { status: 'good', label: 'In Stock', color: 'status-good' };
}

function renderProducts() {
    const tableBody = document.getElementById('productTableBody');
    const cardsContainer = document.getElementById('productCardsContainer');

    if (app.products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No products yet. Add one to get started!</td></tr>';
        cardsContainer.innerHTML = '<p class="empty-state">No products yet. Add one to get started!</p>';
        return;
    }

    // Table view
    tableBody.innerHTML = app.products.map(product => {
        const status = getProductStatus(product);
        const margin = ((product.sellingPrice - product.buyingPrice) / product.buyingPrice * 100).toFixed(1);
        
        return `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>₹${product.buyingPrice.toFixed(2)}</td>
                <td>₹${product.sellingPrice.toFixed(2)}</td>
                <td><span class="status-badge ${status.color}">${status.label}</span></td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-small btn-secondary" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Card view
    cardsContainer.innerHTML = app.products.map(product => {
        const status = getProductStatus(product);
        const margin = ((product.sellingPrice - product.buyingPrice) / product.buyingPrice * 100).toFixed(1);
        
        return `
            <div class="product-card">
                <div class="product-card-header">
                    <div class="product-card-name">${product.name}</div>
                    <div class="product-card-category">${product.category}</div>
                </div>
                <div class="product-card-content">
                    <div class="card-row">
                        <span class="card-label">Qty Available:</span>
                        <span class="card-value">${product.quantity}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Min Level:</span>
                        <span class="card-value">${product.minQuantity}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Buy Price:</span>
                        <span class="card-value">₹${product.buyingPrice.toFixed(2)}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Sell Price:</span>
                        <span class="card-value">₹${product.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Profit Margin:</span>
                        <span class="card-value">${margin}%</span>
                    </div>
                    <div class="card-row" style="margin-top: 8px;">
                        <span class="status-badge ${status.color}">${status.label}</span>
                    </div>
                </div>
                <div class="product-card-footer">
                    <button class="btn btn-secondary btn-small" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updateCategoryFilter();
}

function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    const planning = document.getElementById('planningFilter').value;

    const filtered = app.products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(search);
        const matchCategory = !category || product.category === category;
        
        let matchStatus = true;
        if (status) {
            const productStatus = getProductStatus(product).status;
            matchStatus = productStatus === status;
        }

        let matchPlanning = true;
        if (planning === 'buy') {
            matchPlanning = app.dailyPlan.toBuy.some(item => item.productId === product.id);
        } else if (planning === 'sell') {
            matchPlanning = app.dailyPlan.toSell.some(item => item.productId === product.id);
        }

        return matchSearch && matchCategory && matchStatus && matchPlanning;
    });

    // Temporarily replace products for rendering
    const backup = app.products;
    app.products = filtered;
    renderProducts();
    app.products = backup;
}

function updateCategoryFilter() {
    const categories = [...new Set(app.products.map(p => p.category))];
    const filter = document.getElementById('categoryFilter');
    const currentValue = filter.value;
    
    filter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        filter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    filter.value = currentValue;
}

function initializeProductSelects() {
    const buySelect = document.getElementById('buyProductSelect');
    const sellSelect = document.getElementById('sellProductSelect');
    
    const options = app.products.map(p => 
        `<option value="${p.id}">${p.name}</option>`
    ).join('');
    
    buySelect.innerHTML = '<option value="">Select Product to Buy</option>' + options;
    sellSelect.innerHTML = '<option value="">Select Product to Sell</option>' + options;
}

function addToPlanning(productId, type) {
    const product = app.products.find(p => p.id === productId);
    if (!product) return;

    const planningArray = type === 'buy' ? app.dailyPlan.toBuy : app.dailyPlan.toSell;
    const existingItem = planningArray.find(item => item.productId === productId);

    if (!existingItem) {
        planningArray.push({
            productId: productId,
            productName: product.name,
            quantity: 1,
            price: type === 'buy' ? product.buyingPrice : product.sellingPrice
        });
        app.saveData();
        showToast(`Added to "${type === 'buy' ? 'Buy' : 'Sell'}" list`, 'success');
        updatePlanning();
    }
}

function toggleView(view, btnElement) {
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // Toggle views
    document.getElementById('tableView').classList.toggle('active', view === 'table');
    document.getElementById('cardView').classList.toggle('active', view === 'card');
}

// ===== MODAL OPERATIONS =====
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (productId) {
        const product = app.products.find(p => p.id === productId);
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = productId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('minQuantity').value = product.minQuantity;
        document.getElementById('buyingPrice').value = product.buyingPrice;
        document.getElementById('sellingPrice').value = product.sellingPrice;
    } else {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function saveProduct(e) {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const newProduct = {
        id: productId ? parseInt(productId) : Date.now(),
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        quantity: parseInt(document.getElementById('productQuantity').value),
        minQuantity: parseInt(document.getElementById('minQuantity').value),
        buyingPrice: parseFloat(document.getElementById('buyingPrice').value),
        sellingPrice: parseFloat(document.getElementById('sellingPrice').value)
    };

    if (productId) {
        const index = app.products.findIndex(p => p.id === parseInt(productId));
        app.products[index] = newProduct;
        showToast('Product updated successfully', 'success');
    } else {
        app.products.push(newProduct);
        showToast('Product added successfully', 'success');
    }

    app.saveData();
    initializeProductSelects();
    closeProductModal();
    renderProducts();
    updateDashboard();
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        app.products = app.products.filter(p => p.id !== productId);
        app.saveData();
        showToast('Product deleted', 'success');
        renderProducts();
        updateDashboard();
        initializeProductSelects();
    }
}

// ===== DAILY PLANNING =====
function updatePlanning() {
    document.getElementById('planningDate').value = app.dailyPlan.date;
    document.getElementById('planningNotes').value = app.dailyPlan.notes;

    updatePlanningList('buy');
    updatePlanningList('sell');
    updateSummary();
}

function updatePlanningList(type) {
    const listElement = document.getElementById(`${type}PlanningList`);
    const planArray = type === 'buy' ? app.dailyPlan.toBuy : app.dailyPlan.toSell;

    if (planArray.length === 0) {
        listElement.innerHTML = '<p class="empty-state">No items marked to ' + type + '</p>';
        return;
    }

    listElement.innerHTML = planArray.map((item, index) => `
        <div class="planning-item">
            <div class="planning-item-info">
                <div class="planning-item-name">${item.productName}</div>
                <div class="planning-item-detail">₹${item.price.toFixed(2)} × ${item.quantity}</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn-small" onclick="updatePlanQty(${index}, '${type}', -1)">−</button>
                <input type="number" class="qty-input-small" value="${item.quantity}" readonly>
                <button class="qty-btn-small" onclick="updatePlanQty(${index}, '${type}', 1)">+</button>
                <button class="remove-btn" onclick="removePlanItem(${index}, '${type}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function updatePlanQty(index, type, change) {
    const planArray = type === 'buy' ? app.dailyPlan.toBuy : app.dailyPlan.toSell;
    planArray[index].quantity = Math.max(1, planArray[index].quantity + change);
    app.saveData();
    updatePlanningList(type);
    updateSummary();
}

function removePlanItem(index, type) {
    const planArray = type === 'buy' ? app.dailyPlan.toBuy : app.dailyPlan.toSell;
    planArray.splice(index, 1);
    app.saveData();
    updatePlanningList(type);
    updateSummary();
}

function updateSummary() {
    let buyQty = 0, buyCost = 0;
    let sellQty = 0, sellRevenue = 0;

    app.dailyPlan.toBuy.forEach(item => {
        buyQty += item.quantity;
        buyCost += item.quantity * item.price;
    });

    app.dailyPlan.toSell.forEach(item => {
        sellQty += item.quantity;
        sellRevenue += item.quantity * item.price;
    });

    document.getElementById('summaryBuyQty').textContent = buyQty;
    document.getElementById('summaryBuyCost').textContent = '₹' + buyCost.toLocaleString();
    document.getElementById('summarySellQty').textContent = sellQty;
    document.getElementById('summarySellRevenue').textContent = '₹' + sellRevenue.toLocaleString();
}

function saveDailyPlan() {
    app.saveData();
    showToast('Daily plan saved successfully', 'success');
}

// ===== QUICK TRANSACTIONS =====
function updateQty(type, change) {
    const input = document.getElementById(type + 'Input');
    input.value = Math.max(1, parseInt(input.value) + change);
}

function addQuickBuy() {
    const productId = document.getElementById('buyProductSelect').value;
    const quantity = parseInt(document.getElementById('buyQtyInput').value);
    const price = parseFloat(document.getElementById('buyPriceInput').value);
    const supplier = document.getElementById('buySupplierInput').value;

    if (!productId) {
        showToast('Please select a product', 'warning');
        return;
    }

    if (!price || price <= 0) {
        showToast('Please enter a valid price', 'warning');
        return;
    }

    const product = app.products.find(p => p.id === parseInt(productId));
    product.quantity += quantity;

    app.transactions.unshift({
        type: 'buy',
        productId: parseInt(productId),
        productName: product.name,
        quantity: quantity,
        price: price,
        supplier: supplier,
        total: quantity * price,
        timestamp: new Date().toLocaleString()
    });

    app.saveData();
    showToast(`Purchase recorded: ${quantity} × ${product.name}`, 'success');
    
    // Reset form
    document.getElementById('buyProductSelect').value = '';
    document.getElementById('buyQtyInput').value = '1';
    document.getElementById('buyPriceInput').value = '';
    document.getElementById('buySupplierInput').value = '';
    
    updateDashboard();
    renderTransactions();
}

function addQuickSell() {
    const productId = document.getElementById('sellProductSelect').value;
    const quantity = parseInt(document.getElementById('sellQtyInput').value);
    const price = parseFloat(document.getElementById('sellPriceInput').value);
    const buyerName = document.getElementById('buyerNameInput').value;

    if (!productId) {
        showToast('Please select a product', 'warning');
        return;
    }

    if (!price || price <= 0) {
        showToast('Please enter a valid price', 'warning');
        return;
    }

    const product = app.products.find(p => p.id === parseInt(productId));

    if (product.quantity < quantity) {
        showToast(`Insufficient stock. Available: ${product.quantity}`, 'error');
        return;
    }

    product.quantity -= quantity;

    app.transactions.unshift({
        type: 'sale',
        productId: parseInt(productId),
        productName: product.name,
        quantity: quantity,
        price: price,
        buyerName: buyerName,
        total: quantity * price,
        timestamp: new Date().toLocaleString()
    });

    app.saveData();
    showToast(`Sale recorded: ${quantity} × ${product.name}`, 'success');
    
    // Reset form
    document.getElementById('sellProductSelect').value = '';
    document.getElementById('sellQtyInput').value = '1';
    document.getElementById('sellPriceInput').value = '';
    document.getElementById('buyerNameInput').value = '';
    
    updateDashboard();
    renderTransactions();
}

function renderTransactions() {
    const historyDiv = document.getElementById('transactionHistory');

    if (app.transactions.length === 0) {
        historyDiv.innerHTML = '<p class="empty-state">No transactions yet</p>';
        return;
    }

    historyDiv.innerHTML = app.transactions.slice(0, 50).map(transaction => `
        <div class="transaction-item ${transaction.type === 'sale' ? 'sale' : ''}">
            <div class="transaction-header">
                <div class="transaction-type">
                    <i class="fas ${transaction.type === 'sale' ? 'fa-shopping-cart' : 'fa-dolly'}"></i>
                    ${transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                </div>
                <div class="transaction-time">${transaction.timestamp}</div>
            </div>
            <div class="transaction-detail">
                <div class="detail-row">
                    <span class="detail-label">Product:</span>
                    <span class="detail-value">${transaction.productName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span class="detail-value">${transaction.quantity} units</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Unit Price:</span>
                    <span class="detail-value">₹${transaction.price.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value" style="font-weight: 700; color: var(--primary-color);">₹${transaction.total.toLocaleString()}</span>
                </div>
                ${transaction.supplier ? `<div class="detail-row"><span class="detail-label">Supplier:</span><span class="detail-value">${transaction.supplier}</span></div>` : ''}
                ${transaction.buyerName ? `<div class="detail-row"><span class="detail-label">Customer:</span><span class="detail-value">${transaction.buyerName}</span></div>` : ''}
            </div>
        </div>
    `).join('');
}

// ===== UTILITIES =====
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-IN', options);
    document.getElementById('currentDate').textContent = today;
}

function updateBottomNav(tabName) {
    document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'dashboard') {
        document.getElementById('dashboardQuickBtn').classList.add('active');
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} active`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function setupTooltips() {
    document.addEventListener('mouseover', (e) => {
        if (e.target.hasAttribute('data-tooltip')) {
            const tooltip = document.getElementById('tooltip');
            tooltip.textContent = e.target.getAttribute('data-tooltip');
            tooltip.classList.add('active');
            tooltip.style.left = (e.target.offsetLeft + e.target.offsetWidth / 2 - 50) + 'px';
            tooltip.style.top = (e.target.offsetTop - 40) + 'px';
        }
    });

    document.addEventListener('mouseout', () => {
        document.getElementById('tooltip').classList.remove('active');
    });
}

app.setupTooltips = setupTooltips;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    renderProducts();
});
