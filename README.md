# vue3-plugin-polyfill

Vue 3 Ployfill Plugin. Based on [vue-reactivity-with-polyfill](https://github.com/dolymood/vue-reactivity-with-polyfill).

### Usage

```js
import { createPolyfillPlugin } from 'vue3-plugin-polyfill'

const polyfillPlugin = createPolyfillPlugin()

app.use(polyfillPlugin)
```

**Node:** Your application should replace '@vue/reactivity' with 'vue-reactivity-with-polyfill'. You need to:

```
// webpack.config file
{
  resolve: {
    alias: {
      // ...
      '@vue/reactivity': 'vue-reactivity-with-polyfill',
      // ...
    }
  }
}
```
