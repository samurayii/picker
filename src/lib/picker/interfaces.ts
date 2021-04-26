export interface IPicker {
    readonly packages: string[]
    collect: (id_project: string, postfix: string) => string
    exist: (id_project: string) => boolean
    get: (id_project: string) => IProjectPackage
}

export interface IProjectPackage {
    readonly id: string
    readonly versions: string[]
    readonly latest: IProjectPackageLatest
    addVersion: (version: string, hash: string) => void
    exist: (version: string) => boolean
}

export interface IProjectPackageLatest {
    build_number: number
    version: string
    hash: string
}

export interface IPackage {
    "x-package": {
        version: string
    }        
}