import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { IoSend } from 'react-icons/io5';
import { motion } from 'framer-motion';

const ChatComponent = (props) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unread, setUnread] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showUsersList, setShowUsersList] = useState(true);
  const messagesEndRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && selectedUser) {
        setShowUsersList(false);
      } else {
        setShowUsersList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedUser]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/user/${props.email}`);
        setUnread(response.data[0].unread);

        const usersResponse = await axios.get('http://localhost:5000/api/users');
        setUsers(usersResponse.data.filter(d => d.email !== props.email));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData()

    const intervalId = setInterval(() => {
      if (selectedUser) {
        fetchData();
        axios.get(`http://127.0.0.1:5000/api/messages/${selectedUser.email}/${props.email}`)
          .then(response => setMessages(response.data))
          .catch(error => console.error(error));
      }
    }, 2000);
    window.addEventListener('beforeunload',()=>{axios.put(`http://127.0.0.1:5000/api/unselect/${props.email}`)})

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload',()=>{axios.put(`http://127.0.0.1:5000/api/unselect/${props.email}`)})  
    }
  }, [props.email, selectedUser]);

  const handleUserClick = (user) => {
    axios.put(`http://127.0.0.1:5000/api/selectUser/${props.email}/${user.email}`);
    axios.get(`http://127.0.0.1:5000/api/messages/${user.email}/${props.email}`)
      .then(response => {
        setSelectedUser(user);
        setMessages(response.data);
        if (isMobile) {
          setShowUsersList(false);
        }
      })
      .catch(error => console.error(error));
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      // Don't send empty messages
      return;
    }

    try {
      await axios.post('http://127.0.0.1:5000/api/send', {
        senderUsername: props.email,
        receiverUsername: selectedUser.email,
        senderName: props.name,
        receiverName: selectedUser.name,
        content: newMessage,
      });

      const response = await axios.get(`http://127.0.0.1:5000/api/messages/${selectedUser.email}/${props.email}`);
      setMessages(response.data);
      setNewMessage("");

      const userData = await axios.get(`http://127.0.0.1:5000/api/user/${selectedUser.email}`);
      if (userData.data[0].selectedUser !== props.email) {
        axios.put(`http://127.0.0.1:5000/api/unread/${selectedUser.email}/${props.email}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleUsersList = () => {
    if (isMobile) {
      setShowUsersList(!showUsersList);
    }
  };

  return (
    <div className="chat-container">
      {(showUsersList || !selectedUser) && (
        <motion.div 
          className="users-list"
          initial={{ x: isMobile ? -300 : 0 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Contacts</h3>
          <ul>
            {users.map((user) => (
              <motion.li
                key={user._id}
                className={user._id === (selectedUser?._id) ? 'active' : ''}
                onClick={() => handleUserClick(user)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={user.profilePic || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'} 
                  alt={user.name} 
                />
                <span>{user.name}</span>
                <p>
                  <strong>{unread === undefined ? '' : unread.map((c) => {
                    if (c.email === user.email && c.count > 0) {
                      return `${c.count}`;
                    } else {
                      return '';
                    }
                  })}</strong>
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
      
      <div className="chat-messages">
        {selectedUser ? (
          <>
            <div className="messages-header">
              {isMobile && (
                <button 
                  style={{ 
                    marginRight: '15px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white',
                    width: 'auto',
                    height: 'auto',
                    padding: '5px'
                  }}
                  onClick={toggleUsersList}
                >
                  &#9776;
                </button>
              )}
              <img 
                src={selectedUser.profilePic || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'} 
                alt={selectedUser.name} 
              />
              <h3 id="user-name">{selectedUser.name}</h3>
            </div>
            <div className="messages-list" id="message">
              {messages.map((message) => (
                <motion.div
                  key={message._id}
                  className={message.senderUsername === props.email ? 'sent' : 'received'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <strong>{message.senderName}</strong>
                  <span>{message.content}</span>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-container">
              <input
                id="message-box"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
              />
              <motion.button 
                id="send" 
                onClick={sendMessage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IoSend style={{ marginRight: '5px' }} /> Send
              </motion.button>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            textAlign: 'center',
            padding: '20px'
          }}>
            <h2>Welcome to talkMarket</h2>
            <p style={{ marginTop: '20px', opacity: 0.7 }}>
              Select a contact to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;