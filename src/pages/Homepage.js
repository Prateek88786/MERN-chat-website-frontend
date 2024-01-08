import React from 'react'
import './HomePage.css'
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Homepage = (props) => {
  const navigate=useNavigate();
  const[nameOfUser,setName]=useState();
  const[email,setEmail]=useState();
  const[password,setPassword]=useState();
  const[Pic,setPic]=useState();
  const n=(e)=>{
    setName(e.target.value)
  }
  const e=(e)=>{
    setEmail(e.target.value)
  }
  const p=(e)=>{
    setPic(e.target.value)
  }
  const pass=(e)=>{
    setPassword(e.target.value)
  }
  const login=async(e)=>{
    e.preventDefault()
    let data=await axios.get(`http://127.0.0.1:5000/api/login?email=${email}&password=${password}`)
    data=data.data
    console.log(data)
    let name=data[0].name
    console.log(name)
    if(name){
      props.nameSet(name)
      props.emailSet(email)
      navigate('/chats')
    }

  }
  const signup=async(e)=>{
    e.preventDefault()
    await axios.post('http://127.0.0.1:5000/api/signup',{
      name:nameOfUser,
      email:email,
      password:password,
      profilePic:Pic
    })
    props.nameSet(nameOfUser)
    props.emailSet(email)
    navigate('/chats')
    
  }

  return (
    <div className='wrap'>
      <h1 id="site-name">talkMarket.com</h1>
    <div className="main">  	
		<input type="checkbox" id="chk" aria-hidden="true"/>

			<div className="signup">
				<form>
					<label htmlFor="chk" aria-hidden="true">Sign up</label>
					<input type="text" name="name" placeholder="Name" required onChange={n}/>
					<input type="email" name="email" placeholder="Email" required onChange={e}/>
					<input type="password" name="password" placeholder="Password" required onChange={pass}/>
					<input type="file" name="pic" placeholder="Profile Picture" onChange={p}/>
					<button id="btn" onClick={signup}>Sign up</button>
				</form>
			</div>

			<div className="login">
				<form>
					<label htmlFor="chk" aria-hidden="true">Login</label>
					<input type="email" name="email" placeholder="Email" required="" onChange={e}/>
					<input type="password" name="pswd" placeholder="Password" required="" onChange={pass}/>
					<button id="btn" onClick={login}>Login</button>
				</form>
			</div>
	</div>
  </div>
  )
}

export default Homepage