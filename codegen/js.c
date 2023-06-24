#include <ir/ir.h>
#include <stdlib.h>
#include <target/util.h>

// helper to convert unsigned int24 to signed int24 string
static const char* formatImmediate(int imm){
  if(imm >= 8388608){
    return format("-%d", 16777216 - imm);
  }
  else {
    return format("%d", imm);
  }
}

static const char* formatRegister(int reg){
  return reg_names[reg];
}

static const char* formatParamRegister(int reg){
  return format("p%d", reg);
}

static const char* EMPTY_ARG = "_";

static const char* makeInst(const char* instName, const char* arg1, const char* arg2){
  return format("[%s, %s, %s],", instName, arg1, arg2);
}

static const char* makeParameterInst(const Value* value, int parameterRegister){
  if (value->type == IMM) {
    return makeInst("IMM", formatImmediate(value->imm), formatParamRegister(parameterRegister));
  }
  else if (value->type == REG) {
    return makeInst("REG", formatRegister(value->reg), formatParamRegister(parameterRegister));
  }
  error("ugh");
  return NULL;
}

static const char* makeParameterConstantInst(const char* constant, int parameterRegister){
  return makeInst("IMM", constant, formatParamRegister(parameterRegister));
}

static const char* makeResultInst(const Value* value){
  return makeInst("RES", formatRegister(value->reg), EMPTY_ARG);
}

static const char* makeOperationInst(char* op){
  return makeInst(op, EMPTY_ARG, EMPTY_ARG);
}

static void fp_emit_comparator(Inst* inst, int* instCounter, char* comparatorBase){
  emit_line("// %s %s, %s", comparatorBase, reg_names[inst->dst.reg], src_str(inst));
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->dst, 0)); instCounter[0]++;
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->src, 1)); instCounter[0]++;
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst(comparatorBase)); instCounter[0]++;
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeResultInst(&inst->dst)); instCounter[0]++;
}
static void fp_emit_jump_comparator(Inst* inst, int* instCounter, char* comparatorBase){
  emit_line("// J%s %s, %s, %s", comparatorBase, value_str(&inst->jmp), reg_names[inst->dst.reg], src_str(inst));
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->dst, 0)); instCounter[0]++;
  emit_str("/*%d*/\t",instCounter[0]);emit_line(mFakeParameterInst(&inst->src, 1)); instCounter[0]++;
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->jmp, 2)); instCounter[0]++;
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst(comparatorBase)); instCounter[0]++;
  emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("CJMP")); instCounter[0]++;
}
static void fp_emit_inst(Inst* inst, int* instCounter) {
  switch (inst->op) {
  case MOV:
    emit_line("// MOV %s, %s", reg_names[inst->dst.reg], src_str(inst));
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->src, 0)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeResultInst(&inst->dst)); instCounter[0]++;
    break;

  case ADD:
    emit_line("// ADD %s, %s", reg_names[inst->dst.reg], src_str(inst));
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->dst, 0)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->src, 1)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("ADD")); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeResultInst(&inst->dst)); instCounter[0]++;
    break;

  case SUB:
    emit_line("// SUB %s, %s", reg_names[inst->dst.reg], src_str(inst));
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->dst, 0)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->src, 1)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("SUB")); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeResultInst(&inst->dst)); instCounter[0]++;
    break;

  case LOAD:
    emit_line("// LOAD %s, %s", reg_names[inst->dst.reg], src_str(inst));
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->src, 1)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("LOAD")); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeResultInst(&inst->dst)); instCounter[0]++;
    break;

  case STORE:
    // Reverse src and dst to be consistent with the documentation
    emit_line("// STORE %s, %s", reg_names[inst->dst.reg], src_str(inst));
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->dst, 0)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->src, 1)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("STORE")); instCounter[0]++;
    break;

  case PUTC:
    emit_line("// PUTC %s", src_str(inst));
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->src, 0)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("PUTC")); instCounter[0]++;
    break;

  case GETC:
    emit_line("// GETC %s", reg_names[inst->dst.reg]);
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("GETC")); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeResultInst(&inst->dst)); instCounter[0]++;
    break;

  case EXIT:
    emit_line("// EXIT");
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("EXIT")); instCounter[0]++;
    break;

  case DUMP:
    emit_line("// DUMP");
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("DUMP")); instCounter[0]++;
    break;

  case JMP:
    emit_line("// JMP %s", value_str(&inst->jmp));
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterInst(&inst->jmp, 2)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeParameterConstantInst("1", 0)); instCounter[0]++;
    emit_str("/*%d*/\t",instCounter[0]);emit_line(makeOperationInst("CJMP")); instCounter[0]++;
    break;

  case EQ:
    fp_emit_comparator(inst, instCounter, "EQ");
    break;
  case NE:
    fp_emit_comparator(inst, instCounter, "NE");
    break;
  case LT:
    fp_emit_comparator(inst, instCounter, "LT");
    break;
  case GT:
    fp_emit_comparator(inst, instCounter, "GT");
    break;
  case LE:
    fp_emit_comparator(inst, instCounter, "LE");
    break;
  case GE:
    fp_emit_comparator(inst, instCounter, "GE");
    break;

  case JEQ:
    fp_emit_jump_comparator(inst, instCounter, "EQ");
    break;
  case JNE:
    fp_emit_jump_comparator(inst, instCounter, "NE");
    break;
  case JLT:
    fp_emit_jump_comparator(inst, instCounter, "LT");
    break;
  case JGT:
    fp_emit_jump_comparator(inst, instCounter, "GT");
    break;
  case JLE:
    fp_emit_jump_comparator(inst, instCounter, "LE");
    break;
  case JGE:
    fp_emit_jump_comparator(inst, instCounter, "GE");
    break;

  default:
    error("oops");
  }
}

void target_js(Module* module) {
  emit_line("{");
  emit_line("data:[");
  int mp = 0;
  for (Data* data = module->data; data; data = data->next, mp++) {
    if (data->v) {
      emit_str("%d,", data->v);
    }
  }

  emit_line("],");
  // emit_line("dispatch:[");

  int total_pc = -1;
  for (Inst* inst = module->text; inst; inst = inst->next) {
    if (total_pc != inst->pc) {
      total_pc = inst->pc;
    }
  }
  total_pc++;
  int* dispatchTable = calloc(total_pc, sizeof(int));

  // emit_line("],");
  emit_line("pgm:[");

  int instCounter = 0;
  int last_pc = -1;
  for (Inst* inst = module->text; inst; inst = inst->next) {
    if (last_pc != inst->pc) {
      emit_line("/// PC: %d", inst->pc);
      dispatchTable[inst->pc] = instCounter;
      last_pc = inst->pc;
    }
    // emit_str("%d: ", cmd_index);
    fp_emit_inst(inst, &instCounter);
  }

  emit_line("],");
  emit_line("dispatch:[");

  for(int i = 0; i < total_pc; i++){
    emit_str(format("%d,", dispatchTable[i]));
  }
  emit_line("],");

  emit_line("}");

}
