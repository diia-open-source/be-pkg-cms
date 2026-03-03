import 'vitest'

import { CustomMatchers } from '@diia-inhouse/test/vitest'

declare module 'vitest' {
    interface Assertion<T> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
