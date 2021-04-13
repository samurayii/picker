import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as chalk from "chalk";
import { ITemplatesStore, TemplatesStore } from "../../lib/templates-store";

@Controller("/v1/project", "api-server")
export class ApiProject {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _templates_store: ITemplatesStore = <ITemplatesStore>Catalog(TemplatesStore)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    @Get("/(.*)", "api-server")
    async info (ctx: Context): Promise<void> {

        const id = ctx.params[0];
        const raw_flag = ctx.query.raw;

        if (this._templates_store.exist(id) === false) {
            ctx.body = { 
                status: "fail",
                message: `Project "${id}" not found`
            };
            ctx.status = 200;
            return;
        }

        const body = this._templates_store.getBody(id);

        if (raw_flag === "true") {
            ctx.body = body;
        } else {
            ctx.body = { 
                status: "success",
                data: body
            };
        }

        ctx.status = 200;
        
    }

}