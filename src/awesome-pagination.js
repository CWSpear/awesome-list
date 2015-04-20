(function () {
    'use strict';

    angular
        .module('awesomeList')
        .directive('awesomePagination', awesomePagination);

    function awesomePagination(awesomeOptions) {
        return {
            require: '^awesomeList',
            scope: {
                pageSize: '=?',
                chomp: '@?',
            },
            replace: true,
            template: `
                <ul class="awesome-pagination">
                    <li ng-class="{ disabled: curPage <= 0 }">
                        <span ng-click="jump(curPage - 1)">{{:: paginationPrev }}</span>
                    </li>
                    <li class="chomped" ng-if="chompPages && chompStart">
                        <span>&hellip;</span>
                    </li>
                    <li ng-repeat="page in pages" ng-class="{ active: curPage == page }">
                        <span ng-click="jump(page)">{{:: page + 1 }}</span>
                    </li>
                    <li class="chomped" ng-if="chompPages && chompEnd">
                        <span>&hellip;</span>
                    </li>
                    <li ng-class="{ disabled: curPage >= pageCount - 1 }">
                        <span ng-click="jump(curPage + 1)">{{:: paginationNext }}</span>
                    </li>
                </ul>
            `,
            link: linkFn,
        };

        function linkFn(scope, elem, attrs, ctrl) {
            scope.paginationPrev = awesomeOptions.paginationPrev;
            scope.paginationNext = awesomeOptions.paginationNext;

            scope.chompPages = false;
            scope.curPage = ctrl.page = 0;
            ctrl.pageSize = (scope.pageSize = scope.pageSize || awesomeOptions.pageSize);

            if (attrs.chomp || awesomeOptions.chomp) {
                scope.chompPages = true;
                scope.chomp = scope.chomp || awesomeOptions.chomp;
            }

            scope.jump = setPage;

            scope.$watch('pageSize', pageSize => pageSize && (ctrl.pageSize = scope.pageSize = pageSize) && ctrl.$render({ filter: false, sort: false }));
            scope.$watch(() => [ctrl.filtered.length, scope.pageSize].join('|'), render);
            scope.$watch(() => enforcePageBounds(scope.curPage), render);

            function render() {
                scope.pageCount = Math.ceil(ctrl.filtered.length / ctrl.pageSize);

                let start = 0;
                let end = scope.pageCount;
                if (scope.chompPages) [start, end] = findChompEnds();

                scope.pages = range(start, end);

                setPage(ctrl.page);

                ctrl.$render({ filter: false, sort: false });
            }

            function findChompEnds() {
                let start = Math.max(0, Math.min(scope.pageCount - scope.chomp, scope.curPage - Math.floor(scope.chomp / 2)));
                scope.chompStart = start > 0;

                let end = Math.min(scope.pageCount, start + (scope.chomp * 1));
                scope.chompEnd = end < scope.pageCount;

                return [start, end];
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
                let ret = [];
                for (let i = start; i < end; i++) ret.push(i);
                return ret;
            }
        }
    }
})();
