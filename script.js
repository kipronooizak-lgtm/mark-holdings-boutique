// MOBILE MENU
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", function () {
    nav.classList.toggle("active");
  });
}

document.querySelectorAll("nav a").forEach(function (link) {
  link.addEventListener("click", function () {
    nav.classList.remove("active");
  });
});

// PRODUCTS FROM ADMIN PAGE
const defaultProducts = [
  {
    name: "Premium Jeans",
    description: "Modern and comfortable men's jeans.",
    price: "2500",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
    stock: "in"
  },
  {
    name: "Premium T-Shirt",
    description: "Comfortable shirts for everyday style.",
    price: "1500",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
    stock: "in"
  },
  {
    name: "Luxury Sneakers",
    description: "Stylish sneakers for every occasion.",
    price: "4500",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    stock: "in"
  },
  {
    name: "Football Jerseys",
    description: "Latest jerseys for football lovers.",
    price: "2000",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200&auto=format&fit=crop",
    stock: "in"
  }
];

function getProducts() {
  const saved = localStorage.getItem("products");

  if (saved) {
    return JSON.parse(saved);
  }

  return defaultProducts;
}

function displayProducts() {
  const container = document.getElementById("product-container");

  if (!container) return;

  const products = getProducts();

  container.innerHTML = "";

  products.forEach(function (product) {
    const card = document.createElement("div");
    card.className = "card";

    const imageBox = document.createElement("div");
    imageBox.className = "image-box";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;

    imageBox.appendChild(img);

    const content = document.createElement("div");
    content.className = "card-content";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const description = document.createElement("p");
    description.textContent =
      product.description || "Quality men's fashion.";

    const price = document.createElement("h4");
    price.textContent = "KSh " + product.price;

    const stock = document.createElement("p");
    stock.className = "stock-status";

    const button = document.createElement("button");
    button.className = "order-btn";

    if (product.stock === "in") {
      stock.textContent = "🟢 IN STOCK";
      stock.style.color = "#00c853";

      button.textContent = "ORDER NOW";

      button.onclick = function () {
        orderProduct(product.name, product.price);
      };
    } else {
      stock.textContent = "🔴 OUT OF STOCK";
      stock.style.color = "#ff4444";

      button.textContent = "OUT OF STOCK";
      button.disabled = true;
    }

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(price);
    content.appendChild(stock);
    content.appendChild(button);

    card.appendChild(imageBox);
    card.appendChild(content);

    container.appendChild(card);
  });
}

// WHATSAPP ORDER
function orderProduct(productName, price) {
  const phoneNumber = "254706035845";

  const message =
    "Hello Mark Holdings Boutique 👋\n\n" +
    "I would like to order:\n" +
    "Product: " + productName + "\n" +
    "Price: KSh " + price;

  const whatsappURL =
    "https://wa.me/" +
    phoneNumber +
    "?text=" +
    encodeURIComponent(message);

  window.open(whatsappURL, "_blank");
}

displayProducts();
