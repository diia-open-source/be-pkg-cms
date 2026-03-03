export * from './cms'

export * from './config'

export const MetricLabels = {
    strapiGetList: 'strapiGetList',
    strapiGetLatestRecord: 'strapiGetLatestRecord',
} as const

export type MetricLabel = (typeof MetricLabels)[keyof typeof MetricLabels]
