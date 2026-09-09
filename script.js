// =====================================
// MARK HOLDINGS BOUTIQUE
// JAVASCRIPT
// =====================================


// WEBSITE LOADED

console.log("Mark Holdings Boutique Website Loaded");


// =====================================
// WELCOME MESSAGE
// =====================================

window.addEventListener("load", function () {

    console.log("Welcome to Mark Holdings Boutique!");

});


// =====================================
// MOBILE MENU
// =====================================

const menuBtn = document.getElementById("menuBtn");

const nav = document.getElementById("nav");


menuBtn.addEventListener("click", function () {

    nav.classList.toggle("active");

});


// CLOSE MENU WHEN LINK IS CLICKED

const navLinks = document.querySelectorAll("nav a");


navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        nav.classList.remove("active");

    });

});


// =====================================
// PRODUCT ORDER
// =====================================

function orderProduct(productName, price) {

    const phoneNumber = "254706035845";

    const message =
        "Hello Mark Holdings Boutique 👋\n\n" +
        "I would like to order:\n" +
        "Product: " + productName + "\n" +
        "Price: KSh " + price + "\n\n" +
        "Please let me know if it is available.";

    const whatsappURL =
        "https://wa.me/" +
        phoneNumber +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank");

}


// =====================================
// BUTTON HOVER EFFECT
// =====================================

const buttons = document.querySelectorAll(
    ".btn, .order-btn, .whatsapp-btn"
);


buttons.forEach(function (button) {

    button.addEventListener("mouseenter", function () {

        button.style.transform = "translateY(-3px)";

    });


    button.addEventListener("mouseleave", function () {

        button.style.transform = "translateY(0)";

    });

});
