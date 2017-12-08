angular.module('ChartsApp').controller('panelCtrl', function ($scope, $timeout, $window, data, bus) {
    'use strict';

    var container = angular.element(document.querySelector('#panel')),
        graph = document.querySelector('#graph');

    bus.on('updateData', function(data) {
        var clonedData = angular.copy(data);
        $scope.data = formatData(clonedData);
    });

    function formatData(data) {

        var addParent = function(node) {
            if (node.children) {
                node.children.forEach(function(childNode) {
                    childNode.parent = node;
                    addParent(childNode);
                });
            }
        };

        var addDependents = function(node) {
            if (node.dependsOn) {
                node.dependsOn.forEach(function(dependsOn) {
                    var dependency = getNodeByName(dependsOn, data);
                    if (!dependency) {
                        console.log('Dependency', dependsOn, 'not found for node', node);
                        return;
                    }
                    if (!dependency.dependents) {
                        dependency.dependents = [];
                    }
                    dependency.dependents.push(node.name);
                });
            }
            if (node.children) {
                node.children.map(addDependents);
            }
        };

        var addDetails = function(node) {
            addDetailsForNode(node);
            if (node.children) {
                node.children.map(addDetails);
            }
        };

        /**
         * Add details to a node, including inherited ones (shown between parentheses).
         *
         * Mutates the given node.
         *
         * Example added properties:
         * {
         *   details: {
         *     Dependencies: ["Foo", "Bar (Babar)"],
         *     Dependents: ["Baz", "Buzz"];
         *     Technos: ["Foo", "Bar (Babar)" }
         *     Host: ["OVH", "fo (Foo)"]
         *   }
         * }
         */
        var addDetailsForNode = function(node) {
            node.details = {};
            var dependsOn = getDetailCascade(node, 'dependsOn');
            if (dependsOn.length > 0) {
                node.details.Dependencies = dependsOn.map(getValueAndAncestor);
            }
            if (node.dependents) {
                node.details.Dependents = node.dependents;
            }
            var technos = getDetailCascade(node, 'technos');
            if (technos.length > 0) {
                node.details.Technos = technos.map(getValueAndAncestor);
            }
            if (node.host) {
                node.details.Host = [];
                for (var i in node.host) {
                    node.details.Host.push(i);
                }
            }

            return node;
        };

        var getDetailCascade = function(node, detailName, via) {
            var values = [];
            if (node[detailName]) {
                values.push({ value: node[detailName], via: via });
            }
            if (node.parent) {
                values = values.concat(getDetailCascade(node.parent, detailName, node.parent.name));
            }
            return values;
        };

        var getValueAndAncestor = function(detail) {
            return detail.via ? detail.value + ' (' + detail.via + ')' : detail.value;
        };

        addParent(data);
        addDependents(data);
        addDetails(data);

        return data;
    }


    /**
     * Returns the node path
     * @param {Object} d
     * @returns {Array}
     */
    var getNodePath = function(node) {
        var path = [],
            current = node;

        do {
            path.push(current.name);
            current = current.parent;
        } while (typeof(current) !== 'undefined');

        return path.reverse();
    };

    var getNodeByName = function(id, data) {
        if (data.id === id) {
            return data;
        }
        if (!data.children) return null;
        for (var i = data.children.length - 1; i >= 0; i--) {
            var matchingNode = getNodeByName(id, data.children[i]);
            if (matchingNode) return matchingNode;
        }
    };

    // Events
    container
        .on('hoverNode', function(event) {
            $scope.node = getNodeByName(event.detail, $scope.data);
            $scope.detail = true;
            $scope.edit = false;
            $scope.$digest();
        })
        // .on('selectNode', function(event) {
        //     console.log(event)
        //     toggleNode(event);
        //     $scope.enterEdit(event.detail);
        //     $scope.$digest();
        // })
        // .on('unSelectNode', function(event) {
        //     if ($scope.edit) {
        //         $scope.leaveEdit();
        //         $scope.$digest();
        //     }
        // });
});
