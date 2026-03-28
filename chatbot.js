let isGenerating = false;
let messageHistory = [];

// DOM Elements
let chatToggleBtn, chatWindow, chatMessages, chatInputArea, chatForm, chatInput;
let initSuggestions;

document.addEventListener("DOMContentLoaded", () => {
    // Select elements
    chatToggleBtn = document.getElementById("chat-toggle-btn");
    chatWindow = document.getElementById("chat-window");
    chatMessages = document.getElementById("chat-messages");
    chatInputArea = document.getElementById("chat-input-area");
    chatForm = document.getElementById("chat-form");
    chatInput = document.getElementById("chat-input");
    
    initSuggestions = document.getElementById("chat-init-suggestions");
    
    const closeBtn = document.getElementById("chat-close-btn");

    // Event Listeners
    chatToggleBtn.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", toggleChat);
    
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || isGenerating) return;
        
        await handleSendMessage(text);
    });

    // Handle suggestion clicks
    document.querySelectorAll(".chat-suggestion-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (isGenerating) return;
            initSuggestions.classList.add("hidden");
            const text = btn.textContent.trim();
            await handleSendMessage(text);
        });
    });
});

async function toggleChat() {
    const isHidden = chatWindow.classList.contains("hidden") || chatWindow.classList.contains("opacity-0");
    if (isHidden) {
        chatWindow.classList.remove("hidden");
        // Trigger reflow for transition
        void chatWindow.offsetWidth;
        chatWindow.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
        
        // Show initial welcome if history is empty
        if (messageHistory.length === 0) {
            appendMessage("ai", "Hello! I'm Ben's AI assistant. I can answer questions about his tech stack, backend development with Python, React Native, and AI architecture. What would you like to know?");
        }
    } else {
        chatWindow.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
        setTimeout(() => chatWindow.classList.add("hidden"), 300);
    }
}

async function handleSendMessage(userText) {
    chatInput.value = "";
    initSuggestions?.classList.add("hidden");
    
    // 1. Add User Message
    appendMessage("user", userText);
    messageHistory.push({ role: "user", content: userText });
    
    // 2. Prepare AI Message Bubble
    const aiBubble = createBubble("ai", "");
    const contentNode = aiBubble.querySelector(".content");
    chatMessages.appendChild(aiBubble);
    isGenerating = true;
    chatInput.disabled = true;
    scrollToBottom();

    try {
        // 3. Stream from our custom Groq Backend `/api/chat`
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: messageHistory })
        });
        
        if (!response.body) throw new Error("ReadableStream not supported");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let reply = "";

        // Read stream chunks
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkText = decoder.decode(value, { stream: true });
            reply += chunkText;
            contentNode.textContent = reply;
            scrollToBottom();
        }
        
        // Finalize History (Only keeping last few turns to avoid exceeding context limits on simple usage)
        messageHistory.push({ role: "assistant", content: reply });
        
    } catch (err) {
        contentNode.textContent = "Sorry, my systems encountered an error connecting to the inference engine.";
        console.error(err);
    } finally {
        isGenerating = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

function appendMessage(role, text) {
    const bubble = createBubble(role, text);
    chatMessages.appendChild(bubble);
    scrollToBottom();
}

function createBubble(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `flex w-full mb-4 ${role === "user" ? "justify-end" : "justify-start"}`;
    
    const bubble = document.createElement("div");
    if (role === "user") {
        bubble.className = "bg-zinc-800 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] text-sm font-body leading-relaxed shadow-sm";
    } else {
        bubble.className = "bg-transparent text-zinc-300 px-4 py-2 border border-zinc-800 rounded-2xl rounded-tl-sm max-w-[85%] text-sm font-body leading-relaxed shrink-0";
    }
    
    const textSpan = document.createElement("div");
    textSpan.className = "content whitespace-pre-wrap";
    textSpan.textContent = text;
    
    bubble.appendChild(textSpan);
    wrapper.appendChild(bubble);
    return wrapper;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
