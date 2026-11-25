/**
 * YUDU Restaurant Partner Portal - Page: Order Details
 * Features: Order items, customer & kitchen notes, quick actions: Accept, Mark Ready, Handed to Rider
 */

(function () {
    function renderOrderDetails(container, params = {}) {
        const state = YUDUStore.getState();
        const orderId = params.id || (state.orders[0] ? state.orders[0].id : 'YD-20481');
        let order = YUDUStore.getOrderById(orderId) || state.orders[0];

        if (!order) {
            container.innerHTML = `
                <div class="page-container animate-fade-in">
                    <header class="page-header">
                        <div class="header-titles with-back">
                            <a href="#orders" class="back-nav-btn" title="Back to Orders">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </a>
                            <div>
                                <h1 class="page-title">Order Not Found</h1>
                                <p class="page-subtitle">The requested order could not be located.</p>
                            </div>
                        </div>
                    </header>
                    <div class="empty-orders-card" style="margin-top: 30px;">
                        <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
                        <div class="empty-title">Order #${orderId} was not found</div>
                        <div class="empty-desc">It may have been archived or deleted.</div>
                        <a href="#orders" class="btn btn-primary" style="margin-top: 16px; display: inline-flex;">Back to Orders List</a>
                    </div>
                </div>
            `;
            return;
        }

        // Ensure fallback notes and rider info if not already present
        const customerNotes = order.customerNotes || 'Please prepare food freshly and pack securely with napkins. Contactless delivery at door.';
        const restaurantNotes = order.restaurantNotes || 'Cooking in regular kitchen station. Verify all items before packing.';
        const deliveryNotes = order.deliveryNotes || 'Call customer upon reaching the gate.';
        const rider = order.rider || {
            name: 'Rahul S.',
            initials: 'RS',
            phone: '+91 98481 23456',
            vehicle: 'Hero Splendor · TS 09 EA 4521',
            eta: 'Arriving in ~4 min',
            otp: String(order.id).replace(/\D/g, '').slice(-3) || '481',
            status: order.status === 'completed' ? 'Delivered' : (order.status === 'ready' ? 'Waiting at pickup counter' : 'Assigned to order')
        };
        const riderInitials = rider.initials || (rider.name ? rider.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'RS');

        const isNew = order.status === 'new';
        const isPrep = order.status === 'preparing';
        const isReady = order.status === 'ready';
        const isCompleted = order.status === 'completed';
        const isRejected = order.status === 'rejected';

        // Badge display
        let statusBadgeHtml = '';
        if (isNew) {
            statusBadgeHtml = `<span class="order-status-badge new-badge"><span class="badge-dot"></span>New Order · Action Required</span>`;
        } else if (isPrep) {
            statusBadgeHtml = `<span class="order-status-badge preparing-badge"><span class="badge-dot"></span>In Kitchen (${order.readyIn || 'Cooking'})</span>`;
        } else if (isReady) {
            statusBadgeHtml = `<span class="order-status-badge ready-badge"><span class="badge-dot"></span>Food Ready · Awaiting Rider</span>`;
        } else if (isCompleted) {
            statusBadgeHtml = `<span class="order-status-badge completed-badge"><span class="badge-dot"></span>Handed to Rider / Completed</span>`;
        } else if (isRejected) {
            statusBadgeHtml = `<span class="order-status-badge rejected-badge"><span class="badge-dot"></span>Declined</span>`;
        }

        // Stepper state determination
        const step1Done = true;
        const step2Active = isPrep;
        const step2Done = isReady || isCompleted;
        const step3Active = isReady;
        const step3Done = isCompleted;
        const step4Active = isCompleted;
        const step4Done = isCompleted;

        // Filter food items vs tax/packaging lines if mixed
        const foodItems = order.items.filter(i => !i.isFee && !i.name.toLowerCase().includes('packaging') && !i.name.toLowerCase().includes('taxes'));
        const feeItems = order.items.filter(i => i.isFee || i.name.toLowerCase().includes('packaging') || i.name.toLowerCase().includes('taxes'));

        // Compute subtotal
        let itemsSubtotal = 0;
        foodItems.forEach(i => { itemsSubtotal += (i.price * i.qty); });
        if (itemsSubtotal === 0) itemsSubtotal = order.amount;

        const packagingCharge = order.billDetails ? order.billDetails.packaging : (order.amount > 500 ? 35 : 20);
        const taxesAmount = order.billDetails ? order.billDetails.taxes : Math.round(itemsSubtotal * 0.05);
        const deliveryFee = order.billDetails ? order.billDetails.deliveryFee : 0;
        const grandTotal = order.amount || (itemsSubtotal + packagingCharge + taxesAmount);

        container.innerHTML = `
            <div class="page-container animate-fade-in order-details-page">
                <!-- Top Navigation Header -->
                <header class="page-header order-details-header">
                    <div class="header-titles with-back">
                        <a href="#orders" class="back-nav-btn" id="order-details-back-btn" title="Back to Orders">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </a>
                        <div>
                            <div class="order-breadcrumb-row">
                                <a href="#orders" class="breadcrumb-link">Orders</a>
                                <span class="breadcrumb-sep">/</span>
                                <span class="breadcrumb-current">#${order.id}</span>
                            </div>
                            <div class="order-details-title-row">
                                <h1 class="page-title order-title-num">#${order.id}</h1>
                                ${statusBadgeHtml}
                                <span class="order-time-chip"><svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Placed at ${order.orderTime}</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" id="print-kot-btn" title="Print Kitchen Order Ticket (KOT)">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            Print Bill / KOT
                        </button>
                        <button class="icon-btn" id="notif-bell-btn-details" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter(n => n.unread).length > 0 ? 'active' : ''}">${state.notifications.filter(n => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Top Order Workflow Action Banner (Core Requirements: Accept, Mark Ready, Handed to Rider) -->
                <div class="order-action-card">
                    <div class="order-action-card-header">
                        <div class="action-card-title-group">
                            <span class="action-card-tag">Kitchen Workflow</span>
                            <h2 class="action-card-title">Order Processing Actions</h2>
                            <p class="action-card-desc">Execute kitchen milestones and update rider in real-time.</p>
                        </div>

                        <!-- The 3 Action Buttons -->
                        <div class="order-action-buttons-group">
                            <!-- 1. Accept Button -->
                            <button class="btn btn-action-flow btn-accept-flow ${isNew ? 'active-highlight' : (step2Done || isPrep ? 'flow-completed' : '')}" 
                                id="flow-btn-accept" 
                                data-order-id="${order.id}" 
                                ${(!isNew && !isRejected) ? '' : ''}
                                title="Accept order into kitchen">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>${isNew ? 'Accept Order' : (isRejected ? 'Re-Accept' : 'Accepted')}</span>
                            </button>

                            <!-- 2. Mark Ready Button -->
                            <button class="btn btn-action-flow btn-ready-flow ${isPrep ? 'active-highlight' : (step3Done || isReady ? 'flow-completed' : '')}" 
                                id="flow-btn-ready" 
                                data-order-id="${order.id}"
                                title="Mark food packed and ready for delivery rider">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                <span>${isReady ? 'Food Ready' : (isCompleted ? 'Food Ready' : 'Mark Ready')}</span>
                            </button>

                            <!-- 3. Handed to Rider Button -->
                            <button class="btn btn-action-flow btn-handover-flow ${isReady ? 'active-highlight' : (isCompleted ? 'flow-completed' : '')}" 
                                id="flow-btn-handover" 
                                data-order-id="${order.id}"
                                title="Confirm handover of package to delivery rider">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg>
                                <span>${isCompleted ? 'Handed to Rider' : 'Handed to Rider'}</span>
                            </button>

                            ${isNew ? `
                                <button class="btn btn-outline-danger btn-sm" id="flow-btn-decline" data-order-id="${order.id}" title="Decline this order">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    Decline
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Visual Progress Stepper -->
                    <div class="order-pipeline-stepper">
                        <!-- Step 1: Placed -->
                        <div class="stepper-step completed">
                            <div class="step-icon-circle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div class="step-info">
                                <strong class="step-title">Order Placed</strong>
                                <span class="step-time">${order.orderTime}</span>
                            </div>
                        </div>
                        <div class="stepper-connector ${step2Done || step2Active ? 'completed' : ''}"></div>

                        <!-- Step 2: Preparing -->
                        <div class="stepper-step ${step2Done ? 'completed' : (step2Active ? 'active' : 'upcoming')}">
                            <div class="step-icon-circle">
                                ${step2Done ? 
                                    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` : 
                                    `<span class="step-num">2</span>`
                                }
                            </div>
                            <div class="step-info">
                                <strong class="step-title">In Kitchen</strong>
                                <span class="step-time">${isPrep ? (order.readyIn || 'Cooking') : (step2Done ? 'Prep complete' : 'Waiting accept')}</span>
                            </div>
                        </div>
                        <div class="stepper-connector ${step3Done || step3Active ? 'completed' : ''}"></div>

                        <!-- Step 3: Food Ready -->
                        <div class="stepper-step ${step3Done ? 'completed' : (step3Active ? 'active' : 'upcoming')}">
                            <div class="step-icon-circle">
                                ${step3Done ? 
                                    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` : 
                                    `<span class="step-num">3</span>`
                                }
                            </div>
                            <div class="step-info">
                                <strong class="step-title">Food Ready</strong>
                                <span class="step-time">${isReady ? 'Packed at counter' : (step3Done ? 'Ready' : 'In prep')}</span>
                            </div>
                        </div>
                        <div class="stepper-connector ${step4Done ? 'completed' : ''}"></div>

                        <!-- Step 4: Handed to Rider -->
                        <div class="stepper-step ${step4Done ? 'completed' : (step4Active ? 'active' : 'upcoming')}">
                            <div class="step-icon-circle">
                                ${step4Done ? 
                                    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` : 
                                    `<span class="step-num">4</span>`
                                }
                            </div>
                            <div class="step-info">
                                <strong class="step-title">Handed to Rider</strong>
                                <span class="step-time">${isCompleted ? 'Out for delivery' : 'Pending handover'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Two-Column Grid -->
                <div class="order-details-grid">
                    <!-- Left Column: Items & Notes -->
                    <div class="order-details-left-col">
                        <!-- Card 1: Order Items & Financial Summary -->
                        <div class="content-card items-summary-card">
                            <div class="card-header-row">
                                <div class="card-title-group">
                                    <h3 class="card-title">Order Items</h3>
                                    <span class="card-count-pill">${foodItems.length} items</span>
                                </div>
                                <span class="order-food-diet-tag">Authentic Nizami Kitchen</span>
                            </div>

                            <!-- Items Table / List -->
                            <div class="details-items-list">
                                ${foodItems.map((item, idx) => {
                                    const isVeg = item.veg === true || item.name.toLowerCase().includes('veg') || item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('salan') || item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('thums');
                                    const itemPriceTotal = (item.price * item.qty).toLocaleString();
                                    return `
                                        <div class="detail-item-row">
                                            <div class="detail-item-left">
                                                <div class="item-diet-symbol ${isVeg ? 'diet-veg' : 'diet-nonveg'}" title="${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
                                                    <div class="diet-dot"></div>
                                                </div>
                                                <div class="detail-item-content">
                                                    <div class="detail-item-name-row">
                                                        <strong class="detail-item-name">${escapeHtml(item.name)}</strong>
                                                        <span class="detail-item-qty-badge">${item.qty}x</span>
                                                    </div>
                                                    ${item.notes ? `<div class="detail-item-subnote">${escapeHtml(item.notes)}</div>` : ''}
                                                </div>
                                            </div>
                                            <div class="detail-item-right">
                                                <div class="detail-item-unit-price">₹${item.price} each</div>
                                                <div class="detail-item-total-price">₹${itemPriceTotal}</div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            <!-- Bill Calculation Breakdown -->
                            <div class="details-bill-breakdown">
                                <div class="bill-row">
                                    <span class="bill-label">Items Subtotal</span>
                                    <span class="bill-val">₹${itemsSubtotal.toLocaleString()}</span>
                                </div>
                                <div class="bill-row">
                                    <span class="bill-label">Restaurant Packaging & Boxes</span>
                                    <span class="bill-val">₹${packagingCharge}</span>
                                </div>
                                <div class="bill-row">
                                    <span class="bill-label">GST & Restaurant Taxes (5%)</span>
                                    <span class="bill-val">₹${taxesAmount}</span>
                                </div>
                                ${deliveryFee > 0 ? `
                                    <div class="bill-row">
                                        <span class="bill-label">Delivery Fee (Customer Paid)</span>
                                        <span class="bill-val">₹${deliveryFee}</span>
                                    </div>
                                ` : ''}
                                <div class="bill-row bill-grand-total">
                                    <span class="bill-total-label">Grand Total</span>
                                    <span class="bill-total-val">₹${grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div class="details-payment-bar">
                                <div class="payment-method-badge">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                                    <span>${escapeHtml(order.paymentMethod || 'Paid Online (UPI)')}</span>
                                </div>
                                <div class="payment-status-pill success">
                                    <span class="badge-dot"></span>
                                    <span>${escapeHtml(order.paymentStatus || 'Verified & Paid')}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Card 2: Order Notes (Customer Instructions & Kitchen Notes) -->
                        <div class="content-card notes-section-card">
                            <div class="card-header-row">
                                <div class="card-title-group">
                                    <h3 class="card-title">Order Notes & Special Instructions</h3>
                                </div>
                                <span class="notes-alert-badge">Attention Kitchen Staff</span>
                            </div>

                            <!-- Customer Notes Highlight Box -->
                            <div class="customer-instructions-box">
                                <div class="instructions-header">
                                    <div class="inst-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div>
                                    <div>
                                        <strong class="inst-heading">Customer Cooking & Packing Request</strong>
                                        <span class="inst-sub">Direct request from customer ${escapeHtml(order.customer)}</span>
                                    </div>
                                </div>
                                <p class="customer-instructions-text">"${escapeHtml(customerNotes)}"</p>
                                
                                <div class="instruction-tags-row">
                                    <span class="inst-tag-pill"><svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c1 3 3.5 3 3.5 6.5a3.5 3.5 0 1 1-7 0C8.5 5 11 5 12 2z"></path></svg> Extra Spicy</span>
                                    <span class="inst-tag-pill"><svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Extra Onions & Lemons</span>
                                    <span class="inst-tag-pill"><svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> No Plastic Cutlery</span>
                                    <span class="inst-tag-pill"><svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Contactless Delivery</span>
                                </div>
                            </div>

                            <!-- Delivery Rider Notes -->
                            <div class="delivery-rider-instructions-box">
                                <div class="delivery-note-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
                                <div class="delivery-note-content">
                                    <strong>Delivery Instruction:</strong> ${escapeHtml(deliveryNotes)}
                                </div>
                            </div>

                            <!-- Internal Restaurant / Kitchen Notes (Editable & Savable) -->
                            <div class="internal-kitchen-notes-area">
                                <label class="kitchen-notes-label" for="kitchen-note-input">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Internal Restaurant & Kitchen Staff Notes
                                </label>
                                <textarea id="kitchen-note-input" class="form-input kitchen-textarea" rows="2" placeholder="e.g. Cooking in handi #2. Extra salan packet added.">${escapeHtml(restaurantNotes)}</textarea>
                                <div class="kitchen-notes-footer">
                                    <span class="kitchen-note-hint">Visible only to your restaurant team</span>
                                    <button class="btn btn-sm btn-outline" id="save-kitchen-note-btn">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Customer Details, Rider Details & Timeline -->
                    <div class="order-details-right-col">
                        <!-- Card 3: Customer Information -->
                        <div class="content-card customer-details-card">
                            <h3 class="card-title" style="margin-bottom: 14px;">Customer Details</h3>
                            <div class="customer-profile-row">
                                <div class="customer-avatar-initials customer-avatar-lg">${escapeHtml(order.initials || 'CU')}</div>
                                <div>
                                    <div class="customer-name-bold">${escapeHtml(order.customer)}</div>
                                    <div class="customer-badge-pill">Verified YUDU Customer</div>
                                </div>
                            </div>

                            <div class="customer-contact-list">
                                <div class="contact-info-item">
                                    <div class="contact-item-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    </div>
                                    <div class="contact-item-text">
                                        <span class="contact-label">Phone Number</span>
                                        <strong class="contact-value">${escapeHtml(order.phone || '+91 98480 22334')}</strong>
                                    </div>
                                    <a href="tel:${order.phone}" class="btn btn-xs btn-outline" style="margin-left: auto;">Call</a>
                                </div>

                                <div class="contact-info-item">
                                    <div class="contact-item-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    </div>
                                    <div class="contact-item-text">
                                        <span class="contact-label">Delivery Address</span>
                                        <span class="contact-address-text">${escapeHtml(order.address)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card 4: Delivery Rider Information & Handover Security PIN -->
                        <div class="content-card rider-details-card">
                            <div class="card-header-row">
                                <h3 class="card-title">Delivery Partner</h3>
                                <span class="rider-status-live-chip">${escapeHtml(rider.status || 'Assigned')}</span>
                            </div>

                            <div class="rider-profile-row">
                                <div class="rider-profile-avatar dp-profile-${riderInitials.toLowerCase()}">${escapeHtml(riderInitials)}</div>
                                <div class="rider-info-col">
                                    <div class="rider-name-bold">${escapeHtml(rider.name)}</div>
                                    <div class="rider-vehicle-text">${escapeHtml(rider.vehicle)}</div>
                                    <div class="rider-eta-text"><svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${escapeHtml(rider.eta)}</div>
                                </div>
                                <a href="tel:${rider.phone}" class="btn btn-xs btn-outline" style="margin-left: auto;">Call Rider</a>
                            </div>

                            <!-- Security Handover OTP Box -->
                            <div class="handover-pin-box">
                                <div class="pin-box-left">
                                    <span class="pin-sub-label">Rider Handover Verification PIN</span>
                                    <strong class="pin-number-bold">${rider.otp}</strong>
                                </div>
                                <div class="pin-verify-status">
                                    ${isCompleted ? '<svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified & Handed' : 'Verify Before Handover'}
                                </div>
                            </div>
                            <p class="pin-instruction-text">Ask the delivery rider to quote this 3-digit OTP before handing over the food package.</p>
                        </div>

                        <!-- Card 5: Order Timeline -->
                        <div class="content-card order-timeline-card">
                            <h3 class="card-title" style="margin-bottom: 12px;">Order Activity Log</h3>
                            <div class="timeline-items-list">
                                <div class="timeline-event-row completed">
                                    <div class="timeline-bullet"></div>
                                    <div class="timeline-event-content">
                                        <strong>Order Received</strong>
                                        <span class="event-time">${order.orderTime} · Customer placed order via YUDU App</span>
                                    </div>
                                </div>
                                <div class="timeline-event-row ${!isNew ? 'completed' : 'pending'}">
                                    <div class="timeline-bullet"></div>
                                    <div class="timeline-event-content">
                                        <strong>Kitchen Acceptance</strong>
                                        <span class="event-time">${!isNew ? 'Accepted by Biryani Factory kitchen' : 'Pending kitchen acceptance'}</span>
                                    </div>
                                </div>
                                <div class="timeline-event-row ${isReady || isCompleted ? 'completed' : (isPrep ? 'in-progress' : 'pending')}">
                                    <div class="timeline-bullet"></div>
                                    <div class="timeline-event-content">
                                        <strong>Food Preparation & Packaging</strong>
                                        <span class="event-time">${isReady || isCompleted ? 'Prepared and sealed with hygiene sticker' : (isPrep ? 'Currently cooking in kitchen' : 'Queued')}</span>
                                    </div>
                                </div>
                                <div class="timeline-event-row ${isCompleted ? 'completed' : (isReady ? 'in-progress' : 'pending')}">
                                    <div class="timeline-bullet"></div>
                                    <div class="timeline-event-content">
                                        <strong>Handed to Rider (${rider.name})</strong>
                                        <span class="event-time">${isCompleted ? 'Package handed over. Dispatched to customer.' : (isReady ? 'Waiting for rider handover at counter' : 'Awaiting cooking completion')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachOrderDetailsEvents(container, order);
    }

    function attachOrderDetailsEvents(container, order) {
        // Back button
        const backBtn = container.querySelector('#order-details-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    location.hash = '#home';
                }
            });
        }

        // Print KOT
        const printBtn = container.querySelector('#print-kot-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Action Button 1: Accept
        const acceptBtn = container.querySelector('#flow-btn-accept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                YUDUUI.openDeliveryPartnerModal(order.id, () => {
                    renderOrderDetails(container, { id: order.id });
                });
            });
        }

        // Action Button 2: Mark Ready
        const readyBtn = container.querySelector('#flow-btn-ready');
        if (readyBtn) {
            readyBtn.addEventListener('click', () => {
                YUDUStore.updateOrderStatus(order.id, 'ready');
                YUDUUI.showToast(`Order #${order.id} marked as READY for rider pickup!`, 'success');
                renderOrderDetails(container, { id: order.id });
            });
        }

        // Action Button 3: Handed to Rider
        const handoverBtn = container.querySelector('#flow-btn-handover');
        if (handoverBtn) {
            handoverBtn.addEventListener('click', () => {
                YUDUStore.markOrderHandedToRider(order.id);
                YUDUUI.showToast(`Order #${order.id} marked as HANDED TO RIDER! En route to customer.`, 'success');
                renderOrderDetails(container, { id: order.id });
            });
        }

        // Decline Button
        const declineBtn = container.querySelector('#flow-btn-decline');
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                YUDUUI.openRejectOrderModal(order.id, (reason) => {
                    YUDUStore.rejectOrder(order.id, reason);
                    YUDUUI.showToast(`Order #${order.id} declined.`, 'error');
                    renderOrderDetails(container, { id: order.id });
                });
            });
        }

        // Save Kitchen Notes
        const saveNotesBtn = container.querySelector('#save-kitchen-note-btn');
        const notesInput = container.querySelector('#kitchen-note-input');
        if (saveNotesBtn && notesInput) {
            saveNotesBtn.addEventListener('click', () => {
                const noteVal = notesInput.value.trim();
                YUDUStore.updateOrderNotes(order.id, noteVal);
                YUDUUI.showToast(`Kitchen notes saved for order #${order.id}`, 'success');
            });
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    window.renderOrderDetailsPage = renderOrderDetails;
})();
