import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
// 仅在开发环境下引入 Eruda
if (import.meta.env.MODE === 'development') {
	import('eruda').then(eruda => {
		eruda.default.init();
	});
}

createApp(App).mount('#app')
