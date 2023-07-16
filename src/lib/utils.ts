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
