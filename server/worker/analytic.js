var Analytics = require("analytics-node");
var analytics = new Analytics("f45XYIvSNfiIRPZw6lqPhqRZlqtsu7Vx", {
  flushAt: 1,
  flushAfter: 1000
});

analytics.identify({
  userId: "019mr8mf4r",
  traits: {
    name: "Michael Bolton",
    email: "mbolton@initech.com",
    plan: "Enterprise",
    friends: 42
  }
});

analytics.track({
  userId: "019mr8mf4r",
  event: "Item Purchased",
  properties: {
    revenue: 39.95,
    shippingMethod: "2-day"
  }
});

analytics.track(
  {
    userId: "019mr8mf4r",
    event: "Ultimate Played"
  },
  function(err, batch) {
    if (err) console.log(err); // There was an error flushing your message...
    // Your message was successfully flushed!
  }
);

analytics.flush(function(err, batch) {
  if (err) console.log(err);
  console.log("Flushed, and now this program can exit!");
});
