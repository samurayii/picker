import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { ILogger } from "logger-flx";
import { IDataCollector, IState } from "./interfaces";

export * from "./interfaces";

const getJsonFilesList = (folder: string, files_list: string[] = []) => {

    const files = fs.readdirSync(folder);

    for (const file_path of files) {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile()) {
            if (/\.json$/.test(file_path)) {
                files_list.push(full_file_path);
            }
        } else {
            getJsonFilesList(full_file_path, files_list);
        }

    }

    return files_list;

};

export class DataCollector implements IDataCollector {

    private readonly _default_state: IState

    private readonly _states: {
        [key: string]: IState
    }
    private readonly _full_folder_path: string

    constructor (
        _path: string,
        _states_files: string[],
        private readonly _logger: ILogger
    ) {

        this._default_state = {};
        this._states = {};

        this._full_folder_path = path.resolve(process.cwd(), _path);

        if (fs.existsSync(this._full_folder_path) === false) {
            fs.mkdirSync(this._full_folder_path, {
                recursive: true
            });
            this._logger.log(`[DataCollector] Store folder ${chalk.gray(this._full_folder_path)} created`);
        }

        for (const file_path of _states_files) {

            const full_file_path = path.resolve(process.cwd(), file_path);

            if (fs.existsSync(full_file_path) === false) {
                this._logger.error(`[DataCollector] File ${chalk.red(full_file_path)} not found`);
                process.exit(1);
            }

            const state: IState = JSON.parse(fs.readFileSync(full_file_path).toString());

            this._logger.log(`[DataCollector] State from ${chalk.gray(full_file_path)} loading`, "dev");

            for (const key in state) {
                this._default_state[key] = state[key];
                this._logger.log(`[DataCollector] Set default key ${chalk.cyan(key)} -> ${chalk.cyan(state[key])}`, "dev");
            }

            this._logger.log(`[DataCollector] Default state from ${chalk.gray(full_file_path)} loaded`, "dev");

        }

        const files = getJsonFilesList(this._full_folder_path);

        for (const file_path of files) {

            const stat = fs.statSync(file_path);

            if (stat.isFile()) {
                if (/\.json$/.test(file_path)) {
                    
                    const state: IState = JSON.parse(fs.readFileSync(file_path).toString());
                    const id = file_path.replace(this._full_folder_path, "").replace(/(^\/|\/$|^\\|\\$)/i, "").replace(/\.json$/i,"").replace(/\\/i, "/");

                    this._states[id] = state;

                    this._logger.log(`[DataCollector] State loaded from ${chalk.gray(file_path)} with ID ${chalk.gray(id)}`, "dev");

                }
            }

        }

        this._logger.log("[DataCollector] created", "dev");

    }
    
    get list (): string[] {
        return Object.keys(this._states);
    }

    exist (id_state: string): boolean {
        if (this._states[id_state] === undefined) {
            return false;
        }
        return true;
    }

    get (id_state: string): IState {

        if (this._states[id_state] === undefined) {
            this._states[id_state] = {};
            this._save(id_state);
        }

        const result_state: IState = {};

        for (const key in this._default_state) {
            result_state[key] = this._default_state[key];
        }

        for (const key in this._states[id_state]) {
            result_state[key] = this._states[id_state][key];
        }

        return result_state;

    }

    add (id_state: string, key: string, data: unknown): void {

        if (this._states[id_state] === undefined) {
            this._states[id_state] = {};
        }

        this._states[id_state][key] = data;

        this._save(id_state);

    }

    _save (id_state: string): void {

        const full_file_path = path.resolve(this._full_folder_path, `${id_state}.json`);
        const dirname = path.dirname(full_file_path);

        if (fs.existsSync(dirname) === false) {
            fs.mkdirSync(dirname, {
                recursive: true
            });
            this._logger.log(`[DataCollector] Folder ${chalk.gray(dirname)} created`, "dev");
        }

        fs.writeFileSync(full_file_path, JSON.stringify(this._states[id_state], null, 4));

        this._logger.log(`[DataCollector] File ${chalk.gray(full_file_path)} updated`, "dev");

    }

}