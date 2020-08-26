import { mount } from '@vue/test-utils'
import { PolyfillMixin } from '../src/mixin'
import { h, defineComponent, ref, computed, watch, nextTick } from 'vue'
import 'vue-reactivity-polyfill'
import { mockWarn } from 'jest-mock-warn'

const SetupComponent = defineComponent({
  props: ['msg'],
  mixins: [PolyfillMixin],
  setup(props) {
    const data = ref('data' + props.msg)
    const computedMsg = computed(() => `computed${data.value}`)
    watch(
      () => data.value,
      () => {
        console.warn(`watch:${data.value}`)
      }
    )
    const say = () => {
      data.value = data.value + props.msg
      console.warn(`say:${props.msg},${data.value},${computedMsg.value}`)
    }
    return () => {
      return h('div', [
        h('p', null, [props.msg]),
        h('p', null, [data.value]),
        h('p', null, [computedMsg.value]),
        h('button', { onClick: say }, 'say'),
      ])
    }
  },
})

const OptionsComponent = defineComponent({
  mixins: [PolyfillMixin],
  props: ['msg'],
  render() {
    return h('div', [
      h('p', null, [this.msg]),
      h('p', null, [this.data]),
      h('p', null, [this.computedMsg]),
      h('button', { onClick: this.say }, 'say'),
    ])
  },
  data() {
    return {
      data: 'data' + this.msg,
    }
  },
  computed: {
    computedMsg(): string {
      return `computed${this.data}`
    },
  },
  watch: {
    data(newData) {
      console.warn(`watch:${newData}`)
    },
  },
  methods: {
    say() {
      this.data += this.msg
      console.warn(`say:${this.msg},${this.data},${this.computedMsg}`)
    },
  },
})

describe('Polyfill Plugin', () => {
  mockWarn()

  const propsMsg = 'props-msg'
  const components = [
    {
      name: 'SetupComponent',
      create: () => {
        return mount(SetupComponent, {
          props: {
            msg: propsMsg,
          },
        })
      },
    },
    {
      name: 'OptionsComponent',
      create: () => {
        return mount(OptionsComponent, {
          props: {
            msg: propsMsg,
          },
        })
      },
    },
  ]
  components.forEach(Component => {
    describe(Component.name, () => {
      test('should render correct', () => {
        const wrapper = Component.create()
        const msgEle = wrapper.find('p:nth-child(1)')
        const dataEle = wrapper.find('p:nth-child(2)')
        const computedEle = wrapper.find('p:nth-child(3)')
        const actionEle = wrapper.find('button')
        expect(msgEle.text()).toEqual(propsMsg)
        expect(dataEle.text()).toEqual(`data${propsMsg}`)
        expect(computedEle.text()).toEqual(`computeddata${propsMsg}`)
        expect(actionEle.text()).toEqual('say')
      })
      test('should make data reactive', async () => {
        const wrapper = Component.create()
        const actionEle = wrapper.find('button')
        actionEle.trigger('click')
        // say
        expect(
          `say:${propsMsg},data${propsMsg}${propsMsg},computeddata${propsMsg}${propsMsg}`
        ).toHaveBeenWarnedTimes(1)
        await nextTick()
        // watch
        expect(`watch:data${propsMsg}${propsMsg}`).toHaveBeenWarnedTimes(1)
      })
    })
  })
})
