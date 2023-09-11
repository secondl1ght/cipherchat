<script lang="ts">
	import { statusIcon } from '$lib/chat';
	import {
		activeConversation,
		bubbleColor,
		chatInputHeight,
		messages,
		scrollDiv,
		textColor
	} from '$lib/store';
	import { MessageType } from '$lib/types';
	import { formatTimestamp } from '$lib/utils';
	import { lnrpc } from '@lightninglabs/lnc-web';
	import { Icon, LoadingPing } from 'comp';
	import type { Action } from 'svelte/action';

	const setToBottom: Action<HTMLDivElement, string> = () => {
		$scrollDiv.scrollTop = $scrollDiv.scrollHeight;

		return {
			update() {
				$scrollDiv.scrollTop = $scrollDiv.scrollHeight;
			}
		};
	};

	const statusMessage = (status: lnrpc.Payment_PaymentStatus, self: boolean) => {
		switch (status) {
			case lnrpc.Payment_PaymentStatus.IN_FLIGHT:
				return 'Sending';
			case lnrpc.Payment_PaymentStatus.SUCCEEDED:
				return self ? 'Sent' : 'Received';
			case lnrpc.Payment_PaymentStatus.FAILED:
				return 'Failed';
			default:
				return 'Unknown';
		}
	};
</script>

{#if $scrollDiv}
	<div style:padding-bottom={`${$chatInputHeight}px`} class="h-full w-full space-y-4 px-4">
		{#each $messages as message}
			<div
				use:setToBottom={$activeConversation}
				class="flex w-full {message.self ? 'justify-end' : ''}"
			>
				<div class="w-full space-y-1">
					<p class="text-xs {message.self ? 'text-right' : ''}">
						{message.self
							? formatTimestamp(message.receivedTime).time
							: formatTimestamp(message.receivedTime).date}, {message.self
							? formatTimestamp(message.receivedTime).date
							: formatTimestamp(message.receivedTime).time}
					</p>

					<div class="flex {message.self ? 'justify-end' : ''}">
						<button
							style:background-color={$bubbleColor}
							style:color={$textColor}
							class="max-w-[90%] break-all rounded p-2 text-left md:max-w-[75%] {message.type ===
							MessageType.Payment
								? 'underline decoration-body decoration-4 underline-offset-4'
								: ''} {$bubbleColor
								? ''
								: 'bg-gradient-to-r from-gradientOne to-gradientTwo'} {$textColor
								? ''
								: 'text-borderIn'}"
							on:click={() => {}}
						>
							{message.message}
						</button>
					</div>

					<p class="flex items-center space-x-1 text-xs {message.self ? 'justify-end' : ''}">
						{#if message.self}
							{#if message.status === lnrpc.Payment_PaymentStatus.IN_FLIGHT}
								<LoadingPing color="bg-body" size="w-4 h-4" />
							{:else}
								<Icon icon={statusIcon(message.status)} width="16" height="16" />
							{/if}
						{/if}

						<span class="inline-block">{statusMessage(message.status, message.self)}</span>

						{#if !message.self}
							{#if message.status === lnrpc.Payment_PaymentStatus.IN_FLIGHT}
								<LoadingPing color="bg-body" size="w-4 h-4" />
							{:else}
								<Icon icon={statusIcon(message.status)} width="16" height="16" />
							{/if}
						{/if}
					</p>
				</div>
			</div>
		{/each}
	</div>
{/if}
