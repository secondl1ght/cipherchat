<script lang="ts">
	import { Button, Link, PublicLayout } from 'comp';

	const year = new Date().getFullYear();
</script>

<svelte:head>
	<title>Cipherchat - License</title>
	<meta property="twitter:title" content="Cipherchat - License" />
</svelte:head>

<PublicLayout heroText="LICENSE">
	<div class="space-y-8">
		<h1 class="press-start text-center leading-8 text-header md:text-xl md:leading-10">
			Cipherchat - Encrypted messaging over the bitcoin lightning network.
		</h1>

		<h2 class="text-center font-bold text-header md:text-xl">
			Copyright &#169; {year} secondl1ght
		</h2>

		<h3 class="text-center md:text-xl">
			<Link
				href="mailto:secondl1ght@protonmail.com"
				title="secondl1ght@protonmail.com"
				style="break-all"
			/>
		</h3>

		<h4>
			<span class="inline-block w-full text-center">GNU Affero General Public License v3.0</span>

			<br /><br />
			This program is free software: you can redistribute it and/or modify it under the terms of the
			GNU Affero General Public License as published by the Free Software Foundation, either version
			3 of the License, or (at your option) any later version.
			<br /><br />
			This program is distributed in the hope that it will be useful, but
			<strong>WITHOUT ANY WARRANTY</strong>; without even the implied warranty of
			<strong>MERCHANTABILITY</strong> or <strong>FITNESS FOR A PARTICULAR PURPOSE</strong>. See the
			GNU Affero General Public License for more details.
		</h4>

		<div class="flex justify-center">
			<a
				href="https://www.gnu.org/licenses/agpl-3.0-standalone.html"
				target="_blank"
				rel="noreferrer"
				class="w-full md:w-auto"
			>
				<Button
					click={() => {
						return;
					}}
					title="View License"
				/>
			</a>
		</div>
	</div>
</PublicLayout>
