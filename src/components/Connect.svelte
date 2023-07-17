<script lang="ts">
	import { lnc } from '$lib/lnc';
	import { connected } from '$lib/store';
	import { tick } from 'svelte';
	import { Button, InfoTooltip, Icon } from 'comp';
	import { errorToast, successToast } from '$lib/utils';

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
		{ name: 'Cipherchat', host: 'mailbox.cipherchat.app:443' },
		{ name: 'Custom', host: '' }
	];

	let mailboxInput: HTMLInputElement;

	const connect = async () => {
		try {
			loading = true;

			lnc.credentials.serverHost = mailbox;
			lnc.credentials.pairingPhrase = pairingPhrase;

			await lnc.connect();

			await lnc.lnd.lightning.getInfo();

			lnc.credentials.password = password;
			$connected = true;
			successToast('Node connected successfully!');
		} catch (error) {
			errorToast('Node connection failed, please try again.');
		} finally {
			loading = false;
		}
	};

	const handleEnter = (e: any) => {
		if (e.key === 'Enter' && pairingPhrase && password && mailbox) {
			connect();
		}
	};
</script>

{#if !start}
	<h2
		class="press-start mx-auto mb-8 max-w-4xl text-center text-xl leading-10 text-header md:text-2xl md:!leading-[50px] lg:mb-16 lg:text-3xl xl:text-4xl"
	>
		Encrypted Messaging Over The Bitcoin Lightning Network.
	</h2>

	<Button click={() => (start = true)} title="Get started" />
{:else}
	<form on:submit={(e) => e.preventDefault()}>
		<label
			for="pairing"
			class="flex items-center text-lg font-bold text-header md:text-xl lg:text-2xl"
		>
			Pairing Phrase <InfoTooltip
				text="To use Cipherchat you need a lightning node that is compatible with Lightning Node Connect (LNC). Currently this is only LND nodes and you can pair using Lightning Terminal."
			/>
		</label>
		<input
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
			<label
				for="mailbox"
				class="flex items-center text-lg font-bold text-header md:text-xl lg:text-2xl"
			>
				Mailbox <InfoTooltip
					text="You can point Cipherchat to your own LNC mailbox or use a provider. Mailbox servers cannot see any private information about your node or messages."
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
			disabled={loading || !pairingPhrase || !password || !mailbox}
			{loading}
			loadingText="Connecting..."
		/>
	</form>
{/if}
