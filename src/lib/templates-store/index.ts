import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { ILogger } from "logger-flx";
import Handlebars from "handlebars";
import { ITemplatesStore } from "./interfaces";

export * from "./interfaces";

const getHbsFilesList = (folder: string, files_list: string[] = []) => {

    const files = fs.readdirSync(folder);

    for (const file_path of files) {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile()) {
            if (/\.hbs$/.test(file_path)) {
                files_list.push(full_file_path);
            }
        } else {
            getHbsFilesList(full_file_path, files_list);
        }

    }

    return files_list;

};

export class TemplatesStore implements ITemplatesStore {

    private readonly _files_list: {
        [key: string]: {
            body: string
            handlebars: HandlebarsTemplateDelegate<unknown>
        } 
    }

    constructor (
        _path: string,
        private readonly _logger: ILogger
    ) {

        this._files_list = {};

        const full_folder_path = path.resolve(process.cwd(), _path);

        if (fs.existsSync(full_folder_path) === false) {
            fs.mkdirSync(full_folder_path, {
                recursive: true
            });
            this._logger.log(`[TemplatesStore] Templates folder ${chalk.gray(full_folder_path)} created`);
        }

        const files = getHbsFilesList(full_folder_path);

        for (const file_path of files) {

            const id = file_path.replace(full_folder_path, "").replace(/(^\/|\/$|^\\|\\$)/ig, "").replace(/\\/ig, "/").replace(/\.hbs$/ig, "");
            const body = fs.readFileSync(file_path).toString();

            this._files_list[id] = {
                handlebars: Handlebars.compile(body),
                body: body
            };

            this._logger.log(`[TemplatesStore] Template ${chalk.gray(file_path)} loaded with ID ${chalk.gray(id)}`, "dev");

        }

        this._logger.log("[TemplatesStore] created", "dev");

    }
    
    get list (): string[] {
        return Object.keys(this._files_list);
    }

    compile (template_id: string, data: unknown): string {
        if (this.exist(template_id) === false) {
            this._logger.error(`[TemplatesStore] Template ${chalk.gray(template_id)} not found`);
            return;
        }

        const handlebars = this._files_list[template_id].handlebars;

        return handlebars(data).trim();
    }

    exist (template_id: string): boolean {
        if (this._files_list[template_id] === undefined) {
            return false;
        }
        return true;
    }

    getBody (template_id: string): string {
        return this._files_list[template_id].body;
    }

}