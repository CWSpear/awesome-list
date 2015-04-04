before(function () {
    fixture.setBase('tests/fixtures');
});

describe('Awesome List', function () {
    var $compile;
    var $rootScope;
    var element;

    // Load the myApp module, which contains the directive
    beforeEach(module('awesomeList'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        $rootScope.users = generateUsers(101);

        fixture.load('basic.html');
    }));

    describe('compiling with 101 users', function () {
        beforeEach(function () {
            element = $compile(fixture.el.innerHTML)($rootScope);
            $rootScope.$digest();
        });

        it('has 10 visible rows', function () {
            expect(rows().length).to.equal(10);
        });

        it('has 11 items in the pager', function () {
            expect(pagerListItem().length).to.equal(11);
        });

        it('has 1 item when search matches 1 item', function () {
            var input = search();
            input.val('James Bond');
            input.change();
            expect(rows().length).to.equal(1);
        });

        it('has 0 item when search matches 0 items', function () {
            var input = search();
            input.val('asdfljkhasfdliafsdljfsda');
            input.change();
            expect(rows().length).to.equal(0);
        });

        it('searches fields even if they aren\'t visible', function () {
            var input = search();
            input.val('TRY SEARCHING FOR THIS STRING');
            input.change();
            expect(rows().length).to.equal(10);
            expect(pagerListItem().length).to.equal(11);
        });

        it('should sort', function () {
            sort().first().click();
            expect(rows('td').first().text()).to.equal('Cameron Spear');
        });

        it('should sort in reverse', function () {
            sort().first().click();
            sort().first().click();
            expect(rows('td').first().text()).to.equal('James Bond');
        });

        it('page', function () {
            sort().first().click();
            pagerListItem().eq(10).find('span').click();
            pagerListItem().eq(10).should.have.class('active');
            expect(rows().length).to.equal(1);
            expect(rows('td').first().text()).to.equal('James Bond');

            element.find('.awesome-pagination li').first().find('span').click();
            pagerListItem().eq(9).should.have.class('active');
        });

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
    });
});

function generateUsers(num, random) {
    var users = _.map(_.range(num - 1), function (i) {
        return {
            id: i,
            name: random ? faker.name.findName() : 'Cameron Spear',
            email: random ? faker.internet.email() : 'cam@cameronspear.com',
            wontBeSearchable: 'TRY SEARCHING FOR THIS STRING',
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
        email: 'james@bond.com',
        wontBeSearchable: 'TRY SEARCHING FOR THIS STRING',
        roles: [{
            id: 1,
            name: 'Spy ' + 1
        }]
    });

    return users;
}
