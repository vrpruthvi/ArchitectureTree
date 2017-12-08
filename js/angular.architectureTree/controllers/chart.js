angular.module('ChartsApp').controller('chartCtrl', function ($scope, bus, data) {
    'use strict';

    var stages = [];
	var datas = [];
	var stageCategory = ["RTOB Stage", "RWB SF Stage"];
	var fieldType = "Component Type";
	var fieldName = "LOV Field Name";
	var fieldCategory = ["RWB Category", "RWB SF Category"];

    bus.on('updateData', function(data) {
        $scope.data = angular.copy(data);
    });

    $scope.filePicked = function(oEvent) {
        // Get The File From The Input
        var oFile = oEvent.target.files[0];
        var sFilename = oFile.name;
        // Create A File Reader HTML5
        var reader = new FileReader();
        
        // Ready The Event For When A File Gets Selected
        reader.onload = function(e) {
            var file = e.target.result;
            var cfb = XLSX.read(file, {type: 'binary'});
            cfb.SheetNames.forEach(function(sheetName) {
                if (sheetName.indexOf("RTOB") > -1) {
                	stages = [];
                	// Obtain The Current Row As Object
                	console.log(sheetName);
	                var oJS = XLS.utils.sheet_to_json(cfb.Sheets[sheetName]);
	                parseObject(sheetName, oJS);
                }
            });
            bus.emit('updateStages', stages);
            $scope.$apply(function(){
            	data.setJsonData(datas[0]);
            });
        };

        // Tell JS To Start Reading The File
        reader.readAsBinaryString(oFile);
    }

	// parse excel object to json
    var parseObject = function(sheetName, obj) {
    	datas[datas.length] = {
    		name: sheetName,
    		children: []
    	};
    	obj.forEach(function(item){
    		parseItem(item, datas.length - 1);
    	});
    }

    var parseItem = function(item, index) {
    	// create stage if not present
    	var field = {
            id: item.__rowNum__,
    		name: item[fieldName],
    		technos: item[fieldType]
    	};
        field = Object.assign({}, field, item);
    	fieldCategory.forEach(function(category, i) {
    		if(item[category]) {
    			field.host = item[category]
	    		checkStage(item, index);
    			pushItem(field, item[stageCategory[i]], index);
    		}
    	});
    }

    var checkStage = function(item, index) {
    	stageCategory.forEach(function(category) {
    		if (item[category] && stages.indexOf(item[category]) === -1) {
	    		createStage(item, category, index);
	    	}
    	});
    }

    var createStage = function(item, category, index) {
    	stages.push(item[category]);
    	var stage = {
    		name: item[category],
    		children: []
    	}
    	datas[index].children.push(stage);
    }

    var pushItem = function(field, category, index) {
    	datas[index].children.forEach(function(stage, i) {
    		if (stage.name === category) {
    			datas[index].children[i].children.push(field);
    		}
    	});

    }
});
