<script lang="ts">
	import { connected, error, paired } from '$lib/store';
	import { Chat, Connect, Error, Login, PublicLayout, ShareHandler } from 'comp';
</script>

<svelte:head>
	<title>Cipherchat</title>
	<meta property="twitter:title" content="Cipherchat" />
</svelte:head>

{#if $connected}
	{#if $error.status && $error.message}
		<Error />
	{:else}
		<Chat />
	{/if}
{:else}
	<ShareHandler />
	<PublicLayout>
		{#if $paired}
			<Login />
		{:else}
			<Connect />
		{/if}
	</PublicLayout>
{/if}
