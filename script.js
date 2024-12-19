const products = [
    { id: 1, name: "Product 1", price: 50000 },
    { id: 2, name: "Product 2", price: 30000 },
    { id: 3, name: "Product 3", price: 5000 },
];

const cart = [];
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

document.querySelectorAll(".add-to-cart").forEach((button, index) => {
    button.addEventListener("click", () => {
        const product = products[index];
        cart.push(product);
        updateCart();
    });
});

function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - Rp${item.price}`;
        total += item.price;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            cart.splice(index, 1);
            updateCart();
        });

        li.appendChild(removeButton);
        cartItems.appendChild(li);
    });

    cartTotal.textContent = total.toFixed(2);
}

document.getElementById("checkout").addEventListener("click", () => {
    const grossAmount = cart.reduce((sum, item) => sum + item.price, 0);

    fetch('http://localhost:3000/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grossAmount: grossAmount }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.token) {
                snap.pay(data.token, {
                    onSuccess: function(result) {
                        alert("Payment Success");
                        console.log(result);
                    },
                    onPending: function(result) {
                        alert("Waiting for Payment");
                        console.log(result);
                    },
                    onError: function(result) {
                        alert("Payment Failed");
                        console.log(result);
                    },
                    onClose: function() {
                        alert("Payment Popup Closed");
                    },
                });
            }
        })
        .catch((error) => console.error('Error:', error));
});
