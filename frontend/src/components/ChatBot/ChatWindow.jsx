import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import axios from 'axios';
import { API_URL } from '../../config/api';

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis SALEKABOT, votre assistant bancaire. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show notification for 5 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (message, attachments = []) => {
    if (!message.trim() && attachments.length === 0) return;

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Veuillez vous connecter pour utiliser le chatbot.' }]);
      return;
    }

    // Add user message with attachments info
    let messageContent = message;
    if (attachments.length > 0) {
      const attachmentInfo = attachments.map(a => 
        a.type === 'image' ? '[Photo]' : `[Fichier: ${a.name}]`
      ).join(', ');
      messageContent = message ? `${message} (${attachmentInfo})` : attachmentInfo;
    }
    
    setMessages(prev => [...prev, { role: 'user', content: messageContent }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chatbot/message`,
        { message: messageContent, sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
        if (response.data.sessionId && !sessionId) {
          setSessionId(response.data.sessionId);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      if (error.response?.status === 403) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Session expirée. Veuillez vous reconnecter.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsMinimized(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <>
        {/* Notification bubble */}
        {showNotification && (
          <div className="fixed bottom-6 right-20 sm:bottom-8 sm:right-24 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in max-w-xs">
            <p className="text-sm font-medium">Bonjour ! Je suis SALEKABOT, votre assistant bancaire. Cliquez pour discuter !</p>
            <div className="absolute bottom-4 right-[-8px] w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-white border-b-[8px] border-b-transparent"></div>
          </div>
        )}
        
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-blue-600 text-white p-4 sm:p-5 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
          title="Ouvrir le chat"
        >
          <img src="/saleka.png" alt="SALEKA" className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </>
    );
  }

  return (
    <div ref={chatWindowRef} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100%-3rem)] sm:w-96 h-[60vh] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30">
            <img src="/saleka.png" alt="SALEKA" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold">SALEKABOT</h3>
            <p className="text-xs text-blue-100">Assistant bancaire IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Minimiser"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message.content}
                isUser={message.role === 'user'}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </>
      )}
    </div>
  );
};

export default ChatWindow;
