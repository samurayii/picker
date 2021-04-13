export interface IDataCollector {
    readonly list: string[]
    exist: (id_state: string) => boolean
    get: (id_state: string) => IState
    add: (id_state: string, key: string, data: unknown) => void
}

export interface IState {
    [key: string]: unknown
}