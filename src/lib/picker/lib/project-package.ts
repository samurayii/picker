import { IProjectPackage, IProjectPackageLatest } from "../interfaces";

const packageWeight = (version: string): number => {

    if (/[0-9]+\.[0-9]+\.[0-9]+(-.+|)/i.test(version) === false) {
        return 0;
    }

    const args = version.match(/([0-9]+)\.([0-9]+)\.([0-9]+)(-.+|)/i);

    if (args === null) {
        return 0;
    }

    const weight_1 = parseInt(args[1]) * 1000000000;
    const weight_2 = parseInt(args[2]) * 1000000;
    const weight_3 = parseInt(args[3]);

    return weight_1 + weight_2 + weight_3;
};

export class ProjectPackage implements IProjectPackage {

    private readonly _latest: IProjectPackageLatest
    private readonly _versions: Set<string>

    constructor (
        private readonly _id: string
    ) {
        this._versions = new Set();
        this._latest = {
            prefix: "0.0",
            hash: "",
            version: "0.0.0",
            build_number: 0
        };
    }

    get id (): string {
        return this._id;
    }

    get versions (): string[] {
        const result = [];
        for (const version of this._versions) {
            result.push(version);
        }
        return result;
    }

    get latest (): IProjectPackageLatest {
        return this._latest;
    }

    addVersion (version: string, hash: string): void {

        const weight_old_version = packageWeight(this._latest.version);
        const weight_new_version = packageWeight(version);

        if (weight_new_version > weight_old_version) {

            this._latest.hash = hash;
            this._latest.version = version;

            const args = version.match(/([0-9]+)\.([0-9]+)\.([0-9]+)(-.+|)/i);

            if (Array.isArray(args) === true) {
                this._latest.prefix = `${args[1]}.${args[2]}`;
                this._latest.build_number = parseInt(args[3]);
            }

        }

        this._versions.add(version);

    }

    exist (version: string): boolean {
        return this._versions.has(version);
    }

}