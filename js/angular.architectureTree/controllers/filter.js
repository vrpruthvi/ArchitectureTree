angular.module('ChartsApp').controller('filterCtrl', function ($scope, bus) {
    'use strict';

    var technosFilter = [];
    var hostsFilter = [];
    var stagesFilter = [];
    var container = angular.element(document.querySelector('#panel'));

    bus.on('updateData', function(data) {
        $scope.technos = computeTechnos(data);
        $scope.hosts = computeHosts(data);
    });

    bus.on('updateStages', function(stages) {
        $scope.stages = angular.copy(stages);
        bus.emit('stagesFilterChange', stagesFilter);
    });

    $scope.nameFilter = '';

    $scope.$watch('nameFilter', function(name) {
        bus.emit('nameFilterChange', name);
    });

    $scope.toggleTechnoFilter = function(techno) {
        if ($scope.isTechnoInFilter(techno)) {
            technosFilter.splice(technosFilter.indexOf(techno), 1);
        } else {
            technosFilter.push(techno);
        }
        bus.emit('technosFilterChange', technosFilter);
    };

    $scope.isTechnoInFilter = function(techno) {
        return technosFilter.indexOf(techno) !== -1;
    };

    $scope.toggleHostFilter = function(host) {
        if ($scope.isHostInFilter(host)) {
            hostsFilter.splice(hostsFilter.indexOf(host), 1);
        } else {
            hostsFilter.push(host);
        }
        bus.emit('hostsFilterChange', hostsFilter);
    };

    $scope.toggleStageFilter = function(stage) {
        if ($scope.isStageInFilter(stage)) {
            stagesFilter.splice(stagesFilter.indexOf(stage), 1);
        } else {
            stagesFilter.push(stage);
        }
        bus.emit('stagesFilterChange', stagesFilter);
    }

    $scope.isHostInFilter = function(host) {
        return hostsFilter.indexOf(host) !== -1;
    };

    $scope.isStageInFilter = function(stage) {
        return stagesFilter.indexOf(stage) !== -1;
    }

    function computeTechnos(rootNode) {
        var technos = [];

        function addNodeTechnos(node) {
            if (node.technos) {
                technos[node.technos] = true;
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeTechnos(childNode);
                });
            }
        }

        addNodeTechnos(rootNode);

        return Object.keys(technos).sort();
    }

    function computeHosts(rootNode) {
        var hosts = {};

        function addNodeHosts(node) {
            if (node.host) {
                hosts[node.host] = true;
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeHosts(childNode);
                });
            }
        }

        addNodeHosts(rootNode);

        return Object.keys(hosts).sort();
    }

    var toggleNode = function(event, name) {
        $scope.node = getNodeByName(event ? event.detail : name, $scope.data);
        if ($scope.node._children || ($scope.node.children && $scope.node.children.length > 0)) {
            data.toggleNode($scope.node.name);
            $timeout(function() {
                data.emitRefresh();
            });
        }
    }

    // container.on('selectNode', function(event) {
    //     $scope.toggleStageFilter(event.detail);
    // });

});
