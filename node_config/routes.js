var paintings = require('./controllers/paintings.js');
var users = require('./controllers/users.js');

module.exports = function(self) {
    self.getroutes = { };

    self.getroutes['/'] = function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(self.cache_get('index.html') );
    };
/*
    self.getroutes['/gallery'] = function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(self.cache_get('gallery.html') );
    };
*/
    self.getroutes['/returnAllPaintings'] = paintings.index;
    /*function(req, res){
        self.db.collection('Paintings').find().toArray(function(err, names) {
            res.header("Content-Type:","text/json");
            res.end(JSON.stringify(names));
        });
    };*/
    self.getroutes['/upload'] = function (req, res){
      res.writeHead(200, {'Content-Type': 'text/html' });
      var form = '<form action="/upload" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
      res.end(form);
    };

    self.postroutes = { };

    /*
        Login / Register
    */
    self.postroutes['/login'] = users.login;
    self.postroutes['/admin/register'] = users.register;

    self.postroutes['/upload'] = function(req, res) {
        var form = new formidable.IncomingForm();
        var fieldValues={};
        form.on('field', function(field, value) {
          console.log(field, value);
          fieldValues[field]=value;
        })
        .on('end', function(fields, files) {
            var temp_path = this.openedFiles[0].path;
            var file_name = this.openedFiles[0].name;

            fse.copy(temp_path, self.imagedir + file_name, function(err) {
                if (err) {
                  console.error(err);
                } else {
                  quickthumb.convert({
                    src: self.imagedir + file_name,
                    dst: self.imagedir + "thumbs/" + file_name,
                    height: 200
                  }, function (err, path) {
                    if (err) {
                      console.error(err);
                    }
                  });
                }
            });


            self.db.collection('Paintings').insert(fieldValues, function(err, result) {
              if(err) { throw err; }
              res.write("<p>Product inserted:</p>");
              res.end("<p>" + result[0].title + " " + result[0].price + "</p>");
            });
        });


        form.parse(req, function(err, fields, files) {
                          res.writeHead(200, {'content-type': 'text/plain'});
                          res.write('received upload:\n\n');
                          res.end(util.inspect({fields: fields, files: files}));
                        });
    };
};
