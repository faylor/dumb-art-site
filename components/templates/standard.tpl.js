app.controller('standardTemplateController', ['$scope','$rootScope','$http','$routeParams','_','pageFactory','paintingFactory',
    function ( $scope, $rootScope, $http, $routeParams, _, pageFactory, paintingFactory){

      $scope.heading = '';
      $scope.subheading = '';
      $scope.body = '';
      $scope.footer = '';
      $scope.errormessage = '';

      if($rootScope.pages.length > 0){
          $scope.page = _.findWhere($rootScope.pages, {menulink: $routeParams.pagelink});
          setImageFromId($scope.page.image);
          if($scope.page == null){
            $scope.errormessage = "Unable to load page.";
          }
      }else{
        $scope.errormessage = "Unable to load pages.";
      }

       function setImageFromId(id) {
         $scope.image = '';
         paintingFactory.getPainting(id).then(function(res){
           $scope.image = res.data.image;
         });
       }

}]);
