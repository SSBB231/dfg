/*
    executes a callback function for a property of an object
    verifying if the property is an array or a single value
    object = {
        instance: json
        property: string
        callback: function
    }
*/
this.propertyArrayOrSingle = function(object){
 
    if(object){
        var instance = object.instance;
        var property = object.property;
        var callback = object.callback;
        if (instance && instance.hasOwnProperty(property) && instance[property] instanceof Array) {
            for (var i = 0; i < instance[property].length; i++) {
                if(callback instanceof Function){
                    callback({
                        instance: instance,
                        value: instance[property][i],
                        property: property
                    });
                }
            }
        } else if (instance && instance.hasOwnProperty(property)) {
            if(callback instanceof Function){
                callback({
                    instance: instance,
                    value: instance[property],
                    property: property
                });
            }
        }
    }
}
this.getMonths = function(lang){
    return [{
        id: '01',
        name: lang === "enus"? "January" : "Janeiro"
    },{
        id: "02",
        name: lang === "enus" ? "Febrary" : "Fevereiro"
    },{
        id: "03",
        name: lang === "enus" ? "March" : "Março"
    },{
        id: "04",
        name: lang === "enus" ? "April" : "Abril"
    },{
        id: "05",
        name: lang === "enus" ? "May" : "Maio"
    },{
        id: "06",
        name: lang === "enus" ? "June" : "Junho"
    },{
        id: "07",
        name: lang === "enus" ? "July": "Julho"
    },{
        id: "08",
        name: lang === "enus" ? "August": "Agosto"
    },{
        id: "09",
        name: lang === "enus"?"September":"Setembro"
    },{
        id: "10",
        name: lang === "enus"?"October":"Outubro"
    },{
        id: "11",
        name: lang === "enus"?"November":"Novembro"
    },{
        id: "12",
        name: lang === "enus"?"December":"Dezembro"
    }];
};
this.getYears = function(){
   var years = [];
   var actualYear = (new Date()).getFullYear();
   for(var i = actualYear - 5; i <= actualYear;i++){
       years.push({id: i,name:i});
   }
   for(var i = actualYear+1; i <= actualYear+5; i++){
       years.push({id:i,name:i});
   }
   return years;
};
this.toJSONDate = function(date, emptyIsHash) {
    var getJSONfromDate = function(date) {
        if (isNaN(date)) {
            return emptyIsHash ? '#' : null;
        }
        var parts = date.toString().split(' ');
        var months = {
            'Jan': '01',
            'Feb': '02',
            'Mar': '03',
            'Apr': '04',
            'May': '05',
            'Jun': '06',
            'Jul': '07',
            'Aug': '08',
            'Sep': '09',
            'Oct': '10',
            'Nov': '11',
            'Dec': '12'
        };
        return {
            day: parts[2],
            month: months[parts[1]],
            year: parts[3]
        };
    };
    var result = emptyIsHash ? '#' : null;
    if (date && typeof date === 'object') {
        if ((date.hasOwnProperty('date') || date.hasOwnProperty('day')) && date.hasOwnProperty('month') && date.hasOwnProperty('year')) {
            result = {
                day: date['date'] || date['day'],
                month: date['month'],
                year: date['year']
            };
        } else if (date instanceof Date) {
            result = getJSONfromDate(date);
        }
    } else if (date && typeof date === 'string') {
        switch ("ptrbr") { // TODO implement session lang
            case 'enus':
                var tempDate = new Date(date);
                break;
            case 'ptrbr':
            default:
                var tempDate = date.split('/');
                tempDate = new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]);
                break;
        }
        if (!isNaN(tempDate)) {
            result = getJSONfromDate(tempDate);
        } else if (!isNaN(new Date(date))) {
            result = getJSONfromDate(date);
        }
    }
    return result;
};

this.toBaseDate = function(date, emptyIsHash) {
    var result = this.toJSONDate(date, emptyIsHash);
    if (result !== '#' && result !== null) {
        switch ("ptrbr") { // TODO implement session lang
            case 'enus':
                return [result.month, result.day, result.year].join('/');
                break;
            case 'ptrbr':
            default:
                return [result.day, result.month, result.year].join('/');
                break;
        }
    }
    return result;
};
