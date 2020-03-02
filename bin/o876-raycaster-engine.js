#!/usr/bin/env node

/**
 * O876 Raycaster Engine script
 *
 * @description This scripts launches the development server and accepts some options to configure port and directories
 *
 * @author Raphaël Marandet
 * @email raphael.marandet(at)gmail(dot)com
 * @date 2019-06-12
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


const ArgumentParser = require('../tools/argument-parser');
const Service = require('../tools/service/index');


function initArgumentParser() {
    ArgumentParser.setArgumentDefinition([
        {
            name: 'server_port',
            desc: 'Sets the listening port value (by default 8080).',
            short: 'p',
            long: 'port',
            required: false,
            value: {
                required: true,
                type: 'number'
            }
        },
        {
            name: 'vault_dir',
            desc: 'Sets the location of the map editor save files.',
            short: 's',
            long: 'vault-dir',
            required: false,
            value: {
                required: true,
                type: 'string'
            }
        },
        {
            name: 'game_dir',
            desc: 'Defines game project location. If you have a game project that uses this framework you may specify ' +
                'its location to allow the Map Editor exports completed levels there.',
            short: 'g',
            long: 'game-dir',
            required: false,
            value: {
                required: true,
                type: 'string'
            }
        },
        {
            name: 'prefix',
            desc: 'Sets the game fetching url prefix. By default this value is "/game"',
            short: 'x',
            long: 'prefix',
            required: false,
            value: {
                required: true,
                type: 'string'
            }
        },
        {
            name: 'help',
            desc: 'Displays this help.',
            short: 'h',
            long: 'help',
            required: false
        }
    ]);
}

/**
 * The main function
 */
function main() {
    initArgumentParser();
    const r = ArgumentParser.parse(process.argv.slice(2));
    if (r.help) {
        console.log(ArgumentParser.getHelpString());
        return;
    }

    const gpr = x => x in r ? r[x] : undefined;
    const gpe = x => x in process.env ? process.env[x] : undefined;
    const options = {};
    const gpoe = (a, x, y, z) => {
        let r;
        r = gpr(x);
        if (r !== undefined) {
            console.log('setting option', a, 'using argument variable:', x, r);
            options[a] = r;
            return;
        }
        r = gpe(y);
        if (r !== undefined) {
            console.log('setting option', a, 'using env variable:', y, r);
            options[a] = r;
            return;
        }
        r = z;
        console.log('setting option', a, 'using factory value:', r);
        options[a] = r;
    };

    gpoe('port', 'server_port', 'SERVER_PORT');
    gpoe('vault_dir', 'vault_path', 'VAULT_PATH');
    gpoe('vault_dir', 'vault_path', 'VAULT_PATH');

    if ('server_port' in r) {
        options.port = r.server_port;
    }
    if ('vault_dir' in r) {
        options.vault_path = path.resolve(__dirname, '../', r.vault_dir);
    }
    if ('game_dir' in r) {
        options.game_path = path.resolve(__dirname, '../', r.game_dir);
    }
    if ('prefix' in r) {
        options.game_action_prefix = r.prefix;
    }
    Service.run(options);
}

main();