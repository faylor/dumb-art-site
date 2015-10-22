var app = angular.module('app', ['ngRoute','app.home', 'app.gallery', 'app.contact']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'components/home/home.html',
        controller: 'HomeController'
    }).
      when('/Contact', {
        templateUrl: 'components/contact/contact.html',
        controller: 'ContactController'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);
