<script lang="ts">
	import { Icon, Link, PublicLayout } from 'comp';
</script>

<svelte:head>
	<title>Cipherchat - Privacy</title>
	<meta property="twitter:title" content="Cipherchat - Privacy" />
</svelte:head>

<PublicLayout heroText="PRIVACY">
	<div class="space-y-8">
		<h1 class="press-start text-center leading-8 text-header md:text-xl md:leading-10">
			Privacy is necessary for an open society in the electronic age.
		</h1>

		<h2 class="text-center font-bold text-header md:text-xl">
			Cipherchat does NOT collect any personal information.
		</h2>

		<h3 class="text-center text-header md:text-xl">
			Information about privacy best practices when using Cipherchat:
		</h3>

		<div>
			<p>
				All messages that are sent and received are fully end-to-end encrypted at every step in the
				communication process. For more detailed information about how this works under the hood
				please check out the <Link
					external
					href="https://docs.lightning.engineering/lightning-network-tools/lightning-terminal/lightning-node-connect"
					title="LNC documentation"
				/>.
			</p>

			<div class="my-8 flex flex-wrap justify-around gap-8">
				<div>
					<p class="mb-2 flex items-center text-header">
						Information Not Visible <Icon icon="lock" style="ml-3" />
					</p>
					<ul class="list-inside list-disc">
						<li>Messages</li>
						<li>Pubkey</li>
						<li>Payments</li>
						<li>Balances</li>
						<li>Forwards</li>
						<li>Private node details</li>
					</ul>
				</div>

				<div>
					<p class="mb-2 flex items-center text-header">
						Information Visible <Icon icon="unlock" style="ml-3" />
					</p>
					<ul class="list-inside list-disc">
						<li>Your IP address</li>
						<li>Size of data packets</li>
					</ul>
				</div>
			</div>

			<p>
				You should take steps to protect your IP address any time that you are using the Internet.
				This can be achieved by using a <Link external href="https://mullvad.net/" title="VPN" />, <Link
					external
					href="https://www.torproject.org/"
					title="Tor"
				/>, <Link external href="https://geti2p.net/" title="I2P" />, or other private network
				technologies.
			</p>

			<p class="my-4">
				There are two third parties involved when using a public instance of Cipherchat. The server
				running the application and the Lightning Node Connect (LNC) - Mailbox relay proxy server. <Link
					external
					href="https://lightning.engineering/"
					title="Lightning Labs"
				/> runs the most popular Mailbox, but Cipherchat has also setup it's own. All third parties can
				be eliminated by self-hosting the software. This is possible because the entire tech stack is
				<strong>free and open-souce</strong>. To run a fully sovereign instance of Cipherchat you
				will need to setup the following:
			</p>

			<ol class="list-inside list-decimal space-y-8">
				<li>
					A lightning node compatible with <Link
						external
						href="https://github.com/lightninglabs/lightning-node-connect"
						title="LNC"
					/> (currently this is only <Link
						external
						href="https://github.com/lightningnetwork/lnd"
						title="LND"
					/>)
				</li>
				<li>
					<Link
						external
						href="https://github.com/lightninglabs/lightning-terminal"
						title="Lightning Terminal"
					/> (other applications will be developed in the future)
				</li>
				<li>
					<Link
						external
						href="https://github.com/secondl1ght/cipherchat#self-hosting"
						title="Cipherchat"
					/> front-end application (see README for instructions)
				</li>
				<li>
					<Link
						external
						href="https://docs.lightning.engineering/lightning-network-tools/aperture/mailbox"
						title="LNC Mailbox"
					/> relay proxy server (comes bundled with <Link
						external
						href="https://github.com/lightninglabs/aperture"
						title="Aperture"
					/>)
				</li>
			</ol>

			<p class="my-4">* See the <Link href="/faq" title="FAQ" /> for more information.</p>

			<p class="my-4">
				If you have any questions or need help setting up any of the above please reach out.
			</p>

			<p class="my-4">
				In summary, the default privacy when using a public instance of Cipherchat is pretty good.
				However, the best option for full control will always be running the stack yourself. This
				also has the added benefit of improving decentralization.
			</p>

			<p class="text-header">Cipherchat cares about privacy and everyone should too!</p>
		</div>
	</div>
</PublicLayout>
