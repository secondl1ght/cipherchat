<script lang="ts">
	import { homeState } from '$lib/store';
	import { AddConversation, Conversations, HomeNav, Profile } from 'comp';
	import { blur } from 'svelte/transition';
</script>

<section
	class="relative h-full w-full overflow-y-auto border-borderOut bg-boxFill p-4 lg:w-1/3 lg:min-w-[396px] lg:max-w-xl lg:border-r-[16px]"
>
	<HomeNav />

	{#if $homeState === 'HOME'}
		<Conversations />
	{:else if $homeState === 'PROFILE'}
		<div transition:blur={{ amount: 10 }} class="w-full">
			<Profile />
		</div>
	{:else if $homeState === 'ADD'}
		<div transition:blur={{ amount: 10 }} class="w-full">
			<AddConversation />
		</div>
	{/if}
</section>
