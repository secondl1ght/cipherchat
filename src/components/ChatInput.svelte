<script lang="ts">
	import { sendMessage } from '$lib/chat';
	import {
		activeConversation,
		chatInput,
		chatInputHeight,
		clearMessage,
		conversation,
		innerWidth,
		lockMessage,
		messageMemory,
		scrollDiv
	} from '$lib/store';
	import { warningToast } from '$lib/utils';
	import data from '@emoji-mart/data';
	import { Icon } from 'comp';
	import { Picker } from 'emoji-mart';
	import { tick } from 'svelte';
	import type { Action } from 'svelte/action';

	const focusInput: Action<HTMLTextAreaElement> = (node) => {
		if ($innerWidth > 640) {
			node.focus();
		}
	};

	const textareaAutoSize = () => {
		if (!$chatInput || !$scrollDiv) return;

		$chatInput.style.height = '0';
		$chatInput.style.height = $chatInput.scrollHeight.toString() + 'px';

		if ($scrollDiv.scrollHeight - $scrollDiv.scrollTop - $scrollDiv.clientHeight <= 25) {
			setTimeout(() => ($scrollDiv.scrollTop = $scrollDiv.scrollHeight), 0);
		}
	};

	let emojiDiv: HTMLDivElement;

	let showEmoji = false;
	let lockEmoji = false;

	const addEmoji = async (e: any) => {
		if (e.native.length + message.length <= $conversation.charLimit) {
			message = message + e.native;
			await tick();
			textareaAutoSize();
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

	const handleMessage = () => {
		sendMessage($activeConversation, message);
	};

	const handleEnter = (e: any) => {
		if (e.key === 'Enter' && !e.shiftKey && message.trim().length) {
			handleMessage();
			hideEmoji();
		}
	};

	const clearText = async () => {
		message = '';
		await tick();
		textareaAutoSize();
	};

	$: $clearMessage === true && clearText();

	const addToMemory = () => {
		$messageMemory[$activeConversation] = message;
	};

	$: (message || message === '') && addToMemory();

	const recoverMessage = async () => {
		const savedMessage = $messageMemory[$activeConversation];

		if (savedMessage) {
			message = savedMessage;
			await tick();
			textareaAutoSize();
			if ($innerWidth > 640) {
				$chatInput?.focus();
			}
		} else {
			message = '';
			await tick();
			textareaAutoSize();
			if ($innerWidth > 640) {
				$chatInput?.focus();
			}
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
				use:focusInput
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
				on:input={textareaAutoSize}
				class="hide-scroll max-h-16 min-h-[42px] w-full resize-none border border-header bg-borderOut p-2 text-header md:max-h-36 {$lockMessage
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
				class="cursor-default text-sm md:text-base {charsRemaining <= 10
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
