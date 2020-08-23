import { getCurrentInstance, defineComponent, toRaw } from 'vue'

function def(obj: any, key: string, attrs: object) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    ...attrs,
  })
}

function handlePolyfillProxy(
  instance = getCurrentInstance() as any,
  ...props: object[]
) {
  const proxy = instance.proxy
  const getter = proxy['___@getter___']
  const setter = proxy['___@setter___']
  const target = toRaw(proxy)
  if (getter) {
    props.forEach(prop => {
      Object.keys(prop).forEach(k => {
        if (k === '_') {
          return
        }
        def(proxy, k, {
          get: getter.bind(target, k),
          set: setter.bind(target, k),
        })
      })
    })
    return true
  }
  return false
}

const publicPropertiesMap = {
  $: 1,
  $el: 1,
  $data: 1,
  $props: 1,
  $attrs: 1,
  $slots: 1,
  $refs: 1,
  $parent: 1,
  $root: 1,
  $emit: 1,
  $options: 1,
  $forceUpdate: 1,
  $nextTick: 1,
  $watch: 1,
}

export const PolyfillMixin = defineComponent({
  beforeCreate() {
    const instance = getCurrentInstance() as any
    handlePolyfillProxy(
      instance,
      instance.props,
      instance.setupState,
      instance.appContext.config.globalProperties,
      publicPropertiesMap
    )
  },
  created() {
    const instance = getCurrentInstance() as any
    handlePolyfillProxy(instance, instance.data, instance.ctx) &&
      // force call effects agagin to collect deps
      instance.effects &&
      instance.effects.forEach((effect: Function) => {
        effect()
      })
  },
})
