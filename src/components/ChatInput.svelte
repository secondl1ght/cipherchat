<script lang="ts">
	import { sendMessage } from '$lib/chat';
	import {
		activeConversation,
		chatInput,
		chatInputHeight,
		conversation,
		innerWidth,
		messageMemory,
		scrollBottom,
		scrollDiv,
		showScrollButton
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
		clearText();
	};

	const handleKeys = (e: any) => {
		if (e.key === 'Enter' && !e.shiftKey && message.trim().length && $innerWidth > 640) {
			e.preventDefault();

			handleMessage();
			hideEmoji();
		}

		if (e.key === 'e' && e.ctrlKey && e.altKey && $innerWidth > 640) {
			e.preventDefault();

			showEmoji = !showEmoji;
		}
	};

	const clearText = async () => {
		message = '';
		await tick();
		textareaAutoSize();
	};

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
	{#if $showScrollButton}
		<button
			style:bottom={`${$chatInputHeight + 20}px`}
			class="absolute right-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-button text-header shadow-lg"
			on:click={() => $scrollBottom.scrollIntoView({ behavior: 'smooth' })}
		>
			<Icon icon="arrow-down" />
		</button>
	{/if}

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
				class="hidden md:block"
				on:click={() => {
					lockEmoji = true;
					showEmoji = !showEmoji;
					setTimeout(() => (lockEmoji = false), 1000);

					$chatInput?.focus();
				}}
				disabled={$activeConversation === 'ANON'}
				class:cursor-not-allowed={$activeConversation === 'ANON'}
				class:opacity-50={$activeConversation === 'ANON'}
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
				disabled={$activeConversation === 'ANON'}
				class:cursor-not-allowed={$activeConversation === 'ANON'}
				class:opacity-50={$activeConversation === 'ANON'}
				bind:value={message}
				on:keydown={handleKeys}
				on:input={textareaAutoSize}
				class="hide-scroll max-h-16 min-h-[42px] w-full resize-none border border-header bg-borderOut p-2 text-header md:max-h-36"
			/>

			<button
				class="flex h-[42px] min-w-[42px] items-center justify-center rounded bg-button {message.trim()
					.length === 0
					? 'cursor-not-allowed opacity-50'
					: ''}"
				on:click={() => {
					handleMessage();
					$chatInput?.focus();
				}}
				disabled={message.trim().length === 0}
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
