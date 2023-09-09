<script lang="ts">
	import { sendMessage } from '$lib/chat';
	import {
		activeConversation,
		clearMessage,
		conversation,
		lockMessage,
		messageMemory
	} from '$lib/store';
	import { warningToast } from '$lib/utils';
	import data from '@emoji-mart/data';
	import { Icon } from 'comp';
	import { Picker } from 'emoji-mart';

	let emojiDiv: HTMLDivElement;

	let showEmoji = false;
	let lockEmoji = false;

	const addEmoji = (e: any) => {
		if (e.native.length + message.length <= $conversation.charLimit) {
			message = message + e.native;
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
		icons: 'solid',
		previewPosition: 'none',
		theme: 'dark'
	});

	// @ts-expect-error
	$: emojiDiv && emojiDiv.appendChild(EmojiSelector);

	let clientHeight: number;

	let message = $messageMemory[$activeConversation] || '';

	$: charsRemaining = $conversation?.charLimit - message.length;

	const handleEnter = (e: any) => {
		if (e.key === 'Enter' && message) {
			sendMessage($activeConversation, message);
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
	<div bind:clientHeight class="absolute bottom-0 left-0 z-10 w-full bg-borderIn p-4">
		<div class="relative flex w-full items-center space-x-2 md:space-x-4">
			<div
				bind:this={emojiDiv}
				style:bottom={`${clientHeight - 24}px`}
				class="absolute left-2 rounded-[10px] border border-header {showEmoji
					? 'hidden md:block'
					: 'hidden'}"
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
				class="flex h-[42px] min-w-[42px] items-center justify-center rounded bg-button {!message
					? 'cursor-not-allowed opacity-50'
					: $lockMessage
					? 'cursor-wait'
					: ''}"
				on:click={() => sendMessage($activeConversation, message)}
				disabled={!message || $lockMessage}
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