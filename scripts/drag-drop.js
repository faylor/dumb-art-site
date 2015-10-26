var module = angular.module("lvl.directives.dragdrop", ['lvl.services']);

module.directive('lvlDraggable', ['$rootScope', 'uuid', function ($rootScope, uuid) {
    return {
        restrict: 'A',
        templateUrl:'/components/admin/painting-dragable.html',
        link: function (scope, el, attrs, controller) {
            angular.element(el).attr("draggable", "true");
            var id = attrs.id;
            //This below was recommended by above seems ok.. not sure why the observe is needed...
            //attrs.$observe('id', function(id) {
            //  console.log("b:"+id);
            //});

            el[0].addEventListener("dragstart",function (e) {
                e.dataTransfer.setData('text', id);
                console.log('draggable directive drag');
                $rootScope.$emit("LVL-DRAG-START");
            });

            el[0].addEventListener("dragend", function (e) {
                $rootScope.$emit("LVL-DRAG-END");
            });
        }
    };
}]);

module.directive('lvlDropTarget', ['$rootScope', 'uuid', function ($rootScope, uuid) {
    return {
        restrict: 'A',
        scope: {
            onDrop: '&'
        },
        template: "<div x-lvl-draggable='true' id='{{ painting._id }}'/>",
        link: function (scope, el, attrs, controller) {
            var id = attrs.id;
            //el.bind("dragover",
            el[0].addEventListener("dragover", function (e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
                return false;
            });

            el[0].addEventListener("dragenter", function (e) {
                // this / e.target is the current hover target.
                angular.element(e.target).addClass('lvl-over');
            });

            el[0].addEventListener("dragleave", function (e) {
                angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
            });

            el[0].addEventListener("drop", function (e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                if (e.stopPropagation) {
                    e.stopPropagation(); // Necessary. Allows us to drop.
                }
                var dragID = e.dataTransfer.getData("text");

                scope.onDrop({dragID: dragID, dropID: id});
            });

            $rootScope.$on("LVL-DRAG-START", function () {
                var el = document.getElementById(id);
                angular.element(el).addClass("lvl-target");
            });

            $rootScope.$on("LVL-DRAG-END", function () {
                var el = document.getElementById(id);
                angular.element(el).removeClass("lvl-target");
                angular.element(el).removeClass("lvl-over");
            });
        }
    };
}]);
