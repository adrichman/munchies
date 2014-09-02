(function(){
  
  'use strict';
  var chai            = require('chai');
  var assert          = require('assert');
  var expect          = chai.expect;
  var should          = chai.should();
  var http            = require('http');
  var fs              = require('fs');
  var util            = require('util');
  var sinon           = require('sinon');
  var sinonChai       = require("sinon-chai");
  var supertest       = require('supertest');
  var child           = require("child_process");
  var app             = require('../app.js');
  var routes          = require('../routes/index.js');
  var config          = require('../config.js')
  var apiHelpers      = require('../routes/helpers.js');
  var DatabaseService = require('../services/DatabaseService');
  var mongoose        = require('mongoose');
  var q               = require('q');
  var server;
  var api;
  chai.use(sinonChai);
  
  
  describe('Munchies Server', function(done){
    
    before(function(done){
      var path = ('./bin/www');
      server = child.exec(path, {detached: true, stdio: [ 0, 'out', 'err' ]});
      setTimeout(done, 1000); // required because the server needs time to start before requests should be made
    });
    
    after(function(done){
      server.kill();
      done();
    });

    beforeEach(function(done){
      api = supertest(process.env.MUNCHR_URL || 'http://www.fakehost.com:4000');
      done();
    });

    afterEach(function(done){
        done();
    })

    it('it accepts GET requests', function(done){
      api
      .get('/api/v1/trucks')
      .expect(200,done);
    });

    it('it accepts OPTIONS requests', function(done){
      api
      .options('/api/v1/trucks/1')
      .expect(200,done);
    });

    it('rejects POST requests', function(done){
      api
      .post('/api/v1/trucks/1')
      .expect(405, done)
    });
    
    it('rejects PUT requests', function(done){
      api
      .put('/api/v1/trucks/1')
      .expect(405, done)
    });
    
    it('rejects DELETE requests', function(done){
      api
      .delete('/api/v1/trucks/1')
      .expect(405, done)
    });

    it('serves requested static assets if they exist', function(done){
       api
      .get('/')
      .expect(200)
      .expect(/(<!DOCTYPE html>)/, done)
    });

    it('has a routes module', function(done){
      expect(routes).to.be.an('object');
      done();
    });

    it('s routes module has separate api and web site routes', function(done){
      expect(routes.api).to.be.a('function');
      expect(routes.web).to.be.a('function');
      done();
    });

    it('renders HTML from Jade templates', function(done){
      expect(app.get('view engine')).to.equal('jade');
      done()
    });
  
    describe('Munchies API', function (done){

      it('accepts GET requests for resources behind the root \'/api/v1\'', function(done){
          api
          .get('/api/v1/trucks/?lng=1&lat=1&dist=1')
          .expect(200, done)
      });

      it('connects to a database via an external database service', function(done){
        expect(apiHelpers.connectToDb).to.be.a('function');
        done();
      })

      xit('requests all documents in a resource collection if no id is specified', function(done){
        done()
      });

      xit('requests a single document if an id is specified', function(done){
        // var req = {query : { truck : { objectid : 526404 }}};
        // var res = {};
        // res.send = function(arg){
        //   return (function(){}).bind(this, arg)
        // };
        // apiHelpers.get('trucks', req, res, function(){
        //   console.log('YOOO',arguments);
        //   done();
        // })
        // this.timeout(4000);

      });
      
      xit('requests documents with only \'APPROVED\' status', function(done){

      })

      describe('Query Parameters', function(done){

        it('accepts valid longitude, latitude, and distance parameter', function(done){
          api
          .get('/api/v1/trucks/?lng=1&lat=1&dist=1')
          .expect(200, done)
        });
        
      })
    });

    describe('Database Service', function(done){
      describe('methods', function(done){
        
        var stub; 
        var fakeData = [{},{},{}];
        var query = { status: "APPROVED" };
        var db = new DatabaseService();
        var callback;

        beforeEach(function(done) {
          done()
        });

        afterEach(function(done){
          done();
        })
        
        it('has a retrieve method that queries for a resource that it accepts by name ', function(done){
          callback = sinon.spy(db, 'retrieve');
          callback('Truck', query, function(err, doc){ return doc });
          assert(callback.calledWith('Truck'));
          callback.restore();
          done();
        });
      
        xit('has a connect method that accepts a URI to connect to a mongoDB', function(done){
          callback = sinon.spy(db, 'connect');
          callback('mongodb://localhost/munchr');
          assert(callback.alwaysThrew());
          callback.restore();
          done();
        });
      
        it('has a method updateChecksum that overwrites an old checksum with a new one when different', function(done){
          fs.writeFile('../.test_checksum.txt', 'not data', function(err){
            if (err) console.log(err); 
          })

          db.updateChecksum('123445', '../test_checksum').then(function(){
            assert(fs.readFileSync('../.test_checksum.txt') === '123445');
          });
          this.timeout(4000)
          done()
        });

        xit('has a sync method that executes a bulk upsert to the database', function(done){
      
        });

        describe('requiresSync', function(done){

          xit('reads the last known query data\'s checksum from disk', function(done){
        
          });

          xit('calculates a checksum of the recent data from the remote API', function(done){
        
          });
        
          xit('short circuits if there is no change from old and new checksums', function(done){
        
          });
        
          xit('initiates a bulk sync if the old and new checksums differ', function(done){
        
          });

          xit('overwrites an old checksum with a new one when different', function(done){
        
          });

          xit('returns a count of write errors after completing a sync', function(done){
        
          });
        
        })

      })

      describe('helpers module', function(done){
        xit('has a method to handle graceful exits on disconnecting from mongodb', function(done){
        
        });

        xit('has a mapFieldsAndQuery method iterate over the collection returned from the remote api'+ 
            'and form a query object from its documents\' fields and values, and form a bulk query', function(done){
            
        });
      })
      
      describe('queries', function(done){
        xit('performs geospatial queries', function(done){
        
        });
      })
      
      describe('connections', function(done){
              
        xit('stores its state of being connected or disconnected to the database', function(done){
      
        });
        
        xit('exits gracefully on disconnections', function(done){
      
        });

      });
    })
  });

  describe('API Sync Worker', function(done){
    var config  = require('../config.js');
    var ApiSync = require('../apiSync');
    var connection = null;
    
    beforeEach(function(done){
       // ApiSync.run(config.dbPath, function(connection){
       //    if (connection){ 
       //      connection = connection
       //      done();
       //    } else {
       //      process.exit(1);
       //    }
       //  });
    })
    
    describe('connections', function(done){
    
      xit('connects to the Database Service', function(done){
          assert(connection);
          done()
      });
      
      xit('exits properly when disconnecting', function(done){
      
      });
    
    })

    describe('methods', function(done){
      
      it('has a run method to initialize sync', function(done){
        assert(ApiSync.run);
        done();
      });

      it('has a fetchRemoteApi method to retrieve from external API', function(done){
        assert(ApiSync.fetchRemoteApi);
        done();
      });
      
      xit('forms queries from a query object for the appropriate fields', function(done){
      
      });
      
      xit('makes requests to the Database Service to upsert documents', function(done){
        
      });

    });

  });

  describe('Models Module / ORM', function(done){
    var Models;  
    before(function(done){
      Models = require('../models')();
      
      done()
    })
    describe('methods', function(done){
      
      it('has a get method to retrieve instances of Mongoose models', function(done){
        assert(Models.get('Truck'))
        done()
      });
      
      it('holds a reference to a factory for each model', function(done){
        assert(Models.get('Truck') && Models.get('Food'))
        done()
      });

      it('s factories return an instance formed from a mongoose schema', function(done){
        assert(Models.get('Truck').schema)
        done();
      });

    });

  });

}());
