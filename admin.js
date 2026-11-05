// Mark Holdings Boutique - protected admin dashboard
const SUPABASE_URL = "https://ehzqnnvjtmodaqxgenyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_87xfOYPzZwJ7Cisdd88c1Q_PdthlQqy";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const messageEl = document.getElementById("message");
const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

function showMessage(message, isError = false) {
  messageEl.textContent = message;
  messageEl.style.color = isError ? "#ff7777" : "#ffd400";
}
function setLoggedIn(isLoggedIn) {
  loginPanel.classList.toggle("hidden", isLoggedIn);
  dashboard.classList.toggle("hidden", !isLoggedIn);
}
function clearForm() {
  productForm.reset();
  document.getElementById("productId").value = "";
  document.getElementById("saveBtn").textContent = "SAVE PRODUCT";
  document.getElementById("cancelEditBtn").classList.add("hidden");
}
document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  showMessage("Signing in...");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    showMessage("Login failed: " + error.message, true);
    return;
  }
  setLoggedIn(true);
  showMessage("You are signed in.");
  await loadProducts();
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const { error } = await db.auth.signOut();
  if (error) showMessage(error.message, true);
  else { setLoggedIn(false); showMessage("You have logged out."); }
});
document.getElementById("cancelEditBtn").addEventListener("click", clearForm);

productForm.addEventListener("submit", async event => {
  event.preventDefault();
  const { data: authData, error: authError } = await db.auth.getUser();
  if (authError || !authData.user) {
    showMessage("No valid Supabase login session. Please log out and sign in again.", true);
    return;
  }
  const signedInUserId = authData.user.id;
  console.log("Authenticated Supabase user ID:", signedInUserId);
  const id = document.getElementById("productId").value;
  const imageFile = document.getElementById("imageFile").files[0];
  let imageUrl = document.getElementById("imageUrl").value.trim() || null;
  if (imageFile) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type) || imageFile.size > 5 * 1024 * 1024) {
      showMessage("Choose a JPG, PNG or WEBP image smaller than 5 MB.", true);
      return;
    }
    showMessage("Uploading product image...");
    const extension = imageFile.name.split(".").pop().toLowerCase();
    const filePath = Date.now() + "-" + Math.random().toString(36).slice(2) + "." + extension;
    const { error: uploadError } = await db.storage.from("product-images").upload(filePath, imageFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: imageFile.type
    });
    if (uploadError) {
      showMessage("Image upload failed: " + uploadError.message, true);
      return;
    }
    imageUrl = db.storage.from("product-images").getPublicUrl(filePath).data.publicUrl;
  }
  const product = {
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value.trim(),
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    image_url: imageUrl,
    description: document.getElementById("description").value.trim() || null,
    updated_at: new Date().toISOString()
  };
  if (!product.name || !product.category || !Number.isFinite(product.price) ||
      product.price < 0 || !Number.isInteger(product.stock) || product.stock < 0) {
    showMessage("Enter a valid name, category, price and whole-number stock quantity.", true);
    return;
  }

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  showMessage("Saving product...");
  let result;
  if (id) {
    result = await db.from("products").update(product).eq("id", id).select().single();
  } else {
    result = await db.from("products").insert(product).select().single();
  }
  saveBtn.disabled = false;

  if (result.error) {
    showMessage("Save blocked for user " + signedInUserId + ": " + result.error.message, true);
    return;
  }
  clearForm();
  showMessage("Product saved. Your customer website can now display the update.");
  await loadProducts();
});

async function loadProducts() {
  productList.textContent = "Loading products...";
  const { data, error } = await db.from("products")
    .select("id,name,category,description,price,stock,image_url")
    .order("created_at", { ascending: false });
  if (error) {
    productList.textContent = "Could not load products: " + error.message;
    return;
  }
  productList.innerHTML = "";
  if (!data || data.length === 0) {
    productList.textContent = "No products yet. Add your first product above.";
    return;
  }
  data.forEach(product => {
    const item = document.createElement("article");
    item.className = "product";
    const img = document.createElement("img");
    img.src = product.image_url || "https://placehold.co/200x200?text=Product";
    img.alt = product.name;
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = product.name;
    const info = document.createElement("p");
    info.className = "muted";
    info.textContent = product.category + " · KSh " +
      Number(product.price).toLocaleString("en-KE") + " · Stock: " + product.stock;
    const description = document.createElement("p");
    description.className = "muted";
    description.textContent = product.description || "";
    const actions = document.createElement("div");
    actions.className = "actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "EDIT";
    edit.addEventListener("click", () => {
      document.getElementById("productId").value = product.id;
      document.getElementById("name").value = product.name;
      document.getElementById("category").value = product.category;
      document.getElementById("price").value = product.price;
      document.getElementById("stock").value = product.stock;
      document.getElementById("imageUrl").value = product.image_url || "";
      document.getElementById("imageFile").value = "";
      document.getElementById("description").value = product.description || "";
      document.getElementById("saveBtn").textContent = "UPDATE PRODUCT";
      document.getElementById("cancelEditBtn").classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    const del = document.createElement("button");
    del.type = "button";
    del.className = "danger";
    del.textContent = "DELETE";
    del.addEventListener("click", async () => {
      if (!window.confirm("Delete " + product.name + "?")) return;
      const { error: deleteError } = await db.from("products").delete().eq("id", product.id);
      if (deleteError) showMessage("Could not delete: " + deleteError.message, true);
      else { showMessage("Product deleted."); await loadProducts(); }
    });
    actions.append(edit, del);
    details.append(title, info, description, actions);
    item.append(img, details);
    productList.appendChild(item);
  });
}

db.auth.getSession().then(async ({ data, error }) => {
  if (error) showMessage(error.message, true);
  const signedIn = Boolean(data && data.session);
  setLoggedIn(signedIn);
  if (signedIn) await loadProducts();
});
db.auth.onAuthStateChange((_event, session) => {
  const signedIn = Boolean(session);
  setLoggedIn(signedIn);
  if (signedIn) loadProducts();
});
