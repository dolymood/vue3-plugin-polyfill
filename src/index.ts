import { App } from 'vue'
import { PolyfillMixin } from './mixin'

export interface PolyfillPlugin {
  install(app: App): void
}

export function createPolyfillPlugin(): PolyfillPlugin {
  const plugin: PolyfillPlugin = {
    install(app: App) {
      // mixin PolyfillMixin
      app.mixin(PolyfillMixin)
    },
  }
  return plugin
}
