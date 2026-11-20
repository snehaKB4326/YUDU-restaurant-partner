/**
 * YUDU Restaurant Partner Portal - Page 6: Edit Dish & Add Dish
 * Exact match with reference screenshot 6
 */

(function () {
    function renderEditDish(container, params = {}) {
        const state = YUDUStore.getState();
        const isNewMode = params.mode === 'new' || !params.id;
        
        let dish = null;
        if (!isNewMode) {
            dish = YUDUStore.getDishById(params.id);
        }

        // If dish not found or in new mode, use defaults
        if (!dish) {
            dish = {
                id: '',
                name: isNewMode ? '' : 'Chicken Dum Biryani',
                description: isNewMode ? '' : 'Slow-cooked dum biryani with tender chicken, aged basmati rice and house-ground spices. Served with cooling raita.',
                category: 'biryani',
                foodType: 'non-veg',
                actualPrice: 320,
                sellingPrice: 280,
                serves: '1 person',
                prepTime: 25,
                rating: 4.8,
                tags: ['Bestseller', 'Spicy'],
                inStock: true,
                image: 'assets/chicken-biryani.png'
            };
        } else {
            // Clone so modifications before save don't mutate state directly
            dish = JSON.parse(JSON.stringify(dish));
        }

        const availableTags = ['Bestseller', 'New', 'Spicy', "Chef's special", 'Low oil'];
        const categories = ['Biryani', 'Starters', 'Curries', 'Desserts', 'Beverages'];

        container.innerHTML = `
            <div class="page-container animate-fade-in">
                <!-- Top Header -->
                <header class="page-header">
                    <div class="header-titles with-back">
                        <button class="back-nav-btn" id="edit-dish-back-btn" title="Back to Menu">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <div>
                            <h1 class="page-title">${isNewMode ? 'Add new dish' : 'Edit dish'}</h1>
                            <p class="page-subtitle" id="edit-header-subtitle">${dish.name || 'New dish'} · ${capitalize(dish.category)}</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="icon-btn" id="notif-bell-btn-6" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter(n => n.unread).length > 0 ? 'active' : ''}">${state.notifications.filter(n => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Two Column Grid: Left Form (68%) & Right Live Preview (32%) -->
                <div class="edit-dish-grid">
                    <!-- Left Column: Form -->
                    <div class="dish-form-card">
                        <!-- Dish Photo -->
                        <div class="form-section-block">
                            <h3 class="form-section-title">Dish photo</h3>
                            <div class="photo-upload-row">
                                <div class="photo-preview-box">
                                    <img src="${dish.image}" id="form-photo-img" alt="Dish preview" onerror="this.onerror=null; this.src='${dish.fallbackImage || 'assets/dish-photo-large.png'}';" />
                                </div>
                                <div class="photo-upload-controls">
                                    <div class="photo-guidelines">
                                        <strong>Use a clear, well-lit top-down photo</strong>
                                        <p>JPG or PNG, up to 5 MB. Recommended size 1200 x 800 px.</p>
                                    </div>
                                    <div class="photo-buttons-row">
                                        <label class="btn btn-outline btn-photo-upload" title="Upload new photo">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                            Change photo
                                            <input type="file" id="dish-file-input" accept="image/png, image/jpeg, image/webp" style="display: none;" />
                                        </label>
                                        <button type="button" class="btn btn-outline-danger" id="remove-photo-btn">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Dish Name -->
                        <div class="form-group">
                            <label class="form-label">Dish name</label>
                            <input type="text" id="dish-name-input" class="form-input" placeholder="e.g. Chicken Dum Biryani" value="${escapeHtml(dish.name)}" />
                        </div>

                        <!-- Description -->
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea id="dish-desc-input" class="form-input" rows="3" placeholder="Describe the ingredients, cooking method, flavor profile...">${escapeHtml(dish.longDescription || dish.description)}</textarea>
                        </div>

                        <!-- Category & Food Type -->
                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <div class="select-wrap">
                                    <select id="dish-category-select" class="form-select">
                                        ${categories.map(cat => `
                                            <option value="${cat.toLowerCase()}" ${dish.category.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}>${cat}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Food type</label>
                                <div class="food-type-toggle-group">
                                    <button type="button" class="food-type-pill ${dish.foodType === 'veg' ? 'selected' : ''}" data-type="veg">
                                        <div class="veg-symbol-badge veg"><div class="veg-circle"></div></div>
                                        <span>Veg</span>
                                    </button>
                                    <button type="button" class="food-type-pill ${dish.foodType === 'non-veg' ? 'selected' : ''}" data-type="non-veg">
                                        <div class="veg-symbol-badge non-veg"><div class="non-veg-circle"></div></div>
                                        <span>Non-veg</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Actual price (MRP) & Selling price -->
                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="form-label">Actual price (MRP)</label>
                                <div class="currency-input-wrap">
                                    <span class="currency-symbol">₹</span>
                                    <input type="number" id="dish-mrp-input" class="form-input with-prefix" placeholder="320" value="${dish.actualPrice}" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Selling price</label>
                                <div class="currency-input-wrap">
                                    <span class="currency-symbol">₹</span>
                                    <input type="number" id="dish-price-input" class="form-input with-prefix" placeholder="280" value="${dish.sellingPrice}" />
                                </div>
                            </div>
                        </div>

                        <!-- Serves & Prep time -->
                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="form-label">Serves</label>
                                <input type="text" id="dish-serves-input" class="form-input" placeholder="1 person" value="${escapeHtml(dish.serves)}" />
                            </div>

                            <div class="form-group">
                                <label class="form-label">Prep time</label>
                                <div class="suffix-input-wrap">
                                    <input type="number" id="dish-preptime-input" class="form-input with-suffix" placeholder="25" value="${dish.prepTime}" />
                                    <span class="input-suffix">min</span>
                                </div>
                            </div>
                        </div>

                        <!-- Tags Multi-select -->
                        <div class="form-group">
                            <label class="form-label">Tags</label>
                            <div class="tags-selector-list" id="tags-selector-group">
                                ${availableTags.map(tag => {
                                    const isSelected = dish.tags && dish.tags.includes(tag);
                                    return `
                                        <button type="button" class="tag-selector-btn ${isSelected ? 'selected' : ''}" data-tag="${tag}">
                                            ${isSelected ? '<span class="check-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' : ''}
                                            ${tag}
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Available for Ordering row -->
                        <div class="availability-status-row">
                            <div class="avail-left">
                                <div class="avail-title">Available for ordering</div>
                                <div class="avail-sub">Customers can order this dish while it is in stock.</div>
                            </div>
                            <div class="avail-right">
                                <span class="stock-badge-pill ${dish.inStock ? 'in-stock' : 'sold-out'}" id="form-stock-label">
                                    <span class="badge-dot-sm"></span>
                                    ${dish.inStock ? 'In stock' : 'Sold out'}
                                </span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="form-stock-toggle" ${dish.inStock ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Live Customer Preview & Actions -->
                    <div class="dish-preview-col">
                        <div class="live-preview-card-wrap">
                            <div class="preview-card-heading">Live preview</div>
                            
                            <!-- Customer facing preview card -->
                            <div class="preview-food-card" id="customer-live-card">
                                <div class="preview-img-container">
                                    <img src="${dish.image}" id="preview-dish-img" alt="Dish photo" onerror="this.onerror=null; this.src='${dish.fallbackImage || 'assets/dish-photo-large.png'}';" />
                                    <span class="dish-badge bestseller-tag ${dish.tags && dish.tags.includes('Bestseller') ? '' : 'hide'}" id="preview-bestseller-badge">Bestseller</span>
                                    <span class="dish-badge new-tag ${dish.tags && dish.tags.includes('New') && (!dish.tags || !dish.tags.includes('Bestseller')) ? '' : 'hide'}" id="preview-new-badge">New</span>
                                    <div class="veg-symbol-badge ${dish.foodType}" id="preview-veg-badge">
                                        <div class="${dish.foodType === 'veg' ? 'veg-circle' : 'non-veg-circle'}"></div>
                                    </div>
                                </div>
                                <div class="preview-card-body">
                                    <h4 class="preview-dish-name" id="preview-dish-name">${dish.name || 'Dish Name'}</h4>
                                    <div class="preview-price-serves">
                                        <span class="preview-price-val" id="preview-price-val">₹${dish.sellingPrice || 0}</span>
                                        <span class="preview-serves-val" id="preview-serves-val">· ${dish.serves || 'serves 1'}</span>
                                    </div>
                                </div>
                            </div>

                            <p class="preview-hint-text">This is how the dish appears to customers.</p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="dish-action-buttons">
                            <button class="btn btn-primary btn-block btn-lg" id="save-dish-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Save changes
                            </button>
                            <button class="btn btn-outline btn-block" id="cancel-dish-btn">
                                Cancel
                            </button>
                            ${!isNewMode ? `
                                <button class="btn btn-outline-danger btn-block" id="delete-dish-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    Delete dish
                                </button>
                            ` : ''}
                        </div>

                        <div class="last-updated-note">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>Last updated 12 Nov, 4:20 PM</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachEditDishEvents(container, dish, isNewMode);
    }

    function attachEditDishEvents(container, dish, isNewMode) {
        const nameInput = container.querySelector('#dish-name-input');
        const descInput = container.querySelector('#dish-desc-input');
        const catSelect = container.querySelector('#dish-category-select');
        const mrpInput = container.querySelector('#dish-mrp-input');
        const priceInput = container.querySelector('#dish-price-input');
        const servesInput = container.querySelector('#dish-serves-input');
        const prepInput = container.querySelector('#dish-preptime-input');
        const stockToggle = container.querySelector('#form-stock-toggle');
        const fileInput = container.querySelector('#dish-file-input');
        const removePhotoBtn = container.querySelector('#remove-photo-btn');

        // Preview elements
        const previewName = container.querySelector('#preview-dish-name');
        const previewPrice = container.querySelector('#preview-price-val');
        const previewServes = container.querySelector('#preview-serves-val');
        const previewVeg = container.querySelector('#preview-veg-badge');
        const previewBestseller = container.querySelector('#preview-bestseller-badge');
        const previewNew = container.querySelector('#preview-new-badge');
        const previewImg = container.querySelector('#preview-dish-img');
        const formPhotoImg = container.querySelector('#form-photo-img');
        const subtitle = container.querySelector('#edit-header-subtitle');
        const stockLabel = container.querySelector('#form-stock-label');

        // Reactive input listeners
        nameInput.addEventListener('input', (e) => {
            dish.name = e.target.value;
            previewName.textContent = dish.name || 'Dish Name';
            if (subtitle) subtitle.textContent = `${dish.name || 'New dish'} · ${capitalize(dish.category)}`;
        });

        priceInput.addEventListener('input', (e) => {
            dish.sellingPrice = Number(e.target.value) || 0;
            previewPrice.textContent = `₹${dish.sellingPrice}`;
        });

        servesInput.addEventListener('input', (e) => {
            dish.serves = e.target.value;
            previewServes.textContent = `· ${dish.serves || 'serves 1'}`;
        });

        catSelect.addEventListener('change', (e) => {
            dish.category = e.target.value;
            if (subtitle) subtitle.textContent = `${dish.name || 'New dish'} · ${capitalize(dish.category)}`;
        });

        // Food type toggle
        const typeButtons = container.querySelectorAll('.food-type-pill');
        typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                typeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                dish.foodType = btn.getAttribute('data-type');

                previewVeg.className = `veg-symbol-badge ${dish.foodType}`;
                previewVeg.innerHTML = `<div class="${dish.foodType === 'veg' ? 'veg-circle' : 'non-veg-circle'}"></div>`;
            });
        });

        // Stock toggle
        stockToggle.addEventListener('change', (e) => {
            dish.inStock = e.target.checked;
            if (dish.inStock) {
                stockLabel.className = 'stock-badge-pill in-stock';
                stockLabel.innerHTML = '<span class="badge-dot-sm"></span>In stock';
                dish.tags = dish.tags.filter(t => t !== 'Sold out');
            } else {
                stockLabel.className = 'stock-badge-pill sold-out';
                stockLabel.innerHTML = '<span class="badge-dot-sm"></span>Sold out';
                if (!dish.tags.includes('Sold out')) dish.tags.push('Sold out');
            }
        });

        // Tags multi-selection
        const tagBtns = container.querySelectorAll('.tag-selector-btn');
        tagBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.getAttribute('data-tag');
                if (!dish.tags) dish.tags = [];
                const idx = dish.tags.indexOf(tag);

                if (idx > -1) {
                    dish.tags.splice(idx, 1);
                    btn.classList.remove('selected');
                    btn.innerHTML = tag;
                } else {
                    dish.tags.push(tag);
                    btn.classList.add('selected');
                    btn.innerHTML = `<span class="check-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></span> ${tag}`;
                }

                // Update preview badges
                if (dish.tags.includes('Bestseller')) {
                    previewBestseller.classList.remove('hide');
                    previewNew.classList.add('hide');
                } else {
                    previewBestseller.classList.add('hide');
                    if (dish.tags.includes('New')) {
                        previewNew.classList.remove('hide');
                    } else {
                        previewNew.classList.add('hide');
                    }
                }
            });
        });

        // File upload (Photo change)
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    YUDUUI.showToast('File size must be under 5 MB', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    dish.image = dataUrl;
                    formPhotoImg.src = dataUrl;
                    previewImg.src = dataUrl;
                    YUDUUI.showToast('Photo uploaded successfully');
                };
                reader.readAsDataURL(file);
            }
        });

        // Remove photo
        removePhotoBtn.addEventListener('click', () => {
            dish.image = 'assets/dish-photo-large.png';
            formPhotoImg.src = dish.image;
            previewImg.src = dish.image;
            YUDUUI.showToast('Photo reset to default');
        });

        // Back button
        const backBtn = container.querySelector('#edit-dish-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                location.hash = '#menu';
            });
        }

        // Cancel button
        const cancelBtn = container.querySelector('#cancel-dish-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                location.hash = '#menu';
            });
        }

        // Delete button
        const deleteBtn = container.querySelector('#delete-dish-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                YUDUUI.openDeleteDishModal(dish, () => {
                    YUDUStore.deleteDish(dish.id);
                    YUDUUI.showToast(`"${dish.name}" has been deleted`, 'warning');
                    location.hash = '#menu';
                });
            });
        }

        // Save changes button
        const saveBtn = container.querySelector('#save-dish-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const name = nameInput.value.trim();
                const desc = descInput.value.trim();
                const price = Number(priceInput.value);
                const mrp = Number(mrpInput.value) || price;
                const serves = servesInput.value.trim() || '1 person';
                const prepTime = Number(prepInput.value) || 20;

                if (!name) {
                    YUDUUI.showToast('Please enter a dish name', 'error');
                    nameInput.focus();
                    return;
                }
                if (!price || price <= 0) {
                    YUDUUI.showToast('Please enter a valid selling price', 'error');
                    priceInput.focus();
                    return;
                }

                dish.name = name;
                dish.description = desc || name;
                dish.longDescription = desc || name;
                dish.sellingPrice = price;
                dish.actualPrice = mrp;
                dish.serves = serves;
                dish.prepTime = prepTime;
                dish.category = catSelect.value;
                dish.inStock = stockToggle.checked;

                YUDUStore.saveDish(dish);
                YUDUUI.showToast(`"${dish.name}" saved successfully!`, 'success');
                setTimeout(() => {
                    location.hash = '#menu';
                }, 400);
            });
        }
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    window.renderEditDishPage = renderEditDish;
})();
