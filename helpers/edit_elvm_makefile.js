// This file edits the original elvm makefile for our use case.

const fs = require('fs');
const path = require('path');

const elvmMakefilePath = path.join(__dirname, '../codegen/elvm/Makefile');
const elvmMakefile = fs.readFileSync(elvmMakefilePath, 'utf8');

// Add our own target by blowing away everything after "# Targets" and replacing
// it with our own target. It also removes the nodejs dependency and all tests afterwards.

// Since it removes the original line, it'll no-op on subsequent runs.

const customTarget = `
TARGET := asmjs
include target.mk
`
const targetRegex = /# Targets\n([\s\S]*)/m;


// We also make a small tweak because we're using elvm as a submodule so the .git/index file doesn't exist. Make it depend instead on nothing.
const gitDependency = "out/git_submodule.stamp: .git/index"
const newGitDependency = "out/git_submodule.stamp:"

const newMakefile = elvmMakefile.replace(targetRegex, customTarget).replace(gitDependency, newGitDependency)

fs.writeFileSync(elvmMakefilePath, newMakefile);

console.log('Successfully edited elvm/Makefile');

