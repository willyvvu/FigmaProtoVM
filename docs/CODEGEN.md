# Code Generation

It'd be insane if we could take C code and translate it to a form that we can
run with our architecture. Fortunately, there's a project called
[ELVM](https://github.com/shinh/elvm) that can help us do that. It's built for
more esoteric programming languages (that's what the E stands for) which Figma
prototypes certainly are. However, since it's a hobby project and not super
extensible, we're going to need some hacks to make it work.

The ELVM site provides an awesome [web-based
demo](http://shinh.skr.jp/elvm/8cc.js.html) straight out of the gate, which is
amazing. It runs with asmjs, but that makes it much harder to modify since it
requires being compiled. If we want to add our own language, we'll need to go in
and modify the source code, then re-compile it. Which is actually pretty ok since
there's already scripts in the source repo that help us with the compilation.

I originally was going to put my own code in a separate file, but it's just
easier to replace the `js.c` file in the ELVM repo with our own code and
re-compile. To automate this, I wrote a makefile to copy the contents of
`figmaproto.c` into the `js.c` file.

It's hacky, I know, but it does the trick. I also made a script
`edit_elvm_makefile.js` which removes all the other ELVM language targets and
makes some modifications so that the build will go smoothly.

The compiled outputs for the web demo, which is basically just runnable js, is
then concatenated into a single file by the `build_ui.js` script and tacked onto
the bottom of the finished built `ui.html` file. It's also super hacky because
we can't import any script files from a Figma plugin, so we have to just include
it a one giant file.
