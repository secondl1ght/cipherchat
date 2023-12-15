<script lang="ts">
	export let synced: boolean | undefined;
	export let type: 'GRAPH' | 'CHAIN';

	import { Icon } from 'comp';
	import tippy from 'tippy.js';

	$: color = synced === undefined ? 'bg-body' : synced ? 'bg-success' : 'bg-warning';
	$: title = synced ? 'Synced' : 'Syncing';

	let tooltip: HTMLDivElement;

	$: tooltip &&
		synced !== undefined &&
		tippy([tooltip], {
			content: title
		});
</script>

<div
	bind:this={tooltip}
	class="flex items-center space-x-2 {synced === undefined ? 'cursor-wait' : 'cursor-auto'}"
>
	<span class="relative flex h-3 w-3">
		<span
			class="absolute inline-flex h-full w-full rounded-full opacity-75 {color} {synced !==
			undefined
				? 'animate-ping'
				: ''}"
		/>
		<span class="relative inline-flex h-3 w-3 rounded-full {color}" />
	</span>

	<Icon icon={type === 'GRAPH' ? 'zap' : 'link'} style="text-header" width="20" height="20" />
</div>
