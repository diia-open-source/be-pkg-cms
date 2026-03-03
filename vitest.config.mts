import tsConfigPaths from 'vite-tsconfig-paths'
import { defineProject } from 'vitest/config'

const timeout = 60 * 1000

export default defineProject({
    plugins: [tsConfigPaths()],
    test: {
        env: {
            NODE_ENV: 'test',
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    include: ['tests/unit/**/*.spec.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'integration',
                    include: ['tests/integration/**/*.spec.ts'],
                },
            },
        ],
        globals: true,
        restoreMocks: true,
        clearMocks: true,
        mockReset: true,
        testTimeout: timeout,
        hookTimeout: timeout,
        exclude: ['node_modules', 'dist'],
        setupFiles: ['@diia-inhouse/test/vitest'],
    },
})
