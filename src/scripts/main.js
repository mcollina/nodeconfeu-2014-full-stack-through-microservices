// Require Node modules in the browser thanks to Browserify: http://browserify.org
var bespoke = require('bespoke'),
  cube = require('bespoke-theme-cube'),
  keys = require('bespoke-keys'),
  touch = require('bespoke-touch'),
  bullets = require('bespoke-bullets'),
  scale = require('bespoke-scale'),
  hash = require('bespoke-hash'),
  run = require('bespoke-run'),
  camera = require('bespoke-camera'),
  progress = require('bespoke-progress'),
  state = require('bespoke-state');

// Bespoke.js
bespoke.from('article', [
  cube(),
  keys(),
  touch(),
  run(),
  camera(),
  bullets('li, .bullet'),
  scale(),
  hash(),
  progress(),
  state()
]);

// Prism syntax highlighting
// This is actually loaded from "bower_components" thanks to
// debowerify: https://github.com/eugeneware/debowerify
require('prism');

