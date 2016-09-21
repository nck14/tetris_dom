var chat = module.exports = {
	users : [],
	interval : null,
	hasUser : function(nickname){
		var users = this.users.filter(function(element){
			return (element === nickname);
		});

		if(users.length > 0){
			return true;
		}else{
			return false;
		}
	},
	addUser : function(nickname){
		this.users.push(nickname);
	},
	getUsers : function(){
		return this.users;
	}
}
