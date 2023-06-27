# Figma Prototyping VM

Let's build a toy VM inside of Figma Prototyping! This project contains a
plugin and most tooling needed to build it.

I've left the `dist` folder in the repo so you can try it out without building
it yourself. Just load the plugin as a dev plugin and you should be good to go!

## Getting started

`make` should do everything.

- Installs node dependencies
- Compiles ELVM with custom changes
- Combines built ELVM compiler js files into a single file
- Builds the plugin with typescript

## Architecture

The architecture should feel mostly familiar, but with modifications to make the
prototyping code easier.

- Figma variables are floats, so we have to use those instead of integers.
- Program memory and variable memory stored as Figma variable collections.
- 6 registers from ELVM + 3 more registers we add for convenience
- Other variables as needed to make it work, such as instruction pointer, etc.

You can read more about it
[here](docs/ARCHITECTURE.md).

## Compilation and code generation

We use ELVM to generate code specific for this architecture. Most of the code
generation can be found in `codegen/`. You can read more about it [here](docs/CODEGEN.md).
