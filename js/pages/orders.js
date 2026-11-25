/**
 * YUDU Restaurant Partner Portal - Page 7: Orders Management
 * Features:
 * - Last 7 Days & Last 30 Days dynamic date range filtering
 * - Status filtering & search combined with date range
 * - Eye SVG icon for order acceptance/acknowledgement
 * - Real-time alarm & notification sync
 */

(function () {
  let currentDateRange = 7; // 7 or 30 days
  let currentStatusFilter = "all"; // 'all', 'new', 'preparing', 'ready', 'completed', 'rejected'
  let searchQuery = "";
  let activeContainer = null;
  let lastOrdersSignature = "";
  let lastSoundSignature = "";
  let isRenderingOrders = false;
  let listenersRegistered = false;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getOrderTimestamp(order) {
    if (order && order.createdAt) {
      const parsed = Date.parse(order.createdAt);
      if (Number.isFinite(parsed)) return parsed;
    }
    return Date.now();
  }

  function formatOrderDateTime(order) {
    const ts = getOrderTimestamp(order);
    const d = new Date(ts);
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const startOfOrderDay = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
    ).getTime();
    const diffDays = Math.round(
      (startOfToday - startOfOrderDay) / (24 * 60 * 60 * 1000),
    );

    const timeStr =
      order.orderTime ||
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;

    const dateLabel = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return `${dateLabel}, ${timeStr}`;
  }

  function filterOrdersByDateRange(orders, days) {
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
    return orders
      .filter((order) => getOrderTimestamp(order) >= cutoffMs)
      .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
  }

  function computeOrdersSignature(state) {
    const ordersPart = (state.orders || [])
      .map(
        (o) =>
          `${o.id}:${o.status}:${Boolean(o.acknowledged)}:${Boolean(o.alarmCompleted)}:${o.readyIn || ""}:${o.createdAt || ""}`,
      )
      .join("|");
    const unreadCount = (state.notifications || []).filter(
      (n) => n.unread,
    ).length;
    const pendingCount = (state.orders || []).filter(
      (o) => o.status === "new" && !o.acknowledged,
    ).length;
    return `${ordersPart}::unread=${unreadCount}::pending=${pendingCount}`;
  }

  function getSoundStateSafe() {
    if (window.YUDUSound && typeof YUDUSound.getState === "function") {
      return YUDUSound.getState();
    }
    return {
      isBlocked: false,
      isMuted: false,
      alertsEnabled: true,
      isRinging: false,
      activeAlarmOrderIds: [],
    };
  }

  function renderEyeAckButton(order) {
    const isAck = Boolean(order.acknowledged);
    const isNewUnack = order.status === "new" && !isAck;
    return `
      <button
        type="button"
        class="btn-eye-ack ${isAck ? "accepted" : ""} ${isNewUnack ? "pulse-alert" : ""}"
        data-order-ack="${escapeHtml(order.id)}"
        ${isAck ? 'disabled aria-disabled="true"' : ""}
        title="${isAck ? "Accepted & Acknowledged" : "Acknowledge & Accept Order"}"
        aria-label="${isAck ? `Order ${escapeHtml(order.id)} accepted` : `Acknowledge order ${escapeHtml(order.id)}`}"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    `;
  }

  function renderOrders(container) {
    if (!container) return;
    isRenderingOrders = true;
    activeContainer = container;
    registerGlobalListeners();

    const state = YUDUStore.getState();
    const allOrders = state.orders || [];
    lastOrdersSignature = computeOrdersSignature(state);

    // Filter orders by selected date range (Last 7 Days or Last 30 Days)
    const dateFilteredOrders = filterOrdersByDateRange(
      allOrders,
      currentDateRange,
    );

    // Compute dynamic card & tab counts from date-filtered orders
    const countAll = dateFilteredOrders.length;
    const countNew = dateFilteredOrders.filter(
      (o) => o.status === "new",
    ).length;
    const countPrep = dateFilteredOrders.filter(
      (o) => o.status === "preparing",
    ).length;
    const countReady = dateFilteredOrders.filter(
      (o) => o.status === "ready",
    ).length;
    const countCompleted = dateFilteredOrders.filter(
      (o) => o.status === "completed",
    ).length;
    const countRejected = dateFilteredOrders.filter(
      (o) => o.status === "rejected",
    ).length;

    if (currentStatusFilter === "rejected" && countRejected === 0) {
      currentStatusFilter = "all";
    }

    // Apply status filter + search query on top of date range filter
    const filtered = dateFilteredOrders.filter((order) => {
      if (
        currentStatusFilter !== "all" &&
        order.status !== currentStatusFilter
      ) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchCust = order.customer.toLowerCase().includes(q);
        const matchPhone = order.phone && order.phone.toLowerCase().includes(q);
        if (!matchId && !matchCust && !matchPhone) return false;
      }
      return true;
    });

    if (window.YUDUSound) {
      lastSoundSignature = JSON.stringify(getSoundStateSafe());
      YUDUSound.syncOrders(allOrders);
    }

    const soundState = getSoundStateSafe();
    lastSoundSignature = JSON.stringify(soundState);
    const unreadNotifs = (state.notifications || []).filter(
      (n) => n.unread,
    ).length;
    const pendingAcceptanceCount = allOrders.filter(
      (o) => o.status === "new" && !o.acknowledged,
    ).length;
    const bellBadgeCount = Math.max(unreadNotifs, pendingAcceptanceCount);
    const showBlockedBanner =
      soundState.isBlocked &&
      soundState.alertsEnabled &&
      soundState.activeAlarmOrderIds.length > 0;

    container.innerHTML = `
            <div class="page-container animate-fade-in" id="orders-management-root">
                <!-- Top Header -->
                <header class="page-header">
                    <div class="header-titles">
                        <h1 class="page-title">Orders Management</h1>
                        <p class="page-subtitle">Track incoming orders, live kitchen prep, and order history.</p>
                    </div>
                    <div class="header-actions">
                        <div class="search-input-wrap">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="orders-search-input" class="search-field" placeholder="Search by ID, customer..." value="${escapeHtml(searchQuery)}" />
                        </div>
                        <button class="btn btn-outline" id="export-orders-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export
                        </button>
                        <button class="icon-btn ${pendingAcceptanceCount > 0 ? "has-pending-orders" : ""} ${soundState.isRinging ? "bell-ringing" : ""}" id="notif-bell-btn-7" title="${pendingAcceptanceCount > 0 ? `Notifications (${pendingAcceptanceCount} order${pendingAcceptanceCount > 1 ? "s" : ""} waiting for acceptance)` : "Notifications"}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${bellBadgeCount > 0 ? "active" : ""}">${bellBadgeCount > 9 ? "9+" : bellBadgeCount}</span>
                        </button>
                    </div>
                </header>

                <!-- Date Range Filter Toolbar -->
                <div class="orders-top-toolbar">
                    <div class="orders-date-filter-group">
                        
                        <div class="orders-date-pills" role="group" aria-label="Order date range filter">
                            <button type="button" class="date-filter-btn ${currentDateRange === 7 ? "active" : ""}" data-date-range="7">Last 7 Days</button>
                            <button type="button" class="date-filter-btn ${currentDateRange === 30 ? "active" : ""}" data-date-range="30">Last 30 Days</button>
                        </div>
                    </div>
                </div>

                ${
                  showBlockedBanner
                    ? `
                <div class="sound-permission-banner" id="sound-permission-banner" role="alert">
                    <div class="sound-banner-left">
                        <span class="sound-banner-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        </span>
                        <div>
                            <strong>Order alert sound requires permission</strong>
                            <span class="sound-banner-sub">Browser autoplay blocked the incoming order alarm. Enable sound to hear live order alerts.</span>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary" id="enable-sound-banner-btn">Enable Notification Sound</button>
                </div>
                `
                    : ""
                }

                <!-- Order Status Metrics (5 Cards) -->
                <div class="orders-metrics-grid">
                    <div class="stat-card clickable ${currentStatusFilter === "all" ? "active-metric" : ""}" data-status="all">
                        <div class="stat-top">
                            <span class="stat-title">Total Orders</span>
                        </div>
                        <div class="stat-value">${countAll}</div>
                        <div class="stat-change neutral">Last ${currentDateRange} days</div>
                    </div>
                    <div class="stat-card clickable ${currentStatusFilter === "new" ? "active-metric" : ""}" data-status="new">
                        <div class="stat-top">
                            <span class="stat-title">New Orders</span>
                            <div class="stat-icon-pill yellow-pill"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></div>
                        </div>
                        <div class="stat-value text-amber">${countNew}</div>
                        <div class="stat-change neutral">Needs action</div>
                    </div>
                    <div class="stat-card clickable ${currentStatusFilter === "preparing" ? "active-metric" : ""}" data-status="preparing">
                        <div class="stat-top">
                            <span class="stat-title">Preparing</span>
                            <div class="stat-icon-pill purple-pill"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c1 3 3.5 3 3.5 6.5a3.5 3.5 0 1 1-7 0C8.5 5 11 5 12 2z"></path><path d="M8 15.5c-2 0-4 1-4 3.5h16c0-2.5-2-3.5-4-3.5"></path></svg></div>
                        </div>
                        <div class="stat-value text-purple">${countPrep}</div>
                        <div class="stat-change positive">In kitchen</div>
                    </div>
                    <div class="stat-card clickable ${currentStatusFilter === "ready" ? "active-metric" : ""}" data-status="ready">
                        <div class="stat-top">
                            <span class="stat-title">Ready</span>
                            <div class="stat-icon-pill green-pill"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
                        </div>
                        <div class="stat-value text-green">${countReady}</div>
                        <div class="stat-change positive">Awaiting pickup</div>
                    </div>
                    <div class="stat-card clickable ${currentStatusFilter === "completed" ? "active-metric" : ""}" data-status="completed">
                        <div class="stat-top">
                            <span class="stat-title">Completed</span>
                        </div>
                        <div class="stat-value">${countCompleted}</div>
                        <div class="stat-change positive">Delivered</div>
                    </div>
                </div>

                <!-- Status Filter Tabs -->
                <div class="orders-tabs-bar">
                    <div class="category-tabs-list">
                        <button class="category-tab-btn ${currentStatusFilter === "all" ? "active" : ""}" data-status="all">All (${countAll})</button>
                        <button class="category-tab-btn ${currentStatusFilter === "new" ? "active" : ""}" data-status="new">New (${countNew})</button>
                        <button class="category-tab-btn ${currentStatusFilter === "preparing" ? "active" : ""}" data-status="preparing">Preparing (${countPrep})</button>
                        <button class="category-tab-btn ${currentStatusFilter === "ready" ? "active" : ""}" data-status="ready">Ready (${countReady})</button>
                        <button class="category-tab-btn ${currentStatusFilter === "completed" ? "active" : ""}" data-status="completed">Completed (${countCompleted})</button>
                        ${countRejected > 0 ? `<button class="category-tab-btn ${currentStatusFilter === "rejected" ? "active" : ""}" data-status="rejected">Rejected (${countRejected})</button>` : ""}
                    </div>
                </div>

                <!-- Orders List -->
                <div class="orders-management-list" id="orders-full-list">
                    ${renderOrderList(filtered)}
                </div>
            </div>
        `;

    attachOrdersEvents(container);
    isRenderingOrders = false;
  }

  function renderOrderList(orders) {
    if (!orders || orders.length === 0) {
      return `
                <div class="empty-orders-card">
                    <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                    <div class="empty-title">No orders found</div>
                    <div class="empty-desc">No orders match the selected ${currentDateRange}-day range and filter criteria.</div>
                </div>
            `;
    }

    return orders
      .map((order) => {
        const isNew = order.status === "new";
        const isPrep = order.status === "preparing";
        const isReady = order.status === "ready";
        const isCompleted = order.status === "completed";
        const isRejected = order.status === "rejected";
        const isAck = Boolean(order.acknowledged);

        let statusBadge = "";
        let actionButtons = "";

        if (isNew) {
          statusBadge = isAck
            ? `<span class="order-status-badge accepted-status-badge"><span class="badge-dot"></span>Accepted</span>`
            : `<span class="order-status-badge new-badge"><span class="badge-dot"></span>New · Pending Acceptance</span>`;
          actionButtons = `
                    ${renderEyeAckButton(order)}
                    <button class="btn btn-sm btn-reject" data-order-reject="${order.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Reject
                    </button>
                `;
        } else if (isPrep) {
          statusBadge = `<span class="order-status-badge preparing-badge"><span class="badge-dot"></span>Preparing (${order.readyIn || "in progress"})</span>`;
          actionButtons = `
                    ${renderEyeAckButton(order)}
                    <button class="btn btn-sm btn-ready-action" data-order-ready="${order.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Mark as Ready
                    </button>
                `;
        } else if (isReady) {
          statusBadge = `<span class="order-status-badge ready-badge"><span class="badge-dot"></span>Ready for pickup</span>`;
          actionButtons = `
                    ${renderEyeAckButton(order)}
                    <button class="btn btn-sm btn-complete-action" data-order-complete="${order.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Complete Delivery
                    </button>
                `;
        } else if (isCompleted) {
          statusBadge = `<span class="order-status-badge completed-badge"><span class="badge-dot"></span>Delivered</span>`;
          actionButtons = "";
        } else if (isRejected) {
          statusBadge = `<span class="order-status-badge rejected-badge"><span class="badge-dot"></span>Declined</span>`;
          actionButtons = `<span class="text-muted-sm">${order.rejectReason || "Declined"}</span>`;
        }

        const acceptedIndicator =
          isAck && !isNew
            ? `<span class="order-accepted-badge" title="Order acknowledged & accepted by restaurant partner"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Accepted</span>`
            : "";

        const itemsSummary = order.items
          .map((i) => `${i.qty}x ${i.name}`)
          .join(", ");

        return `
                <div class="order-manage-card ${isNew && !isAck ? "order-card-unack" : ""}" data-order-id="${order.id}">
                    <div class="order-manage-header">
                        <div class="order-header-left">
                            <div class="customer-avatar-initials">${order.initials}</div>
                            <div>
                                <div class="order-manage-title-row">
                                    <a href="#order-details?id=${order.id}" class="order-id-link" title="View order details"><strong class="order-id-num">#${order.id}</strong></a>
                                    ${statusBadge}
                                    ${acceptedIndicator}
                                    <span class="order-time-label"><svg class="inline-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${formatOrderDateTime(order)}</span>
                                </div>
                                <div class="order-customer-sub">${order.customer} · ${order.phone || ""}</div>
                            </div>
                        </div>

                        <div class="order-header-right">
                            <div class="order-amount-text">₹${order.amount.toLocaleString()}</div>
                            <div class="order-items-count">${order.itemCount} items</div>
                        </div>
                    </div>

                    <div class="order-manage-body">
                        <div class="order-items-preview">
                            <span class="items-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M18 11v11M6 2v7a3 3 0 0 0 6 0V2M9 12v10M6 2h6"></path></svg></span>
                            <span class="items-text">${itemsSummary}</span>
                        </div>
                        <div class="order-address-preview">
                            <span class="address-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
                            <span class="address-text">${order.address}</span>
                        </div>
                        ${
                          order.rider && (isPrep || isReady)
                            ? `
                        <div class="order-rider-preview">
                            <span class="rider-initials-chip dp-profile-${(
                              order.rider.initials ||
                              (order.rider.name
                                ? order.rider.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                : "RS")
                            ).toLowerCase()}">${
                              order.rider.initials ||
                              (order.rider.name
                                ? order.rider.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                : "RS")
                            }</span>
                            <span class="rider-preview-text">Delivery Partner: <strong>${order.rider.name}</strong> <span class="rider-preview-eta">(${order.rider.eta || "Assigned"} · ${order.rider.phone || ""})</span></span>
                        </div>
                        `
                            : ""
                        }
                    </div>

                    <div class="order-manage-footer">
                        <button class="btn btn-xs btn-outline" data-view-bill="${order.id}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            View Items & Bill
                        </button>
                        <div class="order-action-btns-wrap">
                            ${actionButtons}
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  function rerenderPreservingFocus(container) {
    const searchEl = container.querySelector("#orders-search-input");
    const wasSearchFocused = searchEl && document.activeElement === searchEl;
    const selStart = wasSearchFocused ? searchEl.selectionStart : 0;
    const selEnd = wasSearchFocused ? searchEl.selectionEnd : 0;

    renderOrders(container);

    if (wasSearchFocused) {
      const nextSearch = container.querySelector("#orders-search-input");
      if (nextSearch) {
        nextSearch.focus();
        try {
          nextSearch.setSelectionRange(selStart, selEnd);
        } catch (e) {}
      }
    }
  }

  function registerGlobalListeners() {
    if (listenersRegistered) return;
    listenersRegistered = true;

    window.addEventListener("yudu-data-changed", () => {
      if (
        isRenderingOrders ||
        !activeContainer ||
        !activeContainer.querySelector("#orders-management-root")
      ) {
        return;
      }
      const nextSig = computeOrdersSignature(YUDUStore.getState());
      if (nextSig !== lastOrdersSignature) {
        rerenderPreservingFocus(activeContainer);
      }
    });

    window.addEventListener("yudu-sound-state-changed", () => {
      if (
        isRenderingOrders ||
        !activeContainer ||
        !activeContainer.querySelector("#orders-management-root")
      ) {
        return;
      }
      const nextSoundSig = JSON.stringify(getSoundStateSafe());
      if (nextSoundSig !== lastSoundSignature) {
        rerenderPreservingFocus(activeContainer);
      }
    });
  }

  function attachOrdersEvents(container) {
    // Date Range filter buttons (Last 7 Days / Last 30 Days)
    const dateBtns = container.querySelectorAll("[data-date-range]");
    dateBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const days = parseInt(btn.getAttribute("data-date-range"), 10);
        if (days === 7 || days === 30) {
          currentDateRange = days;
          renderOrders(container);
        }
      });
    });

    // Autoplay blocked banner Enable Sound button
    const enableBannerBtn = container.querySelector("#enable-sound-banner-btn");
    if (enableBannerBtn) {
      enableBannerBtn.addEventListener("click", () => {
        if (window.YUDUSound) {
          YUDUSound.unlockAudio().then((ok) => {
            if (ok) {
              YUDUUI.showToast("Notification sound enabled", "success");
            }
          });
        }
      });
    }

    // Filter tabs
    const tabs = container.querySelectorAll(".category-tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        currentStatusFilter = tab.getAttribute("data-status");
        renderOrders(container);
      });
    });

    // Metric cards click
    const metricCards = container.querySelectorAll(".stat-card.clickable");
    metricCards.forEach((card) => {
      card.addEventListener("click", () => {
        currentStatusFilter = card.getAttribute("data-status");
        renderOrders(container);
      });
    });

    // Search input
    const searchInput = container.querySelector("#orders-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        renderOrders(container);
        const newSearch = container.querySelector("#orders-search-input");
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(
            newSearch.value.length,
            newSearch.value.length,
          );
        }
      });
    }

    // Export Orders CSV
    const exportBtn = container.querySelector("#export-orders-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        YUDUUI.exportAllOrdersCSV();
      });
    }

    // Orders list action delegates
    const list = container.querySelector("#orders-full-list");
    if (list) {
      list.addEventListener("click", (e) => {
        // Eye SVG Icon - Acknowledge & Accept Order
        const ackBtn = e.target.closest("[data-order-ack]");
        if (ackBtn) {
          e.stopPropagation();
          if (ackBtn.disabled || ackBtn.classList.contains("accepted")) {
            return;
          }
          const id = ackBtn.getAttribute("data-order-ack");
          const existing = YUDUStore.getOrderById(id);
          if (!existing || existing.acknowledged) {
            return;
          }
          YUDUStore.acknowledgeOrder(id);
          if (window.YUDUSound) {
            YUDUSound.stopOrderAlarm(id);
          }
          YUDUUI.showToast(`Order #${id} acknowledged & accepted`, "success");
          renderOrders(container);
          return;
        }

        // Accept (Assign Delivery Partner)
        const acceptBtn = e.target.closest("[data-order-accept]");
        if (acceptBtn) {
          e.stopPropagation();
          const id = acceptBtn.getAttribute("data-order-accept");
          YUDUUI.openDeliveryPartnerModal(id, () => {
            if (window.YUDUSound) {
              YUDUSound.stopOrderAlarm(id);
            }
            renderOrders(container);
          });
          return;
        }

        // Reject
        const rejectBtn = e.target.closest("[data-order-reject]");
        if (rejectBtn) {
          e.stopPropagation();
          const id = rejectBtn.getAttribute("data-order-reject");
          YUDUUI.openRejectOrderModal(id, (reason) => {
            YUDUStore.rejectOrder(id, reason);
            if (window.YUDUSound) {
              YUDUSound.stopOrderAlarm(id);
            }
            YUDUUI.showToast(`Order #${id} declined`, "error");
            renderOrders(container);
          });
          return;
        }

        // Mark Ready
        const readyBtn = e.target.closest("[data-order-ready]");
        if (readyBtn) {
          e.stopPropagation();
          const id = readyBtn.getAttribute("data-order-ready");
          YUDUStore.updateOrderStatus(id, "ready");
          YUDUUI.showToast(
            `Order #${id} marked as READY for delivery pickup!`,
            "success",
          );
          renderOrders(container);
          return;
        }

        // Mark Completed
        const completeBtn = e.target.closest("[data-order-complete]");
        if (completeBtn) {
          e.stopPropagation();
          const id = completeBtn.getAttribute("data-order-complete");
          YUDUStore.updateOrderStatus(id, "completed");
          if (window.YUDUSound) {
            YUDUSound.stopOrderAlarm(id);
          }
          YUDUUI.showToast(`Order #${id} marked as DELIVERED`, "success");
          renderOrders(container);
          return;
        }

        // View Bill — navigate to order details page
        const billBtn = e.target.closest("[data-view-bill]");
        if (billBtn) {
          e.stopPropagation();
          const id = billBtn.getAttribute("data-view-bill");
          location.hash = "#order-details?id=" + id;
          return;
        }

        // Click on order card itself — navigate to order details page
        const card = e.target.closest(".order-manage-card");
        if (card && !e.target.closest("button") && !e.target.closest("a")) {
          const id = card.getAttribute("data-order-id");
          if (id) {
            location.hash = "#order-details?id=" + id;
          }
          return;
        }
      });
    }
  }

  window.renderOrdersPage = renderOrders;
})();
