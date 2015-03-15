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

        function linkFn(scope, elem, attrs, listCtrl) {
            elem.addClass(SORTABLE_CLASS);

            elem.bind('click', function () {
                scope.$apply(function () {
                    if (listCtrl.sort == attrs.awesomeSort) {
                        listCtrl.reverse = !listCtrl.reverse;
                        elem.toggleClass(SORTED_CLASS_REVERSE, listCtrl.reverse);
                    } else {
                        listCtrl.reverse = false;
                        listCtrl.sort = attrs.awesomeSort;
                        // this triggers broadcast('awesomeSort.resetClass')
                        listCtrl.resetSortClasses();
                        elem.addClass(SORTED_CLASS);
                    }
                });
            });
        }
    }
})();
