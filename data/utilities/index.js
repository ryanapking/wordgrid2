const config = require('./config');
const applyMoves = require('./functions/applyMoves');
const calculations = require('./functions/calculations');
const checks = require('./functions/checks');
const dataConversions = require('./functions/dataConversions');
const generators = require('./functions/generators');
const getters = require('./functions/getters');

module.exports = {
  ...config,
  ...applyMoves,
  ...calculations,
  ...checks,
  ...dataConversions,
  ...generators,
  ...getters,
};