export enum CmsCollectionType {
    ErrorTemplate = 'error-template',
    Faq = 'faq',
    FaqCategory = 'faq-categories',
}

export interface CmsBaseAttributes {
    createdAt: string
    updatedAt: string
    publishedAt?: string
}

/** Visit strapi docs: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html */
export interface GetListOptions<T> {
    filters?: CmsFilterQuery<T>
    fields?: string | string[]
    populate?: string | string[] | Record<string, GetListOptions<T>>
    sort?: string | string[]
    pagination?: CmsPaginationOptions
}

export interface CmsQuerySelector<T> {
    $eq?: T
    $ne?: T
    $lt?: T
    $lte?: T
    $gt?: T
    $gte?: T
    $in?: T[]
    $notIn?: T[]
    $contains?: T
    $notContains?: T
    $containsi?: T
    $notContainsi?: T
    $null?: boolean
    $notNull?: boolean
    $between?: T extends number ? [number, number] : never
    $startsWith?: T extends string ? string : never
    $endsWith?: T extends string ? string : never
}

export interface CmsRootFilterQuery<T> {
    $or?: CmsFilterQuery<T>[]
    $and?: CmsFilterQuery<T>[]
    [key: string]: unknown
}

export type ApplyBasicQueryCasting<T> = T | T[] | unknown

export type Condition<T> = ApplyBasicQueryCasting<T> | CmsQuerySelector<ApplyBasicQueryCasting<T>>

export type CmsFilterQuery<T> = {
    [P in keyof T]?: Condition<T[P]>
} & CmsRootFilterQuery<T>

export interface CmsPaginationOptions {
    start?: number
    limit?: number
    page?: number
    pageSize?: number
    withCount?: boolean
}

export interface CmsEntries<T extends CmsBaseAttributes> {
    data: CmsEntry<T>[]
    meta: CmsEntriesMeta
}

export interface CmsEntry<T extends CmsBaseAttributes> {
    id: number
    attributes: T
}

export interface ListResponse<T> {
    data: T[]
    meta: CmsEntriesMeta
}

export interface CmsEntriesMeta {
    pagination?: {
        start?: number
        limit?: number
        page?: number
        pageSize?: number
        pageCount?: number
        total: number
    }
}
