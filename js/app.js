/**
 * YUDU Restaurant Partner Portal - Application Controller
 * Global notifications, mobile navigation, collapsible sidebar, search & state sync
 */

(function () {
    const SIDEBAR_COLLAPSED_KEY = 'yudu_sidebar_collapsed';

    function initApp() {
        if (!checkAuth()) return;
        initSidebar();
        initNotificationDropdown();
        initGlobalSearch();
        initStoreSync();
    }

    function checkAuth() {
        const isAuth = localStorage.getItem('yudu_partner_logged_in') === 'true';
        const urlParams = new URLSearchParams(window.location.search);
        // Allow guest / preview mode via query parameter, otherwise enforce login
        if (!isAuth && !urlParams.has('guest') && !urlParams.has('preview')) {
            window.location.replace('partner-login.html');
            return false;
        }
        return true;
    }

    // Sidebar & Mobile Navigation + Desktop Collapse Feature
    function initSidebar() {
        const toggleMobileBtn = document.getElementById('mobile-menu-btn');
        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        const compactBrand = document.getElementById('sidebar-brand-compact');
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        const profileBox = document.getElementById('sidebar-profile-box');
        const mainView = document.getElementById('main-view');

        // Helper to update button tooltip title
        function updateCollapseBtnTitle(collapsed) {
            if (!collapseBtn) return;
            if (collapsed) {
                collapseBtn.title = "Expand Sidebar (Ctrl+B)";
                collapseBtn.setAttribute('aria-label', 'Expand Sidebar');
            } else {
                collapseBtn.title = "Collapse Sidebar (Ctrl+B)";
                collapseBtn.setAttribute('aria-label', 'Collapse Sidebar');
            }
        }

        // Restore collapsed state on desktop
        const isCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
        if (isCollapsed && window.innerWidth > 992) {
            if (sidebar) sidebar.classList.add('collapsed');
            if (mainView) mainView.classList.add('sidebar-collapsed');
            updateCollapseBtnTitle(true);
        } else {
            updateCollapseBtnTitle(false);
        }

        // Collapse / Expand toggle on desktop
        function toggleSidebarCollapse() {
            if (!sidebar) return;
            const willCollapse = !sidebar.classList.contains('collapsed');
            sidebar.classList.toggle('collapsed', willCollapse);
            if (mainView) mainView.classList.toggle('sidebar-collapsed', willCollapse);
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, willCollapse ? 'true' : 'false');
            updateCollapseBtnTitle(willCollapse);
        }

        if (collapseBtn) {
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSidebarCollapse();
            });
        }

        // Clicking compact brand expands sidebar
        if (compactBrand) {
            compactBrand.addEventListener('click', (e) => {
                if (sidebar && sidebar.classList.contains('collapsed')) {
                    e.preventDefault();
                    toggleSidebarCollapse();
                }
            });
        }

        // Hotkey Ctrl+B to toggle sidebar collapse
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleSidebarCollapse();
            }
        });

        // Mobile Drawer toggle
        if (toggleMobileBtn && sidebar) {
            toggleMobileBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                if (backdrop) backdrop.classList.toggle('active');
            });
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('active');
            });
        }

        if (profileBox) {
            profileBox.addEventListener('click', () => {
                location.hash = '#settings';
            });
        }

        updateSidebarProfile();
    }

    function updateSidebarProfile() {
        const state = YUDUStore.getState();
        const r = state.restaurant;

        const nameEl = document.getElementById('sidebar-restaurant-name');
        const idEl = document.getElementById('sidebar-partner-id');
        const avatarEl = document.getElementById('sidebar-avatar-initials');

        if (nameEl) nameEl.textContent = r.name;
        if (idEl) idEl.textContent = r.partnerId;
        if (avatarEl) avatarEl.textContent = r.initials;
    }

    // Complete Functional Notifications System
    function initNotificationDropdown() {
        const popover = document.getElementById('notif-popover');
        if (!popover) return;

        // Delegate click for notification bell icons anywhere in page headers
        document.addEventListener('click', (e) => {
            const bellBtn = e.target.closest('#notif-bell-btn, #notif-bell-btn-2, #notif-bell-btn-3, #notif-bell-btn-4, #notif-bell-btn-5, #notif-bell-btn-6, #notif-bell-btn-7, .icon-btn[title="Notifications"]');
            if (bellBtn) {
                e.stopPropagation();
                toggleNotificationPopover(bellBtn);
                return;
            }

            if (popover.classList.contains('active') && !e.target.closest('#notif-popover')) {
                popover.classList.remove('active');
            }
        });

        // Mark all as read button
        const markAllBtn = document.getElementById('notif-mark-read-btn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                YUDUStore.markAllNotificationsRead();
                renderNotificationList();
                updateNotifBadges();
                YUDUUI.showToast('All notifications marked as read', 'success');
            });
        }

        // Clear all notifications button
        const clearAllBtn = document.getElementById('notif-clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                YUDUUI.openClearNotificationsModal(() => {
                    YUDUStore.clearAllNotifications();
                    renderNotificationList();
                    updateNotifBadges();
                    YUDUUI.showToast('All notifications cleared', 'info');
                });
            });
        }

        updateNotifBadges();
    }

    function toggleNotificationPopover(triggerBtn) {
        const popover = document.getElementById('notif-popover');
        if (!popover) return;

        if (popover.classList.contains('active')) {
            popover.classList.remove('active');
        } else {
            renderNotificationList();
            updateNotifBadges();
            const rect = triggerBtn.getBoundingClientRect();
            popover.style.top = `${rect.bottom + 8}px`;
            popover.style.right = `${Math.max(16, window.innerWidth - rect.right)}px`;
            popover.classList.add('active');
        }
    }

    function renderNotificationList() {
        const listEl = document.getElementById('notif-items-list');
        const countChip = document.getElementById('notif-header-count');
        if (!listEl) return;

        const notifs = YUDUStore.getNotifications();
        const unreadCount = notifs.filter(n => n.unread).length;

        if (countChip) {
            countChip.textContent = `${unreadCount} new`;
        }

        if (!notifs || notifs.length === 0) {
            listEl.innerHTML = `
                <div class="notif-empty-state">
                    <div style="font-size: 28px; margin-bottom: 6px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></div>
                    <strong>No notifications</strong>
                    <p style="color: var(--text-muted); font-size: 11.5px; margin-top: 2px;">You're all caught up with orders & settlements!</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = notifs.map(n => {
            // Icon according to type
            let iconSvg = '';
            let typeClass = n.type || 'order-new';

            if (typeClass === 'order-new') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
            } else if (typeClass === 'order-accepted') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (typeClass === 'order-cancelled') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            } else if (typeClass === 'settlement-available') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="10" width="18" height="10" rx="1"></rect><path d="M7 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"></path></svg>`;
            } else if (typeClass === 'payment-completed') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`;
            } else if (typeClass === 'low-stock') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            } else {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            }

            return `
                <div class="notif-item ${n.unread ? 'unread' : ''}" data-notif-id="${n.id}" data-target="${n.target || ''}" data-target-id="${n.targetId || ''}">
                    <div class="notif-item-icon-badge ${typeClass}">
                        ${iconSvg}
                    </div>
                    <div class="notif-item-content">
                        <div class="notif-item-title">${n.title}</div>
                        <div class="notif-item-desc">${n.desc || ''}</div>
                        <div class="notif-item-time">${n.time}</div>
                    </div>
                    ${n.unread ? `
                        <button class="notif-item-read-check" data-mark-id="${n.id}" title="Mark as read">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Attach item click and mark-as-read click listeners
        listEl.querySelectorAll('.notif-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const markBtn = e.target.closest('[data-mark-id]');
                const notifId = item.getAttribute('data-notif-id');
                const target = item.getAttribute('data-target');

                if (markBtn) {
                    e.stopPropagation();
                    YUDUStore.markNotificationRead(notifId);
                    renderNotificationList();
                    updateNotifBadges();
                    return;
                }

                // If clicked on item, mark as read and navigate
                YUDUStore.markNotificationRead(notifId);
                const popover = document.getElementById('notif-popover');
                if (popover) popover.classList.remove('active');

                if (target) {
                    location.hash = target;
                }
            });
        });
    }

    function updateNotifBadges() {
        const state = YUDUStore.getState();
        const unreadCount = state.notifications.filter(n => n.unread).length;

        // Update all bell buttons across all page headers
        const bellButtons = document.querySelectorAll('.icon-btn[title="Notifications"], #notif-bell-btn, #notif-bell-btn-2, #notif-bell-btn-3, #notif-bell-btn-4, #notif-bell-btn-5, #notif-bell-btn-6, #notif-bell-btn-7');

        bellButtons.forEach(btn => {
            let badge = btn.querySelector('.notif-badge-pill');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notif-badge-pill';
                btn.appendChild(badge);
            }

            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.classList.add('active');
            } else {
                badge.classList.remove('active');
            }
        });
    }

    // Global Search Bar Handler (opens quick results)
    function initGlobalSearch() {
        document.addEventListener('keydown', (e) => {
            // Hotkey Ctrl+K or / focuses search input
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
                e.preventDefault();
                const search = document.querySelector('.search-field');
                if (search) search.focus();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target && e.target.classList.contains('search-field') && e.key === 'Enter') {
                const val = e.target.value.trim();
                if (val) {
                    location.hash = '#menu';
                    setTimeout(() => {
                        const menuSearch = document.getElementById('menu-search-input');
                        if (menuSearch) {
                            menuSearch.value = val;
                            menuSearch.dispatchEvent(new Event('input'));
                        }
                    }, 100);
                }
            }
        });
    }

    // Synchronize Store Changes & Admin Dashboard Live Application Status Updates
    function initStoreSync() {
        window.addEventListener('yudu-data-changed', () => {
            updateSidebarProfile();
            updateNotifBadges();
            const popover = document.getElementById('notif-popover');
            if (popover && popover.classList.contains('active')) {
                renderNotificationList();
            }
        });

        // 1. Initial sync from Admin data on launch
        if (window.YUDUStore && YUDUStore.syncApplicationStatusFromAdmin) {
            YUDUStore.syncApplicationStatusFromAdmin();
        }

        // 2. Storage event listener (captures changes from Admin Dashboard in another tab/window)
        window.addEventListener('storage', (e) => {
            if (e.key === 'yudu_admin_data_v2' || 
                e.key === 'yudu_admin_data' || 
                e.key === 'yudu_restaurant_application' || 
                e.key === 'yudu_application_status' || 
                e.key === 'yudu_partner_registration') {
                
                if (window.YUDUStore && YUDUStore.syncApplicationStatusFromAdmin) {
                    YUDUStore.syncApplicationStatusFromAdmin();
                }
            }
        });

        // 3. Tab Focus listener (syncs when switching back from Admin Dashboard tab)
        window.addEventListener('focus', () => {
            if (window.YUDUStore && YUDUStore.syncApplicationStatusFromAdmin) {
                YUDUStore.syncApplicationStatusFromAdmin();
            }
        });

        // 4. BroadcastChannel listener for instant cross-tab sync
        try {
            const syncChannel = new BroadcastChannel('yudu_application_channel');
            syncChannel.onmessage = () => {
                if (window.YUDUStore && YUDUStore.syncApplicationStatusFromAdmin) {
                    YUDUStore.syncApplicationStatusFromAdmin();
                }
            };
        } catch (e) {}

        // 5. Periodic heartbeat sync (every 1.5 seconds) to ensure real-time consistency
        setInterval(() => {
            if (window.YUDUStore && YUDUStore.syncApplicationStatusFromAdmin) {
                YUDUStore.syncApplicationStatusFromAdmin();
            }
        }, 1500);
    }

    window.addEventListener('DOMContentLoaded', initApp);
})();
