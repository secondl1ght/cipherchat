import { toast } from '@zerodevx/svelte-toast';

export const errorToast = (m: string) => {
	toast.pop();

	toast.push(m, {
		theme: {
			'--toastColor': '#D9E7FA',
			'--toastBackground': '#23273C',
			'--toastBarBackground': '#B00020'
		},
		duration: 10000
	});
};
