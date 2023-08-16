<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import '../app.css';

	const options = {
		pausable: true
	};

	onMount(() =>
		console.log('The Times 03/Jan/2009 Chancellor on brink of second bailout for banks')
	);
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
