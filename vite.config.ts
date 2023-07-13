import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: [{ find: 'comp', replacement: 'src/components/index.js' }]
	}
});
