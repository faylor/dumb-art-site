var app = angular.module('app', ['ngRoute'])
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'components/home/home.html',
        controller:'HomeController'
    }).
      when('/contact', {
        templateUrl: 'components/contact/contact.html'
      }).
      when('/gallery', {
        templateUrl: 'components/gallery/gallery.html'
      }).
      otherwise({
        redirectTo: '/Home'
      });
}]);

app.controller('HomeController', function ($scope) {
    $scope.namer = 'Homies';
  });
