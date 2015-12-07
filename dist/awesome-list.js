'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('awesomeList', []).directive('awesomeList', awesomeList);

    function awesomeList($filter, $parse) {
        controllerFn.$inject = ["$scope", "$attrs", "$parse"];
        return {
            scope: { items: '=', displayed: '=', filtered: '=?', additionalFilters: '=?' },
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
            var _this = this;

            this.page = 0;
            this.pageSize = -1;
            this.resetSortClasses = resetSortClasses;
            this.sort = $attrs.initialSort;

            this.$render = render.bind(this);

            // allow outside sources to trigger a render (i.e. when you update an item in list)
            $scope.$on('awesomeList.render', this.$render);

            // watch the list length
            $scope.$watch(function () {
                return (_this.items || []).length;
            }, this.$render);
            $scope.$watch(function () {
                return _this.additionalFilters;
            }, this.$render, true);

            function render() {
                var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var _ref$filter = _ref.filter;
                var filter = _ref$filter === undefined ? true : _ref$filter;
                var _ref$sort = _ref.sort;
                var sort = _ref$sort === undefined ? true : _ref$sort;

                var filtered = this.filtered || [];
                if (filter) {
                    filtered = filterItems(this.items, this.additionalFilters);
                    filtered = searchFilter(filtered, this.search, this.searchFields, this.searchFn) || [];
                }

                this.filtered = filtered;
                if (sort) {
                    this.filtered = $filter('orderBy')(filtered, this.sort, this.reverse);
                }

                var start = this.page * this.pageSize;
                var end = start + this.pageSize;
                this.displayed = this.filtered.slice(start, end);
            }

            function resetSortClasses() {
                // this ensures we're only resetting the classes of *this* directive's children.
                // that way, we can have multiple awesomeLists on one page
                $scope.$broadcast('awesomeSort.resetClass');
            }

            function filterItems(items, filters) {
                console.log('additional filters', filters);
                if (!filters) return items;

                return $filter('filter')(items, filters);
            }

            function searchFilter(items, search, fields, fn) {
                search = (search || '').toLowerCase();

                if (!fields && !fn) {
                    // search all fields
                    return $filter('filter')(items, search) || [];
                } else if (fields) {
                    // if no search term, return all items
                    if (!search) return items;

                    // only search the specified fields
                    return $filter('filter')(items, function (item) {
                        // see if any of the fields contain the str
                        return fields.some(function (field) {
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
    awesomeList.$inject = ["$filter", "$parse"];
})();

(function () {
    'use strict';

    var awesomeOptions = (function () {
        function awesomeOptions() {
            _classCallCheck(this, awesomeOptions);

            // pagination options
            this.paginationPrev = '«';
            this.paginationNext = '»';
            this.pageSize = 10;
            this.chomp = false;
        }

        _createClass(awesomeOptions, [{
            key: 'setPaginationPrev',
            value: function setPaginationPrev(prev) {
                this.paginationPrev = prev;
            }
        }, {
            key: 'setPaginationNext',
            value: function setPaginationNext(next) {
                this.paginationNext = next;
            }
        }, {
            key: 'setDefaultPageSize',
            value: function setDefaultPageSize(pageSize) {
                this.pageSize = parseInt(pageSize);
            }
        }, {
            key: 'setDefaultChomp',
            value: function setDefaultChomp(chomp) {
                if (chomp !== false) chomp = parseInt(chomp);
                this.chomp = chomp;
            }
        }, {
            key: '$get',
            value: function $get() {
                var props = {};
                for (var key in this) {
                    if (!this.hasOwnProperty(key)) continue;
                    props[key] = this[key];
                }

                return props;
            }
        }]);

        return awesomeOptions;
    })();

    angular.module('awesomeList').provider('awesomeOptions', awesomeOptions);
})();

(function () {
    'use strict';

    angular.module('awesomeList').directive('awesomePagination', awesomePagination);

    function awesomePagination(awesomeOptions) {
        return {
            require: '^awesomeList',
            scope: {
                pageSize: '=?',
                chomp: '@?',
                curPage: '=?'
            },
            replace: true,
            template: '\n                <ul class="awesome-pagination">\n                    <li ng-class="{ disabled: curPage <= 0 }">\n                        <span ng-click="jump(curPage - 1)">{{:: paginationPrev }}</span>\n                    </li>\n                    <li class="chomped" ng-if="chompPages && chompStart">\n                        <span>&hellip;</span>\n                    </li>\n                    <li ng-repeat="page in pages" ng-class="{ active: curPage == page }">\n                        <span ng-click="jump(page)">{{:: page + 1 }}</span>\n                    </li>\n                    <li class="chomped" ng-if="chompPages && chompEnd">\n                        <span>&hellip;</span>\n                    </li>\n                    <li ng-class="{ disabled: curPage >= pageCount - 1 }">\n                        <span ng-click="jump(curPage + 1)">{{:: paginationNext }}</span>\n                    </li>\n                </ul>\n            ',
            link: linkFn
        };

        function linkFn(scope, elem, attrs, ctrl) {
            scope.paginationPrev = awesomeOptions.paginationPrev;
            scope.paginationNext = awesomeOptions.paginationNext;

            scope.chompPages = false;
            scope.curPage = ctrl.page = 0;
            ctrl.pageSize = scope.pageSize = scope.pageSize || awesomeOptions.pageSize;

            if (attrs.chomp || awesomeOptions.chomp) {
                scope.chompPages = true;
                scope.chomp = scope.chomp || awesomeOptions.chomp;
            }

            scope.jump = setPage;

            scope.$watch('pageSize', function (pageSize) {
                return pageSize && (ctrl.pageSize = scope.pageSize = pageSize) && ctrl.$render({ filter: false, sort: false });
            });
            scope.$watch(function () {
                return [ctrl.filtered.length, scope.pageSize].join('|');
            }, render);
            scope.$watch(function () {
                return enforcePageBounds(scope.curPage);
            }, render);

            function render() {
                scope.pageCount = Math.ceil(ctrl.filtered.length / ctrl.pageSize);

                var start = 0;
                var end = scope.pageCount;
                if (scope.chompPages) {
                    ;

                    var _findChompEnds = findChompEnds();

                    var _findChompEnds2 = _slicedToArray(_findChompEnds, 2);

                    start = _findChompEnds2[0];
                    end = _findChompEnds2[1];
                }scope.pages = range(start, end);

                setPage(ctrl.page);

                ctrl.$render({ filter: false, sort: false });
            }

            function findChompEnds() {
                var start = Math.max(0, Math.min(scope.pageCount - scope.chomp, scope.curPage - Math.floor(scope.chomp / 2)));
                scope.chompStart = start > 0;

                var end = Math.min(scope.pageCount, start + scope.chomp * 1);
                scope.chompEnd = end < scope.pageCount;

                return [start, end];
            }

            function setPage(page) {
                scope.curPage = ctrl.page = enforcePageBounds(page);
            }

            function enforcePageBounds(page) {
                // ensure current page is within bounds, 0 >= page < pageCount
                if (page < 0) page = 0;else if (page > 0 && page >= scope.pageCount) page = scope.pageCount - 1;
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
    awesomePagination.$inject = ["awesomeOptions"];
})();

(function () {
    'use strict';

    angular.module('awesomeList').directive('awesomeSearch', awesomeSearch);

    function awesomeSearch() {
        return {
            require: '^awesomeList',
            scope: {
                searchFields: '=?',
                searchFn: '&?'
            },
            replace: true,
            template: '<input placeholder="Search" type="search" class="awesome-search" ng-model="search" ng-change="update(search)" />',
            link: linkFn
        };

        function linkFn(scope, elem, attrs, ctrl) {
            // using an ng-change instead of a $watch for performance
            scope.update = function (search) {
                ctrl.search = search;
                ctrl.$render();
            };

            if (attrs.searchFields && attrs.searchFn) {
                throw new Error('awesomeSearch Directive: Attributes [searchFields] and [searchFn] are mutually exclusive. Use one or the other.');
            }

            if (attrs.searchFn) {
                console.warn('searchFn is still untested');
                ctrl.searchFn = scope.searchFn;
            } else if (attrs.searchFields) {
                ctrl.searchFields = scope.searchFeilds;
                scope.$watch('searchFields', function (fields) {
                    ctrl.searchFields = fields;
                    ctrl.$render();
                });
            }
        }
    }
})();

(function () {
    'use strict';

    angular.module('awesomeList').directive('awesomeSort', awesomeSort);

    function awesomeSort() {
        var SORTED_CLASS = 'awesome-sorted';
        var SORTED_CLASS_REVERSE = 'awesome-sorted-reverse';
        var SORTABLE_CLASS = 'awesome-sortable';

        controllerFn.$inject = ["$scope", "$element"];
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
                $element.removeClass(SORTED_CLASS + ' ' + SORTED_CLASS_REVERSE);
            });
        }

        function linkFn(scope, elem, attrs, ctrl) {
            elem.addClass(SORTABLE_CLASS);

            if (ctrl.sort === attrs.awesomeSort) {
                sortAsc();
            } else if (ctrl.sort === '-' + attrs.awesomeSort) {
                ctrl.sort = attrs.awesomeSort;
                sortDesc();
            }

            elem.bind('click', function () {
                scope.$apply(function () {
                    if (ctrl.sort == attrs.awesomeSort) sortDesc();else sortAsc();
                });
            });

            function sortDesc() {
                ctrl.reverse = !ctrl.reverse;
                // we probably have SORTED_CLASS already applied, but there are
                // some edge cases where we don't, and this doesn't hurt to re-apply
                elem.addClass(SORTED_CLASS);
                elem.toggleClass(SORTED_CLASS_REVERSE, ctrl.reverse);

                ctrl.$render({ filter: false });
            }

            function sortAsc() {
                ctrl.reverse = false;
                ctrl.sort = attrs.awesomeSort;
                // this triggers broadcast('awesomeSort.resetClass')
                ctrl.resetSortClasses();
                elem.addClass(SORTED_CLASS);

                ctrl.$render({ filter: false });
            }
        }
    }
})();