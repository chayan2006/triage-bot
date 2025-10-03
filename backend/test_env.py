# <!doctype html>
# <html lang="en">
# <head>
#   <meta charset="utf-8" />
#   <meta name="viewport" content="width=device-width, initial-scale=1" />
#   <title>Healthcare Triage Bot</title>
#   <script src="https://cdn.tailwindcss.com"></script>
#   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

#   <style>
#     body { 
#       font-family: Inter, system-ui, sans-serif; 
#       transition: background 0.4s, color 0.4s; 
#       animation: fadeIn 0.6s ease; 
#     }

#     @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

#     /* Chat Box */
#     #chatBox { 
#       max-height: 500px; 
#       overflow-y: auto; 
#       transition: background 0.4s; 
#     }

#     /* User Message */
#     .msg-user {
#       background: linear-gradient(135deg, #10b981, #059669);
#       color: white;
#       padding: 10px 14px;
#       border-radius: 18px 18px 0 18px;
#       margin: 6px;
#       max-width: 70%;
#       align-self: flex-end;
#       box-shadow: 0 2px 6px rgba(0,0,0,.15);
#       animation: slideRight 0.4s ease, pop 0.3s ease;
#     }

#     /* Bot Message */
#     .msg-bot {
#       background: #f1f5f9;
#       color: #111827;
#       padding: 10px 14px;
#       border-radius: 18px 18px 18px 0;
#       margin: 6px;
#       max-width: 70%;
#       align-self: flex-start;
#       box-shadow: 0 2px 6px rgba(0,0,0,.1);
#       animation: slideLeft 0.4s ease, pop 0.3s ease;
#     }

#     /* Slide Animations */
#     @keyframes slideRight {
#       from { opacity:0; transform: translateX(40px); }
#       to { opacity:1; transform: translateX(0); }
#     }
#     @keyframes slideLeft {
#       from { opacity:0; transform: translateX(-40px); }
#       to { opacity:1; transform: translateX(0); }
#     }
#     @keyframes pop {
#       from { transform: scale(0.95); }
#       to { transform: scale(1); }
#     }

#     /* Timestamp */
#     .timestamp {
#       font-size: 0.7rem;
#       color: #6b7280;
#       margin-top: 2px;
#       opacity: 0;
#       animation: fadeIn 1s ease forwards;
#       animation-delay: 0.5s;
#     }

#     /* Typing Animation */
#     .typing { 
#       display: inline-block; 
#       width: 6px; 
#       height: 6px; 
#       background: #6b7280; 
#       border-radius: 50%; 
#       margin-right: 3px; 
#       animation: blink 1.4s infinite both; 
#     }
#     .typing:nth-child(2) { animation-delay: 0.2s; }
#     .typing:nth-child(3) { animation-delay: 0.4s; }
#     @keyframes blink { 0%{opacity:.2;} 20%{opacity:1;} 100%{opacity:.2;} }

#     /* Glow when bot is typing */
#     #chatBox.typing-active {
#       border: 2px solid #10b981;
#       box-shadow: 0 0 15px rgba(16,185,129,0.5);
#       transition: box-shadow 0.3s;
#     }

#     /* Dark Mode */
#     body.dark { 
#       background: #0f172a; 
#       color: #f9fafb; 
#       background: linear-gradient(-45deg, #0f172a, #1e293b, #111827, #0f172a);
#       background-size: 400% 400%;
#       animation: gradientMove 15s ease infinite;
#     }

#     @keyframes gradientMove {
#       0% { background-position: 0% 50%; }
#       50% { background-position: 100% 50%; }
#       100% { background-position: 0% 50%; }
#     }

#     body.dark .msg-bot { background: #334155; color: #f9fafb; }
#     body.dark .timestamp { color: #cbd5e1; }
#     body.dark section { background: #1e293b !important; border-color: #334155 !important; }
#     body.dark input { background: #334155; color: #f9fafb; border-color: #475569; }

#     /* Buttons */
#     button { transition: transform 0.2s, background 0.3s; position: relative; overflow: hidden; }
#     button:hover { transform: scale(1.05); }
#     button:active::after {
#       content: "";
#       position: absolute;
#       width: 200%; height: 200%;
#       top: 50%; left: 50%;
#       transform: translate(-50%, -50%) scale(0);
#       background: rgba(255,255,255,0.3);
#       border-radius: 50%;
#       animation: ripple 0.6s ease-out;
#       pointer-events: none;
#     }
#     @keyframes ripple { to { transform: translate(-50%, -50%) scale(1); opacity: 0; } }

#     /* Dark Toggle Button */
#     #darkToggle { transition: transform 0.5s ease; }
#     body.dark #darkToggle { transform: rotate(180deg); }
#   </style>
# </head>
# <body class="bg-slate-100 text-slate-900 min-h-screen flex flex-col transition-colors duration-500">
#   <!-- Header -->
#   <header class="bg-white shadow-md py-4 px-6 flex items-center justify-between transition-colors duration-500">
#     <div class="flex items-center gap-3">
#       <div class="h-10 w-10 rounded-xl bg-emerald-500 text-white grid place-items-center text-xl">🩺</div>
#       <div>
#         <h1 class="text-xl font-bold">Healthcare Triage Bot</h1>
#         <p class="text-slate-500 text-sm">Type your symptoms. Get guidance. Hear the response.</p>
#       </div>
#     </div>
#     <button id="darkToggle" class="px-3 py-2 rounded-lg border text-sm transition-colors duration-500">🌙 Dark</button>
#   </header>

#   <!-- Chat Section -->
#   <main class="flex-1 flex flex-col items-center">
#     <section class="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl mt-6 flex flex-col flex-1 transition-colors duration-500">
#       <h2 class="text-lg font-semibold p-4 border-b">Chat with Bot 💬</h2>
#       <div id="chatBox" class="flex-1 bg-slate-50 p-4 overflow-y-auto"></div>
#       <div class="flex gap-2 p-4 border-t">
#         <input id="chatInput" type="text" placeholder="Type your symptoms..." 
#           class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-500">
#         <button id="sendBtn" 
#           class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500">
#           Send
#         </button>
#       </div>
#     </section>

#     <!-- Player -->
#     <section class="mt-6 bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl p-4 transition-colors duration-500">
#       <div class="flex items-center justify-between">
#         <div>
#           <h3 class="font-semibold">Bot Reply (Audio)</h3>
#           <p class="text-sm text-slate-500">Auto-plays after advice is ready.</p>
#         </div>
#         <div class="flex items-center gap-3">
#           <button id="replayBtn" class="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Replay 🔁</button>
#           <audio id="player" controls class="h-10"></audio>
#         </div>
#       </div>
#     </section>
#   </main>

#   <script>
#   const API_BASE = "http://127.0.0.1:8000";
#   const LANGUAGE = "en";

#   const $ = s => document.querySelector(s);
#   const player = $('#player');
#   const chatBox = $('#chatBox'), chatInput = $('#chatInput'), sendBtn = $('#sendBtn');
#   const darkBtn=$('#darkToggle');

#   // Append messages with timestamp
#   function addMessage(text, sender="bot") {
#     const wrapper=document.createElement("div");
#     const div=document.createElement("div");
#     div.className = sender==="user" ? "msg-user" : "msg-bot";
#     div.textContent = text;

#     const ts=document.createElement("div");
#     ts.className="timestamp";
#     ts.textContent=new Date().toLocaleTimeString();

#     wrapper.appendChild(div);
#     wrapper.appendChild(ts);
#     chatBox.appendChild(wrapper);
#     chatBox.scrollTop = chatBox.scrollHeight;
#   }

#   // Typing indicator
#   function showTyping() {
#     chatBox.classList.add("typing-active");
#     const wrap=document.createElement("div");
#     wrap.id="typing";
#     wrap.className="msg-bot flex gap-1 items-center";
#     wrap.innerHTML='<span class="typing"></span><span class="typing"></span><span class="typing"></span>';
#     chatBox.appendChild(wrap);
#     chatBox.scrollTop=chatBox.scrollHeight;
#   }
#   function removeTyping() {
#     chatBox.classList.remove("typing-active");
#     const el=$("#typing"); if(el) el.remove();
#   }

#   // Chat send handler
#   sendBtn.addEventListener("click", async ()=>{
#     const msg = chatInput.value.trim();
#     if(!msg) return;
#     addMessage(msg,"user");
#     chatInput.value="";
#     showTyping();

#     // Call triage endpoint
#     const res = await fetch(`${API_BASE}/triage/`, {
#       method:"POST", headers:{"Content-Type":"application/json"},
#       body: JSON.stringify({symptoms: msg, language: LANGUAGE})
#     });
#     const data = await res.json();
#     removeTyping();
#     const advice = data.triage || data.result || "No advice.";
#     addMessage(advice,"bot");

#     // Call TTS
#     const ttsRes=await fetch(`${API_BASE}/tts/`, {
#       method:"POST", headers:{"Content-Type":"application/json"},
#       body: JSON.stringify({text:advice})
#     });
#     if(ttsRes.ok){
#       const audioBlob=await ttsRes.blob();
#       player.src=URL.createObjectURL(audioBlob);
#       player.play().catch(()=>{});
#     }
#   });

#   // Replay button
#   $('#replayBtn').addEventListener('click', ()=>{ if(player.src) player.play(); });

#   // Dark mode toggle with animation
#   darkBtn.addEventListener("click",()=>{
#     document.body.classList.toggle("dark");
#     darkBtn.textContent = document.body.classList.contains("dark") ? "☀️ Light" : "🌙 Dark";
#   });
#   </script>
# </body>
# </html>
