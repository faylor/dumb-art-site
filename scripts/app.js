/*var app = angular.module('galleryApp', ['ui.router','ui.bootstrap','galleryApp.dragdrop'])

app.config(['$locationProvider','$stateProvider','$urlRouterProvider',function($locationProvider,$stateProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true); //remove the hash from the URL
    $urlRouterProvider.otherwise("/home");
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'components/home/home.html',
        controller: 'homeController'
      }).
      state('contact', {
        url: '/contact',
        templateUrl: 'components/contact/contact.html',
        controller:'contactController'
      }).
      state('gallery', {
        url: '/gallery',
        templateUrl: 'components/gallery/gallery.html',
        controller:'galleryController'
      }).
      state('login', {
        url:'/login',
        templateUrl: 'components/login/login.html',
        controller:'loginController'
      }).
      state('register', {
        url:'/register',
        templateUrl: 'components/admin/register.html',
        controller:'loginController'
      }).
      state('admin-paintings', {
        url:'/admin-paintings',
        templateUrl: 'components/admin/paintings.html',
        controller:'adminPaintingsController'
      });
}]);
*/
var app = angular.module('galleryApp', ['ngRoute','ui.bootstrap','galleryApp.dragdrop'])

app.config(['$locationProvider','$routeProvider',
  function($locationProvider,$routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: 'components/home/home.html',
      controller:'homeController',
      access: { requiredLogin: false }
      }).
      when('/contact', {
        templateUrl: 'components/contact/contact.html',
        controller:'contactController',
        access: { requiredLogin: true }
      }).
      when('/gallery', {
        templateUrl: 'components/gallery/gallery.html',
        controller:'galleryController',
        access: { requiredLogin: false }
      }).
      when('/login', {
        templateUrl: 'components/login/login.html',
        controller:'loginController',
        access: { requiredLogin: false }
      }).
      when('/register', {
        templateUrl: 'components/admin/register.html',
        controller:'loginController',
        access: { requiredLogin: true }
      }).
      when('/admin-paintings', {
        templateUrl: 'components/admin/paintings.html',
        controller:'adminPaintingsController',
        access: { requiredLogin: false }
      }).
      otherwise({
        redirectTo: '/'
      });
      // use the HTML5 History API
      $locationProvider.html5Mode(true);
}]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        if (nextRoute.access.requiredLogin && !AuthenticationService.isLogged) {
            $location.path("/login");
        }
    });
});

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



app.controller('loginController', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',
    function ($scope, $location, $window, UserService, AuthenticationService) {

        //Admin User Controller (login, logout)
        $scope.logIn = function logIn(username, password) {
            if (username !== undefined && password !== undefined) {

                UserService.logIn(username, password).success(function(data) {
                    AuthenticationService.isLogged = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("/contact");
                }).error(function(status, data) {
                    $scope.message = "Login Failed.";
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
            if (AuthenticationService.isLogged) {
                AuthenticationService.isLogged = false;
                delete $window.sessionStorage.token;
                $location.path("/");
            }
        }

        //Admin User Controller (login, logout)
        $scope.register = function register(username, password) {
            if (username !== undefined && password !== undefined) {
                UserService.register(username, password).success(function(data) {
                    $scope.message = data.message;
                }).error(function(status, data) {
                    $scope.message = data.message;
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.isAuthed = function isAuthed() {
            return AuthenticationService.isLogged;
        }


    }
]);


app.controller('adminPaintingsController', ['$scope','$http','$uibModal','dataFactory', function ( $scope, $http, $uibModal, dataFactory){
//app.controller('adminPaintingsController', ['$scope','$http','dataFactory', function ( $scope, $http, dataFactory){

  $scope.name = 'Admin Paintings';
  $scope.paintings;
  getPaintings();

  function getPaintings() {
      dataFactory.getPaintings()
          .success(function (p) {
              $scope.paintings = p;
          })
          .error(function (error) {
              $scope.status = 'Unable to load Painting data: ' + error.message;
          });
  }

  $scope.dropped = function(dragID, dropID) {

      dataFactory.updateRanking(dragID,dropID)
          .success(function (p) {
              $scope.paintings = p;
          })
          .error(function (error) {
              $scope.status = 'Unable to load Painting data: ' + error.message;
          });
  };


  $scope.showEditor = function (_painting) {

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'adminPaintingsEditorController',
      resolve: {
        painting: function () {
          return _painting;
        }
      }
    });

    modalInstance.result.then(function (updatedPainting) {
      dataFactory.updatePainting(id,updatedPainting);
      //getPaintings();
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}]);

app.controller('adminPaintingsEditorController', function ($scope, $uibModalInstance, painting) {
  $scope.painting = painting;

  $scope.save = function (id, title, size) {
    $uibModalInstance.close(id, {title:title,size:size});
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});


app.controller('contactController', function ($scope) {
  $scope.name = 'Contttact';
});


/* dataFactory */
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

  dataFactory.updatePainting = function (id,painting) {
    return $http.put( '/painting/' + id, painting)
  };
  dataFactory.updateRanking = function (dragid,dropid) {
    return $http.put('/updateRanking', JSON.stringify({dragid:dragid,dropid:dropid}))
  };

  dataFactory.deletePainting = function (id) {
    return $http.delete(urlBase + '/' + id);
  };

  return dataFactory;
}]);

app.factory('AuthenticationService', function() {
    var auth = {
        isLogged: false
    }

    return auth;
});
app.factory('UserService', function($http) {
    return {
        logIn: function(username, password) {
            return $http.post('/login', {username: username, password: password});
        },
        logOut: function() {

        },
        register: function(username, password) {
            return $http.post('/register', {username: username, password: password});
        }
    }
});

app.factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {
            if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;
                $location.path("/admin/login");
            }

            return $q.reject(rejection);
        }
    };
});
