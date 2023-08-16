import { error } from '$lib/store';
import { toast } from '@zerodevx/svelte-toast';

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

export const copy = (text: string) => {
	navigator.clipboard.writeText(text);
};

export const getUpdateTime = () => (Date.now() / 1000).toFixed(0).toString();

export const setLastUpdate = (time: string) => {
	localStorage.setItem('lastUpdate', time);
};

export const setFirstSyncComplete = () => {
	localStorage.setItem('firstSyncComplete', 'true');
};

export const setError = (status: string, message: string) => error.set({ status, message });
