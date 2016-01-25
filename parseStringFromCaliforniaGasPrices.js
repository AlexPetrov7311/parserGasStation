/**
 * Created by Alex on 20.01.16.
 */
function parseString(str){
    //console.log("fuck string");
    //console.log(str);
    //new GBAjaxPro.Web.DataSet(
    pos = str.indexOf("new GBAjaxPro.Web.DataSet(");
    //console.log('pos');
    //console.log(pos);
    //while (~str.indexOf("new GBAjaxPro.Web.DataSet(")){
        str = str.replace('new GBAjaxPro.Web.DataSet(','');
    //}
    //while (~str.indexOf("new GBAjaxPro.Web.DataTable(")){
        str = str.replace('new GBAjaxPro.Web.DataTable(','');
    //}
    while (~str.indexOf("])")){
        str = str.replace('])',']');
    }
    str = str.replace('"value"','value');
    //console.log(str);
    var object = eval(str);
    //console.log(object);
    //console.log(JSON.stringify(object['value']));
    resoponse =  object;
    //console.log('length = '+resoponse.length);
    //console.log(JSON.stringify(resoponse[0].length));
    return object;
}

function addInMass(mas,object){
    if (object.length==2){
        var param = object[0];
        var records = object[1];
        records.map(function(element, index){
            var item = {};
            param.map(function(el,idx){

                //console.log(el[0]);
                //console.log(element[idx]);
                item[el[0]] = element[idx];
                //console.log(idx);
            });
            //console.log(item);
            mas.push(item);
        });
        return mas;

    }else{
        console.error('mas.length != 2');
        return mas;
    }
}

exports.addInMass = addInMass;
exports.parseString = parseString;