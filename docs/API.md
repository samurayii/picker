# API

## Информация

Сервис предоставляет API, который настраивается в секции файла настройки **api**. API доступно по протоколу HTTP.

### Примеры применения

проверить доступность сервера: `curl -i http://localhost:3001/api/healthcheck` или `curl -i http://localhost:3001/api/`  

### API информации сервиса

| URL | Метод | Код | Описание | Пример ответа/запроса |
| ----- | ----- | ----- | ----- | ----- |
| / | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck/status | GET | 200 | получить статус здоровья | [пример](#v1_status) |
| /v1/projects | GET | 200 | получить список проектов | [пример](#v1_projects) |
| /v1/project/${id} | GET | 200 | получить информацию о проекте по ключу | [пример](#v1_project_id) |
| /v1/project/${id}?raw=true | GET | 200 | получить информацию о проекте по ключу (в формате raw) | [пример](#v1_project_id_raw) |
| /v1/states | GET | 200 | получить список состояний проектов | [пример](#v1_states) |
| /v1/state/${id} | GET | 200 | получить информацию о состоянии проекта по ключу | [пример](#v1_state_id) |
| /v1/state/${id}/set/${key}/${value} | GET | 200 | задать ключ состояния для проекта | [пример](#v1_state_id_key_add) |
| /v1/state/${id}/remove/${key}/${value} | GET | 200 | удалить ключ состояния для проекта | [пример](#v1_state_id_key_remove) |
| /v1/packages | GET | 200 | получить список пакетов | [пример](#v1_packages) |
| /v1/package/${id} | GET | 200 | получить информацию о пакете | [пример](#v1_package_id) |
| /v1/package/${id}/collect | GET | 200 | получить информацию о пакете | [пример](#v1_package_id_collect) |
| /v1/package/${id}/collect?postfix | GET | 200 | получить информацию о пакете | [пример](#v1_package_id_collect) |

## Примеры ответов/запросов

### Базовый ответ провала

Этот ответ возвращается при отказе выполнения запроса. Пример:

```js
{
    "status": "fail",
    "message": "Причина отказа"
}
```

### Базовый ответ ошибки.

Этот ответ возвращается при ошибке на сервере. Пример:

```js
{
    "status": "error",
    "message": "Причина ошибки"
}
```

### <a name="v1_status"></a> Получить статус здоровья: /healthcheck/status

**Тело ответа**
```js
{
    "Healthy": false,
    "Status": "Unhealthy",
    "Uptime": 4,
    "Human_uptime": "4s",
    "Entries": {}
}
```

### <a name="v1_projects"></a> Получить список проектов: /v1/projects

```js
{
    "status": "success",
    "data": [
        "msmz",
        "sub/msmz"
    ]
}
```

### <a name="v1_project_id"></a> Получить информацию о проекте по ключу: /v1/project/${id}

```js
{
    "status": "success",
    "data": "version: \"3.9\"\nx-package:\n    version: \"{{$version}}\"\n    generation: \"v1\"\n    deploy:\n        type: \"manual\"\n        force-recreate: false\n        rollback: true\nservices:\n    grafana: \n        image: {{grafana_image}}\n        container_name: grafana\n        hostname: grafana\n        x-healthcheck:\n            type: \"http\"\n            url: \"http://grafana:3000/api/health\"\n            method: \"get\"\n            timeout: 10\n            delay: 10\n            attempts: 3\n            interval_attempt: 5\n            health_code: 200\n            headers:\n                header1: \"header1-val\"\n        ports:\n            - \"3000:3000\"\n        deploy:\n            replicas: 1\n        networks:\n            - harvester\n        logging:\n            driver: \"json-file\"\n            options:\n                max-size: \"201k\"\n                max-file: \"2\"\n    loki: \n        image: grafana/loki:2.2.0\n        container_name: loki\n        hostname: loki\n        ports:\n            - \"3100:3100\"\n        deploy:\n            replicas: 1\n        networks:\n            - harvester\n        logging:\n            driver: \"json-file\"\n            options:\n                max-size: \"200k\"\n                max-file: \"2\"\n    rabbitmq: \n        image: rabbitmq:3.8-management\n        container_name: rabbitmq\n        hostname: rabbitmq\n        ports:\n            - \"5672:5672\"\n            - \"15672:15672\"\n        deploy:\n            replicas: 1\n        environment:\n            RABBITMQ_DEFAULT_USER: \"root\"\n            RABBITMQ_DEFAULT_PASS: \"password\"\n        networks:\n            - harvester\n        logging:\n            driver: \"json-file\"\n            options:\n                max-size: \"200k\"\n                max-file: \"2\"\nnetworks:\n  harvester:\n    external: false\n    driver: bridge\n    name: harvester"
}
```

### <a name="v1_project_id_raw"></a> Получить информацию о проекте по ключу: /v1/project/${id}?raw=true

```yml
version: "3.9"
x-package:
    version: "{{$version}}"
    generation: "v1"
    deploy:
        type: "manual"
        force-recreate: false
        rollback: true
services:
    grafana: 
        image: {{grafana_image}}
        container_name: grafana
        hostname: grafana
        x-healthcheck:
            type: "http"
            url: "http://grafana:3000/api/health"
            method: "get"
            timeout: 10
            delay: 10
            attempts: 3
            interval_attempt: 5
            health_code: 200
            headers:
                header1: "header1-val"
        ports:
            - "3000:3000"
        deploy:
            replicas: 1
        networks:
            - harvester
        logging:
            driver: "json-file"
            options:
                max-size: "201k"
                max-file: "2"
networks:
  harvester:
    external: false
    driver: bridge
    name: harvester
```

### <a name="v1_states"></a> Получить список состояний проектов: /v1/states

```js
{
    "status": "success",
    "data": [
        "msmz",
        "sub/msmz"
    ]
}
```

### <a name="v1_state_id"></a> Получить информацию о состоянии проекта по ключу: /v1/state/${id}

```js
{
    "status": "success",
    "data": {
        "key1": "key1-val",
        "key2": "key2-val",
        "key3": "key3-val"
    }
}
```

### <a name="v1_state_id_key_add"></a> Задать ключ состояния для проекта: /v1/state/${id}/set/${key}/${value}

```js
{
    "status": "success",
    "message": "Key \"key555\" added/updated to \"msmz\" project"
}
```

### <a name="v1_state_id_key_remove"></a> Удалть ключ состояния для проекта: /v1/state/${id}/remove/${key}/${value}

```js
{
    "status": "success",
    "message": "Key \"key555\" remove from \"msmz\" project"
}
```

### <a name="v1_packages"></a> Получить список пакетов: /v1/packages

```js
{
    "status": "success",
    "data": [
        "msmz",
        "sub/msmz"
    ]
}
```

### <a name="v1_package_id"></a> Получить информацию о пакете: /v1/package/${id}

```js
{
    "status": "success",
    "data": "0.0.1"
}
```

### <a name="v1_package_id_collect"></a> Получить информацию о пакете: /v1/package/${id}/collect

```js
{
    "status": "success",
    "data": "0.0.1-dsfsdf"
}
```
