function showCustomAlert(message) {
    document.getElementById("customAlertMsg").textContent = message;
    document.getElementById("customAlert").classList.remove("hidden");
}

function closeCustomAlert() {
    document.getElementById("customAlert").classList.add("hidden");
}

const user = localStorage.getItem("user");
if (user) {
    console.log("User exists in localStorage", JSON.parse(user));
} else {
    console.log("No user found in localStorage");
    showCustomAlert("You must be logged in to access this page.");
    window.location.href = "/login"; // Redirect to login page
}




function validateStep(currentStep, nextStep) {
    let inputs = document.querySelectorAll(`#step${currentStep} input[required]`);
    let valid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
            input.style.border = "2px solid red";
        } else {
            input.style.border = "";
        }
    });

    if (valid) {
        nextStepFunction(nextStep);
    }
}

function validateDropdown(inputId) {
    const dropdown = document.getElementById(inputId);
    if (!dropdown) {
        console.error(`Dropdown with ID '${inputId}' not found.`);
        return false;
    }

    if (dropdown.value === "default") {
        showCustomAlert(`🚨 Please select a valid value for "${dropdown.name || inputId}".`);
        dropdown.style.border = "2px solid red";
        return false;
    }

    dropdown.style.border = "";
    return true;
}

function nextStepFunction(step) {
    document.querySelector('.form-step.active').classList.remove('active');
    document.getElementById('step' + step).classList.add('active');
    updateHeader(step);
}

function prevStep(step) {
    document.querySelector('.form-step.active').classList.remove('active');
    document.getElementById('step' + step).classList.add('active');
    updateHeader(step);
}

function gotoStep(step) {
    let currentStep = document.querySelector('.form-step.active').id.replace('step', '');
    if (parseInt(currentStep) < step) {
        validateStep(currentStep, step);
    } else {
        nextStepFunction(step);
    }
}

function updateHeader(step) {
    document.querySelectorAll('.step-header button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn' + step).classList.add('active');
}

function validateFileSize(input) {
    const file = input.files[0];
    if (!file) return;

    const errorMsg = document.getElementById("file-size-error");
    if (file.size > 200 * 1024) {
        errorMsg.style.display = "block";
        errorMsg.textContent = "File size must be under 200KB.";
    } else {
        errorMsg.style.display = "none";
    }
}

function validateAadhaar(input) {
    const aadhaarError = document.getElementById('aadhaarError');
    if (input.value.length !== 12) {
        aadhaarError.style.display = 'block';
    } else {
        aadhaarError.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");

    if (!form) {
        console.error("❌ Form element not found.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        if (localStorage.getItem("paymentDone") !== "true") {
            event.preventDefault();
            showCustomAlert("Payment is required before submitting the form.");
            return;
        }

        event.preventDefault();

        const formData = new FormData();
        formData.append("firstName", document.getElementById("firstName").value);
        formData.append("middleName", document.getElementById("middleName").value);
        formData.append("lastName", document.getElementById("lastName").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("mobile", document.getElementById("mobile").value);
        formData.append("whatsapp", document.getElementById("Wmobile").value);
        formData.append("aadhaar", document.getElementById("aadhaar").value);
        formData.append("fatherIncome", document.getElementById("fatherIncome").value);
        formData.append("address", document.getElementById("address").value);
        formData.append("city", document.getElementById("city").value);
        formData.append("state", document.getElementById("state").value);
        formData.append("pincode", document.getElementById("pincode").value);
        formData.append("schoolName", document.getElementById("schoolName").value);
        formData.append("schoolAddress", document.getElementById("schoolAddress").value);
        formData.append("schoolCity", document.getElementById("schoolCity").value);
        formData.append("schoolType", document.getElementById("schoolTypes").value);
        formData.append("schoolBoard", document.getElementById("schoolBoard").value);
        formData.append("schoolMedium", document.getElementById("schoolMedium").value);
        formData.append("lastMarks", document.getElementById("lastMarks").value);
        formData.append("stream", document.getElementById("stream").value);
        formData.append("careerAspirations", document.getElementById("careerAspirations").value);

        // Files
        const files = [
            { id: "aadhaarFile", key: "aadhaarFile" },
            { id: "photographFile", key: "photographFile" },
            { id: "signatureFile", key: "signatureFile" },
            { id: "incomecertificateFile", key: "incomeCertificateFile" },
            { id: "schoolbonafideFile", key: "schoolBonafideFile" },
            { id: "DisabilityCertificateFile", key: "disabilityCertificateFile" }
        ];

        files.forEach(file => {
            const fileInput = document.getElementById(file.id)?.files[0];
            if (fileInput) formData.append(file.key, fileInput);
        });

        const aadhaar = document.getElementById("aadhaar").value;
        try {
            const checkResponse = await fetch(`http://localhost:3000/api/form/check-duplicate/${aadhaar}`);
            const checkData = await checkResponse.json();
            if (checkData.exists) {
                showCustomAlert("🚫 You have already registered. Redirecting to My Application Page.");
                window.location.href = "/";
                return;
            }
        } catch (error) {
            console.error("❌ Error Checking Aadhaar:", error);
            showCustomAlert("❌ Error verifying Aadhaar. Please try again.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/form/submit", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                showCustomAlert("✅ Registration Successful. Redirecting to My Application Page.");
                window.location.href = "/";
            } else {
                showCustomAlert("❌ Error: " + result.error);
            }
        } catch (error) {
            console.error("❌ Error Submitting Form:", error);
            showCustomAlert("❌ Error Submitting Form. Please try again.");
        }
    });
});
