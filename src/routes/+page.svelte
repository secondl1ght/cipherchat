<script lang="ts">
	import { connected, paired } from '$lib/store';
	import { browser } from '$app/environment';
	import { Chat, PublicLayout, Login, Connect } from 'comp';
</script>

<svelte:head>
	<title>Cipherchat</title>
	<meta property="twitter:title" content="Cipherchat" />
</svelte:head>

{#if browser}
	{#if $connected}
		<Chat />
	{:else}
		<PublicLayout>
			{#if $paired}
				<Login />
			{:else}
				<Connect />
			{/if}
		</PublicLayout>
	{/if}
{/if}
