var resourceful = require("../lib/resourceful-redis"),
    should = require('should'),
    redis = require('redis'),
    async = require('async');

describe('redis-engine test', function() {

  /**
   * Define some resources to test
   *
   * Person
   */

  var Person = resourceful.define('person', function() {

    this.use("redis", {
      uri: "redis://127.0.0.1:6379",
      namespace: "people"
    });

    this.string('name');
    this.number('age');
  });

  /**
   * Load Test Data Into Resources
   *
   * This is used in the resourceful-engines test
   * to manipulate and test the results.
   */

  var people = [
    {name: 'Bob', age: 21},
    {name: 'Steve', age: 32},
    {name: 'Joe', age: 43}
  ];

  function createRecords(objects, resource, callback) {
    var objArray = [];

    async.forEach(objects, function(obj, done) {
      createRecord(obj, resource, function(err, i) {
        objArray.push(i);
        done();
      });
    }, function(err) {
      callback(err, objArray);
    });
  }

  function createRecord(obj, resource, callback) {
    resource.create(obj, callback);
  }

  /**
   * Before and after test hooks
   */

  beforeEach(function(done) {
    createRecords(people, Person, function(err, resources) {
      done(err);
    });
  });

  afterEach(function(done) {
    var conn = redis.createClient();
    conn.FLUSHDB(function() {
      done();
    });
  });

  describe("create()", function() {
    it("should create a resource", function(done) {
      Person.create({ name: 'Bob', age: 99 }, function (err, person) {
        should.exist(person.id);
        person.age.should.equal(99);
        done();
      });
    });
  });

  describe("save()", function() {
    it("should save without error", function(done) {
      Person.get(1, function(err, obj) {
        obj.age = 35;
        Person.save(obj, function(e, res) {
          should.not.exist(err);
          obj.age.should.equal(35);
          done();
        });
      });
    });
  });

  describe("update()", function() {
    describe("instance method", function(done) {
      it("should partially update resource", function(done) {
        Person.create({ name: 'Bob', age: 99 }, function (err, person) {
          person.update({name:"Steve"}, function(err) {
            person.name.should.equal("Steve");
            person.age.should.equal(99);
            done();
          });
        });
      });
    });

    describe("constructor method", function(done) {
      it("should partially update resource", function(done) {
        Person.create({ name: 'Bob', age: 99 }, function (err, person) {
          Person.update(person.id, {name:"Steve"}, function(err) {
            Person.get(person.id, function(err, p) {
              p.name.should.equal("Steve");
              p.age.should.equal(99);
              done();
            });
          });
        });
      });
    });
  });

  describe("destroy()", function() {
    it("by id", function(done) {
      Person.create(people.bob, function(err, bob) {
        Person.destroy(bob.id, function(err, result) {
          result.should.equal(1);
          done();
        });
      });
    });
  });

  describe("find()", function() {
    it("by attribute", function(done) {
      Person.find({age: 21}, function(err, people) {
        people.should.have.length(1);
        done();
      });
    });

    it("by id", function(done) {
      Person.get(1, function(err, person) {
        person.name.should.equal('Bob');
        done();
      });
    });
  });

  describe("all", function() {
    it("returns an array of objects", function(done) {
      Person.all(function(err, people) {
        people.should.have.length(3);
        done();
      });
    });
  });

});