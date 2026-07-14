/* ==========================================================
   PORTFOLIO SETTINGS — edit values here only
   ========================================================== */
const portfolioSettings = {
  yearsOfExperience: 3,
  certificateMode: "gallery" // Change to "slideshow" to use the carousel mode.
};

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const nav = document.getElementById("mainNav");
  const progress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const themeToggle = document.getElementById("themeToggle");

  // Project previews and "View Project" links always open externally in a new, safe tab.
  document.querySelectorAll("[data-project-card] a[href]").forEach(link => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  // Theme persistence.
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light") body.classList.add("light-theme");
  updateThemeIcon();
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    localStorage.setItem("portfolio-theme", body.classList.contains("light-theme") ? "light" : "dark");
    updateThemeIcon();
  });
  function updateThemeIcon() {
    themeToggle.innerHTML = body.classList.contains("light-theme") ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
  }

  // Navigation appearance, page progress, and top button.
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    backToTop.classList.toggle("show", y > 500);
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${height ? (y / height) * 100 : 0}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Close the mobile menu after navigation.
  document.querySelectorAll("#navMenu .nav-link").forEach(link => link.addEventListener("click", () => {
    const menu = document.getElementById("navMenu");
    bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));

  // Always land precisely on the matching section when a navigation button is clicked.
  document.querySelectorAll("#mainNav a.nav-link").forEach(link => link.addEventListener("click", event => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", link.getAttribute("href"));
  }));

  // Keep one clear active navbar link while scrolling through sections.
  const navLinks = [...document.querySelectorAll("#mainNav a.nav-link")];
  const setActiveNavLink = id => navLinks.forEach(link => {
    const isCurrent = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
  });
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) setActiveNavLink(entry.target.id);
  }), { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
  navLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) sectionObserver.observe(section);
  });

  // Reveal elements when they enter the viewport.
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-zoom").forEach(el => revealObserver.observe(el));

  // Counters: project total is always calculated from actual project cards.
  document.getElementById("yearsCounter").dataset.counter = portfolioSettings.yearsOfExperience;
  // Skills total is calculated from the actual cards, so it stays correct when you add/remove a skill.
  document.getElementById("skillsCounter").dataset.counter = document.querySelectorAll(".skill-card").length;
  const projectCounter = document.getElementById("projectsCounter");
  projectCounter.dataset.counter = document.querySelectorAll("[data-project-card]").length;
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = Number(entry.target.dataset.counter);
    const start = performance.now(), duration = 1300;
    const tick = now => { const value = Math.min(1, (now - start) / duration); entry.target.textContent = Math.floor((1 - Math.pow(1 - value, 3)) * target); if (value < 1) requestAnimationFrame(tick); else entry.target.textContent = target; };
    requestAnimationFrame(tick); counterObserver.unobserve(entry.target);
  }), { threshold: .7 });
  document.querySelectorAll("[data-counter]").forEach(el => counterObserver.observe(el));

  // Certificate gallery, filters, slideshow, and image zoom.
  const gallery = document.getElementById("certificateGallery");
  const filters = document.getElementById("certificateFilters");
  const slideshow = document.getElementById("certificateSlideshow");
  const modeButtons = document.querySelectorAll("[data-certificate-mode]");
  const carouselInner = slideshow.querySelector(".carousel-inner");

  // Build the slideshow from gallery cards, so both views always contain the same certificates.
  carouselInner.innerHTML = "";
  gallery.querySelectorAll(".certificate-card").forEach((card, index) => {
    const image = card.querySelector("img");
    const slide = document.createElement("div");
    slide.className = `carousel-item${index === 0 ? " active" : ""}`;
    const slideImage = image.cloneNode();
    slideImage.className = "d-block w-100";
    slideImage.loading = "eager";
    const caption = document.createElement("div");
    caption.className = "carousel-caption";
    caption.innerHTML = `<span>${card.querySelector("span").textContent}</span><h3>${card.querySelector("h3").textContent}</h3>`;
    slide.append(slideImage, caption); carouselInner.append(slide);
  });

  const setCertificateMode = mode => {
    const isSlideshow = mode === "slideshow";
    portfolioSettings.certificateMode = mode;
    gallery.classList.toggle("d-none", isSlideshow);
    filters.classList.toggle("d-none", isSlideshow);
    slideshow.classList.toggle("d-none", !isSlideshow);
    modeButtons.forEach(button => button.classList.toggle("active", button.dataset.certificateMode === mode));
    if (isSlideshow) bootstrap.Carousel.getOrCreateInstance(slideshow, { interval: 5000, touch: true });
  };
  setCertificateMode(portfolioSettings.certificateMode);
  modeButtons.forEach(button => button.addEventListener("click", () => setCertificateMode(button.dataset.certificateMode)));
  filters.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    filters.querySelector(".active").classList.remove("active"); button.classList.add("active");
    const filter = button.dataset.filter;
    document.querySelectorAll(".certificate-item").forEach(item => item.classList.toggle("is-hidden", filter !== "all" && item.dataset.category !== filter));
  }));

  // Click any gallery certificate to view a full-size version in an accessible Bootstrap modal.
  document.body.insertAdjacentHTML("beforeend", '<div class="modal fade certificate-modal" id="certificateModal" tabindex="-1" aria-labelledby="certificateModalTitle" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-xl"><div class="modal-content"><div class="modal-header"><h2 class="modal-title fs-5" id="certificateModalTitle"></h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><img id="certificateModalImage" src="" alt=""></div></div></div></div>');
  const certificateModal = new bootstrap.Modal(document.getElementById("certificateModal"));
  const modalImage = document.getElementById("certificateModalImage");
  const modalTitle = document.getElementById("certificateModalTitle");
  gallery.querySelectorAll(".certificate-card img").forEach(image => image.addEventListener("click", () => {
    modalImage.src = image.currentSrc || image.src; modalImage.alt = image.alt;
    modalTitle.textContent = image.closest(".certificate-card").querySelector("h3").textContent;
    certificateModal.show();
  }));

  // Demo-only confirmation; replace form action or connect your preferred service to send messages.
  document.querySelector(".contact-form").addEventListener("submit", event => { event.preventDefault(); alert("Thank you! Your message is ready to be sent once you connect the form to an email service."); });
  document.getElementById("currentYear").textContent = new Date().getFullYear();
});

window.addEventListener("load", () => document.getElementById("preloader").classList.add("d-none"));
