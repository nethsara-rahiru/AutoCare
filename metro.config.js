const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// SQLite's optional browser preview requires its locally bundled WASM engine.
if (!config.resolver.assetExts.includes("wasm"))
  config.resolver.assetExts.push("wasm");
module.exports = config;
