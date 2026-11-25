/**
 * YUDU Restaurant Partner Portal - Page: Customer Reviews & Ratings
 * Features:
 * - Real-time rating overview & star breakdown
 * - Filter by star rating (All, 5★, 4★, 3★, Awaiting Reply)
 * - Live search by customer name, order ID, or text
 * - Partner response workflow with quick reply templates
 * - Export customer feedback report
 */

(function () {
  let currentFilter = "all"; // 'all', '5', '4', '3', 'unanswered'
  let searchQuery = "";
  let sortOrder = "newest"; // 'newest', 'highest', 'lowest'
  let activeReplyReviewId = null;

  function renderReviews(container) {
    const store = window.YUDUStore || YUDUStore;
    const state = store.getState();
    const restaurantName =
      (state.restaurant && state.restaurant.name) || "Biryani Factory";
    const reviews = store.getReviews ? store.getReviews() : state.reviews || [];

    // Filter reviews
    let filtered = reviews.filter((r) => {
      if (currentFilter === "5" && r.rating !== 5) return false;
      if (currentFilter === "4" && r.rating !== 4) return false;
      if (currentFilter === "3" && r.rating !== 3) return false;
      if (currentFilter === "unanswered" && r.reply) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.customer && r.customer.toLowerCase().includes(q);
        const matchText =
          r.reviewText && r.reviewText.toLowerCase().includes(q);
        const matchOrder = r.orderId && r.orderId.toLowerCase().includes(q);
        const matchDish = (r.orderedItems || []).some((item) =>
          item.toLowerCase().includes(q),
        );
        if (!matchName && !matchText && !matchOrder && !matchDish) return false;
      }

      return true;
    });

    // Sort reviews
    filtered.sort((a, b) => {
      if (sortOrder === "highest") return b.rating - a.rating;
      if (sortOrder === "lowest") return a.rating - b.rating;
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    // Counts for tabs
    const countAll = reviews.length;
    const count5 = reviews.filter((r) => r.rating === 5).length;
    const count4 = reviews.filter((r) => r.rating === 4).length;
    const count3 = reviews.filter((r) => r.rating === 3).length;
    const countUnanswered = reviews.filter((r) => !r.reply).length;

    container.innerHTML = `
            <div class="page-container animate-fade-in reviews-page">
                <!-- Page Header -->
                <header class="page-header">
                    <div class="header-titles">
                        <h1 class="page-title">Customer Reviews</h1>
                        <p class="page-subtitle">Track customer ratings, diner feedback, and respond to restaurant reviews.</p>
                    </div>
                    <div class="header-actions">
                        <div class="search-input-wrap">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="reviews-search-input" class="search-field" placeholder="Search reviews, diner or dish..." value="${escapeHtml(searchQuery)}" />
                        </div>
                        <button class="btn btn-outline" id="export-reviews-btn" title="Export reviews to CSV">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export Reviews
                        </button>
                        <button class="icon-btn" id="notif-bell-btn-reviews" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notif-badge-pill ${state.notifications.filter((n) => n.unread).length > 0 ? "active" : ""}">${state.notifications.filter((n) => n.unread).length}</span>
                        </button>
                    </div>
                </header>

                <!-- Overview Section: Score Breakdown + 3 Stat Cards -->
                <div class="reviews-overview-grid">
                    <!-- Left: Overall Rating Card -->
                    <div class="reviews-score-card">
                        <div class="score-main-col">
                            <div class="score-large-num">4.6</div>
                            <div class="score-stars-row">
                                <span class="score-star-icon filled">★</span>
                                <span class="score-star-icon filled">★</span>
                                <span class="score-star-icon filled">★</span>
                                <span class="score-star-icon filled">★</span>
                                <span class="score-star-icon half">★</span>
                            </div>
                            <div class="score-total-count">Based on 1,248 reviews</div>
                            <div class="score-trend-badge"><span class="badge-dot"></span>+0.2 this month</div>
                        </div>

                        <div class="score-distribution-col">
                            <!-- 5 Stars -->
                            <div class="rating-bar-row ${currentFilter === "5" ? "active-filter" : ""}" data-filter-rating="5" title="Filter 5 star reviews">
                                <span class="rating-bar-label">5 ★</span>
                                <div class="rating-bar-track">
                                    <div class="rating-bar-fill" style="width: 72%;"></div>
                                </div>
                                <span class="rating-bar-count">898 (72%)</span>
                            </div>
                            <!-- 4 Stars -->
                            <div class="rating-bar-row ${currentFilter === "4" ? "active-filter" : ""}" data-filter-rating="4" title="Filter 4 star reviews">
                                <span class="rating-bar-label">4 ★</span>
                                <div class="rating-bar-track">
                                    <div class="rating-bar-fill" style="width: 18%;"></div>
                                </div>
                                <span class="rating-bar-count">224 (18%)</span>
                            </div>
                            <!-- 3 Stars -->
                            <div class="rating-bar-row ${currentFilter === "3" ? "active-filter" : ""}" data-filter-rating="3" title="Filter 3 star reviews">
                                <span class="rating-bar-label">3 ★</span>
                                <div class="rating-bar-track">
                                    <div class="rating-bar-fill" style="width: 6%;"></div>
                                </div>
                                <span class="rating-bar-count">75 (6%)</span>
                            </div>
                            <!-- 2 Stars -->
                            <div class="rating-bar-row" title="2 star reviews">
                                <span class="rating-bar-label">2 ★</span>
                                <div class="rating-bar-track">
                                    <div class="rating-bar-fill" style="width: 3%;"></div>
                                </div>
                                <span class="rating-bar-count">37 (3%)</span>
                            </div>
                            <!-- 1 Star -->
                            <div class="rating-bar-row" title="1 star reviews">
                                <span class="rating-bar-label">1 ★</span>
                                <div class="rating-bar-track">
                                    <div class="rating-bar-fill" style="width: 1%;"></div>
                                </div>
                                <span class="rating-bar-count">14 (1%)</span>
                            </div>
                        </div>
                    </div>

                
                    <div class="reviews-metrics-column">
                        
                    </div>
                </div>

                <!-- Controls Bar: Tabs & Sort -->
                <div class="reviews-controls-bar">
                    <div class="category-tabs-list">
                        <button class="category-tab-btn ${currentFilter === "all" ? "active" : ""}" data-tab="all">
                            All Reviews (${countAll})
                        </button>
                        <button class="category-tab-btn ${currentFilter === "5" ? "active" : ""}" data-tab="5">
                            5 Stars  (${count5})
                        </button>
                        <button class="category-tab-btn ${currentFilter === "4" ? "active" : ""}" data-tab="4">
                            4 Stars  (${count4})
                        </button>
                        <button class="category-tab-btn ${currentFilter === "3" ? "active" : ""}" data-tab="3">
                            3 Stars  (${count3})
                        </button>
                        <button class="category-tab-btn ${currentFilter === "unanswered" ? "active" : ""}" data-tab="unanswered">
                            Awaiting Reply ${countUnanswered > 0 ? `<span class="unanswered-pill">${countUnanswered}</span>` : ""}
                        </button>
                    </div>

                    <div class="sort-select-wrap">
                        <label for="reviews-sort-select" class="sort-label">Sort by:</label>
                        <select id="reviews-sort-select" class="sort-dropdown">
                            <option value="newest" ${sortOrder === "newest" ? "selected" : ""}>Newest First</option>
                            <option value="highest" ${sortOrder === "highest" ? "selected" : ""}>Highest Rating</option>
                            <option value="lowest" ${sortOrder === "lowest" ? "selected" : ""}>Lowest Rating</option>
                        </select>
                    </div>
                </div>

                <!-- Reviews Cards List -->
                <div class="reviews-list-container" id="reviews-list-wrap">
                    ${renderReviewsListHtml(filtered, restaurantName)}
                </div>
            </div>
        `;

    attachReviewsEvents(container);
  }

  function renderReviewsListHtml(reviews, restaurantName) {
    if (!reviews || reviews.length === 0) {
      return `
                <div class="empty-reviews-card">
                    <div class="empty-icon">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                    <div class="empty-title">No reviews found</div>
                    <div class="empty-desc">There are no reviews matching your active filter or search query.</div>
                    <button class="btn btn-outline" id="reset-reviews-filter-btn" style="margin-top: 14px;">Reset Filters</button>
                </div>
            `;
    }

    return reviews
      .map((r) => {
        // Star render
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
          if (i <= r.rating) {
            starsHtml += `<span class="star-icon filled">★</span>`;
          } else {
            starsHtml += `<span class="star-icon empty">☆</span>`;
          }
        }

        // Tags render
        const tagsHtml = (r.tags || [])
          .map((t) => `<span class="review-tag-chip">${escapeHtml(t)}</span>`)
          .join("");

        // Sub-ratings
        let subRatingsHtml = "";
        if (r.ratingsDetail) {
          subRatingsHtml = `
                    <div class="review-sub-ratings">
                        <span class="sub-rating-item">Taste: <strong>${r.ratingsDetail.taste}★</strong></span>
                        <span class="sub-rating-item">Packaging: <strong>${r.ratingsDetail.packaging}★</strong></span>
                        <span class="sub-rating-item">Delivery: <strong>${r.ratingsDetail.delivery}★</strong></span>
                    </div>
                `;
        }

        // Reply section
        let replyHtml = "";
        const isReplyingThis = activeReplyReviewId === r.id;

        if (r.reply) {
          replyHtml = `
                    <div class="review-reply-card">
                        <div class="reply-card-header">
                            <div class="reply-author-info">
                                <div class="reply-badge-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <strong class="reply-author-name">${escapeHtml(r.reply.from || restaurantName)}</strong>
                                <span class="reply-role-tag">Restaurant Partner</span>
                                <span class="reply-date">· ${escapeHtml(r.reply.date)}</span>
                            </div>
                            <button class="delete-reply-btn" data-delete-reply="${r.id}" title="Delete reply">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <p class="reply-text">${escapeHtml(r.reply.text)}</p>
                    </div>
                `;
        } else if (isReplyingThis) {
          replyHtml = `
                    <div class="reply-composer-card animate-fade-in" id="reply-composer-${r.id}">
                        <div class="composer-title-row">
                            <strong class="composer-title">Reply to ${escapeHtml(r.customer)}</strong>
                            <span class="composer-sub">Diner will be notified in their YUDU app</span>
                        </div>
                        <!-- Quick Reply Chips -->
                        <div class="quick-templates-row">
                            <span class="quick-tmpl-label">Quick suggestions:</span>
                            <button type="button" class="tmpl-chip" data-apply-tmpl="Thank you so much for the love! We are delighted you enjoyed our food and look forward to your next order!">Thank customer</button>
                            <button type="button" class="tmpl-chip" data-apply-tmpl="We appreciate your valuable feedback! Glad our authentic spices hit the spot!">Appreciate feedback</button>
                            <button type="button" class="tmpl-chip" data-apply-tmpl="Thank you for sharing your experience. We will ensure extra care on seasoning and delivery speed next time!">Apologize & resolve</button>
                        </div>
                        <textarea class="reply-textarea" id="reply-input-${r.id}" rows="3" placeholder="Write a warm, polite response to ${escapeHtml(r.customer)}..."></textarea>
                        <div class="composer-actions-row">
                            <button class="btn btn-sm btn-primary" data-submit-reply="${r.id}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                Send Response
                            </button>
                            <button class="btn btn-sm btn-outline" data-cancel-reply="${r.id}">Cancel</button>
                        </div>
                    </div>
                `;
        } else {
          replyHtml = `
                    <div class="review-actions-bar">
                        <button class="btn-reply-trigger" data-open-reply="${r.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Reply to Review
                        </button>
                        <span class="unanswered-hint">Awaiting your response</span>
                    </div>
                `;
        }

        return `
                <div class="customer-review-card" data-review-id="${r.id}">
                    <div class="review-card-top">
                        <div class="diner-avatar-info">
                            <div class="customer-avatar-initials">${escapeHtml(r.initials || "CU")}</div>
                            <div class="diner-meta">
                                <div class="diner-name-row">
                                    <strong class="diner-name">${escapeHtml(r.customer)}</strong>
                                    <span class="verified-diner-pill" title="Verified Order via YUDU">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Verified Diner
                                    </span>
                                </div>
                                <div class="review-date-text">${escapeHtml(r.date)}</div>
                            </div>
                        </div>

                        <div class="review-card-rating-badge">
                            <div class="stars-visual">${starsHtml}</div>
                            <span class="rating-num-pill">${r.rating}.0</span>
                        </div>
                    </div>

                    <!-- Ordered Items & Order ID Link -->
                    <div class="review-order-context">
                        <a href="#order-details?id=${r.orderId}" class="review-order-link" title="View details for order #${r.orderId}">
                            <span class="order-id-tag">#${escapeHtml(r.orderId)}</span>
                        </a>
                        <span class="ordered-items-summary">${escapeHtml((r.orderedItems || []).join(" · "))}</span>
                    </div>

                    <!-- Review Text -->
                    <p class="review-content-text">${escapeHtml(r.reviewText)}</p>

                    <!-- Tags & Sub-ratings -->
                    <div class="review-footer-row">
                        <div class="review-tags-wrap">${tagsHtml}</div>
                        ${subRatingsHtml}
                    </div>

                    <!-- Partner Reply Section -->
                    ${replyHtml}
                </div>
            `;
      })
      .join("");
  }

  function attachReviewsEvents(container) {
    // Tab Filtering
    const tabs = container.querySelectorAll(".category-tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        currentFilter = tab.getAttribute("data-tab");
        activeReplyReviewId = null;
        renderReviews(container);
      });
    });

    // Click on star distribution bars to filter
    const ratingBars = container.querySelectorAll("[data-filter-rating]");
    ratingBars.forEach((bar) => {
      bar.addEventListener("click", () => {
        const rating = bar.getAttribute("data-filter-rating");
        currentFilter = currentFilter === rating ? "all" : rating;
        activeReplyReviewId = null;
        renderReviews(container);
      });
    });

    // Search input
    const searchInput = container.querySelector("#reviews-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        renderReviews(container);
        // Keep input focused
        const updatedInput = container.querySelector("#reviews-search-input");
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.setSelectionRange(
            updatedInput.value.length,
            updatedInput.value.length,
          );
        }
      });
    }

    // Sort dropdown
    const sortSelect = container.querySelector("#reviews-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        sortOrder = e.target.value;
        renderReviews(container);
      });
    }

    // Reset filter button
    const resetBtn = container.querySelector("#reset-reviews-filter-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        currentFilter = "all";
        searchQuery = "";
        renderReviews(container);
      });
    }

    // Export button
    const exportBtn = container.querySelector("#export-reviews-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        exportReviewsToCSV();
      });
    }

    // Review list action clicks (Open reply, Submit reply, Cancel reply, Delete reply, Apply template)
    const listWrap = container.querySelector("#reviews-list-wrap");
    if (listWrap) {
      listWrap.addEventListener("click", (e) => {
        // Open Reply composer
        const openBtn = e.target.closest("[data-open-reply]");
        if (openBtn) {
          activeReplyReviewId = openBtn.getAttribute("data-open-reply");
          renderReviews(container);
          // Focus textarea
          const txt = container.querySelector(
            `#reply-input-${activeReplyReviewId}`,
          );
          if (txt) txt.focus();
          return;
        }

        // Cancel Reply
        const cancelBtn = e.target.closest("[data-cancel-reply]");
        if (cancelBtn) {
          activeReplyReviewId = null;
          renderReviews(container);
          return;
        }

        // Quick Template Apply
        const tmplChip = e.target.closest("[data-apply-tmpl]");
        if (tmplChip) {
          const text = tmplChip.getAttribute("data-apply-tmpl");
          const composer = tmplChip.closest(".reply-composer-card");
          if (composer) {
            const txt = composer.querySelector("textarea");
            if (txt) {
              txt.value = text;
              txt.focus();
            }
          }
          return;
        }

        // Submit Reply
        const submitBtn = e.target.closest("[data-submit-reply]");
        if (submitBtn) {
          const reviewId = submitBtn.getAttribute("data-submit-reply");
          const input = container.querySelector(`#reply-input-${reviewId}`);
          const val = input ? input.value.trim() : "";

          if (!val) {
            if (window.YUDUUI)
              YUDUUI.showToast(
                "Please enter your response before sending.",
                "warning",
              );
            return;
          }

          if (window.YUDUStore && YUDUStore.addReviewReply) {
            YUDUStore.addReviewReply(reviewId, val);
          }
          activeReplyReviewId = null;
          if (window.YUDUUI)
            YUDUUI.showToast(
              "Response successfully published to diner!",
              "success",
            );
          renderReviews(container);
          return;
        }

        // Delete Reply
        const deleteBtn = e.target.closest("[data-delete-reply]");
        if (deleteBtn) {
          const reviewId = deleteBtn.getAttribute("data-delete-reply");
          if (
            confirm(
              "Are you sure you want to remove your response to this review?",
            )
          ) {
            if (window.YUDUStore && YUDUStore.deleteReviewReply) {
              YUDUStore.deleteReviewReply(reviewId);
            }
            if (window.YUDUUI) YUDUUI.showToast("Response removed.", "info");
            renderReviews(container);
          }
          return;
        }
      });
    }
  }

  function exportReviewsToCSV() {
    const store = window.YUDUStore || YUDUStore;
    const state = store.getState();
    const reviews = store.getReviews ? store.getReviews() : state.reviews || [];

    let csv =
      "Review ID,Customer,Rating,Date,Order ID,Ordered Items,Review Comments,Partner Reply\n";
    reviews.forEach((r) => {
      const cleanText = (r.reviewText || "").replace(/"/g, '""');
      const cleanItems = (r.orderedItems || []).join("; ").replace(/"/g, '""');
      const cleanReply = (r.reply ? r.reply.text : "").replace(/"/g, '""');
      csv += `"${r.id}","${r.customer}",${r.rating},"${r.date}","${r.orderId}","${cleanItems}","${cleanText}","${cleanReply}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `YUDU_Customer_Reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.YUDUUI) {
      YUDUUI.showToast(
        "Customer reviews report exported successfully!",
        "success",
      );
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.renderReviewsPage = renderReviews;
})();
