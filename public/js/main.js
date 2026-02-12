const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("mainNav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

const quickModal = document.getElementById("quickViewModal");
const quickCards = document.querySelectorAll(".js-quick-card");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");

function renderQuickView(card) {
  const media = document.getElementById("quickViewMedia");
  const title = document.getElementById("quickViewTitle");
  const category = document.getElementById("quickViewCategory");
  const description = document.getElementById("quickViewDescription");
  const power = document.getElementById("quickViewPower");
  const price = document.getElementById("quickViewPrice");
  const link = document.getElementById("quickViewLink");
  const productId = document.getElementById("quickViewProductId");
  const next = document.getElementById("quickViewNext");

  if (!media || !title || !category || !description || !power || !price || !link || !productId || !next) return;

  const image = card.dataset.image || "";
  media.innerHTML = image
    ? `<img src=\"${image}\" alt=\"${card.dataset.title || "Produit"}\" />`
    : '<div class=\"card-media-placeholder\">Image produit</div>';

  title.textContent = card.dataset.title || "";
  category.textContent = card.dataset.category || "";
  description.textContent = card.dataset.description || "";
  power.textContent = card.dataset.power || "N/A";
  price.textContent = card.dataset.price || "0";
  link.setAttribute("href", card.dataset.link || "#");
  productId.value = card.dataset.productId || "";
  next.value = window.location.pathname + window.location.search;
}

function openQuickModal() {
  if (!quickModal) return;
  quickModal.classList.add("open");
  quickModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeQuickModal() {
  if (!quickModal) return;
  quickModal.classList.remove("open");
  quickModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

quickCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    const target = event.target;
    if (target.closest("a, button, form, input, select, textarea")) return;
    renderQuickView(card);
    openQuickModal();
  });

  const trigger = card.querySelector(".js-open-quick-view");
  if (trigger) {
    trigger.addEventListener("click", () => {
      renderQuickView(card);
      openQuickModal();
    });
  }
});

closeModalButtons.forEach((btn) => {
  btn.addEventListener("click", closeQuickModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeQuickModal();
});
