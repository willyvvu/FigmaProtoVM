
/// Definitions
const _ = 0;

// Register enum (indicies)
const a = 0;
const b = 1;
const c = 2;
const d = 3;
const bp = 4;
const sp = 5;

// Param reg enum
const p0 = 0;
const p1 = 1;
const p2 = 2;

// Command enum
// REG, IMM, RES, ADD, SUB, LOAD, STORE, PUTC, GETC, EXIT, CJMP, EQ, NE, LT, GT, LE, GE, DUMP
const REG = 0;
const IMM = 1;
const RES = 2;
const ADD = 3;
const SUB = 4;
const LOAD = 5;
const STORE = 6;
const PUTC = 7;
const GETC = 8;
const EXIT = 9;
const CJMP = 10;
const EQ = 11;
const NE = 12;
const LT = 13;
const GT = 14;
const LE = 15;
const GE = 16;
const DUMP = 17;

const compiled = {
  data: [
    72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33, 10, 16,],
  pgm: [
  /// PC: 0
  // JMP 1
  /*0*/[IMM, 1, p2],
  /*1*/[IMM, 1, p0],
  /*2*/[CJMP, _, _],
  /// PC: 1
  // MOV d, sp
  /*3*/[REG, sp, p0],
  /*4*/[RES, d, _],
  // ADD d, 16777215
  /*5*/[REG, d, p0],
  /*6*/[IMM, -1, p1],
  /*7*/[ADD, _, _],
  /*8*/[RES, d, _],
  // STORE bp, d
  /*9*/[REG, bp, p0],
  /*10*/[REG, d, p1],
  /*11*/[STORE, _, _],
  // MOV sp, d
  /*12*/[REG, d, p0],
  /*13*/[RES, sp, _],
  // MOV bp, sp
  /*14*/[REG, sp, p0],
  /*15*/[RES, bp, _],
  // SUB sp, 2
  /*16*/[REG, sp, p0],
  /*17*/[IMM, 2, p1],
  /*18*/[SUB, _, _],
  /*19*/[RES, sp, _],
  // MOV a, 0
  /*20*/[IMM, 0, p0],
  /*21*/[RES, a, _],
  // MOV b, sp
  /*22*/[REG, sp, p0],
  /*23*/[RES, b, _],
  // MOV a, 0
  /*24*/[IMM, 0, p0],
  /*25*/[RES, a, _],
  // MOV b, bp
  /*26*/[REG, bp, p0],
  /*27*/[RES, b, _],
  // ADD b, 16777215
  /*28*/[REG, b, p0],
  /*29*/[IMM, -1, p1],
  /*30*/[ADD, _, _],
  /*31*/[RES, b, _],
  // STORE a, b
  /*32*/[REG, a, p0],
  /*33*/[REG, b, p1],
  /*34*/[STORE, _, _],
  // MOV a, 0
  /*35*/[IMM, 0, p0],
  /*36*/[RES, a, _],
  // MOV b, sp
  /*37*/[REG, sp, p0],
  /*38*/[RES, b, _],
  // MOV b, bp
  /*39*/[REG, bp, p0],
  /*40*/[RES, b, _],
  // ADD b, 16777214
  /*41*/[REG, b, p0],
  /*42*/[IMM, -2, p1],
  /*43*/[ADD, _, _],
  /*44*/[RES, b, _],
  // MOV a, 0
  /*45*/[IMM, 0, p0],
  /*46*/[RES, a, _],
  // STORE a, b
  /*47*/[REG, a, p0],
  /*48*/[REG, b, p1],
  /*49*/[STORE, _, _],
  /// PC: 2
  // MOV b, bp
  /*50*/[REG, bp, p0],
  /*51*/[RES, b, _],
  // ADD b, 16777214
  /*52*/[REG, b, p0],
  /*53*/[IMM, -2, p1],
  /*54*/[ADD, _, _],
  /*55*/[RES, b, _],
  // LOAD a, b
  /*56*/[REG, b, p1],
  /*57*/[LOAD, _, _],
  /*58*/[RES, a, _],
  // MOV d, sp
  /*59*/[REG, sp, p0],
  /*60*/[RES, d, _],
  // ADD d, 16777215
  /*61*/[REG, d, p0],
  /*62*/[IMM, -1, p1],
  /*63*/[ADD, _, _],
  /*64*/[RES, d, _],
  // STORE a, d
  /*65*/[REG, a, p0],
  /*66*/[REG, d, p1],
  /*67*/[STORE, _, _],
  // MOV sp, d
  /*68*/[REG, d, p0],
  /*69*/[RES, sp, _],
  // MOV a, 14
  /*70*/[IMM, 14, p0],
  /*71*/[RES, a, _],
  // MOV b, a
  /*72*/[REG, a, p0],
  /*73*/[RES, b, _],
  // LOAD a, sp
  /*74*/[REG, sp, p1],
  /*75*/[LOAD, _, _],
  /*76*/[RES, a, _],
  // ADD sp, 1
  /*77*/[REG, sp, p0],
  /*78*/[IMM, 1, p1],
  /*79*/[ADD, _, _],
  /*80*/[RES, sp, _],
  // LT a, b
  /*81*/[REG, a, p0],
  /*82*/[REG, b, p1],
  /*83*/[LT, _, _],
  /*84*/[RES, a, _],
  // JEQ 4, a, 0
  /*85*/[REG, a, p0],
  /*86*/[IMM, 0, p1],
  /*87*/[IMM, 4, p2],
  /*88*/[EQ, _, _],
  /*89*/[CJMP, _, _],
  /// PC: 3
  // JMP 5
  /*90*/[IMM, 5, p2],
  /*91*/[IMM, 1, p0],
  /*92*/[CJMP, _, _],
  /// PC: 4
  // JMP 7
  /*93*/[IMM, 7, p2],
  /*94*/[IMM, 1, p0],
  /*95*/[CJMP, _, _],
  /// PC: 5
  // MOV b, bp
  /*96*/[REG, bp, p0],
  /*97*/[RES, b, _],
  // ADD b, 16777215
  /*98*/[REG, b, p0],
  /*99*/[IMM, -1, p1],
  /*100*/[ADD, _, _],
  /*101*/[RES, b, _],
  // LOAD a, b
  /*102*/[REG, b, p1],
  /*103*/[LOAD, _, _],
  /*104*/[RES, a, _],
  // MOV d, sp
  /*105*/[REG, sp, p0],
  /*106*/[RES, d, _],
  // ADD d, 16777215
  /*107*/[REG, d, p0],
  /*108*/[IMM, -1, p1],
  /*109*/[ADD, _, _],
  /*110*/[RES, d, _],
  // STORE b, d
  /*111*/[REG, b, p0],
  /*112*/[REG, d, p1],
  /*113*/[STORE, _, _],
  // MOV sp, d
  /*114*/[REG, d, p0],
  /*115*/[RES, sp, _],
  // MOV d, sp
  /*116*/[REG, sp, p0],
  /*117*/[RES, d, _],
  // ADD d, 16777215
  /*118*/[REG, d, p0],
  /*119*/[IMM, -1, p1],
  /*120*/[ADD, _, _],
  /*121*/[RES, d, _],
  // STORE a, d
  /*122*/[REG, a, p0],
  /*123*/[REG, d, p1],
  /*124*/[STORE, _, _],
  // MOV sp, d
  /*125*/[REG, d, p0],
  /*126*/[RES, sp, _],
  // MOV b, bp
  /*127*/[REG, bp, p0],
  /*128*/[RES, b, _],
  // ADD b, 16777214
  /*129*/[REG, b, p0],
  /*130*/[IMM, -2, p1],
  /*131*/[ADD, _, _],
  /*132*/[RES, b, _],
  // LOAD a, b
  /*133*/[REG, b, p1],
  /*134*/[LOAD, _, _],
  /*135*/[RES, a, _],
  // MOV b, a
  /*136*/[REG, a, p0],
  /*137*/[RES, b, _],
  // LOAD a, sp
  /*138*/[REG, sp, p1],
  /*139*/[LOAD, _, _],
  /*140*/[RES, a, _],
  // ADD sp, 1
  /*141*/[REG, sp, p0],
  /*142*/[IMM, 1, p1],
  /*143*/[ADD, _, _],
  /*144*/[RES, sp, _],
  // ADD a, b
  /*145*/[REG, a, p0],
  /*146*/[REG, b, p1],
  /*147*/[ADD, _, _],
  /*148*/[RES, a, _],
  // MOV c, a
  /*149*/[REG, a, p0],
  /*150*/[RES, c, _],
  // LOAD a, sp
  /*151*/[REG, sp, p1],
  /*152*/[LOAD, _, _],
  /*153*/[RES, a, _],
  // ADD sp, 1
  /*154*/[REG, sp, p0],
  /*155*/[IMM, 1, p1],
  /*156*/[ADD, _, _],
  /*157*/[RES, sp, _],
  // MOV b, a
  /*158*/[REG, a, p0],
  /*159*/[RES, b, _],
  // MOV a, c
  /*160*/[REG, c, p0],
  /*161*/[RES, a, _],
  // MOV b, a
  /*162*/[REG, a, p0],
  /*163*/[RES, b, _],
  // LOAD a, b
  /*164*/[REG, b, p1],
  /*165*/[LOAD, _, _],
  /*166*/[RES, a, _],
  // MOV d, sp
  /*167*/[REG, sp, p0],
  /*168*/[RES, d, _],
  // ADD d, 16777215
  /*169*/[REG, d, p0],
  /*170*/[IMM, -1, p1],
  /*171*/[ADD, _, _],
  /*172*/[RES, d, _],
  // STORE a, d
  /*173*/[REG, a, p0],
  /*174*/[REG, d, p1],
  /*175*/[STORE, _, _],
  // MOV sp, d
  /*176*/[REG, d, p0],
  /*177*/[RES, sp, _],
  // PUTC a
  /*178*/[REG, a, p0],
  /*179*/[PUTC, _, _],
  // ADD sp, 1
  /*180*/[REG, sp, p0],
  /*181*/[IMM, 1, p1],
  /*182*/[ADD, _, _],
  /*183*/[RES, sp, _],
  /// PC: 6
  // MOV b, bp
  /*184*/[REG, bp, p0],
  /*185*/[RES, b, _],
  // ADD b, 16777214
  /*186*/[REG, b, p0],
  /*187*/[IMM, -2, p1],
  /*188*/[ADD, _, _],
  /*189*/[RES, b, _],
  // LOAD a, b
  /*190*/[REG, b, p1],
  /*191*/[LOAD, _, _],
  /*192*/[RES, a, _],
  // MOV d, sp
  /*193*/[REG, sp, p0],
  /*194*/[RES, d, _],
  // ADD d, 16777215
  /*195*/[REG, d, p0],
  /*196*/[IMM, -1, p1],
  /*197*/[ADD, _, _],
  /*198*/[RES, d, _],
  // STORE a, d
  /*199*/[REG, a, p0],
  /*200*/[REG, d, p1],
  /*201*/[STORE, _, _],
  // MOV sp, d
  /*202*/[REG, d, p0],
  /*203*/[RES, sp, _],
  // ADD a, 1
  /*204*/[REG, a, p0],
  /*205*/[IMM, 1, p1],
  /*206*/[ADD, _, _],
  /*207*/[RES, a, _],
  // MOV b, bp
  /*208*/[REG, bp, p0],
  /*209*/[RES, b, _],
  // ADD b, 16777214
  /*210*/[REG, b, p0],
  /*211*/[IMM, -2, p1],
  /*212*/[ADD, _, _],
  /*213*/[RES, b, _],
  // STORE a, b
  /*214*/[REG, a, p0],
  /*215*/[REG, b, p1],
  /*216*/[STORE, _, _],
  // LOAD a, sp
  /*217*/[REG, sp, p1],
  /*218*/[LOAD, _, _],
  /*219*/[RES, a, _],
  // ADD sp, 1
  /*220*/[REG, sp, p0],
  /*221*/[IMM, 1, p1],
  /*222*/[ADD, _, _],
  /*223*/[RES, sp, _],
  // JMP 2
  /*224*/[IMM, 2, p2],
  /*225*/[IMM, 1, p0],
  /*226*/[CJMP, _, _],
  /// PC: 7
  // MOV a, 0
  /*227*/[IMM, 0, p0],
  /*228*/[RES, a, _],
  // MOV b, a
  /*229*/[REG, a, p0],
  /*230*/[RES, b, _],
  // EXIT
  /*231*/[EXIT, _, _],
  // EXIT
  /*232*/[EXIT, _, _],
  ],
  dispatch: [
    0, 3, 50, 90, 93, 96, 184, 227,],
}

// The commands actually used in the compiled code above are:
// 0: IMM (enum value 1)
// 3: REG (enum value 0)
// 50: ADD (enum value 3)
// 90: RES (enum value 2)
// 93: LOAD (enum value 5)
// 96: STORE (enum value 6)
// 184: EXIT (enum value 9)
// 227: CJMP (enum value 10)


async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCompiled(compiled) {
  // Initialize variable memory from compiled.data, then add a bit more to the end
  const variableMemory = compiled.data.slice().concat(Array.from(Array(100)).map(() => 0));

  // Intiialize six variable registers
  const registers = Array.from(Array(6)).map(() => 0);
  // Initialize parameter registers
  const parameterRegisters = Array.from(Array(3)).map(() => 0);
  // Initialize instruction pointer
  let instructionPointer = 0;
  while (true) {
    // await wait(5);
    const [instruction, arg1, arg2, debugInfo] = compiled.pgm[instructionPointer];
    instructionPointer++;

    // console.log(parameterRegisters);
    if (debugInfo) {
      // console.log(variableMemory);
      // console.log(registers);
      // console.log(debugInfo);
    }
    switch (instruction) {
      case REG:
        parameterRegisters[arg2] = registers[arg1];
        break;
      case IMM:
        parameterRegisters[arg2] = arg1;
        break;
      case RES:
        registers[arg1] = parameterRegisters[0];
        break;
      case ADD:
        parameterRegisters[0] = parameterRegisters[0] + parameterRegisters[1];
        break;
      case SUB:
        parameterRegisters[0] = parameterRegisters[0] - parameterRegisters[1];
        break;
      case LOAD:
        parameterRegisters[0] = variableMemory[parameterRegisters[1]];
        break;
      case STORE:
        variableMemory[parameterRegisters[1]] = parameterRegisters[0];
        break;
      case PUTC:
        console.log("LOG:", parameterRegisters[0], String.fromCharCode(parameterRegisters[0]));
        break;
      case GETC:
        parameterRegisters[0] = process.stdin.read(1).charCodeAt(0) || 0;
        break;
      case CJMP:
        if (parameterRegisters[0]) {
          // Use the dispatch table to jump to the correct instruction
          instructionPointer = compiled.dispatch[parameterRegisters[2]];
        }
        break;
      case EQ:
        parameterRegisters[0] = parameterRegisters[0] === parameterRegisters[1] ? 1 : 0;
        break;
      case NE:
        parameterRegisters[0] = parameterRegisters[0] !== parameterRegisters[1] ? 1 : 0;
        break;
      case LT:
        parameterRegisters[0] = parameterRegisters[0] < parameterRegisters[1] ? 1 : 0;
        break;
      case GT:
        parameterRegisters[0] = parameterRegisters[0] > parameterRegisters[1] ? 1 : 0;
        break;
      case LE:
        parameterRegisters[0] = parameterRegisters[0] <= parameterRegisters[1] ? 1 : 0;
        break;
      case GE:
        parameterRegisters[0] = parameterRegisters[0] >= parameterRegisters[1] ? 1 : 0;
        break;
      case DUMP:
        break;
      case EXIT:
        return;
      default:
        throw new Error(`Unrecognized instruction: ${instruction}`);
    }
  }
}
runCompiled(compiled);

