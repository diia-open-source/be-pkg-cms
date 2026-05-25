export * from './cms.js'

export * from './config.js'

export const MetricLabels = {
    strapiGetList: 'strapiGetList',
    strapiGetLatestRecord: 'strapiGetLatestRecord',
} as const

export type MetricLabel = (typeof MetricLabels)[keyof typeof MetricLabels]
