<span>welcome : <span class='uname'><%=nickname%></span>&nbsp;&nbsp;&nbsp;<input type="button" id="chgname" value="change name" />&nbsp;:&nbsp;<input type="text" id="nick" placeholder="name" /></span>

<div id="multi_tetris">
	<div id="other">
		<div class="player1"></div>
		<div class="player2"></div>
		<div class="player3"></div>
		<div class="player4"></div>
	</div>
	<div id="<%=nickname%>" class="player0">
		<div id="ready">
			<input class='btn1' type="button" value="ready?" />
			<input class='btn2' type="button" value="no ready" />
		</div>
	</div>
	<div id="chatting">
		<div class='chat'></div>
		<div class='users'>
			<ul class='attendants'>
			</ul>
		</div>
		<form>
			<textarea class="msg_box"></textarea>
			<input type="button" class="msg_sub" value="submit" />
		</form>
	</div>
</div>
<script>
	// $(document).ready(function(){
	// 	var players = [], interval;
	// 	//var rnColor = '#'+Math.floor(Math.random()*16777215).toString(16);
	//
	// 	//192.168.0.27
	// 	var socket = io.connect('http://124.197.188.58:3000');
	// 	if(socket) players[0] = new tetris($('.uname').text() , 10, 20, 20, socket );
	//
	// 	var showMessage  = function(msg){
	// 		$('.chat').append($('<p>').attr('class', 'msg').text(msg));
	// 		$('.chat').scrollTop($('.chat').prop('scrollHeight'));
	// 	}
	//
	// 	$('#nick').focus(function(e){
	// 		$(this).animate({
	// 			width : "130px"
	// 		}, 400);
	// 		$(this).blur(function(e){
	// 			$(this).animate({
	// 				width : "40px"
	// 			}, 400);
	// 		});
	// 	});
	//
	// 	/* socket  */
	//
	// 	socket.on('connect', function(){
	// 		var user = $('.uname').text();
	// 		socket.emit('join', {nickname : user}, function(){
	// 			socket.emit('ready', {nickname : user, ready : false});
	// 		});
	// 		btn_do();
	// 	});
	//
	// 	socket.on('err login', function(){
	// 		location.replace('/');
	// 	});
	//
	// 	socket.on('list', function(data){
	// 		$('.attendants>li').remove();
	// 		var cnt = 1, user = $('.uname').text();
	// 		for(var i=0; i<4; i++) $('.player'+cnt).empty();
	//
	// 		for( var attn in data.users ){
	// 			if( typeof data.users[attn] === 'function' ) continue; // clone 때문에..
	// 			$('.attendants').append($('<li>').css('word-break','break-all').attr('id', 'attendants-'+data.users[attn] ).text( data.users[attn] ));
	//
	// 			if( cnt < 5 && data.users[attn] != user ){
	// 				player( cnt, data.users[attn] );
	// 				++cnt;
	// 			}
	// 		}
	// 	});
	//
	// 	socket.on('message', function(data){
	// 		showMessage(data.msg);
	// 	});
	//
	// 	socket.on('readied', function(data){
	// 		socket.on('disabled', function(){
	// 			btn_donot();
	// 			for(var i=0; i<6; i++){
	// 				$('.player'+i).css({'backgroundColor':'#fff'});
	// 			}
	// 		});
	//
	// 		for(var i=0; i<data.players.length; i++){
	// 			if(document.getElementById(data.players[i].nickname)){
	// 				if(data.players[i].ready === true)
	// 					$('#'+data.players[i].nickname).css('backgroundColor', 'black');
	// 				else if(data.players[i].ready === false )
	// 					$('#'+data.players[i].nickname).css('backgroundColor', '#fff');
	// 				else
	// 					continue;
	// 			}else{
	// 				continue;
	// 			}
	// 		}
	// 	});
	//
	// 	socket.on('start', function(){
	// 		var user = $('.uname').text();
	// 		players[0].key_f_check('keydown');
	// 		players[0].get_block_f();
	// 	});
	//
	// 	socket.on('mover', function(data){
	// 		for(var i=1; i<5; i++){
	// 			if($('.player'+i).attr('id') == data.nickname ){
	// 				players[i].nblock = data.nblock;
	// 				players[i].nl = data.nl;
	// 				players[i].block_start_f();
	// 			}
	// 		}
	// 	});
	//
	// 	socket.on('key_mover', function(data){
	// 		for(var i=1; i<5; i++){
	// 			if($('.player'+i).attr('id') == data.nickname ){
	// 				players[i].key_f(data.key);
	// 			}
	// 		}
	// 	});
	//
	// 	socket.on('del_bed', function(data){
	// 		for(var i=1; i<5; i++){
	// 			if($('.player'+i).attr('id') == data.nickname ){
	// 				players[i].delete_row_f();
	// 				if(data.cnt > 1){
	// 					players[0].add  = data.cnt-1;
	// 				}
	// 			}
	// 		}
	// 	});
	//
	// 	socket.on('appended', function(data){
	// 		for(var i=1; i<5; i++){
	// 			if($('.player'+i).attr('id') == data.nickname ){
	// 				players[i].add = data.add;
	// 				players[i].OtherA = data.rand;
	// 				players[i].add_block_f();
	// 			}
	// 		}
	// 	});
	//
	// 	$('#chgname').click(function(e){
	// 		var name = $('#nick').val();
	// 		var user = $('.uname').text();
	//
	// 		if( name.length > 10 ){
	// 			alert('이름이 넘 길잖아..');
	// 			$('#nick').val("");
	// 			return;
	// 		}
	// 		for(var i=0; i<$('.attendants>li').length; i++){
	// 			if( name == $('.attendants>li').eq(i).text() ){
	// 				alert('중복된 이름이 있습니다');
	// 				$('#nick').val("");
	// 				return;
	// 			}
	// 		}
	//
	// 		if($.trim(name) != ''){
	// 			$.post("/reg", { nickname : name, bn : user }, function(data){
	// 				if(data){
	// 					socket.emit('chgname', {nickname : user, chgname : name}, function(){
	// 						socket.emit('ready', {nickname : name, ready : false});
	// 						$('#'+user+'_t').attr('id', name+'_t');
	// 						$('#'+user+'_a').attr('id', name+'_a');
	// 						players[0].user = name;
	// 						$('.player0').attr('id', name);
	// 						$('.uname').empty().text(name);
	// 					});
	// 				}
	// 			});
	// 		}
	//
	// 		$('#nick').val("");
	// 	});
	//
	// 	$('.msg_box').bind('keypress', function(e){
	// 		if(e.which == 13){
	// 			msg_send();
	// 			$(this).val('');
	// 		}
	// 	});
	//
	// 	$('.msg_sub').click(function(){
	// 		msg_send();
	// 		$('.msg_box').val('');
	// 	});
	//
	// 	$(window).bind('beforeunload unload', function(){
	// 		if(socket) socket.disconnect();
	// 	})
	//
	// 	/* function  */
	//
	// 	function btn_do(){
	// 		$('.btn1').removeAttr('disabled');
	// 		$('.btn2').removeAttr('disabled');
	// 		$('#chgname').removeAttr('disabled');
	//
	// 		$('.btn1').click(function(e){
	// 			var user = $('.uname').text();
	// 			socket.emit('ready', {nickname : user, ready : true});
	// 		});
	//
	// 		$('.btn2').click(function(e){
	// 			var user = $('.uname').text();
	// 			socket.emit('ready', {nickname : user, ready : false});
	// 		});
	// 	}
	//
	// 	function btn_donot(){
	// 		$('.btn1').attr('disabled','disabled');
	// 		$('.btn2').attr('disabled','disabled');
	// 		$('#chgname').attr('disabled','disabled');
	// 	}
	//
	// 	function msg_send(){
	// 		var msg = $.trim($('.msg_box').val());
	// 		var user = $('.uname').text();
	// 		if( msg != ''){
	// 			//showMessage( user + ' : ' + msg);
	// 			socket.json.send({nickname : user, msg : msg});
	// 		}
	// 	}
	//
	// 	//player block create
	// 	function player(num, user){
	// 		function userBlock(user){
	// 			var div = $('<div>').css({'position':'absolute', 'left':'180px', 'bottom': '20px'});
	// 			div.html('===player===<br /><br />☞ '+user).css('color', '#5D5D5D');
	//
	// 			return div;
	// 		}
	//
	// 		$('.player'+num).empty();
	// 		$('.player'+num).attr('id', user);
	// 		$('.player'+num).append(userBlock(user));
	// 		players[num] = new tetris( user, 10, 20, 14 );
	// 	}
	// });
</script>
