var app = angular.module('app', ['ngRoute'])
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'components/home/home.html',
        controller:'homeController'
      }).
      when('/contact', {
        templateUrl: 'components/contact/contact.html'
      }).
      when('/gallery', {
        templateUrl: 'components/gallery/gallery.html'
      }).
      otherwise({
        redirectTo: '/home'
      });
}]);

app.controller('homeController', function ($scope) {
    $scope.namer = 'Homies';
    $scope.message = 'Look! I am an about page.';
});
