export interface ITemplatesStore {
    readonly list: string[]
    getBody: (template_id: string) => string
    compile: (template_id: string, data: unknown) => string
    exist: (template_id: string) => boolean
}