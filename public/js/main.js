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
            alert("Audit report of This Quarter will be coming soon");
        } else {
            alert("An error occurred while downloading the audit report.");
        }
    }
};
