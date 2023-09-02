<script lang="ts">
	export let pubkey: string;
	export let alias: string | undefined;
	export let color: string | undefined;
	export let avatar: string | null | undefined;
	export let size = 'w-12 h-12';
	export let style = '';

	import { getRandomColor } from '$lib/utils';

	const finalColor = color || getRandomColor();
</script>

{#if avatar}
	<img
		src="/images/avatars/{avatar}.png"
		alt="avatar"
		class="rounded-full object-cover {size} {style}"
		style={`border: 3px solid ${finalColor};`}
	/>
{:else}
	<div
		class="flex items-center justify-center rounded-full bg-borderIn text-2xl font-bold uppercase text-header {size} {style}"
		style={`border: 3px solid ${finalColor};`}
	>
		{alias ? alias.charAt(0) : pubkey.charAt(0)}
	</div>
{/if}
