/**
 * YUDU Restaurant Partner Portal - UI Components & Helpers
 * Modals, Toasts, Charts, File Exports, Notification Drawer
 */

(function () {
  // 1. Toast Notification System
  function showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("yudu-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "yudu-toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `yudu-toast toast-${type} animate-slide-in`;

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === "warning") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // 2. Modal Controller
  function openModal(modalHtml, onMounted, customCardClass = "") {
    let overlay = document.getElementById("yudu-modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "yudu-modal-overlay";
      overlay.className = "modal-backdrop";
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
            <div class="modal-card animate-scale-up ${customCardClass}" id="yudu-modal-box">
                ${modalHtml}
            </div>
        `;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    const closeBtn = overlay.querySelectorAll("[data-close-modal]");
    closeBtn.forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    if (typeof onMounted === "function") {
      onMounted(overlay);
    }
  }

  function closeModal() {
    const overlay = document.getElementById("yudu-modal-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
      setTimeout(() => {
        overlay.innerHTML = "";
      }, 250);
    }
  }

  // 3. Specific Pre-built Modals
  function openDeliveryPartnerModal(orderId, onConfirm) {
    const order = YUDUStore.getOrderById(orderId);
    const partners = YUDUStore.getEligibleDeliveryPartners(orderId);

    let selectedId =
      (partners.find((p) => p.recommended) || partners[0] || {}).id || "dp-1";
    let currentSort = "distance";
    let prepTime = 15;

    function getSortedPartners() {
      const list = [...partners];
      if (currentSort === "distance") {
        list.sort((a, b) => a.distanceKm - b.distanceKm);
      } else if (currentSort === "rating") {
        list.sort((a, b) => b.rating - a.rating);
      } else if (currentSort === "acceptance") {
        list.sort((a, b) => b.acceptanceRate - a.acceptanceRate);
      }
      return list;
    }

    function renderCardsList() {
      const sorted = getSortedPartners();
      return sorted
        .map((p) => {
          const isSelected = p.id === selectedId;
          const initials =
            p.initials ||
            (p.name
              ? p.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "DP");
          return `
                    <div class="dp-card ${isSelected ? "selected" : ""} ${p.recommended ? "has-recommended" : ""}" data-dp-id="${p.id}">
                        <!-- Left: Radio & Profile Avatar & Name -->
                        <div class="dp-radio-indicator ${isSelected ? "checked" : ""}">
                            ${isSelected ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ""}
                        </div>

                        <div class="dp-profile-avatar dp-avatar-${p.id}" title="${p.name}">
                            ${initials}
                        </div>

                        <div class="dp-profile-info">
                            <div class="dp-name-row">
                                <span class="dp-name-text">${p.name}</span>
                                ${
                                  p.recommended
                                    ? `
                                    <span class="dp-recommended-badge">
                                        <svg class="inline-icon" width="11" height="11" viewBox="0 0 24 24" fill="#C2410C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        <span>Recommended</span>
                                    </span>
                                `
                                    : ""
                                }
                            </div>
                            <div class="dp-status-pill">
                                <span class="dp-status-dot"></span>
                                <span class="dp-status-label">${p.status}</span>
                            </div>
                        </div>

                        <!-- Column 2: Distance from restaurant -->
                        <div class="dp-stat-cell">
                            <div class="dp-stat-top">
                                <svg class="dp-scooter-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg>
                                <span class="dp-stat-number">${p.distanceText}</span>
                            </div>
                            <span class="dp-stat-sub">from restaurant</span>
                        </div>

                        <!-- Column 3: Rating -->
                        <div class="dp-stat-cell">
                            <div class="dp-stat-top">
                                <svg class="dp-star-icon" width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                <span class="dp-stat-number">${p.rating} <span class="dp-review-count">(${p.reviewsCount})</span></span>
                            </div>
                            <span class="dp-stat-sub">rating</span>
                        </div>

                        <!-- Column 4: Acceptance -->
                        <div class="dp-stat-cell">
                            <div class="dp-stat-top">
                                <span class="dp-acceptance-check-icon">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </span>
                                <span class="dp-stat-number">${p.acceptanceText}</span>
                            </div>
                            <span class="dp-stat-sub">acceptance</span>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    const selectedPartner =
      partners.find((p) => p.id === selectedId) || partners[0];

    const modalHtml = `
            <div class="dp-modal-container">
                <!-- Top Header Banner -->
                <div class="dp-order-banner">
                    <div class="dp-order-banner-left">
                        <span class="dp-order-pill">Order #${order ? order.id : orderId}</span>
                        <span class="dp-order-cust">${order ? `${order.customer} · ${order.itemCount} items (₹${order.amount.toLocaleString()})` : "New incoming order"}</span>
                    </div>
                    <button class="modal-close-icon" data-close-modal title="Close modal">&times;</button>
                </div>

                <!-- Section Header matching screenshot -->
                <div class="dp-popup-section-header">
                    <h3 class="dp-section-title">Eligible Delivery Partners (${partners.length})</h3>
                    <div class="dp-sort-wrap">
                        <label class="dp-sort-label" for="dp-sort-select">Sort by:</label>
                        <div class="dp-sort-select-wrapper">
                            <select id="dp-sort-select" class="dp-sort-select">
                                <option value="distance" ${currentSort === "distance" ? "selected" : ""}>Nearest Distance</option>
                                <option value="rating" ${currentSort === "rating" ? "selected" : ""}>Highest Rating</option>
                                <option value="acceptance" ${currentSort === "acceptance" ? "selected" : ""}>Acceptance Rate</option>
                            </select>
                            <svg class="dp-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- Cards List -->
                <div class="dp-cards-list" id="dp-cards-container">
                    ${renderCardsList()}
                </div>

                <!-- Estimated Kitchen Prep Time Selector -->
                <div class="dp-prep-time-row">
                    <div class="dp-prep-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>Est. Kitchen Prep Time:</span>
                    </div>
                    <div class="dp-prep-options">
                        <button type="button" class="dp-prep-pill ${prepTime === 10 ? "active" : ""}" data-prep="10">10 min</button>
                        <button type="button" class="dp-prep-pill ${prepTime === 15 ? "active" : ""}" data-prep="15">15 min</button>
                        <button type="button" class="dp-prep-pill ${prepTime === 20 ? "active" : ""}" data-prep="20">20 min</button>
                        <button type="button" class="dp-prep-pill ${prepTime === 30 ? "active" : ""}" data-prep="30">30 min</button>
                    </div>
                </div>

                <!-- Footer Action Buttons -->
                <div class="modal-footer dp-modal-footer">
                    <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                    <button type="button" class="btn btn-primary btn-assign-accept" id="confirm-assign-accept-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span id="assign-btn-text">Assign ${selectedPartner ? selectedPartner.name : "Partner"} & Accept Order</span>
                    </button>
                </div>
            </div>
        `;

    openModal(
      modalHtml,
      (overlay) => {
        const cardsContainer = overlay.querySelector("#dp-cards-container");
        const sortSelect = overlay.querySelector("#dp-sort-select");
        const assignBtn = overlay.querySelector("#confirm-assign-accept-btn");
        const assignBtnText = overlay.querySelector("#assign-btn-text");
        const prepPills = overlay.querySelectorAll(".dp-prep-pill");

        function updateSelectionUI() {
          const partner =
            partners.find((p) => p.id === selectedId) || partners[0];
          if (assignBtnText && partner) {
            assignBtnText.textContent = `Assign ${partner.name} & Accept Order`;
          }

          const allCards = overlay.querySelectorAll(".dp-card");
          allCards.forEach((c) => {
            const cId = c.getAttribute("data-dp-id");
            const indicator = c.querySelector(".dp-radio-indicator");
            if (cId === selectedId) {
              c.classList.add("selected");
              if (indicator) {
                indicator.classList.add("checked");
                indicator.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
              }
            } else {
              c.classList.remove("selected");
              if (indicator) {
                indicator.classList.remove("checked");
                indicator.innerHTML = "";
              }
            }
          });
        }

        // Click card to select
        if (cardsContainer) {
          cardsContainer.addEventListener("click", (e) => {
            const card = e.target.closest(".dp-card");
            if (card) {
              selectedId = card.getAttribute("data-dp-id");
              updateSelectionUI();
            }
          });
        }

        // Sort Select
        if (sortSelect) {
          sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            cardsContainer.innerHTML = renderCardsList();
            updateSelectionUI();
          });
        }

        // Prep time pills
        prepPills.forEach((pill) => {
          pill.addEventListener("click", () => {
            prepPills.forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            prepTime = parseInt(pill.getAttribute("data-prep"), 10) || 15;
          });
        });

        // Confirm Button
        if (assignBtn) {
          assignBtn.addEventListener("click", () => {
            const chosenPartner =
              partners.find((p) => p.id === selectedId) || partners[0];
            closeModal();
            YUDUStore.acceptOrder(orderId, prepTime, chosenPartner);
            YUDUUI.showToast(
              `Order #${orderId} accepted! ${chosenPartner.name} assigned for delivery pickup.`,
              "success",
            );
            if (typeof onConfirm === "function") {
              onConfirm(chosenPartner, prepTime);
            }
          });
        }
      },
      "modal-card-wide",
    );
  }

  function openRejectOrderModal(orderId, onConfirm) {
    const modalHtml = `
            <div class="modal-header">
                <div class="modal-title-row">
                    <div class="modal-icon-badge danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </div>
                    <div>
                        <h3 class="modal-title">Decline Order #${orderId}</h3>
                        <p class="modal-subtitle">Please specify why you are declining this customer order.</p>
                    </div>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <label class="form-label">Select Cancellation Reason</label>
                <div class="radio-options-list">
                    <label class="radio-option">
                        <input type="radio" name="reject-reason" value="Item(s) out of stock" checked>
                        <span>Key ingredient or item is out of stock</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="reject-reason" value="Kitchen at maximum capacity">
                        <span>Kitchen is overwhelmed / rush hour backlog</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="reject-reason" value="Restaurant closing early">
                        <span>Closing early today for maintenance</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="reject-reason" value="Delivery address out of reach">
                        <span>Delivery partner or distance constraint</span>
                    </label>
                </div>
                <div class="form-group" style="margin-top: 14px;">
                    <label class="form-label">Additional notes for customer (optional)</label>
                    <textarea id="reject-note" class="form-input" rows="2" placeholder="e.g. Sorry, Biryani dum is currently replenishing..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Keep Order</button>
                <button type="button" class="btn btn-danger" id="confirm-reject-btn">Decline Order</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay
        .querySelector("#confirm-reject-btn")
        .addEventListener("click", () => {
          const selectedRadio = overlay.querySelector(
            'input[name="reject-reason"]:checked',
          );
          const reason = selectedRadio
            ? selectedRadio.value
            : "Cancelled by restaurant";
          closeModal();
          if (onConfirm) onConfirm(reason);
        });
    });
  }

  function openRequestPayoutModal(availableAmount = 42380, onConfirm) {
    const state = YUDUStore.getState();
    const bank = state.restaurant.bankDetails;

    const modalHtml = `
            <div class="modal-header">
                <div class="modal-title-row">
                    <div class="modal-icon-badge purple">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    </div>
                    <div>
                        <h3 class="modal-title">Request Settlement Payout</h3>
                        <p class="modal-subtitle">Transfer available balance directly to your registered bank account.</p>
                    </div>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <div class="payout-amount-box">
                    <span class="payout-label">Available Balance</span>
                    <span class="payout-num">₹${availableAmount.toLocaleString()}</span>
                </div>
                <div class="bank-preview-card">
                    <div class="bank-logo-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 2 8 2 11 22 11 22 8 12 2"></polygon></svg></div>
                    <div class="bank-preview-details">
                        <div class="bank-name">${bank.bankName}</div>
                        <div class="bank-acc">A/C: ${bank.accountNumber.replace(/\d(?=\d{4})/g, "•")} · IFSC: ${bank.ifsc}</div>
                        <div class="bank-holder">${bank.accountHolder}</div>
                    </div>
                </div>
                <div class="payout-info-row">
                    <span><svg class="inline-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Processing speed:</span>
                    <strong>Instant IMPS (Estimated 15–30 mins)</strong>
                </div>
                <div class="payout-info-row">
                    <span><svg class="inline-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> TDS / Platform settlement:</span>
                    <strong>0% extra fee for restaurant partners</strong>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="button" class="btn btn-primary" id="confirm-payout-btn">Confirm & Transfer ₹${availableAmount.toLocaleString()}</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay
        .querySelector("#confirm-payout-btn")
        .addEventListener("click", () => {
          closeModal();
          if (onConfirm) onConfirm(availableAmount);
        });
    });
  }

  function openBusinessHoursModal(onSave) {
    const state = YUDUStore.getState();
    const bh = state.restaurant.businessHours;

    const allDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const daysCheckboxes = allDays
      .map(
        (day) => `
            <label class="day-checkbox-label">
                <input type="checkbox" name="bh-day" value="${day}" ${bh.days.includes(day) ? "checked" : ""}>
                <span>${day.slice(0, 3)}</span>
            </label>
        `,
      )
      .join("");

    const modalHtml = `
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Edit Business Hours</h3>
                    <p class="modal-subtitle">Set your weekly schedule and operating hours for delivery.</p>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <label class="form-label" style="font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Mon – Fri (Weekday Hours)</label>
                    <div class="form-row-2">
                        <div class="form-group">
                            <label class="form-label" style="font-size: 11.5px;">Opening Time</label>
                            <input type="time" id="bh-weekday-open" class="form-input" value="09:00">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-size: 11.5px;">Closing Time</label>
                            <input type="time" id="bh-weekday-close" class="form-input" value="22:00">
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label class="form-label" style="font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Sat – Sun (Weekend Hours)</label>
                    <div class="form-row-2">
                        <div class="form-group">
                            <label class="form-label" style="font-size: 11.5px;">Opening Time</label>
                            <input type="time" id="bh-weekend-open" class="form-input" value="10:00">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-size: 11.5px;">Closing Time</label>
                            <input type="time" id="bh-weekend-close" class="form-input" value="23:00">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" style="font-weight: 700; color: var(--text-primary);">Operating Days</label>
                    <div class="days-grid">${daysCheckboxes}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="button" class="btn btn-primary" id="save-bh-btn">Save Hours</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay.querySelector("#save-bh-btn").addEventListener("click", () => {
        const wOpen =
          overlay.querySelector("#bh-weekday-open").value || "09:00";
        const wClose =
          overlay.querySelector("#bh-weekday-close").value || "22:00";
        const weOpen =
          overlay.querySelector("#bh-weekend-open").value || "10:00";
        const weClose =
          overlay.querySelector("#bh-weekend-close").value || "23:00";
        const checkedDays = Array.from(
          overlay.querySelectorAll('input[name="bh-day"]:checked'),
        ).map((cb) => cb.value);

        // Format friendly display
        const formatTime = (timeStr) => {
          const [h, m] = timeStr.split(":");
          const hour = parseInt(h, 10);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          const minStr = m ? `:${m}` : ":00";
          return `${hour12 < 10 ? "0" + hour12 : hour12}${minStr} ${ampm}`;
        };

        const weekdayHoursStr = `${formatTime(wOpen)} - ${formatTime(wClose)}`;
        const weekendHoursStr = `${formatTime(weOpen)} - ${formatTime(weClose)}`;
        const generalDisplay = `${formatTime(wOpen)} – ${formatTime(weClose)}`;

        YUDUStore.updateBusinessHours(
          generalDisplay,
          formatTime(wOpen),
          formatTime(weClose),
          checkedDays,
          weekdayHoursStr,
          weekendHoursStr,
        );
        closeModal();
        showToast("Business hours updated successfully");
        if (typeof onSave === "function") onSave();
      });
    });
  }

  function openDeliveryRadiusModal() {
    const state = YUDUStore.getState();
    const radius = state.restaurant.deliveryRadius || 5;

    const modalHtml = `
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Delivery Radius</h3>
                    <p class="modal-subtitle">Define maximum delivery range from your restaurant location.</p>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <div class="radius-slider-display">
                    <span id="radius-val" class="radius-val-big">${radius}</span>
                    <span class="radius-unit">km</span>
                </div>
                <input type="range" id="radius-slider" min="1" max="15" step="0.5" value="${radius}" class="custom-range-slider">
                <div class="radius-markers">
                    <span>1 km</span>
                    <span>5 km (Standard)</span>
                    <span>10 km</span>
                    <span>15 km (Max)</span>
                </div>
                <div class="radius-notice">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    A radius of 5 km covers high-density zones with average 18-minute delivery times.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="button" class="btn btn-primary" id="save-radius-btn">Save Radius</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      const slider = overlay.querySelector("#radius-slider");
      const valDisplay = overlay.querySelector("#radius-val");
      slider.addEventListener("input", (e) => {
        valDisplay.textContent = e.target.value;
      });

      overlay
        .querySelector("#save-radius-btn")
        .addEventListener("click", () => {
          YUDUStore.updateDeliveryRadius(slider.value);
          closeModal();
          showToast(`Delivery radius set to ${slider.value} km`);
        });
    });
  }

  function openBankDetailsModal() {
    const state = YUDUStore.getState();
    const bank = state.restaurant.bankDetails;

    const modalHtml = `
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Bank Account Details</h3>
                    <p class="modal-subtitle">Account used for weekly automated payouts and settlements.</p>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Account Holder Name *</label>
                    <input type="text" id="bank-holder" class="form-input" value="${bank.accountHolder}">
                </div>
                <div class="form-group">
                    <label class="form-label">Account Number *</label>
                    <input type="text" id="bank-number" class="form-input" value="${bank.accountNumber}">
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label class="form-label">IFSC Code *</label>
                        <input type="text" id="bank-ifsc" class="form-input" value="${bank.ifsc}" style="text-transform: uppercase;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bank & Branch *</label>
                        <input type="text" id="bank-name" class="form-input" value="${bank.bankName}">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="button" class="btn btn-primary" id="save-bank-btn">Save Changes</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay.querySelector("#save-bank-btn").addEventListener("click", () => {
        const holder = overlay.querySelector("#bank-holder").value.trim();
        const number = overlay.querySelector("#bank-number").value.trim();
        const ifsc = overlay
          .querySelector("#bank-ifsc")
          .value.trim()
          .toUpperCase();
        const name = overlay.querySelector("#bank-name").value.trim();

        if (!holder || !number || !ifsc || !name) {
          showToast("Please fill out all bank fields", "error");
          return;
        }

        YUDUStore.updateBankDetails({
          accountHolder: holder,
          accountNumber: number,
          ifsc: ifsc,
          bankName: name,
        });
        closeModal();
        showToast("Bank details updated successfully");
      });
    });
  }

  function openChangePasswordModal() {
    const eyeOpenSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeClosedSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    const modalHtml = `
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Change Password</h3>
                    <p class="modal-subtitle">Update your partner portal account security password.</p>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Current Password *</label>
                    <div class="password-input-wrap">
                        <input type="password" id="pwd-current" class="form-input with-password-toggle" placeholder="Enter current password">
                        <button type="button" class="password-toggle-btn" data-toggle-target="pwd-current" title="Toggle password visibility">
                            ${eyeOpenSvg}
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">New Password *</label>
                    <div class="password-input-wrap">
                        <input type="password" id="pwd-new" class="form-input with-password-toggle" placeholder="Min. 8 characters with numbers & symbols">
                        <button type="button" class="password-toggle-btn" data-toggle-target="pwd-new" title="Toggle password visibility">
                            ${eyeOpenSvg}
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Confirm New Password *</label>
                    <div class="password-input-wrap">
                        <input type="password" id="pwd-confirm" class="form-input with-password-toggle" placeholder="Re-type new password">
                        <button type="button" class="password-toggle-btn" data-toggle-target="pwd-confirm" title="Toggle password visibility">
                            ${eyeOpenSvg}
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="button" class="btn btn-primary" id="save-pwd-btn">Update Password</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      // Attach independent toggle listeners for each field
      overlay.querySelectorAll(".password-toggle-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetId = btn.getAttribute("data-toggle-target");
          const input = overlay.querySelector("#" + targetId);
          if (input) {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            btn.innerHTML = isPassword ? eyeClosedSvg : eyeOpenSvg;
            btn.title = isPassword ? "Hide password" : "Show password";
          }
        });
      });

      overlay.querySelector("#save-pwd-btn").addEventListener("click", () => {
        const cur = overlay.querySelector("#pwd-current").value;
        const nxt = overlay.querySelector("#pwd-new").value;
        const conf = overlay.querySelector("#pwd-confirm").value;

        if (!cur || !nxt || !conf) {
          showToast("Please fill out all password fields", "error");
          return;
        }
        if (nxt.length < 6) {
          showToast("New password must be at least 6 characters", "error");
          return;
        }
        if (nxt !== conf) {
          showToast("New passwords do not match", "error");
          return;
        }

        closeModal();
        showToast("Password changed successfully");
      });
    });
  }

  function openClearNotificationsModal(onConfirm) {
    const modalHtml = `
            <div class="modal-header">
                <div class="modal-title-row">
                    <div class="modal-icon-badge danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                    <div>
                        <h3 class="modal-title">Clear All Notifications?</h3>
                        <p class="modal-subtitle">This will remove all recent activity and alerts from your inbox.</p>
                    </div>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text-secondary); font-size: 13.5px; line-height: 1.5;">
                    Are you sure you want to dismiss and clear all current notifications? This action cannot be undone.
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Keep Notifications</button>
                <button type="button" class="btn btn-danger" id="confirm-clear-notifs-btn">Clear All</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay
        .querySelector("#confirm-clear-notifs-btn")
        .addEventListener("click", () => {
          closeModal();
          if (onConfirm) onConfirm();
        });
    });
  }

  function openDeleteDishModal(dish, onConfirm) {
    const modalHtml = `
            <div class="modal-header">
                <div class="modal-title-row">
                    <div class="modal-icon-badge danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                    <div>
                        <h3 class="modal-title">Delete "${dish.name}"?</h3>
                        <p class="modal-subtitle">This dish will be permanently removed from your active restaurant menu.</p>
                    </div>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5;">
                    Are you sure you want to delete this dish? Active orders containing this dish will still be processed.
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="button" class="btn btn-danger" id="confirm-del-btn">Delete Dish</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay
        .querySelector("#confirm-del-btn")
        .addEventListener("click", () => {
          closeModal();
          if (onConfirm) onConfirm();
        });
    });
  }

  function openLogoutModal() {
    const modalHtml = `
            <div class="modal-header">
                <div class="modal-title-row">
                    <div class="modal-icon-badge danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </div>
                    <div>
                        <h3 class="modal-title">Sign Out of Partner Portal</h3>
                        <p class="modal-subtitle">Are you sure you want to end your current session?</p>
                    </div>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5;">
                    While signed out, live order alerts and sound notifications on this browser will be paused.
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Stay Signed In</button>
                <button type="button" class="btn btn-danger" id="confirm-logout-btn">Log Out</button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay
        .querySelector("#confirm-logout-btn")
        .addEventListener("click", () => {
          closeModal();
          try {
            localStorage.removeItem("yudu_partner_logged_in");
            localStorage.removeItem("yudu_partner_session");
          } catch (e) {}
          showToast("You have been signed out successfully", "info");
          setTimeout(() => {
            window.location.href = "partner-login.html";
          }, 600);
        });
    });
  }

  function openOrderDetailsModal(order) {
    const itemsList = order.items
      .map(
        (item) => `
            <div class="order-item-row">
                <div class="order-item-name">${item.qty}x ${item.name}</div>
                <div class="order-item-price">₹${item.price}</div>
            </div>
        `,
      )
      .join("");

    const modalHtml = `
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Order Details #${order.id}</h3>
                    <p class="modal-subtitle">Placed at ${order.orderTime} · Customer: ${order.customer}</p>
                </div>
                <button class="modal-close-icon" data-close-modal>&times;</button>
            </div>
            <div class="modal-body">
                <div class="customer-info-box">
                    <div class="info-line"><strong>Customer:</strong> ${order.customer} (${order.phone})</div>
                    <div class="info-line"><strong>Delivery Address:</strong> ${order.address}</div>
                    <div class="info-line"><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status.toUpperCase()}</span></div>
                </div>
                <h4 style="margin: 16px 0 8px; font-size: 14px; color: var(--text-primary);">Order Items</h4>
                <div class="order-items-table">
                    ${itemsList}
                    <div class="order-total-row">
                        <strong>Grand Total</strong>
                        <strong>₹${order.amount}</strong>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal>Close</button>
                <button type="button" class="btn btn-primary" id="print-order-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print KOT Bill
                </button>
            </div>
        `;

    openModal(modalHtml, (overlay) => {
      overlay
        .querySelector("#print-order-btn")
        .addEventListener("click", () => {
          window.print();
        });
    });
  }

  // 4. File Downloads & Exports (Generates Actual CSV files)
  function downloadCSV(filename, csvContent) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportWeeklyOrdersReport() {
    const state = YUDUStore.getState();
    let csv = "Day,Orders,Revenue (INR)\n";
    state.restaurant.weeklyOrders.forEach((d) => {
      csv += `${d.day},${d.orders},${d.revenue}\n`;
    });
    downloadCSV(`YUDU_Weekly_Report_${Date.now()}.csv`, csv);
    showToast("Weekly orders report downloaded");
  }

  function exportSettlementStatement(settlementId = "ALL") {
    const state = YUDUStore.getState();
    let csv =
      "Settlement ID,Period,Orders Count,Total Amount (INR),Status,Bank Account,Date\n";
    state.settlements.forEach((s) => {
      if (settlementId === "ALL" || s.id === settlementId) {
        csv += `"${s.id}","${s.period}",${s.orders},${s.amount},"${s.status}","${s.account}","${s.date}"\n`;
      }
    });
    downloadCSV(
      `YUDU_Settlement_Statement_${settlementId}_${Date.now()}.csv`,
      csv,
    );
    showToast(`Settlement statement ${settlementId} downloaded`);
  }

  function exportAllOrdersCSV() {
    const state = YUDUStore.getState();
    let csv =
      "Order ID,Customer,Phone,Address,Items Count,Amount (INR),Status,Order Time\n";
    state.orders.forEach((o) => {
      csv += `"${o.id}","${o.customer}","${o.phone}","${o.address.replace(/"/g, '""')}",${o.itemCount},${o.amount},"${o.status}","${o.orderTime}"\n`;
    });
    downloadCSV(`YUDU_Orders_Export_${Date.now()}.csv`, csv);
    showToast("All orders exported to CSV");
  }

  // 5. Weekly Bar Chart Renderer (SVG with accurate styling matching screenshots)
  function renderWeeklyBarChart(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const state = YUDUStore.getState();
    const weeklyOrders = state.restaurant.weeklyOrders;

    // Build display data: 7-day view or 30-day (4-week aggregated) view
    const days = options.days || 7;
    let data;
    if (days === 30) {
      // Aggregate the 7-day data into 4 simulated weeks using multipliers
      // Week 4 = most recent (the actual weeklyOrders data)
      const multipliers = [0.72, 0.85, 0.93, 1.0];
      const weekLabels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
      data = multipliers.map((m, i) => {
        const totalOrders = Math.round(
          weeklyOrders.reduce((s, d) => s + d.orders, 0) * m,
        );
        const totalRevenue = Math.round(
          weeklyOrders.reduce((s, d) => s + d.revenue, 0) * m,
        );
        return {
          day: weekLabels[i],
          orders: totalOrders,
          revenue: totalRevenue,
          isPeak: i === 3,
        };
      });
    } else {
      data = weeklyOrders;
    }

    const maxOrders = Math.max(...data.map((d) => d.orders));

    // Generate SVG bars
    const chartHeight = options.height || 180;

    let barsHtml = data
      .map((item) => {
        const barHeight = Math.max(
          16,
          (item.orders / maxOrders) * (chartHeight - 40),
        );
        const isHighlight = item.day === "Sat" || item.isPeak;

        const fillColor = isHighlight ? "#7028D9" : "#DDD6FE";
        const fontColor = isHighlight ? "#7028D9" : "#64748B";
        const fontWeight = isHighlight ? "700" : "500";

        const tooltipRevenue =
          typeof item.revenue === "number"
            ? item.revenue.toLocaleString()
            : item.revenue;

        return `
                <div class="chart-col" data-day="${item.day}" data-orders="${item.orders}" data-revenue="${item.revenue}">
                    <div class="chart-bar-wrap" style="height: ${chartHeight - 30}px;">
                        <div class="chart-bar ${isHighlight ? "bar-highlight" : ""}" 
                             style="height: ${barHeight}px; background-color: ${fillColor};" 
                             data-tooltip="${item.day}: ${item.orders} orders (₹${tooltipRevenue})">
                        </div>
                    </div>
                    <span class="chart-label" style="color: ${fontColor}; font-weight: ${fontWeight};">${item.day}</span>
                </div>
            `;
      })
      .join("");

    container.innerHTML = `
            <div class="weekly-bar-chart-flex">
                ${barsHtml}
            </div>
            <div id="chart-tooltip" class="chart-tooltip"></div>
        `;

    // Tooltip listeners
    const bars = container.querySelectorAll(".chart-bar");
    const tooltip = container.querySelector("#chart-tooltip");

    bars.forEach((bar) => {
      bar.addEventListener("mouseenter", (e) => {
        tooltip.textContent = bar.getAttribute("data-tooltip");
        tooltip.style.opacity = "1";
        const rect = bar.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        tooltip.style.left =
          rect.left - containerRect.left + rect.width / 2 + "px";
        tooltip.style.top = rect.top - containerRect.top - 32 + "px";
      });
      bar.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
      });
    });
  }

  // Export helpers to global scope
  window.YUDUUI = {
    showToast,
    openModal,
    closeModal,
    openDeliveryPartnerModal,
    openRejectOrderModal,
    openRequestPayoutModal,
    openBusinessHoursModal,
    openDeliveryRadiusModal,
    openBankDetailsModal,
    openChangePasswordModal,
    openClearNotificationsModal,
    openDeleteDishModal,
    openLogoutModal,
    openOrderDetailsModal,
    exportWeeklyOrdersReport,
    exportSettlementStatement,
    exportAllOrdersCSV,
    renderWeeklyBarChart,
  };
})();
