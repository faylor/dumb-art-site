app.controller('standardTemplateController', ['$scope','$rootScope','$http','$routeParams','_','pageFactory','paintingFactory',
    function ( $scope, $rootScope, $http, $routeParams, _, pageFactory, paintingFactory){

      $scope.heading = '';
      $scope.subheading = '';
      $scope.body = '';
      $scope.footer = '';
      $scope.errormessage = '';

      if($rootScope.pages.length > 0){
          $scope.page = _.findWhere($rootScope.pages, {menulink: $routeParams.pagelink});
          $scope.image = getImageFromId($scope.page.image);
          if($scope.page == null){
            $scope.errormessage = "Unable to load page.";
          }
      }else{
        $scope.errormessage = "Unable to load pages.";
      }

       function getImageFromId(id) {
         paintingFactory.getPainting(id).then(function(data){
           return data.image;
         });
       }

}]);
