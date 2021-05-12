import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import jtomler from "jtomler";
import { ILogger } from "logger-flx";
import { IPackage, IPicker, IProjectPackage } from "./interfaces";
import { IDataCollector } from "../data-collector";
import { ITemplatesStore } from "../templates-store";
import { ProjectPackage } from "./lib/project-package";

export * from "./interfaces";

const getYmlFilesList = (folder: string, files_list: string[] = []) => {

    const files = fs.readdirSync(folder);

    for (const file_path of files) {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile()) {
            if (/\.(yml|yaml)$/.test(file_path)) {
                files_list.push(full_file_path);
            }
        } else {
            getYmlFilesList(full_file_path, files_list);
        }

    }

    return files_list;

};

export class Picker implements IPicker {

    private readonly _full_folder_path: string
    private readonly _packages_list: {
        [key: string]: IProjectPackage
    }

    constructor (
        _path: string,
        private readonly _data_collector: IDataCollector,
        private readonly _templates_store: ITemplatesStore,
        private readonly _logger: ILogger
    ) {

        this._full_folder_path = path.resolve(process.cwd(), _path);
        this._packages_list = {};

        if (fs.existsSync(this._full_folder_path) === false) {
            fs.mkdirSync(this._full_folder_path, {
                recursive: true
            });
            this._logger.log(`[Picker] Catalog folder ${chalk.gray(this._full_folder_path)} created`);
        }

        const files = getYmlFilesList(this._full_folder_path);

        for (const file_path of files) {

            const id = path.dirname(file_path.replace(this._full_folder_path, "").replace(/(^\/|\/$|^\\|\\$)/ig, "").replace(/\\/ig, "/"));
            const version = path.basename(file_path.replace(this._full_folder_path, "").replace(/(^\/|\/$|^\\|\\$)/ig, "").replace(/\\/ig, "/")).replace(/\.(yml|yaml)$/ig, "");
            const body = fs.readFileSync(file_path);
            const hash = crypto.createHash("md5").update(body).digest("hex");

            if (this._packages_list[id] === undefined) {
                this._packages_list[id] = new ProjectPackage(id);
            }

            this._packages_list[id].addVersion(version, hash);

            this._logger.log(`[Picker] For project ${chalk.gray(id)} loaded version ${chalk.gray(version)}`, "dev");

        }

        this._logger.log("[Picker] created", "dev");

    }
    
    get packages (): string[] {
        return this._templates_store.list;
    }

    exist (id_project: string): boolean {
        return this._templates_store.list.includes(id_project);
    }

    get (id_project: string): IProjectPackage {
        if (this._packages_list[id_project] === undefined) {
            this._packages_list[id_project] = new ProjectPackage(id_project);
        }
        return this._packages_list[id_project];
    }

    collect (id_project: string, postfix: string): string {

        if (this._templates_store.exist(id_project) === false) {
            return;
        }

        this._logger.log(`[Picker] Collecting package for project ${chalk.gray(id_project)}`, "dev");

        if (this._packages_list[id_project] === undefined) {
            this._packages_list[id_project] = new ProjectPackage(id_project);
        }

        const project_package = this._packages_list[id_project];
        const check_data = this._data_collector.get(id_project);
        const latest_package = project_package.latest;

        check_data["$version"] = latest_package.build_number;

        const check_body = this._templates_store.compile(id_project, check_data);
        const check_hash = crypto.createHash("md5").update(check_body).digest("hex");
        
        if (latest_package.hash === check_hash) {
            this._logger.log(`[Picker] Hash package for project ${chalk.gray(id_project)} not change`, "dev");
            return latest_package.version;
        }

        let version = `${latest_package.build_number+1}`;
        const data = this._data_collector.get(id_project);


        this._logger.log(`[Picker] State of project ${chalk.gray(id_project)}:`, "debug");
        this._logger.log(JSON.stringify(data, null, 4), "debug");

        if (postfix !== undefined) {
            version = `${version}-${postfix}`;
        }

        data["$version"] = version;

        this._logger.log(`[Picker] Result state for project ${chalk.gray(id_project)}:`, "debug");
        this._logger.log(JSON.stringify(data, null, 4), "debug");

        this._logger.log(`[Picker] Collecting package whit dynamic version ${chalk.gray(data["$version"])} for project ${chalk.gray(id_project)}`, "dev");

        const body = this._templates_store.compile(id_project, data);
        const body_json = <IPackage>jtomler(body.toString(), false);
        const hash = crypto.createHash("md5").update(body).digest("hex");
        const full_file_path = path.resolve(this._full_folder_path, `${id_project}/${body_json["x-package"].version}.yml`);
        const dirname = path.dirname(full_file_path);

        if (fs.existsSync(dirname) === false) {
            fs.mkdirSync(dirname, {
                recursive: true
            });
            this._logger.log(`[Picker] Folder ${chalk.gray(dirname)} created`, "dev");
        }

        fs.writeFileSync(full_file_path, body);

        project_package.addVersion(body_json["x-package"].version, hash);

        this._logger.log(`[Picker] Created package file ${chalk.gray(full_file_path)} for project ${chalk.gray(id_project)}`, "dev");

        return body_json["x-package"].version;

    }

}