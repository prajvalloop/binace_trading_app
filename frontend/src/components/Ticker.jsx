import React, { useEffect } from 'react'
import {io} from 'socket.io-client'

const URL='http://videos.devsonline.in:3000'

const Ticker = () => {
    useEffect(()=>{
        const socket=io(URL)
        socket.on("cryptoData",(data)=>{
            console.log(data)
        })
    },[])
    return (
    <div>
        Ticker app
    </div>
  )
}

export default Ticker;
