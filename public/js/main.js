document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user"); // Check if user is logged in

    if (user) {
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("profileBtn").style.display = "block";
    } else {
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("profileBtn").style.display = "none";
    }
});


