<script lang="ts">
	import { convoState } from '$lib/store';
	import { ChatWindow, MessageInfo, Node } from 'comp';
</script>

<section class="h-full w-full border-borderIn p-4 lg:border-l-8">
	{#if $convoState === 'CHAT'}
		<ChatWindow />
	{:else if $convoState === 'NODE'}
		<Node />
	{:else if $convoState === 'MESSAGE'}
		<MessageInfo />
	{/if}
</section>
