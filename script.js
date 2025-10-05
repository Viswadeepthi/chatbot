const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("theme-toggle");

// ----- SINGLE VOICE SETUP -----
let botVoice = null;

function initVoice() {
  const voices = speechSynthesis.getVoices();
  botVoice = voices.find(v => v.name === "Google UK English Female") 
           || voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
           || voices[0];
}

window.speechSynthesis.onvoiceschanged = initVoice;
initVoice();

// ----- SPEAK FUNCTION -----
function speak(text){
  if(!botVoice) initVoice();
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = botVoice;
  utter.pitch = 1;
  utter.rate = 1;
  utter.volume = 1;
  speechSynthesis.speak(utter);
}

// ----- EVENT LISTENERS -----
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => { if(e.key==="Enter") sendMessage(); });
themeToggle.addEventListener("click", toggleTheme);

// ----- LOAD CHAT HISTORY -----
window.onload = () => {
  const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
  savedChats.forEach(msg => addMessage(msg.text, msg.sender, msg.time, false));
};

// ----- SEND MESSAGE -----
function sendMessage(){
  const message = userInput.value.trim();
  if(!message) return;

  const time = getTime();
  addMessage(message, "user", time);
  saveMessage(message, "user", time);
  userInput.value = "";

  showTyping();
  setTimeout(()=>{
    hideTyping();
    const reply = getBotReply(message);
    const replyTime = getTime();
    addMessage(reply, "bot", replyTime);
    speak(reply);
    saveMessage(reply, "bot", replyTime);
  }, 1200);
}

// ----- ADD MESSAGE -----
function addMessage(text, sender, time, scroll=true){
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", `${sender}-message`);

  const avatar = document.createElement("img");
  avatar.classList.add("avatar");
  avatar.src = sender==="bot"
    ? "https://cdn-icons-png.flaticon.com/512/4712/4712100.png" // bot avatar
    : "https://cdn-icons-png.flaticon.com/512/194/194938.png"; // user avatar (female)

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = `${text}<div class="timestamp">${time}</div>`;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatBox.appendChild(msgDiv);
  if(scroll) chatBox.scrollTop = chatBox.scrollHeight;
}

// ----- SAVE CHAT -----
function saveMessage(text, sender, time){
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({text,sender,time});
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

// ----- TYPING ANIMATION -----
function showTyping(){
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message","bot-message","typing");
  typingDiv.id = "typing";
  typingDiv.innerHTML = `
    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png" class="avatar" />
    <div class="bubble">
      <div class="typing-dots"><span>.</span><span>.</span><span>.</span></div>
    </div>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function hideTyping(){ const t = document.getElementById("typing"); if(t)t.remove(); }

// ----- THEME -----
function toggleTheme(){
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")?"☀️":"🌙";
}

// ----- TIME -----
function getTime(){ return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }

// ----- BOT LOGIC (SMART FALLBACK, PLAIN TEXT) -----
function getBotReply(input){
  input = input.toLowerCase();
  if(input.includes("hi") || input.includes("hello")) return "Hello! How are you?";
  if(input.includes("how are you")) return "I'm doing great! What about you?";
  if(input.includes("your name")) return "I'm your friendly chatbot";
  if(input.includes("bye")) return "Goodbye! Talk to you soon";
  if(input.includes("joke")) return "Why do programmers prefer dark mode? Because light attracts bugs.";
  if(input.includes("motivate")) return "Keep going! Every step counts!";
  if(input.includes("clear")) return clearChat();

  // Smart fallback (plain text)
  const fallback = [
    "Interesting. Tell me more.",
    "Hmm, that’s something to think about.",
    "Could you explain that a bit more?",
    "I love chatting with you.",
    "Wow, that's cool.",
    "I see… tell me more."
  ];
  return fallback[Math.floor(Math.random()*fallback.length)];
}

// ----- CLEAR CHAT -----
function clearChat(){
  localStorage.removeItem("chatHistory");
  chatBox.innerHTML = `
    <div class="message bot-message fade-in">
      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png" class="avatar" />
      <div class="bubble">Chat cleared! Let's start fresh.<div class="timestamp">${getTime()}</div></div>
    </div>`;
  return "Chat history cleared!";
}
