var fs = require('fs');
var _ = require('lodash');
var iconv = require('iconv-lite');

function fileToArray (fileName, separator, addLineNumbers) {

	var buff = iconv.decode(fs.readFileSync(fileName), 'win1252');

	var lineas = buff.toString().split('\n');

	lineas = _.reject(lineas, function (linea) {
		return linea.trim().length < 1;
	});

	var array = lineas.map(function(element){
		return element
			.split(separator)
				.map(function(element){
					return element.trim();
				});
	});

	if (addLineNumbers){
		for (var i = 0; i < array.length; i++) {
			array[i] = [i+1].concat(array[i]);
		};		
	}

	return array;
}

function saveToFile (fileName, array) {	
	var lineas = array.map(function (row) {
		return row.join(';')
	});

	lineas = lineas.join('\n');

	var buf = iconv.encode(lineas, 'win1252');

	return fs.writeFileSync(fileName, buf, 'utf8');
}

function existeLineaEnDoppler (lineaFava, arrayDoppler) {
	return _.find(arrayDoppler, function(lineaAct){
		return parseInt(lineaFava[0]) === parseInt(lineaAct[0]);
	});
}

var arrayFava = fileToArray('fava.csv', ';', true);
var titulosFava = _.first(arrayFava);
var datosFava = _.rest(arrayFava);

var arrayDoppler = fileToArray('doppler.csv', ',', false);
var titulosDoppler = _.first(arrayDoppler);
var datosDoppler = _.rest(arrayDoppler);

//Reporte OK
var reporteOK = [];
reporteOK.push(_.rest(titulosFava.concat(['OK'])));

var lineasOK = _.reject(datosFava, function(lineaFava){
	return existeLineaEnDoppler(lineaFava, datosDoppler);;
});

for (var i = 0; i < lineasOK.length; i++) {
	reporteOK.push(_.rest(lineasOK[i].concat('OK')));
};

saveToFile('ReporteOK.csv', reporteOK);

//Reporte Error
var reporteError = [];
reporteError.push(_.rest(titulosFava.concat(_.last(titulosDoppler))));

var lineasError = _.filter(datosFava, function(lineaFava){
	return existeLineaEnDoppler(lineaFava, datosDoppler);;
});

for (var i = 0; i < lineasError.length; i++) {
	var errorDesc = _.last(datosDoppler[i]);

	reporteError.push(_.rest(lineasError[i].concat([errorDesc])));
};

saveToFile('ReporteError.csv', reporteError);

console.log('Subscriptores: ', datosFava.length);
console.log('Ok: ', lineasOK.length);
console.log('Errores: ', lineasError.length);