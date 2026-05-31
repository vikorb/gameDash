/* eslint-disable @typescript-eslint/no-require-imports */

require("ts-node/register");
require("tsconfig-paths/register");

const path = require("path");

process.chdir(path.join(__dirname, "src"));

const config = require("./src/knexfile.ts");

module.exports = config.default || config;
