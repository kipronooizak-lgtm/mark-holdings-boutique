// Mark Holdings Boutique - customer storefront
// Products and customer orders use the shared Supabase database.
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

function whatsappInquiry(product) {
  const phoneNumber = "254706035845";
  const message = "Hello Mark Holdings Boutique 👋\n\nI have an inquiry about:\nProduct: " +
    product.name + "\nPrice: KSh " + Number(product.price).toLocaleString("en-KE") +
    "\nIs it available?";
  window.open("https://wa.me/" + phoneNumber + "?text=" + encodeURIComponent(message), "_blank");
}

function ensureOrderDialog() {
  if (document.getElementById("orderDialog")) return;
  const style = document.createElement("style");
  style.textContent = `
    #orderDialog{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;padding:18px}
    #orderDialog.open{display:flex}
    #orderDialog .order-panel{background:#171717;color:#fff;border:1px solid #d4af37;border-radius:12px;padding:22px;width:100%;max-width:440px;max-height:90vh;overflow:auto}
    #orderDialog h2{color:#ffd400;margin-top:0}
    #orderDialog label{display:block;margin:12px 0 5px}
    #orderDialog input{width:100%;padding:12px;border:1px solid #777;border-radius:6px;background:#fff;color:#111;font-size:16px}
    #orderDialog .order-total{font-weight:bold;color:#ffd400;margin:14px 0}
    #orderDialog button{padding:12px;border:0;border-radius:6px;cursor:pointer;font-weight:bold}
    #orderDialog .submit-order{width:100%;background:#ffd400;color:#111}
    #orderDialog .close-order{width:100%;margin-top:8px;background:#444;color:#fff}
    #orderDialog .order-message{min-height:20px;color:#ffd400}
    .product-order-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:12px}
    .product-order-actions button{width:100%;padding:11px;border:0;border-radius:5px;font-weight:bold;cursor:pointer}
    .product-order-actions .order-btn{background:#ffd400;color:#111}
    .product-order-actions .inquiry-btn{background:#222;color:#ffd400;border:1px solid #d4af37}
    .product-order-actions button:disabled{opacity:.55;cursor:not-allowed}
  `;
  document.head.appendChild(style);

  const dialog = document.createElement("div");
  dialog.id = "orderDialog";
  dialog.innerHTML = `
    <div class="order-panel" role="dialog" aria-modal="true" aria-labelledby="orderTitle">
      <h2 id="orderTitle">Place Your Order</h2>
      <p id="orderProductSummary"></p>
      <form id="customerOrderForm">
        <label for="orderCustomerName">Your full name</label>
        <input id="orderCustomerName" type="text" required maxlength="120" autocomplete="name">
        <label for="orderCustomerPhone">Phone number</label>
        <input id="orderCustomerPhone" type="tel" required maxlength="25" autocomplete="tel" placeholder="e.g. 07XXXXXXXX">
        <label for="orderDeliveryLocation">Delivery location</label>
        <input id="orderDeliveryLocation" type="text" required maxlength="250" placeholder="Town, estate or delivery address">
        <label for="orderQuantity">Quantity</label>
        <input id="orderQuantity" type="number" min="1" step="1" value="1" required>
        <p class="order-total" id="orderTotal"></p>
        <p class="order-message" id="orderMessage" role="status" aria-live="polite"></p>
        <button class="submit-order" id="submitCustomerOrder" type="submit">SUBMIT ORDER</button>
        <button class="close-order" id="closeOrderDialog" type="button">CANCEL</button>
      </form>
    </div>`;
  document.body.appendChild(dialog);

  document.getElementById("closeOrderDialog").addEventListener("click", closeOrderDialog);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeOrderDialog();
  });
  document.getElementById("orderQuantity").addEventListener("input", updateOrderTotal);
  document.getElementById("customerOrderForm").addEventListener("submit", submitCustomerOrder);
}

let selectedOrderProduct = null;

function updateOrderTotal() {
  if (!selectedOrderProduct) return;
  const quantityInput = document.getElementById("orderQuantity");
  const quantity = Math.max(0, Number(quantityInput.value) || 0);
  document.getElementById("orderTotal").textContent =
    "Total: KSh " + (quantity * Number(selectedOrderProduct.price)).toLocaleString("en-KE");
}

function openOrderDialog(product) {
  ensureOrderDialog();
  selectedOrderProduct = product;
  const quantityInput = document.getElementById("orderQuantity");
  quantityInput.max = String(Number(product.stock));
  quantityInput.value = "1";
  document.getElementById("orderProductSummary").textContent =
    product.name + " — KSh " + Number(product.price).toLocaleString("en-KE") +
    " (Available: " + product.stock + ")";
  document.getElementById("orderMessage").textContent = "";
  document.getElementById("submitCustomerOrder").disabled = false;
  document.getElementById("submitCustomerOrder").textContent = "SUBMIT ORDER";
  document.getElementById("orderDialog").classList.add("open");
  updateOrderTotal();
  document.getElementById("orderCustomerName").focus();
}

function closeOrderDialog() {
  const dialog = document.getElementById("orderDialog");
  if (dialog) dialog.classList.remove("open");
}

async function submitCustomerOrder(event) {
  event.preventDefault();
  if (!selectedOrderProduct) return;

  const name = document.getElementById("orderCustomerName").value.trim();
  const phone = document.getElementById("orderCustomerPhone").value.trim();
  const location = document.getElementById("orderDeliveryLocation").value.trim();
  const quantity = Number(document.getElementById("orderQuantity").value);
  const stock = Number(selectedOrderProduct.stock);
  const price = Number(selectedOrderProduct.price);
  const message = document.getElementById("orderMessage");
  const submitButton = document.getElementById("submitCustomerOrder");

  if (!name || !phone || !location || !Number.isInteger(quantity) ||
      quantity < 1 || quantity > stock) {
    message.textContent = "Please check your details and choose a quantity within available stock.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "SUBMITTING...";
  message.textContent = "Submitting your order...";

  const order = {
    customer_name: name,
    phone: phone,
    delivery_location: location,
    product_id: selectedOrderProduct.id,
    product_name: selectedOrderProduct.name,
    quantity,
    unit_price: price,
    total_price: quantity * price
  };

  const { error } = await db.from("orders").insert(order);
  if (error) {
    console.error("Order submission error:", error.message);
    message.textContent = "Sorry, your order could not be submitted. Please try again or use WhatsApp.";
    submitButton.disabled = false;
    submitButton.textContent = "SUBMIT ORDER";
    return;
  }

  message.textContent = "Your order has been received! We will contact you to confirm it.";
  submitButton.textContent = "ORDER RECEIVED";
  document.getElementById("customerOrderForm").reset();
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

  const actions = document.createElement("div");
  actions.className = "product-order-actions";

  const orderButton = document.createElement("button");
  orderButton.className = "order-btn";
  orderButton.textContent = available ? "ORDER NOW" : "OUT OF STOCK";
  orderButton.disabled = !available;
  if (available) orderButton.addEventListener("click", () => openOrderDialog(product));

  const inquiryButton = document.createElement("button");
  inquiryButton.className = "inquiry-btn";
  inquiryButton.textContent = "WHATSAPP INQUIRY";
  inquiryButton.addEventListener("click", () => whatsappInquiry(product));

  actions.append(orderButton, inquiryButton);
  content.append(title, category, description, price, stock, actions);
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
