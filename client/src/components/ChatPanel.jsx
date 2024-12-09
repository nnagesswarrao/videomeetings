import React, { useState, useEffect, useRef } from 'react';

const ChatPanel = ({ roomId, userName, socket, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load existing messages
    fetch(`http://localhost:5001/api/chat/${roomId}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Error loading messages:', err));

    // Listen for new messages
    socket.on('chat-message', message => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [roomId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const formData = new FormData();
    formData.append('meetingId', roomId);
    formData.append('sender', userName);
    formData.append('message', newMessage);
    if (file) {
      formData.append('attachments', file);
    }

    try {
      await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        body: formData
      });
      
      setNewMessage('');
      setFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              message.sender === userName ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-end">
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.sender === userName
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.sender}</p>
                <p className="text-sm">{message.message}</p>
                {message.attachments?.map((attachment, i) => (
                  <a
                    key={i}
                    href={`http://localhost:5001/${attachment.filepath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline block mt-1"
                  >
                    {attachment.filename}
                  </a>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <svg
              className="w-6 h-6 text-gray-500 hover:text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>
          {file && (
            <span className="text-sm text-gray-600">{file.name}</span>
          )}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
