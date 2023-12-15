<script lang="ts">
	export let channel: lnrpc.Channel;

	import { conversation, userColor } from '$lib/store';
	import { formatNumber } from '$lib/utils';
	import type { lnrpc } from '@lightninglabs/lnc-web';
	import { CopyButton, RowItem } from 'comp';
	import numbro from 'numbro';
	import tippy from 'tippy.js';

	let localBtn: HTMLButtonElement;
	let remoteBtn: HTMLButtonElement;

	const local = Number(channel.localBalance);
	const remote = Number(channel.remoteBalance);

	const total = local + remote;
	const localPercent = ((local / total) * 100).toFixed(0) + '%';
	const remotePercent = ((remote / total) * 100).toFixed(0) + '%';

	$: localBtn &&
		tippy([localBtn], {
			content: formatNumber(local)
		});

	$: remoteBtn &&
		tippy([remoteBtn], {
			content: formatNumber(remote)
		});

	let sideHover: 'LOCAL' | 'REMOTE' | undefined;
</script>

<div class="space-y-2">
	<p class="flex items-center justify-center space-x-2">
		<span class="relative flex h-3 w-3">
			<span
				class="absolute inline-flex h-full w-full rounded-full opacity-75 {channel.active
					? 'animate-ping bg-success'
					: 'bg-error'}"
			/>
			<span
				class="relative inline-flex h-3 w-3 rounded-full {channel.active
					? 'bg-success'
					: 'bg-error'}"
			/>
		</span>

		<span class="inline-block font-bold">{channel.chanId}</span>

		<CopyButton text={channel.chanId} width="16" height="16" />
	</p>

	<div class="flex justify-center">
		<div class="w-1/2">
			<p class="mb-2 text-center">Local</p>

			<button
				bind:this={localBtn}
				on:mouseenter={() => (sideHover = 'LOCAL')}
				on:mouseleave={() => (sideHover = undefined)}
				class="relative flex w-full justify-end border border-header bg-borderIn {sideHover ===
				'REMOTE'
					? 'opacity-50'
					: ''} transition-opacity"
			>
				<div
					style:width={localPercent}
					style:background-color={$userColor || '#F7931A'}
					class="h-6 text-center text-header"
				>
					<div class="sats-label">{numbro(local).format({ average: true, mantissa: 1 })}</div>
				</div>
			</button>
		</div>

		<div class="w-1/2">
			<p class="mb-2 text-center">Remote</p>

			<button
				bind:this={remoteBtn}
				on:mouseenter={() => (sideHover = 'REMOTE')}
				on:mouseleave={() => (sideHover = undefined)}
				class="relative w-full border border-header bg-borderIn {sideHover === 'LOCAL'
					? 'opacity-50'
					: ''} transition-opacity"
			>
				<div
					style:width={remotePercent}
					style:background-color={$conversation.color || '#F7931A'}
					class="h-6 text-center text-header"
				>
					<div class="sats-label">{numbro(remote).format({ average: true, mantissa: 1 })}</div>
				</div>
			</button>
		</div>
	</div>

	<RowItem title="Capacity">
		<p class="whitespace-nowrap">{formatNumber(Number(channel.capacity))} sats</p>
	</RowItem>

	<RowItem title="Total Sent">
		<p class="whitespace-nowrap">{formatNumber(Number(channel.totalSatoshisSent))} sats</p>
	</RowItem>

	<RowItem title="Total Received">
		<p class="whitespace-nowrap">{formatNumber(Number(channel.totalSatoshisReceived))} sats</p>
	</RowItem>
</div>

<style>
	.sats-label {
		position: absolute;
		top: 50%;
		left: 50%;
		-moz-transform: translateX(-50%) translateY(-50%);
		-webkit-transform: translateX(-50%) translateY(-50%);
		transform: translateX(-50%) translateY(-50%);
	}
</style>
