(function () {
    'use strict';

    angular
        .module('awesomeList')
        .directive('awesomeSearch', awesomeSearch);

    function awesomeSearch() {
        return {
            require: '^awesomeList',
            scope: {},
            replace: true,
            template: '<input placeholder="Search" type="search" class="awesome-search" ng-model="search" ng-change="update(search)">',
            link: linkFn
        };

        function linkFn(scope, elem, attrs, ctrl) {
            // using an ng-change instead of a $watch for performance
            scope.update = function (search) {
                ctrl.search = search;
            };
        }
    }
})();
