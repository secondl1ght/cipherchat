<script lang="ts">
	export let text: string;
	export let width = '24';
	export let height = '24';

	import { copy } from '$lib/utils';
	import { Icon } from 'comp';

	let copied = false;
</script>

<button
	on:click={() => {
		copy(text);
		copied = true;
		setTimeout(() => (copied = false), 2100);
	}}
	disabled={copied}
>
	<Icon
		icon={copied ? 'check' : 'clipboard'}
		style="text-header hover:text-button transition-colors cursor-copy"
		{width}
		{height}
	/>
</button>
