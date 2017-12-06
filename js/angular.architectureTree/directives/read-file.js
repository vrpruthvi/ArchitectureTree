angular.module('ChartsApp').directive("readFile", [function () {
    return {
        link: function (scope, element, attributes) {
            element.bind("change", function(e){
                scope[attributes.readFile](e);
            });
        }
    }
}]);
