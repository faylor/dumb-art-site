angular.module('galleryApp', ['ngNewRouter', 'galleryApp.home', 'galleryApp.gallery', 'galleryApp.contact'])
  .controller('AppController', ['$router', AppController]);

function AppController ($router) {
  $router.config([
    {path: '/', component: 'home'},
    {path: '/contact', component: 'contact'}
  ]);

}
