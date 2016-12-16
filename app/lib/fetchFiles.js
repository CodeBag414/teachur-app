'use strict';
/**
 * Reads all the files recursively from a dir
 * @param  {string} dir Directory where to start reading files
 * @return {array}     Array of read files
 */
var fs = require('fs');

function fetchFiles(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory())
            results = results.concat(fetchFiles(file));
        else results.push(file);
    });

    return results;
};

module.exports = fetchFiles;
