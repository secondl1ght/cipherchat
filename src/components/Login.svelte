<script lang="ts">
	import { generateKey, resetKey } from '$lib/crypto';
	import { db } from '$lib/db';
	import { lnc } from '$lib/lnc';
	import { connected, paired } from '$lib/store';
	import { errorToast, successToast } from '$lib/utils';
	import { Button, Icon } from 'comp';

	let loading = false;
	let password = '';
	let showPass = false;

	const login = async () => {
		try {
			loading = true;

			lnc.credentials.password = password;

			await lnc.connect();

			await generateKey(password);

			$connected = true;
			successToast('Logged in.');
		} catch (error) {
			console.log(error);
			errorToast('Login failed, please try again.');
		} finally {
			loading = false;
		}
	};

	const handleEnter = (e: any) => {
		if (e.key === 'Enter' && password) {
			login();
		}
	};

	const clear = async () => {
		try {
			loading = true;

			await db.delete();
			localStorage.clear();
			lnc.credentials.clear();
			resetKey();

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

	<Button
		click={login}
		title="Login"
		disabled={loading || !password}
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
