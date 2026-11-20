/**
 * YUDU Restaurant Partner Portal - Page 4: Earnings & Settlements
 * Exact match with reference screenshot 4
 */

(function () {
    let currentSettlementTab = 'All'; // 'All', 'Settled', 'Pending'
    let searchQuery = '';

    function renderEarnings(container) {
        const state = YUDUStore.getState();
        const settlements = state.settlements;

        // Filter settlements by tab and search
        const filtered = settlements.filter(s => {
            if (currentSettlementTab !== 'All' && s.status !== currentSettlementTab) {
                return false;
            }
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return s.id.toLowerCase().includes(q) || s.period.toLowerCase().includes(q);
            }
            return true;
        });

        // Compute balances
        const availableAmount = 42380;
        const thisWeekAmount = '₹58,240';
        const pendingAmount = '₹6,120';

        container.innerHTML = `
            <div class="page-container animate-fade-in">
                <!-- Top Header -->
                <header class="page-header">
                    <div class="header-titles">
                        <h1 class="page-title">Settlements</h1>
                        <p class="page-subtitle">Track payouts and weekly settlements.</p>
                    </div>
                    <div class="header-actions">
                        <div class="search-input-wrap">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="earnings-search-input" class="search-field" placeholder="Search orders, dishes..." value="${searchQuery}" />
                        </div>
                        <button class="btn btn-outline" id="download-statement-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download statement
                        </button>
                        <button class="icon-btn" id="notif-bell-btn-4" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter(n => n.unread).length > 0 ? 'active' : ''}">${state.notifications.filter(n => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Top 3 Summary Cards -->
                <div class="settlements-summary-grid">
                    <!-- Purple Card: Available for Payout -->
                    <div class="payout-banner-card">
                        <div class="payout-card-left">
                            <div class="payout-card-label">Available for payout</div>
                            <div class="payout-card-amount">₹${availableAmount.toLocaleString()}</div>
                            <div class="payout-card-date">Next payout Fri, 13 Nov</div>
                        </div>
                        <button class="btn-request-payout" id="request-payout-trigger-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="10" width="18" height="10" rx="1"></rect><path d="M7 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"></path><path d="M12 14v2"></path></svg>
                            Request Payout
                        </button>
                    </div>

                    <!-- White Card: This Week -->
                    <div class="stat-card">
                        <div class="stat-top">
                            <span class="stat-title">This week</span>
                            <div class="stat-icon-pill green-pill">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                            </div>
                        </div>
                        <div class="stat-value">${thisWeekAmount}</div>
                        <div class="stat-change positive">+9.6%</div>
                    </div>

                    <!-- White Card: Pending -->
                    <div class="stat-card">
                        <div class="stat-top">
                            <span class="stat-title">Pending</span>
                            <div class="stat-icon-pill yellow-pill">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                        </div>
                        <div class="stat-value">${pendingAmount}</div>
                        <div class="stat-change neutral">Clears in 2 days</div>
                    </div>
                </div>

                <!-- Settlement History Card -->
                <div class="settlement-history-card">
                    <div class="section-header-row">
                        <h2 class="section-title">Settlement history</h2>
                        <div class="settlement-tabs-pill">
                            <button class="settle-tab ${currentSettlementTab === 'All' ? 'active' : ''}" data-tab="All">All</button>
                            <button class="settle-tab ${currentSettlementTab === 'Settled' ? 'active' : ''}" data-tab="Settled">Settled</button>
                            <button class="settle-tab ${currentSettlementTab === 'Pending' ? 'active' : ''}" data-tab="Pending">Pending</button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="settlement-table">
                            <thead>
                                <tr>
                                    <th>SETTLEMENT</th>
                                    <th>PERIOD</th>
                                    <th>ORDERS</th>
                                    <th>AMOUNT</th>
                                    <th>STATUS</th>
                                    <th style="text-align: right;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${renderSettlementRows(filtered)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        attachEarningsEvents(container);
    }

    function renderSettlementRows(records) {
        if (!records || records.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="table-empty-row">
                        No settlements found matching the criteria.
                    </td>
                </tr>
            `;
        }

        return records.map(rec => {
            const isSettled = rec.status === 'Settled';
            const statusBadge = isSettled
                ? `<span class="settle-badge settled"><span class="badge-dot-sm"></span>Settled</span>`
                : `<span class="settle-badge pending"><span class="badge-dot-sm"></span>Pending</span>`;

            return `
                <tr class="settlement-row" data-settlement-id="${rec.id}">
                    <td class="cell-settlement-id">
                        <div class="bank-avatar-circle" title="Bank Deposit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7028D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 21h18"></path>
                                <path d="M3 10h18"></path>
                                <path d="M12 3l9 7H3l9-7z"></path>
                                <path d="M5 10v11"></path>
                                <path d="M9 10v11"></path>
                                <path d="M15 10v11"></path>
                                <path d="M19 10v11"></path>
                            </svg>
                        </div>
                        <span class="st-id-text">#${rec.id}</span>
                    </td>
                    <td class="cell-period">${rec.period}</td>
                    <td class="cell-orders">${rec.orders} orders</td>
                    <td class="cell-amount">₹${rec.amount.toLocaleString()}</td>
                    <td class="cell-status">${statusBadge}</td>
                    <td class="cell-action" style="text-align: right;">
                        <button class="table-download-btn" data-download-st="${rec.id}" title="Download Statement CSV">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function attachEarningsEvents(container) {
        // Tab switching
        const tabs = container.querySelectorAll('.settle-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                currentSettlementTab = tab.getAttribute('data-tab');
                renderEarnings(container);
            });
        });

        // Search
        const searchInput = container.querySelector('#earnings-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                renderEarnings(container);
                const newSearch = container.querySelector('#earnings-search-input');
                if (newSearch) {
                    newSearch.focus();
                    newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
                }
            });
        }

        // Request Payout Button
        const requestPayoutBtn = container.querySelector('#request-payout-trigger-btn');
        if (requestPayoutBtn) {
            requestPayoutBtn.addEventListener('click', () => {
                YUDUUI.openRequestPayoutModal(42380, (amt) => {
                    YUDUStore.requestPayout(amt);
                    YUDUUI.showToast(`Payout request of ₹${amt.toLocaleString()} submitted! Reference generated.`, 'success');
                    renderEarnings(container);
                });
            });
        }

        // Complete statement export
        const downloadStatementBtn = container.querySelector('#download-statement-btn');
        if (downloadStatementBtn) {
            downloadStatementBtn.addEventListener('click', () => {
                YUDUUI.exportSettlementStatement('ALL');
            });
        }

        // Individual settlement downloads
        const downloadBtns = container.querySelectorAll('[data-download-st]');
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const stId = btn.getAttribute('data-download-st');
                YUDUUI.exportSettlementStatement(stId);
            });
        });
    }

    window.renderEarningsPage = renderEarnings;
})();
