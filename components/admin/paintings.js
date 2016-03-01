
app.controller('adminPaintingsController', ['$scope','$http','$window','$uibModal','paintingFactory','themeFactory',
  function ( $scope, $http,$window, $uibModal, paintingFactory, themeFactory){

  $scope.name = 'Admin Paintings';
  $scope.paintings;
  $scope.themes;
  $scope.editType;
  getPaintings();
  getThemes();

  function getPaintings() {
      paintingFactory.getPaintings()
          .success(function (p) {
              $scope.paintings = p;
          })
          .error(function (error) {
              $scope.status = 'Unable to load Painting data: ' + error.message;
          });
  }

  function getThemes() {
      themeFactory.getThemes()
          .success(function (t) {
              $scope.themes = t;
          })
          .error(function (error) {
              $scope.status = 'Unable to load Themes data: ' + error.message;
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
    openModalForm(_painting,$scope.themes,"Edit");
  };

  $scope.showAddNew = function () {
    openModalForm({},$scope.themes, "Add New");
  };

  function openModalForm(_painting,_themes, editType) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'adminPaintingsEditorController',
      resolve: {
        painting: function () {
          return _painting;
        },
        themes: function () {
          return _themes;
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


app.controller('adminPaintingsEditorController',['$scope','$uibModalInstance','paintingFactory','painting','themes','editType',
  function ($scope, $uibModalInstance, paintingFactory, painting, themes, editType) {
  $scope.painting = painting;
  if($scope.painting.themes==null){
    $scope.painting.themes=[];
  }
  $scope.editType = editType;
  $scope.themes = themes;

  $scope.onChangeSetID = function(theme) {
    var a = _.find($scope.painting.themes,function(t){ return t._id == theme._id });
    if(a){
      $scope.painting.themes.splice($scope.painting.themes.indexOf(a),1);
    }else{
      $scope.painting.themes.push(theme._id);
    }
   };

  $scope.uploadFile = function(id,title,size,price,sold,rank,image,cthemes,landscape){
        var file = $scope.myFile;
        var uploadUrl = "/painting/"+id;
        var themesOut = [];
        if(cthemes!==undefined){
          angular.forEach(cthemes, function(value, key) {
            this.push(value);
          }, themesOut);
        }
        paintingFactory.uploadFileAndFormToUrl(id,file,{title:title,size:size,price:price,sold:sold,rank:rank,image:image,themes:JSON.stringify(themesOut),landscape:landscape}, uploadUrl)
          .success(function (p) {
              $uibModalInstance.close({_id:id});
          })
          .error(function (error) {
              $scope.status = 'Unable to upload Painting data: ' + error.message;
          });
    };

    $scope.isChecked = function (_id) {
      if($scope.painting.themes){
        var i=0, len=$scope.painting.themes.length;
        for (; i<len; i++) {
          if ($scope.painting.themes[i]._id == _id) {
            return true;
          }
        }
      }
      return false;
    };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
