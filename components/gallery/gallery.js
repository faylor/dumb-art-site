app.controller('galleryController', ['$scope', '$http','$q','$timeout','$document', 'paintingFactory',
  function($scope, $http, $q, $timeout, $document, paintingFactory) {
  $scope.name = 'Galleries';
  $scope.images;
  $scope.filteredPaintings;
  $scope.totalItems;
  $scope.currentPage = 1;
  $scope.maxSize = 5;
  $scope.thumbsNum = 20;
  $scope.filterSold = 0;
  getPaintings();

  function getPaintings() {
    paintingFactory.getPaintings()
      .success(function(p) {
        $scope.images = p;
        $scope.totalItems = p.length;
        $scope.pageChanged();
      })
      .error(function(error) {
        $scope.status = 'Unable to load Painting data: ' + error.message;
      });
  }

  $scope.pageChanged = function() {
    var begin = (($scope.currentPage - 1) * $scope.thumbsNum);
    var end = begin + $scope.thumbsNum;

    $scope.filteredPaintings = $scope.images.slice(begin, end);
  };

  $scope.isForSale = function(p) {
    return ($scope.filterSold === 1 && p.sold === 0) || $scope.filterSold === 0;
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
    $scope.thumbsNum = 11;
  }

  var $body = $document.find('body');
  var $thumbwrapper = angular.element(document.querySelectorAll('.ng-thumbnails-wrapper'));
  var $thumbnails = angular.element(document.querySelectorAll('.ng-thumbnails'));

  $scope.index = 0;
  $scope.opened = false;

  $scope.thumb_wrapper_width = 0;
  $scope.thumbs_width = 0;

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

    image.src = $scope.images[i].img;
    $scope.loading = true;

    return deferred.promise;
  };

  var showImage = function(i) {
    loadImage($scope.index).then(function(resp) {
      $scope.img = resp.src;
      smartScroll($scope.index);
    });
    $scope.description = $scope.images[i].description || '';
  };

  $scope.changeImage = function(i) {
    $scope.index = i;
    loadImage($scope.index).then(function(resp) {
      $scope.img = resp.src;
      smartScroll($scope.index);
    });
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

  $scope.openGallery = function(i) {
    if (typeof i !== undefined) {
      $scope.index = i;
      showImage($scope.index);
    }
    $scope.opened = true;

    $timeout(function() {
      var calculatedWidth = calculateThumbsWidth();
      $scope.thumbs_width = calculatedWidth.width;
      $thumbnails.css({
        width: calculatedWidth.width + 'px'
      });
      $thumbwrapper.css({
        width: calculatedWidth.visible_width + 'px'
      });
      smartScroll($scope.index);
    });
  };

  $scope.closeGallery = function() {
    $scope.opened = false;
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

  var calculateThumbsWidth = function() {
    var width = 0,
    visible_width = 0;
    angular.forEach($thumbnails.find('img'), function(thumb) {
      width += thumb.clientWidth;
      width += 10; // margin-right
      visible_width = thumb.clientWidth + 10;
    });
    return {
      width: width,
      visible_width: visible_width * $scope.thumbsNum
    };
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
