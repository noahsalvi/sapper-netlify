#! /usr/bin/env node
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const { exit } = require("process");

const args = process.argv.slice(2, process.argv.length);
const currentDirectoryName = path.basename(process.cwd());
const projectRoot = args[0] === "." ? "./" : args[0];
// const projectRoot = path.join(__dirname, "..");
// const projectRoot = "my-app/";
const assets = path.join(__dirname, "assets");

if (!projectRoot) {
  console.log("😓 You need to specify a name: e.g. npx sapper-netlify my-app");
  exit(1);
}

run();

async function run() {
  console.log("✨ Thanks for choosing sapper-netlify ✨");

  await installSapper();

  addPkgDependencies();

  addRenderFunction();

  addNetlifyToml();

  addRedirects();

  addPkgScript();

  addBuildNetlifyScript();

  modifyServer();
}

function installSapper() {
  const projectName = args[0] === "." ? currentDirectoryName : args[0];

  return exec(`npx degit "sveltejs/sapper-template#rollup" ${args[0]}`);
}

function addBuildNetlifyScript() {
  const buildNetlify = path.join(assets, "buildNetlify.js");
  const scriptsPath = path.join(projectRoot, "scripts");
  return exec(`cp ${buildNetlify} ${scriptsPath}`);
}

function addRedirects() {
  const _redirects = path.join(assets, "_redirects");
  const staticPath = path.join(projectRoot, "static");
  return exec(`cp ${_redirects} ${staticPath}`);
}

function addNetlifyToml() {
  const netlifyToml = path.join(assets, "netlify.toml");
  const destination = projectRoot;

  exec(`cp ${netlifyToml} ${destination}`);
}

function modifyServer() {
  const serverFile = path.join(projectRoot, "src/server.js");
  const newServerFile = path.join(assets, "server.js");

  exec(`cp ${newServerFile} ${serverFile}`);
}

function addRenderFunction() {
  const renderFnPath = path.join(assets, "/render");
  const destPath = path.join(projectRoot, "/functions");
  exec(`mkdir -p ${destPath} && cp -R ${renderFnPath} $_`);
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

function addPkgDependencies() {
  const pkgJSONPath = path.join(projectRoot, "package.json");
  const packageJSON = JSON.parse(fs.readFileSync(pkgJSONPath, "utf8"));
  packageJSON.dependencies = Object.assign(packageJSON.dependencies, {
    "serverless-http": "^2.7.0",
  });

  // Add script for checking
  packageJSON.scripts = Object.assign(packageJSON.scripts, {
    validate: "svelte-check --ignore src/node_modules/@sapper",
  });

  // Write the package JSON
  fs.writeFileSync(pkgJSONPath, JSON.stringify(packageJSON, null, "  "));
}

function addPkgScript() {
  const pkgJSONPath = path.join(projectRoot, "package.json");
  const packageJSON = JSON.parse(fs.readFileSync(pkgJSONPath, "utf8"));
  packageJSON.scripts = Object.assign(packageJSON.scripts, {
    "build-netlify": "node scripts/buildNetlify",
  });

  // Write the package JSON
  fs.writeFileSync(pkgJSONPath, JSON.stringify(packageJSON, null, "  "));
}
