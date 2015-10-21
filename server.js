#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fse      = require('fs-extra');
var mongodb = require('mongodb');
var mongojs = require('mongojs');
var formidable  = require('formidable');
var quickthumb  = require('quickthumb');
var util = require('util');
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
        self.imagedir = process.env.OPENSHIFT_DATA_DIR+'images/';
        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
        var dbName = "/nodejs";
        var connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" + process.env.OPENSHIFT_MONGODB_DB_HOST + dbName;
        self.db = mongojs(connection_string, ['Paintings']);


    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fse.readFileSync('./index.html');
        self.zcache['gallery.html'] = fse.readFileSync('./gallery.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.getroutes = { };

        self.getroutes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        self.getroutes['/gallery'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('gallery.html') );
        };

        self.getroutes['/returnAllPaintings'] = function(req, res){
            self.db.collection('Paintings').find().toArray(function(err, names) {
                res.header("Content-Type:","text/json");
                res.end(JSON.stringify(names));
            });
        };
        self.getroutes['/upload'] = function (req, res){
          res.writeHead(200, {'Content-Type': 'text/html' });
          var form = '<form action="/upload" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
          res.end(form);
        };

        self.postroutes = { };

        self.postroutes['/upload'] = function(req, res) {
            var form = new formidable.IncomingForm();

            form.parse(req, function(err, fields, files) {
                              res.writeHead(200, {'content-type': 'text/plain'});
                              res.write('received upload:\n\n');
                              res.end(util.inspect({fields: fields, files: files}));
                            });
            form.on('end', function(fields, files) {
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


                var data = {
                    title: req.body.title,
                    size: "100x100 test",
                    price: 19999,
                    sold: 0
                  };
                self.db.collection('Paintings').insert(data, function(err, result) {
                  if(err) { throw err; }
                  res.write("<p>Product inserted:</p>");
                  res.end("<p>" + result[0].title + " " + result[0].price + "</p>");
                });
            });
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use('/images',express.static(__dirname+ '/images'));
        //self.app.use(quickthumb.static(__dirname + '/images'));
        //  Add handlers for the app (from the routes).
        for (var g in self.getroutes) {
            self.app.get(g, self.getroutes[g]);
        }
        for (var p in self.postroutes) {
            self.app.post(p, self.postroutes[p]);
        }

    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
