/**
 * YUDU Restaurant Partner Portal - Page 3: Menu Management
 * Exact match with reference screenshot 3
 */

(function () {
    let currentCategory = 'biryani'; // Default as in screenshot
    let searchQuery = '';
    let filterOptions = {
        minPrice: '',
        maxPrice: '',
        foodType: 'all',
        stockStatus: 'all'
    };

    // Helper to check if a category is dessert
    function isDessertCategory(cat) {
        if (!cat) return false;
        const c = cat.toLowerCase().trim();
        return c === 'desserts' || c === 'dessert' || c === 'deserts' || c === 'desert';
    }

    // Helper to match category handling singular/plural and deserts/desserts spelling
    function isCategoryMatch(dishCategory, targetCategory) {
        if (targetCategory === 'all') return true;
        if (!dishCategory) return false;
        const d = dishCategory.toLowerCase().trim();
        const t = targetCategory.toLowerCase().trim();
        if (d === t) return true;

        // Strict dessert category check
        const targetIsDessert = isDessertCategory(t);
        const dishIsDessert = isDessertCategory(d);
        if (targetIsDessert || dishIsDessert) {
            return targetIsDessert && dishIsDessert;
        }

        if ((t.startsWith('curri') || t.startsWith('curry')) && (d.startsWith('curri') || d.startsWith('curry'))) {
            return true;
        }
        if (t.startsWith('starter') && d.startsWith('starter')) {
            return true;
        }
        if (t.startsWith('beverag') && d.startsWith('beverag')) {
            return true;
        }
        if (t.startsWith('biryani') && d.startsWith('biryani')) {
            return true;
        }
        return false;
    }

    function renderMenu(container) {
        const state = YUDUStore.getState();
        const allDishes = state.dishes;

        // Categories definitions
        const categories = [
            { key: 'all', label: `All ${allDishes.length}` },
            { key: 'biryani', label: 'Biryani' },
            { key: 'starters', label: 'Starters' },
            { key: 'curries', label: 'Curries' },
            { key: 'desserts', label: 'Desserts' },
            { key: 'beverages', label: 'Beverages' }
        ];

        // Apply filters
        const filteredDishes = allDishes.filter(dish => {
            // Category filter: when desserts is selected, show strictly only desserts
            if (currentCategory !== 'all') {
                if (isDessertCategory(currentCategory)) {
                    if (!isDessertCategory(dish.category)) return false;
                } else if (!isCategoryMatch(dish.category, currentCategory)) {
                    return false;
                }
            }
            // Search query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = dish.name.toLowerCase().includes(q);
                const matchDesc = dish.description.toLowerCase().includes(q);
                if (!matchName && !matchDesc) return false;
            }
            // Food type filter
            if (filterOptions.foodType !== 'all' && dish.foodType !== filterOptions.foodType) {
                return false;
            }
            // Stock status filter
            if (filterOptions.stockStatus === 'in-stock' && !dish.inStock) {
                return false;
            }
            if (filterOptions.stockStatus === 'sold-out' && dish.inStock) {
                return false;
            }
            // Price range filter
            if (filterOptions.minPrice && dish.sellingPrice < Number(filterOptions.minPrice)) {
                return false;
            }
            if (filterOptions.maxPrice && dish.sellingPrice > Number(filterOptions.maxPrice)) {
                return false;
            }

            return true;
        });

        // Category count for label
        const categoryTotal = currentCategory === 'all' 
            ? allDishes.length 
            : allDishes.filter(d => isCategoryMatch(d.category, currentCategory)).length;

        const countText = currentCategory === 'all' 
            ? `Showing ${filteredDishes.length} of ${allDishes.length} dishes`
            : `Showing ${filteredDishes.length} of ${categoryTotal} ${currentCategory} dishes`;

        container.innerHTML = `
            <div class="page-container animate-fade-in">
                <!-- Header -->
                <header class="page-header">
                    <div class="header-titles">
                        <h1 class="page-title">Menu</h1>
                        <p class="page-subtitle">${allDishes.length} dishes across 6 categories</p>
                    </div>
                    <div class="header-actions">
                        <div class="search-input-wrap">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="menu-search-input" class="search-field" placeholder="Search dishes..." value="${searchQuery}" />
                        </div>
                        <button class="btn btn-outline" id="menu-filter-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                            Filters
                        </button>
                        <button class="btn btn-primary" id="menu-add-dish-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add dish
                        </button>
                        <button class="icon-btn" id="notif-bell-btn-3" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter(n => n.unread).length > 0 ? 'active' : ''}">${state.notifications.filter(n => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Category Tabs Row -->
                <div class="menu-tabs-bar">
                    <div class="category-tabs-list">
                        ${categories.map(cat => `
                            <button class="category-tab-btn ${currentCategory === cat.key ? 'active' : ''}" data-cat="${cat.key}">
                                ${cat.label}
                            </button>
                        `).join('')}
                    </div>
                    <div class="category-count-label">${countText}</div>
                </div>

                <!-- Dishes Grid -->
                <div class="dishes-grid" id="dishes-cards-grid">
                    ${renderDishCards(filteredDishes)}
                    
                    <!-- Add New Dish Dashed Card -->
                    <div class="add-dish-dashed-card" id="add-dish-card-trigger">
                        <div class="plus-icon-circle">+</div>
                        <div class="add-dish-text">Add new dish</div>
                        <div class="add-dish-sub">Add photo, price and description</div>
                    </div>
                </div>
            </div>
        `;

        attachMenuEvents(container);
    }

    function renderDishCards(dishes) {
        if (!dishes || dishes.length === 0) {
            return `
                <div class="empty-category-state" style="grid-column: 1 / -1; padding: 50px 24px; text-align: center; background: #FFFFFF; border: 1px dashed var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                    <div style="font-size: 40px; margin-bottom: 12px;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M18 11v11M6 2v7a3 3 0 0 0 6 0V2M9 12v10M6 2h6"></path></svg></div>
                    <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">No dishes in this category</h3>
                    <p style="font-size: 13px; color: var(--text-secondary); max-width: 440px; margin: 0 auto 18px; line-height: 1.4;">
                        No dishes currently match your selected category and filter criteria. You can add a new dish or reset active filters.
                    </p>
                    <button type="button" class="btn btn-outline" id="menu-empty-reset-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
                        Reset All Filters
                    </button>
                </div>
            `;
        }

        return dishes.map(dish => {
            // Veg / Non-veg indicator symbol
            const isVeg = dish.foodType === 'veg';
            const vegIcon = isVeg 
                ? `<div class="veg-symbol-badge veg" title="Vegetarian"><div class="veg-circle"></div></div>`
                : `<div class="veg-symbol-badge non-veg" title="Non-Vegetarian"><div class="non-veg-circle"></div></div>`;

            // Top-left tag badge (e.g. Bestseller, New, Sold out)
            let tagBadge = '';
            if (dish.tags && dish.tags.includes('Bestseller')) {
                tagBadge = `<span class="dish-badge bestseller-tag">Bestseller</span>`;
            } else if (dish.tags && dish.tags.includes('New')) {
                tagBadge = `<span class="dish-badge new-tag">New</span>`;
            } else if (!dish.inStock || (dish.tags && dish.tags.includes('Sold out'))) {
                tagBadge = `<span class="dish-badge soldout-tag">Sold out</span>`;
            }

            const isDessert = isDessertCategory(dish.category);
            const defaultFallback = isDessert ? 'assets/gulab-jamun.jpg' : 'assets/chicken-biryani.png';
            const fallbackSrc = dish.fallbackImage || defaultFallback;

            return `
                <div class="food-card ${!dish.inStock ? 'is-out-of-stock' : ''}" data-dish-id="${dish.id}">
                    <div class="food-card-img-wrap">
                        <img src="${dish.image}" alt="${dish.name}" class="food-card-img" onerror="this.onerror=null; this.src='${fallbackSrc}';" loading="lazy" />
                        ${tagBadge}
                        ${vegIcon}
                    </div>
                    <div class="food-card-content">
                        <h3 class="food-dish-name">${dish.name}</h3>
                        <p class="food-dish-desc">${dish.description}</p>
                        
                        <div class="food-price-row">
                            <div class="price-serves">
                                <span class="price-val">₹${dish.sellingPrice}</span>
                                <span class="serves-val">· ${dish.serves || 'serves 1'}</span>
                            </div>
                            <div class="rating-val">
                                <span class="star-icon">★</span> ${dish.rating || '4.5'}
                            </div>
                        </div>

                        <div class="food-card-footer">
                            <div class="stock-indicator ${dish.inStock ? 'in-stock' : 'sold-out'}">
                                <span class="stock-dot"></span>
                                <span class="stock-label">${dish.inStock ? 'In stock' : 'Sold out'}</span>
                            </div>
                            <div class="food-card-actions">
                                <button class="btn btn-xs btn-edit-dish" data-edit-dish="${dish.id}">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    Edit
                                </button>
                                <label class="toggle-switch-sm" title="Toggle item availability">
                                    <input type="checkbox" class="dish-stock-toggle" data-dish-id="${dish.id}" ${dish.inStock ? 'checked' : ''}>
                                    <span class="toggle-slider-sm"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function openFilterModal(container) {
        const modalHtml = `
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Filter Menu Items</h3>
                    <p class="modal-subtitle">Narrow down dishes by category, dietary preference and stock.</p>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Food Type</label>
                    <div class="dietary-filter-group">
                        <label class="radio-pill ${filterOptions.foodType === 'all' ? 'active' : ''}">
                            <input type="radio" name="diet" value="all" ${filterOptions.foodType === 'all' ? 'checked' : ''}> All Types
                        </label>
                        <label class="radio-pill ${filterOptions.foodType === 'veg' ? 'active' : ''}">
                            <input type="radio" name="diet" value="veg" ${filterOptions.foodType === 'veg' ? 'checked' : ''}> Veg
                        </label>
                        <label class="radio-pill ${filterOptions.foodType === 'non-veg' ? 'active' : ''}">
                            <input type="radio" name="diet" value="non-veg" ${filterOptions.foodType === 'non-veg' ? 'checked' : ''}> Non-veg
                        </label>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                    <label class="form-label">Availability Status</label>
                    <div class="dietary-filter-group">
                        <label class="radio-pill ${filterOptions.stockStatus === 'all' ? 'active' : ''}">
                            <input type="radio" name="stock" value="all" ${filterOptions.stockStatus === 'all' ? 'checked' : ''}> All
                        </label>
                        <label class="radio-pill ${filterOptions.stockStatus === 'in-stock' ? 'active' : ''}">
                            <input type="radio" name="stock" value="in-stock" ${filterOptions.stockStatus === 'in-stock' ? 'checked' : ''}> In Stock Only
                        </label>
                        <label class="radio-pill ${filterOptions.stockStatus === 'sold-out' ? 'active' : ''}">
                            <input type="radio" name="stock" value="sold-out" ${filterOptions.stockStatus === 'sold-out' ? 'checked' : ''}> Sold Out Only
                        </label>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                    <label class="form-label">Price Range (₹)</label>
                    <div class="form-row-2">
                        <input type="number" id="filter-min-price" class="form-input" placeholder="Min price (e.g. 100)" value="${filterOptions.minPrice}">
                        <input type="number" id="filter-max-price" class="form-input" placeholder="Max price (e.g. 500)" value="${filterOptions.maxPrice}">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" id="reset-filters-btn">Reset All</button>
                <button type="button" class="btn btn-primary" id="apply-filters-btn">Apply Filters</button>
            </div>
        `;

        YUDUUI.openModal(modalHtml, (overlay) => {
            overlay.querySelector('#reset-filters-btn').addEventListener('click', () => {
                filterOptions = { minPrice: '', maxPrice: '', foodType: 'all', stockStatus: 'all' };
                YUDUUI.closeModal();
                renderMenu(container);
                YUDUUI.showToast('Filters reset', 'info');
            });

            overlay.querySelector('#apply-filters-btn').addEventListener('click', () => {
                const diet = overlay.querySelector('input[name="diet"]:checked').value;
                const stock = overlay.querySelector('input[name="stock"]:checked').value;
                const min = overlay.querySelector('#filter-min-price').value;
                const max = overlay.querySelector('#filter-max-price').value;

                filterOptions = {
                    foodType: diet,
                    stockStatus: stock,
                    minPrice: min,
                    maxPrice: max
                };

                YUDUUI.closeModal();
                renderMenu(container);
                YUDUUI.showToast('Filters applied successfully');
            });
        });
    }

    function attachMenuEvents(container) {
        // Category Tabs click
        const catTabs = container.querySelectorAll('.category-tab-btn');
        catTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                currentCategory = btn.getAttribute('data-cat');
                renderMenu(container);
            });
        });

        // Search Dishes
        const searchInput = container.querySelector('#menu-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                renderMenu(container);
                // Keep cursor at end
                const newSearch = container.querySelector('#menu-search-input');
                if (newSearch) {
                    newSearch.focus();
                    newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
                }
            });
        }

        // Filters button
        const filterBtn = container.querySelector('#menu-filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                openFilterModal(container);
            });
        }

        // Reset from empty state
        const emptyResetBtn = container.querySelector('#menu-empty-reset-btn');
        if (emptyResetBtn) {
            emptyResetBtn.addEventListener('click', () => {
                currentCategory = 'all';
                searchQuery = '';
                filterOptions = { minPrice: '', maxPrice: '', foodType: 'all', stockStatus: 'all' };
                renderMenu(container);
                YUDUUI.showToast('All menu filters reset', 'info');
            });
        }

        // Add Dish button -> #edit-dish?mode=new
        const addBtn = container.querySelector('#menu-add-dish-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                location.hash = '#edit-dish?mode=new';
            });
        }

        // Dashed Add New Dish Card
        const dashedCard = container.querySelector('#add-dish-card-trigger');
        if (dashedCard) {
            dashedCard.addEventListener('click', () => {
                location.hash = '#edit-dish?mode=new';
            });
        }

        // Edit Dish buttons
        const grid = container.querySelector('#dishes-cards-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const editBtn = e.target.closest('[data-edit-dish]');
                if (editBtn) {
                    const dishId = editBtn.getAttribute('data-edit-dish');
                    location.hash = `#edit-dish?id=${dishId}`;
                    return;
                }
            });

            // Stock availability toggle switches
            const toggles = grid.querySelectorAll('.dish-stock-toggle');
            toggles.forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const dishId = toggle.getAttribute('data-dish-id');
                    const inStock = toggle.checked;
                    const updated = YUDUStore.toggleDishStock(dishId, inStock);
                    if (updated) {
                        const statusLabel = inStock ? 'In stock' : 'Sold out';
                        YUDUUI.showToast(`"${updated.name}" is now marked as ${statusLabel}`, inStock ? 'success' : 'warning');
                        renderMenu(container);
                    }
                });
            });
        }
    }

    window.renderMenuPage = renderMenu;
})();
