'use strict';

const argv = require('yargs').argv;
const mandelbrot = require('@frctl/mandelbrot');
const path = require('path');
const fractal = module.exports = require('@frctl/fractal').create();
const pkg = require('./package.json');
const fs = require('fs');

const filename = `${pkg.name}.v${pkg.version}`;
const jsFile = `${filename}.js`;
const jsMinfile = `${filename}.min.js`;

/*
    Add meta data
*/
fractal.set('project.title', 'Lucid search');
fractal.set('project.version', pkg.version);
fractal.set('project.auth', pkg.author);

/*
    Tell Fractal where to look for components.
*/
fractal.components.set('path', path.join(__dirname, 'src'));
fractal.components.set('default.context', {
    jsFile: argv.env.fractalMode === 'server' ? `/${jsFile}` : `../../${jsFile}`,
    jsMinfile: argv.env.fractalMode === 'server' ? `/${jsMinfile}` : `../../${jsMinfile}`,
    ngramJs: argv.env.fractalMode === 'server' ? `/ngram.js` : `../../ngram.js`,
});
fractal.components.set('default.display', {
    height: '100%'
});
fractal.components.set('title', 'Examples');

/*
 * Tell Fractal where to look for documentation pages.
 */
fractal.docs.set('path', path.join(__dirname, 'src/docs'));

/*
 * Tell the Fractal web preview plugin where to look for static assets.
 */
fractal.web.set('static.path', path.join(__dirname, 'src'));

/*
 * Tell the Fractal where to build the static HTML.
 */
fractal.web.set('builder.dest', __dirname + '/dist');

/*
 * Create helpers for docs
 */
const hbs = require('@frctl/handlebars')({
    helpers: {
        jsDownloadLink(){
            return `<a href="./${jsFile}" download="${jsFile}">Download ${pkg.name}</a>`;
        },
        jsMinDownloadLink(){
            return `<a href="./${jsMinfile}" download="${jsMinfile}">Download ${pkg.name} (minified)</a>`;
        },
    },
    noEscape: true
});

fractal.components.engine(hbs);
fractal.docs.engine(hbs);

/*
 * Customize theme
 */
const myCustomisedTheme = mandelbrot({
    nav: ['search', 'docs', 'components', 'information'],
    skin: 'aqua',
    panels: ['html'],
    styles: ['default', '/_subtheme/styles.css'],
    information: [
        {
            label: 'Version',
            value: pkg.version,
        },
        {
            label: 'Built on',
            value: new Date(),
            type: 'time',
            format: value => value.toLocaleDateString('en'),
        }
    ],
});

myCustomisedTheme.addStatic(__dirname + '/theme', '/_subtheme');

fractal.web.theme(myCustomisedTheme);

if (argv.env.fractalMode === 'server'){
    fractal.web.set('server.sync', true);
    fractal.web.set('server.syncOptions', {
        watchOptions: {
            ignored: path.resolve('dist/**/*'),
        },
    });
    fractal.watch();
}
