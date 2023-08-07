<script lang="ts">
	import { connected, paired, error } from '$lib/store';
	import { Chat, PublicLayout, Login, Connect, Error } from 'comp';
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
	<PublicLayout>
		{#if $paired}
			<Login />
		{:else}
			<Connect />
		{/if}
	</PublicLayout>
{/if}
