"use strict"

let Blips = {
	list  : [],
	config:{
        type      : 1,
        name      : "Bus stop", 
        color     : [[255, 0, 0],[255,0,0]],
        shortRange: true,
        scale     : 1,
        color     : 60
    }
};

let BusDriverCEF = mp.browsers.new('package://BusDriver/menu.html');

mp.events.add({
	"moneySync": (sum) => {
		mp.gui.chat.push(`На вашем счету: !{green}$${sum}.`);
	},
	"jobAgreedment": (responce) => {
		mp.events.callRemote('playerAgreedmentJob', responce);
		mp.gui.cursor.show(false, false);
	},
	"jobCreateBlip": (x,y,z) => {
		let blip = mp.blips.new(Blips.config.type, new mp.Vector3(x, y, z),
		{
		    name      : Blips.config.name,
	            shortRange: Blips.config.shortRange,
	            scale     : Blips.config.scale,
	            color     : Blips.config.color
		});

		Blips.list.push({
			blip    : blip,
			position: {x:x, y:y, z:z}
		});

	},
	"jobDestroyBlip" : (x,y,z) => {
		let blipsList = Blips.list;

		for (let i = 0; i < blipsList.length; i++) {
			if (blipsList[i].position.x === x && blipsList[i].position.y === y && blipsList[i].position.z === z) {
				blipsList[i].blip.destroy();

				blipsList.splice(i, 1);
				break;
			}
		}
	},
	"jobAgreedmentShow": () => {
		mp.gui.cursor.show(true, true);
		BusDriverCEF.execute(`show()`);
	}
});
