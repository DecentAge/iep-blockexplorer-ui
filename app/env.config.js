window.envConfig = {
	BLOCK_EXPLORER_API_URL: "http://node-1",
	
	GENESIS_ACCOUNT: "XIN-NTLK-Z5GA-WNAV-GW378",
	
	TOKEN_QUANTS: 100000000,
	EPOCH: 1484046000,
	BASE_TARGET: 17080318,
	INITIAL_SUPPLY: 9000000000,
	
	AUTO_PAGE_REFRESH_INTERVAL: 60000,
	VERSION: "0.5.1b"
}

window.getEnvConfig = function(key) {
	var envConfig = window['envConfig'];
	if (envConfig[key]) {
		if (typeof envConfig[key] !== 'string' && envConfig[key].length === 0) {
			return null;
		} else if (typeof envConfig[key] === 'string' && envConfig[key] === '') {
			return null;
		} else {
			return envConfig[key];
		}
	}
	return null;
}
