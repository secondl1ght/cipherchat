<script lang="ts">
	import { PUBLIC_WASM_VERSION } from '$env/static/public';
	import { LNRPC, connected, error, lnc, paired } from '$lib/store';
	import { setError } from '$lib/utils';
	import { Chat, Connect, Error, Login, PublicLayout, ShareHandler } from 'comp';

	const initializeLNC = async () => {
		try {
			if ('WebAssembly' in window && typeof WebAssembly.instantiateStreaming === 'function') {
				const LNC = (await import('@lightninglabs/lnc-web')).default;

				$lnc = new LNC({
					serverHost: '',
					wasmClientCode: `/wasm-client/${PUBLIC_WASM_VERSION}.wasm`
				});

				$paired = $lnc.credentials.isPaired;

				const { lnrpc } = await import('@lightninglabs/lnc-web');

				$LNRPC = lnrpc;
			}
		} catch (err) {
			console.log(err);
			setError('503', 'Lightning Node Connect failed to initialize.');
		}
	};
</script>

<svelte:head>
	<title>Cipherchat</title>
	<meta property="twitter:title" content="Cipherchat" />
</svelte:head>

{#await initializeLNC() then}
	{#if $connected}
		{#if $error.status && $error.message}
			<Error />
		{:else}
			<Chat />
		{/if}
	{:else}
		<ShareHandler />
		{#if $error.status && $error.message}
			<Error />
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
{/await}
