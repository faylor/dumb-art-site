app.controller('standardTemplateController', ['$scope','$rootScope','$http','$routeParams','_','pageFactory','paintingFactory',
    function ( $scope, $rootScope, $http, $routeParams, _, pageFactory, paintingFactory){

      $scope.heading = '';
      $scope.subheading = '';
      $scope.body = '';
      $scope.footer = '';
      $scope.errormessage = '';
      $scope.loaded = false;

      $scope.$on('pagesloaded', function() {
        loadPageView();
      });

      function loadPageView(){
        if($rootScope.pages != undefined && !$scope.loaded){
            $scope.loaded = true;
            $scope.page = _.findWhere($rootScope.pages, {menulink: $routeParams.pagelink});
            if($scope.page == null){
              $scope.errormessage = "Unable to load page.";
            }else{
              setImageFromId($scope.page.image);
            }
        }else{
          $scope.errormessage = "Unable to load pages.";
        }
      }

       function setImageFromId(id) {
         $scope.image = '';
         paintingFactory.getPainting(id).then(function(res){
           $scope.image = res.data.image;
         });
       }
       loadPageView();
}]);
