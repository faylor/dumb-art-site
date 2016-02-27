
app.controller('adminThemesController', ['$scope','$rootScope','$http','$window','$uibModal','themeFactory',
  function ( $scope, $rootScope, $http, $window, $uibModal, themeFactory){

    $scope.name = 'Admin Themes';
    $scope.themes;
    $scope.editType;
    getThemes();

    function getThemes() {
        themeFactory.getThemes()
            .success(function (t) {
                $scope.themes = t;
                $rootScope.themes = t;
            })
            .error(function (error) {
                $scope.status = 'Unable to load Themes data: ' + error.message;
            });
    }


    $scope.deleteTheme = function (_theme) {
      var deleteTheme = $window.confirm('Are you absolutely sure you want to delete?');

      if (deleteTheme) {
        themeFactory.deleteTheme(_theme._id).success(function () {
            getThemes();
        })
        .error(function (error) {
            $scope.status = 'Unable to remove Theme: ' + error.message;
        });
      }
    };

    $scope.showEditor = function (_theme) {
      openModalForm(_theme,"Edit");
    };

    $scope.showAddNew = function (_theme) {
      openModalForm(_theme, "Add New");
    };

    function openModalForm(_theme, editType) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'myThemeEditor.html',
        controller: 'adminThemeEditorController',
        resolve: {
          theme: function () {
            return _theme;
          },
          editType: function () {
            return editType;
          }
        }
      });

      modalInstance.result.then(function (updatedTheme) {
        //paintingFactory.updatePainting(updatedPainting._id,updatedPainting);
          getThemes();
        }, function () {
          console.log('Modal dismissed at: ' + new Date());
        });
    }

}]);

app.controller('adminThemeEditorController',['$scope','$uibModalInstance','themeFactory','theme','editType',
  function ($scope, $uibModalInstance, themeFactory, theme, editType) {
  $scope.theme = theme;
  $scope.editType = editType;

  $scope.updateTheme = function(id,theme,rank){
        themeFactory.updateTheme(id,{theme:theme,rank:rank})
          .success(function (t) {
              $uibModalInstance.close({_id:id});
          })
          .error(function (error) {
              $scope.status = 'Unable to upload Theme data: ' + error.message;
          });
    };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
