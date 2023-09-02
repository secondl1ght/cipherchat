<script lang="ts">
	import { homeState, userAlias, userAvatar, userColor, userPubkey } from '$lib/store';
	import { errorToast, successToast, warningToast } from '$lib/utils';
	import { Avatar, Icon } from 'comp';
	import tippy from 'tippy.js';

	const toggleHome = () => {
		if ($homeState === 'HOME') {
			$homeState = 'PROFILE';
		} else {
			$homeState = 'HOME';
		}
	};

	let notificationsEnabled = Notification.permission === 'granted' ? true : false;

	const allowNotifications = () => {
		if (!('Notification' in window)) {
			warningToast('Your browser does not support notifications.');
		} else {
			Notification.requestPermission().then((permission) => {
				if (permission === 'granted') {
					notificationsEnabled = true;
					successToast('Notifications enabled.');
				} else {
					errorToast('Permission denied.');
				}
			});
		}
	};

	let tooltip: HTMLSpanElement;

	$: tooltip &&
		notificationsEnabled &&
		tippy([tooltip], {
			content: 'To disable notifications update your browser settings.'
		});
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
		<span bind:this={tooltip}>
			<button on:click={allowNotifications} disabled={notificationsEnabled}>
				<Icon icon={notificationsEnabled ? 'bell' : 'bell-off'} style="text-header" />
			</button>
		</span>

		<button on:click={() => ($homeState = 'SETTINGS')}>
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

<style>
	@import 'tippy.js/dist/tippy.css';
</style>
