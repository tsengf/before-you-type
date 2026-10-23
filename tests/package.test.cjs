const {test} = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const path = require('node:path');
test('release package contains only runtime files and is reproducible', () => {
  const script = `
import importlib.util, pathlib, tempfile, zipfile
spec=importlib.util.spec_from_file_location('packager', 'scripts/package.py')
module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
with tempfile.TemporaryDirectory() as temp:
    first=module.build(pathlib.Path(temp)/'first.zip')
    second=module.build(pathlib.Path(temp)/'second.zip')
    assert first.read_bytes() == second.read_bytes()
    with zipfile.ZipFile(first) as archive:
        assert set(archive.namelist()) == set(module.FILES)
        assert archive.testzip() is None
        assert 'manifest.json' in archive.namelist()
        assert not any(x.startswith(('tests/', 'docs/', 'node_modules/', '.git/')) for x in archive.namelist())
print('ok')
`;
  assert.equal(execFileSync('python3', ['-B', '-c', script], {cwd:path.resolve(__dirname,'..'), encoding:'utf8'}).trim(), 'ok');
});
