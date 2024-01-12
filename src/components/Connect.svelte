<script lang="ts">
	import { generateKey } from '$lib/crypto';
	import {
		connected,
		firstUpdate,
		indexedDBAvailable,
		lnc,
		localStorageAvailable,
		scanActive,
		serviceWorkerAvailable,
		webAssemblyAvailable
	} from '$lib/store';
	import { errorToast, warningToast } from '$lib/utils';
	import { Button, Icon, InfoTooltip, MessageHistory, Warning } from 'comp';
	import QrScanner from 'qr-scanner';
	import { tick } from 'svelte';
	import type { Action } from 'svelte/action';
	import { blur } from 'svelte/transition';

	let start = false;
	let loading = false;
	let showPass = false;
	let showAdvanced = false;
	const defaultMailbox = 'mailbox.terminal.lightning.today:443';
	let selectedMailbox = 'Lightning Labs';

	let pairingPhrase = '';
	let password = '';
	let mailbox = defaultMailbox;

	const mailboxOptions = [
		{ name: 'Lightning Labs', host: defaultMailbox },
		// { name: 'Cipherchat', host: 'cipherchatmailbox.net:443' },
		{ name: 'Custom', host: '' }
	];

	let mailboxInput: HTMLInputElement;

	const connect = async () => {
		try {
			loading = true;

			$lnc.credentials.serverHost = mailbox;
			$lnc.credentials.pairingPhrase = pairingPhrase;

			await $lnc.connect();

			await $lnc.lnd.lightning.getInfo();

			$lnc.credentials.password = password;

			await generateKey(password);

			$connected = true;
		} catch (error) {
			console.log(error);
			errorToast('Node connection failed, please try again.');
		} finally {
			loading = false;
		}
	};

	const handleEnter = (
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (e.key === 'Enter' && pairingPhrase && password && $firstUpdate && mailbox) {
			connect();
		}
	};

	let qrScanner: QrScanner;
	// eslint-disable-next-line no-undef
	const cameraPermission = 'camera' as PermissionName;

	const requestScan = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				$scanActive = true;
				stream.getTracks().forEach((track) => track.stop());
			})
			.catch((error) => {
				console.log(error);
				errorToast('Could not access camera to scan.');
			});
	};

	const startScan = () => {
		navigator.permissions
			.query({ name: cameraPermission })
			.then((result) => {
				if (result.state === 'granted') {
					$scanActive = true;
				} else if (result.state === 'denied') {
					warningToast('Camera permission is denied.');
				} else {
					requestScan();
				}
			})
			.catch(() => {
				requestScan();
			});
	};

	const scanActions: Action<HTMLVideoElement> = (node) => {
		qrScanner = new QrScanner(
			node,
			({ data }) => {
				pairingPhrase = data;
				$scanActive = false;
			},
			{
				returnDetailedScanResult: true,
				highlightScanRegion: true,
				highlightCodeOutline: true
			}
		);

		qrScanner.setInversionMode('both');
		qrScanner.start();

		return {
			destroy() {
				qrScanner.stop();
				qrScanner.turnFlashOff();
				qrScanner.destroy();
			}
		};
	};
</script>

{#if !start}
	<div class="space-y-8 text-center lg:space-y-16">
		<h2
			class="press-start mx-auto max-w-4xl text-xl leading-10 text-header md:text-2xl md:!leading-[50px] lg:text-3xl xl:text-4xl"
		>
			Encrypted Messaging Over The Bitcoin Lightning Network.
		</h2>

		<Button
			click={() => (start = true)}
			title="Get started"
			disabled={(!$serviceWorkerAvailable && !process.env.UMBREL) ||
				!$webAssemblyAvailable ||
				!$localStorageAvailable ||
				!$indexedDBAvailable ||
				!$lnc}
		/>

		{#if !$serviceWorkerAvailable && !process.env.UMBREL}
			<Warning
				text="ServiceWorker is required to run Cipherchat. Enable this feature in your browser settings to continue."
			/>
		{/if}

		{#if !$webAssemblyAvailable}
			<Warning
				text="WebAssembly is required to run Cipherchat. Enable this feature in your browser settings to continue."
			/>
		{/if}

		{#if !$localStorageAvailable}
			<Warning
				text="LocalStorage is required to run Cipherchat. Enable this feature in your browser settings to continue."
			/>
		{/if}

		{#if !$indexedDBAvailable}
			<Warning
				text="IndexedDB is required to run Cipherchat. Enable this feature in your browser settings to continue."
			/>
		{/if}
	</div>
{:else}
	<form transition:blur={{ amount: 10 }} on:submit|preventDefault>
		<label
			for="pairing"
			class="flex flex-wrap items-center gap-3 text-lg font-bold text-header md:text-xl lg:text-2xl"
		>
			Pairing Phrase <InfoTooltip
				style=""
				text="To use Cipherchat you need a lightning node that is compatible with Lightning Node Connect (LNC). Currently this is only LND nodes and you can pair using Lightning Terminal."
			/>
			{#await QrScanner.hasCamera() then hasCamera}
				{#if hasCamera}
					<button type="button" on:click={startScan} disabled={loading}>
						<Icon icon="camera" />
					</button>
				{/if}
			{/await}
		</label>
		<input
			id="pairing"
			name="pairing"
			type="text"
			required
			disabled={loading}
			bind:value={pairingPhrase}
			on:keydown={handleEnter}
			placeholder="Your LNC connection words"
			class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-xs text-header placeholder:text-xs md:text-base md:placeholder:text-base"
		/>

		<label
			for="password"
			class="flex items-center text-lg font-bold text-header md:text-xl lg:text-2xl"
		>
			Password <button
				type="button"
				class="ml-3"
				on:click={() => (showPass = !showPass)}
				disabled={loading}
			>
				<Icon icon={showPass ? 'eye' : 'eye-off'} />
			</button>
		</label>
		{#if showPass}
			<input
				id="password"
				name="password"
				type="text"
				required
				disabled={loading}
				bind:value={password}
				on:keydown={handleEnter}
				placeholder="Enter a secure password"
				class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-xs text-header placeholder:text-xs md:text-base md:placeholder:text-base"
			/>
		{:else}
			<input
				id="password"
				name="password"
				type="password"
				required
				disabled={loading}
				bind:value={password}
				on:keydown={handleEnter}
				placeholder="Enter a secure password"
				class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-xs text-header placeholder:text-xs md:text-base md:placeholder:text-base"
			/>
		{/if}

		<button
			type="button"
			class="mb-10 flex items-center text-header transition-colors hover:text-button"
			on:click={() => (showAdvanced = !showAdvanced)}
		>
			Advanced options <Icon
				icon="chevron-up"
				style="{showAdvanced ? 'rotate-180' : 'rotate-0'} transition-transform ml-3"
			/>
		</button>

		{#if showAdvanced}
			<MessageHistory {loading} />

			<label
				for="mailbox"
				class="flex items-center text-lg font-bold text-header md:text-xl lg:text-2xl"
			>
				Mailbox <InfoTooltip
					text="You can point Cipherchat to your own LNC mailbox or use a provider. Mailbox servers cannot see any private information about your node or messages. NOTE: This requires additional config on your Lightning Terminal."
				/>
			</label>

			<div class="mt-2 flex flex-col items-start gap-4 md:flex-row md:gap-10">
				{#each mailboxOptions as option}
					<button
						type="button"
						class="text-header transition-all {selectedMailbox === option.name
							? 'underline decoration-button decoration-4 underline-offset-8'
							: 'hover:underline hover:decoration-button hover:decoration-4 hover:underline-offset-8'}"
						on:click={async () => {
							mailbox = option.host;
							selectedMailbox = option.name;

							if (option.name === 'Custom') {
								await tick();
								mailboxInput.focus();
							}
						}}
						disabled={loading}
					>
						{option.name}
					</button>
				{/each}
			</div>

			<input
				id="mailbox"
				name="mailbox"
				type="text"
				required
				disabled={loading ||
					selectedMailbox === 'Lightning Labs' ||
					selectedMailbox === 'Cipherchat'}
				bind:value={mailbox}
				bind:this={mailboxInput}
				on:keydown={handleEnter}
				placeholder="Aperture relay proxy server"
				class="mb-10 mt-6 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-xs text-header placeholder:text-xs md:text-base md:placeholder:text-base"
			/>
		{/if}

		<Button
			click={connect}
			title="Connect"
			disabled={loading || !pairingPhrase || !password || !$firstUpdate || !mailbox}
			{loading}
			loadingText="Connecting..."
		/>
	</form>

	{#if $scanActive}
		<!-- svelte-ignore a11y-media-has-caption -->
		<video use:scanActions class="absolute left-0 top-0 z-10 h-full w-full bg-background" />

		{#if qrScanner}
			{#await qrScanner.hasFlash() then hasFlash}
				{#if hasFlash}
					<button
						type="button"
						on:click={() => qrScanner.toggleFlash()}
						class="absolute bottom-5 left-5 z-10 flex h-14 w-14 items-center justify-center rounded bg-button text-header shadow-lg"
					>
						<Icon icon="sunrise" />
					</button>
				{/if}
			{/await}
		{/if}

		<button
			type="button"
			on:click={() => ($scanActive = false)}
			class="absolute bottom-5 right-5 z-10 flex h-14 w-14 items-center justify-center rounded bg-button text-header shadow-lg"
		>
			<Icon icon="camera-off" />
		</button>

		<style>
			.scan-region-highlight-svg,
			.code-outline-highlight {
				stroke: #d9e7fa !important;
			}
			.scan-region-highlight {
				z-index: 20;
			}
		</style>
	{/if}
{/if}
