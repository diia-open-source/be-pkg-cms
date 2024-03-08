import Logger from '@diia-inhouse/diia-logger'
import { HttpService } from '@diia-inhouse/http'
import { mockClass } from '@diia-inhouse/test'
import { HttpProtocol } from '@diia-inhouse/types'

import { StrapiConfig } from '../../../src/interfaces'

export const logger = new (mockClass(Logger))()

export const strapiConfig: StrapiConfig = {
    isEnabled: false,
    host: '',
    port: 80,
    token: '',
}

export const httpService = new (mockClass(HttpService))(logger, HttpProtocol.Http)
