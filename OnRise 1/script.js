document.addEventListener("DOMContentLoaded", () => {
  const fadeElements = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  fadeElements.forEach(el => observer.observe(el));
});


document.querySelectorAll(".editorial-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".editorial-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;
    const cards = document.querySelectorAll("[data-category]");

    cards.forEach(card => {
      if (category === "todas" || card.dataset.category === category) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
});


document.getElementById("search").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const cards = document.querySelectorAll("[data-category]");
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(query) ? "" : "none";
  });
});