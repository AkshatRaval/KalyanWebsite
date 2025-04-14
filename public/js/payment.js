document.getElementById("pay-btn").addEventListener("click", async () => {
    try {
        // ✅ Step 1: Create Order Request To Backend
        const response = await fetch("http://localhost:3000/create-order", {
            method: "POST"
        });

        const data = await response.json();

        if (!data.order || !data.key) {
            throw new Error("Invalid order response from server.");
        }

        // ✅ Step 2: Open Razorpay Popup For Payment
        var options = {
            key: data.key,  
            amount: data.order.amount,
            currency: "INR",
            name: "Kalyan Educational and Charitable Trust",
            description: "Registration Payment",
            order_id: data.order.id,
            handler: async function (response) {
                try {
                    // ✅ Step 3: Verify Payment on Backend
                    const confirmPayment = await fetch("http://localhost:3000/confirm-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            payment_id: response.razorpay_payment_id,
                            order_id: response.razorpay_order_id
                        })
                    });

                    const result = await confirmPayment.json();

                    if (result.success) {
                        alert("✅ Payment Successful. Submitting Form...");

                        // ✅ Save Payment Status
                        localStorage.setItem("paymentDone", "true");

                        // ✅ Prevent Duplicate Submission
                        const form = document.getElementById("registrationForm");
                        if (!form.dataset.submitting) {
                            form.dataset.submitting = "true";  // Mark form as submitting
                            form.submit(); // ✅ Auto-submit the form
                        }
                    } else {
                        alert("❌ Payment Verification Failed.");
                    }
                } catch (error) {
                    console.error("❌ Payment Verification Error:", error);
                    alert("❌ Error verifying payment. Please contact support.");
                }
            },
            prefill: {
                name: "Kalyan Educational and Charitable Trust",
                email: "kalyanconsultancy6800@gmail.com",
                contact: "7069856959"
            },
            theme: {
                color: "#3399cc"
            }
        };

        var rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Something went wrong. Please try again.");
    }
});
