<script lang="ts">
	import { PUBLIC_WASM_VERSION } from '$env/static/public';
	import {
		LNRPC,
		bubbleColorOne,
		bubbleColorTwo,
		connected,
		error,
		indexedDBAvailable,
		lnc,
		localStorageAvailable,
		offline,
		paired,
		serviceWorkerAvailable,
		textColorOne,
		textColorTwo,
		userAvatar,
		webAssemblyAvailable
	} from '$lib/store';
	import { setError } from '$lib/utils';
	import { Chat, Connect, Error, Login, Offline, PublicLayout, ShareHandler } from 'comp';

	const initializeLNC = async () => {
		if ($lnc && $LNRPC) return;

		const registration =
			'serviceWorker' in navigator
				? await navigator.serviceWorker.getRegistration().catch((error) => console.log(error))
				: undefined;

		if (registration) {
			$serviceWorkerAvailable = true;
		}

		if ('WebAssembly' in window && typeof WebAssembly.instantiateStreaming === 'function') {
			$webAssemblyAvailable = true;
		}

		try {
			$userAvatar = localStorage.getItem('userAvatar');
			$bubbleColorOne = localStorage.getItem('bubbleColorOne');
			$bubbleColorTwo = localStorage.getItem('bubbleColorTwo');
			$textColorOne = localStorage.getItem('textColorOne');
			$textColorTwo = localStorage.getItem('textColorTwo');

			$localStorageAvailable = true;
		} catch (err) {
			console.log(err);
		}

		if ('indexedDB' in window) {
			$indexedDBAvailable = true;
		}

		if (
			$serviceWorkerAvailable &&
			$webAssemblyAvailable &&
			$localStorageAvailable &&
			$indexedDBAvailable
		) {
			try {
				const LNC = (await import('@lightninglabs/lnc-web')).default;

				$lnc = new LNC({
					serverHost: '',
					wasmClientCode: `/wasm-client/${PUBLIC_WASM_VERSION}.wasm`
				});

				$paired = $lnc.credentials.isPaired;

				const { lnrpc } = await import('@lightninglabs/lnc-web');

				$LNRPC = lnrpc;
			} catch (err) {
				console.log(err);
				setError('503', 'Lightning Node Connect failed to initialize.');
			}
		}
	};
</script>

{#await initializeLNC()}
	<img class="center-fixed" src="/images/logo.png" alt="logo" />
{:then}
	{#if $connected}
		{#if $error.status && $error.message}
			<Error />
		{:else if $offline}
			<Offline />
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
