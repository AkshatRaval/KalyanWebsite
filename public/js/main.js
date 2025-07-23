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

function showCustomAlert(message) {
    document.getElementById("customAlertMsg").textContent = message;
    document.getElementById("customAlert").classList.remove("hidden");
}

function closeCustomAlert() {
    document.getElementById("customAlert").classList.add("hidden");
}

const auditReport = async () => {
    try {
        // Attempt to fetch the audit report file (replace 'audit-report.pdf' with your actual file path)
        const response = await fetch('/assets/audit-report.pdf');
        if (!response.ok) {
            throw new Error('FileNotFoundError');
        }
        const blob = await response.blob();
        // Create a temporary link to trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        if (error.message === 'FileNotFoundError') {
            showCustomAlert("Audit report of This Quarter will be coming soon");
        } else {
            showCustomAlert("An error occurred while downloading the audit report.");
        }
    }
};

const donors = [
    { name: "Shree Hareshbhai Patel", amount: "8100₹" },
    { name: "Shree Gauravbhai Jani", amount: "3100₹" },
    { name: "Shree Bhaveshbhai Kumkhaniya", amount: "3100₹" },
    { name: "Shree Parbatbhai Ughreja", amount: "3100₹" },
    { name: "Shree Akshatbhai Raval", amount: "3100₹" },
    { name: "Shree Devdeepsinh Zala", amount: "3100₹" },
    { name: "Shree Ghanshyambhai Dharajiya", amount: "3000₹" },
    { name: "Shree Yashrajsinh Jadeja", amount: "3000₹" },
    { name: "Shree Niravbhai Bhatt", amount: "3000₹" },
    { name: "Shree Harshbhai Sarola", amount: "2100₹" },
    { name: "Shree Dipakbhai Adgama", amount: "2100₹" },
];

const updates = [
    "Post Metric Scholarship Forms on Digital Gujarat Portal For SC Students remain open from 17/03/2025 to 26/03/2025",
    "Scholarship Form deadline has been extended for all pending students.",
];

function generateList(items, isDonor = false) {
    return `
    <div class="scrollContent">
        ${items.map(item => `
        <div class="detailsParagraph">
          <i class="fas fa-hand-point-right"></i>
          <span>${isDonor ? `<strong>${item.name}:</strong> ${item.amount}` : item}</span>
        </div>
      `).join("")}
    </div>
    `;
}

document.getElementById("donorList").innerHTML = generateList(donors, true);
document.getElementById("updateList").innerHTML = generateList(updates);

// FAQ toggle functionality (add this script at bottom of body or in your JS file)
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        faqItem.classList.toggle('active');
    });
});

