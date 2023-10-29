<script lang="ts">
	import { links } from '$lib/store';
	import { FaqItem, Link, PublicLayout } from 'comp';
</script>

<svelte:head>
	<title>Cipherchat - FAQ</title>
	<meta property="twitter:title" content="Cipherchat - FAQ" />
</svelte:head>

<PublicLayout heroText="FAQ">
	<div class="space-y-8">
		<h1 class="press-start text-center leading-8 text-header md:text-xl md:leading-10">
			Learn about Cipherchat. 👨‍💻👩‍💻
		</h1>

		<h2 class="text-center font-bold text-header md:text-xl">
			Get started using private and secure messaging on the worlds most powerful decentralized
			network.
		</h2>

		<ul class="space-y-4">
			<FaqItem question="What is Cipherchat?">
				Cipherchat is a private messaging web application powered by bitcoin's lightning network and
				can be self-hosted.
			</FaqItem>
			<FaqItem question="How does it work?">
				Users connect their lightning node to Cipherchat by using <Link
					external
					href="https://lightning.engineering/posts/2021-11-30-lightning-node-connect-deep-dive/"
					title="Lightning Node Connect"
				/> (LNC) and entering a pairing phrase obtained through <Link
					external
					href="https://docs.lightning.engineering/lightning-network-tools/lightning-terminal"
					title="Lightning Terminal"
				/>. This creates an end-to-end encrypted connection between your node running anywhere in
				the world and the web app. It works by having a <Link
					external
					href="https://docs.lightning.engineering/lightning-network-tools/aperture/mailbox"
					title="LNC Mailbox"
				/> relay proxy server facilitate the communication. The entire tech stack is
				<strong>open-source</strong>. Once connected, users use keysend payments attached with
				messages to communicate with eachother.
			</FaqItem>
			<FaqItem question="Is it private?">
				Yes. All messages that are sent and received can only be read by the sender and the
				recipient and cannot be intercepted by anyone along the route. Please read the <Link
					href="/privacy"
					title="Privacy"
				/>
				page for more detailed information.
			</FaqItem>
			<FaqItem question="Is it secure?">
				The protocols used are secure. When establishing your initial connection you will be asked
				to create a password. This will be used to secure the data stored locally on your device
				with encryption. Use a strong password for this purpose.
			</FaqItem>
			<FaqItem question="How do I get a lightning node?">
				The easiest way to get started running your own lightning node is to use one of the many
				great plug-and-play solutions. For example: <Link
					external
					href="https://mynodebtc.com/"
					title="myNode"
				/>, <Link external href="https://start9.com/" title="Start9 Embassy" />, or <Link
					external
					href="https://umbrel.com/"
					title="Umbrel"
				/>. These come with app stores that you can install the other required software - Lightning
				Terminal. There are also options to host a node in the <em>'Cloud'</em> like <Link
					external
					href="https://voltage.cloud/"
					title="Voltage"
				/> if you would prefer not to deal with hardware.
			</FaqItem>
			<FaqItem question="How do I connect my node to the app?">
				These steps may be different if you are running your node on a hosting provider such as
				<Link
					external
					href="https://docs.voltage.cloud/guides/lightning-node-connect-and-terminal-web"
					title="Voltage"
				/>.

				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					controls
					controlslist="nodownload noplaybackrate"
					disablepictureinpicture
					src="/videos/lnc-tutorial.webm"
					class="my-4"
				/>
				<ol class="mb-4 list-inside list-decimal space-y-8">
					<li>
						Open the <strong>Lightning Terminal</strong> app that is connected to your lightning
						node. Navigate to the
						<strong>Lightning Node Connect</strong> tab in the menu.
					</li>
					<li>
						Next you <strong>create a new session</strong>. You must use the <strong>Admin</strong>
						permissions so that Cipherchat is able to <strong>Send</strong> and
						<strong>Receive</strong>
						payments, <strong>Sign</strong> and <strong>Verify</strong> messages, and
						<strong>Read</strong> data from your node and the network.
					</li>
					<li>
						If you would like to use your own LNC Mailbox instead of the default Lightning Labs
						option you will need to select <strong>Custom</strong> permissions from the dropdown
						menu. Then choose <strong>Admin</strong> and click <strong>Advanced Options</strong> to
						enter the domain and port. For example:
						<strong class="bg-borderIn">cipherchatmailbox.net:443</strong>.
					</li>
					<li>
						You can also set an <strong>expiry</strong> for this pairing phrase if you would like in
						the <strong>Custom</strong> permissions view.
					</li>
					<li>
						Your pairing phrase will be generated and <strong>copied to the clipboard</strong>. You
						can now paste this information into Cipherchat. You do <strong>not</strong> need to store
						this phrase anywhere.
					</li>
				</ol>
				<p>
					* <strong>IMPORTANT</strong>: This pairing phrase is sensitive information that could give
					others access to your node. It will expire if not used within 10 minutes. You can revoke
					these sessions at any time. Only one concurrent connection can be established for each
					pairing phrase. Treat this with the same care as other private node information such as a
					macaroon or seed phrase. Always make sure you are at the correct URL of the Cipherchat app
					which is <strong class="bg-borderIn">https://cipherchat.app</strong> and nothing else. Install
					the app or bookmark the page to be sure.
				</p>
			</FaqItem>
			<FaqItem question="How can I install the web app?">
				On your mobile phone or any other device simply click <strong>Install</strong> if you are
				prompted by your browser. You can also go into your browser menu and click
				<strong>Install</strong>. This will add Cipherchat to your home screen and give you access
				to features like badge notifications just like a native app.
			</FaqItem>
			<FaqItem question="How can I update the web app?">
				Cipherchat can be updated by simply refreshing the page which will download and install any
				new releases. After refreshing you will need to close any running instances of the app and
				relaunch in order for the installation to complete. You can view all historical versions
				<Link external href="https://github.com/secondl1ght/cipherchat/releases" title="here" /> to review
				changelogs and any release notes. The latest version can be found <Link
					external
					href="https://github.com/secondl1ght/cipherchat/releases/latest"
					title="here"
				/> which you can compare to your current app version (found in the footer), to ensure that you
				are running the latest software. You can also check for updates in the
				<strong>Settings</strong> view.
			</FaqItem>
			<FaqItem question="What are the browser requirements?">
				Cipherchat requires the following browser features to be enabled in order to run the app.
				These features are standard across all major browsers. However, it is possible that they can
				be disabled in the browser settings. If you receive warnings about missing these features
				they will have to be adjusted to continue.
				<ul class="mt-4 list-inside list-disc space-y-2">
					<li>Service Workers</li>
					<li>Web Assembly</li>
					<li>Local Storage</li>
					<li>IndexedDB</li>
				</ul>
			</FaqItem>
			<FaqItem question="How do I start a conversation?">
				The only information needed to start a conversation is another node's pubkey.
			</FaqItem>
			<FaqItem question="How can I discover public nodes to chat with?">
				You can use a lightning network explorer like <Link
					external
					href="https://amboss.space"
					title="amboss.space"
				/> or <Link external href="https://mempool.space" title="mempool.space" /> to discover node identities.
			</FaqItem>
			<FaqItem question="Is there spam protection?">
				Cipherchat has built-in spam protection due to the 'proof-of-work' required to setup a
				lightning node and the cost of messages. It is also impossible to impersonate a nodes
				identity because each message is signed using the private / public key pair of the sender
				and verified by the receiver. If all of this is not enough, you have the ability to hide or
				'block' unwanted conversations within the app.
			</FaqItem>
			<FaqItem question="What's the best way to use my node with Cipherchat?">
				For best performance, reliability, and to save on network fees it is recommended to open a
				channel directly with the peer you are chatting with. Each message will cost <strong
					>1 sat</strong
				>
				(or 1 msat in the future), so you can think of this as your 'message quota'. If you and a peer
				are messaging back and forth it won't actually cost you anything because the sats will be flowing
				in each direction. The only fees you would pay are the on-chain fees to open and close the channel.
				<br /><br />
				You can make an informed decision based on the type of conversation you plan on having whether
				it makes sense to open a channel. For example, if you only plan on sending one or a few messages
				then it wouldn't be necessary. You would be better off paying a few sats or zero sats (many nodes
				will route 1 sat payments for free) in routing fees. Alternatively, if you want to have a long
				conversation with a family member, friend, co-worker, or anyone then it would make sense to open
				a direct channel. This will guarantee your message speed and success. A single communication
				channel between two peers could remain open for years with no maintenance or rebalancing needed.
				And if the peer is trusted, you can push half the balance to the remote side to avoid needing
				a channel on each side or having to perform a loop to balance liquidiity.
				<br /><br />
				Finally, it may make sense if you are opening a communication channel to either make it private
				or set a high routing fee to avoid having it be used by other nodes on the network and affecting
				your liquidity.
			</FaqItem>
			<FaqItem question="Why do messages fail?">
				Just like any lightning transaction a route must be found from your node to the destination
				in order for the payment (message) to be successful. This requires being well connected to
				the network.
			</FaqItem>
			<FaqItem question="Why is there a character limit?">
				A default character limit of <strong>300</strong> is set for all conversations. This is to give
				your message the best chance of succeeding. The lightning network has technical constraints on
				the size of message that can be transmitted. As the payment route gets longer (number of hops
				to reach the destination), the contained message must be smaller. The character limit can be
				adjusted per conversation such that if you are connected directly with your chatting peer it
				can be raised.
			</FaqItem>
			<FaqItem question="Can my node receive keysend messages?">
				Most node configs will already have this setup but if you can't receive messages and you
				have inbound liquidity then you can check your <strong class="bg-borderIn">lnd.conf</strong>
				file and make sure it contains <strong class="bg-borderIn">accept-keysend=true</strong>. You
				will need to restart your node if enabling this for the first time.
			</FaqItem>
			<FaqItem question="How can I self-host Cipherchat?">
				Check out the <Link
					external
					href="https://github.com/secondl1ght/cipherchat#self-hosting"
					title="README"
				/> on the Cipherchat GitHub repository for instructions.
			</FaqItem>
			<FaqItem question="Can I install Cipherchat easily on myNode, Embassy, Umbrel etc.?">
				I plan to release Cipherchat for these plug-and-play app stores.
			</FaqItem>
			<FaqItem question="How can I run my own LNC Mailbox?">
				Instructions on running your own relay proxy server can be found in the <Link
					external
					href="https://docs.lightning.engineering/lightning-network-tools/aperture/get-aperture"
					title="Builder's Guide"
				/>. If you are looking for a hosted solution you can check out <Link
					external
					href="https://render.com/"
					title="Render"
				/>. There are many good options available that make the process of deploying a server fairly
				straight-forward.
			</FaqItem>
			<FaqItem question="Can I use Cipherchat with Core Lightning?">
				Currently no. LNC is only implemented by LND at the moment.
			</FaqItem>
			<FaqItem question="Is Cipherchat inter-operable with other lightning messaging apps?">
				Yes, if they follow the same specification. Cipherchat uses established standards from the <Link
					external
					href="https://github.com/satoshisstream/satoshis.stream/blob/main/TLV_registry.md"
					title="TLV Record Registry"
				/>. Users of Cipherchat could have conversations with other lightning apps if they follow
				the convention below for attaching <strong class="bg-borderIn">dest_custom_records</strong>
				to <Link
					external
					href="https://docs.lightning.engineering/lightning-network-tools/lnd/send-messages-with-keysend"
					title="keysend"
				/> payments.

				<table
					class="my-4 block max-w-fit border-separate overflow-x-auto whitespace-nowrap border border-boxFill bg-borderIn"
				>
					<thead>
						<tr>
							<th colspan="4">Cipherchat Keysend Custom Record Scheme</th>
						</tr>
						<tr>
							<th>Key</th>
							<th>Value</th>
							<th>Length (bytes)</th>
							<th>Additional Info</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>5482373484</td>
							<td>Keysend Preimage</td>
							<td>32</td>
							<td>Preimage for the invoice.</td>
						</tr>
						<tr>
							<td>34349334</td>
							<td>Message Content</td>
							<td>Variable</td>
							<td>The chat text, image, or a random UUID if 'PAYMENT' type.</td>
						</tr>
						<tr>
							<td>34349343</td>
							<td>Timestamp</td>
							<td>8</td>
							<td>When the message was created measured in nanoseconds since the unix epoch.</td>
						</tr>
						<tr>
							<td>34349337</td>
							<td>Signature</td>
							<td>~71</td>
							<td
								>The output from signing the: (receiver pubkey + timestamp + message) using the
								private key counterpart of the public key attached.</td
							>
						</tr>
						<tr>
							<td>34349339</td>
							<td>Sender's Pubkey</td>
							<td>33</td>
							<td>This identifies the node associated with the message.</td>
						</tr>
						<tr>
							<td>34349345</td>
							<td>Content Type</td>
							<td>Variable</td>
							<td
								>Can be one of: 'TEXT', 'IMAGE', 'PAYMENT'. (Currently images are not yet
								implemented).</td
							>
						</tr>
					</tbody>
				</table>
			</FaqItem>
			<FaqItem question="Who operates the public instance?">
				The <strong class="bg-borderIn">cipherchat.app</strong> web app is run by <Link
					external
					href="https://secondl1ght.site"
					title="secondl1ght"
				/>.
			</FaqItem>
			<FaqItem question="Who develops Cipherchat?">
				Cipherchat is developed by <strong>secondlght</strong> in his spare time.
			</FaqItem>
			<FaqItem question="Where can I follow updates?">
				Updates about the software and project will come from the <Link
					external
					href={$links.twitter}
					title="Twitter"
				/> and <Link external href={$links.nostr} title="Nostr" /> accounts. You can subscribe to receive
				notifications on the <Link external href={$links.github} title="GitHub" /> repo about activity
				such as new releases.
			</FaqItem>
			<FaqItem question="Where can I learn more?">
				I wrote a blog post for the launch of Cipherchat that you can read <Link
					external
					href="https://secondl1ght.site/blog/cipherchat"
					title="here"
				/>. I will also release some tutorial videos in the future on <Link
					external
					href={$links.rumble}
					title="Rumble"
				/>.
			</FaqItem>
			<FaqItem question="I'm stuck, can I get support?">
				If you are having issues getting started using Cipherchat or just want to find other users
				to connect with you can join our public <Link
					external
					href={$links.matrix}
					title="Matrix"
				/>
				room.
			</FaqItem>
		</ul>

		<p class="text-header">Thanks for taking the time to learn about Cipherchat!</p>
	</div>
</PublicLayout>

<style>
	th,
	td {
		@apply border border-boxFill p-1;
	}
</style>
