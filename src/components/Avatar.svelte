<script lang="ts">
	export let pubkey: string;
	export let alias: string | undefined;
	export let color: string | undefined;
	export let avatar: string | null | undefined;
	export let size = 'w-12 h-12';

	import { getRandomColor } from '$lib/utils';

	const finalColor = color || getRandomColor();
</script>

{#if avatar}
	<img
		src="/images/avatars/{avatar}.png"
		alt="avatar"
		class="rounded-full object-cover {size}"
		style={`border: 2px solid ${finalColor};`}
	/>
{:else}
	<div
		class="flex items-center justify-center rounded-full bg-borderIn text-xl font-bold uppercase text-header {size}"
		style={`border: 2px solid ${finalColor};`}
	>
		{alias ? alias.charAt(0) : pubkey.charAt(0)}
	</div>
{/if}
