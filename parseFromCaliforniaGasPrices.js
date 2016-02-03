/**
 * Created by Alex on 20.01.16.
 */
/**
 * Created by Alex on 14.01.16.
 */
var request = require("request");
var fs = require('fs');

var parser = require("./parseStringFromCaliforniaGasPrices");


var list = [];
var lastList = [];
var step = 0.5;
var data = [];
var content;
var countStack = 0;
var start = new Date().getTime();
// First I want to read the file
fs.readFile('californiaGasStations.json', function read(err, response) {
    if (err) {
        console.log('Файл californiaGasStations.json не найден.');
    }else{
        data = JSON.parse(response);
    }
    console.log('Всего записей в базе '+data.length);
});



fs.readFile('coords.json', function read(err, data) {
    if (err) {
        //throw err;
        console.log('Файл не найден. Создаем файл.');
        for (var i =-180; i<180;i+=step){
            for (var j=-90; j<90;j+=step){
                list.push([i,j,true]);
            }
        }
        fs.writeFile('coords.json',JSON.stringify(list));

    }else{
        list = JSON.parse(data);
        lastList = JSON.parse(data);
        areas = 0;
        points = 0;
        while (!(list[0][2]>0)){
            console.log('Сокращаем стек'+list[0][2]+','+ list.length);
            if (list[0][2]>0){
                areas++;
                points += list[0][2];
            };
            list.splice(0,1);
            if (list.length==0){
                break;
            }
        };
        console.log('Получилось'+list.length+ ', заправок: '+points+', областей: '+areas);
    }
    console.log('Всего записей '+list.length);

    parse();
});

var rewriteCoords = function(list){
    lastList = lastList.splice(0, lastList.length - list.length).concat(list);
    if (countStack>99) {
        elapsed = new Date().getTime() - start; // рассчитаем время выполнения
        //console.log(elapsed); // выведем в консоль
        start = new Date().getTime();
        console.log('Время '+elapsed%1000+'сек., записываем данные и обнуляем стек  = '+countStack);
        fs.writeFile('coords.json', JSON.stringify(lastList));
        countStack = 0;
    }
}

var parse = function(){

    while (true) {

        // Пропускает запросы по которым нет мест
        if (!list[0][2]) {
            if (list.length >= 2)
                if (list[1][2]) {
                    console.log('Пропуск. Осталось ' + list.length);
                }
            list.splice(0, 1);
            continue;
        }

        // Пропустит запросы, которые делались за последние 310 суток)
        if (list[0][3] != undefined) {
            if (list[0][2] > 0) {
                date = new Date();
                if ((date.getTime() - list[0][3]) < 1000 * 60 * 60 * 24 * 310) {
                    list.splice(0, 1);
                    continue;
                }
            }
        }


        break;

    }

    var http = require('http');

    var options = {
        host: 'www.californiagasprices.com',
        path: '/ajaxpro/GasBuddy_ASPX.GoogleMapGasPrices,GasBuddy_ASPX.ashx',
        method: 'POST',
        headers: {
            'X-AjaxPro-Method':'gus'
        }
    };

    callback = function(response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            //console.log(str);

            object = parser.parseString(str);
            data = parser.addInMass(data,object);
            list[0][2] = object[1].length;
            list[0][3] = (new Date()).getTime();
            rewriteCoords(list);
            countStack++;

            console.log('Осталось ' + list.length+', '+(list.length/(lastList.length/100)).toFixed(3) +'%, полученное количество - '+list[0][2]+' координаты:('+list[0][0]+','+list[0][1]+'), countStack: '+countStack);
            list.splice(0,1);
            if (list.length){
                parse();
            }
            if (countStack==100){
                console.log('Записываем данные в файл.')
                fs.writeFile("californiaGasStations.json", JSON.stringify(data));
            }
        });
    }

    var param = {dMaxX: list[0][0]+step,
        dMaxY: list[0][1]+step,
        dMinX: list[0][0],
        dMinY: list[0][1],
        sFuelType: "A",
        sTimeLimit: "All"
    }


    var req = http.request(options, callback);
    req.write(JSON.stringify(param));
    req.end();
}

