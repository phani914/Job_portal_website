const menuButton = document.querySelector(".menu-button");
const navbar = document.querySelector(".navbar");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleIcon = document.querySelector(".theme-toggle-icon");
const themeToggleText = document.querySelector(".theme-toggle-text");
const filterForm = document.querySelector("[data-filter-form]");
const jobCards = document.querySelectorAll("[data-job-card]");

const savedTheme = localStorage.getItem("careerhub-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

const setTheme = (theme) => {
  const isDark = theme === "dark";

  document.documentElement.dataset.theme = theme;

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  if (themeToggleIcon && themeToggleText) {
    themeToggleIcon.textContent = isDark ? "☀" : "☾";
    themeToggleText.textContent = isDark ? "Light" : "Dark";
  }
};

setTheme(initialTheme);

if (menuButton && navbar) {
  menuButton.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navbar.querySelectorAll(".nav-links a, .nav-actions a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      navbar.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("careerhub-theme", nextTheme);
    setTheme(nextTheme);
  });
}

if (filterForm && jobCards.length) {
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(filterForm);
    const keyword = String(data.get("keyword") || "").toLowerCase().trim();
    const type = String(data.get("type") || "");

    jobCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesType = !type || card.dataset.type === type;

      card.hidden = !(matchesKeyword && matchesType);
    });
  });
}
