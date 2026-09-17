document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    if (!nav.id) nav.id = "site-navigation";
    toggle.setAttribute("aria-controls", nav.id);
    toggle.setAttribute("aria-expanded", "false");

    function closeNav(restoreFocus) {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeNav(false);
      });
    });

    document.addEventListener("click", function (event) {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !toggle.contains(event.target)) {
        closeNav(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && nav.classList.contains("open")) closeNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeNav(true);
      }
    });
  }

  const role = document.querySelector("#role");
  const type = new URLSearchParams(window.location.search).get("type");
  if (role && type && Array.from(role.options).some(option => option.value === type)) role.value = type;

  document.querySelectorAll(".js-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (form.hasAttribute("data-contact-draft")) {
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const body = "Name: " + data.get("name") + "\nReply email: " + data.get("email") + "\nRole: " + data.get("role") + "\n\n" + data.get("message");
        window.location.href = "mailto:mohan0512vittal@gmail.com?subject=" + encodeURIComponent("Compass Teens enquiry") + "&body=" + encodeURIComponent(body);
        form.querySelector(".form-success").classList.add("show");
        return;
      }
      if (form.dataset.submitting === "true") return;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.dataset.submitting = "true";
      form.setAttribute("aria-busy", "true");
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
          form.dataset.submitting = "false";
          form.removeAttribute("aria-busy");
          if (success) success.classList.remove("show");
        }, 6000);
      } else {
        form.dataset.submitting = "false";
        form.removeAttribute("aria-busy");
      }
    });
  });

  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
});
