<script lang="ts">
	import { homeState } from '$lib/store';
	import { AddConversation, Conversations, HomeNav, Profile, Settings } from 'comp';
	import { blur } from 'svelte/transition';
</script>

<section class="relative h-full w-full bg-boxFill">
	<div class="hide-scroll h-full w-full overflow-y-auto">
		<HomeNav />

		<div class="py-4">
			{#if $homeState === 'HOME'}
				<div class="w-full">
					<Conversations />
				</div>
			{:else if $homeState === 'PROFILE'}
				<div in:blur={{ amount: 10 }} class="w-full px-4">
					<Profile />
				</div>
			{:else if $homeState === 'ADD'}
				<div in:blur={{ amount: 10 }} class="w-full px-4">
					<AddConversation />
				</div>
			{:else if $homeState === 'SETTINGS'}
				<div in:blur={{ amount: 10 }} class="w-full px-4">
					<Settings />
				</div>
			{/if}
		</div>
	</div>
</section>
