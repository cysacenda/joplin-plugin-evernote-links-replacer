import joplin from 'api';

joplin.plugins.register({
    onStart: async function() {
		console.info('Plugin Evernote Links Converter: Start');
		await joplin.views.dialogs.showMessageBox('Plugin Evernote Links Converter: Start');

        // Assumons que `noteNameToIdMap` est votre dictionnaire de nom de note à ID.
        const noteNameToIdMap = await buildNoteNameToIdMap();
		console.info(noteNameToIdMap);

        // Cherchez toutes les notes
        const notes = await getAllNotes();

		console.info("All notes were retrieved !");
		console.info(notes);

		let iNotesProcessed = 0;
		let iNotesWithEvernoteLinks = 0;
		let iLinksFound = 0;
		let iLinksReplaced = 0;

        for (const note of notes) {
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

		await joplin.views.dialogs.showMessageBox("Processed notes : " + iNotesProcessed + "\nNotes with Evernote links : " 
			+ iNotesWithEvernoteLinks + "\nLinks found : " + iLinksFound + "\nLinks replaced : " + iLinksReplaced);

		console.info('Plugin Evernote Links Converter: End');
    },
});

// Cette fonction construit un dictionnaire avec les titres des notes comme clés et les ID des notes comme valeurs
async function buildNoteNameToIdMap() {
    //const allNotes = await joplin.data.get(['notes'], { fields: ['id', 'title'], limit: 100000 }); // Ajustez la limite selon vos besoins
    const allNotes = await getAllNotes();
	const noteNameToIdMap: { [key: string]: string } = {};

    for (const note of allNotes) {
        noteNameToIdMap[note.title] = note.id;
    }

    return noteNameToIdMap;
}

async function getAllNotes(): Promise<any[]> {
    const pageSize = 100; // Combien de notes à récupérer à la fois.
    let allNotes = [];
    let hasMore = true;
    let page = 1; 

    while (hasMore) {
        const notes = await joplin.data.get(['notes'], { fields: ['id', 'title', 'body'], limit: pageSize, page: page });
        allNotes = allNotes.concat(notes.items);

        hasMore = notes.has_more;
        page += 1;
    }
	console.info('Pages : ' + page);

    return allNotes;
}