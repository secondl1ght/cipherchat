<script lang="ts">
	import { PUBLIC_VERSION } from '$env/static/public';
	import { clearBadge } from '$lib/chat';
	import { db } from '$lib/db';
	import {
		activeConversation,
		bubbleColor,
		homeScrollDiv,
		innerWidth,
		textColor,
		updatesAvailable
	} from '$lib/store';
	import { errorToast, infoToast, shortenPubkey, successToast } from '$lib/utils';
	import { Button, Icon, InfoTooltip, Link, RowItem, Version } from 'comp';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';

	let resyncLoading = false;
	let blockedLoading = false;

	let sounds = localStorage.getItem('playAudio') === 'true' ? true : false;
	let feeLimit = localStorage.getItem('feeLimit') || '10';
	let timePref = localStorage.getItem('timePref') || '0';
	let bubbleColorSelected = $bubbleColor || '#F5F7FA';
	let textColorSelected = $textColor || '#0C0E16';
	let showAnon = localStorage.getItem('showAnon') === 'true' ? true : false;

	const updateSetting = (setting: string, value: string) => {
		localStorage.setItem(setting, value);
	};

	const resetDefaults = () => {
		localStorage.removeItem('playAudio');
		sounds = false;
		localStorage.removeItem('feeLimit');
		feeLimit = '10';
		localStorage.removeItem('timePref');
		timePref = '0';
		localStorage.removeItem('bubbleColor');
		$bubbleColor = null;
		bubbleColorSelected = '#F5F7FA';
		localStorage.removeItem('textColor');
		$textColor = null;
		textColorSelected = '#0C0E16';
		localStorage.setItem('showAnon', 'true');
		showAnon = true;

		successToast('Defaults reset.');
	};

	const resync = async () => {
		try {
			resyncLoading = true;
			await db.delete();
			localStorage.removeItem('firstSyncComplete');
			localStorage.removeItem('lastUpdate');
			await clearBadge();
			location.reload();
		} catch (error) {
			console.log(error);
			errorToast('Could not clear local database.');
			resyncLoading = false;
		}
	};

	let blockedList = liveQuery(async () => {
		try {
			const blocked = await db.conversations
				.where('blocked')
				.equals('true')
				.reverse()
				.sortBy('lastUpdate');

			return blocked;
		} catch (error) {
			console.log(error);
			errorToast('Could not load blocked list.');
		}
	});

	let updatesLoading = false;

	const checkForUpdates = async () => {
		updatesLoading = true;

		let refreshLoading = false;

		if ($updatesAvailable) {
			refreshLoading = true;
			location.reload();
			return;
		}

		try {
			const response = await fetch(
				'https://api.github.com/repos/secondl1ght/cipherchat/releases/latest',
				{
					headers: { Accept: 'application/vnd.github+json' },
					mode: 'cors',
					credentials: 'omit',
					referrer: '',
					referrerPolicy: 'no-referrer'
				}
			);

			if (!response.ok) {
				throw new Error('Network response was not OK');
			}

			const release = await response.json();
			const { tag_name } = release;

			if (tag_name !== PUBLIC_VERSION) {
				$updatesAvailable = true;
			} else {
				infoToast('Application is up-to-date.');
			}
		} catch (error) {
			console.log(error);
			errorToast('Could not check for updates.');
		} finally {
			if (!refreshLoading) {
				updatesLoading = false;
			}
		}
	};

	onDestroy(() => ($homeScrollDiv.scrollTop = 0));
</script>

<h1 class="press-start mb-4 text-center text-lg text-header md:text-xl lg:text-2xl">Settings</h1>

<ul class="space-y-4">
	<RowItem title="Sounds" label="sounds">
		<button
			id="sounds"
			on:click={() => {
				sounds = !sounds;
				updateSetting('playAudio', sounds.toString());
				successToast('Setting updated.');
			}}
		>
			<Icon icon={sounds ? 'volume-2' : 'volume-x'} style="text-header" />
		</button>
	</RowItem>

	<RowItem title="Fee Limit" label="fee">
		<div>
			<p class="text-center"><strong>{feeLimit}</strong> sats</p>
			<input
				bind:value={feeLimit}
				on:change={() => {
					updateSetting('feeLimit', feeLimit);
					successToast('Setting updated.');
				}}
				type="range"
				id="fee"
				name="fee"
				min="0"
				max="100"
				class="cursor-pointer accent-button"
			/>
		</div>
	</RowItem>

	<RowItem title="Time Preference" label="time" flex={false}>
		<select
			bind:value={timePref}
			on:change={() => {
				updateSetting('timePref', timePref);
				successToast('Setting updated.');
			}}
			id="time"
			name="time"
			class="mt-2 block w-full cursor-pointer rounded-sm py-px text-sm"
		>
			<option value="-1">Optimize fees</option>
			<option value="0">Balanced</option>
			<option value="1">Optimize reliability</option>
		</select>
	</RowItem>

	<RowItem title="Bubble Color" label="bubble-color">
		<input
			bind:value={bubbleColorSelected}
			on:input={() => ($bubbleColor = bubbleColorSelected)}
			on:change={() => {
				updateSetting('bubbleColor', bubbleColorSelected);
				successToast('Setting updated.');
			}}
			type="color"
			id="bubble-color"
			name="bubble-color"
			class="cursor-pointer rounded-sm"
		/>
	</RowItem>

	<RowItem title="Text Color" label="text-color">
		<input
			bind:value={textColorSelected}
			on:input={() => ($textColor = textColorSelected)}
			on:change={() => {
				updateSetting('textColor', textColorSelected);
				successToast('Setting updated.');
			}}
			type="color"
			id="text-color"
			name="text-color"
			class="cursor-pointer rounded-sm"
		/>
	</RowItem>

	<RowItem title="Show Anonymous" label="anon">
		<div class="flex items-center">
			<InfoTooltip
				style="mr-3 text-header"
				text="Enabling this setting will show messages received from nodes that have not revealed their identity or could not be verified. You will not be able to respond to these messages."
			/>
			<input
				bind:checked={showAnon}
				on:change={() => {
					updateSetting('showAnon', showAnon.toString());
					if ($activeConversation === 'ANON') {
						$activeConversation = '';
					}
					successToast('Setting updated.');
				}}
				type="checkbox"
				id="anon"
				name="anon"
				class="h-5 w-5 cursor-pointer accent-button"
			/>
		</div>
	</RowItem>
</ul>

<Button click={resetDefaults} style="my-4 !w-full !h-12" title="Reset Defaults" />

<hr class="border-header" />

<ul class="my-4 space-y-4">
	<RowItem title="Resync Messages" flex={$innerWidth > 640 ? true : false}>
		<div class="mt-2 flex items-center text-header md:mt-0">
			<InfoTooltip
				style="mr-3"
				text="This will clear the local database and logout. Messages will then be resynced from your node the next time you login."
			/>
			<button
				on:click={resync}
				disabled={resyncLoading || blockedLoading}
				class="transition-colors hover:text-button {resyncLoading
					? 'cursor-wait'
					: blockedLoading
					? 'cursor-not-allowed'
					: 'cursor-pointer'}">Resync</button
			>
		</div>
	</RowItem>

	<RowItem title="Blocked List" flex={false}>
		{#if $blockedList}
			{#if $blockedList.length}
				<ol class="mt-2 space-y-2">
					{#each $blockedList as blocked}
						<li class="flex items-center justify-between space-x-4 md:space-x-8">
							<strong>{shortenPubkey(blocked.pubkey)}</strong>

							<button
								on:click={async () => {
									try {
										blockedLoading = true;
										await db.transaction(
											'rw',
											db.conversations,
											async () =>
												await db.conversations.update(blocked.pubkey, { blocked: 'false' })
										);
										successToast('Removed node from blocked list.');
										blockedLoading = false;
									} catch (error) {
										console.log(error);
										errorToast('Could not remove node from blocked list.');
										blockedLoading = false;
									}
								}}
								disabled={blockedLoading || resyncLoading}
								class="text-header transition-colors hover:text-button {blockedLoading
									? 'cursor-wait'
									: resyncLoading
									? 'cursor-not-allowed'
									: 'cursor-pointer'}">Unblock</button
							>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="mt-2 text-sm">
					Nodes on this list will still be able to send you payments and messages, but they will be
					hidden from view.
				</p>
			{/if}
		{/if}
	</RowItem>
</ul>

<hr class="border-header" />

<ul class="mb-2 mt-4">
	<RowItem title="App Version">
		<Version style="whitespace-nowrap text-sm" />
	</RowItem>
</ul>

{#if $updatesAvailable}
	<p class="mb-2 text-sm">
		<span class="relative inline-flex h-3 w-3">
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full bg-button opacity-75"
			/>
			<span class="relative inline-flex h-3 w-3 rounded-full bg-button" />
		</span>
		A new version of Cipherchat has been <Link
			external
			href="https://github.com/secondl1ght/cipherchat/releases/latest"
			title="released"
		/>! Refresh the page to download and install the updates. Then close all running instances of
		the app and relaunch to complete the update. 🚀
	</p>
{/if}

<Button
	click={checkForUpdates}
	style="!w-full !h-12"
	title={$updatesAvailable ? 'Refresh' : 'Check for Updates'}
	disabled={updatesLoading}
	loading={updatesLoading}
	loadingText={$updatesAvailable ? 'Refreshing...' : 'Checking...'}
/>
