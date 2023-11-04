<script lang="ts">
	import { clearBadge } from '$lib/chat';
	import { generateKey, resetKey } from '$lib/crypto';
	import { db } from '$lib/db';
	import { connected, firstUpdate, lnc, paired } from '$lib/store';
	import { errorToast, monthAgo, shortenPubkey, successToast } from '$lib/utils';
	import { Button, Icon, MessageHistory } from 'comp';

	let loading = false;
	let password = '';
	let showPass = false;

	const pubkey = localStorage.getItem('userPubkey');
	const alias = localStorage.getItem('userAlias');
	const color = localStorage.getItem('userColor');

	const login = async () => {
		try {
			loading = true;

			$lnc.credentials.password = password;

			await $lnc.connect();

			await $lnc.lnd.lightning.getInfo();

			await generateKey(password);

			$connected = true;
		} catch (error) {
			console.log(error);
			errorToast('Login failed, please try again.');
		} finally {
			loading = false;
		}
	};

	const handleEnter = (
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (e.key === 'Enter' && password && $firstUpdate) {
			login();
		}
	};

	const clear = async () => {
		try {
			loading = true;

			await db.delete();
			localStorage.clear();
			await clearBadge();
			$lnc.credentials.clear();
			resetKey();
			$firstUpdate = monthAgo();

			$paired = false;
			successToast('Node credentials cleared.');
		} catch (error) {
			console.log(error);
			errorToast('Clear connection failed, please try again.');
		} finally {
			loading = false;
		}
	};
</script>

{#if alias || pubkey}
	<h2 class="press-start mb-10 text-xl text-header md:text-2xl lg:text-3xl xl:text-4xl">
		Welcome, <span
			style:text-decoration-color={color || '#F7931A'}
			class="mt-2 block break-words leading-10 underline decoration-4 underline-offset-8 md:!leading-[50px]"
		>
			{alias || shortenPubkey(pubkey || '')}
		</span>
	</h2>
{/if}

<form on:submit|preventDefault>
	<label
		for="password"
		class="flex items-center text-lg font-bold text-header md:text-xl lg:text-2xl"
	>
		Password <button
			type="button"
			class="ml-3"
			on:click={() => (showPass = !showPass)}
			disabled={loading}
		>
			<Icon icon={showPass ? 'eye' : 'eye-off'} />
		</button>
	</label>
	{#if showPass}
		<input
			id="password"
			name="password"
			type="text"
			required
			disabled={loading}
			bind:value={password}
			on:keydown={handleEnter}
			placeholder="Enter to unlock"
			class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-xs text-header placeholder:text-xs md:text-base md:placeholder:text-base"
		/>
	{:else}
		<input
			id="password"
			name="password"
			type="password"
			required
			disabled={loading}
			bind:value={password}
			on:keydown={handleEnter}
			placeholder="Enter to unlock"
			class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-xs text-header placeholder:text-xs md:text-base md:placeholder:text-base"
		/>
	{/if}

	{#if !localStorage.getItem('lastUpdate')}
		<MessageHistory {loading} />
	{/if}

	<Button
		click={login}
		title="Login"
		disabled={loading || !password || !$firstUpdate}
		{loading}
		loadingText="Logging in..."
	/>

	<div class="flex justify-center">
		<button
			type="button"
			class="mt-10 text-header transition-colors hover:text-button"
			on:click={clear}
			disabled={loading}
		>
			Clear node connection
		</button>
	</div>
</form>
