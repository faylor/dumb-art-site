var app = angular.module('galleryApp', ['ngRoute','ui.bootstrap','ngSanitize','galleryApp.dragdrop'])

app.config(['$locationProvider','$routeProvider',
  function($locationProvider,$routeProvider) {
    $routeProvider.
    when('/:pagelink', {
      templateUrl: 'components/templates/standard.tpl.html',
      controller:'standardTemplateController',
      access: { requiredLogin: false }
      }).
      when('/gallery/home', {
        templateUrl: 'components/gallery/gallery.html',
        controller:'galleryController',
        access: { requiredLogin: false }
      }).
      when('/admin/login', {
        templateUrl: 'components/login/login.html',
        controller:'loginController',
        access: { requiredLogin: false }
      }).
      when('/admin/register', {
        templateUrl: 'components/admin/register.html',
        controller:'loginController',
        access: { requiredLogin: false }
      }).
      when('/admin/paintings', {
        templateUrl: 'components/admin/paintings.html',
        controller:'adminPaintingsController',
        access: { requiredLogin: false }
      }).
      when('/admin/pages', {
        templateUrl: 'components/admin/pages.html',
        controller:'adminPagesController',
        access: { requiredLogin: false }
      }).
      otherwise({
        redirectTo: '/home'
      });
      // use the HTML5 History API
      $locationProvider.html5Mode(true);
}]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, AuthenticationService, pageFactory) {
   pageFactory.getPages()
          .success(function (p) {
              $rootScope.pages = p;
          })
          .error(function (error) {
              $rootScope.errorMessage = 'Unable to load Pages data.';
          });

    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        if (nextRoute.access.requiredLogin && !AuthenticationService.isLogged) {
            $location.path("/login");
        }
    });
});


app.controller('galleryController', ['$scope','$http', 'paintingFactory', function ( $scope, $http, paintingFactory){
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
      paintingFactory.getPaintings()
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




app.controller('adminPaintingsController', ['$scope','$http','$window','$uibModal','paintingFactory',
  function ( $scope, $http,$window, $uibModal, paintingFactory){

  $scope.name = 'Admin Paintings';
  $scope.paintings;
  $scope.editType;
  getPaintings();

  function getPaintings() {
      paintingFactory.getPaintings()
          .success(function (p) {
              $scope.paintings = p;
          })
          .error(function (error) {
              $scope.status = 'Unable to load Painting data: ' + error.message;
          });
  }

  $scope.dropped = function(dragID, dropID) {

      paintingFactory.updateRanking(dragID,dropID)
          .success(function (p) {
              $scope.paintings = p;
          })
          .error(function (error) {
              $scope.status = 'Unable to load Painting data: ' + error.message;
          });
  };

  $scope.deletePainting = function (_painting) {
    var deleteUser = $window.confirm('Are you absolutely sure you want to delete?');

    if (deleteUser) {
      paintingFactory.deletePainting(_painting._id).success(function () {
          getPaintings();
      })
      .error(function (error) {
          $scope.status = 'Unable to remove Painting: ' + error.message;
      });
    }
  };

  $scope.showEditor = function (_painting) {
    openModalForm(_painting,"Edit");
  };

  $scope.showAddNew = function (_painting) {
    openModalForm(_painting, "Add New");
  };

  function openModalForm(_painting, editType) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'adminPaintingsEditorController',
      resolve: {
        painting: function () {
          return _painting;
        },
        editType: function () {
          return editType;
        }
      }
    });

    modalInstance.result.then(function (updatedPainting) {
      //paintingFactory.updatePainting(updatedPainting._id,updatedPainting);
      getPaintings();
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  }
}]);

app.controller('adminPaintingsEditorController',['$scope','$uibModalInstance','paintingFactory','painting','editType',
  function ($scope, $uibModalInstance, paintingFactory, painting, editType) {
  $scope.painting = painting;
  $scope.editType = editType;

  $scope.uploadFile = function(id,title,size,price,sold,rank){
        var file = $scope.myFile;
        var uploadUrl = "/painting/"+id;

        paintingFactory.uploadFileAndFormToUrl(id,file,{title:title,size:size,price:price,sold:sold,rank:rank}, uploadUrl)
          .success(function (p) {
              $uibModalInstance.close({_id:id});
          })
          .error(function (error) {
              $scope.status = 'Unable to upload Painting data: ' + error.message;
          });
    };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);


app.controller('menuController',['$scope','$rootScope','pageFactory',
  function ($scope, $rootScope, pageFactory) {



}]);

app.controller('contactController', function ($scope) {
  $scope.name = 'Contttact';
});

app.factory('_', function() {
	return window._; // assumes underscore has already been loaded on the page
});
/* paintingFactory */
app.factory('paintingFactory', ['$q','$timeout','$http', function($q,$timeout,$http) {

  var urlBase = '/painting/';
  var paintingFactory = {};

  paintingFactory.getPaintings = function () {
    return $http.get(urlBase);
  };

  paintingFactory.getPainting = function (id) {
    return $http.get(urlBase + id).then(function(response) {
      return response.data;
    });
  };

  paintingFactory.insertPainting = function (cust) {
    return $http.post(urlBase, cust);
  };

  paintingFactory.updatePainting = function (id,file,painting) {
    return $http.put( urlBase + id, JSON.stringify(painting))
  };

  paintingFactory.uploadFileAndFormToUrl = function(id, file, data, uploadUrl, callback){
      var fd = new FormData();
      fd.append('file', file);
      fd.append('title',data.title);
      fd.append('size',data.size);
      fd.append('price',data.price);
      fd.append('sold',data.sold);
      fd.append('rank',data.rank);

      return $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
      })
  }
  paintingFactory.updateRanking = function (dragid,dropid) {
    return $http.put('/updateRanking', JSON.stringify({dragid:dragid,dropid:dropid}))
  };

  paintingFactory.deletePainting = function (id) {
    return $http.delete(urlBase + id);
  };

  return paintingFactory;
}]);

app.factory('pageFactory', ['$http', function($http) {

  var urlBase = '/page/';
  var pageFactory = {};

  pageFactory.getPages = function () {
    return $http.get(urlBase);
  };

  pageFactory.getPage = function (id) {
    return $http.get(urlBase + id);
  };

  pageFactory.getPageByMenuLink = function (menulink) {
    return $http.get(urlBase + menulink);
  };

  pageFactory.insertPage = function (page) {
    return $http.post(urlBase, page);
  };

  pageFactory.updatePage = function (id,page) {
    return $http.put( urlBase + id, JSON.stringify(page))
  };

  pageFactory.deletePage = function (id) {
    return $http.delete(urlBase + id);
  };

  return pageFactory;
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

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

function imgError(image) {
    image.onerror = null;
    setTimeout(function (){
        image.src += '?' + +new Date;
     }, 1000);
}
