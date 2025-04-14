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

    }, 600)
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
