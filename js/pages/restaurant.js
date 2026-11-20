/**
 * YUDU Restaurant Partner Portal - Page 2: Restaurant Overview
 * Matching reference screenshot with Store Status (Open / Pause Orders) & Business Hours (Edit Hours)
 */

(function () {
    function renderRestaurant(container) {
        const state = YUDUStore.getState();
        const r = state.restaurant;

        container.innerHTML = `
            <div class="page-container animate-fade-in restaurant-overview-page">
                <!-- Top Header with Back button -->
                <header class="page-header">
                    <div class="header-titles with-back">
                        <button class="back-nav-btn" id="restaurant-back-btn" title="Back to Dashboard">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <div>
                            <h1 class="page-title">Restaurant Overview</h1>
                            <p class="page-subtitle">Performance summary for ${r.name}.</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <div class="search-input-wrap">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" class="search-field" placeholder="Search orders, dishes..." />
                        </div>
                        <button class="btn btn-outline" id="overview-export-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export report
                        </button>
                        <button class="icon-btn" id="notif-bell-btn-2" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter(n => n.unread).length > 0 ? 'active' : ''}">${state.notifications.filter(n => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Purple Gradient Restaurant Info Banner -->
                <div class="restaurant-gradient-banner">
                    <div class="banner-left-profile">
                        <div class="banner-avatar-circle">
                            <span>${r.initials}</span>
                        </div>
                        <div class="banner-info-texts">
                            <h2 class="banner-restaurant-name">${r.name}</h2>
                            <div class="banner-meta-line">
                                Partner ID · ${r.partnerId} · Since ${r.since}
                            </div>
                            <div class="banner-badges-row">
                                <span class="banner-badge verified-badge">
                                    <span class="badge-dot-sm"></span> Verified
                                </span>
                                <span class="banner-badge open-badge ${r.isOnline ? '' : 'paused'}">
                                    ${r.isOnline ? 'Open now' : 'Paused'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="banner-right-details">
                        <div class="banner-detail-item">
                            <svg class="banner-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>${r.address}</span>
                        </div>
                        <div class="banner-detail-item">
                            <svg class="banner-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${r.businessHours.open} - ${r.businessHours.close} · ${r.openDaysText}</span>
                        </div>
                    </div>
                </div>

                <!-- Middle Control Row: 3 Stat Cards + Store Status Card + Business Hours Card -->
                <div class="overview-middle-row">
                    <!-- 1. 3 Compact Performance Stat Cards -->
                    <div class="overview-stats-grid">
                        <!-- Orders -->
                        <div class="stat-card">
                            <div class="stat-title">Orders</div>
                            <div class="stat-value">${r.stats.overviewOrders}</div>
                            <div class="stat-change positive">↑ +12%</div>
                        </div>

                        <!-- Revenue -->
                        <div class="stat-card">
                            <div class="stat-title">Revenue</div>
                            <div class="stat-value">${r.stats.overviewRevenue}</div>
                            <div class="stat-change positive">↑ +9.6%</div>
                        </div>

                        <!-- Accepted -->
                        <div class="stat-card">
                            <div class="stat-title">Accepted</div>
                            <div class="stat-value">${r.stats.overviewAccepted}</div>
                            <div class="stat-change positive">↑ +2%</div>
                        </div>
                    </div>

                    <!-- 2. Store Status Card (Open / Pause Orders) -->
                    <div class="overview-control-card store-status-card">
                        <div>
                            <div class="control-card-header">
                                <div class="control-card-title-wrap">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 9l1-5h16l1 5"></path>
                                        <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"></path>
                                        <path d="M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8"></path>
                                        <path d="M9 21v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"></path>
                                    </svg>
                                    <h3 class="control-card-title">Store Status</h3>
                                </div>
                                <span class="store-status-pill ${r.isOnline ? 'open' : 'paused'}">
                                    <span class="badge-dot-sm"></span>
                                    <span>${r.isOnline ? 'Open' : 'Paused'}</span>
                                </span>
                            </div>
                            <p class="control-card-desc">
                                ${r.isOnline ? 'Your restaurant is accepting orders' : 'Your restaurant is currently paused'}
                            </p>
                        </div>

                        <button class="btn-pause-orders-action ${r.isOnline ? '' : 'paused-mode'}" id="restaurant-toggle-status-btn">
                            ${r.isOnline ? `
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                                </svg>
                                <span>Pause Orders</span>
                            ` : `
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                <span>Open Store</span>
                            `}
                        </button>
                    </div>

                    <!-- 3. Business Hours Card (Edit Hours) -->
                    <div class="overview-control-card business-hours-card">
                        <div>
                            <div class="control-card-header">
                                <div class="control-card-title-wrap">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <h3 class="control-card-title">Business Hours</h3>
                                </div>
                                <button class="btn-edit-hours-pill" id="restaurant-edit-hours-btn" title="Edit restaurant business hours">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    <span>Edit Hours</span>
                                </button>
                            </div>
                            <p class="control-card-desc">Manage your weekly schedule</p>
                        </div>

                        <div class="schedule-lines-wrap">
                            <div class="schedule-line-row">
                                <span class="sched-days">Mon – Fri</span>
                                <span class="sched-colon">:</span>
                                <span class="sched-hours">${r.businessHours.weekdayHours || '09:00 AM - 10:00 PM'}</span>
                            </div>
                            <div class="schedule-line-row">
                                <span class="sched-days">Sat – Sun</span>
                                <span class="sched-colon">:</span>
                                <span class="sched-hours">${r.businessHours.weekendHours || '10:00 AM - 11:00 PM'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Two-Column Grid: Orders this week chart + Top selling items -->
                <div class="overview-bottom-grid">
                    <!-- Left: Orders This Week Bar Chart -->
                    <div class="chart-section-card">
                        <div class="section-header-row">
                            <h2 class="section-title">Orders this week</h2>
                            <span class="badge-pill light-purple">Last 7 days</span>
                        </div>
                        <div id="overview-weekly-chart" class="chart-container"></div>
                    </div>

                    <!-- Right: Top Selling Items Card -->
                    <div class="top-selling-card">
                        <div class="section-header-row">
                            <h2 class="section-title">Top selling items</h2>
                            <a href="#menu" class="link-action">See all</a>
                        </div>
                        <div class="top-selling-list">
                            ${renderTopSellingItems(r.topSellingItems)}
                        </div>
                    </div>
                </div>

                <!-- Application Status Section (Partner View Only - Below Orders This Week Section) -->
                <div id="application-status-mount">
                    ${renderApplicationStatusSectionHtml()}
                </div>
            </div>
        `;

        // Attach events
        attachRestaurantEvents(container);
    }

    function renderTopSellingItems(items) {
        return items.map((item) => `
            <div class="top-selling-row">
                <div class="rank-circle">${item.rank}</div>
                <div class="top-selling-info">
                    <div class="top-selling-name">${item.name}</div>
                    <div class="top-selling-orders">${item.orders}</div>
                </div>
                <div class="top-selling-rev">${item.revenue}</div>
            </div>
        `).join('');
    }

    function attachRestaurantEvents(container) {
        const state = YUDUStore.getState();
        const r = state.restaurant;

        // Back button -> #home
        const backBtn = container.querySelector('#restaurant-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                location.hash = '#home';
            });
        }

        // Export report
        const exportBtn = container.querySelector('#overview-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                YUDUUI.exportWeeklyOrdersReport();
            });
        }

        // Toggle Store Status (Open / Pause Orders)
        const toggleStatusBtn = container.querySelector('#restaurant-toggle-status-btn');
        if (toggleStatusBtn) {
            toggleStatusBtn.addEventListener('click', () => {
                const willBeOnline = !r.isOnline;
                YUDUStore.setRestaurantOnline(willBeOnline);
                if (willBeOnline) {
                    YUDUUI.showToast('Store is now OPEN and accepting orders.', 'success');
                } else {
                    YUDUUI.showToast('Store orders PAUSED. Inflow temporarily stopped.', 'warning');
                }
                renderRestaurant(container);
            });
        }

        // Edit Hours button -> opens Business Hours Modal
        const editHoursBtn = container.querySelector('#restaurant-edit-hours-btn');
        if (editHoursBtn) {
            editHoursBtn.addEventListener('click', () => {
                YUDUUI.openBusinessHoursModal(() => {
                    renderRestaurant(container);
                });
            });
        }

        // Render weekly chart
        YUDUUI.renderWeeklyBarChart('overview-weekly-chart', { height: 210 });

        // Dynamic Live-Sync for Application Status changes made by Admin Dashboard
        function updateAppStatusSection() {
            const mount = container.querySelector('#application-status-mount');
            if (mount) {
                mount.innerHTML = renderApplicationStatusSectionHtml();
            }
        }

        window.addEventListener('yudu-application-status-changed', updateAppStatusSection);

        const appStorageHandler = (e) => {
            if (e.key === 'yudu_admin_data_v2' || 
                e.key === 'yudu_admin_data' || 
                e.key === 'yudu_restaurant_application' || 
                e.key === 'yudu_application_status' || 
                e.key === 'yudu_partner_registration') {
                
                YUDUStore.syncApplicationStatusFromAdmin();
                updateAppStatusSection();
            }
        };
        window.addEventListener('storage', appStorageHandler);

        try {
            const appChannel = new BroadcastChannel('yudu_application_channel');
            appChannel.onmessage = () => {
                YUDUStore.syncApplicationStatusFromAdmin();
                updateAppStatusSection();
            };
        } catch (e) {}
    }

    function renderApplicationStatusSectionHtml() {
        const appData = YUDUStore.getApplicationData();
        const status = appData.status || 'Under Review';
        const r = YUDUStore.getState().restaurant;

        const isPending = status === 'Pending';
        const isUnderReview = status === 'Under Review';
        const isApproved = status === 'Approved';
        const isRejected = status === 'Rejected';

        let badgeClass = 'badge-under-review';
        let badgeLabel = 'Under Review';

        if (isApproved) {
            badgeClass = 'badge-approved';
            badgeLabel = 'Approved';
        } else if (isPending) {
            badgeClass = 'badge-pending';
            badgeLabel = 'Pending';
        } else if (isRejected) {
            badgeClass = 'badge-rejected';
            badgeLabel = 'Rejected';
        }

        let s1Class = 'step-completed';
        let s2Class = isPending ? 'step-pending' : (isUnderReview ? 'step-active' : 'step-completed');
        let s3Class = isApproved ? 'step-completed' : (isRejected ? 'step-rejected' : 'step-waiting');

        return `
            <section class="application-status-section" id="application-status-section">
                <div class="app-status-card">
                    <!-- Top Header Row -->
                    <div class="app-status-card-header">
                        <div class="app-status-header-title-wrap">
                            <div class="app-status-icon-pill">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <path d="M9 15l2 2 4-4"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="app-status-title-row">
                                    <h2 class="section-title app-status-title">Application Status</h2>
                                    <span class="app-status-partner-only-pill" title="Private to Restaurant Partner · Read Only">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        Partner View Only
                                    </span>
                                </div>
                                <p class="app-status-subtitle">Onboarding application and verification status for ${r.name}</p>
                            </div>
                        </div>

                        <div class="app-status-header-right">
                            <!-- Color-Coded Status Badge: Pending | Under Review | Approved | Rejected -->
                            <span class="app-status-badge ${badgeClass}" id="app-status-badge">
                                <span class="badge-dot-sm"></span>
                                <span class="app-status-badge-text">${badgeLabel}</span>
                            </span>
                        </div>
                    </div>

                    <!-- Conditional Alert (ONLY when Under Review) -->
                    ${isUnderReview ? `
                        <div class="app-status-alert under-review-alert animate-fade-in" id="app-status-under-review-alert">
                            <div class="alert-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div class="alert-content">
                                <div class="alert-headline">For applicants still under review</div>
                                <div class="alert-body">
                                    Your restaurant onboarding application and documentation (FSSAI license, GST registration, bank details, and kitchen hygiene standards) are currently undergoing verification by the YUDU compliance team. Status changes made in the Admin Dashboard will reflect here automatically in real time.
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Informational callouts for other statuses -->
                    ${isPending ? `
                        <div class="app-status-alert pending-alert animate-fade-in">
                            <div class="alert-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div class="alert-content">
                                <div class="alert-headline">Application Queued for Review</div>
                                <div class="alert-body">
                                    Your application has been received and is queued for verification. The YUDU partner onboarding team will begin processing your submission shortly.
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${isApproved ? `
                        <div class="app-status-alert approved-alert animate-fade-in">
                            <div class="alert-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div class="alert-content">
                                <div class="alert-headline">Application Approved · Partner Verified</div>
                                <div class="alert-body">
                                    Congratulations! Your restaurant partner application has been approved by the YUDU Admin Dashboard. Your restaurant profile is fully active and ready to accept customer orders.
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${isRejected ? `
                        <div class="app-status-alert rejected-alert animate-fade-in">
                            <div class="alert-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                            </div>
                            <div class="alert-content">
                                <div class="alert-headline">Application Rejected / Flagged</div>
                                <div class="alert-body">
                                    Your onboarding application could not be verified by the admin team. Please contact YUDU Partner Support at support@yudu.com to rectify flagged documents or submit clarifications.
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Application Metadata Grid (Read-only) -->
                    <div class="app-status-details-grid">
                        <div class="app-status-detail-cell">
                            <span class="detail-label">APPLICATION ID</span>
                            <span class="detail-value font-mono">${appData.id || 'APP-2041'}</span>
                        </div>
                        <div class="app-status-detail-cell">
                            <span class="detail-label">REGISTERED RESTAURANT</span>
                            <span class="detail-value">${appData.restaurantName || r.name}</span>
                        </div>
                        <div class="app-status-detail-cell">
                            <span class="detail-label">SUBMISSION DATE</span>
                            <span class="detail-value">${appData.submittedDate || '18 Nov 2026, 10:30 AM'}</span>
                        </div>
                        <div class="app-status-detail-cell">
                            <span class="detail-label">ADMIN SYNC STATUS</span>
                            <span class="detail-value flex-align-center">
                                <span class="live-sync-indicator-dot"></span>
                                <span id="app-status-last-sync">${appData.lastUpdated || 'Auto-synced with Admin'}</span>
                            </span>
                        </div>
                    </div>

                    <!-- Visual Multi-Step Verification Tracker (Read-only) -->
                    <div class="app-status-progress-track">
                        <div class="progress-step ${s1Class}">
                            <div class="step-circle">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div class="step-label-group">
                                <div class="step-name">Submitted</div>
                                <div class="step-sub">Registration completed</div>
                            </div>
                        </div>

                        <div class="progress-line ${s2Class === 'step-completed' || s2Class === 'step-active' ? 'line-active' : ''}"></div>

                        <div class="progress-step ${s2Class}">
                            <div class="step-circle">
                                ${s2Class === 'step-completed' ? `
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ` : (isUnderReview ? `
                                    <span class="step-pulse-dot"></span>
                                ` : '2')}
                            </div>
                            <div class="step-label-group">
                                <div class="step-name">Under Review</div>
                                <div class="step-sub">Documents & hygiene audit</div>
                            </div>
                        </div>

                        <div class="progress-line ${s3Class === 'step-completed' ? 'line-active' : ''}"></div>

                        <div class="progress-step ${s3Class}">
                            <div class="step-circle">
                                ${s3Class === 'step-completed' ? `
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ` : (isRejected ? `
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                ` : '3')}
                            </div>
                            <div class="step-label-group">
                                <div class="step-name">${isRejected ? 'Application Flagged' : 'Admin Approval'}</div>
                                <div class="step-sub">${isApproved ? 'Partner Active' : (isRejected ? 'Action required' : 'Final decision')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    window.renderRestaurantPage = renderRestaurant;
})();
