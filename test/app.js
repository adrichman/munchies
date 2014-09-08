// (function(){
  
  'use strict';
  var _               = require('lodash');
  var config          = require('../config.js');
  var app             = require('../app.js');
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
  var routes          = require('../routes/index.js');
  var config          = require('../config.js')
  var apiHelpers      = require('../routes/helpers.js');
  var DatabaseService = require('../services/DatabaseService');
  var mongoose        = require('mongoose');
  var q               = require('q');
  var db              = new DatabaseService();
  var server;
  var api;
  chai.use(sinonChai);
  
  
  describe('Munchies Server', function(done){
    var stub, fakeData, query, callback, promise;

    this.timeout(20000);
    api = supertest(app);

    after(function(done){
      done();
    })

    it('it accepts GET requests', function(done){
      api
      .get('/api/v1/trucks')
      .expect(200)
      .end(function(err, res){
        if (err) done(err);
        else done();
      });
    });

    it('it accepts OPTIONS requests', function(done){
      api
      .options('/api/v1/trucks/1')
      .expect(200)
      .end(function(err, res){
        if (err) done(err);
        else done();
      });
    });

    it('rejects POST requests', function(done){
      api
      .post('/api/v1/trucks/1')
      .expect(405)
      .end(function(err, res){
        if (err) done(err);
        else done();
      });
    });
    
    it('rejects PUT requests', function(done){
      api
      .put('/api/v1/trucks/1')
      .expect(405)
      .end(function(err, res){
        if (err) done(err);
        else done();
      });
    });
    
    it('rejects DELETE requests', function(done){
      api
      .delete('/api/v1/trucks/1')
      .expect(405)
      .end(function(err, res){
        if (err) done(err);
        else done();
      });
    });

    it('serves requested static assets if they exist', function(done){
       api
      .get('/')
      .expect(200)
      .expect(/(<!DOCTYPE html>)/)
      .end(function(err, res){
        if (err) done(err);
        else done();
      });
    });

    it('has a routes module', function(done){
      expect(routes).to.be.an('object')
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
          .expect(200)
          .end(function(err, res){
            if (err) done(err);
            else done();
          });
      });

      it('connects to a database via an external database service', function(done){
        expect(apiHelpers.connectToDb).to.be.a('function');
        done();
      })

      it('requests all documents in a resource collection if no id is specified', function(done){
        api
        .get('/api/v1/trucks')
        .expect(function(res){
          if (!res.type.match(/json/)) throw new Error('content-type not json');
          if (res.status !== 200)  throw new Error('status code not 200');
          if (res.body.length < 100) throw new Error('unexpected length of response body');
        })
        .end(done);
      })

      it('requests a single document if an id is specified', function(done){
        var req = {query : { truck : { objectid : '526404' }}};
        var res = {};
        api
        .get('/api/v1/trucks/' + req.query.truck.objectid)
        .expect(function(res){
          if (res.body.length > 1) throw new Error('unexpected length of response body')
          if (res.body.objectid !== req.query.truck.objectid) throw new Error('unexpected response body')
        })
        .end(done);
      });
      
      it('requests documents with only \'APPROVED\' status', function(done){
        api
        .get('/api/v1/trucks')
        .expect(function(res){
          _(res.body).forEach(function(truck){
            if (truck.status !== 'APPROVED') throw new Error('incorrect status for truck:' + JSON.stringify(truck));
          })
        })
        .end(done);
      })

      describe('Query Parameters', function(done){
        it('accepts valid longitude, latitude, and distance parameter', function(done){
          api
          .get('/api/v1/trucks/?lng=1&lat=1&dist=1')
          .expect(200)
          .end(function(err, res){
            if (err) done(err)
            else done();
          });
        });
      })
    });

    describe('Database Service', function(done){
      describe('methods', function(done){

        after(function(done){
          db.disconnect();
          done();
        });

        it('has a retrieve method that queries for a resource that it accepts by name ', function(done){
          callback = sinon.spy(db, 'retrieve');
          callback('Truck', query, function(err, doc){ return doc });
          assert(callback.calledWith('Truck'));
          callback.restore();
          done();
        });
      
        it('has a connect method that accepts a URI to connect to a mongoDB', function(done){
          // debugger;
          var deferred = q.defer();
          var connect;
          fakeData = [{},{},{}];
          query = { status: "APPROVED" };

          stub = sinon.stub(db, 'connect');
          stub.withArgs('mongodb://fakeuri').returns(q.reject(fakeData));
          
          stub.withArgs(config.db).returns(q.resolve(fakeData));
          connect = db.connect(config.db);
          connect.then(function(){
            expect(connect.inspect().state).to.equal('fulfilled');
            stub.restore();
            done();
          })
          .catch(done, done)
        });
      
        it('has a method updateChecksum that overwrites an old checksum with a new one when different', function(done){
          db.updateChecksum('1234567890', '../.test_checksum')
          .then(function(){
            expect((new Buffer(fs.readFileSync('../.test_checksum'))).toString()).to.equal('1234567890');
            done()
          })
          .catch(done,done);
        });

  //       xit('has a sync method that executes a bulk upsert to the database', function(done){
      
  //       });

        // describe('requiresSync', function(done){

          // xit('reads the last known query data\'s checksum from disk', function(done){
        
          // });

  //         xit('calculates a checksum of the recent data from the remote API', function(done){
        
  //         });
        
  //         xit('short circuits if there is no change from old and new checksums', function(done){
        
  //         });
        
  //         xit('initiates a bulk sync if the old and new checksums differ', function(done){
        
  //         });

  //         xit('overwrites an old checksum with a new one when different', function(done){
        
  //         });

  //         xit('returns a count of write errors after completing a sync', function(done){
        
  //         });
        
        // })

      })

      describe('helpers module', function(done){
        var dbServiceHelpers = require('../services/DatabaseService/helpers.js')(mongoose, _, console.log)
        
        it('has a method to handle graceful exits on disconnecting from mongodb', function(done){
          assert(dbServiceHelpers.gracefulExit);
          done();
        });

        it('has a mapFieldsAndQuery method iterate over the collection returned from the remote api'+ 
            'and form a query object from its documents\' fields and values, and form a bulk query', function(done){
          assert(dbServiceHelpers.mapFieldsAndQuery);
          done();    
        });
      
  //     describe('queries', function(done){
  //       xit('performs geospatial queries', function(done){
        
  //       });
  //     })
      
      });
      
      describe('connections', function(done){
              
        it('stores its state of being connected or disconnected to the database', function(done){
          expect(db.isConnected).to.be.a('Boolean');
          done();
        });
        
        // it('exits gracefully on disconnections', function(done){
                  
        // })
      });
    });
  });

  describe('API Sync Worker', function(done){
    var ApiSync = require('../apiSync');
    var connection = null;

    describe('methods', function(done){
      
      it('has a run method to initialize sync', function(done){
        assert(ApiSync.run);
        done();
      });

      it('has a fetchRemoteApi method to retrieve from external API', function(done){
        assert(ApiSync.fetchRemoteApi);
        done();
      });
      
      // xit('forms queries from a query object for the appropriate fields', function(done){
      //   ApiSync.run(config.dbPath,function(connection){
      //     if (connection) {
      //       ApiSync.fetchRemoteApi(function(query){
      //         assert(query)
      //         done();
      //       });
      //     }
      //   })
      // });
      
      // xit('makes requests to the Database Service to upsert documents', function(done){
        
      // });

    });

    describe('connections', function(done){
      it('connects to the Database Service', function(done){
        ApiSync.run(config.dbPath, function(connection){
          assert(connection);
          done()
        });
      });
    })
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
    }) 
  });


// }());
