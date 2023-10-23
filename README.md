# Cipherchat

**Encrypted messaging over the bitcoin lightning network.**

[![Netlify Status](https://api.netlify.com/api/v1/badges/7de7da8a-f171-47c1-8d30-1a4d328bd24a/deploy-status)](https://app.netlify.com/sites/cipherchat/deploys)

## Tech Stack

Cipherchat has minimal dependencies with the main packages being as follows:

- sveltekit
- typescript
- tailwindcss
- lnc-web
- dexie.js

A large part of the app is the LNC WASM binary which comes bundled with the application.

For a full list of dependencies check out the `package.json`.

## PWA

Cipherchat is a Progressive Web App that can be installed on many devices and uses native features.

## Self-Hosting

### Running Locally

If you only want to use Cipherchat on your local machine you can follow these steps:

1. `git clone` the repository
2. `cd` into the new directory
3. run `yarn` to install the packages
4. run `yarn build` to build the application
5. run `yarn preview` and the app will be served on `localhost:4173`

To run in development mode you can skip steps 4 & 5 and instead run `yarn dev`.

### Deploy Globally

If you would like to run a publicly accessible instance of Cipherchat that you can access remotely, I would recommend forking the repository and deploying with either [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/).

Both providers offer a free tier and have close to one-click deployments that are very easy to setup and maintain. They will also give you a domain that you can access without having to purchase one yourself.

Once your instance is deployed you can stay in sync with this master branch and these platforms will auto-deploy new commits.

You can however use any type of server you'd like to deploy Cipherchat ranging from bare-metal to an easily hosted option.

### One-Click Installation

I plan on releasing Cipherchat on these plug-and-play node app stores:

- [ ] myNode
- [ ] Start9 Embassy
- [ ] Umbrel

If there are other app stores you would like to see Cipherchat, please let me know!

## Want to be inter-operable?

Cipherchat uses established standards from the [TLV Record Registry](https://github.com/satoshisstream/satoshis.stream/blob/main/TLV_registry.md). Users of Cipherchat could have conversations with other lightning apps if they follow the convention below for attaching `dest_custom_records`
to [keysend](https://docs.lightning.engineering/lightning-network-tools/lnd/send-messages-with-keysend) payments.

<table class="my-4 block max-w-fit border-separate overflow-x-auto whitespace-nowrap border border-boxFill bg-borderIn">
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
            <td>The output from signing the: (receiver pubkey + timestamp + message) using the private key counterpart of the public key attached.</td>
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
            <td>Can be one of: 'TEXT', 'IMAGE', 'PAYMENT'. (Currently images are not yet implemented).</td>
        </tr>
    </tbody>
</table>

---

                                    7JJJJJJJJJJJ    7JJJJJJJ^:::
                                    ?5YYYYYYYYYY.  .?YYYJJJJ^^^^
                                    ?YYYYYYYYYYY????????^^^^^^^:
                                    ?YYYYYYYYJYJ????????^^^^^^^:
                                    ?555YYYY????????????^^^^^^^^
                                    :~^^?JJJ????????!!!!^^^^....
                                        !J??????????^^^^^^^^
                                        .:::~!!!!!!~^^^^....
                                            :^^^^^^^^^^^









                :^^^^^^^                                                    :^^^^^^^
                5#######.                                                   G######B
                5#BBBBBB.                                                   G#BBBB#G
                5#BBBBBB.                                                   P#BBBB#G
            !J??G#BBBBBBY???                                            7J?JBBBBBBBBJ???
            P####BBBBBBB####.                                           G###BBBBBBBB###B
            5#BBBBBBBBBBBBBB7~~~~~~~Y5555555!~~~~~~~~~~!Y555555Y!~~~~~~!G#BBBBBBBBBBBB#B
            5#BBBBBBBBBBBBBBJ???????B#######J??????????JB######BJ??????JB#BBBBBBBBBBBB#B
            5#BBBBBBBBBBBBBBJ???????B#BBBBBBJ???????????B#BBBBBBJ???????B#BBBBBBBBBBBB#B
           .P#BBBBBBBBBBBBBBYJJJJJJJB#BBBBBBYJJJJJJJJJJJB#BBBBBBYJJJJJJJBBBBBBBBBBBBBB#B.
        YBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBG
        5###BBBBBBBBBBBBBBBBP5555555BBBBBBBBBBBBBBBBBBBBBBBBBBBBP5555555BBBBBBBBBBBBBBBB###B
        Y#BBBBBB#####BBBBBBB.       P#BBBBBBBBBB####BBBBBBBBBB#B.       P#BBBBBB####BBBBBB#G
        Y#BBBBBBYJJJB#BBBBBB.       P#BBBBBBBBBBYJJJBBBBBBBBBB#B.       P#BBBBBBYJJJBBBBBB#G
        Y#BBBBBB.   P####BBB        P#BBBBBB###B.   G####BBBBB#B        P#BB###B    G#BBBB#G
    ^~~~G#BBBBBB7~~~!7!7G#BB7~~~~~~~G#BBBBBB?!7!    ~7!7G#BBBBBB7~~~~~~!G#BB?!!!~~~!B#BBBBBB!~~~
    5####BBBBBBB##&#.   5#BB########BBBBBB#B            P#BBBBBB########BB#G    G&###BBBBBBB###B
    5#BBBBBBBBBB!^^^7???G#BBBBBBBBBBBBBBBBBBJ???????????B#BBBBBBBBBBBBBBBBBBJ??7~^^~G#BBBBBBBB#B
    5#BBBBBBBBBB.   P####BBBBBBBBBBBBBBBBBBB############BBBBBBBBBBBBBBBBBBBB###B    G#BBBBBBBB#B
    5#BBBBBBBBBB5YYYB#BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBYYYYBBBBBBBBBB#B
    5#BBBBBBBBBB####BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB####BBBBBBBBBBBB
    !JJJJJJJG#BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBYJJJJJJ?
    ~???????G#BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBJ??????7
