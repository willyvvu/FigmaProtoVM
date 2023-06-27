# Code Generation

It'd be insane if we could take c code and translate it to a form that we can
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
easier to replace the `js.c` file and re-compile. I've built a makefile that
does just that (also stripping the other language targets so we don't get
tripped up with dependencies). In fact it'll do the whole deal, from cloning the
repo to compiling the code. Just run `make` in this directory and you'll be
ready to go.
