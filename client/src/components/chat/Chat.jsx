import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Chat({chats}) {
  console.log("chatssss",chats);
 const [chat,setChat] = useState(null);
 const {currentUser} = useContext(AuthContext);
 const {socket} = useContext(SocketContext);

 const messageEndRef = useRef();
 useEffect(()=>{
  messageEndRef.current?.scrollIntoView({behavior:"smooth"})
 },[chat])
 
 const handleOpenChat = async(id,receiver)=>{
  try {
    const res = await apiRequest("/chats/" + id);
    setChat({...res.data,receiver})
  } catch (error) {
    console.log(error);
  }
 }

 const handleSubmit = async(e)=>{
  e.preventDefault();
  const formData = new FormData(e.target);
  const text = formData.get("text");
  
  if(!text) return ;
  try {
    const res = await apiRequest.post("/message/" + chat.id,{text});
    setChat(prev=>({...prev,messages:[...prev.messages,res.data]}));
    e.target.reset();
    socket.emit("sendMessage",{
      receiverId : chat.receiver.id,
      data: res.data
    });

  } catch (error) {
    console.log(error);
    
  }
 }

 
 useEffect(()=>{

  const read = async ()=>{
    try {
       await apiRequest.put("/chats/read/"+chat.id);
    } catch (error) {
      console.log(error);
    }
  }

  if(socket && chat){
    socket.on("getMessage",(data)=>{
      if(chat.id === data.chatId){
        setChat((prev)=>({...prev,messages:[...prev.messages,data]}));
        read();
      }
    })
  }
 })
 
 return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c)=>(
          <div className="message" key={c.id}
          style={{
            backgroundColor: c.seenBy.includes(currentUser.userInfo.id) || chat?.id === c.id
            ? "white" :"#fecd514e"
          }}
          onClick={()=>handleOpenChat(c.id,c.receiver)}
          >
          <img
            src={c.receiver.avatar || "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
            alt=""
          />
          <span>{c.receiver.username}</span>
          <p>{c.lastMessage}</p>
        </div>
        ))
      }
        
      
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img
                src={chat.receiver.avatar || "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                alt=""
              />
              {chat.receiver.username}
            </div>
            <span className="close" onClick={()=>setChat(null)}>X</span>
          </div>
          <div className="center">
            {chat.messages.map((message)=>(
              <div className="chatMessage"
              style={{
                alignSelf: message.userId === currentUser.userInfo.id ? "flex-end":"flex-start",
                textAlign: message.userId === currentUser.userInfo.id ? "right":"left"
              }
              }
              key={message.id}>
              <p>{message.text}</p>
              <span>{format(message.createdAt)}</span>
            </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;