<script lang="ts">
	import { Button, CopyButton, Icon, PublicLayout } from 'comp';
	import { blur } from 'svelte/transition';

	const lightningAddress = 'secondl1ght@getalby.com';

	let showQr = false;
</script>

<PublicLayout heroText="DONATE">
	<div class="space-y-8">
		<h1 class="press-start text-center leading-8 text-header md:text-xl md:leading-10">
			Support the project with sats!
		</h1>

		<h2 class="text-center font-bold text-header md:text-xl">
			Thank you for considering a donation.
		</h2>

		<div class="items-center justify-center space-x-3 md:flex">
			<h3 class="break-all text-center font-bold md:text-xl">{lightningAddress}</h3>

			<div class="mt-3 flex items-center justify-center space-x-6 md:mt-0">
				<CopyButton text={lightningAddress} />

				<button on:click={() => (showQr = !showQr)}>
					<Icon
						icon={showQr ? 'camera-off' : 'camera'}
						style="text-header hover:text-button transition-colors"
					/>
				</button>
			</div>
		</div>

		{#if showQr}
			<img
				transition:blur={{ amount: 10 }}
				src="/images/donate-qr.svg"
				alt="qrcode"
				class="mx-auto"
			/>
		{/if}

		<p>
			You can support the development of Cipherchat, it's continued maintenance, and infrastructure
			costs by sending bitcoin over the lightning network to the lightning address above. If you
			would prefer to send an on-chain donation, please reach out and I can provide an address.
		</p>

		<p>
			If you have found Cipherchat a useful tool, I would love to hear from you! You can send a
			message to my pubkey <strong class="break-all bg-borderIn"
				>02b47ea13d4ecec4ff4ce608dce4a0833289509f6966ca6bd0c3af07b414b317e4</strong
			>.
		</p>

		<div class="flex justify-center">
			<a href="lightning:{lightningAddress}" class="w-full md:w-auto">
				<Button
					click={() => {
						return;
					}}
					title="Donate"
				/>
			</a>
		</div>
	</div>
</PublicLayout>
