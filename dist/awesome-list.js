"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

(function () {
    "use strict";

    angular.module("awesomeList", []).directive("awesomeList", awesomeList);

    function awesomeList($filter, $parse) {
        controllerFn.$inject = ["$scope", "$attrs"];
        return {
            scope: { items: "=", displayed: "=" },
            // that word you use... I do not think it means what you think it means
            transclude: true,
            replace: true,
            template: "<div class=\"awesome-list\" ng-transclude></div>",
            controller: controllerFn,
            // we don't actually use this in the template, but it's needed for bindToController
            controllerAs: "awl",
            // this makes it easier to work with the controller in other directives
            bindToController: true
        };

        function controllerFn($scope, $attrs) {
            var _this = this;

            this.page = 0;
            this.perPage = -1;
            this.resetSortClasses = resetSortClasses;

            $scope.$watch(function () {
                // not sure if there's a better way to do this than to just listen to everything!
                return [_this.items, _this.search, _this.sort, _this.reverse, _this.page, _this.perPage];
            }, function (_ref) {
                var _ref2 = _slicedToArray(_ref, 6);

                var items = _ref2[0];
                var search = _ref2[1];
                var sort = _ref2[2];
                var reverse = _ref2[3];
                var page = _ref2[4];
                var perPage = _ref2[5];

                var filtered = $filter("filter")(items, search) || [];

                _this.filtered = $filter("orderBy")(filtered, sort, reverse);

                var start = page * perPage;
                var end = start + perPage;
                _this.displayed = _this.filtered.slice(start, end);
            }, true);

            function resetSortClasses() {
                // this ensures we're only resetting the classes of *this* directive's children.
                // that way, we can have multiple awesomeLists on one page
                $scope.$broadcast("awesomeSort.resetClass");
            }
        }
    }
    awesomeList.$inject = ["$filter", "$parse"];
})();

(function () {
    "use strict";

    angular.module("awesomeList").directive("awesomePagination", awesomePagination);

    function awesomePagination() {
        return {
            require: "^awesomeList",
            scope: {},
            template: "\n                <div class=\"awesome-pagination\">\n                    <span ng-click=\"jump(curPage - 1)\">&laquo;</span>\n                    <span ng-click=\"jump(page)\" ng-repeat=\"page in pages\" ng-class=\"{ selected: curPage == page }\">{{ page + 1 }}</span>\n                    <span ng-click=\"jump(curPage + 1)\">&raquo;</span>\n                </div>\n            ",
            link: linkFn
        };

        function linkFn(scope, elem, attrs, ctrl) {
            scope.curPage = ctrl.page = 0;
            ctrl.perPage = 10;

            scope.jump = setPage;

            scope.$watch(function () {
                return ctrl.filtered.length;
            }, function (len) {
                scope.pageCount = Math.ceil(len / ctrl.perPage);
                scope.pages = range(0, scope.pageCount);

                setPage(ctrl.page);
            });

            function setPage(page) {
                // ensure current page is within bounds, 0 >= page < pageCount
                if (page < 0) page = 0;else if (page >= scope.pageCount) page = scope.pageCount - 1;
                scope.curPage = ctrl.page = page;
            }

            function range(start, end) {
                var ret = [];
                for (var i = start; i < end; i++) {
                    ret.push(i);
                }return ret;
            }
        }
    }
})();

(function () {
    "use strict";

    angular.module("awesomeList").directive("awesomeSearch", awesomeSearch);

    function awesomeSearch() {
        return {
            require: "^awesomeList",
            scope: {},
            replace: true,
            template: "<input placeholder=\"Search\" type=\"search\" class=\"awesome-search\" ng-model=\"search\" ng-change=\"update(search)\">",
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

(function () {
    "use strict";

    angular.module("awesomeList").directive("awesomeSort", awesomeSort);

    function awesomeSort() {
        var SORTED_CLASS = "awesome-sorted";
        var SORTED_CLASS_REVERSE = "awesome-sorted-reverse";
        var SORTABLE_CLASS = "awesome-sortable";

        controllerFn.$inject = ["$scope", "$element"];
        return {
            require: "^awesomeList",
            scope: {},
            controller: controllerFn,
            link: linkFn
        };

        function controllerFn($scope, $element) {
            // we listen to the parent to broadcast so we're only
            // resetting the awesomeSort classes in this awesomeList
            $scope.$on("awesomeSort.resetClass", function () {
                $element.removeClass("" + SORTED_CLASS + " " + SORTED_CLASS_REVERSE);
            });
        }

        function linkFn(scope, elem, attrs, listCtrl) {
            elem.addClass(SORTABLE_CLASS);

            elem.bind("click", function () {
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