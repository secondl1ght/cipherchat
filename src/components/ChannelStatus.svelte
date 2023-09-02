<script lang="ts">
	export let color: string;
	export let channels: number | undefined;
	export let title: string;

	import tippy from 'tippy.js';

	let tooltip: HTMLDivElement;

	$: tooltip &&
		tippy([tooltip], {
			content: title
		});
</script>

<div
	bind:this={tooltip}
	class="flex items-center space-x-2 {channels === undefined ? 'cursor-wait' : 'cursor-default'}"
>
	<p class="h-2.5 w-2.5 rounded-full {color}" />
	<p>{channels ?? '-'}</p>
</div>

<style>
	@import 'tippy.js/dist/tippy.css';
</style>
