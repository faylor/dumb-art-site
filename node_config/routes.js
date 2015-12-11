var paintings = require('./controllers/paintings.js');
var users = require('./controllers/users.js');
var pages = require('./controllers/pages.js');

module.exports = function(self) {
    self.getroutes = { };

    self.getroutes['/'] = function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(self.cache_get('index.html') );
    };

    self.getroutes['/painting'] = paintings.index;
    self.getroutes['/painting/:id'] = paintings.getSinglePainting;
    self.getroutes['/page'] = pages.index;
    self.getroutes['/page/:menulink'] = pages.getPageByMenuLink;

    self.deleteroutes = {};
    self.deleteroutes['/painting/:id'] = paintings.deletePainting;
    self.deleteroutes['/page/:id'] = pages.deletePage;

    self.putroutes = { };
    self.putroutes['/updateRanking'] = paintings.updateRanking;
    self.putroutes['/page/:id'] = pages.update;

    self.postroutes = { };
    self.postroutes['/login'] = users.login;
    self.postroutes['/register'] = users.save;
    self.postroutes['/painting/:id'] = paintings.updateDataAndFile;

};
