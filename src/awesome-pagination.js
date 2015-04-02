(function () {
    'use strict';

    angular
        .module('awesomeList')
        .directive('awesomePagination', awesomePagination);

    function awesomePagination() {
        return {
            require: '^awesomeList',
            scope: {
                perPage: '=?',
                chomp: '@?'
            },
            replace: true,
            template: `
                <ul class="awesome-pagination">
                    <li ng-class="{ disabled: curPage <= 0 }">
                        <span ng-click="jump(curPage - 1)">&laquo;</span>
                    </li>
                    <li class="chomped" ng-show="chompPages && chompStart">
                        <span>&hellip;</span>
                    </li>
                    <li ng-repeat="page in pages" ng-class="{ active: curPage == page }">
                        <span ng-click="jump(page)">{{ page + 1 }}</span>
                    </li>
                    <li class="chomped" ng-show="chompPages && chompEnd">
                        <span>&hellip;</span>
                    </li>
                    <li ng-class="{ disabled: curPage >= pageCount - 1 }">
                        <span ng-click="jump(curPage + 1)">&raquo;</span>
                    </li>
                </ul>
            `,
            link: linkFn
        };

        function linkFn(scope, elem, attrs, ctrl) {
            scope.chompPages = false;
            scope.curPage = ctrl.page = 0;
            ctrl.perPage = scope.perPage || 10;

            if (attrs.chomp) {
                scope.chompPages = true;
            }

            scope.jump = setPage;

            scope.$watch('perPage', perPage => perPage && (ctrl.perPage = scope.perPage = perPage));
            scope.$watch(() => [ctrl.filtered.length, scope.perPage].join('|'), render);
            if (scope.chompPages) scope.$watch(() => enforcePageBounds(scope.curPage), render);

            function render() {
                scope.pageCount = Math.ceil(ctrl.filtered.length / ctrl.perPage);

                var start = 0;
                var end = scope.pageCount;
                if (scope.chompPages) {
                    start = Math.max(0, Math.min(scope.pageCount - scope.chomp, scope.curPage - Math.floor(scope.chomp / 2)));
                    scope.chompStart = start > 0;

                    end = Math.min(scope.pageCount, start + (scope.chomp * 1));
                    scope.chompEnd = end < scope.pageCount;
                }

                scope.pages = range(start, end);

                setPage(ctrl.page);
            }

            function setPage(page) {
                scope.curPage = ctrl.page = enforcePageBounds(page);
            }

            function enforcePageBounds(page) {
                // ensure current page is within bounds, 0 >= page < pageCount
                if (page < 0) page = 0;
                else if (page > 0 && page >= scope.pageCount) page = scope.pageCount - 1;
                return page;
            }

            function range(start, end) {
                var ret = [];
                for (let i = start; i < end; i++) ret.push(i);
                return ret;
            }
        }
    }
})();
