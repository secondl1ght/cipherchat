<script lang="ts">
	import { lnc } from '$lib/lnc';
	import { Button } from 'comp';
	import { errorToast } from '$lib/utils';

	let start = false;
	let loading = false;

	let pairingPhrase = '';
	let password = '';
	let mailbox = '';

	const connect = async () => {
		loading = true;
		lnc.credentials.serverHost = mailbox;
		lnc.credentials.pairingPhrase = pairingPhrase;

		try {
			await lnc.connect();

			await lnc.isReady();

			lnc.credentials.password = password;
		} catch (error) {
			errorToast('Node connection failed, please try again.');
		}

		loading = false;
	};
</script>

<section class="mx-auto my-16 w-11/12 max-w-6xl border-8 border-borderOut lg:w-9/12">
	<div class="border-8 border-borderIn p-4 md:p-10 xl:p-16 2xl:p-20">
		{#if !start}
			<h2
				class="press-start mx-auto mb-8 max-w-4xl text-center text-xl leading-10 text-header md:text-2xl md:!leading-[50px] lg:mb-16 lg:text-3xl xl:text-4xl"
			>
				Encrypted Messaging Over The Bitcoin Lightning Network.
			</h2>

			<Button click={() => (start = true)} title="Get started" />
		{:else}
			<form>
				<label for="pairing" class="text-lg font-bold text-header md:text-xl lg:text-2xl">
					Pairing Phrase
				</label>
				<input
					name="pairing"
					type="text"
					required
					disabled={loading}
					bind:value={pairingPhrase}
					placeholder="Your LNC connection words"
					class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-header placeholder:text-xs md:placeholder:text-base"
				/>

				<label for="password" class="text-lg font-bold text-header md:text-xl lg:text-2xl">
					Password
				</label>
				<input
					name="password"
					type="password"
					required
					disabled={loading}
					bind:value={password}
					placeholder="Enter a secure password"
					class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-header placeholder:text-xs md:placeholder:text-base"
				/>

				<label for="mailbox" class="text-lg font-bold text-header md:text-xl lg:text-2xl">
					Mailbox
				</label>
				<input
					name="mailbox"
					type="text"
					required
					disabled={loading}
					bind:value={mailbox}
					placeholder="Aperture relay proxy server"
					class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-header placeholder:text-xs md:placeholder:text-base"
				/>

				<Button
					click={connect}
					title="Connect"
					disabled={loading || !pairingPhrase || !password || !mailbox}
					{loading}
					loadingText="Connecting..."
				/>
			</form>
		{/if}
	</div>
</section>
