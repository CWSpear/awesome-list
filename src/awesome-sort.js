(function () {
    'use strict';

    angular
        .module('awesomeList')
        .directive('awesomeSort', awesomeSort);

    function awesomeSort() {
        const SORTED_CLASS = 'awesome-sorted';
        const SORTED_CLASS_REVERSE = 'awesome-sorted-reverse';
        const SORTABLE_CLASS = 'awesome-sortable';

        return {
            require: '^awesomeList',
            scope: {},
            controller: controllerFn,
            link: linkFn
        };

        function controllerFn($scope, $element) {
            // we listen to the parent to broadcast so we're only
            // resetting the awesomeSort classes in this awesomeList
            $scope.$on('awesomeSort.resetClass', function () {
                $element.removeClass(`${SORTED_CLASS} ${SORTED_CLASS_REVERSE}`);
            });
        }

        function linkFn(scope, elem, attrs, ctrl) {
            elem.addClass(SORTABLE_CLASS);

            if (ctrl.sort === attrs.awesomeSort) {
                sortAsc();
            } else if (ctrl.sort === `-${attrs.awesomeSort}`) {
                ctrl.sort = attrs.awesomeSort;
                sortDesc();
            }

            elem.bind('click', function () {
                scope.$apply(function () {
                    if (ctrl.sort == attrs.awesomeSort) sortDesc();
                    else sortAsc();
                });
            });

            function sortDesc() {
                ctrl.reverse = !ctrl.reverse;
                // we probably have SORTED_CLASS already applied, but there are
                // some edge cases where we don't, and this doesn't hurt to re-apply
                elem.addClass(SORTED_CLASS);
                elem.toggleClass(SORTED_CLASS_REVERSE, ctrl.reverse);

                ctrl.$render();
            }

            function sortAsc() {
                ctrl.reverse = false;
                ctrl.sort = attrs.awesomeSort;
                // this triggers broadcast('awesomeSort.resetClass')
                ctrl.resetSortClasses();
                elem.addClass(SORTED_CLASS);

                ctrl.$render();
            }
        }
    }
})();
