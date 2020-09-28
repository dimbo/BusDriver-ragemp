"use strict"

mp.players.money = {
	get: function(player) {		
		return player.getVariable("money");;
	},
	set: function(player, sum) {
		player.setVariable("money", sum);
		player.call("moneySync", [sum]);
	}
};