document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const amount = document.getElementById("amount").value;

    // Create order on server
    const res = await fetch("/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });
    const data = await res.json();

    if (!data.orderId || !data.key) {
        alert("Failed to create donation order. Please try again.");
        return;
    }

    // Open Razorpay payment popup
    const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Kalyan Educational and Charitable Trust",
        description: "Donation",
        order_id: data.orderId,
        handler: function (response) {
            alert("Thank you for your donation! Payment ID: " + response.razorpay_payment_id);
            window.location.reload();
        },
        theme: { color: "#5e60ce" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
});