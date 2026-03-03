import { mock } from 'vitest-mock-extended'

import DiiaLogger from '@diia-inhouse/diia-logger'
import { HttpClientService } from '@diia-inhouse/http'

import { CmsBaseAttributes, CmsCollectionType, CmsEntry, CmsService, GetListOptions, MetricLabel, MetricLabels } from '../../../src'
import { strapiConfig } from '../mocks'

describe('CmsService', () => {
    const logger = mock<DiiaLogger>()
    const httpService = mock<HttpClientService<MetricLabel>>()
    const service = new CmsService(strapiConfig, httpService, logger)

    beforeEach(() => {
        vi.clearAllMocks()
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
        const httpServiceResponse = {
            isOk: true,
            body: { ...data },
            statusCode: 200,
        }

        it('should call the httpService get method with correct arguments', async () => {
            httpService.get.mockResolvedValueOnce(httpServiceResponse)
            await service.getList(collectionType, options, dataMapper)

            expect(httpService.get).toHaveBeenCalledTimes(1)
            expect(httpService.get).toHaveBeenCalledWith(`/api/${collectionType}?pagination[page]=1&pagination[pageSize]=10`, {
                baseUrl: `${strapiConfig.host}:${strapiConfig.port}`,
                headers: { Authorization: `Bearer ${strapiConfig.token}` },
                httpsAgent: expect.any(Object),
                timeout: 30000,
                metricLabel: MetricLabels.strapiGetList,
            })
        })

        it('should throw an error if httpService returns a non-OK status code', async () => {
            httpService.get.mockResolvedValueOnce(
                Object.assign(httpServiceResponse, {
                    statusCode: 500,
                    statusMessage: 'Internal Server Error',
                }),
            )

            await expect(service.getList(collectionType, options, dataMapper)).rejects.toThrow('StrapiService: failed to retrieve data')
        })
    })

    describe('getLatestRecord', () => {
        const collectionType: CmsCollectionType = CmsCollectionType.MilitaryDonationReports
        const options: GetListOptions<CmsEntry<CmsBaseAttributes>> = {
            pagination: { page: 1, pageSize: 10 },
        }
        const dataMapper = { toEntity: (raw: CmsBaseAttributes): CmsEntry<CmsBaseAttributes> => ({ id: 1, attributes: raw }) }
        const data = {
            data: [
                {
                    id: 2,
                    title: 'NEW RECORD',
                    updatedAt: '2024-09-18T10:16:38.754Z',
                },
                {
                    id: 1,
                    title: 'OLD RECORD',
                    updatedAt: '2024-09-18T10:16:38.754Z',
                },
            ],
        }
        const httpServiceResponse = {
            isOk: true,
            body: { ...data },
            statusCode: 200,
        }

        it('should call the httpService get method with correct arguments', async () => {
            vi.spyOn(httpService, 'get').mockResolvedValueOnce(Object.assign(httpServiceResponse))
            const response = await service.getLatestRecord(collectionType, options, dataMapper)

            expect(httpService.get).toHaveBeenCalledWith(
                `/api/${collectionType}?pagination[page]=1&pagination[pageSize]=1&sort=updatedAt%3Adesc`,
                {
                    baseUrl: `${strapiConfig.host}:${strapiConfig.port}`,
                    headers: { Authorization: `Bearer ${strapiConfig.token}` },
                    httpsAgent: expect.any(Object),
                    timeout: 30000,
                    metricLabel: MetricLabels.strapiGetLatestRecord,
                },
            )
            expect(response!.data.attributes).toEqual(data.data[0])
        })
    })
})
