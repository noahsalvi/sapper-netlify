const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

const buildPath = path.join(__dirname, "/../__sapper__");
const functionsBuildPath = path.join(
  __dirname,
  "/../functions/render/__sapper__"
);

run();

async function run() {
  await exec(`rm -rf ${functionsBuildPath}`);

  await exec(`npm run build`);

  await exec(`cp -R ${buildPath} ${functionsBuildPath}`);

  const staticPath = path.join(__dirname, "/../static/");

  await exec(`cp -R ${staticPath} ${buildPath}/build`);

  fixServerImportsInRenderFunction();
}

function fixServerImportsInRenderFunction() {
  const server = path.join(
    __dirname,
    "/../functions/render/__sapper__/build/server/server.js"
  );

  fs.readFile(server, "utf8", function (err, data) {
    if (err) return console.log(err);

    const result = data.replace(
      `"__sapper__/build"`,
      `path.join(__dirname + "/..")`
    );

    fs.writeFile(server, result, "utf8", function (err) {
      if (err) return console.log(err);
    });
  });
}

function exec(command) {
  return new Promise((fulfil, reject) => {
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      fulfil({ stdout, stderr });
    });
  });
}
// "build": " cp _redirects __sapper__/build; cp -R static/ functions/noah/static; node test; cp -a static/. __sapper__/build/",

// const fileName = "functions/noah/__sapper__/build/server/server.js";
// fs.readFile(fileName, "utf8", function (err, data) {
//   if (err) {
//     return console.log(err);
//   }
//   var result = data.replace(
//     `"__sapper__/build"`,
//     `path.join(__dirname + "/..")`
//   );

//   fs.writeFile(fileName, result, "utf8", function (err) {
//     if (err) return console.log(err);
//   });
// });
