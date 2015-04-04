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

        function controllerFn($scope, $attrs, $parse) {
            this.page = 0;
            this.pageSize = -1;
            this.resetSortClasses = resetSortClasses;
            this.sort = $attrs.initialSort;

            this.$render = render.bind(this);

            // allow outside sources to trigger a render (i.e. when you update an item in list)
            $scope.$on('awesomeList.render', this.$render);

            $scope.$watch(() => {
                // if no list, we don't need to do anything here
                if (!(this.items || []).length) return null;
                return [(this.items || []).length, this.search, this.sort, this.reverse, this.page, this.pageSize, (this.searchFields || []).join('|')].join('|');
            }, this.$render);

            function render() {
                let filtered = filterItems(this.items, this.search, this.searchFields, this.searchFn) || [];

                this.filtered = $filter('orderBy')(filtered, this.sort, this.reverse);

                let start = this.page * this.pageSize;
                let end   = start + this.pageSize;
                this.displayed = this.filtered.slice(start, end);
            }

            function resetSortClasses() {
                // this ensures we're only resetting the classes of *this* directive's children.
                // that way, we can have multiple awesomeLists on one page
                $scope.$broadcast('awesomeSort.resetClass');
            }

            function filterItems(items, search, fields, fn) {
                search = (search || '').toLowerCase();

                if (!fields && !fn) {
                    // search all fields
                    return $filter('filter')(items, search) || [];
                } else if (fields) {
                    // if no search term, return all items
                    if (!search) return items;

                    // only search the specified fields
                    return $filter('filter')(items, item => {
                        // see if any of the fields contain the str
                        return fields.some(field => {
                            field = ($parse(field)(item) || '').toLowerCase();
                            return field.indexOf(search) > -1;
                        });
                    });
                } else {
                    // experimental; signature *very* likely to change
                    return fn(items, search) || [];
                }
            }
        }
    }
})();
