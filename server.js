const express= require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      headers :  { 'Access-Control-Allow-Origin': true },
    },
})

const { v4 : uuidV4 } = require('uuid')
const cors = require('cors')
// import indexhtml from './public/room.hml'
// const indexhtml= './public/room.html'

app.set("view engine","ejs")
app.use(express.static('public'))
app.use(cors())
app.use(express.json());

app.get('/',(req,res)=>{
    // res.redirect(`/${uuidV4()}`)
    res.json(uuidV4())
})

app.get('/:room',(req,res)=>{
    res.status(200).json(1);
    // res.render('room',{roomId: req.params.room})
})

io.on('connection', socket =>{
    socket.on('join-room', (roomId, userId)=>{
        console.log(roomId, " " ,userId)
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected',userId)
        socket.on('disconnect',()=>{
            socket.broadcast.to(roomId).emit('user-disconnected',userId);
        })
    })
})

server.listen(4000)
