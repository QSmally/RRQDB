
"use strict";

const {Connection} = require("qdatabase");

class RRQDB extends Connection {

    /**
     * An RRQDB interface.
     * @param {String} Identifier Identifier of this RRQDB.
     * @param {RawOptions} RRQDB Additional options for the database.
     * @extends {Connection}
     */
    constructor (Identifier, RRQDB = {}) {

        const PathURL = RRQDB?.Path || "RRQDB";

        super(PathURL, {
            Table:         Identifier,
            FetchAll:      RRQDB.Memory ?? true,
            CacheMaxSize:  RRQDB.Size ?? 200,
            SweepInterval: false
        });

    }

}

module.exports = RRQDB;


/**
 * Validated RRQDB options.
 * @typedef {RawOptions} RRQDB
 * 
 * @param {Pathlike} Path Path to the database file for a connection.
 * @param {Boolean} Memory Whether or not to instantly fetch everything from the database.
 * @param {Number} Size Maximum size to keep rolling the entries at.
 */

/**
 * Path string to navigate files.
 * @typedef {String} Pathlike
 */
