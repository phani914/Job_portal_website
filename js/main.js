const menuButton = document.querySelector(".menu-button");
const navbar = document.querySelector(".navbar");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleIcon = document.querySelector(".theme-toggle-icon");
const themeToggleText = document.querySelector(".theme-toggle-text");
const filterForm = document.querySelector("[data-filter-form]");
const heroSearchForm = document.querySelector("[data-hero-search]");
const jobCards = document.querySelectorAll("[data-job-card]");
const noResultsMessage = document.querySelector("[data-no-results]");

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

const normalize = (value) => String(value || "").toLowerCase().trim();

const getSearchValues = (form) => {
  const data = new FormData(form);

  return {
    keyword: normalize(data.get("keyword")),
    location: normalize(data.get("location")),
    type: String(data.get("type") || ""),
  };
};

const applyJobSearch = ({ keyword = "", location = "", type = "" }) => {
  let visibleCount = 0;

  jobCards.forEach((card) => {
    const text = normalize(card.textContent);
    const cardLocation = normalize(card.dataset.location);
    const matchesKeyword = !keyword || text.includes(keyword);
    const matchesLocation = !location || cardLocation.includes(location) || text.includes(location);
    const matchesType = !type || card.dataset.type === type;
    const isVisible = matchesKeyword && matchesLocation && matchesType;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (noResultsMessage) {
    noResultsMessage.hidden = visibleCount > 0;
  }
};

const syncFormValues = ({ keyword = "", location = "", type = "" }) => {
  if (!filterForm) {
    return;
  }

  const keywordInput = filterForm.querySelector('[name="keyword"]');
  const locationInput = filterForm.querySelector('[name="location"]');
  const typeInput = filterForm.querySelector('[name="type"]');

  if (keywordInput) keywordInput.value = keyword;
  if (locationInput) locationInput.value = location;
  if (typeInput) typeInput.value = type;
};

if (jobCards.length) {
  const params = new URLSearchParams(window.location.search);
  const initialSearch = {
    keyword: normalize(params.get("keyword")),
    location: normalize(params.get("location")),
    type: String(params.get("type") || ""),
  };

  if (initialSearch.keyword || initialSearch.location || initialSearch.type) {
    syncFormValues(initialSearch);
    applyJobSearch(initialSearch);
  }
}

if (heroSearchForm) {
  heroSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchValues = getSearchValues(heroSearchForm);
    syncFormValues(searchValues);
    applyJobSearch(searchValues);

    const jobsSection = document.querySelector("#jobs");
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

if (filterForm && jobCards.length) {
  const runFilter = () => {
    applyJobSearch(getSearchValues(filterForm));
  };

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runFilter();
  });

  filterForm.addEventListener("input", runFilter);
  filterForm.addEventListener("change", runFilter);
}
