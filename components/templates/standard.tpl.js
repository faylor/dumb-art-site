app.controller('standardTemplateController', ['$scope','$rootScope','$http','$routeParams','_','pageFactory',
    function ( $scope, $rootScope, $http, $routeParams, _, pageFactory){

      $scope.heading = '';
      $scope.subheading = '';
      $scope.body = '';
      $scope.footer = '';
      $scope.errormessage = '';

      if($rootScope.pages.length > 0){
          $scope.page = _.findWhere($rootScope.pages, {menulink: $routeParams.pagelink});

          if($scope.page == null){
            $scope.errormessage = "Unable to load page.";
          }
      }else{
        $scope.errormessage = "Unable to load pages.";
      }

}]);
