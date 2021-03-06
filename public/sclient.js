;(function($,rpc) {

    var socket, keymap, speed, videoStream;

    // video canvas will auto-size to the DOM-node, or default to 640*360 if no size is set.
    videoStream = new NodecopterStream($('#cam').get(0));

    socket = rpc.connect();

    socket.on('reconnect',function(){
       console.log('reconnect');
       console.log(videoStream);
       videoStream = new NodecopterStream();
    });

    socket.on('/drone/navdata',function(data){

        ["batteryPercentage", "clockwiseDegrees", "altitudeMeters", "frontBackDegrees", "leftRightDegrees", "xVelocity", "yVelocity", "zVelocity"].forEach(function(type) {
            return $("#" + type).html(Math.round(data.demo[type], 4));
        });

        return showBatteryStatus(data.demo.batteryPercentage);
    });

    window.showBatteryStatus = function(batteryPercentage){

        $("#batterybar").width("" + batteryPercentage + "%");

        if (batteryPercentage < 30) {
          $("#batteryProgress").removeClass("progress-success").addClass("progress-warning");
        }

        if (batteryPercentage < 15) {
          $("#batteryProgress").removeClass("progress-warning").addClass("progress-danger");
        }
        return $("#batteryProgress").attr({
          "data-original-title": "Battery status: " + batteryPercentage + "%"
        });
    };

    keymap = {
        87: {
            ev: 'move',
            action: 'front'
        },
        83: {
            ev: 'move',
            action: 'back'
        },
        65: {
            ev: 'move',
            action: 'left'
        },
        68: {
            ev: 'move',
            action: 'right'
        },
        38: {
            ev: 'move',
            action: 'up'
        },
        40: {
            ev: 'move',
            action: 'down'
        },
        37: {
            ev: 'move',
            action: 'counterClockwise'
        },
        39: {
            ev: 'move',
            action: 'clockwise'
        },
        32: {
            ev: 'drone',
            action: 'takeoff'
        },
        27: {
            ev: 'drone',
            action: 'land'
        },
        49: {
            ev: 'animate',
            action: 'flipAhead',
            duration: 15
        },
        50: {
            ev: 'animate',
            action: 'flipLeft',
            duration: 15
        },
        51: {
            ev: 'animate',
            action: 'yawShake',
            duration: 15
        },
        52: {
            ev: 'animate',
            action: 'doublePhiThetaMixed',
            duration: 15
        },
        53: {
            ev: 'animate',
            action: 'wave',
            duration: 15
        },
        69: {
            ev: 'drone',
            action: 'disableEmergency'
        }
    };


    speed = 0;
    $(document).keydown(function(ev){

        var evData;

        if (keymap[ev.keyCode] == null){
          return;
        }

        ev.preventDefault();
        speed = speed >= 1 ? 1 : speed + 0.08 / (1 - speed);
        evData = keymap[ev.keyCode];

        return socket.emit("/drone/" + evData.ev,{
          action: evData.action,
          speed: speed,
          duration: evData.duration
        });
    });

    $(document).keyup(function(ev){

        speed = 0;
        return socket.emit("/drone/drone",{
          action: 'stop'
        });
    });

    $("*[data-action]").on("mousedown", function(ev){

        return socket.emit("/drone/" + $(this).attr("data-action"),{
            action: $(this).attr("data-param"),
            speed: 0.3,
            duration: 1000 * parseInt($("#duration").val())
        });
    });

    $("*[data-action]").on("mouseup", function(ev){

        return socket.emit("/drone/move", {
            action: $(this).attr("data-param"),
            speed: $(this).attr("data-action") === "move" ? 0 : void 0
        });
    });

    $("*[rel=tooltip]").tooltip();

})(jQuery,io);