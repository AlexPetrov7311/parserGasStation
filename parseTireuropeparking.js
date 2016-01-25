/**
 * Created by Alex on 14.01.16.
 */
var request = require("request");
var fs = require('fs');

var list = [];
var step = 10;
var data = [];
for (var i =-180; i<180;i+=step){
    for (var j=-90; j<90;j+=step){
        list.push([i,j]);
    }
}

var parse = function(){

    request('https://truckparkingeurope.com/api/v3/parking_places/bounding_box/?' +
        'south_west_latitude='+list[0][0]+'&' +
        'south_west_longitude='+list[0][1]+'&' +
        'north_east_latitude='+(list[0][0]+step)+'&' +
        'north_east_longitude='+(list[0][1]+step)+'&' +
        'limit=25000&app_secret=e483f0be16bf4aad7ec4e40cc8139e54e86378b6&language=en',
        function (error, response, body) {

            body = JSON.parse(body);
            console.log('Осталось '+ list.length+' запросов');
            console.log('Получено '+ data.length+' мест');
            console.log(body.response.length);
            data = data.concat(body.response);
            list.splice(0,1);
            if (list.length){
                parse();
            }else{
                fs.writeFile("parkings.json", JSON.stringify(data));
            }

    })
}

parse();