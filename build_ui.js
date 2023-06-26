// Since figma plugins don't allow dependencies, we have to inline our deps into
// the plugin.

const fs = require('fs');
const path = require('path');

const depHeaderScript = fs.readFileSync(path.join(__dirname, 'codegen/elvm/web/headers.js'), 'utf8');

// For these libraries, just replace "var main =" with "var main_XXX ="
const dep8ccScript = "var main_8cc =" + fs.readFileSync(path.join(__dirname, 'codegen/elvm/out/8cc.c.eir.asmjs'), 'utf8').slice(10)
const depElcScript = "var main_elc =" + fs.readFileSync(path.join(__dirname, 'codegen/elvm/out/elc.c.eir.asmjs'), 'utf8').slice(10)
const depEliScript = "var main_eli =" + fs.readFileSync(path.join(__dirname, 'codegen/elvm/out/eli.c.eir.asmjs'), 'utf8').slice(10)

const combinedELVMScript = `<script>\n${depHeaderScript + dep8ccScript + depElcScript + depEliScript}\n</script>`;


const uiSrc = fs.readFileSync(path.join(__dirname, 'src/ui.html'), 'utf8');
const runtimeScript = `<script>\n${fs.readFileSync(path.join(__dirname, 'src/runtime.js'), 'utf8')}\n</script>`;

// Just add the script to the end
const builtUi = [uiSrc, runtimeScript, combinedELVMScript].join('\n');

fs.writeFileSync(path.join(__dirname, 'ui_built.html'), builtUi);