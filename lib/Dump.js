'use strict';

/**
 * Dump constructor used to get information from
 *
 * @constructor
 * @param dump {string}
 * @param [options] {{outrelation?: boolean, inrelation?: boolean, relationTypes?: string[]}}
 * @api public
 */
function Dump(dump, options) {
    this._definitions = getDefinition(dump);
    this._nodeTypes = getNodeTypes(dump);
    this._nodeEntries = getNodeEntries(dump);
    this._relationTypes = getRelationTypes(dump);

    const relationTypes = options ? options._relationTypes : undefined;
    this._inRelations = this._getRelations(dump, `r;rid;node1;node2;type;w`, `// les relations entrantes`, relationTypes);
    this._outRelations = this._getRelations(dump, `entrantes : r;rid;node1;node2;type;w`, `// END`, relationTypes);
}

Dump.prototype.constructor = Dump;

function getDefinition(dump) {
    const defs = dump.slice(dump.indexOf('<def>') + 5, dump.indexOf('</def>'));
    return defs.split('<br>');
}

function getNodeTypes(dump) {
    const header = `nt;ntid;'ntname'`;
    const startIndex = dump.indexOf(header) + header.length;
    const endIndex = dump.indexOf(`// les noeuds/termes`);

    let core = dump
        .slice(startIndex, endIndex)
        .replace(' ', '')
        .split('nt;');

    core = core.slice(1, core.length);

    const types = {};
    core.forEach(str => {
        const split = str.split(';');
        types[parseInt(split[0])] = split[1].replace(/^'|'$/gm, '');
    });

    return types;
}

function getNodeEntries(dump) {
    const header = `e;eid;'name';type;w;'formated name'`;
    const startIndex = dump.indexOf(header) + header.length;
    const endIndex = dump.indexOf(`// les types de relations`);

    let core = dump
        .slice(startIndex, endIndex)
        .replace(' ', '')
        .split('e;');

    core = core.slice(1, core.length);

    const entries = {};
    core.forEach(str => {
        const split = str.split(';');
        entries[parseInt(split[0])] = {
            name: split[1].replace(/^'|'$/gm, ''),
            type: parseInt(split[2]),
            weight: parseInt(split[3])
        };
    });

    return entries;
}

function getRelationTypes(dump) {
    const header = `rt;rtid;'trname';'trgpname';'rthelp'`;
    const startIndex = dump.indexOf(header) + header.length;
    const endIndex = dump.indexOf(`// les relations sortantes`);

    let core = dump
        .slice(startIndex, endIndex)
        .replace(' ', '')
        .split('rt;');

    core = core.slice(1, core.length);

    const types = {};
    core.forEach(str => {
        const split = str.split(';');
        types[parseInt(split[0])] = {
            relation: split[1].replace(/^'|'$/gm, ''),
            description: split[2].replace(/^'|'$/gm, ''),
            help: split[3].replace(/^'|'$/gm, '')
        };
    });

    return types;
}

/**
 * @method _getRelations
 * @param dump
 * @param header
 * @param end
 * @param relationTypes
 * @returns {Object}
 * @private
 */
Dump.prototype._getRelations = function(dump, header, end, relationTypes) {
    const startIndex = dump.indexOf(header) + header.length;
    const endIndex = dump.indexOf(end);

    let core = dump
        .slice(startIndex, endIndex)
        .replace(' ', '')
        .split('r;');

    core = core.slice(1, core.length);

    const relations = {};
    if (relationTypes) {
        relationTypes = relationTypes.map(rname => {
            for (let relationTypesKey in this._relationTypes) {
                if (this._relationTypes[relationTypesKey].relation === rname) return parseInt(relationTypesKey);
            }
        });
    }

    core.forEach(str => {
        const split = str.split(';');
        const type = parseInt(split[3]);

        if (relationTypes && relationTypes.length > 0 && !relationTypes.includes(type)) return;

        relations[parseInt(split[0])] = {
            node1: parseInt(split[1]),
            node2: parseInt(split[2]),
            type,
            weight: parseInt(split[4])
        };
    });

    return relations;
}

/**
 * Get inner relations of the word.
 *
 * @param [relationTypes] add this parameter to only include some relation types.
 * @returns {{name: string, type: string, weight: number}[]}
 * @api public
 */
Dump.prototype.getInRelations = function (relationTypes) {
    let relations = Object.keys(this._inRelations).map(rid => {
        return {
            name: this._nodeEntries[this._inRelations[rid].node2].name,
            type: this._relationTypes[this._inRelations[rid].type].relation,
            weight: this._inRelations[rid].weight
        };
    });

    if (relationTypes && relationTypes.length > 0) {
        relations = relations.filter(r => relationTypes.includes(r.type));
    }

    return relations;
}

module.exports = exports = Dump;
