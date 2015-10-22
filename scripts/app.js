var app = angular.module('galleryApp', ['ngRoute'])

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'components/home/home.html',
        controller:'homeController'
      }).
      when('/contact', {
        templateUrl: 'components/contact/contact.html',
        controller:'contactController'
      }).
      when('/gallery', {
        templateUrl: 'components/gallery/gallery.html',
        controller:'galleryController'
      }).
      otherwise({
        redirectTo: '/home'
      });
}]);

app.controller('homeController', function ($scope) {
    $scope.namer = 'Homies';
    $scope.message = 'Look! I am an about page.';
});

app.controller('galleryController', function ($scope) {
  $scope.name = 'Galleries';
});

app.controller('contactController', function ($scope) {
  $scope.name = 'Contttact';
});
