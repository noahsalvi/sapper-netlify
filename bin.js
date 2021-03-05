#! /usr/bin/env node
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2, process.argv.length);
const projectPath = args[0] === "." ? "./" : args[0];
const assets = path.join(__dirname, "assets");

if (!args[0]) {
  console.log(
    "😓 You need to specify a path: e.g. npx sapper-netlify my-app 😓"
  );
  process.exit();
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
  return exec(
    `npx degit "sveltejs/sapper-template#rollup" ${args[0]} ${args[1] ?? ""}`
  );
}

function addBuildNetlifyScript() {
  const buildNetlify = path.join(assets, "buildNetlify.js");
  const scriptsPath = path.join(projectPath, "scripts");
  return exec(`cp ${buildNetlify} ${scriptsPath}`);
}

function addRedirects() {
  const _redirects = path.join(assets, "_redirects");
  const staticPath = path.join(projectPath, "static");
  return exec(`cp ${_redirects} ${staticPath}`);
}

function addNetlifyToml() {
  const netlifyToml = path.join(assets, "netlify.toml");
  const destination = projectPath;

  exec(`cp ${netlifyToml} ${destination}`);
}

function modifyServer() {
  const serverFile = path.join(projectPath, "src/server.js");
  const newServerFile = path.join(assets, "server.js");

  exec(`cp ${newServerFile} ${serverFile}`);
}

function addRenderFunction() {
  const renderFnPath = path.join(assets, "/render");
  const destPath = path.join(projectPath, "/functions");
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
  const pkgJSONPath = path.join(projectPath, "package.json");
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
  const pkgJSONPath = path.join(projectPath, "package.json");
  const packageJSON = JSON.parse(fs.readFileSync(pkgJSONPath, "utf8"));
  packageJSON.scripts = Object.assign(packageJSON.scripts, {
    "build-netlify": "node scripts/buildNetlify",
  });

  // Write the package JSON
  fs.writeFileSync(pkgJSONPath, JSON.stringify(packageJSON, null, "  "));
}
