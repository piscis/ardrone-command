;(function() {

    var app, currentImg, drone, express, imageSendingPaused, path, server, socket;
    var express = require("express"),
        path = require("path"),
        app = express(),
        nconf = require('nconf'),
        config = nconf.file({file: __dirname+'/etc/config.json'}),
        drone = require("ar-drone").createClient({ ip: config.get('app:droneip')});

    drone.config('general:navdata_demo', 'TRUE');

    app.configure(function(){

        app.set('port', process.env.PORT || config.get('app:port'));
        app.set('host', process.env.PORT || config.get('app:host'));
        app.use("/libs", express.static(__dirname+ '/public/libs'));
        app.use(express.static(__dirname+'/public'));
        app.use(app.router);
    });

    var server = require("http").createServer(app);
    var io = require('socket.io').listen(server);
    io.set('destroy upgrade',false); // do not interfere with video stream websocket

    var droneStream = require("dronestream").listen(server, { ip: config.get('app:droneip') });

    io.sockets.on('connection',function(socket){

        socket.on('/drone/move',function(cmd){
            var _name;
            console.log("move", cmd);
            return typeof drone[_name = cmd.action] === "function" ? drone[_name](cmd.speed) : void 0;
        });

        socket.on('/drone/animate', function(cmd){
            console.log('animate', cmd);
            return drone.animate(cmd.action, cmd.duration);
        });

        socket.on("/drone/drone", function(cmd) {
            var _name;
            console.log('drone command: ', cmd);
            return typeof drone[_name = cmd.action] === "function" ? drone[_name]() : void 0;
        });


        drone.on('navdata', function(data) {
            socket.emit("/drone/navdata", data);
        });
    });

    server.listen(app.get("port"),app.get("host"), function() {
        return console.log("Express server listening on port " + app.get("port"));
    });

}).call(this);
