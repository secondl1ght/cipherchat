<script lang="ts">
	import { ChatWindow, MessageInfo, Node } from 'comp';

	let state: 'CHAT' | 'NODE' | 'MESSAGE' = 'CHAT';
</script>

<section class="h-full w-full border-borderIn p-4 lg:border-l-8">
	{#if state === 'CHAT'}
		<ChatWindow />
	{:else if state === 'NODE'}
		<Node />
	{:else if state === 'MESSAGE'}
		<MessageInfo />
	{/if}
</section>
