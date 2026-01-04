import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  // These variables replace your document.getElementById calls
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState("Status: Ready to help");
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    { text: "Hello! Choose your language and click the phone icon to ask me anything about Diabetes.", isUser: false }
  ]);

  const chatBoxRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCall = async () => {
    setIsCalling(true);
    setStatus("Listening...");

    try {
      const response = await axios.post('http://127.0.0.1:5000/process_voice', { 
        lang: language 
      });

      if (response.data.user_text) {
        setMessages(prev => [
          ...prev, 
          { text: response.data.user_text, isUser: true },
          { text: response.data.assistant_response, isUser: false }
        ]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { text: "Error: Could not hear you clearly.", isUser: false }]);
    } finally {
      setIsCalling(false);
      setStatus("Status: Ready");
    }
  };

  return (
    <div className="bg-white w-[1000px] h-[700px] rounded-3xl shadow-2xl flex overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 p-8 flex flex-col items-center justify-between text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Diabetes Health Assistant</h2>
          <div className="text-blue-200 text-sm">{status}</div>
        </div>

        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-blue-500 flex items-center justify-center shadow-inner relative z-10">
            <i className="fas fa-hand-holding-medical text-6xl text-white"></i>
          </div>
          {/* Pulse ring shows only when calling */}
          <div className={`${isCalling ? '' : 'hidden'} absolute top-0 left-0 w-48 h-48 rounded-full bg-blue-400 pulse-ring`}></div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-blue-700 border-none rounded-lg px-4 py-2 text-white focus:ring-2 ring-white outline-none"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
          
          <button 
            onClick={handleCall}
            className={`w-20 h-20 ${isCalling ? 'bg-red-500' : 'bg-green-500'} rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all transform active:scale-95`}
          >
            <i className="fas fa-phone text-3xl text-white"></i>
          </button>
          <p className="text-sm text-blue-100">Click the phone to start speaking</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex flex-col bg-slate-50">
        <div className="p-6 border-b bg-white text-black">
          <h3 className="font-semibold text-slate-700">Conversation History</h3>
        </div>
        
        <div ref={chatBoxRef} className="chat-container flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`${
                msg.isUser 
                ? "bg-blue-600 text-white self-end rounded-tr-none" 
                : "bg-white text-slate-800 self-start border border-slate-200 rounded-tl-none"
              } p-3 rounded-2xl max-w-[80%] text-sm shadow-sm`}
            >
              {msg.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;