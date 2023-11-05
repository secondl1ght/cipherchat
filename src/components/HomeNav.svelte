<script lang="ts">
	import { homeState, innerWidth, userAlias, userAvatar, userColor, userPubkey } from '$lib/store';
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
			Notification.requestPermission()
				.then((permission) => {
					if (permission === 'granted') {
						notificationsEnabled = true;
						successToast('Notifications enabled.');
					} else {
						errorToast('Permission denied.');
					}
				})
				.catch((error) => {
					console.log(error);
					errorToast('Could not enable notifications.');
				});
		}
	};

	let notificationButton: HTMLSpanElement;
	let settingButton: HTMLButtonElement;
	let logoutButton: HTMLButtonElement;

	$: notificationButton &&
		tippy([notificationButton], {
			content: notificationsEnabled
				? 'To disable notifications update your browser settings.'
				: 'Notifications'
		});

	$: settingButton &&
		tippy([settingButton], {
			content: 'Settings'
		});

	$: logoutButton &&
		tippy([logoutButton], {
			content: 'Logout'
		});
</script>

<nav
	class="sticky left-0 top-0 z-10 flex w-full items-center justify-between border-b border-body bg-boxFill p-4"
>
	<button on:click={toggleHome}>
		{#if $homeState === 'HOME'}
			<Avatar pubkey={$userPubkey} alias={$userAlias} color={$userColor} avatar={$userAvatar} />
		{:else}
			<Icon
				icon="arrow-left-circle"
				style="text-header"
				width={$innerWidth > 1024 ? '48' : '40'}
				height={$innerWidth > 1024 ? '48' : '40'}
			/>
		{/if}
	</button>

	<div class="space-x-4">
		<span bind:this={notificationButton}>
			<button on:click={allowNotifications} disabled={notificationsEnabled}>
				<Icon icon={notificationsEnabled ? 'bell' : 'bell-off'} style="text-header" />
			</button>
		</span>

		<button bind:this={settingButton} on:click={() => ($homeState = 'SETTINGS')}>
			<Icon
				icon="settings"
				style="hover:rotate-180 transition-transform text-header duration-500"
			/>
		</button>

		<button bind:this={logoutButton} on:click={() => location.reload()}>
			<Icon icon="lock" style="text-header" />
		</button>
	</div>
</nav>

<style>
	@import 'tippy.js/dist/tippy.css';
</style>
