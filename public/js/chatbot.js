const ChatBody = document.querySelector('.chat-body');
const sendBtn = document.querySelector('#sendBtn');
const messageInput = document.querySelector('.message-input');
const form = document.querySelector('.chatForm');
const chatbotPopup = document.querySelector('.chatbot-popup');
const chatbotToggler = document.getElementById("chatbot-toggler");
const closeBtn = document.getElementById("closeBtn");


const API_KEY = `AIzaSyD-9AfY_aId4jvhllBjjNCKB8_iTHAOy2Q`
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null
}


// Creates message elemnt with dynamic Classes and return div
const createMessageElement = (message, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes)
    div.innerHTML = message;
    return div;
}

const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector('.message-text');

    const requestOption = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }]
            }]
        })
    }

    try {
        const response = await fetch(API_URL, requestOption);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message)

        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;
    } catch (error) {
        console.log(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000"

    } finally {
        incomingMessageDiv.classList.remove('thinking');
        ChatBody.scrollTo({ top: ChatBody.scrollHeight, behavior: "smooth" });
    }
}

function getCustomBotResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes("chatbot")) {
        return "I'm your helpful chatbot! Ask me anything about the scholarship or registration process.";
    }
    if (msg.includes("hello") || msg.includes("hi")) {
        return "Hello! How can I assist you today?";
    }
    if (msg.includes("help") || msg.includes("support")) {
        return "Sure! What do you need help with? You can ask about the scholarship, registration, or any other queries.";
    }
    if (msg.includes("scholarship") || msg.includes("date") || msg.includes("deadline")) {
        return "The scholarship application deadline is December 31st. Make sure to submit your application before then!\nTo apply for the scholarship, please visit our registration page.";
    }
    if (msg.includes("registration") || msg.includes("apply")) {
        return "To register for the scholarship, please fill out the registration form on our website. If you have any issues, feel free to ask!";
    }
    if (msg.includes("documents") || msg.includes("upload")) {
        return "You can upload your documents during the registration process. Make sure to have all required documents ready!";
    }
    if (msg.includes("payment") || msg.includes("fee")) {
        return "The scholarship application fee is ₹300. You can make the payment online during the registration process.";
    }
    if (msg.includes("status") || msg.includes("check")) {
        return "To check your application status, please visit the 'My Application' section on our website. You can view your application details there.";
    }
    if (msg.includes("contact") || msg.includes("support")) {
        return "If you need further assistance, you can contact our support team at";
    }
    if (msg.includes("syllabus") || msg.includes("exam")) {
        return "The scholarship exam syllabus includes topics from your current academic curriculum. Make sure to review your subjects thoroughly!\nFor more details, you can refer to the syllabus document available on our website.";
    }
    if (msg.includes("thank you") || msg.includes("thanks")) {
        return "You're welcome! If you have any more questions, feel free to ask. Good luck with your scholarship application!";
    }
    // Add more keyword-based responses as needed

    return null; // No custom response, use API
}

// Handles outgoing messages from user
const handleOutGoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";

    // create and display user message
    const message = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(message, 'user-message');
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    ChatBody.appendChild(outgoingMessageDiv);
    ChatBody.scrollTo({ top: ChatBody.scrollHeight, behavior: "smooth" });

    // Check for custom response
    const customResponse = getCustomBotResponse(userData.message);
    if (customResponse) {
        const botMsg = `<span class="material-symbols-rounded bot-avatar">smart_toy</span>
            <div class="message-text">${customResponse}</div>`;
        const incomingMessageDiv = createMessageElement(botMsg, 'bot-message');
        ChatBody.appendChild(incomingMessageDiv);
        ChatBody.scrollTo({ top: ChatBody.scrollHeight, behavior: "smooth" });
        return;
    }

    setTimeout(() => {
        const message = `<span class="material-symbols-rounded bot-avatar">smart_toy</span>
                    <div class="message-text">
                    <div class="thinkingMsg">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div></div>`;
        const incomingMessageDiv = createMessageElement(message, 'bot-message', 'thinking');
        ChatBody.appendChild(incomingMessageDiv);
        ChatBody.scrollTo({ top: ChatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);

    }, 5000)
}


messageInput.addEventListener('keydown', (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === 'Enter' && userMessage) {
        handleOutGoingMessage(e);
    }
});


sendBtn.addEventListener('click', (e) => handleOutGoingMessage(e));
chatbotToggler.addEventListener('click', (e) => {
    chatbotPopup.classList.toggle("active")
});
closeBtn.addEventListener('click', (e) => {
    chatbotPopup.classList.toggle("active")
});
