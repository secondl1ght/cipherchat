<script lang="ts">
	export let text: string;
	export let style = 'ml-3';

	import { Icon } from 'comp';
	import tippy from 'tippy.js';

	let infoTooltip: HTMLSpanElement;

	$: infoTooltip &&
		tippy([infoTooltip], {
			content: text
		});
</script>

<span class="{style} cursor-help" bind:this={infoTooltip}>
	<Icon icon="info" />
</span>

<style>
	@import 'tippy.js/dist/tippy.css';
</style>
