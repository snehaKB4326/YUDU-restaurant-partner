/**
 * YUDU Restaurant Partner Portal - Page 1: Home Dashboard
 * Exact match with reference screenshot 1
 */

(function () {
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }

    function renderHome(container) {
        const state = YUDUStore.getState();
        const r = state.restaurant;
        const greeting = getGreeting();

        // Filter active live orders (new and preparing)
        const liveOrders = state.orders.filter(o => o.status === 'new' || o.status === 'preparing');
        const activeCount = liveOrders.length;

        container.innerHTML = `
            <div class="page-container animate-fade-in">
                <!-- Top Header -->
                <header class="page-header">
                    <div class="header-titles">
                        <h1 class="page-title">${greeting}, ${r.name}</h1>
                        <p class="page-subtitle">Here's what's happening at your restaurant today.</p>
                    </div>
                    <div class="header-actions">
                        <div class="search-input-wrap">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="global-search-input" class="search-field" placeholder="Search orders, dishes..." />
                        </div>
                        <button class="btn btn-outline" id="home-export-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export
                        </button>
                        <button class="icon-btn" id="notif-bell-btn" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter(n => n.unread).length > 0 ? 'active' : ''}">${state.notifications.filter(n => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Restaurant Online Status Card -->
                <div class="status-banner-card">
                    <div class="status-left">
                        <span class="status-indicator-dot ${r.isOnline ? 'online' : 'offline'}"></span>
                        <div class="status-texts">
                            <div class="status-heading">${r.isOnline ? 'Restaurant is Online' : 'Restaurant is Offline'}</div>
                            <div class="status-sub">${r.isOnline ? `Accepting orders until ${r.acceptUntil}` : 'Currently paused. Not accepting incoming orders.'}</div>
                        </div>
                    </div>
                    <div class="status-right">
                        <span class="badge-pill light-purple">${r.openDaysText}</span>
                        <label class="toggle-switch" title="Toggle online status">
                            <input type="checkbox" id="online-toggle-checkbox" ${r.isOnline ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- 4 Performance Stat Cards -->
                <div class="stats-grid-4">
                    <!-- Today's Orders -->
                    <div class="stat-card">
                        <div class="stat-top">
                            <span class="stat-title">Today's Orders</span>
                            <div class="stat-icon-pill purple-pill">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                            </div>
                        </div>
                        <div class="stat-value">${r.stats.todayOrders}</div>
                        <div class="stat-change positive">${r.stats.ordersChange}</div>
                    </div>

                    <!-- Revenue -->
                    <div class="stat-card">
                        <div class="stat-top">
                            <span class="stat-title">Revenue</span>
                            <div class="stat-icon-pill green-pill">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                            </div>
                        </div>
                        <div class="stat-value">${r.stats.revenue}</div>
                        <div class="stat-change positive">${r.stats.revenueChange}</div>
                    </div>

                    <!-- Avg Prep Time -->
                    <div class="stat-card">
                        <div class="stat-top">
                            <span class="stat-title">Avg. Prep Time</span>
                            <div class="stat-icon-pill yellow-pill">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                        </div>
                        <div class="stat-value">${r.stats.avgPrepTime}</div>
                        <div class="stat-change positive">${r.stats.avgPrepChange}</div>
                    </div>

                    <!-- Rating -->
                    <div class="stat-card" id="home-stat-rating-card" title="View customer reviews and ratings" style="cursor: pointer;">
                        <div class="stat-top">
                            <span class="stat-title">Rating</span>
                            <div class="stat-icon-pill star-pill">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </div>
                        </div>
                        <div class="stat-value">${r.stats.rating}</div>
                        <div class="stat-change neutral">${r.stats.reviews}</div>
                    </div>
                </div>

                <!-- Main Content Row: Live Orders (Left) & Orders this week (Right) -->
                <div class="dashboard-split-grid">
                    <!-- Left: Live Orders Section -->
                    <div class="live-orders-section">
                        <div class="section-header-row">
                            <div class="title-with-badge">
                                <h2 class="section-title">Live Orders</h2>
                                <span class="badge-pill count-badge" id="live-active-badge">${activeCount} active</span>
                            </div>
                            <a href="#orders" class="link-action">View all</a>
                        </div>

                        <div class="order-cards-list" id="home-orders-list">
                            ${renderLiveOrderCards(liveOrders)}
                        </div>
                    </div>

                    <!-- Right: Orders This Week Bar Chart -->
                    <div class="chart-section-card">
                        <div class="section-header-row">
                            <h2 class="section-title">Orders this week</h2>
                            <span class="badge-pill light-purple">Last 7 days</span>
                        </div>
                        <div id="home-weekly-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners
        attachHomeEvents(container);
    }

    function renderLiveOrderCards(orders) {
        if (!orders || orders.length === 0) {
            return `
                <div class="empty-orders-state">
                    <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M18 11v11M6 2v7a3 3 0 0 0 6 0V2M9 12v10M6 2h6"></path></svg></div>
                    <div class="empty-title">No live incoming orders right now</div>
                    <div class="empty-desc">New customer orders will appear here automatically with instant chime.</div>
                </div>
            `;
        }

        return orders.map(order => {
            const isNew = order.status === 'new';
            const isPreparing = order.status === 'preparing';

            let centerContent = '';
            if (isNew) {
                centerContent = `
                    <div class="order-action-buttons">
                        <button class="btn btn-sm btn-accept" data-accept-id="${order.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Accept
                        </button>
                        <button class="btn btn-sm btn-reject" data-reject-id="${order.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Reject
                        </button>
                    </div>
                `;
            } else if (isPreparing) {
                centerContent = `
                    <div class="prep-progress-wrap">
                        <div class="prep-time-text">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${order.readyIn || 'Ready soon'}</span>
                        </div>
                        <div class="prep-progress-bar">
                            <div class="prep-progress-fill" style="width: ${order.progress || 50}%;"></div>
                        </div>
                    </div>
                `;
            }

            let statusPill = '';
            if (isNew) {
                statusPill = `<span class="order-status-badge new-badge"><span class="badge-dot"></span>New order</span>`;
            } else if (isPreparing) {
                statusPill = `<span class="order-status-badge preparing-badge"><span class="badge-dot"></span>Preparing</span>`;
            }

            return `
                <div class="live-order-card" data-order-id="${order.id}">
                    <div class="order-left-info">
                        <div class="customer-avatar-initials">${order.initials}</div>
                        <div class="order-id-customer">
                            <a href="#order-details?id=${order.id}" class="order-id-link" title="View order details"><strong class="order-id-num">#${order.id}</strong></a>
                            <div class="order-customer-items">${order.customer} · ${order.itemCount} items</div>
                        </div>
                    </div>

                    <div class="order-middle-actions">
                        ${centerContent}
                    </div>

                    <div class="order-right-price-status">
                        <div class="order-amount-text">₹${order.amount.toLocaleString()}</div>
                        ${statusPill}
                    </div>
                </div>
            `;
        }).join('');
    }

    function attachHomeEvents(container) {
        // Toggle Online Status
        const onlineToggle = container.querySelector('#online-toggle-checkbox');
        if (onlineToggle) {
            onlineToggle.addEventListener('change', (e) => {
                const isOnline = e.target.checked;
                YUDUStore.setRestaurantOnline(isOnline);
                const dot = container.querySelector('.status-indicator-dot');
                const heading = container.querySelector('.status-heading');
                const sub = container.querySelector('.status-sub');

                if (isOnline) {
                    dot.className = 'status-indicator-dot online';
                    heading.textContent = 'Restaurant is Online';
                    sub.textContent = 'Accepting orders until 11:00 PM';
                    YUDUUI.showToast('Restaurant is now ONLINE. Receiving customer orders.', 'success');
                } else {
                    dot.className = 'status-indicator-dot offline';
                    heading.textContent = 'Restaurant is Offline';
                    sub.textContent = 'Currently paused. Not accepting incoming orders.';
                    YUDUUI.showToast('Restaurant is now OFFLINE. Inflow paused.', 'warning');
                }
            });
        }

        // Render Weekly Chart
        YUDUUI.renderWeeklyBarChart('home-weekly-chart', { height: 180 });

        // Export button
        const exportBtn = container.querySelector('#home-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                YUDUUI.exportWeeklyOrdersReport();
            });
        }

        // Rating card click -> navigate to #reviews
        const ratingCard = container.querySelector('#home-stat-rating-card');
        if (ratingCard) {
            ratingCard.addEventListener('click', () => {
                location.hash = '#reviews';
            });
        }

        // Order Action buttons (Accept & Reject)
        const ordersList = container.querySelector('#home-orders-list');
        if (ordersList) {
            ordersList.addEventListener('click', (e) => {
                const acceptBtn = e.target.closest('[data-accept-id]');
                if (acceptBtn) {
                    const orderId = acceptBtn.getAttribute('data-accept-id');
                    /* COMMENTED OUT: Delivery partner popup on Accept
                    YUDUUI.openDeliveryPartnerModal(orderId, () => {
                        renderHome(container);
                    });
                    */
                    return;
                }

                const rejectBtn = e.target.closest('[data-reject-id]');
                if (rejectBtn) {
                    const orderId = rejectBtn.getAttribute('data-reject-id');
                    YUDUUI.openRejectOrderModal(orderId, (reason) => {
                        YUDUStore.rejectOrder(orderId, reason);
                        YUDUUI.showToast(`Order #${orderId} declined.`, 'error');
                        renderHome(container);
                    });
                    return;
                }

                // If clicked on order card itself, navigate to order details page
                const card = e.target.closest('.live-order-card');
                if (card && !e.target.closest('button')) {
                    if (e.target.closest('a')) return;
                    const orderId = card.getAttribute('data-order-id');
                    if (orderId) {
                        location.hash = '#order-details?id=' + encodeURIComponent(orderId);
                    }
                }
            });
        }
    }

    window.renderHomePage = renderHome;
})();
