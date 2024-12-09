const chatController = {
    handleMessage: (io, socket) => {
        socket.on('message', (data) => {
            io.to(data.room).emit('message', {
                user: data.user,
                message: data.message,
                timestamp: new Date()
            });
        });
    },

    joinRoom: (io, socket) => {
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            socket.to(roomId).emit('user-joined', socket.id);
        });
    }
};

module.exports = chatController;
