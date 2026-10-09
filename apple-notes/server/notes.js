/* Only this fixed bridge sends Apple events. User values arrive as JSON data. */
ObjC.import('Foundation');

function run(argv) {
    try {
        var raw = $.NSString.stringWithContentsOfFileEncodingError(argv[0], $.NSUTF8StringEncoding, null);
        var request = JSON.parse(ObjC.unwrap(raw));
        var p = request.arguments || {};
        var notes = Application('com.apple.Notes');
        function fail(message) { throw new Error(message); }
        function iso(date) { return date.toISOString(); }
        function escapeHtml(text) {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }
        function html(text) {
            return text.split(/\r\n|\r|\n/).map(function (line) {
                return '<div>' + (escapeHtml(line) || '<br>') + '</div>';
            }).join('');
        }
        function folderInfo(folder) {
            return {id: folder.id(), name: folder.name()};
        }
        function metadata(note) {
            return {id: note.id(), title: note.name(), folder: folderInfo(note.container()),
                created_at: iso(note.creationDate()), modified_at: iso(note.modificationDate()),
                locked: note.passwordProtected(), shared: note.shared()};
        }
        function resolveNote(id) {
            var note = notes.notes.byId(id);
            if (!note.exists()) fail('Note not found. List notes again to obtain its exact ID.');
            return note;
        }
        function resolveFolder(id) {
            if (!id) return notes.defaultAccount().defaultFolder();
            // Traverse accounts so nested folders work on all Notes versions.
            var found = null;
            var visited = {};
            function visit(folder) {
                var fid = folder.id();
                if (visited[fid]) return;
                visited[fid] = true;
                if (fid === id) { found = folder; return; }
                folder.folders().forEach(visit);
            }
            notes.accounts().forEach(function (account) { account.folders().forEach(visit); });
            if (!found) fail('Folder not found. Use list_folders to obtain an exact folder ID.');
            return found;
        }
        var result;
        if (request.name === 'list_folders') {
            var folders = [], seen = {};
            function walk(folder, account, path) {
                var id = folder.id();
                if (seen[id]) return;
                seen[id] = true;
                var names = path.concat([folder.name()]);
                folders.push({id: id, name: folder.name(), path: names.join('/'),
                    account: {id: account.id(), name: account.name()}, shared: folder.shared()});
                folder.folders().forEach(function (child) { walk(child, account, names); });
            }
            notes.accounts().forEach(function (account) {
                account.folders().forEach(function (folder) { walk(folder, account, []); });
            });
            result = {folders: folders};
        } else if (request.name === 'list_notes') {
            var collection = p.folder_id ? resolveFolder(p.folder_id).notes : notes.notes;
            var source = collection();
            var matches = [], query = (p.query || '').toLowerCase();
            var titles = query ? collection.name() : [];
            // Search titles only; listing never reads note bodies.
            for (var i = 0; i < source.length; i++) {
                if (!query || titles[i].toLowerCase().indexOf(query) !== -1) matches.push(source[i]);
            }
            var offset = p.offset || 0, limit = p.limit || 25;
            result = {notes: matches.slice(offset, offset + limit).map(metadata),
                total: matches.length, next_offset: offset + limit < matches.length ? offset + limit : null};
        } else if (request.name === 'get_note_content') {
            var note = resolveNote(p.note_id);
            if (note.passwordProtected()) fail('This note is password protected. Locked notes are not read by this plugin.');
            result = metadata(note);
            result.content = note.plaintext();
            result.html = note.body();
            result.attachment_count = note.attachments.length;
        } else if (request.name === 'add_note') {
            var target = resolveFolder(p.folder_id);
            var newNote = notes.Note({body: '<div><b>' + escapeHtml(p.title) + '</b></div>' + html(p.content || '')});
            target.notes.push(newNote);
            result = metadata(newNote);
            result.status = 'created';
        } else if (request.name === 'update_note_content') {
            var note = resolveNote(p.note_id);
            if (note.passwordProtected()) fail('Password-protected notes cannot be updated by this plugin.');
            if (note.attachments.length > 0) fail('Update refused: this note contains attachments. Editing its HTML body could lose them. Use the Notes app for this edit.');
            var before = iso(note.modificationDate());
            if (p.expected_modified_at && p.expected_modified_at !== before)
                fail('Conflict: the note changed after it was read. Read it again before updating.');
            var mode = p.mode || 'append';
            if (mode === 'replace') {
                if (!p.expected_modified_at) fail('Replacement requires expected_modified_at from get_note_content.');
                note.body = '<div><b>' + escapeHtml(note.name()) + '</b></div>' + html(p.content);
            } else {
                note.body = note.body() + html(p.content);
            }
            result = metadata(note);
            result.status = 'updated';
            result.mode = mode;
        } else fail('Unknown tool.');
        return JSON.stringify({ok: true, result: result});
    } catch (error) {
        return JSON.stringify({ok: false, error: String(error.message || error)});
    }
}
