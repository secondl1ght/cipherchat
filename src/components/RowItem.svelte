<script lang="ts">
	export let title: string;
	export let label = '';
	export let flex = true;
</script>

<li class="{flex ? 'flex space-x-4 md:space-x-8' : 'block'} items-center justify-between">
	{#if label}
		<label for={label} class="whitespace-nowrap text-header">{title}:</label>
	{:else}
		<p class="whitespace-nowrap text-header">{title}:</p>
	{/if}

	<slot />
</li>
