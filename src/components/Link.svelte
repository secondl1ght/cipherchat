<script lang="ts">
	export let external = false;
	export let href: string;
	export let style = '';
	export let title: string;
</script>

{#if external}
	<a
		{href}
		target="_blank"
		rel="noreferrer"
		class="{style} text-header transition-colors hover:text-button"
	>
		{title}
	</a>
{:else}
	<a {href} class="{style} text-header transition-colors hover:text-button">
		{title}
	</a>
{/if}
