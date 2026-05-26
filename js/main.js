const menuButton = document.querySelector(".menu-button");
const navbar = document.querySelector(".navbar");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleIcon = document.querySelector(".theme-toggle-icon");
const themeToggleText = document.querySelector(".theme-toggle-text");
const filterForms = document.querySelectorAll("[data-filter-form]");
const heroSearchForm = document.querySelector("[data-hero-search]");
const jobCards = document.querySelectorAll("[data-job-card]");
const noResultsMessage = document.querySelector("[data-no-results]");
const applyForm = document.querySelector("[data-apply-form]");
const applySuccessMessage = document.querySelector("[data-apply-success]");
const validationForms = document.querySelectorAll("[data-validate-form]");

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

const getFormMessage = (form) => {
  let message = form.querySelector("[data-form-message]");

  if (!message) {
    message = document.createElement("p");
    message.className = "form-message";
    message.dataset.formMessage = "";
    form.append(message);
  }

  return message;
};

const setFormMessage = (form, text, type = "error") => {
  const message = getFormMessage(form);

  message.textContent = text;
  message.dataset.type = type;
  message.hidden = false;
};

const clearFormMessage = (form) => {
  const message = form.querySelector("[data-form-message]");

  if (message) {
    message.hidden = true;
    message.textContent = "";
  }
};

const markInvalidField = (field) => {
  field.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");
};

const clearInvalidField = (field) => {
  field.classList.remove("is-invalid");
  field.removeAttribute("aria-invalid");
};

const getFieldLabel = (field) => {
  const label = field.id ? document.querySelector(`label[for="${field.id}"]`) : null;

  return (label?.textContent || field.name || "This field").replace("*", "").trim();
};

const getValidationMessage = (field) => {
  const label = getFieldLabel(field);

  if (field.validity.valueMissing) return `${label} is required.`;
  if (field.validity.typeMismatch) return `Enter a valid ${label.toLowerCase()}.`;
  if (field.validity.patternMismatch) return `${label} has an invalid format.`;
  if (field.validity.tooShort) return `${label} must be at least ${field.minLength} characters.`;
  if (field.validity.tooLong) return `${label} must be ${field.maxLength} characters or fewer.`;

  return field.validationMessage || `${label} is invalid.`;
};

const validateRequiredSearch = (form) => {
  if (!form.matches("[data-search-required]")) {
    return true;
  }

  const data = getSearchValues(form);
  const hasSearchValue = Boolean(data.keyword || data.location || data.type);

  if (!hasSearchValue) {
    setFormMessage(form, "Enter a keyword, location, or job type to search.");
  } else {
    clearFormMessage(form);
  }

  return hasSearchValue;
};

const validateForm = (form) => {
  clearFormMessage(form);

  const invalidField = Array.from(form.elements).find((field) => {
    if (!(field instanceof HTMLElement) || field.disabled || !("validity" in field)) {
      return false;
    }

    if (field.checkValidity()) {
      clearInvalidField(field);
      return false;
    }

    markInvalidField(field);
    return true;
  });

  if (invalidField) {
    setFormMessage(form, getValidationMessage(invalidField));
    invalidField.focus();
    return false;
  }

  return validateRequiredSearch(form);
};

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("input", (event) => {
    const field = event.target;

    if (field instanceof HTMLElement && "validity" in field && field.checkValidity()) {
      clearInvalidField(field);
    }
  });
});

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
  if (!filterForms.length) {
    return;
  }

  filterForms.forEach((form) => {
    const keywordInput = form.querySelector('[name="keyword"]');
    const locationInput = form.querySelector('[name="location"]');
    const typeInput = form.querySelector('[name="type"]');

    if (keywordInput) keywordInput.value = keyword;
    if (locationInput) locationInput.value = location;
    if (typeInput) typeInput.value = type;
  });
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

    if (!validateForm(heroSearchForm)) {
      return;
    }

    const searchValues = getSearchValues(heroSearchForm);
    syncFormValues(searchValues);
    applyJobSearch(searchValues);

    const jobsSection = document.querySelector("#jobs");
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

if (filterForms.length && jobCards.length) {
  const runFilter = (form) => {
    clearFormMessage(form);
    applyJobSearch(getSearchValues(form));
  };

  filterForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (validateForm(form)) {
        runFilter(form);
      }
    });

    form.addEventListener("input", () => runFilter(form));
    form.addEventListener("change", () => runFilter(form));
  });
}

if (applyForm) {
  applyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (applySuccessMessage) {
      applySuccessMessage.hidden = true;
    }

    if (!validateForm(applyForm)) {
      return;
    }

    applyForm.reset();

    if (applySuccessMessage) {
      applySuccessMessage.hidden = false;
      applySuccessMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

validationForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      return;
    }

    setFormMessage(form, form.dataset.successMessage || "Submitted successfully.", "success");
    form.reset();
  });

  form.addEventListener("input", () => clearFormMessage(form));
});
