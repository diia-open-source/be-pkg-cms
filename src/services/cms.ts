import { Agent } from 'node:https'

import * as qs from 'qs'

import { ServiceUnavailableError } from '@diia-inhouse/errors'
import { HttpClientResponse, HttpClientService } from '@diia-inhouse/http'
import { HttpStatusCode, Logger } from '@diia-inhouse/types'

import {
    CmsBaseAttributes,
    CmsCollectionType,
    GetListOptions,
    ListResponse,
    MetricLabel,
    MetricLabels,
    Response,
    StrapiConfig,
} from '../interfaces'

export class CmsService {
    constructor(
        private readonly cmsConfig: StrapiConfig,
        private readonly httpService: HttpClientService<MetricLabel>,
        private readonly logger: Logger,
    ) {}

    async getList<RawT extends CmsBaseAttributes, T>(
        collectionType: CmsCollectionType,
        options: GetListOptions<T>,
        dataMapper: { toEntity: (raw: RawT) => T },
    ): Promise<ListResponse<T>> {
        const response = await this.sendRequest(collectionType, options, MetricLabels.strapiGetList)

        const { data, meta } = response.body as ListResponse<RawT>

        return {
            meta,
            data: data.map((item) => dataMapper.toEntity(item)),
        }
    }

    async getLatestRecord<RawT extends CmsBaseAttributes, T>(
        collectionType: CmsCollectionType,
        options: GetListOptions<T>,
        dataMapper: { toEntity: (raw: RawT) => T },
    ): Promise<Response<T> | null> {
        options.sort = this.getSortOptions(options.sort)
        options.pagination = { page: 1, pageSize: 1 }

        const response = await this.sendRequest(collectionType, options, MetricLabels.strapiGetLatestRecord)

        const { data, meta } = response.body as ListResponse<RawT>

        if (data.length > 0) {
            return { meta, data: dataMapper.toEntity(data[0]) }
        }

        this.logger.info('StrapiService: no record found')

        return null
    }

    private getSortOptions(sort?: string | string[]): string | string[] {
        const sortByUpdatedAt = 'updatedAt:desc'

        if (Array.isArray(sort)) {
            return [...sort, sortByUpdatedAt]
        }

        if (typeof sort === 'string') {
            return [sort, sortByUpdatedAt]
        }

        return sortByUpdatedAt
    }

    private async sendRequest<T>(
        collectionType: CmsCollectionType,
        options: GetListOptions<T>,
        metricLabel: MetricLabel,
    ): Promise<HttpClientResponse<T>> {
        const path = `/api/${collectionType}?${qs.stringify(options, { encodeValuesOnly: true })}`

        this.logger.info(`StrapiService: request data`, { collectionType, path })

        const response: HttpClientResponse<T> = await this.httpService.get(path, {
            baseUrl: `${this.cmsConfig.host}:${this.cmsConfig?.port}`,
            headers: { Authorization: `Bearer ${this.cmsConfig.token}` },
            timeout: 30000,
            httpsAgent: new Agent({ rejectUnauthorized: false }),
            metricLabel,
        })

        if (!response.isOk || response?.statusCode !== HttpStatusCode.OK) {
            const { statusCode, body } = response

            this.logger.error('StrapiService: failed to retrieve data', { statusCode, body })

            throw new ServiceUnavailableError('StrapiService: failed to retrieve data')
        }

        this.logger.info(`StrapiService: data retrieved`, { collectionType, body: response?.body })

        return response
    }
}
