angular.module('galleryApp', ['ngNewRouter', 'galleryApp.home', 'galleryApp.contact'])
  .controller('AppController', ['$router', AppController]);

AppController.$routeConfig([
  {path: '/', component: 'home'},
  {path: '/contact', component: 'contact'}
]);
function AppController ($router) {}
