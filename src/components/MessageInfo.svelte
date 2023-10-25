<script lang="ts">
	import { formatPaymentMsg } from '$lib/chat';
	import { decrypt } from '$lib/crypto';
	import { db } from '$lib/db';
	import { LNRPC, activeMessage, bubbleColor, textColor } from '$lib/store';
	import { MessageType } from '$lib/types';
	import { errorToast, formatNumber, formatTimestamp } from '$lib/utils';
	import type { lnrpc } from '@lightninglabs/lnc-web';
	import { CopyButton, Icon, RowItem } from 'comp';
	import Dexie, { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';

	$: message = liveQuery(async () => {
		try {
			const message = await db.messages.get($activeMessage);
			if (!message) return;

			if (message.hide) {
				return { ...message, message: 'This message is hidden.' };
			}

			if (message.type === MessageType.Payment) {
				const paymentMsg = formatPaymentMsg(message.self, message.amount);

				return { ...message, message: paymentMsg };
			}

			const decryptedMsg = await Dexie.waitFor(decrypt(message.iv, message.message));

			return { ...message, message: decryptedMsg || 'Could not decrypt message.' };
		} catch (error) {
			console.log(error);
			errorToast('Could not get message details.');
		}
	});

	const failureReason = (reason: lnrpc.PaymentFailureReason) => {
		switch (reason) {
			case $LNRPC.PaymentFailureReason.FAILURE_REASON_ERROR:
				return 'Error';
			case $LNRPC.PaymentFailureReason.FAILURE_REASON_INCORRECT_PAYMENT_DETAILS:
				return 'Incorrect Payment Details';
			case $LNRPC.PaymentFailureReason.FAILURE_REASON_INSUFFICIENT_BALANCE:
				return 'Insufficient Balance';
			case $LNRPC.PaymentFailureReason.FAILURE_REASON_NONE:
				return 'None';
			case $LNRPC.PaymentFailureReason.FAILURE_REASON_NO_ROUTE:
				return 'No Route';
			case $LNRPC.PaymentFailureReason.FAILURE_REASON_TIMEOUT:
				return 'Timeout';
			case $LNRPC.PaymentFailureReason.UNRECOGNIZED:
			default:
				return 'Unrecognized';
		}
	};

	onDestroy(() => ($activeMessage = ''));
</script>

{#if $message}
	<h1 class="press-start mb-4 text-center text-header md:text-lg">Message Details</h1>

	<ul class="space-y-4">
		<RowItem title="Preimage">
			<p class="flex items-center space-x-2">
				<CopyButton text={$message.id} width="16" height="16" />
				<span class="inline-block">
					{$message.id}
				</span>
			</p>
		</RowItem>

		<RowItem title="Signature">
			{#if $message.signature}
				<p class="flex items-center space-x-2">
					<CopyButton text={$message.signature} width="16" height="16" />
					<span class="inline-block">
						{$message.signature}
					</span>
				</p>
			{:else}
				<p>-</p>
			{/if}
		</RowItem>

		<RowItem title="Type">
			<p>
				{$message.type}
			</p>
		</RowItem>

		<RowItem title="Status">
			<p
				class={$message.status === $LNRPC.Payment_PaymentStatus.SUCCEEDED
					? 'text-success'
					: $message.status === $LNRPC.Payment_PaymentStatus.IN_FLIGHT
					? 'text-warning'
					: $message.status === $LNRPC.Payment_PaymentStatus.FAILED
					? 'text-error'
					: ''}
			>
				{$message.status.replaceAll('_', ' ')}
			</p>
		</RowItem>

		{#if $message.failureReason !== $LNRPC.PaymentFailureReason.FAILURE_REASON_NONE}
			<RowItem title="Failure Reason">
				<p class="whitespace-nowrap uppercase">
					{failureReason($message.failureReason)}
				</p>
			</RowItem>
		{/if}

		<RowItem title="Timestamp">
			<p class="whitespace-nowrap">
				{formatTimestamp($message.timestamp, true).time},
				{formatTimestamp($message.timestamp, true).date}
			</p>
		</RowItem>

		<RowItem title="Amount">
			<p class="whitespace-nowrap">
				{formatNumber($message.amount)} sats
			</p>
		</RowItem>

		{#if $message.fee !== undefined}
			<RowItem title="Fee">
				<p class="whitespace-nowrap">
					{formatNumber($message.fee)} sats
				</p>
			</RowItem>
		{/if}
	</ul>

	<div class="mt-4 flex justify-center md:mx-4">
		<div
			style:background-color={$bubbleColor}
			style:color={$textColor}
			class="max-w-[90%] rounded p-2 text-left md:max-w-[75%] {$message.type ===
				MessageType.Payment || $message.hide
				? 'flex items-center space-x-2'
				: ''} {$bubbleColor ? '' : 'bg-gradient-to-r from-gradientOne to-gradientTwo'} {$textColor
				? ''
				: 'text-borderIn'}"
		>
			{#if !$message.hide}
				{#if $message.type === MessageType.Payment && $message.self}
					<Icon icon="gift" width="16" height="16" />
				{/if}

				<span class="inline-block break-all">{$message.message}</span>

				{#if $message.type === MessageType.Payment && !$message.self}
					<Icon icon="heart" width="16" height="16" />
				{/if}
			{:else}
				{#if $message.self}
					<Icon icon="eye-off" width="16" height="16" />
				{/if}

				<span class="inline-block">{$message.message}</span>

				{#if !$message.self}
					<Icon icon="eye-off" width="16" height="16" />
				{/if}
			{/if}
		</div>
	</div>
{/if}
