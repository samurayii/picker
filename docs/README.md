# Template.

## Информация.

template. 

## Оглавление:
- [Установка](#install)
- [Ключи запуска](#launch)
- [Конфигурация](#configuration)

## <a name="install"></a> Установка и использование.

пример строки запуска: `node /template/app.js -c config.toml`

## <a name="launch"></a> Таблица ключей запуска.
Ключ | Описание
------------ | -------------
--version, -v | вывести номер версии приложения
--help, -h | вызвать справку по ключам запуска
--config, -c | путь к файлу конфигурации в формате toml или json, (переменная среды: TEMPLATE_CONFIG_PATH)

## <a name="configuration"></a> Конфигурация.

Программа настраивается через файл конфигурации двух форматов TOML или JSON. Так же можно настраивать через переменные среды, которые будут считаться первичными. 

### Секции файла конфигурации:

- **logger** - настрока логгера (переменная среды: TEMPLATE_LOGGER)
- **authorization** - настрока авторизации (переменная среды: TEMPLATE_AUTHORIZATION)
- **api** - настройка API (переменная среды: TEMPLATE_API)
- **api.parsing** - настройка парсинга (пакет: https://github.com/dlau/koa-body#readme, переменная среды: TEMPLATE_API_PARSING)
- **docker_healthcheck** - настрока провеки здоровя для контейнера (переменная среды: TEMPLATE_DOCKER_HEALTHCHECK)

### Пример файла конфигурации config.toml.
```toml
[logger]                # настройка логгера
    mode = "prod"       # режим (prod или dev или debug)
    enable = true       # активация логгера
    timestamp = false   # выводить время лога (true или false)
    type = true         # выводить тип лога (true или false)

[authorization]                     # настрока авторизации
    [[authorization.users]]         # массив пользователей
        username = "username"       # имя пользователя
        password = "password"       # пароль пользователя
    [[authorization.users]]         
        token = "xxxxxxxxxxxx"      # токен доступа

[api]                                   # настройка API
    enable = false                      # активация API
    auth = false                        # активация авторизации
    listening = "*:3001"                # настройка слушателя
    prefix = "/api"                     # префикс
    proxy = false                       # когда поле заголовка true proxy будут доверенным
    subdomain_offset = 2                # смещение от поддомена для игнорирования
    proxy_header = "X-Forwarded-For"    # заголовок IP прокси
    ips_count = 0                       # максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность)
    env = "development"                 # среда для сервера koa
    #keys = []                          # массив подписанных ключей cookie
    [api.parsing]                       # настройка парсинга (пакет: https://github.com/dlau/koa-body#readme)
        enable = false                  # активация парсинга
        encoding = "utf-8"              # кодировка парсинга
        form_limit = "56kb"             # лимит для форм
        json_limit = "1mb"              # лимит для json
        text_limit = "1mb"              # лимит для raw
        text = true                     # парсинг raw
        json = true                     # парсинг json
        multipart = false               # парсинг составных частей
        include_unparsed = false        # добавить исходное тело запроса в переменную ctx.request.body
        urlencoded = true               # парсинг данных urlencoded
        json_strict = true              # строгий режим парсинга json
        methods = ["POST"]              # список методов для парсинга

[docker_healthcheck]                            # настрока провеки здоровя для контейнера
    enable = false                              # активация
    timeout = 10                                # время ожидания

```

### Пример минималистичного файла конфигурации config.toml.
```toml
[api]
    enable = true
```

### Таблица параметров конфигурации.

| Параметр | Переменая среды | Тип | Значение | Описание |
| ----- | ----- | ----- | ----- | ----- |
| logger.mode | TEMPLATE_LOGGER_MODE | строка | prod | режим отображения prod, dev или debug |
| logger.enable | TEMPLATE_LOGGER_ENABLE | логический | true | активация логгера |
| logger.timestamp | TEMPLATE_LOGGER_TIMESTAMP | логический | false | выводить время лога (true или false) |
| logger.type | TEMPLATE_LOGGER_TYPE | логический | true | выводить тип лога (true или false) |
| authorization.users | TEMPLATE_AUTHORIZATION_USERS | массив | [] | массив пользователей |
| api.enable | TEMPLATE_API_ENABLE | логический | false | активация API (true или false) |
| api.auth | TEMPLATE_API_AUTH | логический | false | активация авторизации (true или false) |
| api.listening | TEMPLATE_API_LISTENING | строка | *:3001 | настройка слушателя, формат <хост>:<порт> |
| api.prefix | TEMPLATE_API_PREFIX | строка | /api | префикс |
| api.proxy | TEMPLATE_API_PROXY | логический | false | когда поле заголовка true proxy будут доверенным |
| api.subdomain_offset | TEMPLATE_API_SUBDOMAIN_OFFSET | число | 2 | смещение от поддомена для игнорирования |
| api.proxy_header | TEMPLATE_API_PROXY_HEADER | строка | X-Forwarded-For | заголовок IP прокси |
| api.ips_count | TEMPLATE_API_IPS_COUNT | число | 0 | максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность) |
| api.env | TEMPLATE_API_ENV | строка | development | среда для сервера [koa](https://www.npmjs.com/package/koa) |
| api.keys | TEMPLATE_API_KEYS | строка[] |  | массив подписанных ключей cookie |
| api.parsing.enable | TEMPLATE_API_PARSING_ENABLE | логический | false | активация парсинга (true или false) |
| api.parsing.encoding | TEMPLATE_API_PARSING_ENCODING | строка | utf-8 | кодировка парсинга |
| api.parsing.form_limit | TEMPLATE_API_PARSING_FORM_LIMIT | строка | 56kb | лимит для форм |
| api.parsing.json_limit | TEMPLATE_API_PARSING_JSON_LIMIT | строка | 1mb | лимит для json |
| api.parsing.text_limit | TEMPLATE_API_PARSING_TEXT_LIMIT | строка | 1mb | лимит для raw |
| api.parsing.text | TEMPLATE_API_PARSING_TEXT | логический | true | парсинг raw |
| api.parsing.json | TEMPLATE_API_PARSING_JSON | логический | true | парсинг json |
| api.parsing.multipart | TEMPLATE_API_PARSING_MULTIPART | логический | false | парсинг составных частей |
| api.parsing.include_unparsed | TEMPLATE_API_PARSING_INCLUDE_UNPARSED | логический | false | добавить исходное тело запроса в переменную ctx.request.body |
| api.parsing.urlencoded | TEMPLATE_API_PARSING_URLENCODED | логический | true | парсинг данных urlencoded |
| api.parsing.json_strict | TEMPLATE_API_PARSING_JSON_STRICT | логический | true | строгий режим парсинга json |
| api.parsing.methods | TEMPLATE_API_PARSING_METHODS | строка[] | ["POST"] | список методов для парсинга POST, PUT и/или PATCH |
| docke_healthcheck.enable | TEMPLATE_DOCKER_HEALTHCHECK_ENABLE | логический | false | активация |
| docke_healthcheck.timeout | TEMPLATE_DOCKER_HEALTHCHECK_TIMEOUT | число | 10 | время ожидания в секундах |