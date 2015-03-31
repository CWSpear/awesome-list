(function () {
    'use strict';

    angular
        .module('awesomeList')
        .directive('awesomeSearch', awesomeSearch);

    function awesomeSearch($parse) {
        return {
            require: '^awesomeList',
            scope: {
                searchFields: '=?',
                searchFn: '&?',
            },
            replace: true,
            template: '<input placeholder="Search" type="search" class="awesome-search" ng-model="search" ng-change="update(search)">',
            link: linkFn,
        };

        function linkFn(scope, elem, attrs, ctrl) {
            // using an ng-change instead of a $watch for performance
            scope.update = function (search) {
                ctrl.search = search;
            };

            if (scope.searchFields && scope.searchFn) {
                throw 'awesomeSearch Directive: Attributes [searchFields] and [searchFn] are mutually exclusive. Use one or the other.';
            }

            if (scope.searchFn) {
                ctrl.searchFn = scope.searchFn;
            } else if (scope.searchFields) {
                scope.$watch('searchFields', fields => ctrl.searchFields = fields);
            }
        }
    }
})();
