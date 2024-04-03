import React, { useEffect } from "react";
import { useState, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const socket = useSocket();

  // this is socket : interect with server
  console.log(socket);
  const [name, setname] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();
  const handelSubmitForm = useCallback((e)=>{
    e.preventDefault();
    // ye data jaiga socket server ke pass event match hoga room:join then action according to that
    socket.emit('room:join',{name,room});
    console.log(name,room);
  })
  const handleJoinRoom = useCallback(
    (data) => {
      const { name, room } = data;
      console.log(data);
      navigate(`/room/${room}`);
    },
    []
  );

  useEffect(() => {
    // multiple re render -> multiple
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (

    <div className="bg-gray-800 text-white p-8 h-screen flex flex-col justify-center">
<div class="flex flex-col justify-center items-center">
  <img src="https://static.vecteezy.com/system/resources/previews/002/816/256/large_2x/sc-logo-monogram-letter-initials-design-template-with-gold-3d-texture-free-vector.jpg" class="w-20 h-20 rounded-full object-cover mb-2" alt="" />
    <h1 class="text-3xl font-bold text-center mb-4">SightCall</h1>
    <p class="text-lg text-gray-500 text-center mb-8">See Beyond Distance</p>
</div>

    <form className="flex flex-col w-60 mx-auto" onSubmit={handelSubmitForm}>
      <label htmlFor="name" className="mb-2">Name</label>
      <input
        className="border border-white rounded p-2 bg-gray-700 mb-4 text-white"
        type="text"
        id="name"
        value={name}
        onChange={(e) => setname(e.target.value)}
      />
      <label htmlFor="room" className="mb-2">Room</label>
      <input
        className="border border-white rounded p-2 bg-gray-700 mb-4 text-white"
        type="text"
        id="room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Join
      </button>
    </form>
  </div>
  
  );

};

export default Lobby;
