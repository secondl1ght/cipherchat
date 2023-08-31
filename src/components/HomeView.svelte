<script lang="ts">
	import { homeState } from '$lib/store';
	import { AddConversation, Conversations, HomeNav, Profile } from 'comp';
</script>

<section
	class="relative h-full w-full border-borderOut bg-boxFill p-4 lg:w-1/3 lg:min-w-[396px] lg:max-w-xl lg:border-r-[16px]"
>
	<HomeNav />

	{#if $homeState === 'HOME'}
		<Conversations />
	{:else if $homeState === 'PROFILE'}
		<Profile />
	{:else if $homeState === 'ADD'}
		<AddConversation />
	{/if}
</section>
