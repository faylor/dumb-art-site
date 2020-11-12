#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fse      = require('fs-extra');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var quickthumb  = require('quickthumb');
var util = require('util');
var dotenv = require('dotenv');
dotenv.load();
/**
 *  Define the sample application.
 */
 /* DEBUG:
 (function() {
     var childProcess = require("child_process");
     var oldSpawn = childProcess.spawn;
     function mySpawn() {
         console.log('spawn called');
         console.log(arguments);
         var result = oldSpawn.apply(this, arguments);
         return result;
     }
     childProcess.spawn = mySpawn;
 })();
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
        self.port      = process.env.PORT || 8080;
        self.url = process.env.MONGODB_URI;
    };

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.connectDatabase = function () {
       var options = { useMongoClient: true, server: { socketOptions: { keepAlive: 1 } } };
       mongoose.connect(self.url, options);
    };

    self.setupDatabase = function() {

        self.connectDatabase();

        self.db = mongoose.connection;
        self.db.on('error', console.error);
        self.db.on('disconnected', self.connectDatabase);

        // Bootstrap models
        fse.readdirSync(__dirname + '/node_config/models/').forEach(function (file) {
          if (~file.indexOf('.js')) require(__dirname + '/node_config/models/' + file);
        });
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
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {

        require('./node_config/routes.js')(self)
        self.app = express();
        self.app.use('/images',express.static(__dirname+ '/images'));
        self.app.use('/assets',express.static(__dirname+ '/assets'));
        self.app.use('/bower_components',express.static(__dirname+ '/bower_components'));
        self.app.use('/components',express.static(__dirname+ '/components/',{ maxAge: 86400000 }));
        self.app.use('/scripts',express.static(__dirname+ '/scripts'));

        //self.app.use(quickthumb.static(__dirname + '/images'));
        //  Add handlers for the app (from the routes).
        for (var g in self.getroutes) {
            self.app.get(g, self.getroutes[g]);
        }
        for (var p in self.putroutes) {
            self.app.put(p, self.putroutes[p]);
        }
        for (var p in self.postroutes) {
            self.app.post(p, self.postroutes[p]);
        }
        for (var p in self.deleteroutes) {
            self.app.delete(p, self.deleteroutes[p]);
        }
        //self.app.get('googlef0a956483f59ec34.html',function(req, res) {
        // res.sendfile('googlef0a956483f59ec34.html', { root: __dirname+'/' });
        //});
        self.app.all('/*', function(req, res) {
         res.sendfile('index.html', { root: __dirname+'/' });
        });

    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
        self.setupDatabase();
        // Create the express server and routes.
        self.initializeServer();

    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, function() {
          console.log('%s: Node server started on %d ...',Date(Date.now()), self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
