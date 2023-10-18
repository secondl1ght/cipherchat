<script lang="ts">
	import { page } from '$app/stores';
	import { sharePubkey } from '$lib/store';
	import { shortenPubkey } from '$lib/utils';
	import { Banner } from 'comp';

	const shareParam = $page.url.searchParams.get('pubkey');

	$sharePubkey = shareParam || '';
</script>

{#if $sharePubkey}
	<Banner text={`Connect your node and login to chat with ${shortenPubkey($sharePubkey)}.`} />
{/if}
