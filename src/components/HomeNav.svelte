<script lang="ts">
	import { appView, homeState, userAlias, userAvatar, userColor, userPubkey } from '$lib/store';
	import { AppViewState } from '$lib/types';
	import { Avatar, Icon } from 'comp';
</script>

<div class="flex w-full items-center justify-between border-b border-header pb-4">
	<button on:click={() => ($homeState = 'PROFILE')}>
		<Avatar pubkey={$userPubkey} alias={$userAlias} color={$userColor} avatar={$userAvatar} />
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
</div>
