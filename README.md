# Joplin Plugin

## Joplin Link Replacement Plugin
### Description
This plugin is designed to streamline the migration from Evernote to Joplin. It automatically scans all notes imported from Evernote and replaces internal Evernote links with the corresponding Joplin links.

### Features
Automatically scans all notes.
Converts Evernote links in the format evernote:///view/... to Joplin links in the format :/NOTE_ID.
It will only work if the title of the evernote link is the same as the note title it links to.
Displays process information through Joplin's user interface.

### How to Use
Install the plugin via Joplin's Plugin Manager.
Once installed and activated (after Joplin restart), the plugin will go through all notes and make the necessary replacements.

### Support
If you encounter any issues with this plugin or have suggestions for improvements, please open an issue on the project's GitHub page.

For information on how to build or publish the plugin, please see [GENERATOR_DOC.md](./GENERATOR_DOC.md)
