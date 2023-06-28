# Figma Prototyping VM

Let's build a toy VM inside of Figma Prototyping! This project contains a
plugin and most tooling needed to build it.

**Live Figma File link [HERE](https://www.figma.com/file/21tGuyZAeOmk6Ejk0Y4wt1/Figma-Proto-VM!?type=design&node-id=0-1&mode=design&t=jEIGRgyL2iJZqOkD-11)!**

[![Figma Proto VM Screenrecord copy](https://github.com/willy-vvu/FigmaProtoVM/assets/3529065/4de8be6c-9892-452b-8db6-464fd7a19bfd)](https://twitter.com/willyvvu/status/1673565503602962432?s=20)

(Click the gif for the full video)

I've left the `dist` folder in the repo so you can try it out without building
it yourself. Just load the plugin as a dev plugin and you should be good to go!

## Getting started

`make` should do everything.

- Installs node dependencies
- Compiles ELVM with custom changes
- Combines built ELVM compiler js files into a single file
- Builds the plugin with typescript

## Architecture

The architecture is mostly based off the ELVM virtual machine with modifications
to fit into Figma's constraints. The biggest ones are:

- Figma variables are floats, so we have to use those instead of integers.
- Program memory and variable memory stored as Figma variable collections.
- 6 registers from ELVM + 3 more registers we add for convenience, which we called
  parameter registers.
- Other variables as needed to make it work, such as instruction pointer, etc.

### Memory

First and foremost, all Figma values are stored internally as floats. We can
treat these as ints up to a 24 bit value, which should be fine.

Memory is tricky since arrays are not easy to read/write to. To emulate an
array, we can use

- A variable slot for the value being written
- An index variable
- One variable per array item
- One if statement per array item

To keep the number of if statements down, we want to abstract away reads/writes
so that we can reuse them as much as we can.

In order to implement the existing ELVM memory, we have:

- Variable memory: only made as big as practical, just a single-mode collection of
  float variables read/written by LOAD and STORE.
- Program memory: read-only memory that stores the instructions in the program,
  represented a collection of float variables with three modes. Each instruction
  is a variable, where the first mode is the instruction type (mapped from enum
  -> int) and the second two are arguments for the instruction. Some
  instructions need no arguments so they can be left as 0. Note that the
  instruction set is slightly different from the ELVM set, which will be covered
  later. (Update: instead of modes, they're now just separate variables ending
  in \_op, \_arg1, and \_arg2, this is so folks on the free plan can use it, and
  it seems to have a marginal performance improvement)
- Register memory: ELVM specifies 6 read/write registers, which we drop the
  letters for and instead refer to by numerical index. Like variable memory,
  these are just a single-mode collection of 6 variables.

We also have two new types of memory:

- Dispatch table: read-only memory that maps program counter value to
  instruction number. The compiler outputs jumps relative to program counter,
  which are chunked and can include multiple instructions in a block. However,
  internally we store and track to individual instructions, which could have
  different indicies. When we jump, we use the table to convert from pc to
  instruction index.
- Parameter memory: This is a set of three registers, p0, p1, and p2 that help
  with evaluation of instructions. Firstly, they allow us to abstract away the
  difference between immediate and register values, serving as a holding point
  for the parameter values before the instruction is run. Immediate values can
  go directly into the slot, whereas register references can be read into the
  slot. This increases the number of instructions we need, but overall makes the
  system simpler, while maintaining overall readability. Secondly, they serve as
  a kind of working memory that we can act directly on. We can simplify the
  design of the "ALU" to perform operations on these slots and directly modify
  p0 as output.
- Temporary memory: We'll need variables scattered around to hold values every
  time we read/write from arrays or do any intermediate computation, since we
  don't have a concept of local variables, function arguments, or function returns.

### New instruction set

The biggest hurdle with adopting ELVM is that it expects us to be able to tell
the difference between register and immediate arguments. E.g. the same
instruction ADD needs to work like `ADD a,2` as well as `ADD a,b`. We don't have
an easy way to represent what's a register vs what's an immediate value, as
everything has to be a float at the end of the day and we don't have complicated
float math or bit masking. We could store a flag, but that would mean using many
more modes and hint at nested conditionals, which aren't implement. We could
even use different commands for adding immediate vs register values, like `ADDR`
and `ADDI`. However, this gets out of control with conditional jump commands
where there are many more permutations.

The difference between immediate and register types only matters because it
tells us where our inputs are coming from. After all, the actual addition
doesn't care if its adding register values or constants. Using this insight, we
can use three more "parameter registers" to hold the actual values of the
parameters before the computation is performed. These values map nicely to the
ELVM instruction parameters.

For the case `ADD a,2`, p0 would be set to the value of register a `REG a, p0`,
and p1 would be set the constant 2 `IMM 2, p1`. Then the addition is performed on
p0 and p1. In fact, we can change the behavior of `ADD` to take in no argumenst
now, and directly modify p0 with the result of the addition as if it were the
destination register. Lastly, we would need to copy the p0 result back to
register a with `RES a`

Let's take more complicated example with `JEQ a,b,3` for example. We start by
populating p0, p1, and p2 with a, b, and 3 respectively: `REG a, p0`, `REG b, p1`,
`IMM 3, p2`. Then, we perform an `EQ` operation, which now just overwrites p0
with the result. We introduce a new primitive, a conditional jump instruction
`CNDJMP` which looks at p0 to decide if we want to jump to p2 or not.

A good way to think of this is that the parameters to a traditional ELVM
instruction are instead each listed out beforehand, making the instruction
itself perform less work.

Sidenote for addition: due to the float based nature of our variables, we can't
rely on adding large numbers to close to MAX_INT when we want to flip the sign
bit. We can detect when numbers approach that point and convert those numbers to
negatives instead.

### P-register instructions (new)

We have new instructions for getting values in and out of the P register. It
might seem too small to have a single register copy/write be one instruction,
but it helps since array read/writes are by themselves so complicated.

#### REG src:register, dst:p_register

Reads the value in the src register and stores it in the destination p register.

#### IMM value:immediate, dst:p_register

Stores the provided immediate value in the destination p register.

#### RES dst:register

Copies p0, usually the "result" of the operation, to the destination register.

### Modified ELVM instructions

Existing instructions are modified to perform computations with the P register.

#### MOV (removed)

This command actually doesn't exist anymore as it can be completely replaced by p register commands.

For example, `MOV dst, src` becomes:

```
IMM src, p0 // Can also be REG
RES dst
```

This code uses the p registers to first read the source, and then write to the
destination.

#### ADD

Computes p0 + p1 and puts the result in p0.

For example, `ADD dst, src` becomes:

```
REG dst, p0
IMM src, p1 // Can also be REG
ADD
RES dst
```

#### SUB

Computes p0 - p1 and puts the result in p0.

For example, `SUB dst, src` becomes:

```
REG dst, p0
IMM src, p1 // Can also be REG
SUB
RES dst
```

#### LOAD

Fetches variable memory the address at p1 and stores the result to p0.

Note that due to the floating point nature of our variables, when a negative
address is requested, we just grab from the end of the array.

For example, `LOAD dst, src` becomes:

```
IMM src, p1 // Can also be REG
LOAD
RES dst
```

#### STORE

Stores variable memory at p0 to the address specified by p1.

Note that due to the floating point nature of our variables, when a negative
address is requested, we just grab from the end of the array.

For example, `STORE src, dst` becomes:

```
REG src, p0
IMM dst, p1 // Can also be REG
STORE
```

#### PUTC

Prints out p0.

For example, `PUTC src` becomes:

```
IMM src, p0 // Can also be REG
PUTC
```

#### GETC

Reads a character (0 if EOF) and stores it into p0.

For example, `GETC dst` becomes:

```
GETC
RES dst
```

#### EQ/NE/LT/GT/LE/GE

Compares p0 and p1 and stores the result into p0

For example, `<> dst, src` becomes:

```
REG dst, p0
IMM src, p1 // Can also be REG
<> // Comparator
RES dst
```

#### JEQ/JNE/JLT/JGT/JLE/JGE (removed)

These don't exist anymore, and can be recreated using existing comparators and a new `CJMP` command.

For example, `JXX jmp, dst, src` becomes:

```
REG dst, p0
IMM src, p1 // Can also be REG
IMM jmp, p2 // Can also be REG
<> // Comparator minus the J
CJMP
```

Note the order of parameters changes!

#### CJMP (new)

If p0 is true (!=0) jump to p2.

Check the JXX above for the usage example.

#### JMP (removed)

This can be implemented pretty simply with CJMP by setting p0 to true.

For example, `JMP jmp` becomes:

```
IMM jmp, p2 // Can also be REG
IMM 1, p0 // Set p0 to true
CJMP
```

#### EXIT (unchanged)

Exits the program!

#### DUMP (unchanged)

No-op

## Implementation

### Transferring the program

The compiled programs are converted to ints when they are stored in the figma
variables. Here's the following conversion table:

| Register | Value |
| -------- | ----- |
| a        | 0     |
| b        | 1     |
| c        | 2     |
| d        | 3     |
| bp       | 4     |
| sp       | 5     |

| Param register | Value |
| -------------- | ----- |
| p0             | 0     |
| p1             | 1     |
| p2             | 2     |

| Instruction | Value |
| ----------- | ----- |
| REG         | 0     |
| IMM         | 1     |
| RES         | 2     |
| ADD         | 3     |
| SUB         | 4     |
| LOAD        | 5     |
| STORE       | 6     |
| PUTC        | 7     |
| GETC        | 8     |
| EXIT        | 9     |
| CJMP        | 10    |
| EQ          | 11    |
| NE          | 12    |
| LT          | 13    |
| GT          | 14    |
| LE          | 15    |
| GE          | 16    |
| DUMP        | 17    |

For example, `REG c, p1` becomes `0 2 1` and `IMM 5, p0` becomes `1 5 0`. These
are the numbers that are stored in the figma variables.

### Program state and control flow

Control flow is implemented in Figma Prototyping using a set of frames. You can
think of the frames as a giant state machine, and each frame has an "After
Delay" interaction set to automatically run prototyping code.

We give each instruction has its own frame, prefixed with `INST_`, which holds
the corresponding logic for that instruction. Since Array reads/writes are
complicated, we have dedicated frames for reading Program memory and Dispatch
memory reads called `PGM_READ` and `DISPATCH_READ` respectively. We also have a
helper frame called `PGM_EVAL` that serves as a giant switch statement and
forwards to the correct `INST_*` frame.

The state of the program starts with the instruction pointer variable, called
`inst_ptr`, which keeps track of which instruction to run next. To begin running
the program (and after each instruction), we return here to fetch our next
instruction using the `PGM_READ` frame.

#### PGM_READ

This is the entry point to the program. Using the instruction pointer
(inst_ptr), it reads the current instruction from program memory and stores it
in three helper variables (inst_op, inst_arg1, inst_arg2). These variables will
be later to perform the relevant computation.

After reading, the instruction pointer is incremented for the next read, and
the current instruction is evaluated by navigating to the PGM_EVAL frame.

#### PGM_EVAL

This command checks the current instruction op and forwards it to the relevant
INST_XXX frame.

#### INST\_\*

Each instruction has its own frame. It reads the arguments from the instruction
register and performs the relevant computation. After the computation is done,
it forwards to the PGM_READ frame to read the next instruction.

#### DISPATCH_READ

When INST_CJMP decides to jump, it forwards to this frame. This frame reads the
dispatch memory using the p2 register as the address, and sets the instruction
pointer to the result. After reading, it forwards to the PGM_READ frame to read
the next instruction.

## Compiling code

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
it a one giant file. But it works!

## Thoughts and future work

By introducing the p-register, we need 2-4x more instructions to perform the
same computation. This also means our programs get 2-4x larger. We also get a
kind of memory bottleneck because most of the instructions are just moving data
in and out of the p registers.

Let's not forget the original motivation which was to make an ELVM compatible
instruction target, and this architecture has achieved exactly that. If we were
to further mod ELVM or even start from LLVM to make a custom compiler, we could
definitely do better. Better still, we could bite the bullet and incorporate
more complexity into the Figma prototype to make it more efficient, e.g. having
different instructions for registers vs immediates, or having a better way to
encode whether a particular value is a register or an immediate.

Also, after having built it out, I didn't realize that having 100's of
conditionals inside a Figma prototype would actually take a performance hit, and
take way more than a frame to evaluate. Maybe this is something to consider for
future work which would take an approach like
[@willdepue](https://twitter.com/willdepue/status/1673386249854541830)'s Figma
computer and use a tree based memory access instead of a linear one.
