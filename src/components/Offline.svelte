<script lang="ts">
	import { lnc, offline } from '$lib/store';
	import { LoadingBars, Wrapper } from 'comp';

	const attemptReconnect = async () => {
		try {
			await $lnc.lnd.lightning.getInfo();
			$offline = false;
		} catch (error) {
			console.log(error);
			setTimeout(attemptReconnect, 10000);
		}
	};

	setTimeout(attemptReconnect, 10000);
</script>

<Wrapper>
	<div class="center-fixed w-full space-y-4 p-4">
		<LoadingBars />
		<h1 class="press-start text-center text-header">Reconnecting...</h1>
		<p class="text-center text-xs font-semibold text-body">
			(The connection to your lightning node was interrupted.)
		</p>
	</div>
</Wrapper>
