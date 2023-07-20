<script lang="ts">
	export let question: string;
</script>

<li>
	<h4 class="mb-2 text-header">{question}</h4>
	<p><slot /></p>
</li>
