import { error } from '$lib/store';
import { toast } from '@zerodevx/svelte-toast';

// TOASTS
export const successToast = (m: string) => {
	toast.pop();

	toast.push(m, {
		theme: {
			'--toastColor': '#D9E7FA',
			'--toastBackground': '#23273C',
			'--toastBarBackground': '#1B5E20'
		}
	});
};

export const warningToast = (m: string) => {
	toast.pop();

	toast.push(m, {
		theme: {
			'--toastColor': '#D9E7FA',
			'--toastBackground': '#23273C',
			'--toastBarBackground': '#F57F17'
		}
	});
};

export const errorToast = (m: string) => {
	toast.pop();

	toast.push(m, {
		theme: {
			'--toastColor': '#D9E7FA',
			'--toastBackground': '#23273C',
			'--toastBarBackground': '#B71C1C'
		}
	});
};

// COPY
export const copy = (text: string) => {
	navigator.clipboard.writeText(text);
};

// SYNC
export const getUpdateTime = () => (Date.now() / 1000).toFixed(0).toString();

export const setLastUpdate = (time: string) => {
	localStorage.setItem('lastUpdate', time);
};

export const setFirstSyncComplete = () => {
	localStorage.setItem('firstSyncComplete', 'true');
};

// ERROR
export const setError = (status: string, message: string) => error.set({ status, message });

// FORMATTING
export const shortenPubkey = (pubkey: string) =>
	pubkey.slice(0, 6) + '...' + pubkey.slice(pubkey.length - 6, pubkey.length);

export const shortenAlias = (alias: string | undefined) => {
	if (!alias || alias.length <= 20) return alias;

	return alias.slice(0, 20) + '...';
};

export const shortenLatestMessage = (message: string, limit: number) => {
	if (message.length <= limit) return message;

	return message.slice(0, limit) + '...';
};

export const formatNumber = (number: number) => new Intl.NumberFormat().format(number);

// TIME
export const getTimestamp = () => Date.now() * 1000000;

export const formatTimestamp = (timestamp: number) => {
	const milliseconds = timestamp / 1000000;
	const date = new Date(milliseconds);

	return {
		date: new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(date),
		time: new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date)
	};
};

// COLOR
export function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
