import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			// default options are shown
			pages: 'src-tauri/target/frontend-build',
			assets: 'src-tauri/target/frontend-build',
			precompress: true,
		}),
		prerender: {
			default: true
		}
	}
};

export default config;
