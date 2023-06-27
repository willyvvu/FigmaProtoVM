// JS Runtime for the Figma Proto VM

const FPVM = {
  /// Definitions
  _: 0,

  // Register enum (indicies)
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  bp: 4,
  sp: 5,

  // Param reg enum
  p0: 0,
  p1: 1,
  p2: 2,

  // Command enum
  // REG, IMM, RES, ADD, SUB, LOAD, STORE, PUTC, GETC, EXIT, CJMP, EQ, NE, LT, GT, LE, GE, DUMP
  REG: 0,
  IMM: 1,
  RES: 2,
  ADD: 3,
  SUB: 4,
  LOAD: 5,
  STORE: 6,
  PUTC: 7,
  GETC: 8,
  EXIT: 9,
  CJMP: 10,
  EQ: 11,
  NE: 12,
  LT: 13,
  GT: 14,
  LE: 15,
  GE: 16,
  DUMP: 17,
}

function elvmAssemblyOutputToJSON(assembly) {
  return JSON.parse(
    convertRegistersToNumbers(cleanUpJson(assembly))
  );
}

function cleanUpJson(json) {
  // Strips comments from JSON and removes trailing commas
  json = json.replace(/\/\/.*\n/g, '\n');
  json = json.replace(/\/\*.*\*\//g, '');
  json = json.replace(/,(\s*[\]}])/g, '$1');
  return json;
}

function convertRegistersToNumbers(json) {
  json = json.replace(/_(?=[,\]])/g, FPVM._);
  json = json.replace(/a(?=[,\]])/g, FPVM.a);
  json = json.replace(/b(?=[,\]])/g, FPVM.b);
  json = json.replace(/c(?=[,\]])/g, FPVM.c);
  json = json.replace(/d(?=[,\]])/g, FPVM.d);
  json = json.replace(/bp(?=[,\]])/g, FPVM.bp);
  json = json.replace(/sp(?=[,\]])/g, FPVM.sp);
  json = json.replace(/p0(?=[,\]])/g, FPVM.p0);
  json = json.replace(/p1(?=[,\]])/g, FPVM.p1);
  json = json.replace(/p2(?=[,\]])/g, FPVM.p2);
  json = json.replace(/REG(?=[,\]])/g, FPVM.REG);
  json = json.replace(/IMM(?=[,\]])/g, FPVM.IMM);
  json = json.replace(/RES(?=[,\]])/g, FPVM.RES);
  json = json.replace(/ADD(?=[,\]])/g, FPVM.ADD);
  json = json.replace(/SUB(?=[,\]])/g, FPVM.SUB);
  json = json.replace(/LOAD(?=[,\]])/g, FPVM.LOAD);
  json = json.replace(/STORE(?=[,\]])/g, FPVM.STORE);
  json = json.replace(/PUTC(?=[,\]])/g, FPVM.PUTC);
  json = json.replace(/GETC(?=[,\]])/g, FPVM.GETC);
  json = json.replace(/EXIT(?=[,\]])/g, FPVM.EXIT);
  json = json.replace(/CJMP(?=[,\]])/g, FPVM.CJMP);
  json = json.replace(/EQ(?=[,\]])/g, FPVM.EQ);
  json = json.replace(/NE(?=[,\]])/g, FPVM.NE);
  json = json.replace(/LT(?=[,\]])/g, FPVM.LT);
  json = json.replace(/GT(?=[,\]])/g, FPVM.GT);
  json = json.replace(/LE(?=[,\]])/g, FPVM.LE);
  json = json.replace(/GE(?=[,\]])/g, FPVM.GE);
  json = json.replace(/DUMP(?=[,\]])/g, FPVM.DUMP);
  return json
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCompiled(compiled, getChar, putChar) {
  // Initialize variable memory from compiled.data, then add a bit more to the end
  const variableMemory = compiled.data.slice().concat(Array.from(Array(100)).map(() => 0));

  // Intiialize six variable registers
  const registers = Array.from(Array(6)).map(() => 0);
  // Initialize parameter registers
  const parameterRegisters = Array.from(Array(3)).map(() => 0);
  // Initialize instruction pointer
  let instructionPointer = 0;
  let instructionCount = 0;
  let maxMemoryUse = 0;

  let running = true;
  while (running) {
    instructionCount++;
    if (instructionCount > 1e7) {
      running = false;
      throw new Error('Taking a while... is there an infinite loop?');
    }
    // await wait(10);
    const [instruction, arg1, arg2, debugInfo] = compiled.pgm[instructionPointer];
    instructionPointer++;


    if (debugInfo) {
      // console.log(variableMemory);
      // console.log(registers);
      // console.log(debugInfo);
    }
    switch (instruction) {
      case FPVM.REG:
        parameterRegisters[arg2] = registers[arg1];
        break;
      case FPVM.IMM:
        parameterRegisters[arg2] = arg1;
        break;
      case FPVM.RES:
        registers[arg1] = parameterRegisters[0];
        break;
      case FPVM.ADD:
        parameterRegisters[0] = parameterRegisters[0] + parameterRegisters[1];
        break;
      case FPVM.SUB:
        parameterRegisters[0] = parameterRegisters[0] - parameterRegisters[1];
        break;
      case FPVM.LOAD:
        parameterRegisters[0] = variableMemory[parameterRegisters[1]];
        maxMemoryUse = Math.max(maxMemoryUse, parameterRegisters[1] + 1);
        break;
      case FPVM.STORE:
        variableMemory[parameterRegisters[1]] = parameterRegisters[0];
        maxMemoryUse = Math.max(maxMemoryUse, parameterRegisters[1] + 1);
        break;
      case FPVM.PUTC:
        putChar(parameterRegisters[0]);
        break;
      case FPVM.GETC:
        parameterRegisters[0] = getChar();
        break;
      case FPVM.CJMP:
        if (parameterRegisters[0]) {
          // Use the dispatch table to jump to the correct instruction
          instructionPointer = compiled.dispatch[parameterRegisters[2]];
        }
        break;
      case FPVM.EQ:
        parameterRegisters[0] = parameterRegisters[0] === parameterRegisters[1] ? 1 : 0;
        break;
      case FPVM.NE:
        parameterRegisters[0] = parameterRegisters[0] !== parameterRegisters[1] ? 1 : 0;
        break;
      case FPVM.LT:
        parameterRegisters[0] = parameterRegisters[0] < parameterRegisters[1] ? 1 : 0;
        break;
      case FPVM.GT:
        parameterRegisters[0] = parameterRegisters[0] > parameterRegisters[1] ? 1 : 0;
        break;
      case FPVM.LE:
        parameterRegisters[0] = parameterRegisters[0] <= parameterRegisters[1] ? 1 : 0;
        break;
      case FPVM.GE:
        parameterRegisters[0] = parameterRegisters[0] >= parameterRegisters[1] ? 1 : 0;
        break;
      case FPVM.DUMP:
        break;
      case FPVM.EXIT:
        running = false;
        break;
      default:
        throw new Error(`Unrecognized instruction: ${instruction}`);
    }
  }

  return { instructionCount, maxMemoryUse }
}
