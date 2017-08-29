var Mustache = require('mustache');
var rimraf = require('rimraf');
var ncp = require('ncp').ncp;
var glob = require('glob');
var fs = require('fs');

var program = require('commander');

program
    .option('-c, --config [type]', 'Build for [dev] or [dist]', 'dev')
    .parse(process.argv);

var data = {
    keywords: "argon, aframe, augmented reality, web, javascript"
}

switch (program.config) {

    case 'dev': 
        data.argonjs = "https://rawgit.com/argonjs/argon/develop/dist/argon.js";
        data.aframejs = "https://aframe.io/releases/0.6.1/aframe.min.js";
        data.samples = "https://samples-develop.argonjs.io";
        data.argonaframejs = "../build.js";
        break;

    case 'dist':
        data.argonjs = "https://unpkg.com/@argonjs/argon@^1.2/dist/argon.js";
        data.aframejs = "https://aframe.io/releases/0.5.0/aframe.min.js";
        data.samples = "https://samples.argonjs.io";
        data.argonaframejs = "https://rawgit.com/argonjs/argon-aframe/master/dist/argon-aframe.js";
        break;

    default:
        program.help();
}

rimraf('./_site', function (err) { 
    if (err) return console.error(err);
    console.log('Cleaned _site directory...'); 

    ncp('examples', '_site', (err)=>{
        if (err) return console.error(err);
        console.log('Copied examples to ./_site directory!');

        console.log(`Using data: ${JSON.stringify(data, null, '\t')}`)
        
        glob('./_site/**/*.html', (err, matches) => {
            if (err) return console.error(err);
            
            // disable default escaping
            Mustache.escape = function(text) {return text;};

            for (const match of matches) {
                fs.readFile(match, 'UTF8', (err, str) => {
                    if (err) return console.error(err);
                    fs.writeFile(match, Mustache.render(str, {site: data}), (err) => {
                        console.log(`Rendered ${match}`);
                        if (err) return console.error(err);
                    });
                });
            }
        });
    });
});