(function () {
    'use strict';

    angular
        .module('awesomeList', [])
        .directive('awesomeList', awesomeList);

    function awesomeList($filter, $parse) {
        return {
            scope: { items: '=', displayed: '=' },
            // that word you use... I do not think it means what you think it means
            transclude: true,
            replace: true,
            template: '<div class="awesome-list" ng-transclude></div>',
            controller: controllerFn,
            // we don't actually use this in the template, but it's needed for bindToController
            controllerAs: 'awl',
            // this makes it easier to work with the controller in other directives
            bindToController: true
        };

        function controllerFn($scope, $attrs) {
            this.page = 0;
            this.perPage = -1;
            this.resetSortClasses = resetSortClasses;

            $scope.$watch(() => {
                // not sure if there's a better way to do this than to just listen to everything!
                return [this.items, this.search, this.sort, this.reverse, this.page, this.perPage];
            }, ([items, search, sort, reverse, page, perPage]) => {
                var filtered = $filter('filter')(items, search) || [];

                this.filtered = $filter('orderBy')(filtered, sort, reverse);

                var start = page * perPage;
                var end   = start + perPage;
                this.displayed = this.filtered.slice(start, end);
            }, true);

            function resetSortClasses() {
                // this ensures we're only resetting the classes of *this* directive's children.
                // that way, we can have multiple awesomeLists on one page
                $scope.$broadcast('awesomeSort.resetClass');
            }
        }
    }
})();
