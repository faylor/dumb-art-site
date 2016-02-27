var paintings = require('./controllers/paintings.js');
var users = require('./controllers/users.js');
var pages = require('./controllers/pages.js');
var themes = require('./controllers/themes.js');

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
    self.getroutes['/theme'] = themes.index;

    self.deleteroutes = {};
    self.deleteroutes['/painting/:id'] = paintings.deletePainting;
    self.deleteroutes['/page/:id'] = pages.deletePage;
    self.deleteroutes['/theme/:id'] = themes.deleteTheme;

    self.putroutes = { };
    self.putroutes['/updateRanking'] = paintings.updateRanking;
    self.putroutes['/page/:id'] = pages.update;
    self.putroutes['/theme/:id'] = themes.update;

    self.postroutes = { };
    self.postroutes['/login'] = users.login;
    self.postroutes['/register'] = users.save;
    self.postroutes['/painting/:id'] = paintings.updateDataAndFile;

};
