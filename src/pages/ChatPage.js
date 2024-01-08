import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatComponent = (props) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unread, setUnread] = useState([]);

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

  return (
    <div className="chat-container">
      <div className="users-list">
        <h3>Users</h3>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              className={user._id === (selectedUser?._id) ? 'active' : ''}
              onClick={() => handleUserClick(user)}
            >
              <img src={user.profilePic || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'} alt={user.name} />
              {user.name}<p><strong>{unread === undefined ? '' : unread.map((c) => {
                if (c.email === user.email && c.count > 0) {
                  return `(${c.count} unread messages)`;
                } else {
                  return '';
                }
              })}</strong></p>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-messages">
        <div className="messages-header">
          {selectedUser && (
            <>
              <img src={selectedUser.profilePic || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'} alt={selectedUser.name} />
              <h3 id="user-name">{selectedUser.name}</h3>
            </>
          )}
        </div>
        <div className="messages-list" id="message">
          {messages.map((message) => (
            <div
              key={message._id}
              className={message.senderUsername === props.email ? 'sent' : 'received'}
            >
              <strong>{message.senderName}:</strong> <span>{message.content}</span>
            </div>
          ))}
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
          <button id="send" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
