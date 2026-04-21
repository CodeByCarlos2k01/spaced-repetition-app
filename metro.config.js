// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adiciona suporte para arquivos .db
config.resolver.assetExts.push('db');

module.exports = config;