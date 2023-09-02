<script lang="ts">
	export let synced: boolean;
	export let type: 'GRAPH' | 'CHAIN';

	import { Icon } from 'comp';
	import tippy from 'tippy.js';

	const color = synced ? 'bg-success' : 'bg-warning';
	const title = synced ? 'Synced' : 'Syncing';

	let tooltip: HTMLDivElement;

	$: tooltip &&
		tippy([tooltip], {
			content: title
		});
</script>

<div bind:this={tooltip} class="flex items-center space-x-2">
	<span class="relative flex h-3 w-3">
		<span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 {color}" />
		<span class="relative inline-flex h-3 w-3 rounded-full {color}" />
	</span>
	<Icon icon={type === 'GRAPH' ? 'zap' : 'link'} style="text-header" width="20" height="20" />
</div>

<style>
	@import 'tippy.js/dist/tippy.css';
</style>
