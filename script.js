const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("theme-toggle");

// ----- EVENT LISTENERS -----
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

// ----- SEND MESSAGE -----
function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  const time = getTime();
  addMessage(message, "user", time);
  saveMessage(message, "user", time);
  userInput.value = "";

  showTyping();
  getAIResponse(message).then(reply => {
    hideTyping();
    const replyTime = getTime();
    addMessage(reply, "bot", replyTime);
    speak(reply);
    saveMessage(reply, "bot", replyTime);
  });
}

// ----- ADD MESSAGE -----
function addMessage(text, sender, time, scroll=true) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", `${sender}-message`);

  const avatar = document.createElement("img");
  avatar.classList.add("avatar");
  avatar.src = sender === "bot" 
    ? "https://cdn-icons-png.flaticon.com/512/4712/4712100.png"
    : "https://cdn-icons-png.flaticon.com/512/2202/2202112.png";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = `${text}<div class="timestamp">${time}</div>`;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatBox.appendChild(msgDiv);

  if(scroll) chatBox.scrollTop = chatBox.scrollHeight;
}

// ----- SAVE CHAT -----
function saveMessage(text, sender, time) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ text, sender, time });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

// ----- TYPING ANIMATION -----
function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot-message", "typing");
  typingDiv.id = "typing";
  typingDiv.innerHTML = `
    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png" class="avatar" />
    <div class="bubble">
      <div class="typing-dots"><span>.</span><span>.</span><span>.</span></div>
    </div>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function hideTyping() {
  const typing = document.getElementById("typing");
  if(typing) typing.remove();
}

// ----- VOICE -----
function speak(text){
  const speech = new SpeechSynthesisUtterance(text);
  speech.pitch = 1;
  speech.rate = 1;
  speech.volume = 1;
  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female"));
  speech.voice = femaleVoice || voices[0];
  speechSynthesis.speak(speech);
}

// ----- THEME -----
function toggleTheme() {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// ----- CURRENT TIME -----
function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ----- AI RESPONSE USING HUGGING FACE -----
async function getAIResponse(input){
  const API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base";
  const API_KEY = "YOUR_HUGGINGFACE_API_KEY"; // Replace with your free token

  try{
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({inputs: input})
    });
    const data = await res.json();
    return data[0]?.generated_text || "Sorry, I couldn't understand that!";
  }catch(err){
    return "Oops! Something went wrong 😢";
  }
}
