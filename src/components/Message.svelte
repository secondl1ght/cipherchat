<script lang="ts">
	export let message: MessageDecrypted;

	import { statusIcon } from '$lib/chat';
	import { db } from '$lib/db';
	import {
		LNRPC,
		activeConversation,
		activeMenu,
		activeMessage,
		bubbleColorOne,
		bubbleColorTwo,
		convoState,
		messagesLoading,
		scrollDiv,
		scrollDivPosition,
		textColorOne,
		textColorTwo
	} from '$lib/store';
	import type { MessageDecrypted } from '$lib/types';
	import { MessageType } from '$lib/types';
	import { breakAll, copy, errorToast, formatTimestamp, successToast } from '$lib/utils';
	import type { lnrpc } from '@lightninglabs/lnc-web';
	import { Icon, LoadingPing } from 'comp';
	import { tick } from 'svelte';
	import tippy from 'tippy.js';

	let contextMenu: HTMLButtonElement;
	let enableMenu = false;
	let menu: HTMLDivElement;
	let showMenu = false;

	$: contextMenu &&
		enableMenu &&
		menu &&
		tippy(contextMenu, {
			allowHTML: true,
			animation: 'shift-away',
			arrow: false,
			content: menu,
			interactive: true,
			interactiveBorder: 30,
			onCreate() {
				showMenu = true;
			},
			onShow(instance) {
				$activeMenu = instance;
			},
			onHide() {
				$activeMenu = undefined;
			},
			offset: [0, 0],
			placement: 'right-start',
			showOnCreate: true,
			trigger: 'manual'
		});

	const setToBottom = async () => {
		if ($scrollDivPosition !== undefined) return;

		await tick();
		$scrollDiv.scrollTop = $scrollDiv.scrollHeight;
	};

	$: $activeConversation && setToBottom();

	const statusMessage = (status: lnrpc.Payment_PaymentStatus, self: boolean) => {
		switch (status) {
			case $LNRPC.Payment_PaymentStatus.IN_FLIGHT:
				return 'Sending';
			case $LNRPC.Payment_PaymentStatus.SUCCEEDED:
				return self ? 'Sent' : 'Received';
			case $LNRPC.Payment_PaymentStatus.FAILED:
				return 'Failed';
			default:
				return 'Unknown';
		}
	};
</script>

{#if enableMenu}
	<!-- menu component -->
	<div bind:this={menu} class={showMenu ? 'block' : 'hidden'}>
		<button
			class="flex w-full items-center space-x-3 rounded p-2 text-header transition-colors hover:bg-header/25"
			on:click={() => {
				// @ts-expect-error - property is added when tippy is created
				contextMenu._tippy.hide();
				copy(message.message);
				successToast('Copied!');
			}}
		>
			<Icon icon="copy" width="20" height="20" /> <span class="inline-block">Copy</span>
		</button>

		{#if 'share' in navigator}
			<button
				class="flex w-full items-center space-x-3 rounded p-2 text-header transition-colors hover:bg-header/25"
				on:click={() => {
					try {
						// @ts-expect-error - property is added when tippy is created
						contextMenu._tippy.hide();
						navigator.share({ text: message.message });
					} catch (error) {
						console.log(error);
						errorToast('Could not share message.');
					}
				}}
			>
				<Icon icon="share-2" width="20" height="20" /> <span class="inline-block">Share</span>
			</button>
		{/if}

		<button
			class="flex w-full items-center space-x-3 rounded p-2 text-header transition-colors hover:bg-header/25"
			on:click={() => {
				// @ts-expect-error - property is added when tippy is created
				contextMenu._tippy.hide();
				try {
					db.transaction('rw', db.messages, () => {
						db.messages.update(message.id, {
							hide: message.hide ? false : true
						});
					});
				} catch (error) {
					console.log(error);
					errorToast('Could not toggle message visibility.');
				}
			}}
		>
			<Icon icon={message.hide ? 'toggle-right' : 'toggle-left'} width="20" height="20" />
			<span class="inline-block">{message.hide ? 'Show' : 'Hide'}</span>
		</button>

		<button
			class="flex w-full items-center space-x-3 rounded p-2 text-header transition-colors hover:bg-header/25"
			on:click={() => {
				$scrollDivPosition = $scrollDiv.scrollTop;
				$activeMessage = message.id;
				$convoState = 'MESSAGE';
			}}
			disabled={$messagesLoading}
		>
			<Icon icon="book-open" width="20" height="20" /> <span class="inline-block">Details</span>
		</button>
	</div>
{/if}

<!-- message component -->
<div class="flex w-full {message.self ? 'justify-end' : ''}">
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
				bind:this={contextMenu}
				style:background-color={message.self
					? $bubbleColorTwo || '#D9E7FA'
					: $bubbleColorOne || '#23273C'}
				style:color={message.self ? $textColorTwo || '#0C0E16' : $textColorOne || '#D9E7FA'}
				style:border={message.type === MessageType.Payment || message.hide
					? message.self
						? `2px dashed ${$textColorTwo || '#0C0E16'}`
						: `2px dashed ${$textColorOne || '#D9E7FA'}`
					: null}
				class:chat-bubble={message.type === MessageType.Text && !message.hide}
				class:chat-bubble-left={message.type === MessageType.Text && !message.hide && !message.self}
				class:chat-bubble-right={message.type === MessageType.Text && !message.hide && message.self}
				class="max-w-[90%] cursor-default select-none whitespace-pre-line rounded p-2 text-left sm:cursor-auto sm:select-text md:max-w-[75%] {message.type ===
					MessageType.Payment || message.hide
					? 'flex items-center space-x-2'
					: ''} {message.type === MessageType.Text && !message.hide
					? message.self
						? 'rounded-br-none'
						: 'rounded-bl-none'
					: ''}"
				on:contextmenu|preventDefault={async (e) => {
					// @ts-expect-error - property is added when tippy is created
					if (contextMenu._tippy) {
						// @ts-expect-error - property is added when tippy is created
						contextMenu._tippy.setProps({
							getReferenceClientRect: () => ({
								width: 0,
								height: 0,
								top: e.clientY,
								bottom: e.clientY,
								left: e.clientX,
								right: e.clientX
							})
						});

						// @ts-expect-error - property is added when tippy is created
						contextMenu._tippy.show();
					} else {
						enableMenu = true;

						await tick();

						// @ts-expect-error - property is added when tippy is created
						contextMenu._tippy.setProps({
							getReferenceClientRect: () => ({
								width: 0,
								height: 0,
								top: e.clientY,
								bottom: e.clientY,
								left: e.clientX,
								right: e.clientX
							})
						});
					}
				}}
			>
				{#if !message.hide}
					{#if message.type === MessageType.Payment && message.self}
						<Icon icon="gift" width="16" height="16" />
					{/if}

					{#if message.linkified}
						<span
							contenteditable="false"
							bind:innerHTML={message.linkified}
							class="inline-block"
							class:break-all={breakAll(message.message)}
						/>
					{:else}
						<span class="inline-block" class:break-all={breakAll(message.message)}>
							{message.message}
						</span>
					{/if}

					{#if message.type === MessageType.Payment && !message.self}
						<Icon icon="heart" width="16" height="16" />
					{/if}
				{:else}
					{#if message.self}
						<Icon icon="eye-off" width="16" height="16" />
					{/if}

					<span class="inline-block">
						{message.message}
					</span>

					{#if !message.self}
						<Icon icon="eye-off" width="16" height="16" />
					{/if}
				{/if}
			</button>
		</div>

		<p class="flex items-center space-x-1 text-xs {message.self ? 'justify-end' : ''}">
			{#if message.self}
				{#if message.status === $LNRPC.Payment_PaymentStatus.IN_FLIGHT}
					<LoadingPing color="bg-body" size="w-3.5 h-3.5" />
				{:else}
					<Icon icon={statusIcon(message.status)} width="14" height="14" />
				{/if}
			{/if}

			<span class="inline-block">{statusMessage(message.status, message.self)}</span>

			{#if !message.self}
				{#if message.status === $LNRPC.Payment_PaymentStatus.IN_FLIGHT}
					<LoadingPing color="bg-body" size="w-3.5 h-3.5" />
				{:else}
					<Icon icon={statusIcon(message.status)} width="14" height="14" />
				{/if}
			{/if}
		</p>
	</div>
</div>

<style>
	.chat-bubble {
		position: relative;
	}

	.chat-bubble::before {
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;

		position: absolute;
		bottom: 0;
		height: 0.75rem;
		width: 0.75rem;
		background-color: inherit;
		content: '';
	}

	.chat-bubble-left::before {
		mask-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMycgaGVpZ2h0PSczJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxwYXRoIGZpbGw9J2JsYWNrJyBkPSdtIDAgMyBMIDMgMyBMIDMgMCBDIDMgMSAxIDMgMCAzJy8+PC9zdmc+);
		left: -0.75rem;
	}

	.chat-bubble-right::before {
		mask-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMycgaGVpZ2h0PSczJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxwYXRoIGZpbGw9J2JsYWNrJyBkPSdtIDAgMyBMIDEgMyBMIDMgMyBDIDIgMyAwIDEgMCAwJy8+PC9zdmc+);
		right: -0.75rem;
	}
</style>
