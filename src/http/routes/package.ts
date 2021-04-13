import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as chalk from "chalk";
import { IPicker, Picker } from "../../lib/picker";

@Controller("/v1/package", "api-server")
export class ApiPackages {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _picker: IPicker = <IPicker>Catalog(Picker)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    @Get("/(.*)/collect", "api-server")
    async collect (ctx: Context): Promise<void> {

        const id = ctx.params[0];
        const postfix = ctx.query.postfix;

        if (this._picker.exist(id) === false) {
            ctx.body = { 
                status: "fail",
                message: `Project "${id}" not found`
            };
            ctx.status = 200;
            return;
        }

        const result = this._picker.collect(id, postfix);

        if (result === undefined) {
            ctx.body = { 
                status: "fail",
                message: `Project "${id}" not collect`
            };
        } else {
            ctx.body = { 
                status: "success",
                data: result
            };
        }

        ctx.status = 200;
        
    }

    @Get("/(.*)", "api-server")
    async info (ctx: Context): Promise<void> {

        const id = ctx.params[0];

        if (this._picker.exist(id) === false) {
            ctx.body = { 
                status: "fail",
                message: `Package "${id}" not found`
            };
            ctx.status = 200;
            return;
        }

        ctx.body = { 
            status: "success",
            data: this._picker.get(id).versions
        };

        ctx.status = 200;
        
    }

}