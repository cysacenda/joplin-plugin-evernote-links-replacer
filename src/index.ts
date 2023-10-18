import joplin from 'api';

joplin.plugins.register({
    onStart: async function() {
		console.info('Plugin Evernote Links Converter: Start');

        // Assumons que `noteNameToIdMap` est votre dictionnaire de nom de note à ID.
        const noteNameToIdMap = await buildNoteNameToIdMap();
		console.info(noteNameToIdMap);

        // Cherchez toutes les notes
        const notes = await joplin.data.get(['notes'], { fields: ['id', 'title', 'body'] });

		console.info("All notes were retrieved !");
		console.info(notes);

		let iNotesProcessed = 0;
		let iNotesWithEvernoteLinks = 0;
		let iLinksFound = 0;
		let iLinksReplaced = 0;

        for (const note of notes.items) {
			console.info("************************************************");
			console.info("***** Processing note : " + note.title + " *****");
            
			// Utilisez une expression régulière pour trouver tous les liens Evernote dans le corps de la note
            const evernoteLinks = note.body.match(/\[([^\]]+)\]\(evernote:\/\/\/view\/[^\)]+\)/g);

            if (evernoteLinks) {
				console.info("Evernote Link(s) found !");
				console.info(evernoteLinks);

                let updatedBody = note.body;

                // Parcourez tous les liens Evernote trouvés et remplacez-les par des liens Joplin internes
                for (const link of evernoteLinks) {
                    // Extrait le titre du lien Evernote
                    const linkTitleMatch = link.match(/\[([^\]]+)\]/);
                    if (linkTitleMatch && linkTitleMatch[1]) {
                        const linkTitle = linkTitleMatch[1];
                        const correspondingJoplinId = noteNameToIdMap[linkTitle];

                        // Si un ID correspondant est trouvé, remplacez le lien
                        if (correspondingJoplinId) {
							console.info("Link replaced : " + linkTitle);
                            const joplinLink = `[${linkTitle}](:/${correspondingJoplinId})`;
                            updatedBody = updatedBody.replace(link, joplinLink);
							iLinksReplaced++;
                        }
                    }
					iLinksFound++;
                }

                // Mettez à jour la note avec le nouveau corps si des modifications ont été apportées
                if (updatedBody !== note.body) {
                    await joplin.data.put(['notes', note.id], null, { body: updatedBody });
					console.info("Mise à jour des liens effectuée.");
                }
				console.info("***** Fin traitement note : " + note.title + " *****\n");
				iNotesWithEvernoteLinks++;
            }
			iNotesProcessed++;
        }

		console.info("***** End report : *****");
		console.info("Processed notes : " + iNotesProcessed);
		console.info("Notes with Evernote links : " + iNotesWithEvernoteLinks);
		console.info("Links found : " + iLinksFound);
		console.info("Links replaced : " + iLinksReplaced);

		console.info('Plugin Evernote Links Converter: End');
    },
});

// Cette fonction construit un dictionnaire avec les titres des notes comme clés et les ID des notes comme valeurs
async function buildNoteNameToIdMap() {
    const allNotes = await joplin.data.get(['notes'], { fields: ['id', 'title'], limit: 100 }); // Ajustez la limite selon vos besoins
    const noteNameToIdMap: { [key: string]: string } = {};

    for (const note of allNotes.items) {
        noteNameToIdMap[note.title] = note.id;
    }

    return noteNameToIdMap;
}