var app = angular.module('galleryApp', ['ngRoute','ui.bootstrap'])

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

app.controller('galleryController', ['$scope','$http', 'dataFactory', function ( $scope, $http, dataFactory){
  $scope.name = 'Galleries';
  $scope.paintings;
  $scope.filteredPaintings;
  $scope.totalItems;
  $scope.currentPage = 1;
  $scope.maxSize = 5;
  $scope.itemsPerPage = 2;
  $scope.filterSold = 0;
  getPaintings();

  function getPaintings() {
      dataFactory.getPaintings()
          .success(function (p) {
              $scope.paintings = p;
              $scope.totalItems = p.length;
              $scope.pageChanged();
          })
          .error(function (error) {
              $scope.status = 'Unable to load Painting data: ' + error.message;
          });
  }

  $scope.pageChanged = function() {
     var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
     var end = begin + $scope.itemsPerPage;

     $scope.filteredPaintings = $scope.paintings.slice(begin, end);
   };

   $scope.isForSale = function(p) {
    return ($scope.filterSold===1 &&  p.sold === 0) || $scope.filterSold===0;
   };

}]);

app.controller('contactController', function ($scope) {
  $scope.name = 'Contttact';
});



app.factory('dataFactory', ['$http', function($http) {

  var urlBase = '/returnAllPaintings';
  var dataFactory = {};

  dataFactory.getPaintings = function () {
    return $http.get(urlBase);
  };

  dataFactory.getPainting = function (id) {
    return $http.get(urlBase + '/' + id);
  };

  dataFactory.insertPainting = function (cust) {
    return $http.post(urlBase, cust);
  };

  dataFactory.updatePainting = function (cust) {
    return $http.put(urlBase + '/' + cust.ID, cust)
  };

  dataFactory.deletePainting = function (id) {
    return $http.delete(urlBase + '/' + id);
  };

  return dataFactory;
}]);
