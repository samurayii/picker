import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as chalk from "chalk";
import { IPicker, Picker } from "../../lib/picker";

@Controller("/v1/packages", "api-server")
export class ApiPackage {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _picker: IPicker = <IPicker>Catalog(Picker)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    @Get("/", "api-server")
    async list (ctx: Context): Promise<void> {

        const result = this._picker.packages;

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

}