const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("theme-toggle");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

themeToggle.addEventListener("click", toggleTheme);

// Load chat history
window.onload = () => {
  const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
  savedChats.forEach(msg => addMessage(msg.text, msg.sender, msg.time, false));
};

// Send message
function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  const time = getTime();
  addMessage(message, "user", time);
  saveMessage(message, "user", time);
  userInput.value = "";

  showTyping();
  setTimeout(() => {
    const reply = getBotReply(message);
    hideTyping();
    const replyTime = getTime();
    addMessage(reply, "bot", replyTime);
    speak(reply);
    saveMessage(reply, "bot", replyTime);
  }, 1300);
}

// Add message
function addMessage(text, sender, time, scroll = true) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", `${sender}-message`);

  const avatar = document.createElement("img");
  avatar.classList.add("avatar");
  avatar.src =
    sender === "bot"
      ? "https://cdn-icons-png.flaticon.com/512/4712/4712100.png"
      : "https://cdn-icons-png.flaticon.com/512/2202/2202112.png";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = `${text}<div class="timestamp">${time}</div>`;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatBox.appendChild(msgDiv);

  if (scroll) chatBox.scrollTop = chatBox.scrollHeight;
}

// Save message
function saveMessage(text, sender, time) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ text, sender, time });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

// Typing animation
function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot-message", "typing");
  typingDiv.id = "typing";

  typingDiv.innerHTML = `
    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png" class="avatar" />
    <div class="bubble">
      <div class="typing-dots">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>
  `;

  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// Voice reply
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.pitch = 1;
  speech.rate = 1;
  speech.volume = 1;
  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female"));
  speech.voice = femaleVoice || voices[0];
  speechSynthesis.speak(speech);
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Get current time
function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Chatbot logic
function getBotReply(input) {
  input = input.toLowerCase();

  if (input.includes("hi") || input.includes("hello"))
    return "Hey there! 👋 Nice to see you!";
  if (input.includes("how are you"))
    return "I’m doing great! How about you?";
  if (input.includes("your name"))
    return "I’m ChatBot 3.0 — your messenger-style AI friend 🤖";
  if (input.includes("bye"))
    return "Goodbye! 👋 Talk to you soon!";
  if (input.includes("help"))
    return "You can ask me simple things — I can joke, motivate, or chat!";
  if (input.includes("joke"))
    return "😂 Why do JavaScript developers wear glasses? Because they can’t C#!";
  if (input.includes("motivate"))
    return "🌟 Keep coding — your bugs fear your persistence!";
  if (input.includes("clear"))
    return clearChat();

  return "Hmm... I’m not sure about that yet, but I’m learning fast! 💭";
}

// Clear chat
function clearChat() {
  localStorage.removeItem("chatHistory");
  chatBox.innerHTML = `
  <div class="message bot-message fade-in">
    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png" class="avatar" />
    <div class="bubble">🧹 Chat cleared! Let's start fresh.<div class="timestamp">${getTime()}</div></div>
  </div>`;
  return "Chat history cleared!";
}
