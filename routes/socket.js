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

var chat_typing = function () {
	IO.emit('chat typing');
}

var chat_not_typing = function () {
	IO.emit('chat not typing');
}

exports.attach = function(io) {
	IO = io;

	io.on('connection', function (socket) {
		connect(socket);
		socket.on('disconnect', disconnect);
		socket.on('chat message', chat_message);
		socket.on('chat typing', chat_typing);
		socket.on('chat not typing', chat_not_typing);
	});
};