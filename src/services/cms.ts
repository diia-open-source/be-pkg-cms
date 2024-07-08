import * as qs from 'qs'

import { ServiceUnavailableError } from '@diia-inhouse/errors'
import { HttpService, HttpServiceResponse } from '@diia-inhouse/http'
import { HttpStatusCode, Logger } from '@diia-inhouse/types'

import { StrapiConfig } from '../interfaces'
import { CmsBaseAttributes, CmsCollectionType, CmsEntries, GetListOptions, ListResponse } from '../interfaces/cms'

export class CmsService {
    constructor(
        private readonly cmsConfig: StrapiConfig,
        private readonly httpService: HttpService,
        private readonly logger: Logger,
    ) {}

    async getList<RawT extends CmsBaseAttributes, T>(
        collectionType: CmsCollectionType,
        options: GetListOptions<T>,
        dataMapper: { toEntity: (raw: RawT) => T },
    ): Promise<ListResponse<T>> {
        const path = `/api/${collectionType}?${qs.stringify(options, { encodeValuesOnly: true })}`

        this.logger.info(`StrapiService: request data`, { collectionType, path })

        const [err, response = {}]: HttpServiceResponse = await this.httpService.get({
            path,
            host: this.cmsConfig.host,
            port: this.cmsConfig.port,
            headers: { Authorization: `Bearer ${this.cmsConfig.token}` },
            rejectUnauthorized: false,
            timeout: 30000,
        })

        if (err || response?.statusCode !== HttpStatusCode.OK) {
            const { statusCode, data } = err ?? response

            this.logger.error('StrapiService: failed to retrieve data', { statusCode, data })

            throw new ServiceUnavailableError('StrapiService: failed to retrieve data')
        }

        const { data, meta } = <CmsEntries<RawT>>response.data

        this.logger.info(`StrapiService: data retrieved`, { collectionType, meta })

        return {
            data: data.map((item) => dataMapper.toEntity(item.attributes)),
            meta,
        }
    }
}
