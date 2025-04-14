// 🔹 Import Firebase SDK
import { db, auth } from "./firebase.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

/* 🔹 User Signup with Firestore */
async function signUpUser(name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🔹 Store name in Firestore
        await setDoc(doc(db, "users", user.uid), { name, email });

        // 🔹 Send email verification
        await sendEmailVerification(user);
        alert("Verification email sent! Please check your inbox before logging in.");
        window.location.href = "/login";
    } catch (error) {
        console.error("Signup Error:", error.message);
        alert(error.message);
    }
}

/* 🔹 User Login & Fetch Name */
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            alert("Please verify your email before logging in.");
            return;
        }

        // Fetch name from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : { name: "User" };

        // Store authentication data
        localStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid, name: userData.name }));

        alert("Login successful!");
        window.location.href = "/profile";

    } catch (error) {
        console.error("Login Error:", error);
        alert("Something went wrong. Please try again.");
    }
}

/* 🔹 Reset Password */
async function resetPassword() {
    try {
        // ✅ 1. Get Currently Logged-In User
        const user = auth.currentUser;

        if (!user) {
            alert("No user is currently logged in.");
            return;
        }

        // ✅ 2. Automatically Send Reset Link To Registered Email
        const email = user.email;
        await sendPasswordResetEmail(auth, email);

        // ✅ 3. Success Message
        alert(`Password reset email sent to: ${email}`);
    } catch (error) {
        console.error("Password Reset Error:", error.message);
        alert("Failed to send password reset email: " + error.message);
    }
}
async function forgotPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        alert(`Password reset email sent to ${email}`);
        return { success: true };  // ✅ Returns success status
    } catch (error) {
        console.error("Forgot Password Error:", error.message);
        alert("Failed to send password reset email: " + error.message);
        return { success: false, error: error.message };  // ✅ Returns error object
    }
}

/* 🔹 Export functions for use in HTML */
export { signUpUser, loginUser, resetPassword, getAuth, forgotPassword };
