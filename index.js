require('dotenv').config();

const {Rcon} = require('rcon-client');

const {
	RCON_HOST,
	RCON_PASS,
	RCON_PORT,
} = process.env;

const COLORS = {
	GOLD: '§6',
	RED: '§c',
	YELLOW: '§e',
	WHITE: '§f',
};

const MINUTES = Number(process.argv[2]);

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function display(minutes) {
	if (minutes > 2) {
		if (minutes <= 20) {
			return COLORS.YELLOW + minutes + ' minutes' + COLORS.WHITE;
		}
		return minutes + ' minutes';
	}
	return COLORS.RED + (minutes * 60) + ' seconds' + COLORS.WHITE;
}

function getNext(minutes) {
	if (minutes > 20) {
		// next step of 10 minutes
		return minutes - ((minutes % 10) || 10);
	}
	if (minutes > 5) {
		// next step of 5 minutes
		return minutes - ((minutes % 5) || 5);
	}
	if (minutes > 2) {
		// start seconds countdown at 2 minutes
		return 2;
	}
	// next step of 0.5 minutes (i.e. 30 seconds)
	return minutes - 0.5;
}

async function main() {
	const rcon = new Rcon({
		host: RCON_HOST,
		port: RCON_PORT,
		password: RCON_PASS,
	});

	let minutes = MINUTES;

	try {
		await rcon.connect();

		while (minutes > 0) {
			await rcon.send(`say NOTICE: Server will restart in ${display(minutes)}.`);
			const next = getNext(minutes);
			await sleep((minutes - next) * 60 * 1000);
			minutes = next;
		}

		await rcon.send(`say NOTICE: ${COLORS.GOLD}Server is restarting...`);
		await sleep(5000);
		await rcon.send(`stop`);
	} catch (err) {
		console.log('Cannot connect to Minecraft server.');
		console.error(err);
	}
	if (rcon) {
		rcon.end();
	}

	process.exit(0);
}

main();
