<script lang="ts">
	import { appView, userAlias, userAvatar, userColor, userPubkey } from '$lib/store';
	import { AppViewState } from '$lib/types';
	import { AddConversation, Avatar, Conversations, Icon, Profile } from 'comp';

	let state: 'HOME' | 'PROFILE' | 'ADD' = 'HOME';
</script>

<section
	class="h-full w-full border-borderOut bg-boxFill p-4 lg:w-1/3 lg:min-w-[396px] lg:max-w-xl lg:border-r-[16px]"
>
	<div class="flex w-full items-center justify-between border-b border-header pb-4">
		<button on:click={() => (state = 'PROFILE')}>
			<Avatar pubkey={$userPubkey} alias={$userAlias} color={$userColor} avatar={$userAvatar} />
		</button>

		<button on:click={() => ($appView = AppViewState.Settings)}>
			<Icon
				icon="settings"
				style="hover:rotate-180 transition-transform text-header duration-500"
			/>
		</button>
	</div>

	{#if state === 'HOME'}
		<Conversations />
	{:else if state === 'PROFILE'}
		<Profile />
	{:else if state === 'ADD'}
		<AddConversation />
	{/if}
</section>
