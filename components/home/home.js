app.controller('homeController', ['$scope','$http','pageFactory',
    function ( $scope, $http, pageFactory){

      $scope.heading = '';
      $scope.subheading = '';
      $scope.body = '';
      $scope.footer = '';
    $scope.message = '';
    getPage();

    function getPage() {
        pageFactory.getPageByHeading('Home')
            .success(function (p) {
                $scope.heading = p.heading;
                $scope.subheading = p.subheading;
                $scope.body = p.body;
                $scope.footer = p.footer;

            })
            .error(function (error) {
                $scope.message = 'Unable to load Painting data: ' + error.message;
            });
    }

}]);
