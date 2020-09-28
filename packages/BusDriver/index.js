"use strict"

class busDriverJob {
    constructor() {
        this.jobInfo = {
            name: "Bus Driver",
            id  : 5
        };
        this.vehiclesConfig  = {
            model      : "airbus",
            numberPlate: "JiffyRent", // номерные знаки
            color      : [[255, 0, 0],[255,0,0]]
        };
        this.blipsConfig  = {
            type      : 1,
            name      : "Bus stop", 
            color     : [[255, 0, 0],[255,0,0]],
            shortRange: true,
            scale     : 1,
            color     : 60
        };

        this.rentalPrice       = 50; // $
        this.completePrice     = 10; // $
        this.vehiclesSpawns    = [
            { x: -390.1252746582031,  y: 1189.7308349609375, z: 325.6418151855469,  heading: 95.8676986694336  },
            { x: -389.3095397949219,  y: 1194.0142822265625, z: 325.64178466796875, heading: 89.93187713623047 },
            { x: -388.01702880859375, y: 1198.2286376953125, z: 325.64178466796875, heading: 90.38450622558594 },
            { x: -386.82879638671875, y: 1202.4647216796875, z: 325.64178466796875, heading: 89.55944061279297 },
            { x: -385.90625,          y: 1206.5068359375,    z: 325.64178466796875, heading: 92.2523422241211  },
            { x: -384.4378356933594,  y: 1210.806396484375,  z: 325.64178466796875, heading: 92.76802062988281 }
        ];
        this.checkpointsCoords = [
            { x: -436.44732666015625, y: 1195.21826171875,   z: 324 },
            { x: -452.5345153808594,  y: 1377.7218017578125, z: 297 },
            { x: -215.41798400878906, y: 1474.459228515625,  z: 287 },
            { x: -201.92141723632812, y: 1313.7008056640625, z: 303 },
            { x: -386.1823425292969,  y: 1180.5751953125,    z: 324 }
        ];
        this.checkpointsList = [];

        // events 
        mp.events.add({
            "playerJoin": (player) => {
                player.model = mp.joaat('player_zero');
                player.spawn(new mp.Vector3(-399.96728515625, 1190.301513671875, 325.6418151855469));

                mp.players.money.set(player, 300); // Даем игроку $300
            },
            "playerEnterCheckpoint": (player, checkpoint) => {
                if (player.vehicle) this.playerEnterCheckpoint(player, checkpoint);
            },
            "playerEnterVehicle": (player, vehicle) => {
                player.call('jobAgreedmentShow');
            },
            "playerExitVehicle": (player) => {
                // Заглушка для увольнения, чтобы не писать логику увольнения.
                // Из-за неё при отказе от работы активируются 2 эвета
                // playerExitVehicle - т.к. мы вбрасываем игрока из автобуса
                // playerAgreedmentJob (false) - тоже выбрасываем игрока
                this.playerLeaveJob(player);  
            },
            "playerAgreedmentJob": (player, responce) => {
                this.playerAgreedmentJob(player, responce)
            }  
        });

        // initialisation
        this.createEntities();
        this.spawnVehicles(this.vehiclesConfig);

    }

    createEntities() {

        for (let i = 0; i < this.checkpointsCoords.length; i++) {
            const pos        = this.checkpointsCoords[i];
            const checkpoint = mp.checkpoints.new(47, new mp.Vector3(pos.x, pos.y, pos.z), 10,
            {
                color: [ 255, 255, 255, 255 ],
                visible: false,
                dimension: 0
            });

            this.checkpointsList.push({ // объект т.к. может понадобиться записывать доп. данные, типа блипов.
                checkpoint: checkpoint
            });
        };

    }

    spawnVehicles(settings) {
        for (let i = 0; i < this.vehiclesSpawns.length; i++) {
            let coords = this.vehiclesSpawns[i];
            
            mp.vehicles.new(mp.joaat(settings.model), new mp.Vector3(coords.x, coords.y, coords.z), {
                numberPlate: settings.numberPlate,
                color      : settings.color,
                heading    : coords.heading
            });
        };
    }

    playerAgreedJob(player) {
        let playerMoney = mp.players.money.get(player);
        mp.players.money.set(player, playerMoney - 50); // Забираем у игрока price

        const checkpoint = this.checkpointsList[0].checkpoint;
        const blipsConf  = this.blipsConfig;

        player.call('jobCreateBlip', [checkpoint.position.x, checkpoint.position.y, checkpoint.position.z]);

        checkpoint.showFor(player);
    }

    playerDisagreedJob(player) {
        player.outputChatBox(`!{red}Вы отказались от работы!`);
        player.removeFromVehicle();
    }

    playerAgreedmentJob(player, responce) { // responce bool
        if (!player.vehicle) return player.outputChatBox(`Чтобы устроиться надо находиться в автобусе!`);

        if (responce) {
            this.playerAgreedJob(player);           
        } else {
            this.playerDisagreedJob(player);
        };
    }

    playerEnterCheckpoint(player, checkpoint) {
        const list = this.checkpointsList;

        for (let i = 0; i < list.length; i++) {
            
            let point = list[i].checkpoint;
            if (point === checkpoint) {
                let num       = (i+1);
                let pointNext = (num >= list.length) ? list[0].checkpoint : list[num].checkpoint; // one line if else - сокращение

                point.hideFor(player); 
                pointNext.showFor(player);

                player.call('jobDestroyBlip', [point.position.x, point.position.y, point.position.z]);
                player.call('jobCreateBlip', [pointNext.position.x, pointNext.position.y, pointNext.position.z]);

                // Give money to player
                let playerMoney = mp.players.money.get(player);
                mp.players.money.set(player, playerMoney + this.completePrice);
                break;
            };

        }
    }

    playerLeaveJob(player) {
        player.outputChatBox(`!{red}Вы уволились с работы!`);

        // Скрываем чекпоинты и блипы
        const list = this.checkpointsList;
        for (let i = 0; i < list.length; i++) {
            let point = list[i].checkpoint;
            player.call('jobDestroyBlip', [point.position.x, point.position.y, point.position.z]);
            list[i].checkpoint.hideFor(player);
        }
    }

}
const job = new busDriverJob();