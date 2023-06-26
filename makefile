# Default target
all: plugin

clean: elvm-clea

plugin: ui_built.html code.ts
	npm run build

# Combine asmjs targets with our ui.html into our final build
ui_built.html: elvm-build src/ui.html codegen/elvm/out/8cc.c.eir.asmjs codegen/elvm/out/elc.c.eir.asmjs codegen/elvm/out/eli.c.eir.asmjs codegen/elvm/web/headers.js
	node build_ui.js

# Build asmjs target for the compiler
elvm-build: elvm-prereqs
	cd codegen/elvm && ruby tools/makeweb.rb

# All custom edits we need to make to the elvm repository before building
elvm-prereqs: codegen/elvm/Makefile codegen/elvm/target/js.c

# Make sure the makefile is up to date with our custom edits
codegen/elvm/Makefile: codegen/edit_elvm_makefile.js
	node codegen/edit_elvm_makefile.js

# Copy our custom files into the submodule to override the original js target
codegen/elvm/target/js.c: codegen/figmaproto.c
	cp codegen/figmaproto.c codegen/elvm/target/js.c

# Target to clean up cloned repository (restore it back to original state)
elvm-clean:
	echo "Cleaning up cloned repository..."
	cd codegen/elvm && git clean -dfx && git reset --hard HEAD

.PHONY: all clean elvm-build elvm-prereqs elvm-clean