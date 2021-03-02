
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

        const RROptions = {
            Path:      "RRQDB.qdb",
            Memory:    true,
            Size:      200,
            BatchSize: 30,

            ...RRQDB
        };

        super(RROptions.Path, {
            Table:         Identifier,
            FetchAll:      RROptions.Memory,
            SweepInterval: !RROptions.Memory,
            CacheMaxSize:  RROptions.Size
        });

        /**
         * Validated RRQDB options.
         * @name RRQDB#RROptions
         * @type {RawOptions}
         * @readonly
         */
        Object.defineProperty(this, "RROptions", {
            enumerable: true,
            value: RROptions
        });

    }


    /**
     * Inserts a record into the RRQDB.
     * @param {String} Key A unique identifier to insert this document as.
     * @param {Object|Array} Document An event addressed at the key.
     * @returns {Object} An analytics object.
     */
    Insert (Key, Document) {
        if (!this._Ready)                 throw new Error("RRQDB Connection was terminated.");
        if (typeof Key !== "string")      throw new TypeError("Key should be a type of String.");
        if (typeof Document !== "object") throw new TypeError("Document should be a type of Object or Array.");

        const Address = Key.replace(/(\.)/g, "_");
        if (super.Exists(Address)) throw new Error(`Event '${Address}' already exists.`);

        const Analytics = {
            Size:     undefined,
            Batching: 0,
            Erased:   0
        };

        const Content = {
            ...Document,
            _Inserted: Date.now(),
            _Batched: false
        };

        super.Set(Address, Content);
        const Size = super.Size;

        if (Size > this.RROptions.Size) {
            const Batch = super.Select()
            .Order((a, b) => a._Inserted - b._Inserted)
            .Limit(this.RROptions.Size)
            .Keys;

            if (Batch.length) {
                const T = super.Transaction();
                for (const Item of Batch) super.Set(`${Item}._Batched`, true);
                T.Commit();
            }

            Analytics.Batching = Batch.length;
        }

        if (Size > this.RROptions.Size + this.RROptions.BatchSize) {
            const Batch = super.Select(Item => Item._Batched).Keys;
            super.Erase(...Batch);
            Analytics.Erased = Batch.length;
        }

        Analytics.Size = super.Size;

        return Analytics;
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
 * @param {Number} BatchSize A value to exceed to archieve in batch, due to performance reasons.
 */

/**
 * Path string to navigate files.
 * @typedef {String} Pathlike
 */