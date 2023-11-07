<script lang="ts">
	import { innerWidth } from '$lib/store';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import '../app.css';

	document.querySelector('#loading-splash')?.remove()

	const options = {
		pausable: true,
		reversed: $innerWidth < 640 ? true : false,
		intro: $innerWidth < 640 ? { y: 192 } : undefined
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

	@media (max-width: 640px) {
		#toast {
			--toastContainerTop: auto;
			--toastContainerRight: auto;
			--toastContainerBottom: 8rem;
			--toastContainerLeft: calc(50vw - 8rem);
		}
	}
</style>
