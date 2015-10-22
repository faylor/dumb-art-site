angular.module('app', ['app.home', 'app.gallery', 'app.contact','ngNewRouter'])
  .controller('AppController', ['$router', AppController]);

function AppController ($router) {
  $router.config([
    {path: '/', component: 'home'},
    {path: '/contact', component: 'contact'},
    {path: '/gallery', component: 'gallery'}
  ]);

}
