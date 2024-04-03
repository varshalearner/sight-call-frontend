import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useNavigate } from "react-router-dom";

const Room = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isMuted, setIsMuted] = useState(true);

  const handleDisconnect = () => {
    try {
      navigate("/");
      
      window.location.reload();
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  };
  
  const handleUserJoined = useCallback(({ email, id }) => {
    try {
      setRemoteSocketId(id);
      console.log(`Email ${email} joined room`);
    } catch (error) {
      console.error("Error handling user joined:", error);
    }
  }, []);

  const handelCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      setMyStream(stream);
      console.log(stream);
    } catch (error) {
      console.error("Error calling user:", error);
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      try {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
        console.log("incoming call", from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    try {
      for (const track of myStream.getTracks()) {
        try {
          peer.peer.addTrack(track, myStream);
        } catch (error) {
          console.error("Error sending streams:", error);
        }
      }
    } catch (error) {
      console.error("Error sending streams:", error);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ ans }) => {
      try {
        peer.setLocalDescription(ans);
        console.log("call accepted");
        sendStreams();
      } catch (error) {
        console.error("Error handling call accepted:", error);
      }
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    try {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    } catch (error) {
      console.error("Error handling negotiation needed:", error);
    }
  }, [remoteSocketId, socket]);

  useEffect(() => {
    try {
      peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
      return () => {
        peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
      };
    } catch (error) {
      console.error("Error setting up negotiation listener:", error);
    }
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      try {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
      } catch (error) {
        console.error("Error handling incoming negotiation:", error);
      }
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    try {
      await peer.setLocalDescription(ans);
    } catch (error) {
      console.error("Error handling final negotiation:", error);
    }
  }, []);

  useEffect(() => {
    try {
      peer.peer.addEventListener("track", async (event) => {
        const remoteStream = event.streams;
        console.log("GOT TRACKS!!");
        setRemoteStream(remoteStream[0]);
      });
    } catch (error) {
      console.error("Error setting up track listener:", error);
    }
  });

  useEffect(() => {
    try {
      socket.on("user:joined", handleUserJoined);
      socket.on("incomming:call", handleIncomingCall);
      socket.on("call:accepted", handleCallAccepted);
      socket.on("peer:nego:needed", handleNegoNeedIncomming);
      socket.on("peer:nego:final", handleNegoNeedFinal);
      return () => {
        socket.off("user:joined", handleUserJoined);
        socket.off("incomming:call", handleIncomingCall);
        socket.off("call:accepted", handleCallAccepted);
        socket.off("peer:nego:needed", handleNegoNeedIncomming);
        socket.off("peer:nego:final", handleNegoNeedFinal);
      };
    } catch (error) {
      console.error("Error setting up socket listeners:", error);
    }
  }, [
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeeded,
    handleNegoNeedIncomming,
    socket,
  ]);

  const toggleMute = () => {
    try {
      if (myStream) {
        const audioTracks = myStream.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col">
   <div class="flex  justify-center items-center gap-4 justify-center mb-4 pt-10">
  <img src="https://static.vecteezy.com/system/resources/previews/002/816/256/large_2x/sc-logo-monogram-letter-initials-design-template-with-gold-3d-texture-free-vector.jpg" class="w-10 h-10 mt-3 mr-2 rounded-full object-cover" alt="" />
    <h1 class="text-3xl font-bold text-center">SightCall</h1>
    <p class="text-lg text-gray-500 text-center">See Beyond Distance</p>
</div>

    <h1 className=" mb-6 text-center text-gray-400 ">
      {remoteSocketId ? "You are connected to a Call" : "No one in the Room"}
    </h1>
    <div className="flex flex-col sm:flex-row justify-center mb-8">
      {myStream && (
        <button
          onClick={sendStreams}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 sm:mr-4 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Your Video
        </button>
      )}
      {remoteSocketId && (
        <button
          onClick={handelCallUser}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 sm:mr-4 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Join the Call
        </button>
      )}
      {remoteSocketId && (<button
        onClick={toggleMute}
        className={`${
          isMuted ? "bg-red-500" : "bg-gray-500"
        } hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 sm:mr-4 transition duration-300 ease-in-out transform hover:scale-105`}
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>)}
      {
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Disconnect
        </button>
      }
    </div>
  
    <div className="flex flex-1 justify-center">
      {myStream && (
        <div className="w-full sm:w-1/2 lg:w-2/5 xl:w-1/3 mr-4 mb-4 sm:mb-0">
          <ReactPlayer
            playing
            muted={isMuted}
            url={myStream}
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      {remoteStream && (
        <div className="w-full sm:w-1/2 lg:w-2/5 xl:w-1/3">
          <ReactPlayer
            playing
            muted={isMuted}
            url={remoteStream}
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  </div>
  
  );
};

export default Room;
