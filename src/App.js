import './App.css';
import { Route,Routes } from 'react-router-dom';
import Homepage from './pages/Homepage'
import ChatPage from './pages/ChatPage'
import { useState } from 'react';
function App() {
  const[nameOfUser,setName]=useState("");
  const[emailOfUser,setEmail]=useState("");
  return (
    <div className="App">
      <Routes>
      <Route exact path='/' element={<Homepage nameSet={setName} emailSet={setEmail}/>}></Route>
      <Route exact path='/chats' element={<ChatPage email={emailOfUser} name={nameOfUser}/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
