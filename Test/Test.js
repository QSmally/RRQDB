
const RRQDB = require("../RRQDB");

class TestRRQDB extends RRQDB {
    constructor (...Args) {
        super(...Args);

        const Exec = this.API.exec.bind(this.API);

        this.API.exec = S => {
            console.log(`${this.Table} query:`.padEnd(21), S);
            return Exec(S);
        }

        const Prepare = this.API.prepare.bind(this.API);

        this.API.prepare = S => {
            const Prepared = Prepare(S);
            const Runner   = Prepared.run.bind(Prepared);
            const Getter   = Prepared.get.bind(Prepared);
            const Aller    = Prepared.all.bind(Prepared);

            Prepared.run = (...Values) => {
                for (const Val of Values) S = S.replace("?", `'${Val}'`);
                console.log(`${this.Table} query:`.padEnd(21), S.replace("\n", "").split(" ").filter(P => !!P).map(P => P.trim()).join(" "));
                return Runner(...Values);
            }

            Prepared.get = (...Values) => {
                for (const Val of Values) S = S.replace("?", `'${Val}'`);
                const Getted = Getter(...Values);
                if (Getted) console.log(`${this.Table} query:`.padEnd(21), S);
                return Getted;
            }

            Prepared.all = (...Values) => {
                for (const Val of Values) S = S.replace("?", `'${Val}'`);
                const Alled = Aller(...Values);
                if (Alled && Alled.length) console.log(`${this.Table} query:`.padEnd(21), S);
                return Alled;
            }

            return Prepared;
        }
    }
}

const MyRR = new TestRRQDB("foo", {
    Path: "Test/RRQDB.qdb",
    Size: 10,
    BatchSize: 5
});

MyRR.Erase(...MyRR.Indexes);

console.log("\n\n");
console.time("RRQDB");

for (let i = 0; i < 100; i++) {
    const Address = `${i}`;
    MyRR.Insert(Address, {Foo: "bar"});
}

console.timeEnd("RRQDB");
console.log(MyRR.Select());
