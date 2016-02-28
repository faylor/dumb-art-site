app.controller('galleryController', ['$scope','$rootScope', '$http','$timeout','$document','$uibModal', 'paintingFactory',
  function($scope, $rootScope, $http, $timeout, $document,$uibModal, paintingFactory) {
  $scope.name = 'Galleries';
  $scope.images = [];
  $scope.totalItems;
  $scope.currentPage = 1;
  $scope.maxSize = 5;
  $scope.thumbsNum = 6;
  $scope.totalDisplayed = 12;
  $scope.filterSold = 0;
  getPaintings();

  function getPaintings() {
    paintingFactory.getPaintings()
      .success(function(p) {
        $scope.images = p;
        $scope.imagesLimited = p.slice(0,$scope.totalDisplayed );
        $scope.totalItems = p.length;
        //calculateLandscapes();
      })
      .error(function(error) {
        $scope.status = 'Unable to load Painting data: ' + error.message;
      });
  }

  $scope.refresh = function(){
    angularGridInstance.gallery.refresh();
  }

  $scope.isForSale = function(p) {
    return ($scope.filterSold === 1 && p.sold === 0) || $scope.filterSold === 0;
  };

  $scope.loadMore = function() {
    if($scope.totalDisplayed<$scope.images.length){
      $scope.totalDisplayed = $scope.totalDisplayed + $scope.thumbsNum;
      $scope.imagesLimited = $scope.images.slice(0,$scope.totalDisplayed);
    }
  };

  var defaults = {
		baseClass   : 'ng-gallery',
		thumbClass  : 'ng-thumb'
	};

	var keys_codes = {
		enter : 13,
		esc   : 27,
		left  : 37,
		right : 39
	};

  function setScopeValues(scope) {
    scope.baseClass = scope.class || defaults.baseClass;
    scope.thumbClass = scope.thumbClass || defaults.thumbClass;
    scope.thumbsNum = scope.thumbsNum || 3; // should be odd
  }
  setScopeValues($scope);

  if ($scope.thumbsNum >= 11) {
    $scope.thumbsNum = 2;
  }

  var $body = $document.find('body');
  var $thumbwrapper = angular.element(document.querySelectorAll('.ng-thumbnails-wrapper'));


  $scope.index = 0;
  $scope.opened = false;

  $scope.thumb_wrapper_width = 0;
  $scope.thumbs_width = 0;


  var $lastEnlarged = null;

  $scope.togglePic = function(p) {
    if(p.enlarged == 'true'){
      p.enlarged = ''
    }else{
      p.enlarged = 'true';
      if($lastEnlarged){
        $lastEnlarged.enlarged = '';
      }
      $lastEnlarged = p;
    };
    $rootScope.$broadcast('masonry.reload');
  };

  $scope.openGallery = function(i) {
    if (typeof i !== undefined) {
      $scope.index = i;
      showImage($scope.index);
    }
    $scope.opened = true;
  };

  $scope.closeGallery = function() {
    $scope.opened = false;
  };


  $scope.open = function (p) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: 'lg',
      resolve: {
        painting: function () {
          return p;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });
  };

  $body.bind('keydown', function(event) {
    if (!$scope.opened) {
      return;
    }
    var which = event.which;
    if (which === keys_codes.esc) {
      $scope.closeGallery();
    } else if (which === keys_codes.right || which === keys_codes.enter) {
      $scope.nextImage();
    } else if (which === keys_codes.left) {
      $scope.prevImage();
    }

    $scope.$apply();
  });

  var calculateLandscapes = function() {
    var width = 0,
    visible_width = 0;
    $timeout(function(){
      var $thumbnails = angular.element(document.querySelectorAll('.landscapeCheck'));
      angular.forEach($thumbnails, function(thumb) {
        if(thumb.clientWidth>(1.2*thumb.clientHeight)) angular.element(thumb).parent().removeClass('col-xs-12 col-sm-6 col-md-4 col-lg-3').addClass('col-xs-12 col-sm-12 col-md-8 col-lg-6');
      });
    },0);



  };

  var smartScroll = function(index) {
    $timeout(function() {
      var len = $scope.images.length,
        width = $scope.thumbs_width,
        current_scroll = $thumbwrapper[0].scrollLeft,
        item_scroll = parseInt(width / len, 10),
        i = index + 1,
        s = Math.ceil(len / i);

      $thumbwrapper[0].scrollLeft = 0;
      $thumbwrapper[0].scrollLeft = i * item_scroll - (s * item_scroll);
    }, 100);
  };

}]);
app.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', '$q','painting',
function ($scope, $uibModalInstance, $q, painting) {


  $scope.ok = function () {
    $uibModalInstance.close(1);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  var loadImage = function(i) {
    var deferred = $q.defer();
    var image = new Image();

    image.onload = function() {
      $scope.loading = false;
      if (typeof this.complete === false || this.naturalWidth === 0) {
        deferred.reject();
      }
      deferred.resolve(image);
    };

    image.onerror = function() {
      deferred.reject();
    };

    image.src = 'images/'+i;
    $scope.loading = true;

    return deferred.promise;
  };

    var showImage = function(painting) {
      loadImage(painting.image).then(function(resp) {
        $scope.img = resp.src;
        //smartScroll($scope.index);
      });
      $scope.title = painting.title || '';
      $scope.price = painting.price || '';
      $scope.size = painting.size || '';
      $scope.sold = painting.sold || '';
      $scope.themes = painting.themes || '';
    };

    $scope.changeImage = function(i) {
      $scope.index = i;
      loadImage($scope.index.image).then(function(resp) {
        $scope.img = resp.src;
      //  smartScroll($scope.index.);
      });
      $scope.title = $scope.index.title || '';
      $scope.price = $scope.index.price || '';
      $scope.size = $scope.index.size || '';
      $scope.sold = $scope.index.sold || '';
      $scope.themes = painting.index.themes || '';
    };

    $scope.nextImage = function() {
      $scope.index += 1;
      if ($scope.index === $scope.images.length) {
        $scope.index = 0;
      }
      showImage($scope.index);
    };

    $scope.prevImage = function() {
      $scope.index -= 1;
      if ($scope.index < 0) {
        $scope.index = $scope.images.length - 1;
      }
      showImage($scope.index);
    };

    showImage(painting);

}]);
