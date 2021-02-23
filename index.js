import * as rezo from './rezo.js';

rezo.search('fourchette', {relationTypes: ['r_has_part']})
    .then(dump => console.log(dump.getInRelations()))
    .catch(console.error);
