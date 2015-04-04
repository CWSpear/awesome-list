(function () {
    angular
        .module('DemoApp', ['awesomeList'])
        .controller('DemoCtrl', function ($scope, users, $timeout) {
            $scope.users = users.get(10001, false);
        })
        .factory('users', function () {
            return {
                get: function (num, random) {
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
            }
        })
})();
