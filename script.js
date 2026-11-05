// Mark Holdings Boutique - customer storefront
// Products are loaded from the shared Supabase database.
const SUPABASE_URL = "https://ehzqnnvjtmodaqxgenyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_87xfOYPzZwJ7Cisdd88c1Q_PdthlQqy";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mobile navigation
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => nav.classList.toggle("active"));
  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("active"));
  });
}

function orderProduct(productName, price) {
  const phoneNumber = "254706035845";
  const message = "Hello Mark Holdings Boutique 👋\n\nI would like to order:\nProduct: " +
    productName + "\nPrice: KSh " + price;
  window.open("https://wa.me/" + phoneNumber + "?text=" + encodeURIComponent(message), "_blank");
}

function makeProductCard(product) {
  const card = document.createElement("div");
  card.className = "card";

  const imageBox = document.createElement("div");
  imageBox.className = "image-box";
  const img = document.createElement("img");
  img.src = product.image_url || "https://placehold.co/600x600?text=Mark+Holdings";
  img.alt = product.name || "Boutique product";
  img.loading = "lazy";
  imageBox.appendChild(img);

  const content = document.createElement("div");
  content.className = "card-content";
  const title = document.createElement("h3");
  title.textContent = product.name;
  const category = document.createElement("p");
  category.textContent = product.category || "Men's fashion";
  const description = document.createElement("p");
  description.textContent = product.description || "Quality men's fashion.";
  const price = document.createElement("h4");
  price.textContent = "KSh " + Number(product.price).toLocaleString("en-KE");

  const stock = document.createElement("p");
  stock.className = "stock-status";
  const available = Number(product.stock) > 0;
  stock.textContent = available ? "🟢 IN STOCK (" + product.stock + ")" : "🔴 OUT OF STOCK";
  stock.style.color = available ? "#00c853" : "#ff4444";

  const button = document.createElement("button");
  button.className = "order-btn";
  button.textContent = available ? "ORDER NOW" : "OUT OF STOCK";
  button.disabled = !available;
  if (available) button.addEventListener("click", () => orderProduct(product.name, product.price));

  content.append(title, category, description, price, stock, button);
  card.append(imageBox, content);
  return card;
}

async function displayProducts() {
  const container = document.getElementById("product-container");
  if (!container) return;

  container.textContent = "Loading products...";
  const { data, error } = await db
    .from("products")
    .select("id,name,category,description,price,stock,image_url,created_at")
    .order("created_at", { ascending: false });

  container.innerHTML = "";
  if (error) {
    const message = document.createElement("p");
    message.textContent = "Products are temporarily unavailable. Please try again later.";
    container.appendChild(message);
    console.error("Supabase products error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    const message = document.createElement("p");
    message.textContent = "New products coming soon. Please check back!";
    container.appendChild(message);
    return;
  }

  data.forEach(product => container.appendChild(makeProductCard(product)));
}

displayProducts();


// Live updates: refresh the customer catalogue when products change in Supabase.
db.channel("products-live")
  .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
    displayProducts();
  })
  .subscribe();
