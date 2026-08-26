document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

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
