# Default target
all: plugin

# Clean
clean: elvm-clean plugin-clean

plugin-clean:
	rm -rf dist/

# Plugin = backend js + UI
plugin: dist/code.js dist/ui.html

# Install node modules
node_modules:
	npm install

dist/code.js: node_modules src/code.ts
	npm run build

# Combine asmjs targets with our ui.html into our final build
dist/ui.html: helpers/build_ui.js src/ui.html codegen/elvm/out/8cc.c.eir.asmjs codegen/elvm/out/elc.c.eir.asmjs codegen/elvm/out/eli.c.eir.asmjs codegen/elvm/web/headers.js
	node helpers/build_ui.js

# Build asmjs target for the compiler (using custom edits we need to make to the elvm repository before building)
codegen/elvm/out/8cc.c.eir.asmjs: codegen/elvm/Makefile codegen/elvm/target/js.c
	cd codegen/elvm && ruby tools/makeweb.rb

# We want to modify certain files on our first run, so we can use a fake file to
# signal to make that we need to do this (otherwise make won't know from just timestamps)
codegen/elvm/modified: codegen/elvm/README.md
	touch	codegen/elvm/modified

# Make sure the makefile is up to date with our custom edits
codegen/elvm/Makefile: helpers/edit_elvm_makefile.js codegen/elvm/modified
	node helpers/edit_elvm_makefile.js

# Copy our custom files into the submodule to override the original js target
codegen/elvm/target/js.c: codegen/figmaproto.c codegen/elvm/modified
	cp codegen/figmaproto.c codegen/elvm/target/js.c

# If the readme doesn't exist, we gotta clone the elvm repo
codegen/elvm/README.md:
	git submodule update --init --recursive \
	|| (echo "Did you download the repository as .zip? You may need to clone the repository instead." && false)

# Target to clean up cloned repository (restore it back to original state)
elvm-clean:
	echo "Cleaning up cloned repository..."
	cd codegen/elvm && git clean -dfx && git reset --hard HEAD

.PHONY: all clean plugin plugin-clean elvm-clean