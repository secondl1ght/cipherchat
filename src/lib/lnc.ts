import LNC from '@lightninglabs/lnc-web';
import { PUBLIC_WASM_VERSION } from '$env/static/public';

export const lnc = new LNC({
	serverHost: '',
	wasmClientCode: `/wasm-client/${PUBLIC_WASM_VERSION}.wasm`
});
