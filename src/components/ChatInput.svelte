<script lang="ts">
	import { sendMessage } from '$lib/chat';
	import {
		activeConversation,
		chatInput,
		chatInputHeight,
		clearMessage,
		conversation,
		lockMessage,
		messageMemory,
		scrollDiv
	} from '$lib/store';
	import { warningToast } from '$lib/utils';
	import data from '@emoji-mart/data';
	import { Icon } from 'comp';
	import { Picker } from 'emoji-mart';
	import { tick } from 'svelte';

	let emojiDiv: HTMLDivElement;

	let showEmoji = false;
	let lockEmoji = false;

	const addEmoji = (e: any) => {
		if (e.native.length + message.length <= $conversation.charLimit) {
			message = message + e.native;
			$chatInput.focus();
		} else {
			warningToast('Adding emoji will exceed character limit.');
		}
	};

	const hideEmoji = () => {
		if (showEmoji && !lockEmoji) {
			showEmoji = false;
		}
	};

	const EmojiSelector = new Picker({
		data,
		categories: [
			'frequent',
			'people',
			'nature',
			'foods',
			'activity',
			'places',
			'objects',
			'symbols',
			'flags'
		],
		onEmojiSelect: addEmoji,
		onClickOutside: hideEmoji,
		icons: 'outline',
		previewPosition: 'none',
		theme: 'light'
	});

	// @ts-expect-error - this package is not typed
	$: emojiDiv && emojiDiv.appendChild(EmojiSelector);

	let message = $messageMemory[$activeConversation] || '';

	$: charsRemaining = $conversation?.charLimit - message.length;

	const handleMessage = async () => {
		sendMessage($activeConversation, message);
		await tick();
		$scrollDiv.scrollTop = $scrollDiv.scrollHeight;
	};

	const handleEnter = (e: any) => {
		if (e.key === 'Enter' && !e.shiftKey && message.trim().length) {
			handleMessage();
			hideEmoji();
		}
	};

	const clearText = () => (message = '');

	$: $clearMessage === true && clearText();

	const addToMemory = () => {
		$messageMemory[$activeConversation] = message;
	};

	$: (message || message === '') && addToMemory();

	const recoverMessage = () => {
		const savedMessage = $messageMemory[$activeConversation];

		if (savedMessage) {
			message = savedMessage;
		} else {
			message = '';
		}
	};

	$: $activeConversation && recoverMessage();
</script>

{#if $conversation}
	<div
		bind:clientHeight={$chatInputHeight}
		class="absolute bottom-0 left-0 z-10 w-full bg-borderIn p-4"
	>
		<div class="relative flex w-full items-center space-x-2 md:space-x-4">
			<div
				bind:this={emojiDiv}
				style:bottom={`${$chatInputHeight - 24}px`}
				class="absolute left-2 {showEmoji ? 'hidden md:block' : 'hidden'}"
			/>

			<button
				class="hidden md:block {$lockMessage ? 'cursor-wait' : ''}"
				on:click={() => {
					lockEmoji = true;
					showEmoji = !showEmoji;
					setTimeout(() => (lockEmoji = false), 1000);
				}}
				disabled={$lockMessage}
			>
				<Icon icon="smile" style="text-header" />
			</button>

			<textarea
				bind:this={$chatInput}
				autocomplete="on"
				autocorrect="on"
				minlength="0"
				maxlength={$conversation.charLimit}
				spellcheck="true"
				wrap="soft"
				rows="1"
				disabled={$lockMessage}
				bind:value={message}
				on:keydown={handleEnter}
				class="max-h-16 min-h-[42px] w-full border border-header bg-borderOut p-2 text-header md:max-h-36 {$lockMessage
					? 'cursor-wait'
					: ''}"
			/>

			<button
				class="flex h-[42px] min-w-[42px] items-center justify-center rounded bg-button {message.trim()
					.length === 0
					? 'cursor-not-allowed opacity-50'
					: $lockMessage
					? 'cursor-wait'
					: ''}"
				on:click={handleMessage}
				disabled={message.trim().length === 0 || $lockMessage}
			>
				<Icon icon="message-square" style="text-header" />
			</button>

			<span
				class="cursor-default {charsRemaining <= 10
					? 'text-error'
					: charsRemaining <= 50
					? 'text-warning'
					: 'text-success'}"
			>
				{charsRemaining}
			</span>
		</div>
	</div>
{/if}
