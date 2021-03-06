var resourceful = require('../lib/resourceful-redis');

var Creature = resourceful.define('creature', function () {

  // Specify redis engine and connection
  this.use("redis", {
    uri: "redis://DB:Pass@127.0.0.1:6379", // Set connection string here, auth is optional
    namespace: "creatures" // Each model will have a different namespace to use as a key
  });

  this.string('diet');
  this.bool('vertebrate');
  this.array('belly');

  this.timestamps();

  this.prototype.feed = function (food) {
    this.belly.push(food);
  };
});

var wolf = new(Creature)({
  diet:      'carnivore',
  vertebrate: true
});

console.dir(wolf.belly);
wolf.feed('squirrel');
console.dir(wolf.belly);