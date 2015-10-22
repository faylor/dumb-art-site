angular.module('app', ['ngRoute','app.home', 'app.gallery', 'app.contact'])
.config(['$routeProvider',
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
        templateUrl: 'components/contact/contact.html',
        controller: 'ContactController'
      }).
      otherwise({
        redirectTo: '/Home'
      });
}]);
