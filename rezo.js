import Dump from './Dump.js';
import http from 'http';

/**
 * Search for a word in Rézo Dump.
 * @param word {string} word to search for.
 * @param [options] {{outrelation?: boolean, inrelation?: boolean, relationTypes?: string[]}} default: {outrelation: true, inrelation: true}
 * search options. OutRelation is for including or excluding outcoming relation and InRelation for incoming relations.
 * @returns {Promise<Dump>}
 */
export function search(word, options) {
    return new Promise((resolve, reject) => {
        http.get(`http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=test&rel=?gotermsubmit=Chercher&gotermrel=${word}&rel=`,
            function (res) {
                res.setEncoding('latin1');
                let data = '';

                // called when a data chunk is received.
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(new Dump(data.slice(data.indexOf(`<code>`) + 6, data.indexOf(`</code>`)), options));
                });
            }).on("error", (err) => {
            reject(err);
        });
    });
}
