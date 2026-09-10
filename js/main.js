document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    if (!nav.id) nav.id = "site-navigation";
    toggle.setAttribute("aria-controls", nav.id);
    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        toggle.focus();
      }
    });
  }

  const role = document.querySelector("#role");
  const type = new URLSearchParams(window.location.search).get("type");
  if (role && type && role.querySelector('option[value="' + type + '"]')) role.value = type;

  document.querySelectorAll(".js-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const success = form.querySelector(".form-success");
      if (success) {
        success.classList.add("show");
        success.setAttribute("role", "status");
        success.setAttribute("aria-live", "polite");
      }
      form.reset();
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        setTimeout(function () {
          button.disabled = false;
          if (success) success.classList.remove("show");
        }, 6000);
      }
    });
  });

  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
});
