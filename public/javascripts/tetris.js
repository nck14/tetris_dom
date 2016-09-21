Array.prototype.clone = function(){
	var arr = [];
	for( var i=0; i< this.length; i++){
			if( this[i].clone ){
				arr[i] = this[i].clone();
				continue;
			}
			arr[i] = this[i];
	}
	return arr;
}

function tetris( elm, width, height, blockSize, socket){
	this.elm = document.getElementById(elm);
	if(!this.elm) return null;
	this.elm.style.position = 'relative';
	//this.elm.style.width = ((width+7)*23)+'px';
	this.elm.style.overflow = 'auto';

	this.w = width;
	this.h = height;
	this.time = 300;
	this.socket = socket;
	this.user = elm;
	this.gameOver = 0;
	this.gameClear = 0;
	this.blockColor = 'black'; 		// just simple color
	this.ghostColor = '#E8D9FF';		// anything color
	this.blockSize = blockSize;
	this.blockOther = 0;
	if( this.blockSize < 20 ){
		this.blockOther = 1;
	}

	this.table; this.altable; this.tmpTable;	// table
	this.tr;
	this.ret;					// 0~4 block
	this.lock;
	this.move;
	this.createBlock;			// now block
	this.interval;				// block down interval
	this.cssStr;				// block css
	this.rand;
	this.arand = null;			// alreay show
	this.temp1 = this.temp2 = null;	// save block;
	this.tmpPush = 0;
	this.add = 0;

	this.nblock = [];			// now block;
	this.nl = [];				// new line
	this.ghostnl = [];			// ghost show
	this.OtherA = [];
	
	this.create_table_f();
	// if( !this.blockOther ) this.key_f_check('keydown');
	//this.get_block_f();			// block get and start
}

tetris.prototype = {
	create_table_f : function(){
		var tr, td;

		this.table = document.createElement("table");
		//this.table.setAttribute("id", "tetris_v1_0");
		this.table.style.borderCollapse = "collapse";
		this.table.style.cssFloat = 'left';

		this.cssStr = '';
		this.cssStr += 'width:'+this.blockSize+'px;';
		this.cssStr += 'height:'+this.blockSize+'px;';
		this.cssStr += 'border: 1px solid #BDBDBD;';
		
		for( var i=0 ; i<this.h ; i++ ){
			tr = document.createElement("tr");
			for( var j=0 ; j<this.w ; j++ ){
				td = document.createElement("td");
				td.style.cssText = this.cssStr;
				td.appendChild(document.createTextNode(" "));
				tr.appendChild(td);
			}
			this.table.appendChild(tr);
		}
		this.elm.appendChild(this.table);
		this.tr = this.table.childNodes;
		
		var addD = document.createElement('div');
		addD.style.position = 'absolute';
		addD.style.top = '5%';
		if( !this.blockOther ){
			addD.style.right = '7%';
			addD.style.width = '115px';
		}else{
			addD.style.left = '180px';
			addD.style.width = '85px';
		}

		this.altable = document.createElement("table");
		//this.altable.setAttribute("id", "tetris_v1_0_a");
		this.altable.style.borderCollapse = "collapse";
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.setAttribute("colspan", "5");
		td.appendChild(document.createTextNode("Next block"));
		tr.appendChild(td);
		this.altable.appendChild(tr);

		for( var i=0; i<6; i++){
			tr = document.createElement("tr");
			for( var j=0; j<5; j++){
				td = document.createElement("td");
				td.style.cssText = this.cssStr;
				td.appendChild(document.createTextNode(" "));
				tr.appendChild(td);
			}
			this.altable.appendChild(tr);
		}

		addD.appendChild(this.altable);

		if( !this.blockOther ){
			this.tmpTable = document.createElement("table");
			//this.tmpTable.setAttribute("id", "tetris_v1_0_t");
			this.tmpTable.style.borderCollapse = "collapse";

			var tr = document.createElement("tr");
			var td = document.createElement("td");
			td.setAttribute("colspan", "5");
			td.appendChild(document.createTextNode("save block"));
			tr.appendChild(td);
			this.tmpTable.appendChild(tr);

			for( var i=0; i<6; i++){
				tr = document.createElement("tr");
				for( var j=0; j<5; j++){
					td = document.createElement("td");
					td.style.cssText = this.cssStr;
					td.appendChild(document.createTextNode(" "));
					tr.appendChild(td);
				}
				this.tmpTable.appendChild(tr);
			}
			addD.appendChild(this.tmpTable);
		}

		this.elm.appendChild(addD);
	},
	key_f_check : function(evnt){
		var This = this;
		var keys;
		if(window.addEventListener){
			document.body.addEventListener(evnt, function(event){
				keys = event.keyCode || event.which;
				This.key_f(keys);
			}, false);
		}else if(window.attachEvent){
			document.body.attachEvent('on'+evnt, function(event){
				keys = event.keyCode || event.which;
				This.key_f(keys);
			}, false);
		}else{
			document.body.onkeydown = function(event){
				keys = event.keyCode || event.which;
				keys.cancelBubble = false;
				if(keys.stopPropagation) keys.stopPropagation();
				This.key_f(keys);
			}
		}
	},
	key_f : function(keys){
		//37 left, 39 right 40, up 38, down 40, z 90, x 88
		if(this.lock) return false;
		switch(keys){
			case 37: //left
				if( this.simulator('kLeft')){
					if(!this.blockOther) this.socket.emit('key_move', { nickname : this.user ,key : 37 });
					for(var i=0; i<this.nblock.length; i++){
						this.tr[--this.nl[i]].childNodes[this.nblock[i]].style.backgroundColor = '';
						if(!this.blockOther) this.tr[--this.ghostnl[i]].childNodes[this.nblock[i]].style.backgroundColor = '';
						this.nblock[i]--;
					}
					this.showBlock_f();
					if(!this.blockOther) this.ghost_f();
				}
				break;
			case 39: //right
				if( this.simulator('kRight')){
					if(!this.blockOther) this.socket.emit('key_move', { nickname : this.user ,key : 39 });
					for(var i=0; i<this.nblock.length; i++){
						this.tr[--this.nl[i]].childNodes[this.nblock[i]].style.backgroundColor = '';
						if(!this.blockOther) this.tr[--this.ghostnl[i]].childNodes[this.nblock[i]].style.backgroundColor = '';
						this.nblock[i]++;
					}
					this.showBlock_f();
					if(!this.blockOther) this.ghost_f();
				}
				break;
			case 38: //up
				if( this.blockOther || !this.lock && this.simulator('kUp') ){
					this.cleanBlock_f();
					if( this.blockOther ){
						return;
					}
					this.cleanGhost_f();
					this.nblock = this.new_line_f(this.createBlock[this.ret], this.nl[0]-2, this.move);
					this.socket.emit('key_move', { nickname : this.user ,key : 38 });
					this.socket.emit('move', { nickname : this.user ,nblock : this.nblock, nl : this.nl });
					this.showBlock_f();
					this.ghost_f();
				}
				break;
			case 40: //down
				if( this.simulator('down')){
					if(!this.blockOther) this.socket.emit('move', { nickname : this.user ,nblock : this.nblock, nl : this.nl });
					this.block_start_f();
				}
				/* block change... T_T...
				if( this.lock || !this.simulator('kDown')){return false;}
				this.cleanBlock_f();
				this.cleanGhost_f();
				this.nblock = this.new_line_f(this.createBlock[this.ret], this.nl[0]-2, this.move);
				this.showBlock_f();
				this.ghost_f();
				*/
				break;
			case 90: //z
				if(!this.blockOther) this.socket.emit('key_move', { nickname : this.user ,key : 90 });
				while(this.simulator('down')){
					this.block_start_f();
				}
				clearInterval(this.interval);
				this.tmpPush = 0;
				if(!this.blockOther){
					this.get_block_f();
				}
				break;
			case 88: //x
				if(this.blockOther){
					this.cleanBlock_f();
					return;
				}
				if(this.tmpPush) return;
				clearInterval(this.interval);
				this.tmpPush = 1;
				this.temp = this.createBlock;
				this.temp_draw_f();
				this.socket.emit('key_move', { nickname : this.user ,key : 88 });
				this.cleanGhost_f();
				this.cleanBlock_f(); 
				this.get_block_f();
				break;
		}
	},
	simulator : function(simul){
		switch(simul){
			case 'down':
				this.lock = 1;
				for(var i=0;i<this.nblock.length;i++){
					if(this.nl[i] > this.h-1){
						this.lock = 1; this.tmpPush = 0;
						return false;
					}
				}
				if(!this.down_check_f(this.nl)) return false;
				
				return true;
				break;
			case 'ghost':
				for(var i=0;i<this.nblock.length;i++){
					if(this.ghostnl[i] > this.h-1){
						return false;
					}
				}
				if(!this.down_check_f(this.ghostnl)) return false;
				
				return true;
				break;
			case 'kLeft':
				for(var i=0;i<this.nblock.length;i++) if(!this.tr[this.nl[i]-1]) return false;
				this.cleanBlock_f();
				for(var i=0;i<this.nblock.length;i++){
					if( ((!this.tr[this.nl[i]-1]) || (!this.tr[this.nl[i]-1].childNodes[this.nblock[i]-1]))
					 || this.tr[this.nl[i]-1].childNodes[this.nblock[i]-1].style.backgroundColor == this.blockColor ){
						for(var i=0; i<this.nblock.length; i++) this.nl[i]--;
						this.showBlock_f();
						return false;
					}
				}
				return true;
				break;
			case 'kRight':
				for(var i=0;i<this.nblock.length;i++) if(!this.tr[this.nl[i]-1]) return false;
				this.cleanBlock_f();
				for(var i=0;i<this.nblock.length;i++){
					if( ((!this.tr[this.nl[i]-1]) || (!this.tr[this.nl[i]-1].childNodes[this.nblock[i]+1]))
					 || this.tr[this.nl[i]-1].childNodes[this.nblock[i]+1].style.backgroundColor == this.blockColor ){
						for(var i=0; i<this.nblock.length; i++) this.nl[i]--;
						this.showBlock_f( );
						return false;
					}
				}
				return true;
				break;
			case 'kUp' :
				if( this.lock ) return false;
				this.lock = 1;
				var simul, ret = this.ret;
				if( ret+1 > this.createBlock[this.ret].length-1 ) ret = 0;
				else ret++;
				
				simul = this.simul_ret_f(this.createBlock[ret], this.nl[0]-2, true);
				this.cleanBlock_f();
				for(var i=0; i<this.nblock.length; i++) this.nl[i]--;
				for(var i=0; i<simul[0].length; i++){
					if( simul[0][i] < 0 || simul[0][i] >= this.h || simul[1][i] >= this.w 
					|| !this.tr[simul[0][i]] || !this.tr[simul[0][i]].childNodes[simul[1][i]] 
					|| this.tr[simul[0][i]].childNodes[simul[1][i]].style.backgroundColor == this.blockColor ){
						
						this.showBlock_f( );
						this.lock = 0;
						return false;
					}
					
				}
				this.showBlock_f( );
				this.lock = 0; this.ret = ret;
				return true;
				break;
			case 'kDown' :
				if( this.lock ) return false;
				this.lock = 1;
				var simul, ret = this.ret;
				if( ret-1 < 0 ) ret = this.createBlock[this.ret].length-1;
				else ret--;
				
				simul = this.simul_ret_f(this.createBlock[ret], this.nl[0]-2, true);
				this.cleanBlock_f();
				for(var i=0; i<this.nblock.length; i++) this.nl[i]--;
				for(var i=0; i<simul[0].length; i++){
					if( simul[0][i] < 0 || simul[0][i] >= this.h || simul[1][i] >= this.w 
					|| !this.tr[simul[0][i]] || !this.tr[simul[0][i]].childNodes[simul[1][i]] 
					|| this.tr[simul[0][i]].childNodes[simul[1][i]].style.backgroundColor  == this.blockColor ){
						
						this.showBlock_f( );
						this.lock = 0;
						return false;
					}
					
				}
				this.showBlock_f( );
				this.lock = 0; this.ret = ret;
				return true;
				break;
		}
		return false;
	},
	simul_ret_f : function(nblock, nl, sw){
		var arr = [[], nblock.clone() ];
		this.move = ( sw != 'already') ? this.nblock[0] - Math.floor(this.w/2) : 2 - Math.floor(this.w/2);

		for(var i=0;i<arr[1].length;i++){
			arr[0][arr[0].length] = nl;
			while(arr[1][i] > this.w){
				arr[1][i] -= this.w;
				arr[0][arr[0].length-1]++;
			}
			arr[1][i] += this.move;
		}
		return arr;
	},
	new_line_f : function(nblock, nl, move){
		var arr = nblock.clone();
		
		for(var i=0;i<arr.length;i++){
			this.nl[i] = nl;
			while(arr[i] > this.w){
				arr[i] -= this.w;
				this.nl[i]++;
			}
			if(move) arr[i] += move;
		}
	
		return arr;
	},
	rand_block : function(){
		var block = [], rand = 0;
		var half_w = Math.floor(this.w/2);
		var create;

		block = [
				[
					[half_w, half_w-1, half_w+1, half_w+this.w], 
					[half_w+this.w, (half_w-1)+this.w, half_w+(this.w*2), half_w],
					[half_w+this.w, (half_w-1)+this.w, (half_w+1)+this.w, half_w],
					[half_w+this.w, half_w+(this.w*2), (half_w+1)+this.w, half_w]
				],
				[
					[half_w+(this.w*2), (half_w+this.w*3) ,half_w+this.w, half_w], 
					[half_w, half_w-1,  half_w+2, half_w+1], 
					[half_w+(this.w*2), (half_w+this.w*3) ,half_w+this.w, half_w], 
					[half_w, half_w-1,  half_w+2, half_w+1]
				],
				[
					[half_w, (half_w-1)+this.w, half_w-1, half_w+1],
					[half_w+this.w, half_w, half_w+(this.w*2), (half_w+1)+(this.w*2)],
					[half_w+this.w, (half_w-1)+this.w, (half_w+1)+this.w, half_w+1],
					[half_w+this.w, half_w, half_w-1, half_w+(this.w*2)]
				],
				[
					[half_w, (half_w+1)+this.w, half_w-1, half_w+1],
					[half_w+this.w, half_w, half_w+(this.w*2), (half_w-1)+(this.w*2)],
					[half_w+this.w, (half_w-1)+this.w, (half_w+1)+this.w, half_w-1],
					[half_w+this.w, half_w, half_w+1, half_w+(this.w*2)]
				],
				[
					[half_w+this.w, (half_w-1)+this.w, half_w, half_w-1],
					[half_w+this.w, (half_w-1)+this.w, half_w, half_w-1],
					[half_w+this.w, (half_w-1)+this.w, half_w, half_w-1],
					[half_w+this.w, (half_w-1)+this.w, half_w, half_w-1]
				]
			];
		
		//Math.floor(Math.random()*(5-0))
		//console.log(this.temp2);
		this.rand = (this.arand != null) ? this.arand : Math.floor(Math.random()*5);
		if( !this.tmpPush || !this.temp2 ) this.arand = Math.floor(Math.random()*5);
		
		this.already_draw_f(block[this.arand].clone());
		this.createBlock = (this.temp2 && this.tmpPush == 1) ? this.temp2 : block[this.rand].clone();
		
		this.nblock = this.new_line_f( this.createBlock[this.ret], 0, false);
		this.temp2 = this.temp;
	},
	get_block_f : function(){
		var This = this;
		if( this.gameOver ) return;
		//var rand = Math.floor(Math.random()*6);
		this.ret = 0; this.lock = 1;
		this.delete_row_f();
		this.rand_block();

		if(this.simulator('down')){
			this.add_block_f();
			this.socket.emit('move', { nickname : this.user ,nblock : this.nblock, nl : this.nl });
			this.block_start_f();
			if(!this.blockOther) this.ghost_f();
		}
		this.interval = setInterval(function(){
			if(This.simulator('down')){
				This.socket.emit('move', { nickname : This.user ,nblock : This.nblock, nl : This.nl });
				This.block_start_f();
			}else{
				clearInterval(This.interval);
				if(This.gameOver){
					This.game_over_f();
					return;
				}
				This.get_block_f(); //console.log('new block');
				This.tmpPush = 0;
			}
		}, this.time);
	},
	block_start_f : function(color){
		this.cleanBlock_f();
		this.showBlock_f(color);
		this.lock = 0;
	},
	cleanBlock_f : function()
	{
		for(var i=0; i<this.nblock.length; i++){
			if(!this.tr[this.nl[i]-1]) break;
			this.tr[this.nl[i]-1].childNodes[this.nblock[i]].style.backgroundColor = '';
		}
	},
	showBlock_f : function(color)
	{
		for(var i=0; i<this.nblock.length; i++){
			if(this.tr[this.nl[i]]){
				this.tr[this.nl[i]].childNodes[this.nblock[i]].style.backgroundColor = this.blockColor;
				this.nl[i]++;
			}
		}
	},
	delete_row_f : function(){
		var cnt = 0;
		for(var i=0 ; i<this.h ; i++){
			for(var j=0; j<this.w; j++){
				if( !this.tr[i].childNodes[j].style.backgroundColor ) break;
				else if( j == this.w-1 ){
					++cnt;
					this.table.removeChild(this.table.childNodes[i]);
					var tr = document.createElement("tr");
					for(var m=0;m<this.w;m++){
						var td = document.createElement("td");
						td.style.cssText = this.cssStr;
						td.appendChild(document.createTextNode(" "));
						tr.appendChild(td);
					}
					this.table.insertBefore(tr ,this.tr[0]);
					break;
				}
			}
		}
		if( !this.blockOther ) this.socket.emit('del_b', { nickname : this.user, cnt : cnt });
	},
	down_check_f : function(pm){
		var color;
		if(pm == this.nl){
			color = this.blockColor;
			this.cleanBlock_f();
		}
		else if(pm == this.ghostnl ){
			color = this.ghostColor;
			this.cleanGhost_f();
		}
		for(var i=0; i<this.nblock.length; i++){
			if(this.tr[pm[i]]){
				if(this.tr[pm[i]].childNodes[this.nblock[i]].style.backgroundColor == this.blockColor ){
					for(var i=0; i<this.nblock.length; i++) pm[i]--;
					for(var i=0; i<this.nblock.length; i++){
						if(!this.tr[pm[i]]){
							clearInterval(this.interval);
							this.gameOver = 1;
							return false;
							//game over code
						}
						this.tr[pm[i]].childNodes[this.nblock[i]].style.backgroundColor = color;
					}
					if(pm == this.ghostnl) for(var i=0; i<this.nblock.length; i++) pm[i]++;
					return false;
				}
			}
		}
		return true;
	},
	ghost_f : function(){
		this.ghostnl = this.nl.clone();
		while(this.simulator('ghost')){
			this.ghost_start_f();
		}
		for(var i=0; i<this.nblock.length; i++) this.nl[i]--;
		this.showBlock_f();
	},
	ghost_start_f : function(){
		this.cleanGhost_f();
		this.showGhost_f();
	},
	showGhost_f : function(){
		for(var i=0; i<this.nblock.length; i++){
			if(this.tr[this.ghostnl[i]]){
				this.tr[this.ghostnl[i]].childNodes[this.nblock[i]].style.backgroundColor = this.ghostColor;
				this.ghostnl[i]++;
			}
		}
	},
	cleanGhost_f : function(){
		for(var i=0; i<this.nblock.length; i++)
			this.tr[this.ghostnl[i]-1].childNodes[this.nblock[i]].style.backgroundColor = '';
	},
	already_draw_f : function(arand){
		var simul = this.simul_ret_f(arand[0], 2, 'already');
		for(var i=0; i<this.altable.childNodes.length; i++){
			for( var j=0; j<this.altable.childNodes[i].childNodes.length; j++)
				this.altable.childNodes[i].childNodes[j].style.backgroundColor = '';
		}
		for(var i=0; i<simul[0].length; i++){
			this.altable.childNodes[simul[0][i]].childNodes[simul[1][i]].style.backgroundColor = this.blockColor;
		}
	},
	temp_draw_f : function(){
		var simul = this.simul_ret_f(this.temp[0], 2, 'already');
		for(var i=1; i<this.tmpTable.childNodes.length; i++){
			for( var j=0; j<this.tmpTable.childNodes[i].childNodes.length; j++)
				this.tmpTable.childNodes[i].childNodes[j].style.backgroundColor = '';
		}
		for(var i=0; i<simul[0].length; i++){
			this.tmpTable.childNodes[simul[0][i]].childNodes[simul[1][i]].style.backgroundColor = this.blockColor;
		}
	},
	rand_upper_f : function(){
		var tr, td, empth;
		var rand = Math.floor(Math.random()*(3-1)+1);
			
		for(var i=0; i<rand; i++){
			tr = document.createElement("tr");
			this.table.removeChild(this.table.firstChild);
			empty = Math.floor(Math.random()*(this.w));
			for(var j=0; j<this.w; j++){
				td = document.createElement("td");
				td.innerHTML = " ";
				td.style.cssText = this.cssStr;
				if(empty != j) td.style.backgroundColor = this.blockColor;
				tr.appendChild(td);
			}
			this.table.appendChild(tr);
		}
	},
	game_over_f : function(){
		alert('game over');
		/*
		if(this.gameClear || confirm('re?')){
			this.gameClear = 0;
			this.elm.innerHTML = '';
			this.arand = null;
			this.nl = [];
			this.nblock = [];
			this.temp1 = this.temp2 = null;			// save block;
			this.tmpPush = 0;
			this.ghostnl = [];
			this.gameOver = 0;
			this.create_table_f();
			this.get_block_f();
		}*/
	},
	game_clear_f : function(){
		this.elm.innerHTML = '';
		alert('game Clear');
		if(confirm('re?')){
			this.gameClear = 1;
			this.game_over_f();
		}
	},
	add_block_f : function(){
		for(var i=0; i<this.w; i++){
			if(this.tr[0].childNodes[i].style.backgroundColor){
				clearInterval(this.interval);
				this.game_over_f();
				return;
			}
		}

		if(this.add > 0){
			if( !this.blockOther ) this.OtherA = [];
			for(var i=0; i<this.add; i++){
				if( !this.blockOther ) this.OtherA[this.OtherA.length] = Math.floor(Math.random()*this.w);

				this.table.removeChild(this.table.firstChild);
				var tr = document.createElement('tr');
				for(var j=0; j<this.w; j++){
					var td = document.createElement('td');
					td.appendChild(document.createTextNode(" "));
					td.style.cssText = this.cssStr;
					if(j != this.OtherA[i]) td.style.backgroundColor = this.blockColor;
					tr.appendChild(td);
				}
				this.table.appendChild(tr);
				
			}
			if( !this.blockOther ) this.socket.emit('append', { nickname : this.user, add : this.add, rand : this.OtherA });
			this.OtherA = [];
			this.add = 0;
		}
	}
}