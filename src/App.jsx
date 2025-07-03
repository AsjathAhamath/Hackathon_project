import { useState, useRef, useEffect } from "react";
import "./App.css";
import geminiService from "./geminiService";

function App() {
  // State declarations
  const [messages, setMessages] = useState([
    { text: "Hello traveler! ✈️", sender: "bot" },
    {
      text: "I'm your AI travel assistant powered by Gemini. I can help with destinations, itineraries, travel tips, and more! Where would you like to go today?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Create travel-focused prompt
      const travelPrompt = `You are a travel expert AI assistant. Respond exclusively about travel-related topics. 
        If the question isn't directly about travel, creatively connect it to travel. 
        Keep responses helpful, engaging, and focused on destinations, trips, or travel experiences.
        User question: ${currentInput}`;

      const botResponse = await geminiService.generateResponse(travelPrompt);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
      setApiKeyError(false);
    } catch (error) {
      console.error("Error:", error);

      if (error.message.includes("API key is not configured")) {
        setApiKeyError(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          text:
            error.message ||
            "Sorry, I'm having trouble answering your travel question. Please try again later.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (!willOpen && !isMinimized) {
      setIsMinimized(true);
      setTimeout(() => setIsMinimized(false), 300);
    }
  };

  // Check API key on component mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("API Key:", apiKey ? "Loaded ✓" : "Missing ✗");

    if (!apiKey) {
      setApiKeyError(true);
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ API key is not configured. Please follow these steps:\n\n1. Create a .env file in your project root\n2. Add: VITE_GEMINI_API_KEY=your_api_key_here\n3. Restart your development server\n4. Get your API key from: https://makersuite.google.com/app/apikey",
          sender: "bot",
        },
      ]);
    } else {
      console.log("✓ API Key is properly configured");
    }
  }, []);

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      {!isOpen && (
        <button
          className="chatbot-launcher"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <span className="chat-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
          </span>
          <span className="notification-badge">1</span>
        </button>
      )}

      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? "minimized" : ""}`}>
          <div className="chatbot-header" onClick={toggleChat}>
            <div className="chatbot-title">
              <span className="bot-avatar" role="img" aria-label="Bot">
                ✈️
              </span>
              <h2>Travel Assistant</h2>
              {apiKeyError && (
                <span
                  className="status-indicator error"
                  title="API Key Missing"
                >
                  ⚠️
                </span>
              )}
              {!apiKeyError && (
                <span className="status-indicator success" title="Connected">
                  ✓
                </span>
              )}
            </div>
            <button
              className="close-btn"
              aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
            >
              {isMinimized ? "↑" : "↓"}
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={`msg-${index}`}
                className={`message ${message.sender} ${
                  index === messages.length - 1 ? "last" : ""
                }`}
              >
                {message.sender === "bot" && (
                  <span className="bot-avatar" role="img" aria-label="Bot">
                    ✈️
                  </span>
                )}
                <div className="message-content">
                  {message.text.split("\n").map((line, lineIndex) => (
                    <div key={lineIndex}>
                      {line}
                      {lineIndex < message.text.split("\n").length - 1 && (
                        <br />
                      )}
                    </div>
                  ))}
                </div>
                {message.sender === "user" && (
                  <span className="user-avatar" role="img" aria-label="User">
                    👤
                  </span>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message bot">
                <span className="bot-avatar" role="img" aria-label="Bot">
                  ✈️
                </span>
                <div className="message-content typing-indicator">
                  <div className="typing-dots">
                    {[...Array(3)].map((_, i) => (
                      <div key={`dot-${i}`} className="dot" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <div className="chatbot-input-area">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  apiKeyError ? "API key required..." : "Ask about travel..."
                }
                aria-label="Type your travel question"
                disabled={isTyping || apiKeyError}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || apiKeyError}
                className="send-btn"
                aria-label="Send message"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
