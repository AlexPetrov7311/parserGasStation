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
        //throw err;
        console.log('Файл californiaGasStations.json не найден.');

    }else{
        data = JSON.parse(response);
    }
    console.log('Всего записей в базе '+data.length);
    // Invoke the next step here however you like
    //console.log(content);   // Put all of the code here (not the best solution)
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
        //list.splice(0,55000);
    }
    console.log('Всего записей '+list.length);

    parse();
    // Invoke the next step here however you like
    //console.log(content);   // Put all of the code here (not the best solution)
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


    if (!list[0][2]){
        if (list.length>=2)
        if (list[1][2]) {
            console.log('Пропуск. Осталось ' + list.length);
        }
        list.splice(0,1);
        parse();
        return true;
    }

    var http = require('http');

    var options = {
        host: 'www.californiagasprices.com',
        path: '/ajaxpro/GasBuddy_ASPX.GoogleMapGasPrices,GasBuddy_ASPX.ashx',
        //port: '1338',
        method: 'POST',
        //This is the only line that is new. `headers` is an object with the headers to request
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
            //console.log('parse');
            //console.log(parser.parseString);
            //return 0;

            object = parser.parseString(str);
            data = parser.addInMass(data,object);
            list[0][2] = object[1].length;

            rewriteCoords(list);
            countStack++;

            console.log('Осталось ' + list.length+', '+(list.length/(lastList.length/100)).toFixed(3) +'%, полученное количество - '+list[0][2]+' координаты:('+list[0][0]+','+list[0][1]+'), countStack: '+countStack);
            list.splice(0,1);
            if (list.length){
                //fs.writeFile("californiaGasStations.json", JSON.stringify(data));

                parse();
            }else{
                //fs.writeFile("californiaGasStations.json", JSON.stringify(data));
            }
            if (countStack==100){
                console.log('Записываем данные в файл.')
                fs.writeFile("californiaGasStations.json", JSON.stringify(data));
            }
        });
    }

    //var param = {dMaxX: -119.6458558195801,
    //    dMaxY: 36.84623126700088,
    //    dMinX: -119.77975169360354,
    //    dMinY: 36.76376387408884,
    //    sFuelType: "A",
    //    sTimeLimit: "22224"
    //}

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

