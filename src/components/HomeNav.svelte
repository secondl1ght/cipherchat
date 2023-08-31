<script lang="ts">
	import { appView, homeState, userAlias, userAvatar, userColor, userPubkey } from '$lib/store';
	import { AppViewState } from '$lib/types';
	import { Avatar, Icon } from 'comp';

	const toggleHome = () => {
		if ($homeState === 'HOME') {
			$homeState = 'PROFILE';
		} else {
			$homeState = 'HOME';
		}
	};
</script>

<nav class="mb-4 flex w-full items-center justify-between border-b border-header pb-4">
	<button on:click={toggleHome}>
		{#if $homeState === 'HOME'}
			<Avatar pubkey={$userPubkey} alias={$userAlias} color={$userColor} avatar={$userAvatar} />
		{:else}
			<Icon icon="arrow-left-circle" style="text-header" width="48" height="48" />
		{/if}
	</button>

	<div class="space-x-4">
		<button on:click={() => ($appView = AppViewState.Settings)}>
			<Icon
				icon="settings"
				style="hover:rotate-180 transition-transform text-header duration-500"
			/>
		</button>

		<button on:click={() => location.reload()}>
			<Icon icon="lock" style="text-header" />
		</button>
	</div>
</nav>
