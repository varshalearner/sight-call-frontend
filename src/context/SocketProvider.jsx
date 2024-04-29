import React, {createContext,useContext,useMemo} from "react";
import {io} from 'socket.io-client'
// baar baar import export ka jnjhat ktm
const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {
    // socket baar baar initialise nh ho islea 
    const socket = useMemo(()=>io('https://sight-call-backend.onrender.com'),[])
    //socket server
    return (<SocketContext.Provider value={socket}>
        {props.children}
    </SocketContext.Provider>)
}
