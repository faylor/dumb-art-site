var app = angular.module('app', ['ngRoute'])
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'components/home/home.html',
        resolve: resolveController('components/home/home.js')
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
