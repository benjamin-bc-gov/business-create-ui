import { VuetifyRuleFunction } from '@/types'

export const EmailRules: Array<VuetifyRuleFunction> = [
  (v: string) => !!v || 'Email address is required',
  (v: string) => {
    const pattern = /^(?=[^@]{1,64}@)[^<>()[\]\\.,;:\s@"\u0080-\uFFFF]+(\.[^<>()[\]\\.,;:\s@"\u0080-\uFFFF]+)*@(\[(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\]|([a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/
    return pattern.test(v) || 'Valid email is required'
  }
]
