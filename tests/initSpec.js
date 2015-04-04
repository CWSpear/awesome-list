(function () {
    var $compile;
    var $rootScope;
    var element;

    before(function () {
        fixture.setBase('tests/fixtures');
        fixture.load('basic.html');
        baseHTML = fixture.el.innerHTML;
    });

    describe('Awesome List', function () {
        // Load the myApp module, which contains the directive
        beforeEach(module('awesomeList'));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;

            $rootScope.users = generateUsers(101);
        }));

        describe('compiling with 101 users', function () {
            beforeEach(function () {
                element = $compile(baseHTML)($rootScope);
                $rootScope.$digest();
            });

            initialExpectations();

            describe('searching', repeatableSearchingTests);

            describe('sorting', repeatableSortingTests);

            describe('paging', repeatablePagingTests);
        });

        describe('using search-fields', function () {
            beforeEach(function () {
                var html = baseHTML.replace('placeholder-search-fields', 'search-fields')
                element = $compile(html)($rootScope);
                $rootScope.$digest();
            });

            initialExpectations();

            describe('searching', searchFieldsTests)

            describe('other functionality still works', function () {
                describe('searching', function () {
                    repeatableSearchingTests({
                        skipSearchInvisible: true
                    });
                });

                describe('sorting', repeatableSortingTests);

                describe('paging', repeatablePagingTests);
            });
        });

        describe('initial-sort', function () {
            describe('starting with an initial sort', function () {
                beforeEach(function () {
                    var html = baseHTML.replace('placeholder-initial-sort="SORT_KEY"', 'initial-sort="email"');
                    element = $compile(html)($rootScope);
                    $rootScope.$digest();
                });

                it('is sorted at the start', function () {
                    expectFirstCell('James Bond');
                });

                initialExpectations();
            });

            describe('starting with a reverse initial sort', function () {
                beforeEach(function () {
                    var html = baseHTML.replace('placeholder-initial-sort="SORT_KEY"', 'initial-sort="-email"');
                    element = $compile(html)($rootScope);
                    $rootScope.$digest();
                });

                it('is sorted at the start', function () {
                    expectFirstCell('Cameron Spear');
                });

                initialExpectations();
            });

            describe('sorting with initial complex keys', function () {
                beforeEach(function () {
                    var html = baseHTML.replace('placeholder-initial-sort="SORT_KEY"', 'initial-sort="-roles[0].name"');
                    element = $compile(html)($rootScope);
                    $rootScope.$digest();
                });

                it('is sorted at the start', function () {
                    expectFirstCell('James Bond');
                });

                initialExpectations();
            });
        });

        describe('page-size', function () {
            it('is 13 when page-size is 13', function () {
                var html = baseHTML.replace('placeholder-page-size="PAGE_SIZE"', 'page-size="13"');
                element = $compile(html)($rootScope);
                $rootScope.$digest();

                expectRowCount(13);
                expectPagerCount(8);
            });

            it('is 5 when page-size is 5', function () {
                var html = baseHTML.replace('placeholder-page-size="PAGE_SIZE"', 'page-size="5"');
                element = $compile(html)($rootScope);
                $rootScope.$digest();

                expectRowCount(5);
                expectPagerCount(21);

                // just checking it does not revert or anything...
                clickNext();

                expectRowCount(5);
                expectPagerCount(21);
            });
        });

        describe('chomp', function () {
            describe('chomps pagination to only display 3 when chomp is 3', function () {
                beforeEach(function () {
                    var html = baseHTML.replace('placeholder-chomp="CHOMP_SIZE"', 'chomp="3"');
                    element = $compile(html)($rootScope);
                    $rootScope.$digest();
                });

                it('has 3 list items', function () {
                    expectPagerCount(3);
                });

                it('shows chomped buttons', function () {
                    clickPageWithIndex(2);
                    expect(element.find('.awesome-pagination li').eq(5).text().trim()).to.equal('…');
                    expect(element.find('.awesome-pagination li').eq(1).text().trim()).to.equal('…');
                });
            });
        });
    });

    function expectRowCount(count) {
        expect(rows()).to.have.length(count);
    }

    function expectPagerCount(count) {
        expect(pagerListItem()).to.have.length(count);
    }

    function expectActivePage(index) {
        expect(pagerListItem().eq(index)).to.have.class('active');
    }

    function expectFirstCell(name) {
        expect(rows('td').first().text()).to.equal(name);
    }

    function searchFor(str) {
        var input = search();
        input.val(str);
        input.change();
    }

    function sortColWithIndex(index) {
        sort().eq(index).click();
    }

    function clickNext() {
        element.find('.awesome-pagination li').last().find('span').click();
    }

    function clickPrev() {
        element.find('.awesome-pagination li').first().find('span').click();
    }

    function clickPageWithIndex(index) {
        pagerListItem().eq(index).find('span').click();
    }

    function rows(child) {
        var elem = element.find('tbody tr');
        if (child) {
            elem = elem.find(child);
        }
        return elem;
    }

    function sort() {
        return element.find('[awesome-sort]');
    }

    function pagerListItem(child) {
        var elem = element.find('.awesome-pagination li[ng-repeat]');
        if (child) {
            elem = elem.find(child);
        }
        return elem;
    }

    function search() {
        return element.find('.awesome-search');
    }


    function initialExpectations() {
        it('has 10 visible rows', function () {
            expectRowCount(10);
        });

        it('has 11 items in the pager', function () {
            expectPagerCount(11);
        });
    }

    function repeatableSearchingTests(opts) {
        if (!opts) opts = {};

        it('has 1 item when search matches 1 item', function () {
            searchFor('James Bond');
            expectRowCount(1);
            expectPagerCount(1);
        });

        it('has 0 item when search matches 0 items', function () {
            searchFor('asdfljkhasfdliafsdljfsda');
            expectRowCount(0);
            expectPagerCount(0);
        });

        it('it should handle case-insensitive partial matches', function () {
            searchFor('cameron');
            expectRowCount(10);
            expectPagerCount(10);
        });

        if (!opts.skipSearchInvisible) {
            it('searches fields even if they aren\'t visible', function () {
                searchFor('TRY SEARCHING FOR THIS STRING');
                expectRowCount(10);
                expectPagerCount(11);
            });
        }
    }

    function repeatableSortingTests() {
        it('should sort', function () {
            sortColWithIndex(0);
            expectFirstCell('Cameron Spear');
        });

        it('should sort in reverse', function () {
            sortColWithIndex(0);
            sortColWithIndex(0);
            expectFirstCell('James Bond');
        });

        it('should handle complex sort keys', function () {
            sortColWithIndex(2);
            expectFirstCell('Cameron Spear');
            sortColWithIndex(2);
        });
    }

    function repeatablePagingTests() {
        it('should jump to page', function () {
            sortColWithIndex(0);
            clickPageWithIndex(10);
            expectActivePage(10);
            expectRowCount(1);
            expectFirstCell('James Bond');
        });

        it('should page to next/prev page', function () {
            expectActivePage(0);
            clickNext();
            expectActivePage(1);
            clickNext();
            expectActivePage(2);
            clickNext();
            expectActivePage(3);
            clickPrev();
            expectActivePage(2);
        });
    }


    function searchFieldsTests() {
        it('does not search fields that aren\'t in the search-fields attribute', function () {
            searchFor('TRY SEARCHING FOR THIS STRING');
            expectRowCount(0);
            expectPagerCount(0);
        });
    }


    function generateUsers(num, random) {
        var users = _.map(_.range(num - 1), function (i) {
            return {
                id: i,
                name: random ? faker.name.findName() : 'Cameron Spear',
                email: random ? faker.internet.email() : 'cam@cameronspear.com',
                wontBeVisibleInTable: 'TRY SEARCHING FOR THIS STRING',
                roles: _.map(_.range(_.random(1, 3)), function (j) {
                    return {
                        id: j,
                        name: random ? faker.company.catchPhraseNoun() : 'Developer ' + j
                    };
                })
            };
        });

        users.push({
            id: num,
            name: 'James Bond',
            email: '1spy@bond.com',
            wontBeVisibleInTable: 'TRY SEARCHING FOR THIS STRING',
            roles: [{
                id: 1,
                name: 'Spy ' + 1
            }]
        });

        return users;
    }
})();
