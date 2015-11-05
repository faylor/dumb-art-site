var paintings = require('./controllers/paintings.js');
var users = require('./controllers/users.js');

module.exports = function(self) {
    self.getroutes = { };

    self.getroutes['/'] = function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(self.cache_get('index.html') );
    };

    self.getroutes['/painting'] = paintings.index;

    self.deleteroutes = {};
    self.deleteroutes['/painting/:id'] = paintings.deletePainting;

    self.putroutes = { };
    self.putroutes['/updateRanking'] = paintings.updateRanking;
    //self.putroutes['/painting/:id'] = paintings.update; //??HTML5??

    self.postroutes = { };
    self.postroutes['/login'] = users.login;
    self.postroutes['/register'] = users.save;
    self.postroutes['/painting/:id'] = paintings.updateDataAndFile;

};
