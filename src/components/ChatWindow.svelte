<script lang="ts">
	import { clearUnread } from '$lib/chat';
	import { scrollDiv } from '$lib/store';
	import { ChatInput, ChatMessages } from 'comp';

	const handleClear = () => {
		if ($scrollDiv.scrollHeight - $scrollDiv.scrollTop - $scrollDiv.clientHeight === 0) {
			clearUnread();
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={handleClear}
	on:mouseenter={handleClear}
	on:mouseleave={handleClear}
	class="h-full w-full"
>
	<ChatMessages />
	<ChatInput />
</div>
