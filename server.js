const path = require('path');
const http = require('https');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const fs = require('fs');
const moment = require('moment');
var favicon = require('serve-favicon');
const https_options = {
    key: fs.readFileSync("./private.key"),
    cert: fs.readFileSync("./certificate.crt")
};
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(https_options, app);
/*http.createServer(https_options, function (req, res) {


}).listen(8443);*/
const io = socketio(server, {
    secure: true,
    reconnection: true, // whether to reconnect automatically
    reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
    reconnectionDelay: 1000, // how long to initially wait before attempting a new reconnection
    reconnectionDelayMax: 5000, // maximum amount of time to wait between reconnection attempts. Each attempt increases the reconnection delay by 2x along with a randomization factor
    randomizationFactor: 0.5
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Sinaps Ulak';

// Run when client connects

io.on('connection', socket => {
    socket.on('joinRoom', ({
        username,
        room
    }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Welcome current user
        //socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName, `${user.username} konuşmaya katıldı.`)
            );
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const tarih = new Date();
        const ay=tarih.getMonth()+1;
        const user = getCurrentUser(socket.id);
        if (user != null && user != undefined) {
            io.to(user.room).emit('message', formatMessage(user.username, msg));
            io.sockets.emit('show_notification', {
                title: user.username,
                message: msg,
                icon: null,
            });
        }
        if (user != undefined) {
            fs.appendFile('log/log_file_' + user.room + "-" + tarih.getDate() + "-" + ay + "-" + tarih.getFullYear() + '.txt', moment().format("HH:mm:ss") + '-' + user.username + ':' + msg + '\n', function(err) {
                if (err) return console.log(err);
                console.log('Log Kayıt Edildi.');
            });
        }
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} konuşmadan çıktı.`)
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
    //socket.emit('reconnect_attempt');
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//Notification Geri Dönüş Boktası