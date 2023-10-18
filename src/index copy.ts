import joplin from 'api';

joplin.plugins.register({
	onStart: async function() {
		// eslint-disable-next-line no-console
		console.info('CSA!');
	},
});
