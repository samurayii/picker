import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as chalk from "chalk";
import { IDataCollector, DataCollector } from "../../lib/data-collector";

@Controller("/v1/state", "api-server")
export class ApiState {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _data_collector: IDataCollector = <IDataCollector>Catalog(DataCollector)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    @Get("/(.*)/set/:key/(.*)", "api-server")
    async add (ctx: Context): Promise<void> {

        const id = ctx.params[0];
        const key = ctx.params.key;
        const value = ctx.params[1];

        if (/^[-0-9a-z_]*$/i.test(key) === false) {

            ctx.body = { 
                status: "fail",
                message: `Key "${key}" does not match regexp "/^[-0-9a-Z_]*$/i"`
            };
    
            ctx.status = 200;

            return;
        }

        this._data_collector.add(id, key, value);

        ctx.body = { 
            status: "success",
            message: `Key "${key}" added/updated to "${id}" project`
        };

        ctx.status = 200;

    }

    @Get("/(.*)/remove/:key", "api-server")
    async remove (ctx: Context): Promise<void> {

        const id = ctx.params[0];
        const key = ctx.params.key;

        if (/^[-0-9a-z_]*$/i.test(key) === false) {

            ctx.body = { 
                status: "fail",
                message: `Key "${key}" does not match regexp "/^[-0-9a-Z_]*$/i"`
            };
    
            ctx.status = 200;

            return;
        }

        this._data_collector.remove(id, key);

        ctx.body = { 
            status: "success",
            message: `Key "${key}" remove from "${id}" project`
        };

        ctx.status = 200;

    }

    @Get("/(.*)", "api-server")
    async info (ctx: Context): Promise<void> {

        const id = ctx.params[0];

        ctx.body = { 
            status: "success",
            data: this._data_collector.get(id)
        };

        ctx.status = 200;
        
    }

}