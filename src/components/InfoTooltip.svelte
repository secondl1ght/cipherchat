<script lang="ts">
	export let text: string;

	import { Icon } from 'comp';
	import tippy from 'tippy.js';

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
