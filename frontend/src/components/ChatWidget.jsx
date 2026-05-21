import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import io from 'socket.io-client';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const socket = io('http://localhost:5001');

const ChatWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! 👋 Welcome to FoodieBot! I can help you browse our menu, place orders, and track deliveries.\n\nTry asking me things like:\n• "Show menu"\n• "I want burgers"\n• "Suggest something"\n• "Track my order"',
      type: 'text',
      data: {},
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check if browser supports Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isSpeechSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  useEffect(() => {
    socket.on('botMessage', (msg) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: msg.text,
          type: msg.type || 'text',
          data: msg.data || {},
        },
      ]);
    });

    return () => {
      socket.off('botMessage');
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();

    setMessages((prev) => [...prev, { sender: 'user', text, type: 'text', data: {} }]);
    setIsTyping(true);
    socket.emit('chatMessage', { text, sessionId, userId: user?._id || null });
    setInput('');
  };

  const sendQuickAction = (text) => {
    setMessages((prev) => [...prev, { sender: 'user', text, type: 'text', data: {} }]);
    setIsTyping(true);
    socket.emit('chatMessage', { text, sessionId, userId: user?._id || null });
  };

  const renderProducts = (products) => {
    if (!products || products.length === 0) return null;
    return (
      <div className="chat-product-list">
        {products.map((p, i) => (
          <div key={p._id || i} className="chat-product-item">
            <img
              src={p.imageUrl}
              alt={p.name}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
              }}
            />
            <div className="chat-product-item-info">
              <h4>{p.name}</h4>
              <p>{p.description?.substring(0, 40)}...</p>
            </div>
            <span className="price">₹{p.price}</span>
            <button
              className="chat-add-btn"
              onClick={() => sendQuickAction(`add ${p.name} to cart`)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderMenuCategories = (data) => {
    if (!data.categories) return null;
    const emojis = {
      burger: '🍔', pizza: '🍕', biryani: '🍚', pasta: '🍝', momos: '🥟',
      fries: '🍟', sandwich: '🥪', wrap: '🌯', noodles: '🍜', drink: '🥤', dessert: '🍫',
    };
    return (
      <div className="quick-actions" style={{ marginTop: '8px' }}>
        {Object.keys(data.categories).map((cat) => (
          <button
            key={cat}
            className="quick-action-btn"
            onClick={() => sendQuickAction(`show me ${cat}`)}
          >
            {emojis[cat] || '🍴'} {cat}
          </button>
        ))}
      </div>
    );
  };

  const renderMessage = (msg, idx) => {
    if (msg.sender === 'user') {
      return (
        <div key={idx} className="message-wrapper user">
          <div className="message user">{msg.text}</div>
        </div>
      );
    }

    return (
      <div key={idx} className="message-wrapper bot">
        <div style={{ maxWidth: '88%' }}>
          <div className="message bot">{msg.text}</div>

          {/* Render product cards for product-related responses */}
          {msg.type === 'products' && msg.data?.products && renderProducts(msg.data.products)}

          {/* Render category buttons for full menu */}
          {msg.type === 'menu' && msg.data && renderMenuCategories(msg.data)}

          {/* After greeting, show quick actions */}
          {idx === 0 && (
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => sendQuickAction('Show menu')}>🍽️ Menu</button>
              <button className="quick-action-btn" onClick={() => sendQuickAction('Suggest something')}>⭐ Recommend</button>
              <button className="quick-action-btn" onClick={() => sendQuickAction('View cart')}>🛒 Cart</button>
              <button className="quick-action-btn" onClick={() => sendQuickAction('Help')}>❓ Help</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>🤖 FoodieBot</h3>
              <span>AI Food Ordering Assistant</span>
            </div>
            <button className="icon-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => renderMessage(msg, idx))}

            {isTyping && (
              <div className="message-wrapper bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask me anything about food...'}
              className={`chat-input${isListening ? ' listening' : ''}`}
            />
            {isSpeechSupported && (
              <button
                type="button"
                className={`mic-btn${isListening ? ' active' : ''}`}
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button type="submit" className="send-btn">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="chat-fab" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
