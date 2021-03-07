const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

const buildPath = path.join(__dirname, "/../__sapper__/build");
const functionsBuildPath = path.join(__dirname, "/../functions/render/build");
const staticPath = path.join(__dirname, "/../static/");

run();

async function run() {
  // Delete previous function build
  await exec(`rm -rf ${functionsBuildPath}`);

  // Build the sapper project
  await exec(`npm run build`);

  // Copy build to function
  await exec(`rsync -av ${buildPath}/ ${functionsBuildPath} --exclude client`);

  // Copy static files to project build
  await exec(`cp -a ${staticPath}/. ${buildPath}`);

  // Add _redirects file to build folder (publish folder)
  addRedirectsFile();

  // Fix the path in the function server.js file to work with the project structure
  fixBuildDirPathInServerFile();
}

function addRedirectsFile() {
  const _redirectsPath = path.join(buildPath, "_redirects");
  fs.writeFileSync(_redirectsPath, "/* /.netlify/functions/render 200", {
    encoding: "utf-8",
  });
}

function fixBuildDirPathInServerFile() {
  const server = path.join(functionsBuildPath, "server/server.js");

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
