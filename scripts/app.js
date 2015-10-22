var app = angular.module('app', ['ngRoute','app.contact'])
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'components/home/home.html',
        controller: 'HomeController'
    }).
      when('/contact', {
        templateUrl: 'components/contact/contact.html',
        controller: 'ContactController'
      }).
      when('/gallery', {
        templateUrl: 'components/home/home.html',
        controller: 'HomeController'
      }).
      otherwise({
        redirectTo: '/Home'
      });
}]);

app.controller('HomeController', function($scope) {
    $scope.name = 'Friend';
  });
