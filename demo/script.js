(function () {
    angular
        .module('DemoApp', ['awesomeList'])
        .controller('DemoCtrl', function ($scope, users) {
            $scope.users = users.get();
        })
        .factory('users', function () {
            return {
                get: function () {
                    return _.map(_.range(1103), function (i) {
                        return {
                            id: i,
                            name: faker.name.findName(),
                            email: faker.internet.email(),
                            wontBeSearchable: 'TRY SEARCHING FOR THIS STRING',
                            roles: _.map(_.range(_.random(3)), function (j) {
                                return {
                                    id: j,
                                    name: faker.company.catchPhraseNoun()
                                }
                            })
                        }
                    });
                }
            }
        })
})();
