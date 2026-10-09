import importlib.util
import json
from pathlib import Path
import subprocess
import uuid

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('notes_server', root/'apple-notes/server/server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


def protocol_test():
    messages = [
        {'jsonrpc':'2.0','id':1,'method':'initialize','params':{'protocolVersion':'2025-06-18'}},
        {'jsonrpc':'2.0','method':'notifications/initialized'},
        {'jsonrpc':'2.0','id':2,'method':'tools/list'},
        {'jsonrpc':'2.0','id':3,'method':'tools/call','params':{'name':'list_notes','arguments':{'limit':True}}},
        {'jsonrpc':'2.0','id':4,'method':'tools/call','params':{'name':'update_note_content','arguments':{'note_id':'test','content':'text','mode':'replace'}}},
        {'jsonrpc':'2.0','id':5,'method':'ping'},
    ]
    p = subprocess.run(['python3',str(root/'apple-notes/server/server.py')],input='\n'.join(map(json.dumps,messages))+'\n',capture_output=True,text=True,check=True)
    results = [json.loads(line) for line in p.stdout.splitlines()]
    assert len(results)==5
    assert results[0]['result']['protocolVersion']=='2025-06-18'
    assert len(results[1]['result']['tools'])==5
    assert results[2]['result']['isError'] and results[3]['result']['isError']
    assert results[4]['result']=={}
    assert server.handle([])['error']['code']==-32600
    print('PASS: MCP startup, discovery, notifications, input validation, replace guard, ping')


def live_test():
    folders = server.call_notes('list_folders', {})
    print('PASS: Notes automation and folder discovery ('+str(len(folders['folders']))+' folders)')
    page = server.call_notes('list_notes', {'limit':1})
    assert len(page['notes'])<=1
    print('PASS: paginated note metadata listing')
    title='Apple Notes Plugin Test '+str(uuid.uuid4())
    content='Temporary integration test.\nQuotes: " \' < > &\nUnicode: café 🎵\n$(not-a-command)\n<script>alert("literal")</script>'
    note_id=None
    try:
        created=server.call_notes('add_note',{'title':title,'content':content})
        note_id=created['id']
        read=server.call_notes('get_note_content',{'note_id':note_id})
        assert title in read['content'] and 'café 🎵' in read['content']
        assert '$(not-a-command)' in read['content'] and '< > &' in read['content']
        assert '<script>alert("literal")</script>' in read['content']
        print('PASS: create/read, Unicode, escaping, literal command-like text')
        subset=server.call_notes('list_notes',{'folder_id':read['folder']['id'],'query':title})
        assert any(n['id']==note_id for n in subset['notes'])
        print('PASS: folder selection and title search')
        server.call_notes('update_note_content',{'note_id':note_id,'content':'Appended test line','expected_modified_at':read['modified_at']})
        read=server.call_notes('get_note_content',{'note_id':note_id})
        assert 'Appended test line' in read['content'] and 'café 🎵' in read['content']
        try:
            server.call_notes('update_note_content',{'note_id':note_id,'content':'Must not be written','mode':'replace','expected_modified_at':'2000-01-01T00:00:00.000Z'})
        except ValueError as error:
            assert 'Conflict' in str(error)
        else:
            raise AssertionError('Conflict was not rejected')
        server.call_notes('update_note_content',{'note_id':note_id,'content':'Replacement test line','mode':'replace','expected_modified_at':read['modified_at']})
        read=server.call_notes('get_note_content',{'note_id':note_id})
        assert read['title']==title and 'Replacement test line' in read['content']
        assert 'Appended test line' not in read['content']
        print('PASS: append, replace, title preservation, conflict refusal')
    finally:
        if note_id:
            # Remove only the note created by this test, with both ID and title guards.
            script='function run(a) { var n=Application("com.apple.Notes"); var item=n.notes.byId(a[0]); if(item.exists() && item.name()===a[1]) { n.delete(item); return "removed"; } throw Error("Cleanup guard failed"); }'
            cleaned=subprocess.run(['/usr/bin/osascript','-l','JavaScript','-e',script,note_id,title],capture_output=True,text=True,check=True)
            assert cleaned.stdout.strip()=='removed'
            print('PASS: temporary test note moved to Recently Deleted')


if __name__=='__main__':
    protocol_test()
    import sys
    if '--live' in sys.argv:
        live_test()
