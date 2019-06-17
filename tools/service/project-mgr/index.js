const util = require('util');
const path = require('path');
const fs = require('fs');

// promisification
const mkdirp = util.promisify(require('mkdirp'));
const stat = util.promisify(fs.stat);
const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);

let BASE_DIR = '.';
const TEMPLATE_DIR = path.resolve(__dirname, 'templates');

let GAME_ROOT_DIR = 'game';
let GAME_SRC_DIR = path.join(GAME_ROOT_DIR, 'src');
let GAME_ASSETS_DIR = path.join(GAME_ROOT_DIR, 'assets');
let GAME_DATA_DIR = path.join(GAME_ROOT_DIR, 'data');
let GAME_DIST_DIR = path.join(GAME_ROOT_DIR, 'dist');
let VAULT_DIR = 'vault';
const JSON_EXT = '.json';


/**
 * Sets a new value for the base directory where the game project will be hosted
 * @param sDir {string}
 */
function setBaseDirectory(sDir) {
    BASE_DIR = sDir;
    GAME_ROOT_DIR = 'game';
    GAME_SRC_DIR = path.join(GAME_ROOT_DIR, 'src');
    GAME_ASSETS_DIR = path.join(GAME_ROOT_DIR, 'assets');
    GAME_DATA_DIR = path.join(GAME_ROOT_DIR, 'data');
    GAME_DIST_DIR = path.join(GAME_ROOT_DIR, 'dist');
    VAULT_DIR = 'vault';
}


const PROJECT_TREE = [

    {
        path: path.join(GAME_ROOT_DIR, 'index.html'),
        template: 'index.html'
    },

    {
        path: path.join(GAME_ROOT_DIR, 'webpack.config.js'),
        template: 'webpack.config.js'
    },

    {
        path: path.join(VAULT_DIR, 'vault_readme.txt'),
        template: 'vault_readme.txt'
    },

    {
        path: path.join(GAME_DIST_DIR, 'dist_readme.txt'),
        template: 'dist_readme.txt'
    },

    {
        path: path.join(GAME_SRC_DIR, 'index.js'),
        template: 'index.js'
    },

    {
        path: path.join(GAME_ASSETS_DIR, 'levels', 'assets_levels_readme.txt'),
        template: 'assets_levels_readme.txt'
    },

    {
        path: path.join(GAME_ASSETS_DIR, 'textures', 'assets_textures_readme.txt'),
        template: 'assets_textures_readme.txt'
    },

    {
        path: path.join(GAME_DATA_DIR, 'tilesets.json'),
        template: 'tilesets.json'
    },

    {
        path: path.join(GAME_DATA_DIR, 'blueprints.json'),
        template: 'blueprints.json'
    },

    {
        path: path.join(GAME_ASSETS_DIR, 'styles', 'base.css'),
        template: 'base.css'
    }

];

/**
 * if the file exists this promise resolves true, else resolves false
 * @param what {string} file name
 * @return {Promise<boolean>}
 */
function exists(what) {
    return new Promise(resolve => {
        stat(what)
            .then(() => resolve(true))
            .catch(err => resolve(false));
    });
}

/**
 * Copy one file content to another file, target and source file names must be specify.
 * The destination folder must exists
 * @param from {string} source file name
 * @param to {string} target file name. File name must be specified, destination folder is not enough
 * @return {Promise<any>}
 */
function copy(from, to) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(to);
        output.on('close', function() {
            resolve(true);
        });
        output.on('error', function(err) {
            reject(err);
        });
        fs.createReadStream(from).pipe(output);
    });
}


/**
 * Returns a list of published levels
 * @returns []
 */
async function getPublishedLevels() {
    const p = path.resolve(GAME_ASSETS_DIR, 'levels');
    const aFiles = await readDir(p, {
        withFileTypes: true
    });
    const aLevels = [];
    for (let i = 0, l = aFiles.length; i < l; ++i) {
        const f = aFiles[i];
        if (f.isFile() && f.name.endsWith(JSON_EXT)) {
            const sFileName = path.resolve(GAME_ASSETS_DIR, 'levels', f.name);
            const content = await readFile(sFileName);
            const data = JSON.parse(content);
            const name = f.name.substr(0, f.name.length - JSON_EXT.length);
            const exported = true;
            const preview = '/game/' + data.preview;
            const st = await stat(sFileName);
            const date = Math.floor(st.mtimeMs / 1000);
            aLevels.push({
                name, preview, exported, date
            });
        }
    }
    return aLevels;
}

async function unpublishLevel(name) {
    const sFileName = path.resolve(GAME_ASSETS_DIR, 'levels', name + JSON_EXT);
    if (await exists(sFileName)) {
        await unlink(sFileName);
    } else {
        console.warn('unpublish', name, 'failed : file does not exist');
    }
}


/**
 * Run a template element.
 * @param oItem {*}
 * @return {Promise<void>}
 */
async function runTemplateItem(oItem) {
    const sTarget = path.resolve(BASE_DIR, oItem.path);
    const sTargetDir = path.dirname(sTarget);
    if (!await exists(sTarget)) {
        if (!await exists(sTargetDir)) {
            await mkdirp(sTargetDir);
        }
        await copy(path.resolve(TEMPLATE_DIR, oItem.template), path.resolve(BASE_DIR, oItem.path));
    }
}

/**
 * run the entire process
 * @param sBaseDir {string} the base directory is the directory where everything will be created
 * @return {Promise<void>}
 */
async function run(sBaseDir) {
    setBaseDirectory(sBaseDir);
    for (let i = 0, l = PROJECT_TREE.length; i < l; ++i) {
        await runTemplateItem(PROJECT_TREE[i]);
    }
}

module.exports = {
    run,
    getPublishedLevels,
    unpublishLevel,
    setBaseDirectory
};
