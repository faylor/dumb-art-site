var galleryApp = angular.module('galleryApp', ['ui.bootstrap']);

galleryApp.config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl : 'pages/home.html',
                controller  : 'homeController'
            })
            // route for the about page
            .when('/gallery', {
                templateUrl : 'pages/gallery.html',
                controller  : 'galleryController'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl : 'pages/contact.html',
                controller  : 'contactController'
            });
    });

galleryApp.controller('homeController', ['$scope','$http', 'dataFactory', function ( $scope, $http, dataFactory){}]);

galleryApp.controller('contactController', ['$scope','$http', 'dataFactory', function ( $scope, $http, dataFactory){}]);

galleryApp.controller('galleryController', ['$scope','$http', 'dataFactory', function ( $scope, $http, dataFactory){

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

galleryApp.factory('dataFactory', ['$http', function($http) {

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
