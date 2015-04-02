"use strict";

(function () {
    "use strict";

    angular.module("awesomeList", []).directive("awesomeList", awesomeList);

    function awesomeList($filter, $parse) {
        controllerFn.$inject = ["$scope", "$attrs", "$parse"];
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

        function controllerFn($scope, $attrs, $parse) {
            var _this = this;

            this.page = 0;
            this.perPage = -1;
            this.resetSortClasses = resetSortClasses;
            this.sort = $attrs.initialSort;

            $scope.$watch(function () {
                // if no list, we don't need to do anything here
                if (!(_this.items || []).length) return null;
                return [(_this.items || []).length, _this.search, _this.sort, _this.reverse, _this.page, _this.perPage, (_this.searchFields || []).join("|")].join("|");
            }, function (val, oldVal) {
                var filtered = filterItems(_this.items, _this.search, _this.searchFields, _this.searchFn) || [];

                _this.filtered = $filter("orderBy")(filtered, _this.sort, _this.reverse);

                var start = _this.page * _this.perPage;
                var end = start + _this.perPage;
                _this.displayed = _this.filtered.slice(start, end);
            }, true);

            function resetSortClasses() {
                // this ensures we're only resetting the classes of *this* directive's children.
                // that way, we can have multiple awesomeLists on one page
                $scope.$broadcast("awesomeSort.resetClass");
            }

            function filterItems(items, search, fields, fn) {
                search = (search || "").toLowerCase();

                if (!fields && !fn) {
                    // search all fields
                    return $filter("filter")(items, search) || [];
                } else if (fields) {
                    // if no search term, return all items
                    if (!search) {
                        return items;
                    } // only search the specified fields
                    return $filter("filter")(items, function (item) {
                        // see if any of the fields contain the str
                        return fields.some(function (field) {
                            field = ($parse(field)(item) || "").toLowerCase();
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
    awesomeList.$inject = ["$filter", "$parse"];
})();

(function () {
    "use strict";

    angular.module("awesomeList").directive("awesomePagination", awesomePagination);

    function awesomePagination() {
        return {
            require: "^awesomeList",
            scope: {
                perPage: "=?",
                chomp: "@?"
            },
            replace: true,
            template: "\n                <ul class=\"awesome-pagination\">\n                    <li ng-class=\"{ disabled: curPage <= 0 }\">\n                        <span ng-click=\"jump(curPage - 1)\">&laquo;</span>\n                    </li>\n                    <li class=\"chomped\" ng-show=\"chompPages && chompStart\">\n                        <span>&hellip;</span>\n                    </li>\n                    <li ng-repeat=\"page in pages\" ng-class=\"{ active: curPage == page }\">\n                        <span ng-click=\"jump(page)\">{{ page + 1 }}</span>\n                    </li>\n                    <li class=\"chomped\" ng-show=\"chompPages && chompEnd\">\n                        <span>&hellip;</span>\n                    </li>\n                    <li ng-class=\"{ disabled: curPage >= pageCount - 1 }\">\n                        <span ng-click=\"jump(curPage + 1)\">&raquo;</span>\n                    </li>\n                </ul>\n            ",
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

            scope.$watch("perPage", function (perPage) {
                return perPage && (ctrl.perPage = scope.perPage = perPage);
            });
            scope.$watch(function () {
                return [ctrl.filtered.length, scope.perPage].join("|");
            }, render);
            if (scope.chompPages) scope.$watch(function () {
                return enforcePageBounds(scope.perPage);
            }, render);

            function render() {
                scope.pageCount = Math.ceil(ctrl.filtered.length / ctrl.perPage);

                var start = 0;
                var end = scope.pageCount;
                if (scope.chompPages) {
                    start = Math.max(0, Math.min(scope.pageCount - scope.chomp, scope.curPage - Math.floor(scope.chomp / 2)));
                    scope.chompStart = start > 0;

                    end = Math.min(scope.pageCount, start + scope.chomp * 1);
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
                if (page < 0) page = 0;else if (page >= scope.pageCount) page = scope.pageCount - 1;
                return page;
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
            scope: {
                searchFields: "=?",
                searchFn: "&?"
            },
            replace: true,
            template: "<input placeholder=\"Search\" type=\"search\" class=\"awesome-search\" ng-model=\"search\" ng-change=\"update(search)\" />",
            link: linkFn };

        function linkFn(scope, elem, attrs, ctrl) {
            // using an ng-change instead of a $watch for performance
            scope.update = function (search) {
                ctrl.search = search;
            };

            if (scope.searchFields && scope.searchFn) {
                throw "awesomeSearch Directive: Attributes [searchFields] and [searchFn] are mutually exclusive. Use one or the other.";
            }

            if (scope.searchFn) {
                ctrl.searchFn = scope.searchFn;
            } else if (scope.searchFields) {
                scope.$watch("searchFields", function (fields) {
                    return ctrl.searchFields = fields;
                });
            }
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

            if (listCtrl.sort === attrs.awesomeSort) {
                sortAsc();
            } else if (listCtrl.sort === "-" + attrs.awesomeSort) {
                listCtrl.sort = attrs.awesomeSort;
                sortDesc();
            }

            elem.bind("click", function () {
                scope.$apply(function () {
                    if (listCtrl.sort == attrs.awesomeSort) sortDesc();else sortAsc();
                });
            });

            function sortDesc() {
                listCtrl.reverse = !listCtrl.reverse;
                // we probably have SORTED_CLASS already applied, but there are
                // some edge cases where we don't, and this doesn't hurt to re-apply
                elem.addClass(SORTED_CLASS);
                elem.toggleClass(SORTED_CLASS_REVERSE, listCtrl.reverse);
            }

            function sortAsc() {
                listCtrl.reverse = false;
                listCtrl.sort = attrs.awesomeSort;
                // this triggers broadcast('awesomeSort.resetClass')
                listCtrl.resetSortClasses();
                elem.addClass(SORTED_CLASS);
            }
        }
    }
})();