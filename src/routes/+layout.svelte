<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import '../app.css';

	const options = {
		pausable: true,
		reversed: true,
		intro: { y: 192 }
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

	#toast {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 8rem;
		--toastContainerLeft: calc(50vw - 8rem);
	}
</style>
