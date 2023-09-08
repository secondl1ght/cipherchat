<script lang="ts">
	export let pubkey: string;
	export let alias: string | undefined;
	export let color: string | undefined;
	export let avatar: string | null | undefined;
	export let size = 'w-10 h-10 lg:w-12 lg:h-12';
	export let style = '';
	export let withButton = false;

	import { Icon } from 'comp';

	$: finalColor = color || '#F7931A';
</script>

<div class="relative">
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
	{#if withButton}
		<button
			class="absolute bottom-1 right-1 flex items-center justify-center rounded bg-header p-0.5 text-borderIn"
		>
			<Icon icon="image" width="16" height="16" />
		</button>
	{/if}
</div>
