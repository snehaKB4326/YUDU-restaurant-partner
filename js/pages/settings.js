/**
 * YUDU Restaurant Partner Portal - Page 5: Settings
 * Exact match with reference screenshot 5
 */

(function () {
    function renderSettings(container) {
        const state = YUDUStore.getState();
        const r = state.restaurant;

        container.innerHTML = `
            <div class="page-container animate-fade-in">
                <!-- Top Header -->
                <header class="page-header">
                    <div class="header-titles">
                        <h1 class="page-title">Settings</h1>
                        <p class="page-subtitle">Manage your restaurant, notifications and account.</p>
                    </div>
                    <div class="header-actions">
                        <div class="search-input-wrap">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" class="search-field" placeholder="Search orders, dishes..." />
                        </div>
                        <button class="icon-btn" id="notif-bell-btn-5" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter(n => n.unread).length > 0 ? 'active' : ''}">${state.notifications.filter(n => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Two Column Layout: Profile Card (Left) & Settings Lists (Right) -->
                <div class="settings-two-col-grid">
                    <!-- Left Column: Restaurant Profile Card -->
                    <div class="settings-profile-card">
                        <div class="settings-avatar-big">
                            <span>${r.initials}</span>
                        </div>
                        <h2 class="settings-profile-name">${r.name}</h2>
                        <div class="settings-profile-meta">
                            ${r.partnerId} · ${r.email}
                        </div>
                        <div class="settings-verified-badge">
                            <span class="badge-dot-sm"></span> Verified partner
                        </div>

                        <div class="settings-profile-actions">
                            <button class="btn btn-outline-purple btn-block" id="settings-view-overview-btn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                View restaurant overview
                            </button>
                            <button class="btn btn-outline-danger btn-block" id="settings-logout-btn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Log out
                            </button>
                        </div>
                    </div>

                    <!-- Right Column: Settings Sections (Restaurant, Notifications, Account) -->
                    <div class="settings-sections-col">
                        <!-- Section A: RESTAURANT -->
                        <div class="settings-group">
                            <div class="settings-section-heading">RESTAURANT</div>
                            <div class="settings-card-rows">
                                <!-- Business Hours -->
                                <div class="settings-interactive-row" id="row-business-hours">
                                    <div class="row-left">
                                        <div class="row-icon-circle">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        </div>
                                        <span class="row-label-text">Business hours</span>
                                    </div>
                                    <div class="row-right">
                                        <span class="row-value-text" id="disp-business-hours">${r.businessHours.display}</span>
                                        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </div>
                                </div>

                                <!-- Delivery Radius -->
                                <div class="settings-interactive-row" id="row-delivery-radius">
                                    <div class="row-left">
                                        <div class="row-icon-circle">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                        </div>
                                        <span class="row-label-text">Delivery radius</span>
                                    </div>
                                    <div class="row-right">
                                        <span class="row-value-text" id="disp-delivery-radius">${r.deliveryRadius} km</span>
                                        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section B: NOTIFICATIONS -->
                        <div class="settings-group">
                            <div class="settings-section-heading">NOTIFICATIONS</div>
                            <div class="settings-card-rows">
                                <!-- New order alerts -->
                                <div class="settings-interactive-row no-hover">
                                    <div class="row-left">
                                        <div class="row-icon-circle">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                        </div>
                                        <span class="row-label-text">New order alerts</span>
                                    </div>
                                    <div class="row-right">
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="toggle-order-alerts" ${r.notifications.newOrderAlerts ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <!-- Promotional updates -->
                                <div class="settings-interactive-row no-hover">
                                    <div class="row-left">
                                        <div class="row-icon-circle">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        <span class="row-label-text">Promotional updates</span>
                                    </div>
                                    <div class="row-right">
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="toggle-promos" ${r.notifications.promotionalUpdates ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section C: ACCOUNT -->
                        <div class="settings-group">
                            <div class="settings-section-heading">ACCOUNT</div>
                            <div class="settings-card-rows">
                                <!-- Bank details -->
                                <div class="settings-interactive-row" id="row-bank-details">
                                    <div class="row-left">
                                        <div class="row-icon-circle">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V10"></path><path d="M19 21V10"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path><path d="M2 10h20"></path><path d="M12 3l10 7H2l10-7z"></path></svg>
                                        </div>
                                        <span class="row-label-text">Bank details</span>
                                    </div>
                                    <div class="row-right">
                                        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </div>
                                </div>

                                <!-- Change password -->
                                <div class="settings-interactive-row" id="row-change-password">
                                    <div class="row-left">
                                        <div class="row-icon-circle">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        </div>
                                        <span class="row-label-text">Change password</span>
                                    </div>
                                    <div class="row-right">
                                        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachSettingsEvents(container);
    }

    function attachSettingsEvents(container) {
        // View Restaurant Overview
        const viewOverviewBtn = container.querySelector('#settings-view-overview-btn');
        if (viewOverviewBtn) {
            viewOverviewBtn.addEventListener('click', () => {
                location.hash = '#restaurant';
            });
        }

        // Log out
        const logoutBtn = container.querySelector('#settings-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                YUDUUI.openLogoutModal();
            });
        }

        // Business Hours row
        const bhRow = container.querySelector('#row-business-hours');
        if (bhRow) {
            bhRow.addEventListener('click', () => {
                YUDUUI.openBusinessHoursModal();
            });
        }

        // Delivery radius row
        const radiusRow = container.querySelector('#row-delivery-radius');
        if (radiusRow) {
            radiusRow.addEventListener('click', () => {
                YUDUUI.openDeliveryRadiusModal();
            });
        }

        // Bank details row
        const bankRow = container.querySelector('#row-bank-details');
        if (bankRow) {
            bankRow.addEventListener('click', () => {
                YUDUUI.openBankDetailsModal();
            });
        }

        // Change password row
        const pwdRow = container.querySelector('#row-change-password');
        if (pwdRow) {
            pwdRow.addEventListener('click', () => {
                YUDUUI.openChangePasswordModal();
            });
        }

        // Notification toggles
        const toggleAlerts = container.querySelector('#toggle-order-alerts');
        const togglePromos = container.querySelector('#toggle-promos');

        if (toggleAlerts && togglePromos) {
            toggleAlerts.addEventListener('change', () => {
                YUDUStore.updateNotificationSettings(toggleAlerts.checked, togglePromos.checked);
                YUDUUI.showToast(`Order alerts ${toggleAlerts.checked ? 'enabled' : 'disabled'}`);
            });

            togglePromos.addEventListener('change', () => {
                YUDUStore.updateNotificationSettings(toggleAlerts.checked, togglePromos.checked);
                YUDUUI.showToast(`Promotional updates ${togglePromos.checked ? 'enabled' : 'disabled'}`);
            });
        }

        // Listen for store data updates to re-render row values
        const updateListener = () => {
            const state = YUDUStore.getState();
            const dispBh = container.querySelector('#disp-business-hours');
            const dispRad = container.querySelector('#disp-delivery-radius');
            if (dispBh) dispBh.textContent = state.restaurant.businessHours.display;
            if (dispRad) dispRad.textContent = `${state.restaurant.deliveryRadius} km`;
        };
        window.addEventListener('yudu-data-changed', updateListener, { once: true });
    }

    window.renderSettingsPage = renderSettings;
})();
