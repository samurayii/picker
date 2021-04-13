import config from "./lib/entry";
import { Logger } from "logger-flx";
import { Singleton } from "di-ts-decorators";
import { KoaD } from "koa-ts-decorators";
import { Authorization } from "./lib/authorization";
import { DataCollector } from "./lib/data-collector";
import { TemplatesStore } from "./lib/templates-store";
import { Picker } from "./lib/picker";
import * as chalk from "chalk";

//console.log(JSON.stringify(config, null, 4));

import "./http";

const logger = new Logger(config.logger);
const authorization = new Authorization(config.authorization);
const data_collector = new DataCollector(config.data.store, config.data.states, logger);
const templates_store = new TemplatesStore(config.data.templates, logger);
const picker = new Picker(config.data.catalog, data_collector, templates_store, logger);

Singleton("config", config);
Singleton(Logger.name, logger);
Singleton(DataCollector.name, data_collector);
Singleton(TemplatesStore.name, templates_store);
Singleton(Picker.name, picker);

const api_server = new KoaD(config.api, "api-server");

const bootstrap = async () => {

    try {

        api_server.context.authorization = authorization;

        await api_server.listen( () => {
            logger.info(`[api-server] listening on network interface ${chalk.gray(`${api_server.config.listening}${api_server.prefix}`)}`);
        });

    } catch (error) {
        logger.error(error.message);
        logger.log(error.stack);
        process.exit(1);
    }

};

bootstrap();

process.on("SIGTERM", () => {
    logger.log("Termination signal received");
    process.exit();
});