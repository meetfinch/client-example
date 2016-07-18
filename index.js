"use strict";

const finch = require("finch-core");

const API_KEY = process.env.API_KEY;

const params = {
  key: API_KEY,
  url: process.argv[2]
};

console.log("Attempting to share local site...");

const session = finch.forward(params, function(err, response) {
  if (err) {
    // auth errors usually, or something really bad at the finch end
    console.log("Uh oh, an error we'll need to deal with properly", err);
    process.exit(1);
  }

  if (response.errors.length) {
    console.log("Uh oh, a client error we'll need to deal with properly", response.errors);
    process.exit(1);
  }

  console.log("Got a successful response!", response);

  // a response contains a 'forward' - the shared site, and some
  // lower level connection stuff most clients will ignore

  console.log("\nFinch URL is: %s\n", response.forward.url);
});

// a session object is an event emitter which lets us know about a lot of stuff.
// Some is more important than others, but let's bind to them all for reference

session.on("start", function() {
  console.log("session.start");
});

session.on("ready", function() {
  // session is actually ready to use; we've set up the SSH/WS tunnel
  // this is the most important event to care about on connect
  console.log("session.ready");
});

session.on("revoking", function() {
  console.log("session.revoking");
});

session.on("error", function(err) {
  // no-op; we should immediately get a close
  // which will explain the error
  console.log("session.error", err);
});

session.on("close", function(info) {
  console.log("session.close", info);
});

session.on("closing", function() {
  console.log("session.closing");
});

session.on("idle", function() {
  console.log("session.idle");
});

// @NOTE: This will be NOISY; it gets emitted whenever there's
// data through the connection (which happens a lot). Generally
// best used to animate indicators etc hence why even in this
// sample we don't log anything
session.on("data", function() {
  //console.log("data");
});

process.on("SIGINT", function() {
  if (!session) {
    console.log("no session, exiting");
    process.exit(0);
  }

  finch.close(session, function(err) {
    if (err) {
      console.log("Error closing session", err);
      process.exit(1);
    }

    console.log("Session closed");
    process.exit(0);
  });
});
