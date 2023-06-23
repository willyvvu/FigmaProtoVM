/**
# MicroJS
A runnable JS abstraction where each statement is as close as possible to an
actual prototyping action, but is still valid and runnable JS.

- `=` means setting one variable to another using the `Set variable` action
- `if()` statements map over to Conditional actions, but conditionals cannot be
  nested (no if inside if)
- Functions and method calls become Navigate To, with limitations:
  - No arguments can be passed. To get around this, we can use existing
    variables to persist and pass state.
  - There's no stack and no return. We can simulate the return by cleverly using
    variables to store where we were when we called the function. NOTE that
    Navigate To in practice will not run the sub function immediately, and
    instead queue it for the next frame. In addition, if there are multiple
    Navigate To's in one frame, only the last one will be respected. To maintain
    compatibility with JS we should design the code so that the current function
    ends immediately when a subfunction is called, with no further code being
    run afterwards.

## Program
Program prefixes are an abstraction over read-only program memory and
evaluation.

- program_pointer
- program_readBuf_cmd
- program_readBuf_p1
- program_readBuf_p2
- program_readBuf_p3
- program_read()
- program_eval()

# program_read()
Reads from the instruction at the address of `program_pointer`, putting the
current instruction (consisting of cmd2, p1, p2, and p3) into
`program_readBuf_*`. The underlying implementation is a variable collection with
the modes and tons of if statements.

# program_eval()
The core loop which reads from `program_readBuf_cmd` and its three parameters
(p1, p2, p3). Each command uses its parameters differently.

## Register
Register prefixes is an abstraction over a unified read-write register/variable
memory. This is to simplify the design. There will be lots of slots that can be
used very flexibly!

- register_pointer
- register_readBuf
- register_writeBuf
- register_read()
- register_write()

# register_read()
Reads from the register at the address of `register_pointer` and stores it into
`register_readBuf`. The underlying implementation is a variable collection with
the modes and tons of if statements.

# register_write()
Takes the value at `register_writeBuf` and writes it to the register at the
address of `register_pointer`. The underlying implementation is a variable
collection with the modes and tons of if statements.


*/

let program_pointer = 0
let program_readBuf_cmd = ""
let program_readBuf_p1 = 0
let program_readBuf_p2 = 0
let program_readBuf_p3 = 0
let register_pointer = 0
let register_readBuf = 0
let register_writeBuf = 0

let MOCK_REGISTER_COUNT = 10
let MOCK_REGISTERS = Array.from(Array(MOCK_REGISTER_COUNT)).map((i) => 0)
let MOCK_PGM = [["END", 0, 0, 0]]

function program_eval() {
  // END
  // Terminates the program
  if (program_readBuf_cmd === "END") {
    console.log("end")
    return
  }

  // SET(p1: register, p2: constant)
  // Sets the register at p1 to the constant provided at p2
  if (program_readBuf_cmd === "SET") {
    register_pointer = program_readBuf_p1
    register_writeBuf = program_readBuf_p2
    return register_write()
  }
  if (program_readBuf_cmd === "SET_") {
    // Done!
    return program_read()
  }


  // COPY(p1: register, p2: register){
  // Copies the value of p1 to p2
  if (program_readBuf_cmd === "COPY") {
    register_pointer = program_readBuf_p1
    return register_read()
  }
  if (program_readBuf_cmd === "COPY_") {
    register_writeBuf = register_readBuf

    // Write to new location
    register_pointer = program_readBuf_p2
    return register_write()
  }
  if (program_readBuf_cmd === "COPY__") {
    // Done!
    return program_read()
  }

  // LOAD(p1: register*, p2: register)
  // Register p1 is assumed to hold an address to another register, which is where the value in register p2 will be copied.
  if (program_readBuf_cmd === "LOAD") {
    // Prepare to copy p2 - read it and store it in the write buffer
    register_pointer = program_readBuf_p2
    return register_read()
  }
  if (program_readBuf_cmd === "LOAD_") {
    register_writeBuf = register_readBuf

    // Read p1 and set the write pointer to p1's value
    register_pointer = program_readBuf_p1
    return register_read()
  }
  if (program_readBuf_cmd === "LOAD__") {
    register_pointer = register_readBuf
    // Perform the write with our pre-stored write buffer!
    return register_write()
  }
  if (program_readBuf_cmd === "LOAD___") {
    // Done!
    return program_read()
  }

  // STORE(p1: register, p2: register*)
  // The value at register p1 is copied to a register whose address is the current value of register p2.
  if (program_readBuf_cmd === "STORE") {

    // Prepare to copy p2 - read it and store it in the write buffer
    register_pointer = program_readBuf_p1
    return register_read()
  }
  if (program_readBuf_cmd === "STORE_") {
    register_writeBuf = register_readBuf

    // Read p1 and set the write pointer to p1's value
    register_pointer = program_readBuf_p2
    return register_read()
  }
  if (program_readBuf_cmd === "STORE__") {
    register_pointer = register_readBuf

    // Perform the write with our pre-stored write buffer!
    return register_write()
  }
  if (program_readBuf_cmd === "STORE___") {
    // Done
    return program_read()
  }

}

function program_read() {
  // This code should be pretty repetitive, like:
  // if(program_pointer === 0) {
  //   program_readBuf_cmd = program_mem0.cmd
  //   program_readBuf_p1 = program_mem0.p1
  //   program_readBuf_p2 = program_mem0.p2
  //   program_readBuf_p3 = program_mem0.p3
  // }
  // if(program_pointer === 1) {
  //  etc.

  // We'll just mock it using MOCK methods
  [program_readBuf_cmd,
    program_readBuf_p1,
    program_readBuf_p2,
    program_readBuf_p3] = MOCK_PGM[program_pointer]

  // Increment command pointer by 1 so next time we read the next pointer. Due
  // to the constraints of Navigate To, it's cleanest to put it here.
  program_pointer = program_pointer + 1

  // Now, send back to our main loop
  return program_eval()
}

function register_read() {
  // This code should be pretty repetitive, like:
  // if(register_pointer === 0) {
  //   register_readBuf = register_mem0
  // }
  // if(register_pointer === 1) {
  //   etc.

  // We'll just mock it using MOCK methods
  register_readBuf = MOCK_REGISTERS[register_pointer]

  // Now, to fake the return call
  // Add an underscore and send back to our main loop
  program_readBuf_cmd = program_readBuf_cmd + "_"
  return program_eval()
}

function register_write() {
  // This code should be pretty repetitive, like:
  // if(register_pointer === 0) {
  //   register_mem0 = register_writeBuf
  // }
  // if(register_pointer === 1) {
  //   etc.

  // We'll just mock it using MOCK methods
  MOCK_REGISTERS[register_pointer] = register_writeBuf

  // Now, to fake the return call
  // Add an underscore and send back to our main loop
  program_readBuf_cmd = program_readBuf_cmd + "_"
  return program_eval()
}

console.log("starting")
program_read()