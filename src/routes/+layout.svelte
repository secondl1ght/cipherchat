<script lang="ts">
	import '../app.css';
	import { SvelteToast } from '@zerodevx/svelte-toast';

	const options = {
		pausable: true
	};
</script>

<div id="toast">
	<SvelteToast {options} />
</div>
<slot />

<style>
	#toast {
		font-family: Roboto, sans-serif;
	}
</style>
