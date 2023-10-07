<script lang="ts">
	import { page } from '$app/stores';
	import { sharePubkey } from '$lib/store';
	import { shortenPubkey } from '$lib/utils';

	const shareParam = $page.url.searchParams.get('pubkey');

	$sharePubkey = shareParam || '';
</script>

{#if $sharePubkey}
	<div
		class="hide-scroll w-full cursor-default select-none overflow-x-auto whitespace-nowrap bg-banner p-2 text-center text-sm text-header md:text-base"
	>
		Connect your node and login to chat with {shortenPubkey($sharePubkey)}.
	</div>
{/if}
