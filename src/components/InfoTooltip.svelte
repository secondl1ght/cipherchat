<script lang="ts">
	export let text: string;

	import tippy from 'tippy.js';
	import { Icon } from 'comp';

	let infoTooltip: HTMLSpanElement;

	$: infoTooltip &&
		tippy([infoTooltip], {
			content: text
		});
</script>

<span class="ml-3 cursor-help" bind:this={infoTooltip}>
	<Icon icon="info" />
</span>

<style>
	@import 'tippy.js/dist/tippy.css';
</style>
