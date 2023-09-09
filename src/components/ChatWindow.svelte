<script lang="ts">
	import { clearUnread } from '$lib/chat';
	import { ChatInput } from 'comp';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={clearUnread}
	on:mouseenter={clearUnread}
	on:mouseleave={clearUnread}
	class="h-full w-full"
>
	<ChatInput />
</div>
