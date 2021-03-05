import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const server = polka(); // You can also use Express

server.use(compression({ threshold: 0 }));

if (dev) server.use(sirv("static", { dev }));

server.use(sapper.middleware());

if (dev)
  server.listen(PORT, (err) => {
    if (err) console.log("error", err);
  });

module.exports = server;
