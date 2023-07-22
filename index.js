const fs = require("fs");
const fsPromises = fs.promises;
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");

const source = "nextjs";
const basePath = "/" + generateUUIDLowerCase();
const destination = "public" + basePath;

app.use(express.static("public"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post("/", async (req, res) => {
  const makeDirectories = await makeDirectoryAndCopyFiles();
  const installDependencies = await installDeps();
  console.log({ makeDirectories, installDependencies });
});

app.listen(port, () =>
  console.log(`API Server is running... http://localhost:${port}`)
);

async function makeDirectoryAndCopyFiles() {
  let count = 0;

  // If directory does not exist, create it.
  if (!fs.existsSync(destination)) {
    await fsPromises.mkdir(destination, { recursive: true }, (err) => {
      if (err) {
        if (count < 3) {
          count++;
          makeDirectoryAndCopyFiles();
        }
        throw err;
      }
      // reset count
      count = 0;
      console.log("DIR_CREATED");
    });
  }

  await fsPromises.cp(source, destination, { recursive: true }, (err) => {
    if (err) {
      if (count < 3) {
        count++;
        makeDirectoryAndCopyFiles();
      }
      throw err;
    }
    // reset count
    count = 0;
    console.log("FRAMEWORK_COPIED");
  });

  await fsPromises.cp(
    "themes/gallery",
    destination,
    {
      recursive: true,
      force: true,
    },
    (err) => {
      if (err) {
        if (count < 3) {
          count++;
          makeDirectoryAndCopyFiles();
        }
        throw err;
      }
      // reset count
      count = 0;
      console.log("THEME_COPIED");
    }
  );

  // Update next.config.js
  await addBasePathToNextConfig();

  // Compare the two directories.
  // if they are the same, we should rerun the function.
  compareDirectories(source, destination, makeDirectoryAndCopyFiles);

  // Check directories have actually been created
  // and files have been copied
  // before returning "DONE_MAKING_DIRECTORIES"

  return "DONE_MAKING_DIRECTORIES";

  // exec("cd public/bxuxzn");
  // exec("npm run install");
  // exec(`cd public/bxuxzn && npm install`, { stdio: [0, 1, 2] });

  // npm install next@latest react@latest react-dom@latest
  // npm install --prefix ${destination} next@latest react@latest react-dom@latest && cd ${destination} touch index.js && echo "console.log('done!')" >> index.js && npm run build && npm run start
}

async function installDeps() {
  const util = require("node:util");
  const exec = util.promisify(require("node:child_process").exec);

  const { stdout, stderr } = await exec(
    `cd ${destination} && npm install && npm run build && npm start`,
    {
      stdio: [0, 1, 2],
    }
  );
  // NODE_ENV=production node server.js
  // const { stdout, stderr } = await exec(
  //   `cd ${destination} && npm install && npm run build && npm start -- --port 3001`,
  //   {
  //     stdio: [0, 1, 2],
  //   }
  // );

  return stdout ?? stderr;
}

async function compareDirectories(source, destination, callback) {
  const dircompare = require("dir-compare");
  if (
    await dircompare.compare(source, destination, {
      compareContent: true,
    }).same
  ) {
    callback();
  }
}

// write function that adds basepath to next.config.js
async function addBasePathToNextConfig() {
  const nextConfigPath = path.join(__dirname, destination, "next.config.js");
  const nextConfig = require(nextConfigPath);
  nextConfig.basePath = basePath;
  await fsPromises.writeFile(
    nextConfigPath,
    `/** @type {import('next').NextConfig} */
    const nextConfig = ${JSON.stringify(nextConfig)};
    
    module.exports = nextConfig;`,
    (err) => {
      if (err) throw err;
      console.log("NEXT_CONFIG_UPDATED");
    }
  );
}

// function that generates a a uuid in lowercase
function generateUUIDLowerCase() {
  const { v4: uuidv4 } = require("uuid");
  return uuidv4().toLowerCase();
}
