/**
 * YUDU Restaurant Partner Portal - Router & Navigation Controller
 * Supports hash routes: #home, #orders, #menu, #earnings, #restaurant, #settings, #edit-dish
 */

(function () {
  const routes = {
    "#home": {
      title: "Home Dashboard | YUDU Partner",
      render: window.renderHomePage,
    },
    "#orders": {
      title: "Orders Management | YUDU Partner",
      render: window.renderOrdersPage,
    },
    "#order-details": {
      title: "Order Details | YUDU Partner",
      render: window.renderOrderDetailsPage,
    },
    "#menu": {
      title: "Menu Management | YUDU Partner",
      render: window.renderMenuPage,
    },
    "#earnings": {
      title: "Settlements & Earnings | YUDU Partner",
      render: window.renderEarningsPage,
    },
    "#reviews": {
      title: "Customer Reviews & Ratings | YUDU Partner",
      render: window.renderReviewsPage,
    },
    "#restaurant": {
      title: "Restaurant Overview | YUDU Partner",
      render: window.renderRestaurantPage,
    },
    "#settings": {
      title: "Settings | YUDU Partner",
      render: window.renderSettingsPage,
    },
    "#edit-dish": {
      title: "Edit Dish | YUDU Partner",
      render: window.renderEditDishPage,
    },
  };

  function parseHash() {
    const hashStr = window.location.hash || "#home";
    const [path, queryString] = hashStr.split("?");
    const params = {};
    if (queryString) {
      queryString.split("&").forEach((part) => {
        const [k, v] = part.split("=");
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
      });
    }
    return { path: path.toLowerCase(), params };
  }

  function navigate() {
    const { path, params } = parseHash();
    const mainContainer = document.getElementById("main-view");
    if (!mainContainer) return;

    // Route resolution
    const route = routes[path] || routes["#home"];
    document.title = route.title;

    // Update active sidebar nav
    updateSidebarActive(path);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Close mobile sidebar if open
    const sidebar = document.getElementById("sidebar");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
    }

    // Render page
    if (typeof route.render === "function") {
      route.render(mainContainer, params);
    }
  }

  function updateSidebarActive(path) {
    const navLinks = document.querySelectorAll(".sidebar-nav-link");
    navLinks.forEach((link) => {
      const linkRoute = link.getAttribute("data-route");
      if (
        linkRoute === path ||
        (path === "#edit-dish" && linkRoute === "#menu") ||
        (path === "#order-details" && linkRoute === "#orders")
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  window.addEventListener("hashchange", navigate);
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.location.hash) {
      window.location.hash = "#home";
    }
    navigate();
  });

  window.YUDURouter = {
    navigate,
    goTo: (routeStr) => {
      window.location.hash = routeStr;
    },
  };
})();
