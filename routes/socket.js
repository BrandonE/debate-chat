var IO = null;

var connect = function (socket) {
	IO.emit('user connected');
}

var disconnect = function () {
	IO.emit('user disconnected');
}

var chat_message = function (msg) {
	IO.emit('chat message', msg);
}

exports.attach = function(io) {
	IO = io;

	io.on('connection', function (socket) {
		connect(socket);
		socket.on('disconnect', disconnect);
		socket.on('chat message', chat_message);
	});
};