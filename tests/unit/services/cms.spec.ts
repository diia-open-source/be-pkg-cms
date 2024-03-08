import { HttpServiceResponseResult } from '@diia-inhouse/http'

import { CmsService } from '../../../src'
import { CmsBaseAttributes, CmsCollectionType, CmsEntry, GetListOptions } from '../../../src/interfaces'
import { httpService, logger, strapiConfig } from '../mocks'

describe('CmsService', () => {
    let service: CmsService

    beforeEach(() => {
        service = new CmsService(strapiConfig, httpService, logger)
    })
    describe('getList', () => {
        const collectionType: CmsCollectionType = CmsCollectionType.Faq
        const options: GetListOptions<CmsEntry<CmsBaseAttributes>> = {
            pagination: { page: 1, pageSize: 10 },
        }
        const dataMapper = { toEntity: (raw: CmsBaseAttributes): CmsEntry<CmsBaseAttributes> => ({ id: 1, attributes: raw }) }
        const data = {
            data: [{ id: 1, attributes: { name: 'John', age: 20 } }],
            meta: {
                pagination: {
                    start: 1,
                    limit: 10,
                    page: 1,
                    pageSize: 10,
                    pageCount: 1,
                    total: 1,
                },
            },
        }
        const httpServiceResponse: HttpServiceResponseResult = {
            data: { ...data },
            statusCode: 200,
            statusMessage: 'OK',
        }

        it('should call the httpService get method with correct arguments', async () => {
            jest.spyOn(httpService, 'get').mockResolvedValueOnce([null, Object.assign(httpServiceResponse)])
            await service.getList(collectionType, options, dataMapper)

            expect(httpService.get).toHaveBeenCalledTimes(1)
            expect(httpService.get).toHaveBeenCalledWith({
                path: `/api/${collectionType}?pagination[page]=1&pagination[pageSize]=10`,
                host: strapiConfig.host,
                port: strapiConfig.port,
                headers: { Authorization: `Bearer ${strapiConfig.token}` },
                rejectUnauthorized: false,
                timeout: 30000,
            })
        })

        it('should throw an error if httpService returns a non-OK status code', async () => {
            jest.spyOn(httpService, 'get').mockResolvedValueOnce([
                null,
                Object.assign(httpServiceResponse, { statusCode: 500, statusMessage: 'Internal Server Error' }),
            ])

            await expect(service.getList(collectionType, options, dataMapper)).rejects.toThrow('StrapiService: failed to retrieve data')
        })
    })
})
