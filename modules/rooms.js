var chat = require('./chat');

module.exports = function(server){
	var io = require('socket.io').listen(server);

	var room = io.on('connection', function(socket){
		socket.on('join', function(data, callback){
			if( socket.name === undefined && chat.hasUser(data.nickname)  ){
				socket.name = data.nickname;
				io.sockets.emit('list', { users : chat.getUsers() });
				var msg = data.nickname + ' 님이 입장하셨습니다..';
				io.sockets.emit('message', { msg : msg });
				callback();
				//console.log(chat.users);
			}else{
				chat.leave(data.nickname);
				socket.emit('err login');
			}
		});

		socket.on('disconnect', function(){
			//leave event code
			var Socketname = socket.name;
			if( Socketname !== undefined ){
				chat.leave( Socketname );
				socket.broadcast.emit('list', { users : chat.getUsers() });
				socket.broadcast.emit('message', { msg : Socketname + '님이 나가셨습니다..' });
			}
		});
		
		socket.on('chgname', function(data, callback){
			if(!chat.hasUser(data.chgname)) return;
			socket.name = data.chgname; clearInterval(chat.interval); chat.leave(data.nickname); callback();
			var msg = data.nickname + ' 님이 이름을 '+ data.chgname +' 으로 변경했습니다..';
			io.sockets.emit('list', { users : chat.getUsers() });
			io.sockets.emit('message', { msg : msg });
		});

		socket.on('message', function(data){
			var msg = data.nickname+' : '+data.msg;
			io.sockets.emit('message', { msg : msg });
		});

		socket.on('ready', function(data){
			if(!chat.hasUser(data.nickname)){
				socket.disconnect();
				return;
			}
			if(!chat.hasPlayer(data.nickname)){
				chat.addPlayer(data.nickname);
			}
			var players = chat.getPlayers(), cnt = 0, start = 6;
			chat.ready( data.nickname, data.ready );
			//console.log( chat.players );
			io.sockets.emit('readied', { players : players });

			for(var i=0; i<chat.plength() ; i++){
				if(players[i].ready === true){
					++cnt;
				}
			}
			if( chat.plength() === cnt ){
				if( chat.interval ) return;
				chat.interval = setInterval(function(){
					if( start === 2 ){
						io.sockets.emit('disabled');
					}else if( start < 2 ){
						clearInterval(chat.interval);
						io.sockets.emit('start');
						io.sockets.emit('message', { msg : '==== 게임을 시작합니다 ===========' });
						start = 5;
						return;
					}
					io.sockets.emit('message', { msg : --start });
				}, 1000);
			}else{
				clearInterval(chat.interval);
				chat.interval = null;
				start = 5;
			}
		});

		socket.on('move', function(data){
			//console.log(data.nickname+' : '+data.nl);
			socket.broadcast.emit('mover', { nickname : data.nickname, nblock : data.nblock, nl : data.nl });
		});

		socket.on('key_move', function(data){
			//console.log(data.nickname+' : '+data.key);
			socket.broadcast.emit('key_mover', { nickname : data.nickname, key : data.key });
		});

		socket.on('del_b', function(data){
			if(data.cnt > 0){
				//console.log(data.cnt);
				socket.broadcast.emit('del_bed', { nickname : data.nickname, cnt : data.cnt });
			}
		});

		socket.on('append', function(data){
			io.sockets.emit('appended', { nickname : data.nickname, add : data.add, rand : data.rand });
		});
	});
}