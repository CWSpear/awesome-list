(function () {
    'use strict';

    angular
        .module('awesomeList')
        .directive('awesomePagination', awesomePagination);

    function awesomePagination() {
        return {
            require: '^awesomeList',
            scope: {},
            template: `
                <div class="awesome-pagination">
                    <span ng-click="jump(curPage - 1)">&laquo;</span>
                    <span ng-click="jump(page)" ng-repeat="page in pages" ng-class="{ selected: curPage == page }">{{ page + 1 }}</span>
                    <span ng-click="jump(curPage + 1)">&raquo;</span>
                </div>
            `,
            link: linkFn
        };

        function linkFn(scope, elem, attrs, ctrl) {
            scope.curPage = ctrl.page = 0;
            ctrl.perPage = 10;

            scope.jump = setPage;

            scope.$watch(() => ctrl.filtered.length, len => {
                scope.pageCount = Math.ceil(len / ctrl.perPage);
                scope.pages = range(0, scope.pageCount);

                setPage(ctrl.page);
            });

            function setPage(page) {
                // ensure current page is within bounds, 0 >= page < pageCount
                if (page < 0) page = 0;
                else if (page >= scope.pageCount) page = scope.pageCount - 1;
                scope.curPage = ctrl.page = page;
            }

            function range(start, end) {
                var ret = [];
                for (let i = start; i < end; i++) ret.push(i);
                return ret;
            }
        }
    }
})();
