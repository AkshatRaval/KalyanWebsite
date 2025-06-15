document.getElementById("pay-btn").addEventListener("click", async function (e) {
    e.preventDefault();

    if (!document.getElementById("confirmDetails").checked) {
        alert("Please confirm the checkboxes before submitting.");
        return;
    }

    // Create order from backend
    const orderRes = await fetch("http://localhost:3000/create-order", {
        method: "POST"
    });
    const orderData = await orderRes.json(); // <-- Add this line
    console.log(orderData);

    const options = {
        key: orderData.key, // Razorpay Key ID
        amount: orderData.amount,
        currency: "INR",
        name: "Kalyan Trust",
        description: "Scholarship Registration",
        order_id: orderData.order.id,
        handler: function (response) {
            submitForm(response.razorpay_payment_id);
        },
        prefill: {
            name: document.getElementById("firstName").value,
            email: document.getElementById("email").value,
            contact: document.getElementById("mobile").value
        },
        theme: {
            color: "#3399cc"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
});

async function submitForm(paymentId) {
    const form = document.getElementById("registrationForm");
    const formData = new FormData(form);

    formData.append("payment_id", paymentId); // ✅ correct key

    const response = await fetch("http://localhost:3000/api/form/submit", {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    if (result.success) {
        alert("Form submitted successfully!");
        window.location.href = "/myApplication";
    } else {
        alert("Something went wrong: " + result.error);
    }
}
