"use strict";
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.PORT = process.env.PORT || 3000;

const serverless = require("serverless-http");
const server = require("./build/server/server");
module.exports.handler = serverless(server);
