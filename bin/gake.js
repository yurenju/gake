#!/usr/bin/env node

var exec = require('child_process').exec;
var fs = require('fs');
const RE_TARGET = /(\s*)Successfully remade target file `([\w-\/\.]+)'/;

var matched;
var parent;
var level;
var name;
var nodes = {};
var ordered = [];
var n;
var count = 0;
var output = [];
var output2 = [];

if (process.argv.length > 2) {
  exec('make -dnC ' + process.argv[2], {maxBuffer: 400*1024}, function(error, stdout, stderr) {
    output.push('digraph G {');
    output.push('rankdir="LR"');
    stdout.split('\n').reverse().forEach(function(line, arr) {
      matched = RE_TARGET.exec(line);
      if (matched) {
        count++;
        n = {
          level: matched[1].length / 2,
          name: matched[2].split('/').pop(),
          count: count,
        };
        if (!nodes[n.level]) {
          nodes[n.level] = [];
        }
        nodes[n.level].push(n);

        if (nodes[n.level - 1]) {
          var upperLevel = nodes[n.level - 1];
          var last = upperLevel[upperLevel.length-1];
          ordered.push([last, n]);
        }
      }
    });
    ordered.reverse().forEach(function(r) {
      output.push('  "' + r[0].name + '" -> "' + r[1].name + '"');
      output2.push(r[1].name);
    })
    output.push('}');
    fs.writeFileSync('dependency.dot', output.join('\n'));
    fs.writeFileSync('orderer.txt', output2.join('\n'));
  });
}
