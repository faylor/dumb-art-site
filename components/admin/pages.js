
app.controller('adminPagesController', ['$scope','$rootScope','$http','$window','$uibModal','pageFactory','paintingFactory',
  function ( $scope, $rootScope, $http, $window, $uibModal, pageFactory, paintingFactory){

    $scope.name = 'Admin Pages';
    $scope.pages;
    $scope.editType;
    getPages();

    function getPages() {
        pageFactory.getPages()
            .success(function (p) {
                $scope.pages = p;
                $rootScope.pages = p;
            })
            .error(function (error) {
                $scope.status = 'Unable to load Pages data: ' + error.message;
            });
    }

    $scope.getImageFromId = function(_page) {
     paintingFactory.getPainting(_page.image).then(function(data){
       _page.img = data.image;
     });

    }

    $scope.deletePage = function (_page) {
      var deletePage = $window.confirm('Are you absolutely sure you want to delete?');

      if (deletePage) {
        pageFactory.deletePage(_page._id).success(function () {
            getPages();
        })
        .error(function (error) {
            $scope.status = 'Unable to remove Painting: ' + error.message;
        });
      }
    };

    $scope.showEditor = function (_page) {
      openModalForm(_page,"Edit");
    };

    $scope.showAddNew = function (_page) {
      openModalForm(_page, "Add New");
    };

    function openModalForm(_page, editType) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'myPageEditor.html',
        controller: 'adminPageEditorController',
        resolve: {
          page: function () {
            return _page;
          },
          editType: function () {
            return editType;
          }
        }
      });

      modalInstance.result.then(function (updatedPainting) {
        //paintingFactory.updatePainting(updatedPainting._id,updatedPainting);
          getPages();
        }, function () {
          console.log('Modal dismissed at: ' + new Date());
        });
    }

}]);


app.controller('adminPageEditorController',['$scope','$uibModalInstance','pageFactory','paintingFactory','page','editType',
  function ($scope, $uibModalInstance, pageFactory,paintingFactory, page, editType) {
  $scope.page = page;
  $scope.editType = editType;

  getPaintings();
  //$scope.item = page.image;

  function getPaintings() {
      paintingFactory.getPaintings()
          .success(function (p) {
              $scope.paintings = p;
          })
          .error(function (error) {
              $scope.status = 'Unable to load Painting data: ' + error.message;
          });
  }

  $scope.updatePage = function(id,heading,subheading,body,footer,image,menutitle,menulink,rank){
        pageFactory.updatePage(id,{heading:heading,subheading:subheading,body:body,footer:footer,image:image,menutitle:menutitle,menulink:menulink,rank:rank})
          .success(function (p) {
              $uibModalInstance.close({_id:id});
          })
          .error(function (error) {
              $scope.status = 'Unable to upload Page data: ' + error.message;
          });
    };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
