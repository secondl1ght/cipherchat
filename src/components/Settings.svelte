<script lang="ts">
	import { clearBadge } from '$lib/chat';
	import { db } from '$lib/db';
	import { bubbleColor, innerWidth, textColor } from '$lib/store';
	import { errorToast, shortenPubkey, successToast } from '$lib/utils';
	import { Button, InfoTooltip, RowItem } from 'comp';
	import { liveQuery } from 'dexie';

	let resyncLoading = false;
	let blockedLoading = false;

	let sounds = localStorage.getItem('playAudio') === 'true' ? true : false;
	let feeLimit = localStorage.getItem('feeLimit') || '10';
	let timePref = localStorage.getItem('timePref') || '0';
	let bubbleColorSelected = localStorage.getItem('bubbleColor') || '#5A7FFF';
	let textColorSelected = localStorage.getItem('textColor') || '#D9E7FA';
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
		bubbleColorSelected = '#5A7FFF';
		localStorage.removeItem('textColor');
		textColorSelected = '#D9E7FA';
		localStorage.removeItem('showAnon');
		showAnon = false;

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
</script>

<h1 class="press-start mb-4 text-center text-lg text-header md:text-xl lg:text-2xl">Settings</h1>

<ul class="space-y-4">
	<RowItem title="Sounds" label="sounds">
		<input
			bind:checked={sounds}
			on:change={() => {
				updateSetting('playAudio', sounds.toString());
				successToast('Setting updated.');
			}}
			type="checkbox"
			id="sounds"
			name="sounds"
			class="h-5 w-5 cursor-pointer accent-button"
		/>
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
			on:input={() => {
				updateSetting('bubbleColor', bubbleColorSelected);
				$bubbleColor = bubbleColorSelected;
			}}
			on:change={() => successToast('Setting updated.')}
			type="color"
			id="bubble-color"
			name="bubble-color"
			class="cursor-pointer rounded-sm"
		/>
	</RowItem>

	<RowItem title="Text Color" label="text-color">
		<input
			bind:value={textColorSelected}
			on:input={() => {
				updateSetting('textColor', textColorSelected);
				$textColor = textColorSelected;
			}}
			on:change={() => successToast('Setting updated.')}
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
				text="Enabling this setting will show messages from nodes that have not identified themselves. You will not be able to respond to these messages."
			/>
			<input
				bind:checked={showAnon}
				on:change={() => {
					updateSetting('showAnon', showAnon.toString());
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

<hr />

<ul class="mt-4 space-y-4">
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