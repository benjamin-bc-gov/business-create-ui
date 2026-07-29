// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import { getLastEvent } from '../get-last-event'
import { createPinia, setActivePinia } from 'pinia'
import { useStore } from '@/store/store'

// Utils
import { createLocalVue, mount } from '@vue/test-utils'

// Components
import EffectiveDateTime from '@/components/common/EffectiveDateTime.vue'

const vuetify = new Vuetify({})
setActivePinia(createPinia())
const store = useStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Effective Date Time component', () => {
  let wrapperFactory: any
  const today = new Date()
  store.stateModel.currentJsDate = today

  const dateTimeDefault = {
    valid: false,
    isFutureEffective: false,
    effectiveDate: null
  }

  const dateTimeValid = {
    valid: false,
    isFutureEffective: false,
    effectiveDate: new Date(today.setDate(today.getDate() + 5))
  }

  const dateTimeInvalid = {
    valid: false,
    isFutureEffective: false,
    effectiveDate: new Date(today.setDate(today.getDate() + 11))
  }

  beforeEach(() => {
    const localVue = createLocalVue()

    wrapperFactory = (propsData) => {
      return mount(EffectiveDateTime, {
        propsData: {
          ...propsData
        },
        localVue,
        vuetify
      })
    }
  })

  afterEach(async () => {
  })

  it('confirms no default Date Time Selection', () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    // Reference the Radios
    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsImmediate = radioInput.at(0)
    const radioIsFutureEffective = radioInput.at(1)

    // Verify radios are false
    expect(radioIsImmediate.attributes('aria-checked')).toBe('false')
    expect(radioIsFutureEffective.attributes('aria-checked')).toBe('false')
  })

  it('confirms the selector fields are disabled if future effective is NOT selected', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsImmediate = radioInput.at(0)

    await radioIsImmediate.trigger('click')

    expect(wrapper.find('#date-text-field').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#hour-selector').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#minute-selector').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#am-pm-selector').attributes('disabled')).toBe('disabled')
  })

  it('confirms the selector fields are NOT disabled if future effective is selected', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsFutureEffective = radioInput.at(1)

    await radioIsFutureEffective.trigger('click')
    wrapper.vm.dateText = new Date().toISOString().split('T')[0]

    await Vue.nextTick()

    expect(wrapper.find('#date-text-field').attributes('disabled')).toBe(undefined)
    expect(wrapper.find('#hour-selector').attributes('disabled')).toBe(undefined)
    expect(wrapper.find('#minute-selector').attributes('disabled')).toBe(undefined)
    expect(wrapper.find('#am-pm-selector').attributes('disabled')).toBe(undefined)
  })

  it('confirms the selector fields are toggled to disabled if Immediate Filing is selected', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsImmediate = radioInput.at(0)
    const radioIsFutureEffective = radioInput.at(1)

    await radioIsFutureEffective.trigger('click')
    wrapper.vm.dateText = new Date().toISOString().split('T')[0]

    await Vue.nextTick()

    expect(wrapper.find('#date-text-field').attributes('disabled')).toBe(undefined)
    expect(wrapper.find('#hour-selector').attributes('disabled')).toBe(undefined)
    expect(wrapper.find('#minute-selector').attributes('disabled')).toBe(undefined)
    expect(wrapper.find('#am-pm-selector').attributes('disabled')).toBe(undefined)

    await radioIsImmediate.trigger('click')

    expect(wrapper.find('#date-text-field').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#hour-selector').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#minute-selector').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('#am-pm-selector').attributes('disabled')).toBe('disabled')
  })

  it('emits a valid state when the Immediate Filing is selected', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsImmediate = radioInput.at(0)
    await radioIsImmediate.trigger('click')

    const validEvent = getLastEvent(wrapper, 'valid')

    // Verify the Valid emit event is true
    expect(validEvent).toEqual(true)
  })

  it('emits an invalid state when the Future Effective is selected and no date is selected', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsFutureEffective = radioInput.at(1)
    await radioIsFutureEffective.trigger('click')

    // Verify the Valid emit event is true
    expect(wrapper.emitted().valid).toEqual([[false]])
  })

  it('emits a valid state when the Future Effective is selected and DateTime is valid', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeValid })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsFutureEffective = radioInput.at(1)
    await radioIsFutureEffective.trigger('click')

    const validEvent = getLastEvent(wrapper, 'valid')

    // Verify the Valid emit event is false at this point
    expect(validEvent).toEqual(true)
  })

  it('emits a invalid state when the Future Effective is selected and DateTime is invalid', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeInvalid })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsFutureEffective = radioInput.at(1)
    await radioIsFutureEffective.trigger('click')

    const invalidEvent = getLastEvent(wrapper, 'valid')

    // Verify the Valid emit event is false at this point
    expect(invalidEvent).toEqual(false)
  })

  it('displays an invalid Date Alert when the Date is invalid', async () => {
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeInvalid })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsFutureEffective = radioInput.at(1)
    await radioIsFutureEffective.trigger('click')

    const minDate = wrapper.vm.minDate
    const maxDate = wrapper.vm.maxDate

    await Vue.nextTick()

    expect(wrapper.vm.$el.querySelector('.date-time-selectors').textContent)
      .toContain(`Date must be between ${minDate} and ${maxDate}`)

    const invalidEvent = getLastEvent(wrapper, 'valid')

    // Verify the Valid emit event is false at this point
    expect(invalidEvent).toEqual(false)
  })

  it('displays an invalid Time Alert when the time selected is not AT LEAST 2 minutes ahead', async () => {
    dateTimeDefault.effectiveDate = new Date()
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsFutureEffective = radioInput.at(1)
    await radioIsFutureEffective.trigger('click')

    const minTime = wrapper.vm.minTime()

    await Vue.nextTick()

    expect(wrapper.vm.$el.querySelector('.date-time-selectors').textContent)
      .toContain(`The time must be at least ${minTime} for the selected date`)

    const invalidEvent = getLastEvent(wrapper, 'valid')

    // Verify the Valid emit event is false at this point
    expect(invalidEvent).toEqual(false)
  })

  it('displays an invalid Time Alert when time selected is past current time on the 10th day', async () => {
    dateTimeDefault.effectiveDate = new Date(today.setDate(today.getDate() + 10))
    const wrapper = wrapperFactory({ effectiveDateTime: dateTimeDefault })

    const radioInput = wrapper.findAll('input[type="radio"]')
    const radioIsFutureEffective = radioInput.at(1)
    await radioIsFutureEffective.trigger('click')

    const maxTime = wrapper.vm.maxTime()

    await Vue.nextTick()

    expect(wrapper.vm.$el.querySelector('.date-time-selectors').textContent)
      .toContain(`The time must be at most ${maxTime} for the selected date`)

    const invalidEvent = getLastEvent(wrapper, 'valid')

    // Verify the Valid emit event is false at this point
    expect(invalidEvent).toEqual(false)
  })

  describe('constructDate() — effective date is always Pacific time regardless of browser timezone', () => {
    const freshDateTime = { valid: false, isFutureEffective: false, effectiveDate: null }

    function runConstructDate (wrapper: any, date: string, hour: string, minute: string, period: string): Date {
      const mockEmit = vi.fn()
      ;(wrapper.vm as any).emitEffectiveDate = mockEmit
      wrapper.vm.isFutureEffective = true
      wrapper.vm.dateText = date
      wrapper.vm.selectHour = hour
      wrapper.vm.selectMinute = minute
      wrapper.vm.selectPeriod = period
      ;(wrapper.vm as any).constructDate()
      return mockEmit.mock.calls.length > 0 ? mockEmit.mock.calls[0][0] : null
    }

    const constructDateTestCases = [
      {
        testName: '9:10 AM Pacific — bug scenario',
        date: '2026-05-24',
        hour: '9',
        minute: '10',
        period: 'AM',
        expected: '2026-05-24T16:10:00.000Z'
      },
      {
        testName: '12:00 AM Pacific — midnight',
        date: '2026-05-24',
        hour: '12',
        minute: '0',
        period: 'AM',
        expected: '2026-05-24T07:00:00.000Z'
      },
      {
        testName: '12:00 PM Pacific — noon',
        date: '2026-05-24',
        hour: '12',
        minute: '0',
        period: 'PM',
        expected: '2026-05-24T19:00:00.000Z'
      },
      {
        testName: '1:30 AM Pacific',
        date: '2026-05-24',
        hour: '1',
        minute: '30',
        period: 'AM',
        expected: '2026-05-24T08:30:00.000Z'
      },
      {
        testName: '5:45 PM Pacific — rolls into next UTC day',
        date: '2026-05-24',
        hour: '5',
        minute: '45',
        period: 'PM',
        expected: '2026-05-25T00:45:00.000Z'
      },
      {
        testName: '11:59 PM Pacific',
        date: '2026-05-24',
        hour: '11',
        minute: '59',
        period: 'PM',
        expected: '2026-05-25T06:59:00.000Z'
      },
      {
        testName: '11:59 PM Pacific — end of month (Jan 31)',
        date: '2026-01-31',
        hour: '11',
        minute: '59',
        period: 'PM',
        expected: '2026-02-01T07:59:00.000Z'
      },
      {
        testName: '12:00 AM Pacific — start of month (Mar 1)',
        date: '2026-03-01',
        hour: '12',
        minute: '0',
        period: 'AM',
        expected: '2026-03-01T08:00:00.000Z'
      },
      {
        testName: '11:59 PM Pacific — end of year (Dec 31)',
        date: '2026-12-31',
        hour: '11',
        minute: '59',
        period: 'PM',
        expected: '2027-01-01T06:59:00.000Z'
      },
      {
        testName: '12:00 AM Pacific — start of year (Jan 1)',
        date: '2026-01-01',
        hour: '12',
        minute: '0',
        period: 'AM',
        expected: '2026-01-01T08:00:00.000Z'
      }
    ]

    for (const { testName, date, hour, minute, period, expected } of constructDateTestCases) {
      it(testName, () => {
        const wrapper = wrapperFactory({ effectiveDateTime: freshDateTime })
        const result = runConstructDate(wrapper, date, hour, minute, period)
        expect(result.toISOString()).toBe(expected)
      })
    }
  })
})
