// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===
var __ZTVN10__cxxabiv117__class_type_infoE = 12696;
var __ZTVN10__cxxabiv120__si_class_type_infoE = 12736;




STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(13563);
/* global initializers */ __ATINIT__.push({ func: function() { __GLOBAL__I_a() } });


/* memory initializer */ allocate([2,0,0,0,4,0,0,0,205,204,204,204,204,204,236,63,154,153,153,153,153,153,185,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,3,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,200,49,0,0,208,3,0,0,192,10,0,0,0,0,0,0,0,0,0,0,88,4,0,0,3,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,200,49,0,0,64,4,0,0,192,10,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,0,0,0,0,240,4,0,0,5,0,0,0,6,0,0,0,3,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,8,0,0,0,9,0,0,0,6,0,0,0,10,0,0,0,11,0,0,0,5,0,0,0,7,0,0,0,6,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,200,49,0,0,208,4,0,0,128,10,0,0,0,0,0,0,0,0,0,0,88,5,0,0,7,0,0,0,8,0,0,0,4,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,12,0,0,0,9,0,0,0,6,0,0,0,13,0,0,0,14,0,0,0,7,0,0,0,8,0,0,0,8,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,200,49,0,0,64,5,0,0,128,10,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,160,49,0,0,104,5,0,0,0,0,0,0,208,5,0,0,9,0,0,0,10,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,56,6,0,0,11,0,0,0,12,0,0,0,16,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,200,49,0,0,192,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,6,0,0,9,0,0,0,13,0,0,0,15,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,200,49,0,0,248,5,0,0,208,5,0,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,200,49,0,0,32,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,6,0,0,11,0,0,0,14,0,0,0,16,0,0,0,0,0,0,0,83,116,49,52,111,118,101,114,102,108,111,119,95,101,114,114,111,114,0,0,0,0,0,0,200,49,0,0,96,6,0,0,56,6,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,7,0,0,0,11,0,0,0,13,0,0,0,17,0,0,0,19,0,0,0,23,0,0,0,29,0,0,0,31,0,0,0,37,0,0,0,41,0,0,0,43,0,0,0,47,0,0,0,53,0,0,0,59,0,0,0,61,0,0,0,67,0,0,0,71,0,0,0,73,0,0,0,79,0,0,0,83,0,0,0,89,0,0,0,97,0,0,0,101,0,0,0,103,0,0,0,107,0,0,0,109,0,0,0,113,0,0,0,127,0,0,0,131,0,0,0,137,0,0,0,139,0,0,0,149,0,0,0,151,0,0,0,157,0,0,0,163,0,0,0,167,0,0,0,173,0,0,0,179,0,0,0,181,0,0,0,191,0,0,0,193,0,0,0,197,0,0,0,199,0,0,0,211,0,0,0,1,0,0,0,11,0,0,0,13,0,0,0,17,0,0,0,19,0,0,0,23,0,0,0,29,0,0,0,31,0,0,0,37,0,0,0,41,0,0,0,43,0,0,0,47,0,0,0,53,0,0,0,59,0,0,0,61,0,0,0,67,0,0,0,71,0,0,0,73,0,0,0,79,0,0,0,83,0,0,0,89,0,0,0,97,0,0,0,101,0,0,0,103,0,0,0,107,0,0,0,109,0,0,0,113,0,0,0,121,0,0,0,127,0,0,0,131,0,0,0,137,0,0,0,139,0,0,0,143,0,0,0,149,0,0,0,151,0,0,0,157,0,0,0,163,0,0,0,167,0,0,0,169,0,0,0,173,0,0,0,179,0,0,0,181,0,0,0,187,0,0,0,191,0,0,0,193,0,0,0,197,0,0,0,199,0,0,0,209,0,0,0,95,95,110,101,120,116,95,112,114,105,109,101,32,111,118,101,114,102,108,111,119,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,0,0,0,0,128,10,0,0,15,0,0,0,16,0,0,0,5,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,12,0,0,0,9,0,0,0,6,0,0,0,10,0,0,0,11,0,0,0,5,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,192,10,0,0,17,0,0,0,18,0,0,0,6,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,248,10,0,0,19,0,0,0,20,0,0,0,248,255,255,255,248,255,255,255,248,10,0,0,21,0,0,0,22,0,0,0,8,0,0,0,0,0,0,0,64,11,0,0,23,0,0,0,24,0,0,0,248,255,255,255,248,255,255,255,64,11,0,0,25,0,0,0,26,0,0,0,4,0,0,0,0,0,0,0,136,11,0,0,27,0,0,0,28,0,0,0,252,255,255,255,252,255,255,255,136,11,0,0,29,0,0,0,30,0,0,0,4,0,0,0,0,0,0,0,208,11,0,0,31,0,0,0,32,0,0,0,252,255,255,255,252,255,255,255,208,11,0,0,33,0,0,0,34,0,0,0,0,0,0,0,192,9,0,0,35,0,0,0,36,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,160,49,0,0,168,9,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,200,49,0,0,200,9,0,0,192,9,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,200,49,0,0,8,10,0,0,192,9,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,160,49,0,0,72,10,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,160,49,0,0,136,10,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,40,50,0,0,200,10,0,0,0,0,0,0,1,0,0,0,248,9,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,40,50,0,0,16,11,0,0,0,0,0,0,1,0,0,0,56,10,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,40,50,0,0,88,11,0,0,0,0,0,0,1,0,0,0,248,9,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,40,50,0,0,160,11,0,0,0,0,0,0,1,0,0,0,56,10,0,0,3,244,255,255,0,0,0,0,200,25,0,0,37,0,0,0,38,0,0,0,39,0,0,0,1,0,0,0,3,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,25,0,0,40,0,0,0,41,0,0,0,39,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,30,0,0,42,0,0,0,43,0,0,0,39,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,56,31,0,0,44,0,0,0,45,0,0,0,39,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,31,0,0,46,0,0,0,47,0,0,0,39,0,0,0,3,0,0,0,4,0,0,0,23,0,0,0,5,0,0,0,24,0,0,0,1,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,32,0,0,48,0,0,0,49,0,0,0,39,0,0,0,7,0,0,0,8,0,0,0,25,0,0,0,9,0,0,0,26,0,0,0,3,0,0,0,4,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,184,27,0,0,50,0,0,0,51,0,0,0,39,0,0,0,17,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,1,0,0,0,248,255,255,255,184,27,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,37,109,47,37,100,47,37,121,37,89,45,37,109,45,37,100,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,72,58,37,77,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,88,28,0,0,52,0,0,0,53,0,0,0,39,0,0,0,25,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,2,0,0,0,248,255,255,255,88,28,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,232,28,0,0,54,0,0,0,55,0,0,0,39,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,29,0,0,56,0,0,0,57,0,0,0,39,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,26,0,0,58,0,0,0,59,0,0,0,39,0,0,0,33,0,0,0,34,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,35,0,0,0,11,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,26,0,0,60,0,0,0,61,0,0,0,39,0,0,0,36,0,0,0,37,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,38,0,0,0,17,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,26,0,0,62,0,0,0,63,0,0,0,39,0,0,0,39,0,0,0,40,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,41,0,0,0,23,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27,0,0,64,0,0,0,65,0,0,0,39,0,0,0,42,0,0,0,43,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,44,0,0,0,29,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,33,0,0,66,0,0,0,67,0,0,0,39,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,76,102,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,0,0,0,0,176,33,0,0,68,0,0,0,69,0,0,0,39,0,0,0,5,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,0,0,0,0,64,34,0,0,70,0,0,0,71,0,0,0,39,0,0,0,1,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,46,48,76,102,0,0,0,0,0,0,0,208,34,0,0,72,0,0,0,73,0,0,0,39,0,0,0,2,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,29,0,0,74,0,0,0,75,0,0,0,39,0,0,0,11,0,0,0,11,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,29,0,0,76,0,0,0,77,0,0,0,39,0,0,0,12,0,0,0,12,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,25,0,0,78,0,0,0,79,0,0,0,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,22,0,0,80,0,0,0,81,0,0,0,39,0,0,0,9,0,0,0,13,0,0,0,10,0,0,0,14,0,0,0,11,0,0,0,1,0,0,0,15,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,23,0,0,82,0,0,0,83,0,0,0,39,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,45,0,0,0,46,0,0,0,5,0,0,0,47,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,25,0,0,84,0,0,0,85,0,0,0,39,0,0,0,48,0,0,0,49,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,0,0,0,0,120,25,0,0,86,0,0,0,87,0,0,0,39,0,0,0,50,0,0,0,51,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,0,0,0,176,21,0,0,88,0,0,0,89,0,0,0,39,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,200,49,0,0,152,21,0,0,136,5,0,0,0,0,0,0,0,0,0,0,64,22,0,0,88,0,0,0,90,0,0,0,39,0,0,0,16,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,12,0,0,0,17,0,0,0,13,0,0,0,18,0,0,0,14,0,0,0,5,0,0,0,19,0,0,0,6,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,160,49,0,0,32,22,0,0,40,50,0,0,8,22,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,56,22,0,0,2,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,40,50,0,0,96,22,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,56,22,0,0,2,0,0,0,0,0,0,0,16,23,0,0,88,0,0,0,91,0,0,0,39,0,0,0,3,0,0,0,4,0,0,0,7,0,0,0,52,0,0,0,53,0,0,0,8,0,0,0,54,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,160,49,0,0,240,22,0,0,40,50,0,0,200,22,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,8,23,0,0,2,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,40,50,0,0,48,23,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,8,23,0,0,2,0,0,0,0,0,0,0,208,23,0,0,88,0,0,0,92,0,0,0,39,0,0,0,5,0,0,0,6,0,0,0,9,0,0,0,55,0,0,0,56,0,0,0,10,0,0,0,57,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,40,50,0,0,168,23,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,8,23,0,0,2,0,0,0,0,0,0,0,72,24,0,0,88,0,0,0,93,0,0,0,39,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,58,0,0,0,59,0,0,0,12,0,0,0,60,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,40,50,0,0,32,24,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,8,23,0,0,2,0,0,0,0,0,0,0,192,24,0,0,88,0,0,0,94,0,0,0,39,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,58,0,0,0,59,0,0,0,12,0,0,0,60,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,200,49,0,0,152,24,0,0,72,24,0,0,0,0,0,0,0,0,0,0,40,25,0,0,88,0,0,0,95,0,0,0,39,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,58,0,0,0,59,0,0,0,12,0,0,0,60,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,200,49,0,0,0,25,0,0,72,24,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,200,49,0,0,56,25,0,0,176,21,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,200,49,0,0,96,25,0,0,176,21,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,200,49,0,0,136,25,0,0,176,21,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,200,49,0,0,176,25,0,0,176,21,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,200,49,0,0,216,25,0,0,176,21,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,160,49,0,0,32,26,0,0,40,50,0,0,0,26,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,56,26,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,40,50,0,0,96,26,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,56,26,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,40,50,0,0,160,26,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,56,26,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,40,50,0,0,224,26,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,56,26,0,0,2,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,160,49,0,0,104,27,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,160,49,0,0,136,27,0,0,40,50,0,0,32,27,0,0,0,0,0,0,3,0,0,0,176,21,0,0,2,0,0,0,128,27,0,0,2,0,0,0,176,27,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,160,49,0,0,40,28,0,0,40,50,0,0,224,27,0,0,0,0,0,0,3,0,0,0,176,21,0,0,2,0,0,0,128,27,0,0,2,0,0,0,80,28,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,160,49,0,0,200,28,0,0,40,50,0,0,128,28,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,224,28,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,40,50,0,0,8,29,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,224,28,0,0,0,8,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,160,49,0,0,136,29,0,0,40,50,0,0,112,29,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,160,29,0,0,2,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,40,50,0,0,200,29,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,160,29,0,0,2,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,160,49,0,0,96,30,0,0,40,50,0,0,72,30,0,0,0,0,0,0,1,0,0,0,128,30,0,0,0,0,0,0,40,50,0,0,0,30,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,136,30,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,40,50,0,0,8,31,0,0,0,0,0,0,1,0,0,0,128,30,0,0,0,0,0,0,40,50,0,0,192,30,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,32,31,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,160,49,0,0,184,31,0,0,40,50,0,0,160,31,0,0,0,0,0,0,1,0,0,0,216,31,0,0,0,0,0,0,40,50,0,0,88,31,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,224,31,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,40,50,0,0,96,32,0,0,0,0,0,0,1,0,0,0,216,31,0,0,0,0,0,0,40,50,0,0,24,32,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,120,32,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,160,49,0,0,248,32,0,0,40,50,0,0,176,32,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,24,33,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,160,49,0,0,136,33,0,0,40,50,0,0,64,33,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,168,33,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,160,49,0,0,24,34,0,0,40,50,0,0,208,33,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,56,34,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,160,49,0,0,168,34,0,0,40,50,0,0,96,34,0,0,0,0,0,0,2,0,0,0,176,21,0,0,2,0,0,0,200,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,77], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,77,97,114,99,104,0,0,0,65,112,114,105,108,0,0,0,77,97,121,0,0,0,0,0,74,117,110,101,0,0,0,0,74,117,108,121,0,0,0,0,65,117,103,117,115,116,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,74,97,110,0,0,0,0,0,70,101,98,0,0,0,0,0,77,97,114,0,0,0,0,0,65,112,114,0,0,0,0,0,74,117,110,0,0,0,0,0,74,117,108,0,0,0,0,0,65,117,103,0,0,0,0,0,83,101,112,0,0,0,0,0,79,99,116,0,0,0,0,0,78,111,118,0,0,0,0,0,68,101,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,117,110,100,97,121,0,0,77,111,110,100,97,121,0,0,84,117,101,115,100,97,121,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,83,117,110,0,0,0,0,0,77,111,110,0,0,0,0,0,84,117,101,0,0,0,0,0,87,101,100,0,0,0,0,0,84,104,117,0,0,0,0,0,70,114,105,0,0,0,0,0,83,97,116,0,0,0,0,0,67,0,0,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,49,0,0,96,0,0,0,97,0,0,0,61,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,160,49,0,0,240,48,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,200,49,0,0,8,49,0,0,0,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,200,49,0,0,40,49,0,0,0,49,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,200,49,0,0,96,49,0,0,80,49,0,0,0,0,0,0,0,0,0,0,136,49,0,0,98,0,0,0,99,0,0,0,100,0,0,0,101,0,0,0,20,0,0,0,13,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,16,50,0,0,98,0,0,0,102,0,0,0,100,0,0,0,101,0,0,0,20,0,0,0,14,0,0,0,2,0,0,0,6,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,200,49,0,0,232,49,0,0,136,49,0,0,0,0,0,0,0,0,0,0,112,50,0,0,98,0,0,0,103,0,0,0,100,0,0,0,101,0,0,0,20,0,0,0,15,0,0,0,3,0,0,0,7,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,200,49,0,0,72,50,0,0,136,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,52,0,0,104,0,0,0,105,0,0,0,62,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,200,49,0,0,160,52,0,0,0,0,0,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,110,97,110,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10344);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }
  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }

  
  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
                if (next === 0) return i > 0 ? fields : fields-1; // we failed to read the full length of this field
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }



  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

   
  Module["_memset"] = _memset;

  function _pthread_mutex_lock() {}

  
  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  function _abort() {
      Module['abort']();
    }

   
  Module["_i64Subtract"] = _i64Subtract;



  
  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
  
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
  
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
  
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }function _strtoull_l(str, endptr, base) {
      return _strtoull(str, endptr, base); // no locale support yet
    }

  function _pthread_cond_wait() {
      return 0;
    }

  
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }function _isdigit_l(chr) {
      return _isdigit(chr); // no locale support yet
    }

   
  Module["_i64Add"] = _i64Add;

  var _fabs=Math_abs;

  
  
  function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }

  
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }function _strtoll_l(str, endptr, base) {
      return _strtoll(str, endptr, base); // no locale support yet
    }

  var _getc=_fgetc;

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i];
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  
  function _free() {
  }
  Module["_free"] = _free;function _freelocale(locale) {
      _free(locale);
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }


  
  function _fmod(x, y) {
      return x % y;
    }var _fmodl=_fmod;

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  var _ceilf=Math_ceil;

  function _catopen(name, oflag) {
      // nl_catd catopen (const char *name, int oflag)
      return -1;
    }

  function _catgets(catd, set_id, msg_id, s) {
      // char *catgets (nl_catd catd, int set_id, int msg_id, const char *s)
      return s;
    }

  
  
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }

  var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC); 
  Module["_llvm_ctlz_i32"] = _llvm_ctlz_i32;

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }

  function _pthread_cond_broadcast() {
      return 0;
    }

  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function ___cxa_guard_release() {}

  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

  
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }function _isxdigit_l(chr) {
      return _isxdigit(chr); // no locale support yet
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function __ZNSt9exceptionD2Ev() {}

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

   
  Module["_bitshift64Shl"] = _bitshift64Shl;

  function _newlocale(mask, locale, base) {
      return _malloc(4);
    }

   
  Module["_memmove"] = _memmove;

  function ___errno_location() {
      return ___errno_state;
    }

  var _BItoD=true;

  function _catclose(catd) {
      // int catclose (nl_catd catd)
      return 0;
    }

  function _pthread_mutex_unlock() {}


  var _copysignl=_copysign;

  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }

  function _uselocale(locale) {
      return 0;
    }

  var __ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);



_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.__ZTISt9exception|0;var p=env._stderr|0;var q=env._stdin|0;var r=env._stdout|0;var s=0;var t=0;var u=0;var v=0;var w=+env.NaN,x=+env.Infinity;var y=0,z=0,A=0,B=0,C=0.0,D=0,E=0,F=0,G=0.0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=global.Math.floor;var S=global.Math.abs;var T=global.Math.sqrt;var U=global.Math.pow;var V=global.Math.cos;var W=global.Math.sin;var X=global.Math.tan;var Y=global.Math.acos;var Z=global.Math.asin;var _=global.Math.atan;var $=global.Math.atan2;var aa=global.Math.exp;var ba=global.Math.log;var ca=global.Math.ceil;var da=global.Math.imul;var ea=env.abort;var fa=env.assert;var ga=env.asmPrintInt;var ha=env.asmPrintFloat;var ia=env.min;var ja=env.invoke_iiii;var ka=env.invoke_viiiiiii;var la=env.invoke_viiiii;var ma=env.invoke_vi;var na=env.invoke_vii;var oa=env.invoke_viiiiiiiii;var pa=env.invoke_ii;var qa=env.invoke_viiiiiid;var ra=env.invoke_viii;var sa=env.invoke_viiiiid;var ta=env.invoke_v;var ua=env.invoke_iiiiiiiii;var va=env.invoke_iiiii;var wa=env.invoke_viiiiiiii;var xa=env.invoke_viiiiii;var ya=env.invoke_iii;var za=env.invoke_iiiiii;var Aa=env.invoke_viiii;var Ba=env._fabs;var Ca=env._pthread_cond_wait;var Da=env._send;var Ea=env._strtoll_l;var Fa=env._vsscanf;var Ga=env.___ctype_b_loc;var Ha=env.__ZSt9terminatev;var Ia=env._fmod;var Ja=env.___cxa_guard_acquire;var Ka=env._sscanf;var La=env.___cxa_is_number_type;var Ma=env._ungetc;var Na=env.__getFloat;var Oa=env.___cxa_allocate_exception;var Pa=env.__ZSt18uncaught_exceptionv;var Qa=env._ceilf;var Ra=env._isxdigit_l;var Sa=env._strtoll;var Ta=env._fflush;var Ua=env.___cxa_guard_release;var Va=env.__addDays;var Wa=env._pwrite;var Xa=env._strftime_l;var Ya=env.__scanString;var Za=env.___setErrNo;var _a=env._sbrk;var $a=env._uselocale;var ab=env._catgets;var bb=env._newlocale;var cb=env._snprintf;var db=env.___cxa_begin_catch;var eb=env._emscripten_memcpy_big;var fb=env._fileno;var gb=env._pread;var hb=env.___resumeException;var ib=env.___cxa_find_matching_catch;var jb=env._freelocale;var kb=env._strtoull;var lb=env._strftime;var mb=env._strtoull_l;var nb=env.__arraySum;var ob=env.___ctype_tolower_loc;var pb=env._isdigit_l;var qb=env._asprintf;var rb=env._pthread_mutex_unlock;var sb=env._fread;var tb=env._isxdigit;var ub=env.___ctype_toupper_loc;var vb=env._pthread_mutex_lock;var wb=env.__reallyNegative;var xb=env._vasprintf;var yb=env.__ZNSt9exceptionD2Ev;var zb=env._write;var Ab=env.__isLeapYear;var Bb=env.___errno_location;var Cb=env._recv;var Db=env._vsnprintf;var Eb=env.__exit;var Fb=env._copysign;var Gb=env._fgetc;var Hb=env._mkport;var Ib=env.___cxa_does_inherit;var Jb=env._sysconf;var Kb=env._pthread_cond_broadcast;var Lb=env.__parseInt64;var Mb=env._abort;var Nb=env._catclose;var Ob=env._fwrite;var Pb=env.___cxa_throw;var Qb=env._isdigit;var Rb=env._sprintf;var Sb=env.__formatString;var Tb=env._isspace;var Ub=env._catopen;var Vb=env._exit;var Wb=env._time;var Xb=env._read;var Yb=0.0;
// EMSCRIPTEN_START_FUNCS
function pc(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function qc(){return i|0}function rc(a){a=a|0;i=a}function sc(a,b){a=a|0;b=b|0;if((s|0)==0){s=a;t=b}}function tc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function uc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function vc(a){a=a|0;H=a}function wc(a){a=a|0;I=a}function xc(a){a=a|0;J=a}function yc(a){a=a|0;K=a}function zc(a){a=a|0;L=a}function Ac(a){a=a|0;M=a}function Bc(a){a=a|0;N=a}function Cc(a){a=a|0;O=a}function Dc(a){a=a|0;P=a}function Ec(a){a=a|0;Q=a}function Fc(d,e,f,g,h,j,k,l,m,n,o,p,q,r,s,t,u){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;t=t|0;u=u|0;var v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0.0;v=i;i=i+80|0;z=v+32|0;A=v+72|0;x=v;y=v+40|0;C=y+0|0;B=C+26|0;do{b[C>>1]=0;C=C+2|0}while((C|0)<(B|0));b[y>>1]=d;b[y+2>>1]=e;b[y+4>>1]=f;b[y+6>>1]=g;b[y+8>>1]=h;b[y+10>>1]=j;b[y+12>>1]=k;b[y+14>>1]=l;b[y+16>>1]=m;b[y+18>>1]=n;b[y+20>>1]=o;b[y+22>>1]=p;b[y+24>>1]=q;b[y+26>>1]=r;b[y+28>>1]=s;b[y+30>>1]=t;l=(u<<1)+ -1|0;C=x+0|0;F=y+0|0;B=C+32|0;do{b[C>>1]=b[F>>1]|0;C=C+2|0;F=F+2|0}while((C|0)<(B|0));n=x;m=c[n+4>>2]|0;j=z;c[j>>2]=c[n>>2];c[j+4>>2]=m;Jc(z);j=z;m=c[j+4>>2]|0;n=x;c[n>>2]=c[j>>2];c[n+4>>2]=m;n=x+8|0;m=n;j=c[m+4>>2]|0;C=z;c[C>>2]=c[m>>2];c[C+4>>2]=j;Jc(z);C=z;j=c[C+4>>2]|0;m=n;c[m>>2]=c[C>>2];c[m+4>>2]=j;m=x+16|0;j=m;C=c[j+4>>2]|0;k=z;c[k>>2]=c[j>>2];c[k+4>>2]=C;Jc(z);k=z;C=c[k+4>>2]|0;j=m;c[j>>2]=c[k>>2];c[j+4>>2]=C;j=x+24|0;C=j;k=c[C+4>>2]|0;B=z;c[B>>2]=c[C>>2];c[B+4>>2]=k;Jc(z);B=z;k=c[B+4>>2]|0;C=j;c[C>>2]=c[B>>2];c[C+4>>2]=k;d=d&255;C=31;k=d;B=x;u=y;while(1){if(!((a[B]|0)==k<<24>>24)){w=5;break}u=u+1|0;if((C|0)==0){D=-1;E=0.0;break}C=C+ -1|0;k=a[u]|0;B=B+1|0}if((w|0)==5){E=+Gc(x,l);if(!(E>=0.0)){D=-1;E=0.0}else{D=0}}C=x+0|0;F=y+0|0;B=C+32|0;do{b[C>>1]=b[F>>1]|0;C=C+2|0;F=F+2|0}while((C|0)<(B|0));b[z>>1]=b[j>>1]|0;C=z+2|0;b[C>>1]=b[m>>1]|0;B=z+4|0;b[B>>1]=b[n>>1]|0;F=z+6|0;b[F>>1]=b[x>>1]|0;Jc(z);b[j>>1]=b[z>>1]|0;b[m>>1]=b[C>>1]|0;b[n>>1]=b[B>>1]|0;b[x>>1]=b[F>>1]|0;t=x+26|0;b[z>>1]=b[t>>1]|0;p=x+18|0;b[C>>1]=b[p>>1]|0;e=x+10|0;b[B>>1]=b[e>>1]|0;f=x+2|0;b[F>>1]=b[f>>1]|0;Jc(z);b[t>>1]=b[z>>1]|0;b[p>>1]=b[C>>1]|0;b[e>>1]=b[B>>1]|0;b[f>>1]=b[F>>1]|0;s=x+28|0;b[z>>1]=b[s>>1]|0;k=x+20|0;b[C>>1]=b[k>>1]|0;h=x+12|0;b[B>>1]=b[h>>1]|0;r=x+4|0;b[F>>1]=b[r>>1]|0;Jc(z);b[s>>1]=b[z>>1]|0;b[k>>1]=b[C>>1]|0;b[h>>1]=b[B>>1]|0;b[r>>1]=b[F>>1]|0;q=x+30|0;b[z>>1]=b[q>>1]|0;u=x+22|0;b[C>>1]=b[u>>1]|0;g=x+14|0;b[B>>1]=b[g>>1]|0;o=x+6|0;b[F>>1]=b[o>>1]|0;Jc(z);b[q>>1]=b[z>>1]|0;b[u>>1]=b[C>>1]|0;b[g>>1]=b[B>>1]|0;b[o>>1]=b[F>>1]|0;F=31;B=d;C=x;G=y;while(1){if(!((a[C]|0)==B<<24>>24)){w=11;break}G=G+1|0;if((F|0)==0){break}F=F+ -1|0;B=a[G]|0;C=C+1|0}if((w|0)==11){H=+Gc(x,l);if(H>=E){D=1;E=H}}C=x+0|0;F=y+0|0;B=C+32|0;do{b[C>>1]=b[F>>1]|0;C=C+2|0;F=F+2|0}while((C|0)<(B|0));F=A+2|0;B=A+4|0;C=A+6|0;b[A>>1]=b[o>>1]|0;b[F>>1]=b[r>>1]|0;b[B>>1]=b[f>>1]|0;b[C>>1]=b[x>>1]|0;Jc(A);b[o>>1]=b[A>>1]|0;b[r>>1]=b[F>>1]|0;b[f>>1]=b[B>>1]|0;b[x>>1]=b[C>>1]|0;b[A>>1]=b[g>>1]|0;b[F>>1]=b[h>>1]|0;b[B>>1]=b[e>>1]|0;b[C>>1]=b[n>>1]|0;Jc(A);b[g>>1]=b[A>>1]|0;b[h>>1]=b[F>>1]|0;b[e>>1]=b[B>>1]|0;b[n>>1]=b[C>>1]|0;b[A>>1]=b[u>>1]|0;b[F>>1]=b[k>>1]|0;b[B>>1]=b[p>>1]|0;b[C>>1]=b[m>>1]|0;Jc(A);b[u>>1]=b[A>>1]|0;b[k>>1]=b[F>>1]|0;b[p>>1]=b[B>>1]|0;b[m>>1]=b[C>>1]|0;b[A>>1]=b[q>>1]|0;b[F>>1]=b[s>>1]|0;b[B>>1]=b[t>>1]|0;b[C>>1]=b[j>>1]|0;Jc(A);b[q>>1]=b[A>>1]|0;b[s>>1]=b[F>>1]|0;b[t>>1]=b[B>>1]|0;b[j>>1]=b[C>>1]|0;A=31;C=d;B=x;F=y;while(1){if(!((a[B]|0)==C<<24>>24)){w=17;break}F=F+1|0;if((A|0)==0){break}A=A+ -1|0;C=a[F]|0;B=B+1|0}if((w|0)==17){H=+Gc(x,l);if(H>=E){D=2;E=H}}C=x+0|0;F=y+0|0;B=C+32|0;do{b[C>>1]=b[F>>1]|0;C=C+2|0;F=F+2|0}while((C|0)<(B|0));b[z>>1]=b[x>>1]|0;F=z+2|0;b[F>>1]=b[n>>1]|0;G=z+4|0;b[G>>1]=b[m>>1]|0;A=z+6|0;b[A>>1]=b[j>>1]|0;Jc(z);b[x>>1]=b[z>>1]|0;b[n>>1]=b[F>>1]|0;b[m>>1]=b[G>>1]|0;b[j>>1]=b[A>>1]|0;b[z>>1]=b[f>>1]|0;b[F>>1]=b[e>>1]|0;b[G>>1]=b[p>>1]|0;b[A>>1]=b[t>>1]|0;Jc(z);b[f>>1]=b[z>>1]|0;b[e>>1]=b[F>>1]|0;b[p>>1]=b[G>>1]|0;b[t>>1]=b[A>>1]|0;b[z>>1]=b[r>>1]|0;b[F>>1]=b[h>>1]|0;b[G>>1]=b[k>>1]|0;b[A>>1]=b[s>>1]|0;Jc(z);b[r>>1]=b[z>>1]|0;b[h>>1]=b[F>>1]|0;b[k>>1]=b[G>>1]|0;b[s>>1]=b[A>>1]|0;b[z>>1]=b[o>>1]|0;b[F>>1]=b[g>>1]|0;b[G>>1]=b[u>>1]|0;b[A>>1]=b[q>>1]|0;Jc(z);b[o>>1]=b[z>>1]|0;b[g>>1]=b[F>>1]|0;b[u>>1]=b[G>>1]|0;b[q>>1]=b[A>>1]|0;z=31;A=x;while(1){if(!((a[A]|0)==d<<24>>24)){break}y=y+1|0;if((z|0)==0){w=25;break}z=z+ -1|0;d=a[y]|0;A=A+1|0}if((w|0)==25){i=v;return D|0}if(!(+Gc(x,l)>=E)){G=D;i=v;return G|0}G=3;i=v;return G|0}function Gc(d,f){d=d|0;f=f|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0.0,ma=0.0,na=0.0,oa=0,pa=0.0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0.0,Ca=0.0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0;j=i;i=i+112|0;r=j+32|0;q=j+96|0;s=j;m=j+40|0;k=j+44|0;n=j+64|0;l=k+16|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;g[l>>2]=1.0;p=(f|0)==1;ba=f+ -2|0;A=s+8|0;C=s+16|0;E=s+24|0;B=r+2|0;D=r+4|0;F=r+6|0;J=s+26|0;I=s+18|0;H=s+10|0;G=s+2|0;N=s+28|0;M=s+20|0;L=s+12|0;K=s+4|0;R=s+30|0;Q=s+22|0;P=s+14|0;O=s+6|0;T=q+2|0;U=q+4|0;V=q+6|0;Z=k+4|0;_=k+12|0;aa=k+8|0;fa=n+2|0;f=n+4|0;ea=n+6|0;$=n+8|0;Y=n+10|0;X=n+12|0;S=n+14|0;z=n+16|0;y=n+18|0;t=n+20|0;ga=n+22|0;u=n+24|0;v=n+26|0;w=n+28|0;x=n+30|0;la=0.0;ma=0.0;W=0;a:while(1){ha=W<<2;ia=0;while(1){ja=ia+ha|0;if((b[d+(ja<<1)>>1]|0)==0){ja=n+(ja<<1)|0;ka=0;while(1){ta=n+0|0;sa=d+0|0;ra=ta+32|0;do{b[ta>>1]=b[sa>>1]|0;ta=ta+2|0;sa=sa+2|0}while((ta|0)<(ra|0));b[ja>>1]=c[8+(ka<<2)>>2];b:do{if(p){oa=0;c:while(1){ra=oa<<2;ua=ra+4|0;qa=ra|1;if((oa|0)<3){ta=0;do{sa=b[n+(ta+ra<<1)>>1]|0;if(sa<<16>>16==0){break c}if(sa<<16>>16==(b[n+(ua+ta<<1)>>1]|0)){break c}if((ta|0)<3?sa<<16>>16==(b[n+(ta+qa<<1)>>1]|0):0){break c}ta=ta+1|0}while((ta|0)<4)}else{ta=0;do{sa=b[n+(ta+ra<<1)>>1]|0;if(sa<<16>>16==0){break c}if((ta|0)<3?sa<<16>>16==(b[n+(ta+qa<<1)>>1]|0):0){break c}ta=ta+1|0}while((ta|0)<4)}oa=oa+1|0;if((oa|0)>=4){na=0.0;break b}}va=e[n>>1]|0;Ga=e[fa>>1]|0;Ha=e[f>>1]|0;ua=e[ea>>1]|0;wa=e[$>>1]|0;Fa=e[Y>>1]|0;Ea=e[X>>1]|0;xa=e[S>>1]|0;ya=e[z>>1]|0;Da=e[y>>1]|0;ra=e[t>>1]|0;za=e[ga>>1]|0;Aa=e[u>>1]|0;sa=e[v>>1]|0;ta=e[w>>1]|0;qa=(e[x>>1]|0)*3|0;oa=ya-(Fa+wa+Ea+xa)+Da+ra+za+qa+((Aa-(Ga+va+Ha+ua)+sa+ta|0)*3|0)|0;qa=Ha-Ga-Fa+Ea-Da+ra-sa+ta+((ua-va-wa+xa-ya+za-Aa|0)*3|0)+qa|0;na=+(((oa|0)>-1?oa:0-oa|0)+((qa|0)>-1?qa:0-qa|0)|0)}else{na=0.0;oa=0;while(1){ta=s+0|0;sa=n+0|0;ra=ta+32|0;do{b[ta>>1]=b[sa>>1]|0;ta=ta+2|0;sa=sa+2|0}while((ta|0)<(ra|0));if((oa|0)==3){b[r>>1]=b[s>>1]|0;b[B>>1]=b[A>>1]|0;b[D>>1]=b[C>>1]|0;b[F>>1]=b[E>>1]|0;Jc(r);b[s>>1]=b[r>>1]|0;b[A>>1]=b[B>>1]|0;b[C>>1]=b[D>>1]|0;b[E>>1]=b[F>>1]|0;b[r>>1]=b[G>>1]|0;b[B>>1]=b[H>>1]|0;b[D>>1]=b[I>>1]|0;b[F>>1]=b[J>>1]|0;Jc(r);b[G>>1]=b[r>>1]|0;b[H>>1]=b[B>>1]|0;b[I>>1]=b[D>>1]|0;b[J>>1]=b[F>>1]|0;b[r>>1]=b[K>>1]|0;b[B>>1]=b[L>>1]|0;b[D>>1]=b[M>>1]|0;b[F>>1]=b[N>>1]|0;Jc(r);b[K>>1]=b[r>>1]|0;b[L>>1]=b[B>>1]|0;b[M>>1]=b[D>>1]|0;b[N>>1]=b[F>>1]|0;b[r>>1]=b[O>>1]|0;b[B>>1]=b[P>>1]|0;b[D>>1]=b[Q>>1]|0;b[F>>1]=b[R>>1]|0;Jc(r);b[O>>1]=b[r>>1]|0;b[P>>1]=b[B>>1]|0;b[Q>>1]=b[D>>1]|0;b[R>>1]=b[F>>1]|0;sa=32;ra=s;qa=n}else if((oa|0)==2){b[q>>1]=b[O>>1]|0;b[T>>1]=b[K>>1]|0;b[U>>1]=b[G>>1]|0;b[V>>1]=b[s>>1]|0;Jc(q);b[O>>1]=b[q>>1]|0;b[K>>1]=b[T>>1]|0;b[G>>1]=b[U>>1]|0;b[s>>1]=b[V>>1]|0;b[q>>1]=b[P>>1]|0;b[T>>1]=b[L>>1]|0;b[U>>1]=b[H>>1]|0;b[V>>1]=b[A>>1]|0;Jc(q);b[P>>1]=b[q>>1]|0;b[L>>1]=b[T>>1]|0;b[H>>1]=b[U>>1]|0;b[A>>1]=b[V>>1]|0;b[q>>1]=b[Q>>1]|0;b[T>>1]=b[M>>1]|0;b[U>>1]=b[I>>1]|0;b[V>>1]=b[C>>1]|0;Jc(q);b[Q>>1]=b[q>>1]|0;b[M>>1]=b[T>>1]|0;b[I>>1]=b[U>>1]|0;b[C>>1]=b[V>>1]|0;b[q>>1]=b[R>>1]|0;b[T>>1]=b[N>>1]|0;b[U>>1]=b[J>>1]|0;b[V>>1]=b[E>>1]|0;Jc(q);b[R>>1]=b[q>>1]|0;b[N>>1]=b[T>>1]|0;b[J>>1]=b[U>>1]|0;b[E>>1]=b[V>>1]|0;sa=32;ra=s;qa=n}else if((oa|0)==0){sa=s;ra=c[sa+4>>2]|0;qa=r;c[qa>>2]=c[sa>>2];c[qa+4>>2]=ra;Jc(r);qa=r;ra=c[qa+4>>2]|0;sa=s;c[sa>>2]=c[qa>>2];c[sa+4>>2]=ra;sa=A;ra=c[sa+4>>2]|0;qa=r;c[qa>>2]=c[sa>>2];c[qa+4>>2]=ra;Jc(r);qa=r;ra=c[qa+4>>2]|0;sa=A;c[sa>>2]=c[qa>>2];c[sa+4>>2]=ra;sa=C;ra=c[sa+4>>2]|0;qa=r;c[qa>>2]=c[sa>>2];c[qa+4>>2]=ra;Jc(r);qa=r;ra=c[qa+4>>2]|0;sa=C;c[sa>>2]=c[qa>>2];c[sa+4>>2]=ra;sa=E;ra=c[sa+4>>2]|0;qa=r;c[qa>>2]=c[sa>>2];c[qa+4>>2]=ra;Jc(r);qa=r;ra=c[qa+4>>2]|0;sa=E;c[sa>>2]=c[qa>>2];c[sa+4>>2]=ra;sa=32;ra=s;qa=n}else if((oa|0)==1){b[r>>1]=b[E>>1]|0;b[B>>1]=b[C>>1]|0;b[D>>1]=b[A>>1]|0;b[F>>1]=b[s>>1]|0;Jc(r);b[E>>1]=b[r>>1]|0;b[C>>1]=b[B>>1]|0;b[A>>1]=b[D>>1]|0;b[s>>1]=b[F>>1]|0;b[r>>1]=b[J>>1]|0;b[B>>1]=b[I>>1]|0;b[D>>1]=b[H>>1]|0;b[F>>1]=b[G>>1]|0;Jc(r);b[J>>1]=b[r>>1]|0;b[I>>1]=b[B>>1]|0;b[H>>1]=b[D>>1]|0;b[G>>1]=b[F>>1]|0;b[r>>1]=b[N>>1]|0;b[B>>1]=b[M>>1]|0;b[D>>1]=b[L>>1]|0;b[F>>1]=b[K>>1]|0;Jc(r);b[N>>1]=b[r>>1]|0;b[M>>1]=b[B>>1]|0;b[L>>1]=b[D>>1]|0;b[K>>1]=b[F>>1]|0;b[r>>1]=b[R>>1]|0;b[B>>1]=b[Q>>1]|0;b[D>>1]=b[P>>1]|0;b[F>>1]=b[O>>1]|0;Jc(r);b[R>>1]=b[r>>1]|0;b[Q>>1]=b[B>>1]|0;b[P>>1]=b[D>>1]|0;b[O>>1]=b[F>>1]|0;sa=32;ra=s;qa=n}else{sa=32;ra=s;qa=n}while(1){if((a[ra]|0)!=(a[qa]|0)){o=25;break}sa=sa+ -1|0;if((sa|0)==0){break}else{ra=ra+1|0;qa=qa+1|0}}if((o|0)==25){o=0;Ic(m,c[k>>2]|0,c[Z>>2]|0,s);qa=c[m>>2]|0;if((qa|0)==0){pa=+Gc(s,ba);Ic(r,c[k>>2]|0,c[Z>>2]|0,s);qa=c[r>>2]|0;d:do{if((qa|0)==0){while(1){qa=fk(48)|0;if((qa|0)!=0){break}qa=c[3356]|0;c[3356]=qa+0;if((qa|0)==0){o=31;break a}hc[qa&0]()}ua=qa+8|0;ta=ua+0|0;sa=s+0|0;ra=ta+32|0;do{b[ta>>1]=b[sa>>1]|0;ta=ta+2|0;sa=sa+2|0}while((ta|0)<(ra|0));h[qa+40>>3]=0.0;va=(da(e[ua>>1]|0,16777619)|0)^-2128831035;va=va^(da(e[qa+10>>1]|0,16777619)|0);va=va^(da(e[qa+12>>1]|0,16777619)|0);va=va^(da(e[qa+14>>1]|0,16777619)|0);va=va^(da(e[qa+16>>1]|0,16777619)|0);va=va^(da(e[qa+18>>1]|0,16777619)|0);va=va^(da(e[qa+20>>1]|0,16777619)|0);va=va^(da(e[qa+22>>1]|0,16777619)|0);va=va^(da(e[qa+24>>1]|0,16777619)|0);va=va^(da(e[qa+26>>1]|0,16777619)|0);va=va^(da(e[qa+28>>1]|0,16777619)|0);va=va^(da(e[qa+30>>1]|0,16777619)|0);va=va^(da(e[qa+32>>1]|0,16777619)|0);va=va^(da(e[qa+34>>1]|0,16777619)|0);va=va^(da(e[qa+36>>1]|0,16777619)|0);va=va^(da(e[qa+38>>1]|0,16777619)|0);ra=qa+4|0;c[ra>>2]=va;sa=c[Z>>2]|0;ta=(sa|0)==0;e:do{if(!ta){wa=sa+ -1|0;xa=(wa&sa|0)==0;if(xa){va=va&wa}else{va=(va>>>0)%(sa>>>0)|0}ya=c[(c[k>>2]|0)+(va<<2)>>2]|0;if((ya|0)!=0){if(xa){f:while(1){ya=c[ya>>2]|0;if((ya|0)==0){break e}if((c[ya+4>>2]&wa|0)!=(va|0)){break e}za=31;Aa=ya+8|0;xa=ua;while(1){if((a[Aa]|0)!=(a[xa]|0)){continue f}if((za|0)==0){qa=ya;break d}za=za+ -1|0;Aa=Aa+1|0;xa=xa+1|0}}}else{g:while(1){ya=c[ya>>2]|0;if((ya|0)==0){break e}if((((c[ya+4>>2]|0)>>>0)%(sa>>>0)|0|0)!=(va|0)){break e}wa=31;xa=ya+8|0;za=ua;while(1){if((a[xa]|0)!=(a[za]|0)){continue g}if((wa|0)==0){qa=ya;break d}wa=wa+ -1|0;xa=xa+1|0;za=za+1|0}}}}}else{va=0}}while(0);Ca=+(((c[_>>2]|0)+1|0)>>>0);Ba=+g[l>>2];do{if(Ca>+(sa>>>0)*Ba|ta){if(sa>>>0>2){ta=(sa+ -1&sa|0)==0}else{ta=0}ta=(ta&1|sa<<1)^1;ua=~~+ca(+(Ca/Ba))>>>0;ta=ta>>>0<ua>>>0?ua:ta;if((ta|0)!=1){if((ta+ -1&ta|0)!=0){ta=sd(ta)|0;sa=c[Z>>2]|0}}else{ta=2}if(!(ta>>>0>sa>>>0)){if(ta>>>0<sa>>>0){if(sa>>>0>2){va=(sa+ -1&sa|0)==0}else{va=0}ua=~~+ca(+(+((c[_>>2]|0)>>>0)/+g[l>>2]))>>>0;if(va){ua=1<<32-(uk(ua+ -1|0)|0)}else{ua=sd(ua)|0}ta=ta>>>0<ua>>>0?ua:ta;if(ta>>>0<sa>>>0){Hc(k,ta)}}}else{Hc(k,ta)}ta=c[Z>>2]|0;ua=c[ra>>2]|0;ra=ta+ -1|0;if((ra&ta|0)==0){sa=ta;va=ra&ua;break}else{sa=ta;va=(ua>>>0)%(ta>>>0)|0;break}}}while(0);ra=c[(c[k>>2]|0)+(va<<2)>>2]|0;if((ra|0)==0){c[qa>>2]=c[aa>>2];c[aa>>2]=qa;c[(c[k>>2]|0)+(va<<2)>>2]=aa;ra=c[qa>>2]|0;if((ra|0)!=0){ta=c[ra+4>>2]|0;ra=sa+ -1|0;if((ra&sa|0)==0){ra=ta&ra}else{ra=(ta>>>0)%(sa>>>0)|0}c[(c[k>>2]|0)+(ra<<2)>>2]=qa}}else{c[qa>>2]=c[ra>>2];c[ra>>2]=qa}c[_>>2]=(c[_>>2]|0)+1}}while(0);h[qa+40>>3]=pa}else{pa=+h[qa+40>>3]}if(pa>na){na=pa}}oa=oa+1|0;if((oa|0)>=4){break}}}}while(0);Ca=+h[16+(ka<<3)>>3];la=la+na*Ca;ma=ma+Ca;ka=ka+1|0;if((ka|0)>=2){break}}}ia=ia+1|0;if((ia|0)>=4){break}}W=W+1|0;if((W|0)>=4){break}}if((o|0)==31){Ha=Oa(4)|0;c[Ha>>2]=13440;Pb(Ha|0,13488,104)}if(ma==0.0){la=0.0}else{la=la/ma}l=c[k+8>>2]|0;if((l|0)!=0){while(1){d=c[l>>2]|0;if((l|0)!=0){gk(l)}if((d|0)==0){break}else{l=d}}}l=c[k>>2]|0;c[k>>2]=0;if((l|0)==0){i=j;return+la}gk(l);i=j;return+la}function Hc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;f=(d|0)!=0;do{if(f){g=d<<2;g=(g|0)==0?1:g;while(1){h=fk(g)|0;if((h|0)!=0){j=7;break}h=c[3356]|0;c[3356]=h+0;if((h|0)==0){j=6;break}hc[h&0]()}if((j|0)==6){s=Oa(4)|0;c[s>>2]=13440;Pb(s|0,13488,104)}else if((j|0)==7){g=h;break}}else{g=0}}while(0);h=c[b>>2]|0;c[b>>2]=g;if((h|0)!=0){gk(h)}c[b+4>>2]=d;if(f){f=0}else{i=e;return}do{c[(c[b>>2]|0)+(f<<2)>>2]=0;f=f+1|0}while((f|0)!=(d|0));k=b+8|0;j=c[k>>2]|0;if((j|0)==0){i=e;return}h=c[j+4>>2]|0;g=d+ -1|0;f=(g&d|0)==0;if(f){h=h&g}else{h=(h>>>0)%(d>>>0)|0}c[(c[b>>2]|0)+(h<<2)>>2]=k;m=c[j>>2]|0;if((m|0)==0){i=e;return}else{k=j}a:while(1){b:do{if(f){while(1){l=m;while(1){m=c[l+4>>2]&g;if((m|0)==(h|0)){break}n=(c[b>>2]|0)+(m<<2)|0;if((c[n>>2]|0)==0){h=m;k=n;break b}n=l+8|0;o=c[l>>2]|0;c:do{if((o|0)==0){p=l;o=0}else{p=l;while(1){q=32;s=n;r=o+8|0;while(1){if((a[s]|0)!=(a[r]|0)){break c}q=q+ -1|0;if((q|0)==0){break}else{s=s+1|0;r=r+1|0}}p=c[o>>2]|0;if((p|0)==0){p=o;o=0;break}else{s=o;o=p;p=s}}}}while(0);c[k>>2]=o;c[p>>2]=c[c[(c[b>>2]|0)+(m<<2)>>2]>>2];c[c[(c[b>>2]|0)+(m<<2)>>2]>>2]=l;l=c[k>>2]|0;if((l|0)==0){j=39;break a}}m=c[l>>2]|0;if((m|0)==0){j=39;break a}else{k=l;j=l}}}else{while(1){l=m;while(1){m=((c[l+4>>2]|0)>>>0)%(d>>>0)|0;if((m|0)==(h|0)){break}n=(c[b>>2]|0)+(m<<2)|0;if((c[n>>2]|0)==0){h=m;k=n;break b}n=l+8|0;o=c[l>>2]|0;d:do{if((o|0)==0){q=l;o=0}else{q=l;while(1){p=32;s=n;r=o+8|0;while(1){if((a[s]|0)!=(a[r]|0)){break d}p=p+ -1|0;if((p|0)==0){break}else{s=s+1|0;r=r+1|0}}p=c[o>>2]|0;if((p|0)==0){q=o;o=0;break}else{q=o;o=p}}}}while(0);c[k>>2]=o;c[q>>2]=c[c[(c[b>>2]|0)+(m<<2)>>2]>>2];c[c[(c[b>>2]|0)+(m<<2)>>2]>>2]=l;l=c[k>>2]|0;if((l|0)==0){j=39;break a}}m=c[l>>2]|0;if((m|0)==0){j=39;break a}else{k=l;j=l}}}}while(0);c[k>>2]=j;m=c[l>>2]|0;if((m|0)==0){j=39;break}else{k=l;j=l}}if((j|0)==39){i=e;return}}function Ic(b,d,f,g){b=b|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;j=(da(e[g>>1]|0,16777619)|0)^-2128831035;j=j^(da(e[g+2>>1]|0,16777619)|0);j=j^(da(e[g+4>>1]|0,16777619)|0);j=j^(da(e[g+6>>1]|0,16777619)|0);j=j^(da(e[g+8>>1]|0,16777619)|0);j=j^(da(e[g+10>>1]|0,16777619)|0);j=j^(da(e[g+12>>1]|0,16777619)|0);j=j^(da(e[g+14>>1]|0,16777619)|0);j=j^(da(e[g+16>>1]|0,16777619)|0);j=j^(da(e[g+18>>1]|0,16777619)|0);j=j^(da(e[g+20>>1]|0,16777619)|0);j=j^(da(e[g+22>>1]|0,16777619)|0);j=j^(da(e[g+24>>1]|0,16777619)|0);j=j^(da(e[g+26>>1]|0,16777619)|0);j=j^(da(e[g+28>>1]|0,16777619)|0);j=j^(da(e[g+30>>1]|0,16777619)|0);a:do{if((f|0)!=0){k=f+ -1|0;l=(k&f|0)==0;if(l){j=j&k}else{j=(j>>>0)%(f>>>0)|0}m=c[d+(j<<2)>>2]|0;if((m|0)!=0){b:do{if(l){c:while(1){m=c[m>>2]|0;if((m|0)==0){break a}if((c[m+4>>2]&k|0)!=(j|0)){break a}l=31;d=m+8|0;f=g;while(1){if((a[d]|0)!=(a[f]|0)){continue c}if((l|0)==0){break b}l=l+ -1|0;d=d+1|0;f=f+1|0}}}else{d:while(1){m=c[m>>2]|0;if((m|0)==0){break a}if((((c[m+4>>2]|0)>>>0)%(f>>>0)|0|0)!=(j|0)){break a}l=31;k=m+8|0;d=g;while(1){if((a[k]|0)!=(a[d]|0)){continue d}if((l|0)==0){break b}l=l+ -1|0;k=k+1|0;d=d+1|0}}}}while(0);c[b>>2]=m;i=h;return}}}while(0);c[b>>2]=0;i=h;return}function Jc(a){a=a|0;var c=0,d=0,f=0,g=0,h=0,j=0;c=i;g=a+2|0;f=b[g>>1]|0;do{if(!(f<<16>>16==0)){d=b[a>>1]|0;if(d<<16>>16==0){b[a>>1]=f;b[g>>1]=0;j=0;break}b[g>>1]=0;if(d<<16>>16==f<<16>>16){b[a>>1]=(f&65535)<<1;j=1;break}else{b[g>>1]=f;j=1;break}}else{j=0}}while(0);g=a+(j<<1)|0;f=a+4|0;h=b[f>>1]|0;do{if(!(h<<16>>16==0)){d=b[g>>1]|0;if(d<<16>>16==0){b[g>>1]=h;b[f>>1]=0;d=j;break}b[f>>1]=0;if(d<<16>>16==h<<16>>16){b[g>>1]=(e[g>>1]|0)<<1;d=j+1|0;break}else{d=j+1|0;b[a+(d<<1)>>1]=h;break}}else{d=j}}while(0);j=a+(d<<1)|0;g=a+6|0;h=b[g>>1]|0;if(h<<16>>16==0){i=c;return}f=b[j>>1]|0;if(f<<16>>16==0){b[j>>1]=h;b[g>>1]=0;i=c;return}b[g>>1]=0;if(f<<16>>16==h<<16>>16){b[j>>1]=(e[j>>1]|0)<<1;i=c;return}else{b[a+(d+1<<1)>>1]=h;i=c;return}}function Kc(a){a=a|0;db(a|0)|0;Ha()}function Lc(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=2240;a=c[a+4>>2]|0;e=a+4|0;d=c[e>>2]|0;c[e>>2]=d+ -1;if((d|0)!=0){i=b;return}ac[c[(c[a>>2]|0)+8>>2]&127](a);i=b;return}function Mc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2240;d=c[a+4>>2]|0;f=d+4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e|0)!=0){gk(a);i=b;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);gk(a);i=b;return}function Nc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;dc[c[(c[b>>2]|0)+24>>2]&63](b)|0;d=c[d>>2]|0;if(!((c[1178]|0)==-1)){c[f>>2]=4712;c[f+4>>2]=106;c[f+8>>2]=0;td(4712,f)}g=(c[4716>>2]|0)+ -1|0;f=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-f>>2>>>0>g>>>0)){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}d=c[f+(g<<2)>>2]|0;if((d|0)==0){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}else{c[b+36>>2]=d;a[b+44|0]=(dc[c[(c[d>>2]|0)+28>>2]&63](d)|0)&1;i=e;return}}function Oc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+16|0;g=b+8|0;d=b;e=a+36|0;f=a+40|0;h=g+8|0;j=g;a=a+32|0;while(1){k=c[e>>2]|0;k=nc[c[(c[k>>2]|0)+20>>2]&15](k,c[f>>2]|0,g,h,d)|0;l=(c[d>>2]|0)-j|0;if((Ob(g|0,1,l|0,c[a>>2]|0)|0)!=(l|0)){e=-1;d=5;break}if((k|0)==2){e=-1;d=5;break}else if((k|0)!=1){d=4;break}}if((d|0)==4){l=((Ta(c[a>>2]|0)|0)!=0)<<31>>31;i=b;return l|0}else if((d|0)==5){i=b;return e|0}return 0}function Pc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;a:do{if((a[b+44|0]|0)==0){if((e|0)>0){g=0;while(1){if((mc[c[(c[b>>2]|0)+52>>2]&15](b,c[d>>2]|0)|0)==-1){break a}g=g+1|0;if((g|0)<(e|0)){d=d+4|0}else{break}}}else{g=0}}else{g=Ob(d|0,4,e|0,c[b+32>>2]|0)|0}}while(0);i=f;return g|0}function Qc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;j=e+16|0;p=e;h=e+4|0;k=e+8|0;f=(d|0)==-1;a:do{if(!f){c[p>>2]=d;if((a[b+44|0]|0)!=0){if((Ob(p|0,4,1,c[b+32>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}c[h>>2]=j;l=p+4|0;n=b+36|0;o=b+40|0;g=j+8|0;m=j;b=b+32|0;while(1){q=c[n>>2]|0;q=ic[c[(c[q>>2]|0)+12>>2]&15](q,c[o>>2]|0,p,l,k,j,g,h)|0;if((c[k>>2]|0)==(p|0)){d=-1;g=12;break}if((q|0)==3){g=7;break}r=(q|0)==1;if(!(q>>>0<2)){d=-1;g=12;break}q=(c[h>>2]|0)-m|0;if((Ob(j|0,1,q|0,c[b>>2]|0)|0)!=(q|0)){d=-1;g=12;break}if(r){p=r?c[k>>2]|0:p}else{break a}}if((g|0)==7){if((Ob(p|0,1,1,c[b>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}else if((g|0)==12){i=e;return d|0}}}while(0);r=f?0:d;i=e;return r|0}function Rc(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=2240;a=c[a+4>>2]|0;e=a+4|0;d=c[e>>2]|0;c[e>>2]=d+ -1;if((d|0)!=0){i=b;return}ac[c[(c[a>>2]|0)+8>>2]&127](a);i=b;return}function Sc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2240;d=c[a+4>>2]|0;f=d+4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e|0)!=0){gk(a);i=b;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);gk(a);i=b;return}function Tc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;d=c[d>>2]|0;if(!((c[1178]|0)==-1)){c[f>>2]=4712;c[f+4>>2]=106;c[f+8>>2]=0;td(4712,f)}g=(c[4716>>2]|0)+ -1|0;f=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-f>>2>>>0>g>>>0)){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}d=c[f+(g<<2)>>2]|0;if((d|0)==0){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=dc[c[(c[d>>2]|0)+24>>2]&63](d)|0;f=c[f>>2]|0;a[b+53|0]=(dc[c[(c[f>>2]|0)+28>>2]&63](f)|0)&1;if((c[g>>2]|0)>8){nh(1128)}else{i=e;return}}function Uc(a){a=a|0;var b=0;b=i;a=Xc(a,0)|0;i=b;return a|0}function Vc(a){a=a|0;var b=0;b=i;a=Xc(a,1)|0;i=b;return a|0}function Wc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+32|0;j=e+16|0;f=e;l=e+4|0;k=e+8|0;g=b+52|0;m=(a[g]|0)!=0;if((d|0)==-1){if(m){m=-1;i=e;return m|0}m=c[b+48>>2]|0;a[g]=(m|0)!=-1|0;i=e;return m|0}h=b+48|0;a:do{if(m){c[l>>2]=c[h>>2];m=c[b+36>>2]|0;k=ic[c[(c[m>>2]|0)+12>>2]&15](m,c[b+40>>2]|0,l,l+4|0,k,j,j+8|0,f)|0;if((k|0)==3){a[j]=c[h>>2];c[f>>2]=j+1}else if((k|0)==1|(k|0)==2){m=-1;i=e;return m|0}b=b+32|0;while(1){k=c[f>>2]|0;if(!(k>>>0>j>>>0)){break a}m=k+ -1|0;c[f>>2]=m;if((Ma(a[m]|0,c[b>>2]|0)|0)==-1){f=-1;break}}i=e;return f|0}}while(0);c[h>>2]=d;a[g]=1;m=d;i=e;return m|0}function Xc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;g=e+16|0;j=e;m=e+4|0;l=e+8|0;n=b+52|0;if((a[n]|0)!=0){f=b+48|0;g=c[f>>2]|0;if(!d){v=g;i=e;return v|0}c[f>>2]=-1;a[n]=0;v=g;i=e;return v|0}n=c[b+44>>2]|0;s=(n|0)>1?n:1;a:do{if((s|0)>0){n=b+32|0;o=0;while(1){p=Gb(c[n>>2]|0)|0;if((p|0)==-1){f=-1;break}a[g+o|0]=p;o=o+1|0;if((o|0)>=(s|0)){break a}}i=e;return f|0}}while(0);b:do{if((a[b+53|0]|0)==0){p=b+40|0;o=b+36|0;n=j+4|0;q=b+32|0;while(1){v=c[p>>2]|0;u=v;t=c[u>>2]|0;u=c[u+4>>2]|0;w=c[o>>2]|0;r=g+s|0;v=ic[c[(c[w>>2]|0)+16>>2]&15](w,v,g,r,m,j,n,l)|0;if((v|0)==2){f=-1;h=22;break}else if((v|0)==3){h=14;break}else if((v|0)!=1){k=s;break b}w=c[p>>2]|0;c[w>>2]=t;c[w+4>>2]=u;if((s|0)==8){f=-1;h=22;break}t=Gb(c[q>>2]|0)|0;if((t|0)==-1){f=-1;h=22;break}a[r]=t;s=s+1|0}if((h|0)==14){c[j>>2]=a[g]|0;k=s;break}else if((h|0)==22){i=e;return f|0}}else{c[j>>2]=a[g]|0;k=s}}while(0);if(d){w=c[j>>2]|0;c[b+48>>2]=w;i=e;return w|0}d=b+32|0;while(1){if((k|0)<=0){break}k=k+ -1|0;if((Ma(a[g+k|0]|0,c[d>>2]|0)|0)==-1){f=-1;h=22;break}}if((h|0)==22){i=e;return f|0}w=c[j>>2]|0;i=e;return w|0}function Yc(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=2176;a=c[a+4>>2]|0;e=a+4|0;d=c[e>>2]|0;c[e>>2]=d+ -1;if((d|0)!=0){i=b;return}ac[c[(c[a>>2]|0)+8>>2]&127](a);i=b;return}function Zc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2176;d=c[a+4>>2]|0;f=d+4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e|0)!=0){gk(a);i=b;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);gk(a);i=b;return}function _c(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;dc[c[(c[b>>2]|0)+24>>2]&63](b)|0;d=c[d>>2]|0;if(!((c[1176]|0)==-1)){c[f>>2]=4704;c[f+4>>2]=106;c[f+8>>2]=0;td(4704,f)}g=(c[4708>>2]|0)+ -1|0;f=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-f>>2>>>0>g>>>0)){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}d=c[f+(g<<2)>>2]|0;if((d|0)==0){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}else{c[b+36>>2]=d;a[b+44|0]=(dc[c[(c[d>>2]|0)+28>>2]&63](d)|0)&1;i=e;return}}function $c(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+16|0;g=b+8|0;d=b;e=a+36|0;f=a+40|0;h=g+8|0;j=g;a=a+32|0;while(1){k=c[e>>2]|0;k=nc[c[(c[k>>2]|0)+20>>2]&15](k,c[f>>2]|0,g,h,d)|0;l=(c[d>>2]|0)-j|0;if((Ob(g|0,1,l|0,c[a>>2]|0)|0)!=(l|0)){e=-1;d=5;break}if((k|0)==2){e=-1;d=5;break}else if((k|0)!=1){d=4;break}}if((d|0)==4){l=((Ta(c[a>>2]|0)|0)!=0)<<31>>31;i=b;return l|0}else if((d|0)==5){i=b;return e|0}return 0}function ad(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((a[b+44|0]|0)!=0){h=Ob(e|0,1,f|0,c[b+32>>2]|0)|0;i=g;return h|0}if((f|0)>0){h=0}else{h=0;i=g;return h|0}while(1){if((mc[c[(c[b>>2]|0)+52>>2]&15](b,d[e]|0)|0)==-1){f=6;break}h=h+1|0;if((h|0)<(f|0)){e=e+1|0}else{f=6;break}}if((f|0)==6){i=g;return h|0}return 0}function bd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;j=e+16|0;p=e+8|0;h=e;k=e+4|0;f=(d|0)==-1;a:do{if(!f){a[p]=d;if((a[b+44|0]|0)!=0){if((Ob(p|0,1,1,c[b+32>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}c[h>>2]=j;l=p+1|0;n=b+36|0;o=b+40|0;g=j+8|0;m=j;b=b+32|0;while(1){q=c[n>>2]|0;q=ic[c[(c[q>>2]|0)+12>>2]&15](q,c[o>>2]|0,p,l,k,j,g,h)|0;if((c[k>>2]|0)==(p|0)){d=-1;g=12;break}if((q|0)==3){g=7;break}r=(q|0)==1;if(!(q>>>0<2)){d=-1;g=12;break}q=(c[h>>2]|0)-m|0;if((Ob(j|0,1,q|0,c[b>>2]|0)|0)!=(q|0)){d=-1;g=12;break}if(r){p=r?c[k>>2]|0:p}else{break a}}if((g|0)==7){if((Ob(p|0,1,1,c[b>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}else if((g|0)==12){i=e;return d|0}}}while(0);r=f?0:d;i=e;return r|0}function cd(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=2176;a=c[a+4>>2]|0;e=a+4|0;d=c[e>>2]|0;c[e>>2]=d+ -1;if((d|0)!=0){i=b;return}ac[c[(c[a>>2]|0)+8>>2]&127](a);i=b;return}function dd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2176;d=c[a+4>>2]|0;f=d+4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e|0)!=0){gk(a);i=b;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);gk(a);i=b;return}function ed(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;d=c[d>>2]|0;if(!((c[1176]|0)==-1)){c[f>>2]=4704;c[f+4>>2]=106;c[f+8>>2]=0;td(4704,f)}g=(c[4708>>2]|0)+ -1|0;f=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-f>>2>>>0>g>>>0)){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}d=c[f+(g<<2)>>2]|0;if((d|0)==0){g=Oa(4)|0;c[g>>2]=12496;Pb(g|0,12568,96)}f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=dc[c[(c[d>>2]|0)+24>>2]&63](d)|0;f=c[f>>2]|0;a[b+53|0]=(dc[c[(c[f>>2]|0)+28>>2]&63](f)|0)&1;if((c[g>>2]|0)>8){nh(1128)}else{i=e;return}}function fd(a){a=a|0;var b=0;b=i;a=id(a,0)|0;i=b;return a|0}function gd(a){a=a|0;var b=0;b=i;a=id(a,1)|0;i=b;return a|0}function hd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+32|0;j=e+16|0;f=e;l=e+8|0;k=e+4|0;g=b+52|0;m=(a[g]|0)!=0;if((d|0)==-1){if(m){m=-1;i=e;return m|0}m=c[b+48>>2]|0;a[g]=(m|0)!=-1|0;i=e;return m|0}h=b+48|0;a:do{if(m){a[l]=c[h>>2];m=c[b+36>>2]|0;k=ic[c[(c[m>>2]|0)+12>>2]&15](m,c[b+40>>2]|0,l,l+1|0,k,j,j+8|0,f)|0;if((k|0)==1|(k|0)==2){m=-1;i=e;return m|0}else if((k|0)==3){a[j]=c[h>>2];c[f>>2]=j+1}b=b+32|0;while(1){k=c[f>>2]|0;if(!(k>>>0>j>>>0)){break a}m=k+ -1|0;c[f>>2]=m;if((Ma(a[m]|0,c[b>>2]|0)|0)==-1){f=-1;break}}i=e;return f|0}}while(0);c[h>>2]=d;a[g]=1;m=d;i=e;return m|0}function id(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;f=i;i=i+32|0;h=f+16|0;k=f+8|0;n=f;m=f+4|0;o=b+52|0;if((a[o]|0)!=0){g=b+48|0;h=c[g>>2]|0;if(!e){w=h;i=f;return w|0}c[g>>2]=-1;a[o]=0;w=h;i=f;return w|0}o=c[b+44>>2]|0;s=(o|0)>1?o:1;a:do{if((s|0)>0){o=b+32|0;p=0;while(1){q=Gb(c[o>>2]|0)|0;if((q|0)==-1){g=-1;break}a[h+p|0]=q;p=p+1|0;if((p|0)>=(s|0)){break a}}i=f;return g|0}}while(0);b:do{if((a[b+53|0]|0)==0){q=b+40|0;p=b+36|0;o=k+1|0;r=b+32|0;while(1){w=c[q>>2]|0;v=w;u=c[v>>2]|0;v=c[v+4>>2]|0;x=c[p>>2]|0;t=h+s|0;w=ic[c[(c[x>>2]|0)+16>>2]&15](x,w,h,t,n,k,o,m)|0;if((w|0)==2){g=-1;m=23;break}else if((w|0)==3){m=14;break}else if((w|0)!=1){l=s;break b}x=c[q>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((s|0)==8){g=-1;m=23;break}u=Gb(c[r>>2]|0)|0;if((u|0)==-1){g=-1;m=23;break}a[t]=u;s=s+1|0}if((m|0)==14){a[k]=a[h]|0;l=s;break}else if((m|0)==23){i=f;return g|0}}else{a[k]=a[h]|0;l=s}}while(0);do{if(!e){e=b+32|0;while(1){if((l|0)<=0){m=21;break}l=l+ -1|0;if((Ma(d[h+l|0]|0,c[e>>2]|0)|0)==-1){g=-1;m=23;break}}if((m|0)==21){j=a[k]|0;break}else if((m|0)==23){i=f;return g|0}}else{j=a[k]|0;c[b+48>>2]=j&255}}while(0);x=j&255;i=f;return x|0}function jd(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+16|0;d=b;e=c[q>>2]|0;c[140]=2176;g=c[(Uh()|0)>>2]|0;c[564>>2]=g;g=g+4|0;c[g>>2]=(c[g>>2]|0)+1;c[568>>2]=0;c[572>>2]=0;c[576>>2]=0;c[580>>2]=0;c[584>>2]=0;c[588>>2]=0;c[140]=1288;c[592>>2]=e;c[600>>2]=616;c[608>>2]=-1;a[612|0]=0;g=c[564>>2]|0;f=g+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1176]|0)==-1)){c[d>>2]=4704;c[d+4>>2]=106;c[d+8>>2]=0;td(4704,d)}j=(c[4708>>2]|0)+ -1|0;h=c[g+8>>2]|0;if(!((c[g+12>>2]|0)-h>>2>>>0>j>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}h=c[h+(j<<2)>>2]|0;if((h|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}c[596>>2]=h;c[604>>2]=dc[c[(c[h>>2]|0)+24>>2]&63](h)|0;l=c[596>>2]|0;a[613|0]=(dc[c[(c[l>>2]|0)+28>>2]&63](l)|0)&1;if((c[604>>2]|0)>8){b=Oa(8)|0;c[b>>2]=1456;while(1){d=fk(50)|0;if((d|0)!=0){h=12;break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){h=11;break}hc[d&0]()}if((h|0)==11){l=Oa(4)|0;c[l>>2]=13440;Pb(l|0,13488,104)}else if((h|0)==12){c[d+4>>2]=37;c[d>>2]=37;h=d+12|0;c[b+4>>2]=h;c[d+8>>2]=0;h=h+0|0;d=1128|0;j=h+38|0;do{a[h]=a[d]|0;h=h+1|0;d=d+1|0}while((h|0)<(j|0));Pb(b|0,1592,11)}}l=c[f>>2]|0;c[f>>2]=l+ -1;if((l|0)==0){ac[c[(c[g>>2]|0)+8>>2]&127](g)}c[8]=2308;c[40>>2]=2328;c[36>>2]=0;c[64>>2]=560;c[56>>2]=0;c[60>>2]=0;c[44>>2]=4098;c[52>>2]=0;c[48>>2]=6;h=72|0;j=h+40|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));g=c[(Uh()|0)>>2]|0;c[68>>2]=g;g=g+4|0;c[g>>2]=(c[g>>2]|0)+1;c[112>>2]=0;c[116>>2]=-1;g=c[r>>2]|0;c[166]=2176;f=c[(Uh()|0)>>2]|0;c[668>>2]=f;f=f+4|0;c[f>>2]=(c[f>>2]|0)+1;c[672>>2]=0;c[676>>2]=0;c[680>>2]=0;c[684>>2]=0;c[688>>2]=0;c[692>>2]=0;c[166]=1176;c[696>>2]=g;f=c[668>>2]|0;h=f+4|0;c[h>>2]=(c[h>>2]|0)+1;if(!((c[1176]|0)==-1)){c[d>>2]=4704;c[d+4>>2]=106;c[d+8>>2]=0;td(4704,d)}j=(c[4708>>2]|0)+ -1|0;k=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-k>>2>>>0>j>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}j=c[k+(j<<2)>>2]|0;if((j|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}l=c[h>>2]|0;c[h>>2]=l+ -1;if((l|0)==0){ac[c[(c[f>>2]|0)+8>>2]&127](f)}c[700>>2]=j;c[704>>2]=624;a[708|0]=(dc[c[(c[j>>2]|0)+28>>2]&63](j)|0)&1;c[30]=2388;c[124>>2]=2408;c[148>>2]=664;c[140>>2]=0;c[144>>2]=0;c[128>>2]=4098;c[136>>2]=0;c[132>>2]=6;h=156|0;j=h+40|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));f=c[(Uh()|0)>>2]|0;c[152>>2]=f;f=f+4|0;c[f>>2]=(c[f>>2]|0)+1;c[196>>2]=0;c[200>>2]=-1;f=c[p>>2]|0;c[178]=2176;h=c[(Uh()|0)>>2]|0;c[716>>2]=h;h=h+4|0;c[h>>2]=(c[h>>2]|0)+1;c[720>>2]=0;c[724>>2]=0;c[728>>2]=0;c[732>>2]=0;c[736>>2]=0;c[740>>2]=0;c[178]=1176;c[744>>2]=f;h=c[716>>2]|0;j=h+4|0;c[j>>2]=(c[j>>2]|0)+1;if(!((c[1176]|0)==-1)){c[d>>2]=4704;c[d+4>>2]=106;c[d+8>>2]=0;td(4704,d)}k=(c[4708>>2]|0)+ -1|0;l=c[h+8>>2]|0;if(!((c[h+12>>2]|0)-l>>2>>>0>k>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}k=c[l+(k<<2)>>2]|0;if((k|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}l=c[j>>2]|0;c[j>>2]=l+ -1;if((l|0)==0){ac[c[(c[h>>2]|0)+8>>2]&127](h)}c[748>>2]=k;c[752>>2]=632;a[756|0]=(dc[c[(c[k>>2]|0)+28>>2]&63](k)|0)&1;c[52]=2388;c[212>>2]=2408;c[236>>2]=712;c[228>>2]=0;c[232>>2]=0;c[216>>2]=4098;c[224>>2]=0;c[220>>2]=6;h=244|0;j=h+40|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));j=c[(Uh()|0)>>2]|0;c[240>>2]=j;j=j+4|0;c[j>>2]=(c[j>>2]|0)+1;c[284>>2]=0;c[288>>2]=-1;j=(c[(Uh()|0)>>2]|0)+4|0;c[j>>2]=(c[j>>2]|0)+1;c[(c[(c[8]|0)+ -12>>2]|0)+104>>2]=120;j=(c[(c[52]|0)+ -12>>2]|0)+212|0;c[j>>2]=c[j>>2]|8192;c[(c[(c[52]|0)+ -12>>2]|0)+280>>2]=120;c[190]=2240;j=c[(Uh()|0)>>2]|0;c[764>>2]=j;j=j+4|0;c[j>>2]=(c[j>>2]|0)+1;c[768>>2]=0;c[772>>2]=0;c[776>>2]=0;c[780>>2]=0;c[784>>2]=0;c[788>>2]=0;c[190]=1032;c[792>>2]=e;c[800>>2]=640;c[808>>2]=-1;a[812|0]=0;j=c[764>>2]|0;e=j+4|0;c[e>>2]=(c[e>>2]|0)+1;if(!((c[1178]|0)==-1)){c[d>>2]=4712;c[d+4>>2]=106;c[d+8>>2]=0;td(4712,d)}h=(c[4716>>2]|0)+ -1|0;k=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-k>>2>>>0>h>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}h=c[k+(h<<2)>>2]|0;if((h|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}c[796>>2]=h;c[804>>2]=dc[c[(c[h>>2]|0)+24>>2]&63](h)|0;l=c[796>>2]|0;a[813|0]=(dc[c[(c[l>>2]|0)+28>>2]&63](l)|0)&1;if((c[804>>2]|0)>8){b=Oa(8)|0;c[b>>2]=1456;while(1){d=fk(50)|0;if((d|0)!=0){h=40;break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){h=39;break}hc[d&0]()}if((h|0)==39){l=Oa(4)|0;c[l>>2]=13440;Pb(l|0,13488,104)}else if((h|0)==40){c[d+4>>2]=37;c[d>>2]=37;h=d+12|0;c[b+4>>2]=h;c[d+8>>2]=0;h=h+0|0;d=1128|0;j=h+38|0;do{a[h]=a[d]|0;h=h+1|0;d=d+1|0}while((h|0)<(j|0));Pb(b|0,1592,11)}}l=c[e>>2]|0;c[e>>2]=l+ -1;if((l|0)==0){ac[c[(c[j>>2]|0)+8>>2]&127](j)}c[74]=2348;c[304>>2]=2368;c[300>>2]=0;c[328>>2]=760;c[320>>2]=0;c[324>>2]=0;c[308>>2]=4098;c[316>>2]=0;c[312>>2]=6;h=336|0;j=h+40|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));e=c[(Uh()|0)>>2]|0;c[332>>2]=e;e=e+4|0;c[e>>2]=(c[e>>2]|0)+1;c[376>>2]=0;c[380>>2]=-1;c[204]=2240;e=c[(Uh()|0)>>2]|0;c[820>>2]=e;e=e+4|0;c[e>>2]=(c[e>>2]|0)+1;c[824>>2]=0;c[828>>2]=0;c[832>>2]=0;c[836>>2]=0;c[840>>2]=0;c[844>>2]=0;c[204]=920;c[848>>2]=g;g=c[820>>2]|0;e=g+4|0;c[e>>2]=(c[e>>2]|0)+1;if(!((c[1178]|0)==-1)){c[d>>2]=4712;c[d+4>>2]=106;c[d+8>>2]=0;td(4712,d)}h=(c[4716>>2]|0)+ -1|0;j=c[g+8>>2]|0;if(!((c[g+12>>2]|0)-j>>2>>>0>h>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}h=c[j+(h<<2)>>2]|0;if((h|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}l=c[e>>2]|0;c[e>>2]=l+ -1;if((l|0)==0){ac[c[(c[g>>2]|0)+8>>2]&127](g)}c[852>>2]=h;c[856>>2]=648;a[860|0]=(dc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;c[96]=2428;c[388>>2]=2448;c[412>>2]=816;c[404>>2]=0;c[408>>2]=0;c[392>>2]=4098;c[400>>2]=0;c[396>>2]=6;h=420|0;j=h+40|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));e=c[(Uh()|0)>>2]|0;c[416>>2]=e;e=e+4|0;c[e>>2]=(c[e>>2]|0)+1;c[460>>2]=0;c[464>>2]=-1;c[216]=2240;e=c[(Uh()|0)>>2]|0;c[868>>2]=e;e=e+4|0;c[e>>2]=(c[e>>2]|0)+1;c[872>>2]=0;c[876>>2]=0;c[880>>2]=0;c[884>>2]=0;c[888>>2]=0;c[892>>2]=0;c[216]=920;c[896>>2]=f;e=c[868>>2]|0;f=e+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1178]|0)==-1)){c[d>>2]=4712;c[d+4>>2]=106;c[d+8>>2]=0;td(4712,d)}d=(c[4716>>2]|0)+ -1|0;g=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-g>>2>>>0>d>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}d=c[g+(d<<2)>>2]|0;if((d|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}l=c[f>>2]|0;c[f>>2]=l+ -1;if((l|0)!=0){c[900>>2]=d;c[904>>2]=656;h=c[d>>2]|0;h=h+28|0;h=c[h>>2]|0;h=dc[h&63](d)|0;h=h&1;a[908|0]=h;c[118]=2428;c[476>>2]=2448;c[500>>2]=864;c[492>>2]=0;c[496>>2]=0;c[480>>2]=4098;c[488>>2]=0;c[484>>2]=6;h=508|0;j=h+40|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));l=Uh()|0;l=c[l>>2]|0;c[504>>2]=l;l=l+4|0;k=c[l>>2]|0;c[l>>2]=k+1;c[548>>2]=0;c[552>>2]=-1;l=Uh()|0;l=c[l>>2]|0;l=l+4|0;k=c[l>>2]|0;c[l>>2]=k+1;l=c[74]|0;l=l+ -12|0;l=c[l>>2]|0;l=l+72|0;l=296+l|0;c[l>>2]=384;l=c[118]|0;l=l+ -12|0;l=c[l>>2]|0;l=l+4|0;l=472+l|0;k=c[l>>2]|0;k=k|8192;c[l>>2]=k;l=c[118]|0;l=l+ -12|0;l=c[l>>2]|0;l=l+72|0;l=472+l|0;c[l>>2]=384;i=b;return}ac[c[(c[e>>2]|0)+8>>2]&127](e);c[900>>2]=d;c[904>>2]=656;h=c[d>>2]|0;h=h+28|0;h=c[h>>2]|0;h=dc[h&63](d)|0;h=h&1;a[908|0]=h;c[118]=2428;c[476>>2]=2448;c[500>>2]=864;c[492>>2]=0;c[496>>2]=0;c[480>>2]=4098;c[488>>2]=0;c[484>>2]=6;h=508|0;j=h+40|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));l=Uh()|0;l=c[l>>2]|0;c[504>>2]=l;l=l+4|0;k=c[l>>2]|0;c[l>>2]=k+1;c[548>>2]=0;c[552>>2]=-1;l=Uh()|0;l=c[l>>2]|0;l=l+4|0;k=c[l>>2]|0;c[l>>2]=k+1;l=c[74]|0;l=l+ -12|0;l=c[l>>2]|0;l=l+72|0;l=296+l|0;c[l>>2]=384;l=c[118]|0;l=l+ -12|0;l=c[l>>2]|0;l=l+4|0;l=472+l|0;k=c[l>>2]|0;k=k|8192;c[l>>2]=k;l=c[118]|0;l=l+ -12|0;l=c[l>>2]|0;l=l+72|0;l=472+l|0;c[l>>2]=384;i=b;return}function kd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1432;d=a+4|0;f=(c[d>>2]|0)+ -4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e+ -1|0)<0){gk((c[d>>2]|0)+ -12|0);yb(a|0);gk(a);i=b;return}else{yb(a|0);gk(a);i=b;return}}function ld(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1432;d=a+4|0;f=(c[d>>2]|0)+ -4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e+ -1|0)>=0){yb(a|0);i=b;return}gk((c[d>>2]|0)+ -12|0);yb(a|0);i=b;return}function md(a){a=a|0;return c[a+4>>2]|0}function nd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1456;d=a+4|0;f=(c[d>>2]|0)+ -4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e+ -1|0)<0){gk((c[d>>2]|0)+ -12|0);yb(a|0);gk(a);i=b;return}else{yb(a|0);gk(a);i=b;return}}function od(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1456;d=a+4|0;f=(c[d>>2]|0)+ -4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e+ -1|0)>=0){yb(a|0);i=b;return}gk((c[d>>2]|0)+ -12|0);yb(a|0);i=b;return}function pd(a){a=a|0;return c[a+4>>2]|0}function qd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1432;d=a+4|0;f=(c[d>>2]|0)+ -4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e+ -1|0)<0){gk((c[d>>2]|0)+ -12|0);yb(a|0);gk(a);i=b;return}else{yb(a|0);gk(a);i=b;return}}function rd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1456;d=a+4|0;f=(c[d>>2]|0)+ -4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e+ -1|0)<0){gk((c[d>>2]|0)+ -12|0);yb(a|0);gk(a);i=b;return}else{yb(a|0);gk(a);i=b;return}}function sd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;if(b>>>0<212){e=1672;g=48;a:while(1){while(1){if((g|0)==0){break a}f=(g|0)/2|0;if((c[e+(f<<2)>>2]|0)>>>0<b>>>0){break}else{g=f}}e=e+(f+1<<2)|0;g=g+ -1-f|0}k=c[e>>2]|0;i=d;return k|0}if(b>>>0>4294967291){d=Oa(8)|0;c[d>>2]=1456;while(1){f=fk(34)|0;if((f|0)!=0){e=13;break}e=c[3356]|0;c[3356]=e+0;if((e|0)==0){e=12;break}hc[e&0]()}if((e|0)==12){k=Oa(4)|0;c[k>>2]=13440;Pb(k|0,13488,104)}else if((e|0)==13){c[f+4>>2]=21;c[f>>2]=21;b=f+12|0;c[d+4>>2]=b;c[f+8>>2]=0;b=b+0|0;f=2056|0;e=b+22|0;do{a[b]=a[f]|0;b=b+1|0;f=f+1|0}while((b|0)<(e|0));c[d>>2]=1616;Pb(d|0,1656,11)}}f=(b>>>0)/210|0;g=f*210|0;h=b-g|0;b=1864;j=48;b:while(1){while(1){if((j|0)==0){break b}k=(j|0)/2|0;if((c[b+(k<<2)>>2]|0)>>>0<h>>>0){break}else{j=k}}b=b+(k+1<<2)|0;j=j+ -1-k|0}k=b-1864>>2;b=k;g=(c[1864+(k<<2)>>2]|0)+g|0;c:while(1){k=5;while(1){h=c[1672+(k<<2)>>2]|0;j=(g>>>0)/(h>>>0)|0;if(j>>>0<h>>>0){e=123;break c}k=k+1|0;if((g|0)==(da(j,h)|0)){break}if(!(k>>>0<47)){e=24;break}}d:do{if((e|0)==24){e=0;if(g>>>0<44521){e=123;break c}j=(g>>>0)/211|0;h=211;while(1){if((g|0)==(da(h,j)|0)){break d}j=h+10|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+12|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+16|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+18|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+22|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+28|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+30|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+36|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+40|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+42|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+46|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+52|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+58|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+60|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+66|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+70|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+72|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+78|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+82|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+88|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+96|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+100|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+102|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+106|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+108|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+112|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+120|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+126|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+130|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+136|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+138|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+142|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+148|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+150|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+156|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+162|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+166|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+168|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+172|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}j=h+178|0;k=(g>>>0)/(j>>>0)|0;if(k>>>0<j>>>0){e=123;break c}if((g|0)==(da(k,j)|0)){break d}k=h+180|0;j=(g>>>0)/(k>>>0)|0;if(j>>>0<k>>>0){e=123;break c}if((g|0)==(da(j,k)|0)){break d}k=h+186|0;j=(g>>>0)/(k>>>0)|0;if(j>>>0<k>>>0){e=123;break c}if((g|0)==(da(j,k)|0)){break d}k=h+190|0;j=(g>>>0)/(k>>>0)|0;if(j>>>0<k>>>0){e=123;break c}if((g|0)==(da(j,k)|0)){break d}k=h+192|0;j=(g>>>0)/(k>>>0)|0;if(j>>>0<k>>>0){e=123;break c}if((g|0)==(da(j,k)|0)){break d}k=h+196|0;j=(g>>>0)/(k>>>0)|0;if(j>>>0<k>>>0){e=123;break c}if((g|0)==(da(j,k)|0)){break d}k=h+198|0;j=(g>>>0)/(k>>>0)|0;if(j>>>0<k>>>0){e=123;break c}if((g|0)==(da(j,k)|0)){break d}k=h+208|0;j=(g>>>0)/(k>>>0)|0;if(j>>>0<k>>>0){e=123;break c}h=h+210|0;if((g|0)==(da(j,k)|0)){break d}j=(g>>>0)/(h>>>0)|0;if(j>>>0<h>>>0){e=123;break c}}}}while(0);b=b+1|0;g=(b|0)==48;k=g?0:b;g=(g&1)+f|0;b=k;f=g;g=(c[1864+(k<<2)>>2]|0)+(g*210|0)|0}if((e|0)==123){i=d;return g|0}return 0}function td(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;e=i;vb(2080)|0;if((c[a>>2]|0)==1){do{Ca(2104,2080)|0}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){rb(2080)|0;i=e;return}c[a>>2]=1;rb(2080)|0;g=b+4|0;f=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24;g=g+4|0;g=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24;b=(c[b>>2]|0)+(g>>1)|0;if((g&1|0)!=0){f=c[(c[b>>2]|0)+f>>2]|0}ac[f&127](b);vb(2080)|0;c[a>>2]=-1;rb(2080)|0;Kb(2104)|0;i=e;return}function ud(){var b=0,d=0,e=0,f=0;b=Oa(8)|0;c[b>>2]=1432;while(1){d=fk(25)|0;if((d|0)!=0){e=6;break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=5;break}hc[d&0]()}if((e|0)==5){f=Oa(4)|0;c[f>>2]=13440;Pb(f|0,13488,104)}else if((e|0)==6){c[d+4>>2]=12;c[d>>2]=12;f=d+12|0;c[b+4>>2]=f;c[d+8>>2]=0;f=f+0|0;e=2152|0;d=f+13|0;do{a[f]=a[e]|0;f=f+1|0;e=e+1|0}while((f|0)<(d|0));c[b>>2]=1512;Pb(b|0,1552,9)}}function vd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;f=i;e=qk(d|0)|0;h=a[b]|0;if((h&1)==0){g=10}else{g=c[b>>2]|0;h=g&255;g=(g&-2)+ -1|0}j=(h&1)==0;if(g>>>0<e>>>0){if(j){h=(h&255)>>>1}else{h=c[b+4>>2]|0}yd(b,g,e-g|0,h,0,h,e,d);i=f;return}if(j){g=b+1|0}else{g=c[b+8>>2]|0}xk(g|0,d|0,e|0)|0;a[g+e|0]=0;if((a[b]&1)==0){a[b]=e<<1;i=f;return}else{c[b+4>>2]=e;i=f;return}}function wd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;if((d|0)==0){i=e;return}h=a[b]|0;if((h&1)==0){g=10}else{h=c[b>>2]|0;g=(h&-2)+ -1|0;h=h&255}if((h&1)==0){f=(h&255)>>>1}else{f=c[b+4>>2]|0}if((g-f|0)>>>0<d>>>0){zd(b,g,d-g+f|0,f,f,0);h=a[b]|0}if((h&1)==0){g=b+1|0}else{g=c[b+8>>2]|0}rk(g+f|0,0,d|0)|0;d=f+d|0;if((a[b]&1)==0){a[b]=d<<1}else{c[b+4>>2]=d}a[g+d|0]=0;i=e;return}function xd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;g=a[b]|0;if((g&1)==0){l=10}else{g=c[b>>2]|0;l=(g&-2)+ -1|0;g=g&255}h=(g&1)==0;if(h){e=(g&255)>>>1}else{e=c[b+4>>2]|0}if(e>>>0<11){f=10}else{f=(e+16&-16)+ -1|0}if((f|0)==(l|0)){i=d;return}do{if((f|0)==10){k=b+1|0;j=c[b+8>>2]|0;if(h){vk(k|0,j|0,((g&255)>>>1)+1|0)|0;if((j|0)==0){h=30}else{gk(j);h=30}}else{g=k;k=0;h=25}}else{j=f+1|0;k=(j|0)==0?1:j;a:do{if(f>>>0>l>>>0){while(1){l=fk(k)|0;if((l|0)!=0){k=l;break a}l=c[3356]|0;c[3356]=l+0;if((l|0)==0){break}hc[l&0]()}l=Oa(4)|0;c[l>>2]=13440;Pb(l|0,13488,104)}else{while(1){l=fk(k)|0;if((l|0)!=0){k=l;break a}l=c[3356]|0;c[3356]=l+0;if((l|0)==0){break}hc[l&0]()}l=Oa(4)|0;c[l>>2]=13440;Pb(l|0,13488,104)}}while(0);if(h){vk(k|0,b+1|0,((g&255)>>>1)+1|0)|0;f=b+4|0;g=k;h=29;break}else{g=k;k=1;j=c[b+8>>2]|0;h=25;break}}}while(0);if((h|0)==25){h=b+4|0;vk(g|0,j|0,(c[h>>2]|0)+1|0)|0;if((j|0)!=0){gk(j)}if(k){j=f+1|0;f=h;h=29}else{h=30}}if((h|0)==29){c[b>>2]=j|1;c[f>>2]=e;c[b+8>>2]=g;i=d;return}else if((h|0)==30){a[b]=e<<1;i=d;return}}function yd(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0;m=i;if((-18-d|0)>>>0<e>>>0){ud()}if((a[b]&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}if(d>>>0<2147483623){o=e+d|0;e=d<<1;e=o>>>0<e>>>0?e:o;if(e>>>0<11){e=11}else{e=e+16&-16}}else{e=-17}o=(e|0)==0?1:e;while(1){p=fk(o)|0;if((p|0)!=0){break}p=c[3356]|0;c[3356]=p+0;if((p|0)==0){n=13;break}hc[p&0]()}if((n|0)==13){p=Oa(4)|0;c[p>>2]=13440;Pb(p|0,13488,104)}if((g|0)!=0){vk(p|0,l|0,g|0)|0}if((j|0)!=0){vk(p+g|0,k|0,j|0)|0}n=f-h|0;if((n|0)!=(g|0)){vk(p+(j+g)|0,l+(h+g)|0,n-g|0)|0}if((d|0)==10|(l|0)==0){o=b+8|0;c[o>>2]=p;o=e|1;c[b>>2]=o;o=n+j|0;e=b+4|0;c[e>>2]=o;p=p+o|0;a[p]=0;i=m;return}gk(l);o=b+8|0;c[o>>2]=p;o=e|1;c[b>>2]=o;o=n+j|0;e=b+4|0;c[e>>2]=o;p=p+o|0;a[p]=0;i=m;return}function zd(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;l=i;if((-17-d|0)>>>0<e>>>0){ud()}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}if(d>>>0<2147483623){m=e+d|0;e=d<<1;e=m>>>0<e>>>0?e:m;if(e>>>0<11){e=11}else{e=e+16&-16}}else{e=-17}m=(e|0)==0?1:e;while(1){n=fk(m)|0;if((n|0)!=0){break}n=c[3356]|0;c[3356]=n+0;if((n|0)==0){k=13;break}hc[n&0]()}if((k|0)==13){n=Oa(4)|0;c[n>>2]=13440;Pb(n|0,13488,104)}if((g|0)!=0){vk(n|0,j|0,g|0)|0}if((f|0)!=(g|0)){vk(n+(h+g)|0,j+g|0,f-g|0)|0}if((d|0)==10|(j|0)==0){m=b+8|0;c[m>>2]=n;n=e|1;c[b>>2]=n;i=l;return}gk(j);m=b+8|0;c[m>>2]=n;n=e|1;c[b>>2]=n;i=l;return}function Ad(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;h=a[b]|0;if((h&1)==0){g=1}else{h=c[b>>2]|0;g=(h&-2)+ -1|0;h=h&255}if(!(g>>>0<e>>>0)){if((h&1)==0){g=b+4|0}else{g=c[b+8>>2]|0}h=(e|0)==0;if(g-d>>2>>>0<e>>>0){if(!h){h=e;do{h=h+ -1|0;c[g+(h<<2)>>2]=c[d+(h<<2)>>2]}while((h|0)!=0)}}else{if(!h){j=g;h=e;while(1){h=h+ -1|0;c[j>>2]=c[d>>2];if((h|0)==0){break}else{d=d+4|0;j=j+4|0}}}}c[g+(e<<2)>>2]=0;if((a[b]&1)==0){a[b]=e<<1;i=f;return}else{c[b+4>>2]=e;i=f;return}}if((1073741806-g|0)>>>0<(e-g|0)>>>0){ud()}if((h&1)==0){h=b+4|0}else{h=c[b+8>>2]|0}if(g>>>0<536870887){k=g<<1;k=k>>>0>e>>>0?k:e;if(k>>>0<2){k=2}else{k=k+4&-4}}else{k=1073741807}l=k<<2;m=(l|0)==0?1:l;while(1){l=fk(m)|0;if((l|0)!=0){break}l=c[3356]|0;c[3356]=l+0;if((l|0)==0){j=27;break}hc[l&0]()}if((j|0)==27){m=Oa(4)|0;c[m>>2]=13440;Pb(m|0,13488,104)}if((e|0)!=0){j=e;m=l;while(1){j=j+ -1|0;c[m>>2]=c[d>>2];if((j|0)==0){break}else{d=d+4|0;m=m+4|0}}}if(!((g|0)==1|(h|0)==0)){gk(h)}c[b+8>>2]=l;c[b>>2]=k|1;c[b+4>>2]=e;c[l+(e<<2)>>2]=0;i=f;return}function Bd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;g=a[b]|0;if((g&1)==0){k=1}else{g=c[b>>2]|0;k=(g&-2)+ -1|0;g=g&255}h=(g&1)==0;if(h){f=(g&255)>>>1}else{f=c[b+4>>2]|0}if(f>>>0<2){e=1}else{e=(f+4&-4)+ -1|0}if((e|0)==(k|0)){i=d;return}do{if((e|0)==1){n=b+4|0;l=c[b+8>>2]|0;if(h){j=0;m=1;h=24}else{k=n;g=n;j=0;h=23}}else{j=(e<<2)+4|0;j=(j|0)==0?1:j;a:do{if(e>>>0>k>>>0){while(1){n=fk(j)|0;if((n|0)!=0){break a}k=c[3356]|0;c[3356]=k+0;if((k|0)==0){break}hc[k&0]()}n=Oa(4)|0;c[n>>2]=13440;Pb(n|0,13488,104)}else{while(1){n=fk(j)|0;if((n|0)!=0){break a}k=c[3356]|0;c[3356]=k+0;if((k|0)==0){break}hc[k&0]()}n=Oa(4)|0;c[n>>2]=13440;Pb(n|0,13488,104)}}while(0);if(h){j=1;l=b+4|0;m=0;h=24;break}else{k=b+4|0;g=n;j=1;l=c[b+8>>2]|0;h=23;break}}}while(0);if((h|0)==23){k=c[k>>2]|0;m=1}else if((h|0)==24){k=(g&255)>>>1;g=n}n=k+1|0;if((n|0)!=0){k=l;h=g;while(1){n=n+ -1|0;c[h>>2]=c[k>>2];if((n|0)==0){break}else{k=k+4|0;h=h+4|0}}}if(!(m^1|(l|0)==0)){gk(l)}if(j){c[b>>2]=e+1|1;c[b+4>>2]=f;c[b+8>>2]=g;i=d;return}else{a[b]=f<<1;i=d;return}}function Cd(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0;k=i;if((1073741807-d|0)>>>0<e>>>0){ud()}if((a[b]&1)==0){l=b+4|0}else{l=c[b+8>>2]|0}if(d>>>0<536870887){m=e+d|0;e=d<<1;e=m>>>0<e>>>0?e:m;if(e>>>0<2){e=2}else{e=e+4&-4}}else{e=1073741807}m=e<<2;o=(m|0)==0?1:m;while(1){m=fk(o)|0;if((m|0)!=0){break}m=c[3356]|0;c[3356]=m+0;if((m|0)==0){n=13;break}hc[m&0]()}if((n|0)==13){p=Oa(4)|0;c[p>>2]=13440;Pb(p|0,13488,104)}if((g|0)!=0){n=g;p=l;o=m;while(1){n=n+ -1|0;c[o>>2]=c[p>>2];if((n|0)==0){break}else{p=p+4|0;o=o+4|0}}}f=f-h|0;if((f|0)!=(g|0)){f=f-g|0;h=l+(h+g<<2)|0;g=m+(j+g<<2)|0;while(1){f=f+ -1|0;c[g>>2]=c[h>>2];if((f|0)==0){break}else{h=h+4|0;g=g+4|0}}}if((d|0)==1|(l|0)==0){p=b+8|0;c[p>>2]=m;p=e|1;c[b>>2]=p;i=k;return}gk(l);p=b+8|0;c[p>>2]=m;p=e|1;c[b>>2]=p;i=k;return}function Dd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;e=i;c[a>>2]=2464;f=c[a+40>>2]|0;b=a+32|0;d=a+36|0;if((f|0)!=0){do{f=f+ -1|0;fc[c[(c[b>>2]|0)+(f<<2)>>2]&0](0,a,c[(c[d>>2]|0)+(f<<2)>>2]|0)}while((f|0)!=0)}f=c[a+28>>2]|0;h=f+4|0;g=c[h>>2]|0;c[h>>2]=g+ -1;if((g|0)==0){ac[c[(c[f>>2]|0)+8>>2]&127](f)}gk(c[b>>2]|0);gk(c[d>>2]|0);gk(c[a+48>>2]|0);gk(c[a+60>>2]|0);i=e;return}function Ed(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2176;d=c[a+4>>2]|0;f=d+4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e|0)!=0){gk(a);i=b;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);gk(a);i=b;return}function Fd(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=2176;a=c[a+4>>2]|0;e=a+4|0;d=c[e>>2]|0;c[e>>2]=d+ -1;if((d|0)!=0){i=b;return}ac[c[(c[a>>2]|0)+8>>2]&127](a);i=b;return}function Gd(a,b){a=a|0;b=b|0;return}function Hd(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Id(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Jd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;return}function Kd(a){a=a|0;return 0}function Ld(a){a=a|0;return 0}function Md(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;if((e|0)<=0){k=0;i=f;return k|0}g=b+12|0;h=b+16|0;j=0;while(1){k=c[g>>2]|0;if(k>>>0<(c[h>>2]|0)>>>0){c[g>>2]=k+1;k=a[k]|0}else{k=dc[c[(c[b>>2]|0)+40>>2]&63](b)|0;if((k|0)==-1){e=8;break}k=k&255}a[d]=k;j=j+1|0;if((j|0)<(e|0)){d=d+1|0}else{e=8;break}}if((e|0)==8){i=f;return j|0}return 0}function Nd(a){a=a|0;return-1}function Od(a){a=a|0;var b=0,e=0;b=i;if((dc[c[(c[a>>2]|0)+36>>2]&63](a)|0)==-1){a=-1;i=b;return a|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;a=d[a]|0;i=b;return a|0}function Pd(a,b){a=a|0;b=b|0;return-1}function Qd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;if((f|0)<=0){l=0;i=g;return l|0}j=b+24|0;h=b+28|0;k=0;while(1){l=c[j>>2]|0;if(!(l>>>0<(c[h>>2]|0)>>>0)){if((mc[c[(c[b>>2]|0)+52>>2]&15](b,d[e]|0)|0)==-1){h=7;break}}else{m=a[e]|0;c[j>>2]=l+1;a[l]=m}k=k+1|0;if((k|0)<(f|0)){e=e+1|0}else{h=7;break}}if((h|0)==7){i=g;return k|0}return 0}function Rd(a,b){a=a|0;b=b|0;return-1}function Sd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2240;d=c[a+4>>2]|0;f=d+4|0;e=c[f>>2]|0;c[f>>2]=e+ -1;if((e|0)!=0){gk(a);i=b;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);gk(a);i=b;return}function Td(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=2240;a=c[a+4>>2]|0;e=a+4|0;d=c[e>>2]|0;c[e>>2]=d+ -1;if((d|0)!=0){i=b;return}ac[c[(c[a>>2]|0)+8>>2]&127](a);i=b;return}function Ud(a,b){a=a|0;b=b|0;return}function Vd(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Wd(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Xd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;return}function Yd(a){a=a|0;return 0}function Zd(a){a=a|0;return 0}function _d(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;if((d|0)<=0){j=0;i=e;return j|0}g=a+12|0;f=a+16|0;h=0;while(1){j=c[g>>2]|0;if(!(j>>>0<(c[f>>2]|0)>>>0)){j=dc[c[(c[a>>2]|0)+40>>2]&63](a)|0;if((j|0)==-1){a=8;break}}else{c[g>>2]=j+4;j=c[j>>2]|0}c[b>>2]=j;h=h+1|0;if((h|0)>=(d|0)){a=8;break}b=b+4|0}if((a|0)==8){i=e;return h|0}return 0}function $d(a){a=a|0;return-1}function ae(a){a=a|0;var b=0,d=0;b=i;if((dc[c[(c[a>>2]|0)+36>>2]&63](a)|0)==-1){a=-1;i=b;return a|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;a=c[a>>2]|0;i=b;return a|0}function be(a,b){a=a|0;b=b|0;return-1}function ce(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;if((d|0)<=0){j=0;i=e;return j|0}g=a+24|0;f=a+28|0;h=0;while(1){j=c[g>>2]|0;if(!(j>>>0<(c[f>>2]|0)>>>0)){if((mc[c[(c[a>>2]|0)+52>>2]&15](a,c[b>>2]|0)|0)==-1){f=8;break}}else{k=c[b>>2]|0;c[g>>2]=j+4;c[j>>2]=k}h=h+1|0;if((h|0)>=(d|0)){f=8;break}b=b+4|0}if((f|0)==8){i=e;return h|0}return 0}function de(a,b){a=a|0;b=b|0;return-1}function ee(a){a=a|0;var b=0;b=i;Dd(a+8|0);if((a|0)==0){i=b;return}gk(a);i=b;return}function fe(a){a=a|0;var b=0;b=i;Dd(a+8|0);i=b;return}function ge(a){a=a|0;var b=0,d=0,e=0;b=i;e=c[(c[a>>2]|0)+ -12>>2]|0;d=a+e|0;Dd(a+(e+8)|0);if((d|0)==0){i=b;return}gk(d);i=b;return}function he(a){a=a|0;var b=0;b=i;Dd(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function ie(a){a=a|0;var b=0;b=i;Dd(a+8|0);if((a|0)==0){i=b;return}gk(a);i=b;return}function je(a){a=a|0;var b=0;b=i;Dd(a+8|0);i=b;return}function ke(a){a=a|0;var b=0,d=0,e=0;b=i;e=c[(c[a>>2]|0)+ -12>>2]|0;d=a+e|0;Dd(a+(e+8)|0);if((d|0)==0){i=b;return}gk(d);i=b;return}function le(a){a=a|0;var b=0;b=i;Dd(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function me(a){a=a|0;var b=0;b=i;Dd(a+4|0);if((a|0)==0){i=b;return}gk(a);i=b;return}function ne(a){a=a|0;var b=0;b=i;Dd(a+4|0);i=b;return}function oe(a){a=a|0;var b=0,d=0,e=0;b=i;e=c[(c[a>>2]|0)+ -12>>2]|0;d=a+e|0;Dd(a+(e+4)|0);if((d|0)==0){i=b;return}gk(d);i=b;return}function pe(a){a=a|0;var b=0;b=i;Dd(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function qe(a){a=a|0;var b=0;b=i;Dd(a+4|0);if((a|0)==0){i=b;return}gk(a);i=b;return}function re(a){a=a|0;var b=0;b=i;Dd(a+4|0);i=b;return}function se(a){a=a|0;var b=0,d=0,e=0;b=i;e=c[(c[a>>2]|0)+ -12>>2]|0;d=a+e|0;Dd(a+(e+4)|0);if((d|0)==0){i=b;return}gk(d);i=b;return}function te(a){a=a|0;var b=0;b=i;Dd(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function ue(a){a=a|0;var b=0;b=i;Dd(a);if((a|0)!=0){gk(a)}i=b;return}function ve(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function we(a){a=a|0;return}function xe(a){a=a|0;return}function ye(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;b=i;a:do{if((e|0)==(f|0)){g=6}else{while(1){if((c|0)==(d|0)){d=-1;break a}j=a[c]|0;h=a[e]|0;if(j<<24>>24<h<<24>>24){d=-1;break a}if(h<<24>>24<j<<24>>24){d=1;break a}c=c+1|0;e=e+1|0;if((e|0)==(f|0)){g=6;break}}}}while(0);if((g|0)==6){d=(c|0)!=(d|0)|0}i=b;return d|0}function ze(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;d=e;h=f-d|0;if(h>>>0>4294967279){ud()}do{if(!(h>>>0<11)){j=h+16&-16;k=(j|0)==0?1:j;while(1){l=fk(k)|0;if((l|0)!=0){k=10;break}l=c[3356]|0;c[3356]=l+0;if((l|0)==0){k=9;break}hc[l&0]()}if((k|0)==9){l=Oa(4)|0;c[l>>2]=13440;Pb(l|0,13488,104)}else if((k|0)==10){c[b+8>>2]=l;c[b>>2]=j|1;c[b+4>>2]=h;break}}else{a[b]=h<<1;l=b+1|0}}while(0);if((e|0)==(f|0)){a[l]=0;i=g;return}else{b=l}while(1){a[b]=a[e]|0;e=e+1|0;if((e|0)==(f|0)){break}else{b=b+1|0}}l=l+(f+(0-d))|0;a[l]=0;i=g;return}function Ae(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;b=i;if((c|0)==(d|0)){c=0;i=b;return c|0}else{e=0}do{e=(a[c]|0)+(e<<4)|0;f=e&-268435456;e=(f>>>24|f)^e;c=c+1|0}while((c|0)!=(d|0));i=b;return e|0}function Be(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Ce(a){a=a|0;return}function De(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;a=i;a:do{if((e|0)==(f|0)){g=6}else{while(1){if((b|0)==(d|0)){d=-1;break a}j=c[b>>2]|0;h=c[e>>2]|0;if((j|0)<(h|0)){d=-1;break a}if((h|0)<(j|0)){d=1;break a}b=b+4|0;e=e+4|0;if((e|0)==(f|0)){g=6;break}}}}while(0);if((g|0)==6){d=(b|0)!=(d|0)|0}i=a;return d|0}function Ee(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;d=i;g=e;j=f-g|0;h=j>>2;if(h>>>0>1073741807){ud()}do{if(!(h>>>0<2)){j=h+4&-4;k=j<<2;k=(k|0)==0?1:k;while(1){l=fk(k)|0;if((l|0)!=0){k=10;break}l=c[3356]|0;c[3356]=l+0;if((l|0)==0){k=9;break}hc[l&0]()}if((k|0)==9){l=Oa(4)|0;c[l>>2]=13440;Pb(l|0,13488,104)}else if((k|0)==10){c[b+8>>2]=l;c[b>>2]=j|1;c[b+4>>2]=h;break}}else{a[b]=j>>>1;l=b+4|0}}while(0);if((e|0)==(f|0)){c[l>>2]=0;i=d;return}b=f+ -4|0;g=0-g|0;h=l;while(1){c[h>>2]=c[e>>2];e=e+4|0;if((e|0)==(f|0)){break}else{h=h+4|0}}l=l+(((b+g|0)>>>2)+1<<2)|0;c[l>>2]=0;i=d;return}function Fe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;a=i;if((b|0)==(d|0)){b=0;i=a;return b|0}else{e=0}do{e=(c[b>>2]|0)+(e<<4)|0;f=e&-268435456;e=(f>>>24|f)^e;b=b+4|0}while((b|0)!=(d|0));i=a;return e|0}function Ge(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function He(a){a=a|0;return}function Ie(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;k=i;i=i+64|0;n=k;q=k+56|0;o=k+12|0;r=k+16|0;p=k+20|0;s=k+24|0;m=k+32|0;if((c[g+4>>2]&1|0)==0){c[o>>2]=-1;m=c[(c[d>>2]|0)+16>>2]|0;c[p>>2]=c[e>>2];c[s>>2]=c[f>>2];c[q+0>>2]=c[p+0>>2];c[n+0>>2]=c[s+0>>2];_b[m&63](r,d,q,n,g,h,o);f=c[r>>2]|0;c[e>>2]=f;e=c[o>>2]|0;if((e|0)==0){a[j]=0}else if((e|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=f;i=k;return}p=g+28|0;q=c[p>>2]|0;d=q+4|0;c[d>>2]=(c[d>>2]|0)+1;if(!((c[1160]|0)==-1)){c[n>>2]=4640;c[n+4>>2]=106;c[n+8>>2]=0;td(4640,n)}o=(c[4644>>2]|0)+ -1|0;r=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-r>>2>>>0>o>>>0)){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}o=c[r+(o<<2)>>2]|0;if((o|0)==0){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}s=c[d>>2]|0;c[d>>2]=s+ -1;if((s|0)==0){ac[c[(c[q>>2]|0)+8>>2]&127](q)}p=c[p>>2]|0;q=p+4|0;c[q>>2]=(c[q>>2]|0)+1;if(!((c[1196]|0)==-1)){c[n>>2]=4784;c[n+4>>2]=106;c[n+8>>2]=0;td(4784,n)}d=(c[4788>>2]|0)+ -1|0;n=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-n>>2>>>0>d>>>0)){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}n=c[n+(d<<2)>>2]|0;if((n|0)==0){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}s=c[q>>2]|0;c[q>>2]=s+ -1;if((s|0)==0){ac[c[(c[p>>2]|0)+8>>2]&127](p)}bc[c[(c[n>>2]|0)+24>>2]&63](m,n);s=m+12|0;bc[c[(c[n>>2]|0)+28>>2]&63](s,n);a[j]=(Je(e,c[f>>2]|0,m,m+24|0,o,h,1)|0)==(m|0)|0;c[b>>2]=c[e>>2];if(!((a[s]&1)==0)?(l=c[m+20>>2]|0,(l|0)!=0):0){gk(l)}if((a[m]&1)==0){i=k;return}b=c[m+8>>2]|0;if((b|0)==0){i=k;return}gk(b);i=k;return}function Je(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;l=i;i=i+112|0;o=l;t=(g-f|0)/12|0;if(t>>>0>100){o=fk(t)|0;if((o|0)==0){A=Oa(4)|0;c[A>>2]=13440;Pb(A|0,13488,104)}else{n=o}}else{n=0}p=(f|0)==(g|0);if(p){u=0}else{q=f;u=0;r=o;while(1){s=a[q]|0;if((s&1)==0){s=(s&255)>>>1}else{s=c[q+4>>2]|0}if((s|0)==0){a[r]=2;u=u+1|0;t=t+ -1|0}else{a[r]=1}q=q+12|0;if((q|0)==(g|0)){break}else{r=r+1|0}}}q=0;a:while(1){v=(t|0)!=0;r=q;while(1){q=c[b>>2]|0;do{if((q|0)!=0){if((c[q+12>>2]|0)==(c[q+16>>2]|0)){if((dc[c[(c[q>>2]|0)+36>>2]&63](q)|0)==-1){c[b>>2]=0;q=0;break}else{q=c[b>>2]|0;break}}}else{q=0}}while(0);s=(q|0)==0;if((e|0)!=0){if((c[e+12>>2]|0)==(c[e+16>>2]|0)){w=(dc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1;q=w?0:e;e=w?0:e}else{q=e}}else{q=0;e=0}w=(q|0)==0;x=c[b>>2]|0;if(!((s^w)&v)){break a}q=c[x+12>>2]|0;if((q|0)==(c[x+16>>2]|0)){q=dc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{q=d[q]|0}s=q&255;if(!k){s=mc[c[(c[h>>2]|0)+12>>2]&15](h,s)|0}q=r+1|0;if(p){r=q}else{break}}b:do{if(k){w=0;v=f;x=o;while(1){do{if((a[x]|0)==1){A=a[v]|0;z=(A&1)==0;if(z){y=v+1|0}else{y=c[v+8>>2]|0}if(!(s<<24>>24==(a[y+r|0]|0))){a[x]=0;t=t+ -1|0;break}if(z){w=(A&255)>>>1}else{w=c[v+4>>2]|0}if((w|0)==(q|0)){a[x]=2;w=1;u=u+1|0;t=t+ -1|0}else{w=1}}}while(0);v=v+12|0;if((v|0)==(g|0)){break b}x=x+1|0}}else{w=0;v=f;x=o;while(1){do{if((a[x]|0)==1){if((a[v]&1)==0){y=v+1|0}else{y=c[v+8>>2]|0}if(!(s<<24>>24==(mc[c[(c[h>>2]|0)+12>>2]&15](h,a[y+r|0]|0)|0)<<24>>24)){a[x]=0;t=t+ -1|0;break}w=a[v]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[v+4>>2]|0}if((w|0)==(q|0)){a[x]=2;w=1;u=u+1|0;t=t+ -1|0}else{w=1}}}while(0);v=v+12|0;if((v|0)==(g|0)){break b}x=x+1|0}}}while(0);if(!w){continue}r=c[b>>2]|0;s=r+12|0;v=c[s>>2]|0;if((v|0)==(c[r+16>>2]|0)){dc[c[(c[r>>2]|0)+40>>2]&63](r)|0}else{c[s>>2]=v+1}if((t+u|0)>>>0<2){continue}else{r=f;s=o}while(1){if((a[s]|0)==2){v=a[r]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[r+4>>2]|0}if((v|0)!=(q|0)){a[s]=0;u=u+ -1|0}}r=r+12|0;if((r|0)==(g|0)){continue a}else{s=s+1|0}}}do{if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((dc[c[(c[x>>2]|0)+36>>2]&63](x)|0)==-1){c[b>>2]=0;x=0;break}else{x=c[b>>2]|0;break}}}else{x=0}}while(0);h=(x|0)==0;do{if(!w){if((c[q+12>>2]|0)!=(c[q+16>>2]|0)){if(h){break}else{m=79;break}}if(!((dc[c[(c[q>>2]|0)+36>>2]&63](q)|0)==-1)){if(!h){m=79}}else{m=77}}else{m=77}}while(0);if((m|0)==77?h:0){m=79}if((m|0)==79){c[j>>2]=c[j>>2]|2}c:do{if(!p){if((a[o]|0)==2){g=f}else{while(1){f=f+12|0;o=o+1|0;if((f|0)==(g|0)){m=84;break c}if((a[o]|0)==2){g=f;break}}}}else{m=84}}while(0);if((m|0)==84){c[j>>2]=c[j>>2]|4}if((n|0)==0){i=l;return g|0}gk(n);i=l;return g|0}function Ke(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+224|0;v=e+198|0;u=e+196|0;o=e+4|0;n=e+16|0;s=e+28|0;t=e+32|0;q=e;r=e+192|0;z=c[f>>2]|0;y=c[g>>2]|0;g=c[h+4>>2]&74;if((g|0)==8){g=16}else if((g|0)==64){g=8}else if((g|0)==0){g=0}else{g=10}kf(o,c[h+28>>2]|0,v,u);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;wd(n,10);if((a[n]&1)==0){B=n+1|0;f=B;w=n+8|0}else{B=n+8|0;f=n+1|0;w=B;B=c[B>>2]|0}c[s>>2]=B;c[q>>2]=t;c[r>>2]=0;h=n+4|0;x=a[u]|0;u=n+8|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}A=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(A){break}else{A=0;break a}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!A){A=0;break a}}else{l=16}}else{l=16}}while(0);if((l|0)==16){l=0;if(A){z=0;A=1;y=0;break}else{y=0}}C=a[n]|0;D=(C&1)==0;if(D){E=(C&255)>>>1}else{E=c[h>>2]|0}if(((c[s>>2]|0)-B|0)==(E|0)){if(D){C=(C&255)>>>1}else{C=c[h>>2]|0}B=C<<1;do{if(!(C>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=C<<2;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-C|0)}}while(0);E=a[n]|0;if((E&1)==0){B=10}else{B=c[n>>2]|0;E=B&255;B=(B&-2)+ -1|0}D=(E&1)==0;if(D){E=(E&255)>>>1}else{E=c[h>>2]|0}do{if(!(E>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=B<<1;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-E|0)}}while(0);if((a[n]&1)==0){B=f}else{B=c[w>>2]|0}c[s>>2]=B+C}D=z+12|0;E=c[D>>2]|0;C=z+16|0;if((E|0)==(c[C>>2]|0)){E=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{E=d[E]|0}if((Ue(E&255,g,B,s,r,x,o,t,q,v)|0)!=0){break}A=c[D>>2]|0;if((A|0)==(c[C>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[D>>2]=A+1;continue}}v=a[o]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[o+4>>2]|0}if((v|0)!=0?(p=c[q>>2]|0,(p-t|0)<160):0){E=c[r>>2]|0;c[q>>2]=p+4;c[p>>2]=E}c[k>>2]=Jj(B,c[s>>2]|0,j,g)|0;ph(o,t,c[q>>2]|0,j);if(!A){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}p=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(p){break}else{l=65;break}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!p){l=65}}else{l=63}}else{l=63}}while(0);if((l|0)==63?p:0){l=65}if((l|0)==65){c[j>>2]=c[j>>2]|2}c[b>>2]=z;if(!((a[n]&1)==0)?(m=c[u>>2]|0,(m|0)!=0):0){gk(m)}if((a[o]&1)==0){i=e;return}b=c[o+8>>2]|0;if((b|0)==0){i=e;return}gk(b);i=e;return}function Le(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+224|0;v=e+198|0;u=e+196|0;o=e+4|0;n=e+16|0;s=e+28|0;t=e+32|0;q=e;r=e+192|0;z=c[f>>2]|0;y=c[g>>2]|0;g=c[h+4>>2]&74;if((g|0)==0){g=0}else if((g|0)==64){g=8}else if((g|0)==8){g=16}else{g=10}kf(o,c[h+28>>2]|0,v,u);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;wd(n,10);if((a[n]&1)==0){B=n+1|0;f=B;w=n+8|0}else{B=n+8|0;f=n+1|0;w=B;B=c[B>>2]|0}c[s>>2]=B;c[q>>2]=t;c[r>>2]=0;h=n+4|0;x=a[u]|0;u=n+8|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}A=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(A){break}else{A=0;break a}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!A){A=0;break a}}else{l=16}}else{l=16}}while(0);if((l|0)==16){l=0;if(A){z=0;A=1;y=0;break}else{y=0}}C=a[n]|0;D=(C&1)==0;if(D){E=(C&255)>>>1}else{E=c[h>>2]|0}if(((c[s>>2]|0)-B|0)==(E|0)){if(D){C=(C&255)>>>1}else{C=c[h>>2]|0}B=C<<1;do{if(!(C>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=C<<2;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-C|0)}}while(0);E=a[n]|0;if((E&1)==0){B=10}else{B=c[n>>2]|0;E=B&255;B=(B&-2)+ -1|0}D=(E&1)==0;if(D){E=(E&255)>>>1}else{E=c[h>>2]|0}do{if(!(E>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=B<<1;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-E|0)}}while(0);if((a[n]&1)==0){B=f}else{B=c[w>>2]|0}c[s>>2]=B+C}D=z+12|0;E=c[D>>2]|0;C=z+16|0;if((E|0)==(c[C>>2]|0)){E=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{E=d[E]|0}if((Ue(E&255,g,B,s,r,x,o,t,q,v)|0)!=0){break}A=c[D>>2]|0;if((A|0)==(c[C>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[D>>2]=A+1;continue}}v=a[o]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[o+4>>2]|0}if((v|0)!=0?(p=c[q>>2]|0,(p-t|0)<160):0){E=c[r>>2]|0;c[q>>2]=p+4;c[p>>2]=E}D=Ij(B,c[s>>2]|0,j,g)|0;E=k;c[E>>2]=D;c[E+4>>2]=H;ph(o,t,c[q>>2]|0,j);if(!A){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}p=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(p){break}else{l=65;break}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!p){l=65}}else{l=63}}else{l=63}}while(0);if((l|0)==63?p:0){l=65}if((l|0)==65){c[j>>2]=c[j>>2]|2}c[b>>2]=z;if(!((a[n]&1)==0)?(m=c[u>>2]|0,(m|0)!=0):0){gk(m)}if((a[o]&1)==0){i=e;return}b=c[o+8>>2]|0;if((b|0)==0){i=e;return}gk(b);i=e;return}function Me(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;f=i;i=i+224|0;w=f+198|0;v=f+196|0;p=f+4|0;o=f+16|0;t=f+28|0;u=f+32|0;r=f;s=f+192|0;A=c[g>>2]|0;z=c[h>>2]|0;h=c[j+4>>2]&74;if((h|0)==64){h=8}else if((h|0)==8){h=16}else if((h|0)==0){h=0}else{h=10}kf(p,c[j+28>>2]|0,w,v);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;wd(o,10);if((a[o]&1)==0){C=o+1|0;g=C;x=o+8|0}else{C=o+8|0;g=o+1|0;x=C;C=c[C>>2]|0}c[t>>2]=C;c[r>>2]=u;c[s>>2]=0;j=o+4|0;y=a[v]|0;v=o+8|0;a:while(1){if((A|0)!=0){if((c[A+12>>2]|0)==(c[A+16>>2]|0)){F=(dc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1;A=F?0:A}}else{A=0}B=(A|0)==0;do{if((z|0)!=0){if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(B){break}else{B=0;break a}}if(!((dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1)){if(!B){B=0;break a}}else{m=16}}else{m=16}}while(0);if((m|0)==16){m=0;if(B){A=0;B=1;z=0;break}else{z=0}}D=a[o]|0;E=(D&1)==0;if(E){F=(D&255)>>>1}else{F=c[j>>2]|0}if(((c[t>>2]|0)-C|0)==(F|0)){if(E){D=(D&255)>>>1}else{D=c[j>>2]|0}C=D<<1;do{if(!(D>>>0<C>>>0)){if(E){a[o+C+1|0]=0;a[o]=D<<2;break}else{a[(c[v>>2]|0)+C|0]=0;c[j>>2]=C;break}}else{wd(o,C-D|0)}}while(0);F=a[o]|0;if((F&1)==0){C=10}else{C=c[o>>2]|0;F=C&255;C=(C&-2)+ -1|0}E=(F&1)==0;if(E){F=(F&255)>>>1}else{F=c[j>>2]|0}do{if(!(F>>>0<C>>>0)){if(E){a[o+C+1|0]=0;a[o]=C<<1;break}else{a[(c[v>>2]|0)+C|0]=0;c[j>>2]=C;break}}else{wd(o,C-F|0)}}while(0);if((a[o]&1)==0){C=g}else{C=c[x>>2]|0}c[t>>2]=C+D}E=A+12|0;F=c[E>>2]|0;D=A+16|0;if((F|0)==(c[D>>2]|0)){F=dc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{F=d[F]|0}if((Ue(F&255,h,C,t,s,y,p,u,r,w)|0)!=0){break}B=c[E>>2]|0;if((B|0)==(c[D>>2]|0)){dc[c[(c[A>>2]|0)+40>>2]&63](A)|0;continue}else{c[E>>2]=B+1;continue}}w=a[p]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[p+4>>2]|0}if((w|0)!=0?(q=c[r>>2]|0,(q-u|0)<160):0){F=c[s>>2]|0;c[r>>2]=q+4;c[q>>2]=F}b[l>>1]=Hj(C,c[t>>2]|0,k,h)|0;ph(p,u,c[r>>2]|0,k);if(!B){if((c[A+12>>2]|0)==(c[A+16>>2]|0)){F=(dc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1;A=F?0:A}}else{A=0}q=(A|0)==0;do{if((z|0)!=0){if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(q){break}else{m=65;break}}if(!((dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1)){if(!q){m=65}}else{m=63}}else{m=63}}while(0);if((m|0)==63?q:0){m=65}if((m|0)==65){c[k>>2]=c[k>>2]|2}c[e>>2]=A;if(!((a[o]&1)==0)?(n=c[v>>2]|0,(n|0)!=0):0){gk(n)}if((a[p]&1)==0){i=f;return}e=c[p+8>>2]|0;if((e|0)==0){i=f;return}gk(e);i=f;return}function Ne(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+224|0;v=e+198|0;u=e+196|0;o=e+4|0;n=e+16|0;s=e+28|0;t=e+32|0;q=e;r=e+192|0;z=c[f>>2]|0;y=c[g>>2]|0;g=c[h+4>>2]&74;if((g|0)==8){g=16}else if((g|0)==0){g=0}else if((g|0)==64){g=8}else{g=10}kf(o,c[h+28>>2]|0,v,u);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;wd(n,10);if((a[n]&1)==0){B=n+1|0;f=B;w=n+8|0}else{B=n+8|0;f=n+1|0;w=B;B=c[B>>2]|0}c[s>>2]=B;c[q>>2]=t;c[r>>2]=0;h=n+4|0;x=a[u]|0;u=n+8|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}A=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(A){break}else{A=0;break a}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!A){A=0;break a}}else{l=16}}else{l=16}}while(0);if((l|0)==16){l=0;if(A){z=0;A=1;y=0;break}else{y=0}}C=a[n]|0;D=(C&1)==0;if(D){E=(C&255)>>>1}else{E=c[h>>2]|0}if(((c[s>>2]|0)-B|0)==(E|0)){if(D){C=(C&255)>>>1}else{C=c[h>>2]|0}B=C<<1;do{if(!(C>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=C<<2;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-C|0)}}while(0);E=a[n]|0;if((E&1)==0){B=10}else{B=c[n>>2]|0;E=B&255;B=(B&-2)+ -1|0}D=(E&1)==0;if(D){E=(E&255)>>>1}else{E=c[h>>2]|0}do{if(!(E>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=B<<1;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-E|0)}}while(0);if((a[n]&1)==0){B=f}else{B=c[w>>2]|0}c[s>>2]=B+C}D=z+12|0;E=c[D>>2]|0;C=z+16|0;if((E|0)==(c[C>>2]|0)){E=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{E=d[E]|0}if((Ue(E&255,g,B,s,r,x,o,t,q,v)|0)!=0){break}A=c[D>>2]|0;if((A|0)==(c[C>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[D>>2]=A+1;continue}}v=a[o]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[o+4>>2]|0}if((v|0)!=0?(p=c[q>>2]|0,(p-t|0)<160):0){E=c[r>>2]|0;c[q>>2]=p+4;c[p>>2]=E}c[k>>2]=Gj(B,c[s>>2]|0,j,g)|0;ph(o,t,c[q>>2]|0,j);if(!A){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}p=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(p){break}else{l=65;break}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!p){l=65}}else{l=63}}else{l=63}}while(0);if((l|0)==63?p:0){l=65}if((l|0)==65){c[j>>2]=c[j>>2]|2}c[b>>2]=z;if(!((a[n]&1)==0)?(m=c[u>>2]|0,(m|0)!=0):0){gk(m)}if((a[o]&1)==0){i=e;return}b=c[o+8>>2]|0;if((b|0)==0){i=e;return}gk(b);i=e;return}function Oe(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+224|0;v=e+198|0;u=e+196|0;o=e+4|0;n=e+16|0;s=e+28|0;t=e+32|0;q=e;r=e+192|0;z=c[f>>2]|0;y=c[g>>2]|0;g=c[h+4>>2]&74;if((g|0)==8){g=16}else if((g|0)==0){g=0}else if((g|0)==64){g=8}else{g=10}kf(o,c[h+28>>2]|0,v,u);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;wd(n,10);if((a[n]&1)==0){B=n+1|0;f=B;w=n+8|0}else{B=n+8|0;f=n+1|0;w=B;B=c[B>>2]|0}c[s>>2]=B;c[q>>2]=t;c[r>>2]=0;h=n+4|0;x=a[u]|0;u=n+8|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}A=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(A){break}else{A=0;break a}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!A){A=0;break a}}else{l=16}}else{l=16}}while(0);if((l|0)==16){l=0;if(A){z=0;A=1;y=0;break}else{y=0}}C=a[n]|0;D=(C&1)==0;if(D){E=(C&255)>>>1}else{E=c[h>>2]|0}if(((c[s>>2]|0)-B|0)==(E|0)){if(D){C=(C&255)>>>1}else{C=c[h>>2]|0}B=C<<1;do{if(!(C>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=C<<2;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-C|0)}}while(0);E=a[n]|0;if((E&1)==0){B=10}else{B=c[n>>2]|0;E=B&255;B=(B&-2)+ -1|0}D=(E&1)==0;if(D){E=(E&255)>>>1}else{E=c[h>>2]|0}do{if(!(E>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=B<<1;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-E|0)}}while(0);if((a[n]&1)==0){B=f}else{B=c[w>>2]|0}c[s>>2]=B+C}D=z+12|0;E=c[D>>2]|0;C=z+16|0;if((E|0)==(c[C>>2]|0)){E=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{E=d[E]|0}if((Ue(E&255,g,B,s,r,x,o,t,q,v)|0)!=0){break}A=c[D>>2]|0;if((A|0)==(c[C>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[D>>2]=A+1;continue}}v=a[o]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[o+4>>2]|0}if((v|0)!=0?(p=c[q>>2]|0,(p-t|0)<160):0){E=c[r>>2]|0;c[q>>2]=p+4;c[p>>2]=E}c[k>>2]=Fj(B,c[s>>2]|0,j,g)|0;ph(o,t,c[q>>2]|0,j);if(!A){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}p=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(p){break}else{l=65;break}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!p){l=65}}else{l=63}}else{l=63}}while(0);if((l|0)==63?p:0){l=65}if((l|0)==65){c[j>>2]=c[j>>2]|2}c[b>>2]=z;if(!((a[n]&1)==0)?(m=c[u>>2]|0,(m|0)!=0):0){gk(m)}if((a[o]&1)==0){i=e;return}b=c[o+8>>2]|0;if((b|0)==0){i=e;return}gk(b);i=e;return}function Pe(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+224|0;v=e+198|0;u=e+196|0;o=e+4|0;n=e+16|0;s=e+28|0;t=e+32|0;q=e;r=e+192|0;z=c[f>>2]|0;y=c[g>>2]|0;g=c[h+4>>2]&74;if((g|0)==64){g=8}else if((g|0)==0){g=0}else if((g|0)==8){g=16}else{g=10}kf(o,c[h+28>>2]|0,v,u);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;wd(n,10);if((a[n]&1)==0){B=n+1|0;f=B;w=n+8|0}else{B=n+8|0;f=n+1|0;w=B;B=c[B>>2]|0}c[s>>2]=B;c[q>>2]=t;c[r>>2]=0;h=n+4|0;x=a[u]|0;u=n+8|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}A=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(A){break}else{A=0;break a}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!A){A=0;break a}}else{l=16}}else{l=16}}while(0);if((l|0)==16){l=0;if(A){z=0;A=1;y=0;break}else{y=0}}C=a[n]|0;D=(C&1)==0;if(D){E=(C&255)>>>1}else{E=c[h>>2]|0}if(((c[s>>2]|0)-B|0)==(E|0)){if(D){C=(C&255)>>>1}else{C=c[h>>2]|0}B=C<<1;do{if(!(C>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=C<<2;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-C|0)}}while(0);E=a[n]|0;if((E&1)==0){B=10}else{B=c[n>>2]|0;E=B&255;B=(B&-2)+ -1|0}D=(E&1)==0;if(D){E=(E&255)>>>1}else{E=c[h>>2]|0}do{if(!(E>>>0<B>>>0)){if(D){a[n+B+1|0]=0;a[n]=B<<1;break}else{a[(c[u>>2]|0)+B|0]=0;c[h>>2]=B;break}}else{wd(n,B-E|0)}}while(0);if((a[n]&1)==0){B=f}else{B=c[w>>2]|0}c[s>>2]=B+C}D=z+12|0;E=c[D>>2]|0;C=z+16|0;if((E|0)==(c[C>>2]|0)){E=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{E=d[E]|0}if((Ue(E&255,g,B,s,r,x,o,t,q,v)|0)!=0){break}A=c[D>>2]|0;if((A|0)==(c[C>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[D>>2]=A+1;continue}}v=a[o]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[o+4>>2]|0}if((v|0)!=0?(p=c[q>>2]|0,(p-t|0)<160):0){E=c[r>>2]|0;c[q>>2]=p+4;c[p>>2]=E}D=Ej(B,c[s>>2]|0,j,g)|0;E=k;c[E>>2]=D;c[E+4>>2]=H;ph(o,t,c[q>>2]|0,j);if(!A){if((c[z+12>>2]|0)==(c[z+16>>2]|0)){E=(dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1;z=E?0:z}}else{z=0}p=(z|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(p){break}else{l=65;break}}if(!((dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1)){if(!p){l=65}}else{l=63}}else{l=63}}while(0);if((l|0)==63?p:0){l=65}if((l|0)==65){c[j>>2]=c[j>>2]|2}c[b>>2]=z;if(!((a[n]&1)==0)?(m=c[u>>2]|0,(m|0)!=0):0){gk(m)}if((a[o]&1)==0){i=e;return}b=c[o+8>>2]|0;if((b|0)==0){i=e;return}gk(b);i=e;return}function Qe(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+240|0;x=e+200|0;z=e+199|0;w=e+198|0;o=e+8|0;p=e+20|0;s=e+192|0;t=e+32|0;v=e;u=e+4|0;r=e+197|0;y=e+196|0;C=c[f>>2]|0;B=c[h>>2]|0;lf(o,c[j+28>>2]|0,x,z,w);c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;wd(p,10);if((a[p]&1)==0){E=p+1|0;f=E;h=p+8|0}else{E=p+8|0;f=p+1|0;h=E;E=c[E>>2]|0}c[s>>2]=E;c[v>>2]=t;c[u>>2]=0;a[r]=1;a[y]=69;j=p+4|0;z=a[z]|0;A=a[w]|0;w=p+8|0;a:while(1){if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){H=(dc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1;C=H?0:C}}else{C=0}D=(C|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{D=0;break a}}if(!((dc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(!D){D=0;break a}}else{m=12}}else{m=12}}while(0);if((m|0)==12){m=0;if(D){C=0;D=1;B=0;break}else{B=0}}F=a[p]|0;G=(F&1)==0;if(G){H=(F&255)>>>1}else{H=c[j>>2]|0}if(((c[s>>2]|0)-E|0)==(H|0)){if(G){F=(F&255)>>>1}else{F=c[j>>2]|0}E=F<<1;do{if(!(F>>>0<E>>>0)){if(G){a[p+E+1|0]=0;a[p]=F<<2;break}else{a[(c[w>>2]|0)+E|0]=0;c[j>>2]=E;break}}else{wd(p,E-F|0)}}while(0);H=a[p]|0;if((H&1)==0){G=10}else{G=c[p>>2]|0;H=G&255;G=(G&-2)+ -1|0}E=(H&1)==0;if(E){H=(H&255)>>>1}else{H=c[j>>2]|0}do{if(!(H>>>0<G>>>0)){if(E){a[p+G+1|0]=0;a[p]=G<<1;break}else{a[(c[w>>2]|0)+G|0]=0;c[j>>2]=G;break}}else{wd(p,G-H|0)}}while(0);if((a[p]&1)==0){E=f}else{E=c[h>>2]|0}c[s>>2]=E+F}F=C+12|0;H=c[F>>2]|0;G=C+16|0;if((H|0)==(c[G>>2]|0)){H=dc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{H=d[H]|0}if((mf(H&255,r,y,E,s,z,A,o,t,v,u,x)|0)!=0){break}D=c[F>>2]|0;if((D|0)==(c[G>>2]|0)){dc[c[(c[C>>2]|0)+40>>2]&63](C)|0;continue}else{c[F>>2]=D+1;continue}}x=a[o]|0;if((x&1)==0){x=(x&255)>>>1}else{x=c[o+4>>2]|0}if(((x|0)!=0?(a[r]|0)!=0:0)?(q=c[v>>2]|0,(q-t|0)<160):0){H=c[u>>2]|0;c[v>>2]=q+4;c[q>>2]=H}g[l>>2]=+Dj(E,c[s>>2]|0,k);ph(o,t,c[v>>2]|0,k);if(!D){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){H=(dc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1;C=H?0:C}}else{C=0}l=(C|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(l){break}else{m=62;break}}if(!((dc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(!l){m=62}}else{m=60}}else{m=60}}while(0);if((m|0)==60?l:0){m=62}if((m|0)==62){c[k>>2]=c[k>>2]|2}c[b>>2]=C;if(!((a[p]&1)==0)?(n=c[w>>2]|0,(n|0)!=0):0){gk(n)}if((a[o]&1)==0){i=e;return}m=c[o+8>>2]|0;if((m|0)==0){i=e;return}gk(m);i=e;return}function Re(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+240|0;x=e+200|0;z=e+199|0;w=e+198|0;o=e+8|0;p=e+20|0;s=e+192|0;t=e+32|0;v=e;u=e+4|0;r=e+197|0;y=e+196|0;C=c[f>>2]|0;B=c[g>>2]|0;lf(o,c[j+28>>2]|0,x,z,w);c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;wd(p,10);if((a[p]&1)==0){E=p+1|0;f=E;g=p+8|0}else{E=p+8|0;f=p+1|0;g=E;E=c[E>>2]|0}c[s>>2]=E;c[v>>2]=t;c[u>>2]=0;a[r]=1;a[y]=69;j=p+4|0;z=a[z]|0;A=a[w]|0;w=p+8|0;a:while(1){if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){H=(dc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1;C=H?0:C}}else{C=0}D=(C|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{D=0;break a}}if(!((dc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(!D){D=0;break a}}else{m=12}}else{m=12}}while(0);if((m|0)==12){m=0;if(D){C=0;D=1;B=0;break}else{B=0}}F=a[p]|0;G=(F&1)==0;if(G){H=(F&255)>>>1}else{H=c[j>>2]|0}if(((c[s>>2]|0)-E|0)==(H|0)){if(G){F=(F&255)>>>1}else{F=c[j>>2]|0}E=F<<1;do{if(!(F>>>0<E>>>0)){if(G){a[p+E+1|0]=0;a[p]=F<<2;break}else{a[(c[w>>2]|0)+E|0]=0;c[j>>2]=E;break}}else{wd(p,E-F|0)}}while(0);H=a[p]|0;if((H&1)==0){G=10}else{G=c[p>>2]|0;H=G&255;G=(G&-2)+ -1|0}E=(H&1)==0;if(E){H=(H&255)>>>1}else{H=c[j>>2]|0}do{if(!(H>>>0<G>>>0)){if(E){a[p+G+1|0]=0;a[p]=G<<1;break}else{a[(c[w>>2]|0)+G|0]=0;c[j>>2]=G;break}}else{wd(p,G-H|0)}}while(0);if((a[p]&1)==0){E=f}else{E=c[g>>2]|0}c[s>>2]=E+F}F=C+12|0;H=c[F>>2]|0;G=C+16|0;if((H|0)==(c[G>>2]|0)){H=dc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{H=d[H]|0}if((mf(H&255,r,y,E,s,z,A,o,t,v,u,x)|0)!=0){break}D=c[F>>2]|0;if((D|0)==(c[G>>2]|0)){dc[c[(c[C>>2]|0)+40>>2]&63](C)|0;continue}else{c[F>>2]=D+1;continue}}x=a[o]|0;if((x&1)==0){x=(x&255)>>>1}else{x=c[o+4>>2]|0}if(((x|0)!=0?(a[r]|0)!=0:0)?(q=c[v>>2]|0,(q-t|0)<160):0){H=c[u>>2]|0;c[v>>2]=q+4;c[q>>2]=H}h[l>>3]=+Cj(E,c[s>>2]|0,k);ph(o,t,c[v>>2]|0,k);if(!D){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){H=(dc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1;C=H?0:C}}else{C=0}l=(C|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(l){break}else{m=62;break}}if(!((dc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(!l){m=62}}else{m=60}}else{m=60}}while(0);if((m|0)==60?l:0){m=62}if((m|0)==62){c[k>>2]=c[k>>2]|2}c[b>>2]=C;if(!((a[p]&1)==0)?(n=c[w>>2]|0,(n|0)!=0):0){gk(n)}if((a[o]&1)==0){i=e;return}m=c[o+8>>2]|0;if((m|0)==0){i=e;return}gk(m);i=e;return}function Se(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+240|0;x=e+200|0;z=e+199|0;w=e+198|0;o=e+8|0;p=e+20|0;s=e+192|0;t=e+32|0;v=e;u=e+4|0;r=e+197|0;y=e+196|0;C=c[f>>2]|0;B=c[g>>2]|0;lf(o,c[j+28>>2]|0,x,z,w);c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;wd(p,10);if((a[p]&1)==0){E=p+1|0;f=E;g=p+8|0}else{E=p+8|0;f=p+1|0;g=E;E=c[E>>2]|0}c[s>>2]=E;c[v>>2]=t;c[u>>2]=0;a[r]=1;a[y]=69;j=p+4|0;z=a[z]|0;A=a[w]|0;w=p+8|0;a:while(1){if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){H=(dc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1;C=H?0:C}}else{C=0}D=(C|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{D=0;break a}}if(!((dc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(!D){D=0;break a}}else{m=12}}else{m=12}}while(0);if((m|0)==12){m=0;if(D){C=0;D=1;B=0;break}else{B=0}}F=a[p]|0;G=(F&1)==0;if(G){H=(F&255)>>>1}else{H=c[j>>2]|0}if(((c[s>>2]|0)-E|0)==(H|0)){if(G){F=(F&255)>>>1}else{F=c[j>>2]|0}E=F<<1;do{if(!(F>>>0<E>>>0)){if(G){a[p+E+1|0]=0;a[p]=F<<2;break}else{a[(c[w>>2]|0)+E|0]=0;c[j>>2]=E;break}}else{wd(p,E-F|0)}}while(0);H=a[p]|0;if((H&1)==0){G=10}else{G=c[p>>2]|0;H=G&255;G=(G&-2)+ -1|0}E=(H&1)==0;if(E){H=(H&255)>>>1}else{H=c[j>>2]|0}do{if(!(H>>>0<G>>>0)){if(E){a[p+G+1|0]=0;a[p]=G<<1;break}else{a[(c[w>>2]|0)+G|0]=0;c[j>>2]=G;break}}else{wd(p,G-H|0)}}while(0);if((a[p]&1)==0){E=f}else{E=c[g>>2]|0}c[s>>2]=E+F}F=C+12|0;H=c[F>>2]|0;G=C+16|0;if((H|0)==(c[G>>2]|0)){H=dc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{H=d[H]|0}if((mf(H&255,r,y,E,s,z,A,o,t,v,u,x)|0)!=0){break}D=c[F>>2]|0;if((D|0)==(c[G>>2]|0)){dc[c[(c[C>>2]|0)+40>>2]&63](C)|0;continue}else{c[F>>2]=D+1;continue}}x=a[o]|0;if((x&1)==0){x=(x&255)>>>1}else{x=c[o+4>>2]|0}if(((x|0)!=0?(a[r]|0)!=0:0)?(q=c[v>>2]|0,(q-t|0)<160):0){H=c[u>>2]|0;c[v>>2]=q+4;c[q>>2]=H}h[l>>3]=+Bj(E,c[s>>2]|0,k);ph(o,t,c[v>>2]|0,k);if(!D){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){H=(dc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1;C=H?0:C}}else{C=0}l=(C|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(l){break}else{m=62;break}}if(!((dc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(!l){m=62}}else{m=60}}else{m=60}}while(0);if((m|0)==60?l:0){m=62}if((m|0)==62){c[k>>2]=c[k>>2]|2}c[b>>2]=C;if(!((a[p]&1)==0)?(n=c[w>>2]|0,(n|0)!=0):0){gk(n)}if((a[o]&1)==0){i=e;return}m=c[o+8>>2]|0;if((m|0)==0){i=e;return}gk(m);i=e;return}function Te(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;e=i;i=i+64|0;n=e;o=e+24|0;m=e+12|0;h=c[h+28>>2]|0;p=h+4|0;c[p>>2]=(c[p>>2]|0)+1;if(!((c[1160]|0)==-1)){c[n>>2]=4640;c[n+4>>2]=106;c[n+8>>2]=0;td(4640,n)}r=(c[4644>>2]|0)+ -1|0;q=c[h+8>>2]|0;if(!((c[h+12>>2]|0)-q>>2>>>0>r>>>0)){B=Oa(4)|0;c[B>>2]=12496;Pb(B|0,12568,96)}q=c[q+(r<<2)>>2]|0;if((q|0)==0){B=Oa(4)|0;c[B>>2]=12496;Pb(B|0,12568,96)}jc[c[(c[q>>2]|0)+32>>2]&7](q,3200,3226|0,o)|0;B=c[p>>2]|0;c[p>>2]=B+ -1;if((B|0)==0){ac[c[(c[h>>2]|0)+8>>2]&127](h)}c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;wd(m,10);if((a[m]&1)==0){x=m+1|0;q=x;r=m+8|0}else{x=m+8|0;q=m+1|0;r=x;x=c[x>>2]|0}u=m+4|0;t=o+24|0;s=o+25|0;v=o+26|0;p=o;h=m+8|0;w=c[f>>2]|0;y=x;a:while(1){if((w|0)!=0){if((c[w+12>>2]|0)==(c[w+16>>2]|0)?(dc[c[(c[w>>2]|0)+36>>2]&63](w)|0)==-1:0){c[f>>2]=0;w=0}}else{w=0}A=(w|0)==0;z=c[g>>2]|0;do{if((z|0)!=0){if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(A){break}else{break a}}if(!((dc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1)){if(A){break}else{break a}}else{c[g>>2]=0;l=21;break}}else{l=21}}while(0);if((l|0)==21?(l=0,A):0){break}A=a[m]|0;z=(A&1)==0;if(z){B=(A&255)>>>1}else{B=c[u>>2]|0}if((y-x|0)==(B|0)){if(z){y=(A&255)>>>1}else{y=c[u>>2]|0}x=y<<1;do{if(!(y>>>0<x>>>0)){if(z){a[m+x+1|0]=0;a[m]=y<<2;break}else{a[(c[h>>2]|0)+x|0]=0;c[u>>2]=x;break}}else{wd(m,x-y|0)}}while(0);A=a[m]|0;if((A&1)==0){x=10}else{A=c[m>>2]|0;x=(A&-2)+ -1|0;A=A&255}z=(A&1)==0;if(z){A=(A&255)>>>1}else{A=c[u>>2]|0}do{if(!(A>>>0<x>>>0)){if(z){a[m+x+1|0]=0;a[m]=x<<1;break}else{a[(c[h>>2]|0)+x|0]=0;c[u>>2]=x;break}}else{wd(m,x-A|0)}}while(0);if((a[m]&1)==0){x=q}else{x=c[r>>2]|0}y=x+y|0}z=c[w+12>>2]|0;if((z|0)==(c[w+16>>2]|0)){w=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{w=d[z]|0}z=w&255;w=(y|0)==(x|0);do{if(w){A=(a[t]|0)==z<<24>>24;if(!A?!((a[s]|0)==z<<24>>24):0){A=o;l=56;break}a[y]=A?43:45}else{A=o;l=56}}while(0);do{if((l|0)==56){while(1){l=0;B=A+1|0;if((a[A]|0)==z<<24>>24){break}if((B|0)==(v|0)){A=v;break}else{A=B;l=56}}z=A-p|0;if((z|0)>23){break a}if((z|0)<22){a[y]=a[3200+z|0]|0;break}if(w){x=y;break a}if((y-x|0)>=3){break a}if((a[y+ -1|0]|0)!=48){break a}a[y]=a[3200+z|0]|0}}while(0);y=y+1|0;w=c[f>>2]|0;A=w+12|0;z=c[A>>2]|0;if((z|0)==(c[w+16>>2]|0)){dc[c[(c[w>>2]|0)+40>>2]&63](w)|0;continue}else{c[A>>2]=z+1;continue}}a[x+3|0]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}B=c[1136]|0;c[n>>2]=k;if((Ve(x,B,n)|0)!=1){c[j>>2]=4}k=c[f>>2]|0;if((k|0)!=0){if((c[k+12>>2]|0)==(c[k+16>>2]|0)?(dc[c[(c[k>>2]|0)+36>>2]&63](k)|0)==-1:0){c[f>>2]=0;f=0}else{f=k}}else{f=0}k=(f|0)==0;n=c[g>>2]|0;do{if((n|0)!=0){if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){if(k){break}else{l=83;break}}if(!((dc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1)){if(k){break}else{l=83;break}}else{c[g>>2]=0;l=81;break}}else{l=81}}while(0);if((l|0)==81?k:0){l=83}if((l|0)==83){c[j>>2]=c[j>>2]|2}c[b>>2]=f;if((a[m]&1)==0){i=e;return}j=c[h>>2]|0;if((j|0)==0){i=e;return}gk(j);i=e;return}function Ue(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0;n=i;o=c[f>>2]|0;p=(o|0)==(e|0);do{if(p){q=(a[m+24|0]|0)==b<<24>>24;if(!q?!((a[m+25|0]|0)==b<<24>>24):0){break}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;q=0;i=n;return q|0}}while(0);q=a[j]|0;if((q&1)==0){j=(q&255)>>>1}else{j=c[j+4>>2]|0}if((j|0)!=0&b<<24>>24==h<<24>>24){o=c[l>>2]|0;if((o-k|0)>=160){q=0;i=n;return q|0}q=c[g>>2]|0;c[l>>2]=o+4;c[o>>2]=q;c[g>>2]=0;q=0;i=n;return q|0}l=m+26|0;k=m;while(1){h=k+1|0;if((a[k]|0)==b<<24>>24){break}if((h|0)==(l|0)){k=l;break}else{k=h}}m=k-m|0;if((m|0)>23){q=-1;i=n;return q|0}if((d|0)==16){if((m|0)>=22){if(p){q=-1;i=n;return q|0}if((o-e|0)>=3){q=-1;i=n;return q|0}if((a[o+ -1|0]|0)!=48){q=-1;i=n;return q|0}c[g>>2]=0;q=a[3200+m|0]|0;c[f>>2]=o+1;a[o]=q;q=0;i=n;return q|0}}else if((d|0)==10|(d|0)==8?(m|0)>=(d|0):0){q=-1;i=n;return q|0}q=a[3200+m|0]|0;c[f>>2]=o+1;a[o]=q;c[g>>2]=(c[g>>2]|0)+1;q=0;i=n;return q|0}function Ve(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;b=$a(b|0)|0;a=Fa(a|0,3240,f|0)|0;if((b|0)==0){i=e;return a|0}$a(b|0)|0;i=e;return a|0}function We(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Xe(a){a=a|0;return}function Ye(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;k=i;i=i+64|0;n=k;q=k+56|0;o=k+12|0;r=k+16|0;p=k+20|0;s=k+24|0;m=k+32|0;if((c[g+4>>2]&1|0)==0){c[o>>2]=-1;m=c[(c[d>>2]|0)+16>>2]|0;c[p>>2]=c[e>>2];c[s>>2]=c[f>>2];c[q+0>>2]=c[p+0>>2];c[n+0>>2]=c[s+0>>2];_b[m&63](r,d,q,n,g,h,o);f=c[r>>2]|0;c[e>>2]=f;e=c[o>>2]|0;if((e|0)==1){a[j]=1}else if((e|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=f;i=k;return}p=g+28|0;q=c[p>>2]|0;d=q+4|0;c[d>>2]=(c[d>>2]|0)+1;if(!((c[1158]|0)==-1)){c[n>>2]=4632;c[n+4>>2]=106;c[n+8>>2]=0;td(4632,n)}o=(c[4636>>2]|0)+ -1|0;r=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-r>>2>>>0>o>>>0)){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}o=c[r+(o<<2)>>2]|0;if((o|0)==0){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}s=c[d>>2]|0;c[d>>2]=s+ -1;if((s|0)==0){ac[c[(c[q>>2]|0)+8>>2]&127](q)}p=c[p>>2]|0;q=p+4|0;c[q>>2]=(c[q>>2]|0)+1;if(!((c[1198]|0)==-1)){c[n>>2]=4792;c[n+4>>2]=106;c[n+8>>2]=0;td(4792,n)}d=(c[4796>>2]|0)+ -1|0;n=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-n>>2>>>0>d>>>0)){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}n=c[n+(d<<2)>>2]|0;if((n|0)==0){s=Oa(4)|0;c[s>>2]=12496;Pb(s|0,12568,96)}s=c[q>>2]|0;c[q>>2]=s+ -1;if((s|0)==0){ac[c[(c[p>>2]|0)+8>>2]&127](p)}bc[c[(c[n>>2]|0)+24>>2]&63](m,n);s=m+12|0;bc[c[(c[n>>2]|0)+28>>2]&63](s,n);a[j]=(Ze(e,c[f>>2]|0,m,m+24|0,o,h,1)|0)==(m|0)|0;c[b>>2]=c[e>>2];if(!((a[s]&1)==0)?(l=c[m+20>>2]|0,(l|0)!=0):0){gk(l)}if((a[m]&1)==0){i=k;return}b=c[m+8>>2]|0;if((b|0)==0){i=k;return}gk(b);i=k;return}function Ze(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;l=i;i=i+112|0;n=l;s=(f-e|0)/12|0;if(s>>>0>100){n=fk(s)|0;if((n|0)==0){z=Oa(4)|0;c[z>>2]=13440;Pb(z|0,13488,104)}else{k=n}}else{k=0}o=(e|0)==(f|0);if(o){t=0}else{q=e;t=0;p=n;while(1){r=a[q]|0;if((r&1)==0){r=(r&255)>>>1}else{r=c[q+4>>2]|0}if((r|0)==0){a[p]=2;t=t+1|0;s=s+ -1|0}else{a[p]=1}q=q+12|0;if((q|0)==(f|0)){break}else{p=p+1|0}}}p=0;a:while(1){u=(s|0)!=0;q=p;while(1){r=c[b>>2]|0;do{if((r|0)!=0){p=c[r+12>>2]|0;if((p|0)==(c[r+16>>2]|0)){p=dc[c[(c[r>>2]|0)+36>>2]&63](r)|0}else{p=c[p>>2]|0}if((p|0)==-1){c[b>>2]=0;r=1;break}else{r=(c[b>>2]|0)==0;break}}else{r=1}}while(0);if((d|0)==0){p=0;v=1;d=0}else{p=c[d+12>>2]|0;if((p|0)==(c[d+16>>2]|0)){p=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{p=c[p>>2]|0}w=(p|0)==-1;p=w?0:d;v=w?1:0;d=w?0:d}w=c[b>>2]|0;if(!((r^v)&u)){break a}p=c[w+12>>2]|0;if((p|0)==(c[w+16>>2]|0)){r=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{r=c[p>>2]|0}if(!j){r=mc[c[(c[g>>2]|0)+28>>2]&15](g,r)|0}p=q+1|0;if(o){q=p}else{break}}b:do{if(j){w=0;u=e;v=n;while(1){do{if((a[v]|0)==1){x=a[u]|0;y=(x&1)==0;if(y){z=u+4|0}else{z=c[u+8>>2]|0}if((r|0)!=(c[z+(q<<2)>>2]|0)){a[v]=0;s=s+ -1|0;break}if(y){w=(x&255)>>>1}else{w=c[u+4>>2]|0}if((w|0)==(p|0)){a[v]=2;w=1;t=t+1|0;s=s+ -1|0}else{w=1}}}while(0);u=u+12|0;if((u|0)==(f|0)){break b}v=v+1|0}}else{w=0;u=e;v=n;while(1){do{if((a[v]|0)==1){if((a[u]&1)==0){x=u+4|0}else{x=c[u+8>>2]|0}if((r|0)!=(mc[c[(c[g>>2]|0)+28>>2]&15](g,c[x+(q<<2)>>2]|0)|0)){a[v]=0;s=s+ -1|0;break}w=a[u]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[u+4>>2]|0}if((w|0)==(p|0)){a[v]=2;w=1;t=t+1|0;s=s+ -1|0}else{w=1}}}while(0);u=u+12|0;if((u|0)==(f|0)){break b}v=v+1|0}}}while(0);if(!w){continue}u=c[b>>2]|0;r=u+12|0;q=c[r>>2]|0;if((q|0)==(c[u+16>>2]|0)){dc[c[(c[u>>2]|0)+40>>2]&63](u)|0}else{c[r>>2]=q+4}if((s+t|0)>>>0<2){continue}else{q=e;r=n}while(1){if((a[r]|0)==2){u=a[q]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[q+4>>2]|0}if((u|0)!=(p|0)){a[r]=0;t=t+ -1|0}}q=q+12|0;if((q|0)==(f|0)){continue a}else{r=r+1|0}}}do{if((w|0)!=0){j=c[w+12>>2]|0;if((j|0)==(c[w+16>>2]|0)){j=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[b>>2]=0;b=1;break}else{b=(c[b>>2]|0)==0;break}}else{b=1}}while(0);if((p|0)!=0){j=c[p+12>>2]|0;if((j|0)==(c[p+16>>2]|0)){j=dc[c[(c[p>>2]|0)+36>>2]&63](p)|0}else{j=c[j>>2]|0}if(!((j|0)==-1)){if(!b){m=86}}else{m=84}}else{m=84}if((m|0)==84?b:0){m=86}if((m|0)==86){c[h>>2]=c[h>>2]|2}c:do{if(!o){if((a[n]|0)==2){f=e}else{while(1){e=e+12|0;n=n+1|0;if((e|0)==(f|0)){m=91;break c}if((a[n]|0)==2){f=e;break}}}}else{m=91}}while(0);if((m|0)==91){c[h>>2]=c[h>>2]|4}if((k|0)==0){i=l;return f|0}gk(k);i=l;return f|0}function _e(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+304|0;u=d+200|0;o=d;n=d+4|0;m=d+16|0;t=d+28|0;r=d+32|0;s=d+192|0;q=d+196|0;w=c[e>>2]|0;y=c[f>>2]|0;f=c[g+4>>2]&74;if((f|0)==64){f=8}else if((f|0)==8){f=16}else if((f|0)==0){f=0}else{f=10}nf(n,c[g+28>>2]|0,u,o);c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;wd(m,10);if((a[m]&1)==0){z=m+1|0;e=z;g=m+8|0}else{z=m+8|0;e=m+1|0;g=z;z=c[z>>2]|0}c[t>>2]=z;c[s>>2]=r;c[q>>2]=0;v=m+4|0;x=c[o>>2]|0;o=m+8|0;while(1){if((w|0)==0){A=1;w=0}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){A=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{A=c[A>>2]|0}B=(A|0)==-1;A=B?1:0;w=B?0:w}if((y|0)!=0){B=c[y+12>>2]|0;if((B|0)==(c[y+16>>2]|0)){B=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{B=c[B>>2]|0}if(!((B|0)==-1)){if(!A){break}}else{k=19}}else{k=19}if((k|0)==19){k=0;if(A){y=0;break}else{y=0}}C=a[m]|0;B=(C&1)==0;if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}if(((c[t>>2]|0)-z|0)==(A|0)){if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}z=A<<1;do{if(!(A>>>0<z>>>0)){if(B){a[m+z+1|0]=0;a[m]=A<<2;break}else{a[(c[o>>2]|0)+z|0]=0;c[v>>2]=z;break}}else{wd(m,z-A|0)}}while(0);C=a[m]|0;if((C&1)==0){B=10}else{B=c[m>>2]|0;C=B&255;B=(B&-2)+ -1|0}z=(C&1)==0;if(z){C=(C&255)>>>1}else{C=c[v>>2]|0}do{if(!(C>>>0<B>>>0)){if(z){a[m+B+1|0]=0;a[m]=B<<1;break}else{a[(c[o>>2]|0)+B|0]=0;c[v>>2]=B;break}}else{wd(m,B-C|0)}}while(0);if((a[m]&1)==0){z=e}else{z=c[g>>2]|0}c[t>>2]=z+A}B=w+12|0;C=c[B>>2]|0;A=w+16|0;if((C|0)==(c[A>>2]|0)){C=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[C>>2]|0}if((jf(C,f,z,t,q,x,n,r,s,u)|0)!=0){break}C=c[B>>2]|0;if((C|0)==(c[A>>2]|0)){dc[c[(c[w>>2]|0)+40>>2]&63](w)|0;continue}else{c[B>>2]=C+4;continue}}u=a[n]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[n+4>>2]|0}if((u|0)!=0?(p=c[s>>2]|0,(p-r|0)<160):0){C=c[q>>2]|0;c[s>>2]=p+4;c[p>>2]=C}c[j>>2]=Jj(z,c[t>>2]|0,h,f)|0;ph(n,r,c[s>>2]|0,h);if((w|0)==0){j=0;p=1}else{j=c[w+12>>2]|0;if((j|0)==(c[w+16>>2]|0)){j=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{j=c[j>>2]|0}p=(j|0)==-1;j=p?0:w;p=p?1:0}if((y|0)!=0){q=c[y+12>>2]|0;if((q|0)==(c[y+16>>2]|0)){q=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{q=c[q>>2]|0}if(!((q|0)==-1)){if(!p){k=71}}else{k=69}}else{k=69}if((k|0)==69?p:0){k=71}if((k|0)==71){c[h>>2]=c[h>>2]|2}c[b>>2]=j;if(!((a[m]&1)==0)?(l=c[o>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}h=c[n+8>>2]|0;if((h|0)==0){i=d;return}gk(h);i=d;return}function $e(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+304|0;u=d+200|0;o=d;n=d+4|0;m=d+16|0;t=d+28|0;r=d+32|0;s=d+192|0;q=d+196|0;w=c[e>>2]|0;y=c[f>>2]|0;f=c[g+4>>2]&74;if((f|0)==8){f=16}else if((f|0)==64){f=8}else if((f|0)==0){f=0}else{f=10}nf(n,c[g+28>>2]|0,u,o);c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;wd(m,10);if((a[m]&1)==0){z=m+1|0;e=z;g=m+8|0}else{z=m+8|0;e=m+1|0;g=z;z=c[z>>2]|0}c[t>>2]=z;c[s>>2]=r;c[q>>2]=0;v=m+4|0;x=c[o>>2]|0;o=m+8|0;while(1){if((w|0)==0){A=1;w=0}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){A=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{A=c[A>>2]|0}B=(A|0)==-1;A=B?1:0;w=B?0:w}if((y|0)!=0){B=c[y+12>>2]|0;if((B|0)==(c[y+16>>2]|0)){B=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{B=c[B>>2]|0}if(!((B|0)==-1)){if(!A){break}}else{k=19}}else{k=19}if((k|0)==19){k=0;if(A){y=0;break}else{y=0}}C=a[m]|0;B=(C&1)==0;if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}if(((c[t>>2]|0)-z|0)==(A|0)){if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}z=A<<1;do{if(!(A>>>0<z>>>0)){if(B){a[m+z+1|0]=0;a[m]=A<<2;break}else{a[(c[o>>2]|0)+z|0]=0;c[v>>2]=z;break}}else{wd(m,z-A|0)}}while(0);C=a[m]|0;if((C&1)==0){B=10}else{B=c[m>>2]|0;C=B&255;B=(B&-2)+ -1|0}z=(C&1)==0;if(z){C=(C&255)>>>1}else{C=c[v>>2]|0}do{if(!(C>>>0<B>>>0)){if(z){a[m+B+1|0]=0;a[m]=B<<1;break}else{a[(c[o>>2]|0)+B|0]=0;c[v>>2]=B;break}}else{wd(m,B-C|0)}}while(0);if((a[m]&1)==0){z=e}else{z=c[g>>2]|0}c[t>>2]=z+A}B=w+12|0;C=c[B>>2]|0;A=w+16|0;if((C|0)==(c[A>>2]|0)){C=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[C>>2]|0}if((jf(C,f,z,t,q,x,n,r,s,u)|0)!=0){break}C=c[B>>2]|0;if((C|0)==(c[A>>2]|0)){dc[c[(c[w>>2]|0)+40>>2]&63](w)|0;continue}else{c[B>>2]=C+4;continue}}u=a[n]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[n+4>>2]|0}if((u|0)!=0?(p=c[s>>2]|0,(p-r|0)<160):0){C=c[q>>2]|0;c[s>>2]=p+4;c[p>>2]=C}B=Ij(z,c[t>>2]|0,h,f)|0;C=j;c[C>>2]=B;c[C+4>>2]=H;ph(n,r,c[s>>2]|0,h);if((w|0)==0){j=0;p=1}else{j=c[w+12>>2]|0;if((j|0)==(c[w+16>>2]|0)){j=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{j=c[j>>2]|0}p=(j|0)==-1;j=p?0:w;p=p?1:0}if((y|0)!=0){q=c[y+12>>2]|0;if((q|0)==(c[y+16>>2]|0)){q=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{q=c[q>>2]|0}if(!((q|0)==-1)){if(!p){k=71}}else{k=69}}else{k=69}if((k|0)==69?p:0){k=71}if((k|0)==71){c[h>>2]=c[h>>2]|2}c[b>>2]=j;if(!((a[m]&1)==0)?(l=c[o>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}h=c[n+8>>2]|0;if((h|0)==0){i=d;return}gk(h);i=d;return}function af(d,e,f,g,h,j,k){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+304|0;v=e+200|0;p=e;o=e+4|0;n=e+16|0;u=e+28|0;s=e+32|0;t=e+192|0;r=e+196|0;x=c[f>>2]|0;z=c[g>>2]|0;g=c[h+4>>2]&74;if((g|0)==0){g=0}else if((g|0)==64){g=8}else if((g|0)==8){g=16}else{g=10}nf(o,c[h+28>>2]|0,v,p);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;wd(n,10);if((a[n]&1)==0){A=n+1|0;f=A;h=n+8|0}else{A=n+8|0;f=n+1|0;h=A;A=c[A>>2]|0}c[u>>2]=A;c[t>>2]=s;c[r>>2]=0;w=n+4|0;y=c[p>>2]|0;p=n+8|0;while(1){if((x|0)==0){B=1;x=0}else{B=c[x+12>>2]|0;if((B|0)==(c[x+16>>2]|0)){B=dc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{B=c[B>>2]|0}C=(B|0)==-1;B=C?1:0;x=C?0:x}if((z|0)!=0){C=c[z+12>>2]|0;if((C|0)==(c[z+16>>2]|0)){C=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{C=c[C>>2]|0}if(!((C|0)==-1)){if(!B){break}}else{l=19}}else{l=19}if((l|0)==19){l=0;if(B){z=0;break}else{z=0}}D=a[n]|0;C=(D&1)==0;if(C){B=(D&255)>>>1}else{B=c[w>>2]|0}if(((c[u>>2]|0)-A|0)==(B|0)){if(C){B=(D&255)>>>1}else{B=c[w>>2]|0}A=B<<1;do{if(!(B>>>0<A>>>0)){if(C){a[n+A+1|0]=0;a[n]=B<<2;break}else{a[(c[p>>2]|0)+A|0]=0;c[w>>2]=A;break}}else{wd(n,A-B|0)}}while(0);D=a[n]|0;if((D&1)==0){C=10}else{C=c[n>>2]|0;D=C&255;C=(C&-2)+ -1|0}A=(D&1)==0;if(A){D=(D&255)>>>1}else{D=c[w>>2]|0}do{if(!(D>>>0<C>>>0)){if(A){a[n+C+1|0]=0;a[n]=C<<1;break}else{a[(c[p>>2]|0)+C|0]=0;c[w>>2]=C;break}}else{wd(n,C-D|0)}}while(0);if((a[n]&1)==0){A=f}else{A=c[h>>2]|0}c[u>>2]=A+B}C=x+12|0;D=c[C>>2]|0;B=x+16|0;if((D|0)==(c[B>>2]|0)){D=dc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{D=c[D>>2]|0}if((jf(D,g,A,u,r,y,o,s,t,v)|0)!=0){break}D=c[C>>2]|0;if((D|0)==(c[B>>2]|0)){dc[c[(c[x>>2]|0)+40>>2]&63](x)|0;continue}else{c[C>>2]=D+4;continue}}v=a[o]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[o+4>>2]|0}if((v|0)!=0?(q=c[t>>2]|0,(q-s|0)<160):0){D=c[r>>2]|0;c[t>>2]=q+4;c[q>>2]=D}b[k>>1]=Hj(A,c[u>>2]|0,j,g)|0;ph(o,s,c[t>>2]|0,j);if((x|0)==0){k=0;q=1}else{k=c[x+12>>2]|0;if((k|0)==(c[x+16>>2]|0)){k=dc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{k=c[k>>2]|0}q=(k|0)==-1;k=q?0:x;q=q?1:0}if((z|0)!=0){r=c[z+12>>2]|0;if((r|0)==(c[z+16>>2]|0)){r=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{r=c[r>>2]|0}if(!((r|0)==-1)){if(!q){l=71}}else{l=69}}else{l=69}if((l|0)==69?q:0){l=71}if((l|0)==71){c[j>>2]=c[j>>2]|2}c[d>>2]=k;if(!((a[n]&1)==0)?(m=c[p>>2]|0,(m|0)!=0):0){gk(m)}if((a[o]&1)==0){i=e;return}j=c[o+8>>2]|0;if((j|0)==0){i=e;return}gk(j);i=e;return}function bf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+304|0;u=d+200|0;o=d;n=d+4|0;m=d+16|0;t=d+28|0;r=d+32|0;s=d+192|0;q=d+196|0;w=c[e>>2]|0;y=c[f>>2]|0;f=c[g+4>>2]&74;if((f|0)==64){f=8}else if((f|0)==8){f=16}else if((f|0)==0){f=0}else{f=10}nf(n,c[g+28>>2]|0,u,o);c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;wd(m,10);if((a[m]&1)==0){z=m+1|0;e=z;g=m+8|0}else{z=m+8|0;e=m+1|0;g=z;z=c[z>>2]|0}c[t>>2]=z;c[s>>2]=r;c[q>>2]=0;v=m+4|0;x=c[o>>2]|0;o=m+8|0;while(1){if((w|0)==0){A=1;w=0}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){A=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{A=c[A>>2]|0}B=(A|0)==-1;A=B?1:0;w=B?0:w}if((y|0)!=0){B=c[y+12>>2]|0;if((B|0)==(c[y+16>>2]|0)){B=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{B=c[B>>2]|0}if(!((B|0)==-1)){if(!A){break}}else{k=19}}else{k=19}if((k|0)==19){k=0;if(A){y=0;break}else{y=0}}C=a[m]|0;B=(C&1)==0;if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}if(((c[t>>2]|0)-z|0)==(A|0)){if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}z=A<<1;do{if(!(A>>>0<z>>>0)){if(B){a[m+z+1|0]=0;a[m]=A<<2;break}else{a[(c[o>>2]|0)+z|0]=0;c[v>>2]=z;break}}else{wd(m,z-A|0)}}while(0);C=a[m]|0;if((C&1)==0){B=10}else{B=c[m>>2]|0;C=B&255;B=(B&-2)+ -1|0}z=(C&1)==0;if(z){C=(C&255)>>>1}else{C=c[v>>2]|0}do{if(!(C>>>0<B>>>0)){if(z){a[m+B+1|0]=0;a[m]=B<<1;break}else{a[(c[o>>2]|0)+B|0]=0;c[v>>2]=B;break}}else{wd(m,B-C|0)}}while(0);if((a[m]&1)==0){z=e}else{z=c[g>>2]|0}c[t>>2]=z+A}B=w+12|0;C=c[B>>2]|0;A=w+16|0;if((C|0)==(c[A>>2]|0)){C=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[C>>2]|0}if((jf(C,f,z,t,q,x,n,r,s,u)|0)!=0){break}C=c[B>>2]|0;if((C|0)==(c[A>>2]|0)){dc[c[(c[w>>2]|0)+40>>2]&63](w)|0;continue}else{c[B>>2]=C+4;continue}}u=a[n]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[n+4>>2]|0}if((u|0)!=0?(p=c[s>>2]|0,(p-r|0)<160):0){C=c[q>>2]|0;c[s>>2]=p+4;c[p>>2]=C}c[j>>2]=Gj(z,c[t>>2]|0,h,f)|0;ph(n,r,c[s>>2]|0,h);if((w|0)==0){j=0;p=1}else{j=c[w+12>>2]|0;if((j|0)==(c[w+16>>2]|0)){j=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{j=c[j>>2]|0}p=(j|0)==-1;j=p?0:w;p=p?1:0}if((y|0)!=0){q=c[y+12>>2]|0;if((q|0)==(c[y+16>>2]|0)){q=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{q=c[q>>2]|0}if(!((q|0)==-1)){if(!p){k=71}}else{k=69}}else{k=69}if((k|0)==69?p:0){k=71}if((k|0)==71){c[h>>2]=c[h>>2]|2}c[b>>2]=j;if(!((a[m]&1)==0)?(l=c[o>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}h=c[n+8>>2]|0;if((h|0)==0){i=d;return}gk(h);i=d;return}function cf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+304|0;u=d+200|0;o=d;n=d+4|0;m=d+16|0;t=d+28|0;r=d+32|0;s=d+192|0;q=d+196|0;w=c[e>>2]|0;y=c[f>>2]|0;f=c[g+4>>2]&74;if((f|0)==8){f=16}else if((f|0)==64){f=8}else if((f|0)==0){f=0}else{f=10}nf(n,c[g+28>>2]|0,u,o);c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;wd(m,10);if((a[m]&1)==0){z=m+1|0;e=z;g=m+8|0}else{z=m+8|0;e=m+1|0;g=z;z=c[z>>2]|0}c[t>>2]=z;c[s>>2]=r;c[q>>2]=0;v=m+4|0;x=c[o>>2]|0;o=m+8|0;while(1){if((w|0)==0){A=1;w=0}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){A=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{A=c[A>>2]|0}B=(A|0)==-1;A=B?1:0;w=B?0:w}if((y|0)!=0){B=c[y+12>>2]|0;if((B|0)==(c[y+16>>2]|0)){B=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{B=c[B>>2]|0}if(!((B|0)==-1)){if(!A){break}}else{k=19}}else{k=19}if((k|0)==19){k=0;if(A){y=0;break}else{y=0}}C=a[m]|0;B=(C&1)==0;if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}if(((c[t>>2]|0)-z|0)==(A|0)){if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}z=A<<1;do{if(!(A>>>0<z>>>0)){if(B){a[m+z+1|0]=0;a[m]=A<<2;break}else{a[(c[o>>2]|0)+z|0]=0;c[v>>2]=z;break}}else{wd(m,z-A|0)}}while(0);C=a[m]|0;if((C&1)==0){B=10}else{B=c[m>>2]|0;C=B&255;B=(B&-2)+ -1|0}z=(C&1)==0;if(z){C=(C&255)>>>1}else{C=c[v>>2]|0}do{if(!(C>>>0<B>>>0)){if(z){a[m+B+1|0]=0;a[m]=B<<1;break}else{a[(c[o>>2]|0)+B|0]=0;c[v>>2]=B;break}}else{wd(m,B-C|0)}}while(0);if((a[m]&1)==0){z=e}else{z=c[g>>2]|0}c[t>>2]=z+A}B=w+12|0;C=c[B>>2]|0;A=w+16|0;if((C|0)==(c[A>>2]|0)){C=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[C>>2]|0}if((jf(C,f,z,t,q,x,n,r,s,u)|0)!=0){break}C=c[B>>2]|0;if((C|0)==(c[A>>2]|0)){dc[c[(c[w>>2]|0)+40>>2]&63](w)|0;continue}else{c[B>>2]=C+4;continue}}u=a[n]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[n+4>>2]|0}if((u|0)!=0?(p=c[s>>2]|0,(p-r|0)<160):0){C=c[q>>2]|0;c[s>>2]=p+4;c[p>>2]=C}c[j>>2]=Fj(z,c[t>>2]|0,h,f)|0;ph(n,r,c[s>>2]|0,h);if((w|0)==0){j=0;p=1}else{j=c[w+12>>2]|0;if((j|0)==(c[w+16>>2]|0)){j=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{j=c[j>>2]|0}p=(j|0)==-1;j=p?0:w;p=p?1:0}if((y|0)!=0){q=c[y+12>>2]|0;if((q|0)==(c[y+16>>2]|0)){q=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{q=c[q>>2]|0}if(!((q|0)==-1)){if(!p){k=71}}else{k=69}}else{k=69}if((k|0)==69?p:0){k=71}if((k|0)==71){c[h>>2]=c[h>>2]|2}c[b>>2]=j;if(!((a[m]&1)==0)?(l=c[o>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}h=c[n+8>>2]|0;if((h|0)==0){i=d;return}gk(h);i=d;return}function df(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+304|0;u=d+200|0;o=d;n=d+4|0;m=d+16|0;t=d+28|0;r=d+32|0;s=d+192|0;q=d+196|0;w=c[e>>2]|0;y=c[f>>2]|0;f=c[g+4>>2]&74;if((f|0)==0){f=0}else if((f|0)==64){f=8}else if((f|0)==8){f=16}else{f=10}nf(n,c[g+28>>2]|0,u,o);c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;wd(m,10);if((a[m]&1)==0){z=m+1|0;e=z;g=m+8|0}else{z=m+8|0;e=m+1|0;g=z;z=c[z>>2]|0}c[t>>2]=z;c[s>>2]=r;c[q>>2]=0;v=m+4|0;x=c[o>>2]|0;o=m+8|0;while(1){if((w|0)==0){A=1;w=0}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){A=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{A=c[A>>2]|0}B=(A|0)==-1;A=B?1:0;w=B?0:w}if((y|0)!=0){B=c[y+12>>2]|0;if((B|0)==(c[y+16>>2]|0)){B=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{B=c[B>>2]|0}if(!((B|0)==-1)){if(!A){break}}else{k=19}}else{k=19}if((k|0)==19){k=0;if(A){y=0;break}else{y=0}}C=a[m]|0;B=(C&1)==0;if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}if(((c[t>>2]|0)-z|0)==(A|0)){if(B){A=(C&255)>>>1}else{A=c[v>>2]|0}z=A<<1;do{if(!(A>>>0<z>>>0)){if(B){a[m+z+1|0]=0;a[m]=A<<2;break}else{a[(c[o>>2]|0)+z|0]=0;c[v>>2]=z;break}}else{wd(m,z-A|0)}}while(0);C=a[m]|0;if((C&1)==0){B=10}else{B=c[m>>2]|0;C=B&255;B=(B&-2)+ -1|0}z=(C&1)==0;if(z){C=(C&255)>>>1}else{C=c[v>>2]|0}do{if(!(C>>>0<B>>>0)){if(z){a[m+B+1|0]=0;a[m]=B<<1;break}else{a[(c[o>>2]|0)+B|0]=0;c[v>>2]=B;break}}else{wd(m,B-C|0)}}while(0);if((a[m]&1)==0){z=e}else{z=c[g>>2]|0}c[t>>2]=z+A}B=w+12|0;C=c[B>>2]|0;A=w+16|0;if((C|0)==(c[A>>2]|0)){C=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[C>>2]|0}if((jf(C,f,z,t,q,x,n,r,s,u)|0)!=0){break}C=c[B>>2]|0;if((C|0)==(c[A>>2]|0)){dc[c[(c[w>>2]|0)+40>>2]&63](w)|0;continue}else{c[B>>2]=C+4;continue}}u=a[n]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[n+4>>2]|0}if((u|0)!=0?(p=c[s>>2]|0,(p-r|0)<160):0){C=c[q>>2]|0;c[s>>2]=p+4;c[p>>2]=C}B=Ej(z,c[t>>2]|0,h,f)|0;C=j;c[C>>2]=B;c[C+4>>2]=H;ph(n,r,c[s>>2]|0,h);if((w|0)==0){j=0;p=1}else{j=c[w+12>>2]|0;if((j|0)==(c[w+16>>2]|0)){j=dc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{j=c[j>>2]|0}p=(j|0)==-1;j=p?0:w;p=p?1:0}if((y|0)!=0){q=c[y+12>>2]|0;if((q|0)==(c[y+16>>2]|0)){q=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{q=c[q>>2]|0}if(!((q|0)==-1)){if(!p){k=71}}else{k=69}}else{k=69}if((k|0)==69?p:0){k=71}if((k|0)==71){c[h>>2]=c[h>>2]|2}c[b>>2]=j;if(!((a[m]&1)==0)?(l=c[o>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}h=c[n+8>>2]|0;if((h|0)==0){i=d;return}gk(h);i=d;return}function ef(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;d=i;i=i+352|0;w=d+176|0;y=d+332|0;p=d+328|0;n=d+316|0;o=d+304|0;r=d+168|0;v=d+8|0;u=d+4|0;t=d;s=d+337|0;x=d+336|0;z=c[e>>2]|0;B=c[f>>2]|0;of(n,c[h+28>>2]|0,w,y,p);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;wd(o,10);if((a[o]&1)==0){C=o+1|0;f=C;e=o+8|0}else{C=o+8|0;f=o+1|0;e=C;C=c[C>>2]|0}c[r>>2]=C;c[u>>2]=v;c[t>>2]=0;a[s]=1;a[x]=69;h=o+4|0;y=c[y>>2]|0;A=c[p>>2]|0;p=o+8|0;while(1){if((z|0)==0){D=1;z=0}else{D=c[z+12>>2]|0;if((D|0)==(c[z+16>>2]|0)){D=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{D=c[D>>2]|0}E=(D|0)==-1;D=E?1:0;z=E?0:z}if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=dc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(!D){break}}else{m=15}}else{m=15}if((m|0)==15){m=0;if(D){B=0;break}else{B=0}}F=a[o]|0;E=(F&1)==0;if(E){D=(F&255)>>>1}else{D=c[h>>2]|0}if(((c[r>>2]|0)-C|0)==(D|0)){if(E){D=(F&255)>>>1}else{D=c[h>>2]|0}C=D<<1;do{if(!(D>>>0<C>>>0)){if(E){a[o+C+1|0]=0;a[o]=D<<2;break}else{a[(c[p>>2]|0)+C|0]=0;c[h>>2]=C;break}}else{wd(o,C-D|0)}}while(0);F=a[o]|0;if((F&1)==0){E=10}else{E=c[o>>2]|0;F=E&255;E=(E&-2)+ -1|0}C=(F&1)==0;if(C){F=(F&255)>>>1}else{F=c[h>>2]|0}do{if(!(F>>>0<E>>>0)){if(C){a[o+E+1|0]=0;a[o]=E<<1;break}else{a[(c[p>>2]|0)+E|0]=0;c[h>>2]=E;break}}else{wd(o,E-F|0)}}while(0);if((a[o]&1)==0){C=f}else{C=c[e>>2]|0}c[r>>2]=C+D}E=z+12|0;F=c[E>>2]|0;D=z+16|0;if((F|0)==(c[D>>2]|0)){F=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{F=c[F>>2]|0}if((pf(F,s,x,C,r,y,A,n,v,u,t,w)|0)!=0){break}F=c[E>>2]|0;if((F|0)==(c[D>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[E>>2]=F+4;continue}}w=a[n]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[n+4>>2]|0}if(((w|0)!=0?(a[s]|0)!=0:0)?(q=c[u>>2]|0,(q-v|0)<160):0){F=c[t>>2]|0;c[u>>2]=q+4;c[q>>2]=F}g[k>>2]=+Dj(C,c[r>>2]|0,j);ph(n,v,c[u>>2]|0,j);if((z|0)==0){q=0;k=1}else{q=c[z+12>>2]|0;if((q|0)==(c[z+16>>2]|0)){q=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{q=c[q>>2]|0}k=(q|0)==-1;q=k?0:z;k=k?1:0}if((B|0)!=0){r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){r=dc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{r=c[r>>2]|0}if(!((r|0)==-1)){if(!k){m=68}}else{m=66}}else{m=66}if((m|0)==66?k:0){m=68}if((m|0)==68){c[j>>2]=c[j>>2]|2}c[b>>2]=q;if(!((a[o]&1)==0)?(l=c[p>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}j=c[n+8>>2]|0;if((j|0)==0){i=d;return}gk(j);i=d;return}function ff(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;d=i;i=i+352|0;w=d+176|0;y=d+332|0;p=d+328|0;n=d+316|0;o=d+304|0;r=d+168|0;v=d+8|0;u=d+4|0;t=d;s=d+337|0;x=d+336|0;z=c[e>>2]|0;B=c[f>>2]|0;of(n,c[g+28>>2]|0,w,y,p);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;wd(o,10);if((a[o]&1)==0){C=o+1|0;f=C;e=o+8|0}else{C=o+8|0;f=o+1|0;e=C;C=c[C>>2]|0}c[r>>2]=C;c[u>>2]=v;c[t>>2]=0;a[s]=1;a[x]=69;g=o+4|0;y=c[y>>2]|0;A=c[p>>2]|0;p=o+8|0;while(1){if((z|0)==0){D=1;z=0}else{D=c[z+12>>2]|0;if((D|0)==(c[z+16>>2]|0)){D=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{D=c[D>>2]|0}E=(D|0)==-1;D=E?1:0;z=E?0:z}if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=dc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(!D){break}}else{m=15}}else{m=15}if((m|0)==15){m=0;if(D){B=0;break}else{B=0}}F=a[o]|0;E=(F&1)==0;if(E){D=(F&255)>>>1}else{D=c[g>>2]|0}if(((c[r>>2]|0)-C|0)==(D|0)){if(E){D=(F&255)>>>1}else{D=c[g>>2]|0}C=D<<1;do{if(!(D>>>0<C>>>0)){if(E){a[o+C+1|0]=0;a[o]=D<<2;break}else{a[(c[p>>2]|0)+C|0]=0;c[g>>2]=C;break}}else{wd(o,C-D|0)}}while(0);F=a[o]|0;if((F&1)==0){E=10}else{E=c[o>>2]|0;F=E&255;E=(E&-2)+ -1|0}C=(F&1)==0;if(C){F=(F&255)>>>1}else{F=c[g>>2]|0}do{if(!(F>>>0<E>>>0)){if(C){a[o+E+1|0]=0;a[o]=E<<1;break}else{a[(c[p>>2]|0)+E|0]=0;c[g>>2]=E;break}}else{wd(o,E-F|0)}}while(0);if((a[o]&1)==0){C=f}else{C=c[e>>2]|0}c[r>>2]=C+D}E=z+12|0;F=c[E>>2]|0;D=z+16|0;if((F|0)==(c[D>>2]|0)){F=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{F=c[F>>2]|0}if((pf(F,s,x,C,r,y,A,n,v,u,t,w)|0)!=0){break}F=c[E>>2]|0;if((F|0)==(c[D>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[E>>2]=F+4;continue}}w=a[n]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[n+4>>2]|0}if(((w|0)!=0?(a[s]|0)!=0:0)?(q=c[u>>2]|0,(q-v|0)<160):0){F=c[t>>2]|0;c[u>>2]=q+4;c[q>>2]=F}h[k>>3]=+Cj(C,c[r>>2]|0,j);ph(n,v,c[u>>2]|0,j);if((z|0)==0){q=0;k=1}else{q=c[z+12>>2]|0;if((q|0)==(c[z+16>>2]|0)){q=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{q=c[q>>2]|0}k=(q|0)==-1;q=k?0:z;k=k?1:0}if((B|0)!=0){r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){r=dc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{r=c[r>>2]|0}if(!((r|0)==-1)){if(!k){m=68}}else{m=66}}else{m=66}if((m|0)==66?k:0){m=68}if((m|0)==68){c[j>>2]=c[j>>2]|2}c[b>>2]=q;if(!((a[o]&1)==0)?(l=c[p>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}j=c[n+8>>2]|0;if((j|0)==0){i=d;return}gk(j);i=d;return}function gf(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;d=i;i=i+352|0;w=d+176|0;y=d+332|0;p=d+328|0;n=d+316|0;o=d+304|0;r=d+168|0;v=d+8|0;u=d+4|0;t=d;s=d+337|0;x=d+336|0;z=c[e>>2]|0;B=c[f>>2]|0;of(n,c[g+28>>2]|0,w,y,p);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;wd(o,10);if((a[o]&1)==0){C=o+1|0;f=C;e=o+8|0}else{C=o+8|0;f=o+1|0;e=C;C=c[C>>2]|0}c[r>>2]=C;c[u>>2]=v;c[t>>2]=0;a[s]=1;a[x]=69;g=o+4|0;y=c[y>>2]|0;A=c[p>>2]|0;p=o+8|0;while(1){if((z|0)==0){D=1;z=0}else{D=c[z+12>>2]|0;if((D|0)==(c[z+16>>2]|0)){D=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{D=c[D>>2]|0}E=(D|0)==-1;D=E?1:0;z=E?0:z}if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=dc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(!D){break}}else{m=15}}else{m=15}if((m|0)==15){m=0;if(D){B=0;break}else{B=0}}F=a[o]|0;E=(F&1)==0;if(E){D=(F&255)>>>1}else{D=c[g>>2]|0}if(((c[r>>2]|0)-C|0)==(D|0)){if(E){D=(F&255)>>>1}else{D=c[g>>2]|0}C=D<<1;do{if(!(D>>>0<C>>>0)){if(E){a[o+C+1|0]=0;a[o]=D<<2;break}else{a[(c[p>>2]|0)+C|0]=0;c[g>>2]=C;break}}else{wd(o,C-D|0)}}while(0);F=a[o]|0;if((F&1)==0){E=10}else{E=c[o>>2]|0;F=E&255;E=(E&-2)+ -1|0}C=(F&1)==0;if(C){F=(F&255)>>>1}else{F=c[g>>2]|0}do{if(!(F>>>0<E>>>0)){if(C){a[o+E+1|0]=0;a[o]=E<<1;break}else{a[(c[p>>2]|0)+E|0]=0;c[g>>2]=E;break}}else{wd(o,E-F|0)}}while(0);if((a[o]&1)==0){C=f}else{C=c[e>>2]|0}c[r>>2]=C+D}E=z+12|0;F=c[E>>2]|0;D=z+16|0;if((F|0)==(c[D>>2]|0)){F=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{F=c[F>>2]|0}if((pf(F,s,x,C,r,y,A,n,v,u,t,w)|0)!=0){break}F=c[E>>2]|0;if((F|0)==(c[D>>2]|0)){dc[c[(c[z>>2]|0)+40>>2]&63](z)|0;continue}else{c[E>>2]=F+4;continue}}w=a[n]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[n+4>>2]|0}if(((w|0)!=0?(a[s]|0)!=0:0)?(q=c[u>>2]|0,(q-v|0)<160):0){F=c[t>>2]|0;c[u>>2]=q+4;c[q>>2]=F}h[k>>3]=+Bj(C,c[r>>2]|0,j);ph(n,v,c[u>>2]|0,j);if((z|0)==0){q=0;k=1}else{q=c[z+12>>2]|0;if((q|0)==(c[z+16>>2]|0)){q=dc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{q=c[q>>2]|0}k=(q|0)==-1;q=k?0:z;k=k?1:0}if((B|0)!=0){r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){r=dc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{r=c[r>>2]|0}if(!((r|0)==-1)){if(!k){m=68}}else{m=66}}else{m=66}if((m|0)==66?k:0){m=68}if((m|0)==68){c[j>>2]=c[j>>2]|2}c[b>>2]=q;if(!((a[o]&1)==0)?(l=c[p>>2]|0,(l|0)!=0):0){gk(l)}if((a[n]&1)==0){i=d;return}j=c[n+8>>2]|0;if((j|0)==0){i=d;return}gk(j);i=d;return}function hf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+128|0;m=d;n=d+24|0;l=d+12|0;o=c[g+28>>2]|0;g=o+4|0;c[g>>2]=(c[g>>2]|0)+1;if(!((c[1158]|0)==-1)){c[m>>2]=4632;c[m+4>>2]=106;c[m+8>>2]=0;td(4632,m)}p=(c[4636>>2]|0)+ -1|0;q=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-q>>2>>>0>p>>>0)){A=Oa(4)|0;c[A>>2]=12496;Pb(A|0,12568,96)}p=c[q+(p<<2)>>2]|0;if((p|0)==0){A=Oa(4)|0;c[A>>2]=12496;Pb(A|0,12568,96)}jc[c[(c[p>>2]|0)+48>>2]&7](p,3200,3226|0,n)|0;A=c[g>>2]|0;c[g>>2]=A+ -1;if((A|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;wd(l,10);if((a[l]&1)==0){w=l+1|0;u=w;o=l+8|0}else{w=l+8|0;u=l+1|0;o=w;w=c[w>>2]|0}p=l+4|0;s=n+96|0;r=n+100|0;q=n+104|0;t=n;g=l+8|0;v=c[e>>2]|0;x=w;a:while(1){if((v|0)!=0){y=c[v+12>>2]|0;if((y|0)==(c[v+16>>2]|0)){y=dc[c[(c[v>>2]|0)+36>>2]&63](v)|0}else{y=c[y>>2]|0}if((y|0)==-1){c[e>>2]=0;v=0;y=1}else{y=0}}else{v=0;y=1}A=c[f>>2]|0;do{if((A|0)!=0){z=c[A+12>>2]|0;if((z|0)==(c[A+16>>2]|0)){z=dc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{z=c[z>>2]|0}if(!((z|0)==-1)){if(y){break}else{break a}}else{c[f>>2]=0;k=24;break}}else{k=24}}while(0);if((k|0)==24?(k=0,y):0){break}z=a[l]|0;y=(z&1)==0;if(y){A=(z&255)>>>1}else{A=c[p>>2]|0}if((x-w|0)==(A|0)){if(y){x=(z&255)>>>1}else{x=c[p>>2]|0}w=x<<1;do{if(!(x>>>0<w>>>0)){if(y){a[l+w+1|0]=0;a[l]=x<<2;break}else{a[(c[g>>2]|0)+w|0]=0;c[p>>2]=w;break}}else{wd(l,w-x|0)}}while(0);z=a[l]|0;if((z&1)==0){w=10}else{z=c[l>>2]|0;w=(z&-2)+ -1|0;z=z&255}y=(z&1)==0;if(y){z=(z&255)>>>1}else{z=c[p>>2]|0}do{if(!(z>>>0<w>>>0)){if(y){a[l+w+1|0]=0;a[l]=w<<1;break}else{a[(c[g>>2]|0)+w|0]=0;c[p>>2]=w;break}}else{wd(l,w-z|0)}}while(0);if((a[l]&1)==0){w=u}else{w=c[o>>2]|0}x=w+x|0}y=c[v+12>>2]|0;if((y|0)==(c[v+16>>2]|0)){y=dc[c[(c[v>>2]|0)+36>>2]&63](v)|0}else{y=c[y>>2]|0}v=(x|0)==(w|0);do{if(v){z=(c[s>>2]|0)==(y|0);if(!z?(c[r>>2]|0)!=(y|0):0){A=n;k=59;break}a[x]=z?43:45}else{A=n;k=59}}while(0);do{if((k|0)==59){while(1){k=0;z=A+4|0;if((c[A>>2]|0)==(y|0)){break}if((z|0)==(q|0)){A=q;break}else{A=z;k=59}}z=A-t|0;y=z>>2;if((z|0)>92){break a}if((z|0)<88){a[x]=a[3200+y|0]|0;break}if(v){w=x;break a}if((x-w|0)>=3){break a}if((a[x+ -1|0]|0)!=48){break a}a[x]=a[3200+y|0]|0}}while(0);x=x+1|0;v=c[e>>2]|0;z=v+12|0;y=c[z>>2]|0;if((y|0)==(c[v+16>>2]|0)){dc[c[(c[v>>2]|0)+40>>2]&63](v)|0;continue}else{c[z>>2]=y+4;continue}}a[w+3|0]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}A=c[1136]|0;c[m>>2]=j;if((Ve(w,A,m)|0)!=1){c[h>>2]=4}j=c[e>>2]|0;if((j|0)!=0){m=c[j+12>>2]|0;if((m|0)==(c[j+16>>2]|0)){m=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{m=c[m>>2]|0}if((m|0)==-1){c[e>>2]=0;j=0;e=1}else{e=0}}else{j=0;e=1}m=c[f>>2]|0;do{if((m|0)!=0){n=c[m+12>>2]|0;if((n|0)==(c[m+16>>2]|0)){m=dc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{m=c[n>>2]|0}if(!((m|0)==-1)){if(e){break}else{k=89;break}}else{c[f>>2]=0;k=87;break}}else{k=87}}while(0);if((k|0)==87?e:0){k=89}if((k|0)==89){c[h>>2]=c[h>>2]|2}c[b>>2]=j;if((a[l]&1)==0){i=d;return}h=c[g>>2]|0;if((h|0)==0){i=d;return}gk(h);i=d;return}function jf(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0;n=i;p=c[f>>2]|0;o=(p|0)==(e|0);do{if(o){q=(c[m+96>>2]|0)==(b|0);if(!q?(c[m+100>>2]|0)!=(b|0):0){break}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;q=0;i=n;return q|0}}while(0);q=a[j]|0;if((q&1)==0){j=(q&255)>>>1}else{j=c[j+4>>2]|0}if((j|0)!=0&(b|0)==(h|0)){o=c[l>>2]|0;if((o-k|0)>=160){q=0;i=n;return q|0}q=c[g>>2]|0;c[l>>2]=o+4;c[o>>2]=q;c[g>>2]=0;q=0;i=n;return q|0}l=m+104|0;k=m;while(1){h=k+4|0;if((c[k>>2]|0)==(b|0)){break}if((h|0)==(l|0)){k=l;break}else{k=h}}b=k-m|0;m=b>>2;if((b|0)>92){q=-1;i=n;return q|0}if((d|0)==10|(d|0)==8){if((m|0)>=(d|0)){q=-1;i=n;return q|0}}else if((d|0)==16?(b|0)>=88:0){if(o){q=-1;i=n;return q|0}if((p-e|0)>=3){q=-1;i=n;return q|0}if((a[p+ -1|0]|0)!=48){q=-1;i=n;return q|0}c[g>>2]=0;q=a[3200+m|0]|0;c[f>>2]=p+1;a[p]=q;q=0;i=n;return q|0}q=a[3200+m|0]|0;c[f>>2]=p+1;a[p]=q;c[g>>2]=(c[g>>2]|0)+1;q=0;i=n;return q|0}function kf(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+16|0;l=h;g=d+4|0;c[g>>2]=(c[g>>2]|0)+1;if(!((c[1160]|0)==-1)){c[l>>2]=4640;c[l+4>>2]=106;c[l+8>>2]=0;td(4640,l)}n=(c[4644>>2]|0)+ -1|0;j=d+12|0;k=d+8|0;m=c[k>>2]|0;if(!((c[j>>2]|0)-m>>2>>>0>n>>>0)){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}m=c[m+(n<<2)>>2]|0;if((m|0)==0){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}jc[c[(c[m>>2]|0)+32>>2]&7](m,3200,3226|0,e)|0;if(!((c[1196]|0)==-1)){c[l>>2]=4784;c[l+4>>2]=106;c[l+8>>2]=0;td(4784,l)}e=(c[4788>>2]|0)+ -1|0;k=c[k>>2]|0;if(!((c[j>>2]|0)-k>>2>>>0>e>>>0)){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}j=c[k+(e<<2)>>2]|0;if((j|0)==0){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}a[f]=dc[c[(c[j>>2]|0)+16>>2]&63](j)|0;bc[c[(c[j>>2]|0)+20>>2]&63](b,j);n=c[g>>2]|0;c[g>>2]=n+ -1;if((n|0)!=0){i=h;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);i=h;return}function lf(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+16|0;m=j;h=d+4|0;c[h>>2]=(c[h>>2]|0)+1;if(!((c[1160]|0)==-1)){c[m>>2]=4640;c[m+4>>2]=106;c[m+8>>2]=0;td(4640,m)}o=(c[4644>>2]|0)+ -1|0;k=d+12|0;l=d+8|0;n=c[l>>2]|0;if(!((c[k>>2]|0)-n>>2>>>0>o>>>0)){o=Oa(4)|0;c[o>>2]=12496;Pb(o|0,12568,96)}n=c[n+(o<<2)>>2]|0;if((n|0)==0){o=Oa(4)|0;c[o>>2]=12496;Pb(o|0,12568,96)}jc[c[(c[n>>2]|0)+32>>2]&7](n,3200,3232|0,e)|0;if(!((c[1196]|0)==-1)){c[m>>2]=4784;c[m+4>>2]=106;c[m+8>>2]=0;td(4784,m)}e=(c[4788>>2]|0)+ -1|0;l=c[l>>2]|0;if(!((c[k>>2]|0)-l>>2>>>0>e>>>0)){o=Oa(4)|0;c[o>>2]=12496;Pb(o|0,12568,96)}k=c[l+(e<<2)>>2]|0;if((k|0)==0){o=Oa(4)|0;c[o>>2]=12496;Pb(o|0,12568,96)}a[f]=dc[c[(c[k>>2]|0)+12>>2]&63](k)|0;a[g]=dc[c[(c[k>>2]|0)+16>>2]&63](k)|0;bc[c[(c[k>>2]|0)+20>>2]&63](b,k);o=c[h>>2]|0;c[h>>2]=o+ -1;if((o|0)!=0){i=j;return}ac[c[(c[d>>2]|0)+8>>2]&127](d);i=j;return}



function mf(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0;p=i;if(b<<24>>24==h<<24>>24){if((a[d]|0)==0){r=-1;i=p;return r|0}a[d]=0;r=c[g>>2]|0;c[g>>2]=r+1;a[r]=46;g=a[k]|0;if((g&1)==0){g=(g&255)>>>1}else{g=c[k+4>>2]|0}if((g|0)==0){r=0;i=p;return r|0}g=c[m>>2]|0;if((g-l|0)>=160){r=0;i=p;return r|0}r=c[n>>2]|0;c[m>>2]=g+4;c[g>>2]=r;r=0;i=p;return r|0}if(b<<24>>24==j<<24>>24){j=a[k]|0;if((j&1)==0){j=(j&255)>>>1}else{j=c[k+4>>2]|0}if((j|0)!=0){if((a[d]|0)==0){r=-1;i=p;return r|0}g=c[m>>2]|0;if((g-l|0)>=160){r=0;i=p;return r|0}r=c[n>>2]|0;c[m>>2]=g+4;c[g>>2]=r;c[n>>2]=0;r=0;i=p;return r|0}}r=o+32|0;h=o;while(1){j=h+1|0;if((a[h]|0)==b<<24>>24){break}if((j|0)==(r|0)){h=r;break}else{h=j}}b=h-o|0;if((b|0)>31){r=-1;i=p;return r|0}o=a[3200+b|0]|0;if((b|0)==24|(b|0)==25){n=c[g>>2]|0;if((n|0)!=(f|0)?(a[n+ -1|0]&95|0)!=(a[e]&127|0):0){r=-1;i=p;return r|0}c[g>>2]=n+1;a[n]=o;r=0;i=p;return r|0}else if((b|0)==23|(b|0)==22){a[e]=80;r=c[g>>2]|0;c[g>>2]=r+1;a[r]=o;r=0;i=p;return r|0}else{f=o&95;if((f|0)==(a[e]|0)?(a[e]=f|128,(a[d]|0)!=0):0){a[d]=0;e=a[k]|0;if((e&1)==0){k=(e&255)>>>1}else{k=c[k+4>>2]|0}if((k|0)!=0?(q=c[m>>2]|0,(q-l|0)<160):0){r=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=r}}r=c[g>>2]|0;c[g>>2]=r+1;a[r]=o;if((b|0)>21){r=0;i=p;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;i=p;return r|0}return 0}function nf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+16|0;k=g;f=b+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1158]|0)==-1)){c[k>>2]=4632;c[k+4>>2]=106;c[k+8>>2]=0;td(4632,k)}m=(c[4636>>2]|0)+ -1|0;h=b+12|0;j=b+8|0;l=c[j>>2]|0;if(!((c[h>>2]|0)-l>>2>>>0>m>>>0)){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}l=c[l+(m<<2)>>2]|0;if((l|0)==0){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}jc[c[(c[l>>2]|0)+48>>2]&7](l,3200,3226|0,d)|0;if(!((c[1198]|0)==-1)){c[k>>2]=4792;c[k+4>>2]=106;c[k+8>>2]=0;td(4792,k)}d=(c[4796>>2]|0)+ -1|0;j=c[j>>2]|0;if(!((c[h>>2]|0)-j>>2>>>0>d>>>0)){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}h=c[j+(d<<2)>>2]|0;if((h|0)==0){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}c[e>>2]=dc[c[(c[h>>2]|0)+16>>2]&63](h)|0;bc[c[(c[h>>2]|0)+20>>2]&63](a,h);m=c[f>>2]|0;c[f>>2]=m+ -1;if((m|0)!=0){i=g;return}ac[c[(c[b>>2]|0)+8>>2]&127](b);i=g;return}function of(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+16|0;l=h;g=b+4|0;c[g>>2]=(c[g>>2]|0)+1;if(!((c[1158]|0)==-1)){c[l>>2]=4632;c[l+4>>2]=106;c[l+8>>2]=0;td(4632,l)}n=(c[4636>>2]|0)+ -1|0;j=b+12|0;k=b+8|0;m=c[k>>2]|0;if(!((c[j>>2]|0)-m>>2>>>0>n>>>0)){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}m=c[m+(n<<2)>>2]|0;if((m|0)==0){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}jc[c[(c[m>>2]|0)+48>>2]&7](m,3200,3232|0,d)|0;if(!((c[1198]|0)==-1)){c[l>>2]=4792;c[l+4>>2]=106;c[l+8>>2]=0;td(4792,l)}d=(c[4796>>2]|0)+ -1|0;k=c[k>>2]|0;if(!((c[j>>2]|0)-k>>2>>>0>d>>>0)){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}j=c[k+(d<<2)>>2]|0;if((j|0)==0){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}c[e>>2]=dc[c[(c[j>>2]|0)+12>>2]&63](j)|0;c[f>>2]=dc[c[(c[j>>2]|0)+16>>2]&63](j)|0;bc[c[(c[j>>2]|0)+20>>2]&63](a,j);n=c[g>>2]|0;c[g>>2]=n+ -1;if((n|0)!=0){i=h;return}ac[c[(c[b>>2]|0)+8>>2]&127](b);i=h;return}function pf(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0;p=i;if((b|0)==(h|0)){if((a[d]|0)==0){r=-1;i=p;return r|0}a[d]=0;r=c[g>>2]|0;c[g>>2]=r+1;a[r]=46;g=a[k]|0;if((g&1)==0){g=(g&255)>>>1}else{g=c[k+4>>2]|0}if((g|0)==0){r=0;i=p;return r|0}g=c[m>>2]|0;if((g-l|0)>=160){r=0;i=p;return r|0}r=c[n>>2]|0;c[m>>2]=g+4;c[g>>2]=r;r=0;i=p;return r|0}if((b|0)==(j|0)){j=a[k]|0;if((j&1)==0){j=(j&255)>>>1}else{j=c[k+4>>2]|0}if((j|0)!=0){if((a[d]|0)==0){r=-1;i=p;return r|0}g=c[m>>2]|0;if((g-l|0)>=160){r=0;i=p;return r|0}r=c[n>>2]|0;c[m>>2]=g+4;c[g>>2]=r;c[n>>2]=0;r=0;i=p;return r|0}}r=o+128|0;h=o;while(1){j=h+4|0;if((c[h>>2]|0)==(b|0)){break}if((j|0)==(r|0)){h=r;break}else{h=j}}b=h-o|0;j=b>>2;if((b|0)>124){r=-1;i=p;return r|0}o=a[3200+j|0]|0;if((j|0)==24|(j|0)==25){n=c[g>>2]|0;if((n|0)!=(f|0)?(a[n+ -1|0]&95|0)!=(a[e]&127|0):0){r=-1;i=p;return r|0}c[g>>2]=n+1;a[n]=o;r=0;i=p;return r|0}else if(!((j|0)==23|(j|0)==22)){f=o&95;if((f|0)==(a[e]|0)?(a[e]=f|128,(a[d]|0)!=0):0){a[d]=0;e=a[k]|0;if((e&1)==0){k=(e&255)>>>1}else{k=c[k+4>>2]|0}if((k|0)!=0?(q=c[m>>2]|0,(q-l|0)<160):0){r=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=r}}}else{a[e]=80}r=c[g>>2]|0;c[g>>2]=r+1;a[r]=o;if((b|0)>84){r=0;i=p;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;i=p;return r|0}function qf(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function rf(a){a=a|0;return}function sf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+32|0;l=j;m=j+24|0;k=j+12|0;if((c[f+4>>2]&1|0)==0){n=c[(c[d>>2]|0)+24>>2]|0;c[m>>2]=c[e>>2];o=h&1;c[l+0>>2]=c[m+0>>2];lc[n&15](b,d,l,f,g,o);i=j;return}d=c[f+28>>2]|0;f=d+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1196]|0)==-1)){c[l>>2]=4784;c[l+4>>2]=106;c[l+8>>2]=0;td(4784,l)}g=(c[4788>>2]|0)+ -1|0;l=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-l>>2>>>0>g>>>0)){o=Oa(4)|0;c[o>>2]=12496;Pb(o|0,12568,96)}l=c[l+(g<<2)>>2]|0;if((l|0)==0){o=Oa(4)|0;c[o>>2]=12496;Pb(o|0,12568,96)}o=c[f>>2]|0;c[f>>2]=o+ -1;if((o|0)==0){ac[c[(c[d>>2]|0)+8>>2]&127](d)}f=c[l>>2]|0;if(h){bc[c[f+24>>2]&63](k,l)}else{bc[c[f+28>>2]&63](k,l)}n=a[k]|0;if((n&1)==0){f=k+1|0;d=f;l=k+8|0}else{l=k+8|0;d=c[l>>2]|0;f=k+1|0}h=k+4|0;while(1){m=(n&1)==0;if(m){g=f;n=(n&255)>>>1}else{g=c[l>>2]|0;n=c[h>>2]|0}if((d|0)==(g+n|0)){break}g=a[d]|0;o=c[e>>2]|0;do{if((o|0)!=0){n=o+24|0;m=c[n>>2]|0;if((m|0)!=(c[o+28>>2]|0)){c[n>>2]=m+1;a[m]=g;break}if((mc[c[(c[o>>2]|0)+52>>2]&15](o,g&255)|0)==-1){c[e>>2]=0}}}while(0);n=a[k]|0;d=d+1|0}c[b>>2]=c[e>>2];if(m){i=j;return}k=c[k+8>>2]|0;if((k|0)==0){i=j;return}gk(k);i=j;return}function tf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+64|0;r=j;q=j+52|0;n=j+40|0;l=j+16|0;d=j+8|0;k=j+4|0;o=j+12|0;a[q+0|0]=a[3448|0]|0;a[q+1|0]=a[3449|0]|0;a[q+2|0]=a[3450|0]|0;a[q+3|0]=a[3451|0]|0;a[q+4|0]=a[3452|0]|0;a[q+5|0]=a[3453|0]|0;t=q+1|0;p=f+4|0;s=c[p>>2]|0;if((s&2048|0)!=0){a[t]=43;t=q+2|0}if((s&512|0)!=0){a[t]=35;t=t+1|0}a[t]=108;t=t+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=100}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}u=c[1136]|0;c[r>>2]=h;q=uf(n,12,u,q,r)|0;h=n+q|0;p=c[p>>2]&176;do{if((p|0)==16){p=a[n]|0;if(p<<24>>24==43|p<<24>>24==45){p=n+1|0;break}if((q|0)>1&p<<24>>24==48?(u=a[n+1|0]|0,u<<24>>24==88|u<<24>>24==120):0){p=n+2|0}else{m=20}}else if((p|0)==32){p=h}else{m=20}}while(0);if((m|0)==20){p=n}m=c[f+28>>2]|0;c[o>>2]=m;m=m+4|0;c[m>>2]=(c[m>>2]|0)+1;vf(n,p,h,l,d,k,o);m=c[o>>2]|0;t=m+4|0;u=c[t>>2]|0;c[t>>2]=u+ -1;if((u|0)!=0){s=c[e>>2]|0;t=c[d>>2]|0;u=c[k>>2]|0;wf(b,s,l,t,u,f,g);i=j;return}ac[c[(c[m>>2]|0)+8>>2]&127](m);s=c[e>>2]|0;t=c[d>>2]|0;u=c[k>>2]|0;wf(b,s,l,t,u,f,g);i=j;return}function uf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;i=i+16|0;h=g;c[h>>2]=f;d=$a(d|0)|0;e=Db(a|0,b|0,e|0,h|0)|0;if((d|0)==0){i=g;return e|0}$a(d|0)|0;i=g;return e|0}function vf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;k=i;i=i+32|0;p=k;l=k+12|0;n=c[j>>2]|0;if(!((c[1160]|0)==-1)){c[p>>2]=4640;c[p+4>>2]=106;c[p+8>>2]=0;td(4640,p)}r=(c[4644>>2]|0)+ -1|0;s=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-s>>2>>>0>r>>>0)){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}n=c[s+(r<<2)>>2]|0;if((n|0)==0){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}j=c[j>>2]|0;if(!((c[1196]|0)==-1)){c[p>>2]=4784;c[p+4>>2]=106;c[p+8>>2]=0;td(4784,p)}p=(c[4788>>2]|0)+ -1|0;r=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-r>>2>>>0>p>>>0)){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}j=c[r+(p<<2)>>2]|0;if((j|0)==0){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}bc[c[(c[j>>2]|0)+20>>2]&63](l,j);p=a[l]|0;if((p&1)==0){p=(p&255)>>>1}else{p=c[l+4>>2]|0}if((p|0)!=0){c[h>>2]=f;p=a[b]|0;if(p<<24>>24==43|p<<24>>24==45){v=mc[c[(c[n>>2]|0)+28>>2]&15](n,p)|0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=v;p=b+1|0}else{p=b}if(((e-p|0)>1?(a[p]|0)==48:0)?(q=p+1|0,v=a[q]|0,v<<24>>24==88|v<<24>>24==120):0){v=mc[c[(c[n>>2]|0)+28>>2]&15](n,48)|0;u=c[h>>2]|0;c[h>>2]=u+1;a[u]=v;u=mc[c[(c[n>>2]|0)+28>>2]&15](n,a[q]|0)|0;v=c[h>>2]|0;c[h>>2]=v+1;a[v]=u;p=p+2|0}if((p|0)!=(e|0)?(o=e+ -1|0,o>>>0>p>>>0):0){q=p;do{v=a[q]|0;a[q]=a[o]|0;a[o]=v;q=q+1|0;o=o+ -1|0}while(q>>>0<o>>>0)}j=dc[c[(c[j>>2]|0)+16>>2]&63](j)|0;if(p>>>0<e>>>0){q=l+1|0;s=l+4|0;o=l+8|0;u=0;t=0;r=p;while(1){v=a[((a[l]&1)==0?q:c[o>>2]|0)+t|0]|0;if(v<<24>>24!=0&(u|0)==(v<<24>>24|0)){u=c[h>>2]|0;c[h>>2]=u+1;a[u]=j;u=a[l]|0;if((u&1)==0){v=(u&255)>>>1}else{v=c[s>>2]|0}u=0;t=(t>>>0<(v+ -1|0)>>>0)+t|0}w=mc[c[(c[n>>2]|0)+28>>2]&15](n,a[r]|0)|0;v=c[h>>2]|0;c[h>>2]=v+1;a[v]=w;r=r+1|0;if(!(r>>>0<e>>>0)){break}else{u=u+1|0}}}o=f+(p-b)|0;n=c[h>>2]|0;if((o|0)!=(n|0)?(m=n+ -1|0,m>>>0>o>>>0):0){do{w=a[o]|0;a[o]=a[m]|0;a[m]=w;o=o+1|0;m=m+ -1|0}while(o>>>0<m>>>0)}}else{jc[c[(c[n>>2]|0)+32>>2]&7](n,b,e,f)|0;c[h>>2]=f+(e-b)}if((d|0)==(e|0)){b=c[h>>2]|0}else{b=f+(d-b)|0}c[g>>2]=b;if((a[l]&1)==0){i=k;return}l=c[l+8>>2]|0;if((l|0)==0){i=k;return}gk(l);i=k;return}function wf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;i=i+16|0;l=k;if((d|0)==0){c[b>>2]=0;i=k;return}o=e;m=g-o|0;h=h+12|0;n=c[h>>2]|0;n=(n|0)>(m|0)?n-m|0:0;m=f;o=m-o|0;if((o|0)>0?(Zb[c[(c[d>>2]|0)+48>>2]&31](d,e,o)|0)!=(o|0):0){c[b>>2]=0;i=k;return}do{if((n|0)>0){do{if(!(n>>>0<11)){e=n+16&-16;o=(e|0)==0?1:e;while(1){p=fk(o)|0;if((p|0)!=0){o=14;break}p=c[3356]|0;c[3356]=p+0;if((p|0)==0){o=13;break}hc[p&0]()}if((o|0)==13){q=Oa(4)|0;c[q>>2]=13440;Pb(q|0,13488,104)}else if((o|0)==14){c[l+8>>2]=p;q=e|1;c[l>>2]=q;c[l+4>>2]=n;e=l;q=q&255;break}}else{q=n<<1&255;a[l]=q;e=l;p=l+1|0}}while(0);rk(p|0,j|0,n|0)|0;a[p+n|0]=0;if((q&1)==0){j=l+1|0}else{j=c[l+8>>2]|0}if((Zb[c[(c[d>>2]|0)+48>>2]&31](d,j,n)|0)==(n|0)){if((a[e]&1)==0){break}l=c[l+8>>2]|0;if((l|0)==0){break}gk(l);break}c[b>>2]=0;if((a[e]&1)==0){i=k;return}b=c[l+8>>2]|0;if((b|0)==0){i=k;return}gk(b);i=k;return}}while(0);l=g-m|0;if((l|0)>0?(Zb[c[(c[d>>2]|0)+48>>2]&31](d,f,l)|0)!=(l|0):0){c[b>>2]=0;i=k;return}c[h>>2]=0;c[b>>2]=d;i=k;return}function xf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+96|0;n=k+8|0;r=k;p=k+64|0;d=k+52|0;l=k+56|0;o=k+60|0;u=r;c[u>>2]=37;c[u+4>>2]=0;u=r+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[u]=43;u=r+2|0}if((s&512|0)!=0){a[u]=35;u=u+1|0}t=u+2|0;a[u]=108;a[u+1|0]=108;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=100}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}u=c[1136]|0;t=n;c[t>>2]=h;c[t+4>>2]=j;h=uf(p,22,u,r,n)|0;j=p+h|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[p]|0;if(q<<24>>24==43|q<<24>>24==45){q=p+1|0;break}if((h|0)>1&q<<24>>24==48?(u=a[p+1|0]|0,u<<24>>24==88|u<<24>>24==120):0){q=p+2|0}else{m=20}}else if((q|0)==32){q=j}else{m=20}}while(0);if((m|0)==20){q=p}m=c[f+28>>2]|0;c[o>>2]=m;m=m+4|0;c[m>>2]=(c[m>>2]|0)+1;vf(p,q,j,n,d,l,o);m=c[o>>2]|0;t=m+4|0;u=c[t>>2]|0;c[t>>2]=u+ -1;if((u|0)!=0){s=c[e>>2]|0;t=c[d>>2]|0;u=c[l>>2]|0;wf(b,s,n,t,u,f,g);i=k;return}ac[c[(c[m>>2]|0)+8>>2]&127](m);s=c[e>>2]|0;t=c[d>>2]|0;u=c[l>>2]|0;wf(b,s,n,t,u,f,g);i=k;return}function yf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;m=i;i=i+64|0;s=m;r=m+52|0;n=m+40|0;l=m+16|0;d=m+8|0;j=m+4|0;o=m+12|0;a[r+0|0]=a[3448|0]|0;a[r+1|0]=a[3449|0]|0;a[r+2|0]=a[3450|0]|0;a[r+3|0]=a[3451|0]|0;a[r+4|0]=a[3452|0]|0;a[r+5|0]=a[3453|0]|0;t=r+1|0;p=f+4|0;q=c[p>>2]|0;if((q&2048|0)!=0){a[t]=43;t=r+2|0}if((q&512|0)!=0){a[t]=35;t=t+1|0}a[t]=108;t=t+1|0;u=q&74;do{if((u|0)==8){if((q&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else if((u|0)==64){a[t]=111}else{a[t]=117}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}q=c[1136]|0;c[s>>2]=h;q=uf(n,12,q,r,s)|0;h=n+q|0;p=c[p>>2]&176;do{if((p|0)==16){p=a[n]|0;if(p<<24>>24==43|p<<24>>24==45){p=n+1|0;break}if((q|0)>1&p<<24>>24==48?(u=a[n+1|0]|0,u<<24>>24==88|u<<24>>24==120):0){p=n+2|0}else{k=20}}else if((p|0)==32){p=h}else{k=20}}while(0);if((k|0)==20){p=n}k=c[f+28>>2]|0;c[o>>2]=k;k=k+4|0;c[k>>2]=(c[k>>2]|0)+1;vf(n,p,h,l,d,j,o);k=c[o>>2]|0;t=k+4|0;u=c[t>>2]|0;c[t>>2]=u+ -1;if((u|0)!=0){s=c[e>>2]|0;t=c[d>>2]|0;u=c[j>>2]|0;wf(b,s,l,t,u,f,g);i=m;return}ac[c[(c[k>>2]|0)+8>>2]&127](k);s=c[e>>2]|0;t=c[d>>2]|0;u=c[j>>2]|0;wf(b,s,l,t,u,f,g);i=m;return}function zf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+96|0;n=k+8|0;r=k;p=k+64|0;d=k+52|0;l=k+56|0;o=k+60|0;u=r;c[u>>2]=37;c[u+4>>2]=0;u=r+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[u]=43;u=r+2|0}if((s&512|0)!=0){a[u]=35;u=u+1|0}t=u+2|0;a[u]=108;a[u+1|0]=108;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=117}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}u=c[1136]|0;t=n;c[t>>2]=h;c[t+4>>2]=j;h=uf(p,23,u,r,n)|0;j=p+h|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[p]|0;if(q<<24>>24==43|q<<24>>24==45){q=p+1|0;break}if((h|0)>1&q<<24>>24==48?(u=a[p+1|0]|0,u<<24>>24==88|u<<24>>24==120):0){q=p+2|0}else{m=20}}else if((q|0)==32){q=j}else{m=20}}while(0);if((m|0)==20){q=p}m=c[f+28>>2]|0;c[o>>2]=m;m=m+4|0;c[m>>2]=(c[m>>2]|0)+1;vf(p,q,j,n,d,l,o);m=c[o>>2]|0;t=m+4|0;u=c[t>>2]|0;c[t>>2]=u+ -1;if((u|0)!=0){s=c[e>>2]|0;t=c[d>>2]|0;u=c[l>>2]|0;wf(b,s,n,t,u,f,g);i=k;return}ac[c[(c[m>>2]|0)+8>>2]&127](m);s=c[e>>2]|0;t=c[d>>2]|0;u=c[l>>2]|0;wf(b,s,n,t,u,f,g);i=k;return}function Af(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;l=i;i=i+128|0;p=l+8|0;u=l;r=l+88|0;t=l+68|0;d=l+72|0;n=l+76|0;o=l+80|0;m=l+84|0;v=u;c[v>>2]=37;c[v+4>>2]=0;v=u+1|0;s=f+4|0;w=c[s>>2]|0;if((w&2048|0)!=0){a[v]=43;v=u+2|0}if((w&1024|0)!=0){a[v]=35;v=v+1|0}x=w&260;y=w>>>14;do{if((x|0)==260){if((y&1|0)==0){a[v]=97;v=0;break}else{a[v]=65;v=0;break}}else{a[v]=46;w=v+2|0;a[v+1|0]=42;if((x|0)==256){if((y&1|0)==0){a[w]=101;v=1;break}else{a[w]=69;v=1;break}}else if((x|0)==4){if((y&1|0)==0){a[w]=102;v=1;break}else{a[w]=70;v=1;break}}else{if((y&1|0)==0){a[w]=103;v=1;break}else{a[w]=71;v=1;break}}}}while(0);c[t>>2]=r;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;if(v){c[p>>2]=c[f+8>>2];y=p+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}else{h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}if((w|0)>29){w=(a[4552]|0)==0;if(v){if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;c[p>>2]=c[f+8>>2];y=p+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}else{if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;c[p>>2]=c[f+8>>2];y=p+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}t=c[t>>2]|0;if((t|0)==0){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else{v=t}}else{v=c[t>>2]|0;t=0}u=v+w|0;s=c[s>>2]&176;do{if((s|0)==32){s=u}else if((s|0)==16){s=a[v]|0;if(s<<24>>24==43|s<<24>>24==45){s=v+1|0;break}if((w|0)>1&s<<24>>24==48?(y=a[v+1|0]|0,y<<24>>24==88|y<<24>>24==120):0){s=v+2|0}else{q=44}}else{q=44}}while(0);if((q|0)==44){s=v}if((v|0)!=(r|0)){p=fk(w<<1)|0;if((p|0)==0){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else{r=v;q=p}}else{q=0}x=c[f+28>>2]|0;c[o>>2]=x;x=x+4|0;c[x>>2]=(c[x>>2]|0)+1;Cf(r,s,u,p,d,n,o);o=c[o>>2]|0;x=o+4|0;y=c[x>>2]|0;c[x>>2]=y+ -1;if((y|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}wf(m,c[e>>2]|0,p,c[d>>2]|0,c[n>>2]|0,f,g);y=c[m>>2]|0;c[e>>2]=y;c[b>>2]=y;if((q|0)!=0){gk(q)}if((t|0)==0){i=l;return}gk(t);i=l;return}function Bf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;b=$a(b|0)|0;d=xb(a|0,d|0,g|0)|0;if((b|0)==0){i=f;return d|0}$a(b|0)|0;i=f;return d|0}function Cf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;k=i;i=i+32|0;o=k;l=k+12|0;t=c[j>>2]|0;if(!((c[1160]|0)==-1)){c[o>>2]=4640;c[o+4>>2]=106;c[o+8>>2]=0;td(4640,o)}r=(c[4644>>2]|0)+ -1|0;m=c[t+8>>2]|0;if(!((c[t+12>>2]|0)-m>>2>>>0>r>>>0)){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}m=c[m+(r<<2)>>2]|0;if((m|0)==0){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}j=c[j>>2]|0;if(!((c[1196]|0)==-1)){c[o>>2]=4784;c[o+4>>2]=106;c[o+8>>2]=0;td(4784,o)}r=(c[4788>>2]|0)+ -1|0;o=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-o>>2>>>0>r>>>0)){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}o=c[o+(r<<2)>>2]|0;if((o|0)==0){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}bc[c[(c[o>>2]|0)+20>>2]&63](l,o);c[h>>2]=f;j=a[b]|0;if(j<<24>>24==43|j<<24>>24==45){y=mc[c[(c[m>>2]|0)+28>>2]&15](m,j)|0;t=c[h>>2]|0;c[h>>2]=t+1;a[t]=y;t=b+1|0}else{t=b}j=e;a:do{if(((j-t|0)>1?(a[t]|0)==48:0)?(q=t+1|0,y=a[q]|0,y<<24>>24==88|y<<24>>24==120):0){y=mc[c[(c[m>>2]|0)+28>>2]&15](m,48)|0;x=c[h>>2]|0;c[h>>2]=x+1;a[x]=y;t=t+2|0;x=mc[c[(c[m>>2]|0)+28>>2]&15](m,a[q]|0)|0;y=c[h>>2]|0;c[h>>2]=y+1;a[y]=x;if(t>>>0<e>>>0){r=t;while(1){q=a[r]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}u=r+1|0;if((Ra(q<<24>>24|0,c[1136]|0)|0)==0){q=t;break a}if(u>>>0<e>>>0){r=u}else{q=t;r=u;break}}}else{q=t;r=t}}else{s=14}}while(0);b:do{if((s|0)==14){if(t>>>0<e>>>0){r=t;while(1){q=a[r]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}s=r+1|0;if((pb(q<<24>>24|0,c[1136]|0)|0)==0){q=t;break b}if(s>>>0<e>>>0){r=s}else{q=t;r=s;break}}}else{q=t;r=t}}}while(0);s=a[l]|0;if((s&1)==0){s=(s&255)>>>1}else{s=c[l+4>>2]|0}if((s|0)!=0){if((q|0)!=(r|0)?(p=r+ -1|0,p>>>0>q>>>0):0){s=q;do{y=a[s]|0;a[s]=a[p]|0;a[p]=y;s=s+1|0;p=p+ -1|0}while(s>>>0<p>>>0)}p=dc[c[(c[o>>2]|0)+16>>2]&63](o)|0;if(q>>>0<r>>>0){v=l+1|0;u=l+4|0;t=l+8|0;x=0;w=0;s=q;while(1){y=a[((a[l]&1)==0?v:c[t>>2]|0)+w|0]|0;if(y<<24>>24>0&(x|0)==(y<<24>>24|0)){x=c[h>>2]|0;c[h>>2]=x+1;a[x]=p;x=a[l]|0;if((x&1)==0){y=(x&255)>>>1}else{y=c[u>>2]|0}x=0;w=(w>>>0<(y+ -1|0)>>>0)+w|0}z=mc[c[(c[m>>2]|0)+28>>2]&15](m,a[s]|0)|0;y=c[h>>2]|0;c[h>>2]=y+1;a[y]=z;s=s+1|0;if(!(s>>>0<r>>>0)){break}else{x=x+1|0}}}p=f+(q-b)|0;q=c[h>>2]|0;if((p|0)!=(q|0)?(n=q+ -1|0,n>>>0>p>>>0):0){do{z=a[p]|0;a[p]=a[n]|0;a[n]=z;p=p+1|0;n=n+ -1|0}while(p>>>0<n>>>0)}}else{jc[c[(c[m>>2]|0)+32>>2]&7](m,q,r,c[h>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+(r-q)}c:do{if(r>>>0<e>>>0){while(1){n=a[r]|0;if(n<<24>>24==46){break}y=mc[c[(c[m>>2]|0)+28>>2]&15](m,n)|0;z=c[h>>2]|0;c[h>>2]=z+1;a[z]=y;r=r+1|0;if(!(r>>>0<e>>>0)){break c}}y=dc[c[(c[o>>2]|0)+12>>2]&63](o)|0;z=c[h>>2]|0;c[h>>2]=z+1;a[z]=y;r=r+1|0}}while(0);jc[c[(c[m>>2]|0)+32>>2]&7](m,r,e,c[h>>2]|0)|0;m=(c[h>>2]|0)+(j-r)|0;c[h>>2]=m;if((d|0)!=(e|0)){m=f+(d-b)|0}c[g>>2]=m;if((a[l]&1)==0){i=k;return}l=c[l+8>>2]|0;if((l|0)==0){i=k;return}gk(l);i=k;return}function Df(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;l=i;i=i+128|0;p=l+8|0;u=l;r=l+88|0;t=l+68|0;m=l+72|0;d=l+76|0;o=l+80|0;n=l+84|0;x=u;c[x>>2]=37;c[x+4>>2]=0;x=u+1|0;s=f+4|0;v=c[s>>2]|0;if((v&2048|0)!=0){a[x]=43;x=u+2|0}if((v&1024|0)!=0){a[x]=35;x=x+1|0}w=v&260;v=v>>>14;do{if((w|0)==260){a[x]=76;w=x+1|0;if((v&1|0)==0){a[w]=97;v=0;break}else{a[w]=65;v=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;x=x+3|0;if((w|0)==4){if((v&1|0)==0){a[x]=102;v=1;break}else{a[x]=70;v=1;break}}else if((w|0)==256){if((v&1|0)==0){a[x]=101;v=1;break}else{a[x]=69;v=1;break}}else{if((v&1|0)==0){a[x]=103;v=1;break}else{a[x]=71;v=1;break}}}}while(0);c[t>>2]=r;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;if(v){c[p>>2]=c[f+8>>2];x=p+4|0;h[k>>3]=j;c[x>>2]=c[k>>2];c[x+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}else{h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}if((w|0)>29){w=(a[4552]|0)==0;if(v){if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;c[p>>2]=c[f+8>>2];x=p+4|0;h[k>>3]=j;c[x>>2]=c[k>>2];c[x+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}else{if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}t=c[t>>2]|0;if((t|0)==0){x=Oa(4)|0;c[x>>2]=13440;Pb(x|0,13488,104)}else{v=t}}else{v=c[t>>2]|0;t=0}u=v+w|0;s=c[s>>2]&176;do{if((s|0)==32){s=u}else if((s|0)==16){s=a[v]|0;if(s<<24>>24==43|s<<24>>24==45){s=v+1|0;break}if((w|0)>1&s<<24>>24==48?(x=a[v+1|0]|0,x<<24>>24==88|x<<24>>24==120):0){s=v+2|0}else{q=44}}else{q=44}}while(0);if((q|0)==44){s=v}if((v|0)!=(r|0)){p=fk(w<<1)|0;if((p|0)==0){x=Oa(4)|0;c[x>>2]=13440;Pb(x|0,13488,104)}else{r=v;q=p}}else{q=0}w=c[f+28>>2]|0;c[o>>2]=w;w=w+4|0;c[w>>2]=(c[w>>2]|0)+1;Cf(r,s,u,p,m,d,o);o=c[o>>2]|0;w=o+4|0;x=c[w>>2]|0;c[w>>2]=x+ -1;if((x|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}wf(n,c[e>>2]|0,p,c[m>>2]|0,c[d>>2]|0,f,g);x=c[n>>2]|0;c[e>>2]=x;c[b>>2]=x;if((q|0)!=0){gk(q)}if((t|0)==0){i=l;return}gk(t);i=l;return}function Ef(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;i=i+80|0;n=k;l=k+70|0;d=k+12|0;j=k+32|0;a[l+0|0]=a[3456|0]|0;a[l+1|0]=a[3457|0]|0;a[l+2|0]=a[3458|0]|0;a[l+3|0]=a[3459|0]|0;a[l+4|0]=a[3460|0]|0;a[l+5|0]=a[3461|0]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}m=c[1136]|0;c[n>>2]=h;l=uf(d,20,m,l,n)|0;h=d+l|0;m=c[f+4>>2]&176;do{if((m|0)==16){m=a[d]|0;if(m<<24>>24==43|m<<24>>24==45){m=d+1|0;break}if((l|0)>1&m<<24>>24==48?(q=a[d+1|0]|0,q<<24>>24==88|q<<24>>24==120):0){m=d+2|0}else{o=10}}else if((m|0)==32){m=h}else{o=10}}while(0);if((o|0)==10){m=d}o=c[f+28>>2]|0;p=o+4|0;c[p>>2]=(c[p>>2]|0)+1;if(!((c[1160]|0)==-1)){c[n>>2]=4640;c[n+4>>2]=106;c[n+8>>2]=0;td(4640,n)}q=(c[4644>>2]|0)+ -1|0;n=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-n>>2>>>0>q>>>0)){q=Oa(4)|0;c[q>>2]=12496;Pb(q|0,12568,96)}n=c[n+(q<<2)>>2]|0;if((n|0)==0){q=Oa(4)|0;c[q>>2]=12496;Pb(q|0,12568,96)}q=c[p>>2]|0;c[p>>2]=q+ -1;if((q|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}jc[c[(c[n>>2]|0)+32>>2]&7](n,d,h,j)|0;l=j+l|0;if((m|0)==(h|0)){q=l;p=c[e>>2]|0;wf(b,p,j,q,l,f,g);i=k;return}q=j+(m-d)|0;p=c[e>>2]|0;wf(b,p,j,q,l,f,g);i=k;return}function Ff(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Gf(a){a=a|0;return}function Hf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;l=j;m=j+24|0;k=j+12|0;if((c[f+4>>2]&1|0)==0){k=c[(c[d>>2]|0)+24>>2]|0;c[m>>2]=c[e>>2];n=h&1;c[l+0>>2]=c[m+0>>2];lc[k&15](b,d,l,f,g,n);i=j;return}m=c[f+28>>2]|0;g=m+4|0;c[g>>2]=(c[g>>2]|0)+1;if(!((c[1198]|0)==-1)){c[l>>2]=4792;c[l+4>>2]=106;c[l+8>>2]=0;td(4792,l)}l=(c[4796>>2]|0)+ -1|0;f=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-f>>2>>>0>l>>>0)){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}l=c[f+(l<<2)>>2]|0;if((l|0)==0){n=Oa(4)|0;c[n>>2]=12496;Pb(n|0,12568,96)}n=c[g>>2]|0;c[g>>2]=n+ -1;if((n|0)==0){ac[c[(c[m>>2]|0)+8>>2]&127](m)}m=c[l>>2]|0;if(h){bc[c[m+24>>2]&63](k,l)}else{bc[c[m+28>>2]&63](k,l)}d=a[k]|0;if((d&1)==0){h=k+4|0;m=h;l=k+8|0}else{l=k+8|0;m=c[l>>2]|0;h=k+4|0}while(1){g=(d&1)==0;if(g){f=h;d=(d&255)>>>1}else{f=c[l>>2]|0;d=c[h>>2]|0}if((m|0)==(f+(d<<2)|0)){break}n=c[m>>2]|0;g=c[e>>2]|0;if((g|0)!=0){f=g+24|0;d=c[f>>2]|0;if((d|0)==(c[g+28>>2]|0)){n=mc[c[(c[g>>2]|0)+52>>2]&15](g,n)|0}else{c[f>>2]=d+4;c[d>>2]=n}if((n|0)==-1){c[e>>2]=0}}d=a[k]|0;m=m+4|0}c[b>>2]=c[e>>2];if(g){i=j;return}b=c[k+8>>2]|0;if((b|0)==0){i=j;return}gk(b);i=j;return}function If(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=i;i=i+128|0;l=d;q=d+108|0;n=d+96|0;k=d+88|0;m=d+84|0;o=d+92|0;a[q+0|0]=a[3448|0]|0;a[q+1|0]=a[3449|0]|0;a[q+2|0]=a[3450|0]|0;a[q+3|0]=a[3451|0]|0;a[q+4|0]=a[3452|0]|0;a[q+5|0]=a[3453|0]|0;s=q+1|0;p=f+4|0;r=c[p>>2]|0;if((r&2048|0)!=0){a[s]=43;s=q+2|0}if((r&512|0)!=0){a[s]=35;s=s+1|0}a[s]=108;t=s+1|0;s=r&74;do{if((s|0)==64){a[t]=111}else if((s|0)==8){if((r&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=100}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}t=c[1136]|0;c[l>>2]=h;q=uf(n,12,t,q,l)|0;h=n+q|0;p=c[p>>2]&176;do{if((p|0)==32){p=h}else if((p|0)==16){p=a[n]|0;if(p<<24>>24==43|p<<24>>24==45){p=n+1|0;break}if((q|0)>1&p<<24>>24==48?(t=a[n+1|0]|0,t<<24>>24==88|t<<24>>24==120):0){p=n+2|0}else{j=20}}else{j=20}}while(0);if((j|0)==20){p=n}j=c[f+28>>2]|0;c[o>>2]=j;j=j+4|0;c[j>>2]=(c[j>>2]|0)+1;Jf(n,p,h,l,k,m,o);j=c[o>>2]|0;s=j+4|0;t=c[s>>2]|0;c[s>>2]=t+ -1;if((t|0)!=0){r=c[e>>2]|0;s=c[k>>2]|0;t=c[m>>2]|0;Kf(b,r,l,s,t,f,g);i=d;return}ac[c[(c[j>>2]|0)+8>>2]&127](j);r=c[e>>2]|0;s=c[k>>2]|0;t=c[m>>2]|0;Kf(b,r,l,s,t,f,g);i=d;return}function Jf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;k=i;i=i+32|0;o=k;l=k+12|0;s=c[j>>2]|0;if(!((c[1158]|0)==-1)){c[o>>2]=4632;c[o+4>>2]=106;c[o+8>>2]=0;td(4632,o)}r=(c[4636>>2]|0)+ -1|0;n=c[s+8>>2]|0;if(!((c[s+12>>2]|0)-n>>2>>>0>r>>>0)){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}n=c[n+(r<<2)>>2]|0;if((n|0)==0){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}j=c[j>>2]|0;if(!((c[1198]|0)==-1)){c[o>>2]=4792;c[o+4>>2]=106;c[o+8>>2]=0;td(4792,o)}r=(c[4796>>2]|0)+ -1|0;o=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-o>>2>>>0>r>>>0)){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}j=c[o+(r<<2)>>2]|0;if((j|0)==0){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}bc[c[(c[j>>2]|0)+20>>2]&63](l,j);o=a[l]|0;if((o&1)==0){o=(o&255)>>>1}else{o=c[l+4>>2]|0}if((o|0)!=0){c[h>>2]=f;o=a[b]|0;if(o<<24>>24==43|o<<24>>24==45){v=mc[c[(c[n>>2]|0)+44>>2]&15](n,o)|0;o=c[h>>2]|0;c[h>>2]=o+4;c[o>>2]=v;o=b+1|0}else{o=b}if(((e-o|0)>1?(a[o]|0)==48:0)?(q=o+1|0,v=a[q]|0,v<<24>>24==88|v<<24>>24==120):0){v=mc[c[(c[n>>2]|0)+44>>2]&15](n,48)|0;u=c[h>>2]|0;c[h>>2]=u+4;c[u>>2]=v;u=mc[c[(c[n>>2]|0)+44>>2]&15](n,a[q]|0)|0;v=c[h>>2]|0;c[h>>2]=v+4;c[v>>2]=u;o=o+2|0}if((o|0)!=(e|0)?(p=e+ -1|0,p>>>0>o>>>0):0){q=o;do{v=a[q]|0;a[q]=a[p]|0;a[p]=v;q=q+1|0;p=p+ -1|0}while(q>>>0<p>>>0)}q=dc[c[(c[j>>2]|0)+16>>2]&63](j)|0;if(o>>>0<e>>>0){p=l+1|0;j=l+4|0;r=l+8|0;t=0;u=0;s=o;while(1){v=a[((a[l]&1)==0?p:c[r>>2]|0)+u|0]|0;if(v<<24>>24!=0&(t|0)==(v<<24>>24|0)){t=c[h>>2]|0;c[h>>2]=t+4;c[t>>2]=q;t=a[l]|0;if((t&1)==0){v=(t&255)>>>1}else{v=c[j>>2]|0}t=0;u=(u>>>0<(v+ -1|0)>>>0)+u|0}x=mc[c[(c[n>>2]|0)+44>>2]&15](n,a[s]|0)|0;w=c[h>>2]|0;v=w+4|0;c[h>>2]=v;c[w>>2]=x;s=s+1|0;if(s>>>0<e>>>0){t=t+1|0}else{break}}}else{v=c[h>>2]|0}h=f+(o-b<<2)|0;if((h|0)!=(v|0)?(m=v+ -4|0,m>>>0>h>>>0):0){do{x=c[h>>2]|0;c[h>>2]=c[m>>2];c[m>>2]=x;h=h+4|0;m=m+ -4|0}while(h>>>0<m>>>0)}}else{jc[c[(c[n>>2]|0)+48>>2]&7](n,b,e,f)|0;v=f+(e-b<<2)|0;c[h>>2]=v}if((d|0)!=(e|0)){v=f+(d-b<<2)|0}c[g>>2]=v;if((a[l]&1)==0){i=k;return}l=c[l+8>>2]|0;if((l|0)==0){i=k;return}gk(l);i=k;return}function Kf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;i=i+16|0;l=k;if((d|0)==0){c[b>>2]=0;i=k;return}p=e;q=g-p>>2;h=h+12|0;n=c[h>>2]|0;o=n-q|0;n=(n|0)>(q|0)?o:0;m=f;q=m-p|0;p=q>>2;if((q|0)>0?(Zb[c[(c[d>>2]|0)+48>>2]&31](d,e,p)|0)!=(p|0):0){c[b>>2]=0;i=k;return}do{if((n|0)>0){if(n>>>0>1073741807){ud()}do{if(!(n>>>0<2)){e=n+4&-4;p=e<<2;p=(p|0)==0?1:p;while(1){q=fk(p)|0;if((q|0)!=0){p=16;break}q=c[3356]|0;c[3356]=q+0;if((q|0)==0){p=15;break}hc[q&0]()}if((p|0)==15){q=Oa(4)|0;c[q>>2]=13440;Pb(q|0,13488,104)}else if((p|0)==16){c[l+8>>2]=q;c[l>>2]=e|1;c[l+4>>2]=n;break}}else{a[l]=n<<1;o=1;q=l+4|0}}while(0);e=q;while(1){o=o+ -1|0;c[e>>2]=j;if((o|0)==0){break}else{e=e+4|0}}c[q+(n<<2)>>2]=0;if((a[l]&1)==0){j=l+4|0}else{j=c[l+8>>2]|0}if((Zb[c[(c[d>>2]|0)+48>>2]&31](d,j,n)|0)==(n|0)){if((a[l]&1)==0){break}l=c[l+8>>2]|0;if((l|0)==0){break}gk(l);break}c[b>>2]=0;if((a[l]&1)==0){i=k;return}b=c[l+8>>2]|0;if((b|0)==0){i=k;return}gk(b);i=k;return}}while(0);q=g-m|0;g=q>>2;if((q|0)>0?(Zb[c[(c[d>>2]|0)+48>>2]&31](d,f,g)|0)!=(g|0):0){c[b>>2]=0;i=k;return}c[h>>2]=0;c[b>>2]=d;i=k;return}function Lf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;m=i;i=i+208|0;l=m+8|0;s=m;o=m+184|0;d=m+172|0;k=m+176|0;p=m+180|0;u=s;c[u>>2]=37;c[u+4>>2]=0;u=s+1|0;q=f+4|0;r=c[q>>2]|0;if((r&2048|0)!=0){a[u]=43;u=s+2|0}if((r&512|0)!=0){a[u]=35;u=u+1|0}t=u+2|0;a[u]=108;a[u+1|0]=108;u=r&74;do{if((u|0)==8){if((r&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else if((u|0)==64){a[t]=111}else{a[t]=100}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}u=c[1136]|0;t=l;c[t>>2]=h;c[t+4>>2]=j;h=uf(o,22,u,s,l)|0;j=o+h|0;q=c[q>>2]&176;do{if((q|0)==32){q=j}else if((q|0)==16){q=a[o]|0;if(q<<24>>24==43|q<<24>>24==45){q=o+1|0;break}if((h|0)>1&q<<24>>24==48?(u=a[o+1|0]|0,u<<24>>24==88|u<<24>>24==120):0){q=o+2|0}else{n=20}}else{n=20}}while(0);if((n|0)==20){q=o}n=c[f+28>>2]|0;c[p>>2]=n;n=n+4|0;c[n>>2]=(c[n>>2]|0)+1;Jf(o,q,j,l,d,k,p);n=c[p>>2]|0;t=n+4|0;u=c[t>>2]|0;c[t>>2]=u+ -1;if((u|0)!=0){s=c[e>>2]|0;t=c[d>>2]|0;u=c[k>>2]|0;Kf(b,s,l,t,u,f,g);i=m;return}ac[c[(c[n>>2]|0)+8>>2]&127](n);s=c[e>>2]|0;t=c[d>>2]|0;u=c[k>>2]|0;Kf(b,s,l,t,u,f,g);i=m;return}function Mf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;l=i;i=i+128|0;k=l;r=l+108|0;n=l+96|0;d=l+88|0;j=l+84|0;o=l+92|0;a[r+0|0]=a[3448|0]|0;a[r+1|0]=a[3449|0]|0;a[r+2|0]=a[3450|0]|0;a[r+3|0]=a[3451|0]|0;a[r+4|0]=a[3452|0]|0;a[r+5|0]=a[3453|0]|0;s=r+1|0;p=f+4|0;q=c[p>>2]|0;if((q&2048|0)!=0){a[s]=43;s=r+2|0}if((q&512|0)!=0){a[s]=35;s=s+1|0}a[s]=108;s=s+1|0;t=q&74;do{if((t|0)==8){if((q&16384|0)==0){a[s]=120;break}else{a[s]=88;break}}else if((t|0)==64){a[s]=111}else{a[s]=117}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}q=c[1136]|0;c[k>>2]=h;q=uf(n,12,q,r,k)|0;h=n+q|0;p=c[p>>2]&176;do{if((p|0)==32){p=h}else if((p|0)==16){p=a[n]|0;if(p<<24>>24==43|p<<24>>24==45){p=n+1|0;break}if((q|0)>1&p<<24>>24==48?(t=a[n+1|0]|0,t<<24>>24==88|t<<24>>24==120):0){p=n+2|0}else{m=20}}else{m=20}}while(0);if((m|0)==20){p=n}m=c[f+28>>2]|0;c[o>>2]=m;m=m+4|0;c[m>>2]=(c[m>>2]|0)+1;Jf(n,p,h,k,d,j,o);m=c[o>>2]|0;s=m+4|0;t=c[s>>2]|0;c[s>>2]=t+ -1;if((t|0)!=0){r=c[e>>2]|0;s=c[d>>2]|0;t=c[j>>2]|0;Kf(b,r,k,s,t,f,g);i=l;return}ac[c[(c[m>>2]|0)+8>>2]&127](m);r=c[e>>2]|0;s=c[d>>2]|0;t=c[j>>2]|0;Kf(b,r,k,s,t,f,g);i=l;return}function Nf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+224|0;n=k+8|0;r=k;p=k+192|0;d=k+180|0;l=k+184|0;o=k+188|0;u=r;c[u>>2]=37;c[u+4>>2]=0;u=r+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[u]=43;u=r+2|0}if((s&512|0)!=0){a[u]=35;u=u+1|0}t=u+2|0;a[u]=108;a[u+1|0]=108;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=117}}while(0);if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}u=c[1136]|0;t=n;c[t>>2]=h;c[t+4>>2]=j;h=uf(p,23,u,r,n)|0;j=p+h|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[p]|0;if(q<<24>>24==43|q<<24>>24==45){q=p+1|0;break}if((h|0)>1&q<<24>>24==48?(u=a[p+1|0]|0,u<<24>>24==88|u<<24>>24==120):0){q=p+2|0}else{m=20}}else if((q|0)==32){q=j}else{m=20}}while(0);if((m|0)==20){q=p}m=c[f+28>>2]|0;c[o>>2]=m;m=m+4|0;c[m>>2]=(c[m>>2]|0)+1;Jf(p,q,j,n,d,l,o);m=c[o>>2]|0;t=m+4|0;u=c[t>>2]|0;c[t>>2]=u+ -1;if((u|0)!=0){s=c[e>>2]|0;t=c[d>>2]|0;u=c[l>>2]|0;Kf(b,s,n,t,u,f,g);i=k;return}ac[c[(c[m>>2]|0)+8>>2]&127](m);s=c[e>>2]|0;t=c[d>>2]|0;u=c[l>>2]|0;Kf(b,s,n,t,u,f,g);i=k;return}function Of(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+288|0;p=d+8|0;u=d;r=d+256|0;t=d+236|0;l=d+240|0;n=d+244|0;o=d+248|0;m=d+252|0;v=u;c[v>>2]=37;c[v+4>>2]=0;v=u+1|0;s=f+4|0;w=c[s>>2]|0;if((w&2048|0)!=0){a[v]=43;v=u+2|0}if((w&1024|0)!=0){a[v]=35;v=v+1|0}x=w&260;y=w>>>14;do{if((x|0)==260){if((y&1|0)==0){a[v]=97;v=0;break}else{a[v]=65;v=0;break}}else{a[v]=46;w=v+2|0;a[v+1|0]=42;if((x|0)==256){if((y&1|0)==0){a[w]=101;v=1;break}else{a[w]=69;v=1;break}}else if((x|0)==4){if((y&1|0)==0){a[w]=102;v=1;break}else{a[w]=70;v=1;break}}else{if((y&1|0)==0){a[w]=103;v=1;break}else{a[w]=71;v=1;break}}}}while(0);c[t>>2]=r;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;if(v){c[p>>2]=c[f+8>>2];y=p+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}else{h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}if((w|0)>29){w=(a[4552]|0)==0;if(v){if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;c[p>>2]=c[f+8>>2];y=p+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}else{if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;c[p>>2]=c[f+8>>2];y=p+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}t=c[t>>2]|0;if((t|0)==0){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else{v=t}}else{v=c[t>>2]|0;t=0}u=v+w|0;s=c[s>>2]&176;do{if((s|0)==16){s=a[v]|0;if(s<<24>>24==43|s<<24>>24==45){s=v+1|0;break}if((w|0)>1&s<<24>>24==48?(y=a[v+1|0]|0,y<<24>>24==88|y<<24>>24==120):0){s=v+2|0}else{q=44}}else if((s|0)==32){s=u}else{q=44}}while(0);if((q|0)==44){s=v}if((v|0)!=(r|0)){p=fk(w<<3)|0;if((p|0)==0){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else{r=v;q=p}}else{q=0}x=c[f+28>>2]|0;c[o>>2]=x;x=x+4|0;c[x>>2]=(c[x>>2]|0)+1;Pf(r,s,u,p,l,n,o);o=c[o>>2]|0;x=o+4|0;y=c[x>>2]|0;c[x>>2]=y+ -1;if((y|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}Kf(m,c[e>>2]|0,p,c[l>>2]|0,c[n>>2]|0,f,g);y=c[m>>2]|0;c[e>>2]=y;c[b>>2]=y;if((q|0)!=0){gk(q)}if((t|0)==0){i=d;return}gk(t);i=d;return}function Pf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+32|0;n=k;l=k+12|0;t=c[j>>2]|0;if(!((c[1158]|0)==-1)){c[n>>2]=4632;c[n+4>>2]=106;c[n+8>>2]=0;td(4632,n)}q=(c[4636>>2]|0)+ -1|0;m=c[t+8>>2]|0;if(!((c[t+12>>2]|0)-m>>2>>>0>q>>>0)){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}m=c[m+(q<<2)>>2]|0;if((m|0)==0){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}j=c[j>>2]|0;if(!((c[1198]|0)==-1)){c[n>>2]=4792;c[n+4>>2]=106;c[n+8>>2]=0;td(4792,n)}n=(c[4796>>2]|0)+ -1|0;q=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-q>>2>>>0>n>>>0)){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}j=c[q+(n<<2)>>2]|0;if((j|0)==0){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}bc[c[(c[j>>2]|0)+20>>2]&63](l,j);c[h>>2]=f;n=a[b]|0;if(n<<24>>24==43|n<<24>>24==45){y=mc[c[(c[m>>2]|0)+44>>2]&15](m,n)|0;t=c[h>>2]|0;c[h>>2]=t+4;c[t>>2]=y;t=b+1|0}else{t=b}n=e;a:do{if(((n-t|0)>1?(a[t]|0)==48:0)?(p=t+1|0,y=a[p]|0,y<<24>>24==88|y<<24>>24==120):0){y=mc[c[(c[m>>2]|0)+44>>2]&15](m,48)|0;x=c[h>>2]|0;c[h>>2]=x+4;c[x>>2]=y;t=t+2|0;x=mc[c[(c[m>>2]|0)+44>>2]&15](m,a[p]|0)|0;y=c[h>>2]|0;c[h>>2]=y+4;c[y>>2]=x;if(t>>>0<e>>>0){p=t;while(1){q=a[p]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}u=p+1|0;if((Ra(q<<24>>24|0,c[1136]|0)|0)==0){q=t;break a}if(u>>>0<e>>>0){p=u}else{q=t;p=u;break}}}else{q=t;p=t}}else{s=14}}while(0);b:do{if((s|0)==14){if(t>>>0<e>>>0){p=t;while(1){q=a[p]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}s=p+1|0;if((pb(q<<24>>24|0,c[1136]|0)|0)==0){q=t;break b}if(s>>>0<e>>>0){p=s}else{q=t;p=s;break}}}else{q=t;p=t}}}while(0);s=a[l]|0;if((s&1)==0){s=(s&255)>>>1}else{s=c[l+4>>2]|0}if((s|0)!=0){if((q|0)!=(p|0)?(r=p+ -1|0,r>>>0>q>>>0):0){s=q;do{y=a[s]|0;a[s]=a[r]|0;a[r]=y;s=s+1|0;r=r+ -1|0}while(s>>>0<r>>>0)}r=dc[c[(c[j>>2]|0)+16>>2]&63](j)|0;if(q>>>0<p>>>0){t=l+1|0;u=l+4|0;s=l+8|0;w=0;x=0;v=q;while(1){y=a[((a[l]&1)==0?t:c[s>>2]|0)+x|0]|0;if(y<<24>>24>0&(w|0)==(y<<24>>24|0)){w=c[h>>2]|0;c[h>>2]=w+4;c[w>>2]=r;w=a[l]|0;if((w&1)==0){y=(w&255)>>>1}else{y=c[u>>2]|0}w=0;x=(x>>>0<(y+ -1|0)>>>0)+x|0}A=mc[c[(c[m>>2]|0)+44>>2]&15](m,a[v]|0)|0;z=c[h>>2]|0;y=z+4|0;c[h>>2]=y;c[z>>2]=A;v=v+1|0;if(v>>>0<p>>>0){w=w+1|0}else{break}}}else{y=c[h>>2]|0}q=f+(q-b<<2)|0;if((q|0)!=(y|0)?(o=y+ -4|0,o>>>0>q>>>0):0){do{A=c[q>>2]|0;c[q>>2]=c[o>>2];c[o>>2]=A;q=q+4|0;o=o+ -4|0}while(q>>>0<o>>>0)}}else{jc[c[(c[m>>2]|0)+48>>2]&7](m,q,p,c[h>>2]|0)|0;y=(c[h>>2]|0)+(p-q<<2)|0;c[h>>2]=y}c:do{if(p>>>0<e>>>0){while(1){o=a[p]|0;if(o<<24>>24==46){break}z=mc[c[(c[m>>2]|0)+44>>2]&15](m,o)|0;A=c[h>>2]|0;y=A+4|0;c[h>>2]=y;c[A>>2]=z;p=p+1|0;if(!(p>>>0<e>>>0)){break c}}z=dc[c[(c[j>>2]|0)+12>>2]&63](j)|0;A=c[h>>2]|0;y=A+4|0;c[h>>2]=y;c[A>>2]=z;p=p+1|0}}while(0);jc[c[(c[m>>2]|0)+48>>2]&7](m,p,e,y)|0;m=(c[h>>2]|0)+(n-p<<2)|0;c[h>>2]=m;if((d|0)!=(e|0)){m=f+(d-b<<2)|0}c[g>>2]=m;if((a[l]&1)==0){i=k;return}g=c[l+8>>2]|0;if((g|0)==0){i=k;return}gk(g);i=k;return}function Qf(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;l=i;i=i+288|0;p=l+8|0;u=l;r=l+256|0;t=l+236|0;m=l+240|0;d=l+244|0;o=l+248|0;n=l+252|0;x=u;c[x>>2]=37;c[x+4>>2]=0;x=u+1|0;s=f+4|0;v=c[s>>2]|0;if((v&2048|0)!=0){a[x]=43;x=u+2|0}if((v&1024|0)!=0){a[x]=35;x=x+1|0}w=v&260;v=v>>>14;do{if((w|0)==260){a[x]=76;w=x+1|0;if((v&1|0)==0){a[w]=97;v=0;break}else{a[w]=65;v=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;x=x+3|0;if((w|0)==256){if((v&1|0)==0){a[x]=101;v=1;break}else{a[x]=69;v=1;break}}else if((w|0)==4){if((v&1|0)==0){a[x]=102;v=1;break}else{a[x]=70;v=1;break}}else{if((v&1|0)==0){a[x]=103;v=1;break}else{a[x]=71;v=1;break}}}}while(0);c[t>>2]=r;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;if(v){c[p>>2]=c[f+8>>2];x=p+4|0;h[k>>3]=j;c[x>>2]=c[k>>2];c[x+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}else{h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];w=uf(r,30,w,u,p)|0}if((w|0)>29){w=(a[4552]|0)==0;if(v){if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;c[p>>2]=c[f+8>>2];x=p+4|0;h[k>>3]=j;c[x>>2]=c[k>>2];c[x+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}else{if(w?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}w=c[1136]|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];w=Bf(t,w,u,p)|0}t=c[t>>2]|0;if((t|0)==0){x=Oa(4)|0;c[x>>2]=13440;Pb(x|0,13488,104)}else{v=t}}else{v=c[t>>2]|0;t=0}u=v+w|0;s=c[s>>2]&176;do{if((s|0)==32){s=u}else if((s|0)==16){s=a[v]|0;if(s<<24>>24==43|s<<24>>24==45){s=v+1|0;break}if((w|0)>1&s<<24>>24==48?(x=a[v+1|0]|0,x<<24>>24==88|x<<24>>24==120):0){s=v+2|0}else{q=44}}else{q=44}}while(0);if((q|0)==44){s=v}if((v|0)!=(r|0)){p=fk(w<<3)|0;if((p|0)==0){x=Oa(4)|0;c[x>>2]=13440;Pb(x|0,13488,104)}else{r=v;q=p}}else{q=0}w=c[f+28>>2]|0;c[o>>2]=w;w=w+4|0;c[w>>2]=(c[w>>2]|0)+1;Pf(r,s,u,p,m,d,o);o=c[o>>2]|0;w=o+4|0;x=c[w>>2]|0;c[w>>2]=x+ -1;if((x|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}Kf(n,c[e>>2]|0,p,c[m>>2]|0,c[d>>2]|0,f,g);x=c[n>>2]|0;c[e>>2]=x;c[b>>2]=x;if((q|0)!=0){gk(q)}if((t|0)==0){i=l;return}gk(t);i=l;return}function Rf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;i=i+192|0;n=k;l=k+180|0;j=k+160|0;d=k+12|0;a[l+0|0]=a[3456|0]|0;a[l+1|0]=a[3457|0]|0;a[l+2|0]=a[3458|0]|0;a[l+3|0]=a[3459|0]|0;a[l+4|0]=a[3460|0]|0;a[l+5|0]=a[3461|0]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}m=c[1136]|0;c[n>>2]=h;l=uf(j,20,m,l,n)|0;h=j+l|0;m=c[f+4>>2]&176;do{if((m|0)==32){m=h}else if((m|0)==16){m=a[j]|0;if(m<<24>>24==43|m<<24>>24==45){m=j+1|0;break}if((l|0)>1&m<<24>>24==48?(q=a[j+1|0]|0,q<<24>>24==88|q<<24>>24==120):0){m=j+2|0}else{o=10}}else{o=10}}while(0);if((o|0)==10){m=j}p=c[f+28>>2]|0;o=p+4|0;c[o>>2]=(c[o>>2]|0)+1;if(!((c[1158]|0)==-1)){c[n>>2]=4632;c[n+4>>2]=106;c[n+8>>2]=0;td(4632,n)}n=(c[4636>>2]|0)+ -1|0;q=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-q>>2>>>0>n>>>0)){q=Oa(4)|0;c[q>>2]=12496;Pb(q|0,12568,96)}n=c[q+(n<<2)>>2]|0;if((n|0)==0){q=Oa(4)|0;c[q>>2]=12496;Pb(q|0,12568,96)}q=c[o>>2]|0;c[o>>2]=q+ -1;if((q|0)==0){ac[c[(c[p>>2]|0)+8>>2]&127](p)}jc[c[(c[n>>2]|0)+48>>2]&7](n,j,h,d)|0;l=d+(l<<2)|0;if((m|0)==(h|0)){q=l;p=c[e>>2]|0;Kf(b,p,d,q,l,f,g);i=k;return}q=d+(m-j<<2)|0;p=c[e>>2]|0;Kf(b,p,d,q,l,f,g);i=k;return}function Sf(e,f,g,h,j,k,l,m,n){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;var o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;p=i;i=i+32|0;s=p;r=p+24|0;q=p+12|0;u=p+16|0;v=p+20|0;y=c[j+28>>2]|0;x=y+4|0;c[x>>2]=(c[x>>2]|0)+1;if(!((c[1160]|0)==-1)){c[s>>2]=4640;c[s+4>>2]=106;c[s+8>>2]=0;td(4640,s)}w=(c[4644>>2]|0)+ -1|0;z=c[y+8>>2]|0;if(!((c[y+12>>2]|0)-z>>2>>>0>w>>>0)){D=Oa(4)|0;c[D>>2]=12496;Pb(D|0,12568,96)}w=c[z+(w<<2)>>2]|0;if((w|0)==0){D=Oa(4)|0;c[D>>2]=12496;Pb(D|0,12568,96)}D=c[x>>2]|0;c[x>>2]=D+ -1;if((D|0)==0){ac[c[(c[y>>2]|0)+8>>2]&127](y)}c[k>>2]=0;a:do{if((m|0)!=(n|0)){x=w+8|0;y=g;b:while(1){if((y|0)!=0){if((c[y+12>>2]|0)==(c[y+16>>2]|0)){z=(dc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1;g=z?0:y;y=z?0:y}else{g=y}}else{g=0;y=0}z=(g|0)==0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)?(dc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1:0){o=17;break}if(!z){o=18;break b}}else{o=17}}while(0);if((o|0)==17){o=0;if(z){g=0;h=0;o=18;break}else{h=0}}c:do{if((Zb[c[(c[w>>2]|0)+36>>2]&31](w,a[m]|0,0)|0)<<24>>24==37){z=m+1|0;if((z|0)==(n|0)){o=21;break b}y=Zb[c[(c[w>>2]|0)+36>>2]&31](w,a[z]|0,0)|0;if(y<<24>>24==48|y<<24>>24==69){z=m+2|0;if((z|0)==(n|0)){o=24;break b}m=z;z=Zb[c[(c[w>>2]|0)+36>>2]&31](w,a[z]|0,0)|0}else{m=z;z=y;y=0}D=c[(c[f>>2]|0)+36>>2]|0;c[u>>2]=g;c[v>>2]=h;c[r+0>>2]=c[u+0>>2];c[s+0>>2]=c[v+0>>2];cc[D&3](q,f,r,s,j,k,l,z,y);m=m+1|0;g=c[q>>2]|0}else{z=a[m]|0;if(z<<24>>24>-1?(t=c[x>>2]|0,!((b[t+(z<<24>>24<<1)>>1]&8192)==0)):0){do{m=m+1|0;if((m|0)==(n|0)){m=n;break}z=a[m]|0;if(!(z<<24>>24>-1)){break}}while(!((b[t+(z<<24>>24<<1)>>1]&8192)==0));C=g;A=h;B=h;g=y;while(1){if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){z=(dc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1;y=z?0:C;g=z?0:g}else{y=C}}else{y=0}C=(y|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(C){z=A;break}else{break c}}if(!((dc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(C^(A|0)==0){z=A;B=A}else{break c}}else{z=0;h=0;o=42}}else{z=A;o=42}}while(0);if((o|0)==42){o=0;if(C){break c}else{B=0}}C=y+12|0;D=c[C>>2]|0;A=y+16|0;if((D|0)==(c[A>>2]|0)){D=dc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{D=d[D]|0}if(!((D&255)<<24>>24>-1)){break c}if((b[(c[x>>2]|0)+(D<<24>>24<<1)>>1]&8192)==0){break c}D=c[C>>2]|0;if((D|0)==(c[A>>2]|0)){dc[c[(c[y>>2]|0)+40>>2]&63](y)|0;C=y;A=z;continue}else{c[C>>2]=D+1;C=y;A=z;continue}}}A=g+12|0;B=c[A>>2]|0;z=g+16|0;if((B|0)==(c[z>>2]|0)){B=dc[c[(c[g>>2]|0)+36>>2]&63](g)|0}else{B=d[B]|0}D=mc[c[(c[w>>2]|0)+12>>2]&15](w,B&255)|0;if(!(D<<24>>24==(mc[c[(c[w>>2]|0)+12>>2]&15](w,a[m]|0)|0)<<24>>24)){o=60;break b}B=c[A>>2]|0;if((B|0)==(c[z>>2]|0)){dc[c[(c[g>>2]|0)+40>>2]&63](g)|0}else{c[A>>2]=B+1}m=m+1|0;g=y}}while(0);if((m|0)==(n|0)){break a}if((c[k>>2]|0)==0){y=g}else{break a}}if((o|0)==18){c[k>>2]=4;break}else if((o|0)==21){c[k>>2]=4;break}else if((o|0)==24){c[k>>2]=4;break}else if((o|0)==60){c[k>>2]=4;g=y;break}}}while(0);if((g|0)!=0){if((c[g+12>>2]|0)==(c[g+16>>2]|0)){D=(dc[c[(c[g>>2]|0)+36>>2]&63](g)|0)==-1;g=D?0:g}}else{g=0}q=(g|0)==0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)?(dc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1:0){o=68;break}if(q){c[e>>2]=g;i=p;return}}else{o=68}}while(0);if((o|0)==68?!q:0){c[e>>2]=g;i=p;return}c[k>>2]=c[k>>2]|2;c[e>>2]=g;i=p;return}function Tf(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Uf(a){a=a|0;return}function Vf(a){a=a|0;return 2}function Wf(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0;j=i;Sf(a,b,c[d>>2]|0,c[e>>2]|0,f,g,h,3560,3568|0);i=j;return}function Xf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0;k=i;m=d+8|0;m=dc[c[(c[m>>2]|0)+20>>2]&63](m)|0;n=a[m]|0;if((n&1)==0){l=m+1|0;m=(n&255)>>>1}else{l=c[m+8>>2]|0;m=c[m+4>>2]|0}Sf(b,d,c[e>>2]|0,c[f>>2]|0,g,h,j,l,l+m|0);i=k;return}function Yf(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;l=j;k=c[f+28>>2]|0;f=k+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1160]|0)==-1)){c[l>>2]=4640;c[l+4>>2]=106;c[l+8>>2]=0;td(4640,l)}m=(c[4644>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>m>>>0)){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}l=c[l+(m<<2)>>2]|0;if((l|0)==0){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}m=c[f>>2]|0;c[f>>2]=m+ -1;if((m|0)==0){ac[c[(c[k>>2]|0)+8>>2]&127](k)}m=c[e>>2]|0;e=b+8|0;e=dc[c[c[e>>2]>>2]&63](e)|0;e=(Je(d,m,e,e+168|0,l,g,0)|0)-e|0;if((e|0)>=168){m=c[d>>2]|0;c[a>>2]=m;i=j;return}c[h+24>>2]=((e|0)/12|0|0)%7|0;m=c[d>>2]|0;c[a>>2]=m;i=j;return}function Zf(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;l=j;k=c[f+28>>2]|0;f=k+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1160]|0)==-1)){c[l>>2]=4640;c[l+4>>2]=106;c[l+8>>2]=0;td(4640,l)}m=(c[4644>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>m>>>0)){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}l=c[l+(m<<2)>>2]|0;if((l|0)==0){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}m=c[f>>2]|0;c[f>>2]=m+ -1;if((m|0)==0){ac[c[(c[k>>2]|0)+8>>2]&127](k)}m=c[e>>2]|0;e=b+8|0;e=dc[c[(c[e>>2]|0)+4>>2]&63](e)|0;e=(Je(d,m,e,e+288|0,l,g,0)|0)-e|0;if((e|0)>=288){m=c[d>>2]|0;c[a>>2]=m;i=j;return}c[h+16>>2]=((e|0)/12|0|0)%12|0;m=c[d>>2]|0;c[a>>2]=m;i=j;return}function _f(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;k=b;f=c[f+28>>2]|0;j=f+4|0;c[j>>2]=(c[j>>2]|0)+1;if(!((c[1160]|0)==-1)){c[k>>2]=4640;c[k+4>>2]=106;c[k+8>>2]=0;td(4640,k)}l=(c[4644>>2]|0)+ -1|0;k=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-k>>2>>>0>l>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}k=c[k+(l<<2)>>2]|0;if((k|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}l=c[j>>2]|0;c[j>>2]=l+ -1;if((l|0)==0){ac[c[(c[f>>2]|0)+8>>2]&127](f)}e=ag(d,c[e>>2]|0,g,k,4)|0;if((c[g>>2]&4|0)!=0){l=c[d>>2]|0;c[a>>2]=l;i=b;return}if((e|0)<69){g=e+2e3|0}else{g=(e+ -69|0)>>>0<31?e+1900|0:e}c[h+20>>2]=g+ -1900;l=c[d>>2]|0;c[a>>2]=l;i=b;return}function $f(e,f,g,h,j,k,l,m,n){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;var o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;n=i;i=i+64|0;u=n;w=n+44|0;r=n+40|0;C=n+36|0;B=n+32|0;x=n+48|0;y=n+20|0;v=n+16|0;D=n+12|0;t=n+24|0;s=n+28|0;c[k>>2]=0;z=c[j+28>>2]|0;A=z+4|0;c[A>>2]=(c[A>>2]|0)+1;if(!((c[1160]|0)==-1)){c[u>>2]=4640;c[u+4>>2]=106;c[u+8>>2]=0;td(4640,u)}p=(c[4644>>2]|0)+ -1|0;E=c[z+8>>2]|0;if(!((c[z+12>>2]|0)-E>>2>>>0>p>>>0)){E=Oa(4)|0;c[E>>2]=12496;Pb(E|0,12568,96)}p=c[E+(p<<2)>>2]|0;if((p|0)==0){E=Oa(4)|0;c[E>>2]=12496;Pb(E|0,12568,96)}E=c[A>>2]|0;c[A>>2]=E+ -1;if((E|0)==0){ac[c[(c[z>>2]|0)+8>>2]&127](z)}a:do{switch(m<<24>>24|0){case 106:{o=ag(g,c[h>>2]|0,k,p,3)|0;p=c[k>>2]|0;if((p&4|0)==0&(o|0)<366){c[l+28>>2]=o;break a}else{c[k>>2]=p|4;break a}};case 73:{o=l+8|0;l=ag(g,c[h>>2]|0,k,p,2)|0;p=c[k>>2]|0;if((p&4|0)==0?(l+ -1|0)>>>0<12:0){c[o>>2]=l;break a}c[k>>2]=p|4;break};case 77:{o=ag(g,c[h>>2]|0,k,p,2)|0;p=c[k>>2]|0;if((p&4|0)==0&(o|0)<60){c[l+4>>2]=o;break a}else{c[k>>2]=p|4;break a}};case 104:case 66:case 98:{D=c[h>>2]|0;E=f+8|0;E=dc[c[(c[E>>2]|0)+4>>2]&63](E)|0;k=(Je(g,D,E,E+288|0,p,k,0)|0)-E|0;if((k|0)<288){c[l+16>>2]=((k|0)/12|0|0)%12|0}break};case 101:case 100:{o=l+12|0;l=ag(g,c[h>>2]|0,k,p,2)|0;p=c[k>>2]|0;if((p&4|0)==0?(l+ -1|0)>>>0<31:0){c[o>>2]=l;break a}c[k>>2]=p|4;break};case 68:{Sf(C,f,c[g>>2]|0,c[h>>2]|0,j,k,l,3568,3576|0);c[g>>2]=c[C>>2];break};case 72:{o=ag(g,c[h>>2]|0,k,p,2)|0;p=c[k>>2]|0;if((p&4|0)==0&(o|0)<24){c[l+8>>2]=o;break a}else{c[k>>2]=p|4;break a}};case 99:{p=f+8|0;p=dc[c[(c[p>>2]|0)+12>>2]&63](p)|0;q=a[p]|0;if((q&1)==0){o=p+1|0;p=(q&255)>>>1}else{o=c[p+8>>2]|0;p=c[p+4>>2]|0}Sf(r,f,c[g>>2]|0,c[h>>2]|0,j,k,l,o,o+p|0);c[g>>2]=c[r>>2];break};case 70:{Sf(B,f,c[g>>2]|0,c[h>>2]|0,j,k,l,3576,3584|0);c[g>>2]=c[B>>2];break};case 65:case 97:{D=c[h>>2]|0;E=f+8|0;E=dc[c[c[E>>2]>>2]&63](E)|0;k=(Je(g,D,E,E+168|0,p,k,0)|0)-E|0;if((k|0)<168){c[l+24>>2]=((k|0)/12|0|0)%7|0}break};case 109:{o=ag(g,c[h>>2]|0,k,p,2)|0;p=c[k>>2]|0;if((p&4|0)==0&(o|0)<13){c[l+16>>2]=o+ -1;break a}else{c[k>>2]=p|4;break a}};case 116:case 110:{l=p+8|0;p=c[h>>2]|0;b:while(1){h=c[g>>2]|0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)){if((dc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1){c[g>>2]=0;h=0;break}else{h=c[g>>2]|0;break}}}else{h=0}}while(0);h=(h|0)==0;do{if((p|0)!=0){if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(h){break}else{break b}}if(!((dc[c[(c[p>>2]|0)+36>>2]&63](p)|0)==-1)){if(!h){break b}}else{o=49}}else{o=49}}while(0);if((o|0)==49){o=0;if(h){p=0;break}else{p=0}}h=c[g>>2]|0;f=c[h+12>>2]|0;if((f|0)==(c[h+16>>2]|0)){h=dc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{h=d[f]|0}if(!((h&255)<<24>>24>-1)){break}if((b[(c[l>>2]|0)+(h<<24>>24<<1)>>1]&8192)==0){break}h=c[g>>2]|0;j=h+12|0;f=c[j>>2]|0;if((f|0)==(c[h+16>>2]|0)){dc[c[(c[h>>2]|0)+40>>2]&63](h)|0;continue}else{c[j>>2]=f+1;continue}}l=c[g>>2]|0;do{if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((dc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1){c[g>>2]=0;l=0;break}else{l=c[g>>2]|0;break}}}else{l=0}}while(0);l=(l|0)==0;do{if((p|0)!=0){if((c[p+12>>2]|0)==(c[p+16>>2]|0)?(dc[c[(c[p>>2]|0)+36>>2]&63](p)|0)==-1:0){o=68;break}if(l){break a}}else{o=68}}while(0);if((o|0)==68?!l:0){break a}c[k>>2]=c[k>>2]|2;break};case 121:{o=l+20|0;l=ag(g,c[h>>2]|0,k,p,4)|0;if((c[k>>2]&4|0)==0){if((l|0)<69){k=l+2e3|0}else{k=(l+ -69|0)>>>0<31?l+1900|0:l}c[o>>2]=k+ -1900}break};case 112:{o=l+8|0;l=c[h>>2]|0;h=f+8|0;h=dc[c[(c[h>>2]|0)+8>>2]&63](h)|0;f=a[h]|0;if((f&1)==0){f=(f&255)>>>1}else{f=c[h+4>>2]|0}j=a[h+12|0]|0;if((j&1)==0){j=(j&255)>>>1}else{j=c[h+16>>2]|0}if((f|0)==(0-j|0)){c[k>>2]=c[k>>2]|4;break a}E=Je(g,l,h,h+24|0,p,k,0)|0;k=E-h|0;if((E|0)==(h|0)?(c[o>>2]|0)==12:0){c[o>>2]=0;break a}if((k|0)==12?(q=c[o>>2]|0,(q|0)<12):0){c[o>>2]=q+12}break};case 119:{o=ag(g,c[h>>2]|0,k,p,1)|0;p=c[k>>2]|0;if((p&4|0)==0&(o|0)<7){c[l+24>>2]=o;break a}else{c[k>>2]=p|4;break a}};case 82:{Sf(y,f,c[g>>2]|0,c[h>>2]|0,j,k,l,3600,3605|0);c[g>>2]=c[y>>2];break};case 89:{o=ag(g,c[h>>2]|0,k,p,4)|0;if((c[k>>2]&4|0)==0){c[l+20>>2]=o+ -1900}break};case 88:{p=f+8|0;p=dc[c[(c[p>>2]|0)+24>>2]&63](p)|0;q=a[p]|0;if((q&1)==0){o=p+1|0;p=(q&255)>>>1}else{o=c[p+8>>2]|0;p=c[p+4>>2]|0}Sf(s,f,c[g>>2]|0,c[h>>2]|0,j,k,l,o,o+p|0);c[g>>2]=c[s>>2];break};case 83:{o=ag(g,c[h>>2]|0,k,p,2)|0;p=c[k>>2]|0;if((p&4|0)==0&(o|0)<61){c[l>>2]=o;break a}else{c[k>>2]=p|4;break a}};case 120:{E=c[(c[f>>2]|0)+20>>2]|0;c[D>>2]=c[g>>2];c[t>>2]=c[h>>2];c[w+0>>2]=c[D+0>>2];c[u+0>>2]=c[t+0>>2];_b[E&63](e,f,w,u,j,k,l);i=n;return};case 84:{Sf(v,f,c[g>>2]|0,c[h>>2]|0,j,k,l,3608,3616|0);c[g>>2]=c[v>>2];break};case 114:{Sf(x,f,c[g>>2]|0,c[h>>2]|0,j,k,l,3584,3595|0);c[g>>2]=c[x>>2];break};case 37:{l=c[h>>2]|0;h=c[g>>2]|0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)){if((dc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1){c[g>>2]=0;h=0;break}else{h=c[g>>2]|0;break}}}else{h=0}}while(0);h=(h|0)==0;do{if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(dc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1:0){o=114;break}if(!h){o=115}}else{o=114}}while(0);if((o|0)==114){if(h){o=115}else{l=0}}if((o|0)==115){c[k>>2]=c[k>>2]|6;break a}h=c[g>>2]|0;f=c[h+12>>2]|0;if((f|0)==(c[h+16>>2]|0)){h=dc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{h=d[f]|0}if(!((Zb[c[(c[p>>2]|0)+36>>2]&31](p,h&255,0)|0)<<24>>24==37)){c[k>>2]=c[k>>2]|4;break a}f=c[g>>2]|0;p=f+12|0;h=c[p>>2]|0;if((h|0)==(c[f+16>>2]|0)){dc[c[(c[f>>2]|0)+40>>2]&63](f)|0}else{c[p>>2]=h+1}p=c[g>>2]|0;do{if((p|0)!=0){if((c[p+12>>2]|0)==(c[p+16>>2]|0)){if((dc[c[(c[p>>2]|0)+36>>2]&63](p)|0)==-1){c[g>>2]=0;p=0;break}else{p=c[g>>2]|0;break}}}else{p=0}}while(0);p=(p|0)==0;do{if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(dc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1:0){o=133;break}if(p){break a}}else{o=133}}while(0);if((o|0)==133?!p:0){break a}c[k>>2]=c[k>>2]|2;break};default:{c[k>>2]=c[k>>2]|4}}}while(0);c[e>>2]=c[g>>2];i=n;return}function ag(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;l=c[a>>2]|0;do{if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((dc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1){c[a>>2]=0;l=0;break}else{l=c[a>>2]|0;break}}}else{l=0}}while(0);l=(l|0)==0;do{if((e|0)!=0){if((c[e+12>>2]|0)==(c[e+16>>2]|0)?(dc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1:0){m=10;break}if(!l){m=11}}else{m=10}}while(0);if((m|0)==10){if(l){m=11}else{e=0}}if((m|0)==11){c[f>>2]=c[f>>2]|6;p=0;i=j;return p|0}m=c[a>>2]|0;l=c[m+12>>2]|0;if((l|0)==(c[m+16>>2]|0)){m=dc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{m=d[l]|0}l=m&255;if(l<<24>>24>-1?(k=g+8|0,!((b[(c[k>>2]|0)+(m<<24>>24<<1)>>1]&2048)==0)):0){l=(Zb[c[(c[g>>2]|0)+36>>2]&31](g,l,0)|0)<<24>>24;o=c[a>>2]|0;n=o+12|0;m=c[n>>2]|0;if((m|0)==(c[o+16>>2]|0)){dc[c[(c[o>>2]|0)+40>>2]&63](o)|0;n=e;m=e}else{c[n>>2]=m+1;n=e;m=e}while(1){l=l+ -48|0;h=h+ -1|0;e=c[a>>2]|0;do{if((e|0)!=0){if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((dc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1){c[a>>2]=0;e=0;break}else{e=c[a>>2]|0;break}}}else{e=0}}while(0);o=(e|0)==0;if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)){m=(dc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1;e=m?0:n;m=m?0:n}else{e=n}}else{e=n;m=0}n=c[a>>2]|0;if(!((o^(m|0)==0)&(h|0)>0)){m=38;break}o=c[n+12>>2]|0;if((o|0)==(c[n+16>>2]|0)){n=dc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{n=d[o]|0}o=n&255;if(!(o<<24>>24>-1)){m=49;break}if((b[(c[k>>2]|0)+(n<<24>>24<<1)>>1]&2048)==0){m=49;break}l=((Zb[c[(c[g>>2]|0)+36>>2]&31](g,o,0)|0)<<24>>24)+(l*10|0)|0;n=c[a>>2]|0;o=n+12|0;p=c[o>>2]|0;if((p|0)==(c[n+16>>2]|0)){dc[c[(c[n>>2]|0)+40>>2]&63](n)|0;n=e;continue}else{c[o>>2]=p+1;n=e;continue}}if((m|0)==38){do{if((n|0)!=0){if((c[n+12>>2]|0)==(c[n+16>>2]|0)){if((dc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1){c[a>>2]=0;n=0;break}else{n=c[a>>2]|0;break}}}else{n=0}}while(0);g=(n|0)==0;do{if((e|0)!=0){if((c[e+12>>2]|0)==(c[e+16>>2]|0)?(dc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1:0){m=47;break}if(g){p=l;i=j;return p|0}}else{m=47}}while(0);if((m|0)==47?!g:0){p=l;i=j;return p|0}c[f>>2]=c[f>>2]|2;p=l;i=j;return p|0}else if((m|0)==49){i=j;return l|0}}c[f>>2]=c[f>>2]|4;p=0;i=j;return p|0}function bg(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;l=i;i=i+32|0;p=l;r=l+24|0;q=l+12|0;o=l+16|0;n=l+20|0;t=c[f+28>>2]|0;u=t+4|0;c[u>>2]=(c[u>>2]|0)+1;if(!((c[1158]|0)==-1)){c[p>>2]=4632;c[p+4>>2]=106;c[p+8>>2]=0;td(4632,p)}v=(c[4636>>2]|0)+ -1|0;s=c[t+8>>2]|0;if(!((c[t+12>>2]|0)-s>>2>>>0>v>>>0)){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}s=c[s+(v<<2)>>2]|0;if((s|0)==0){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}y=c[u>>2]|0;c[u>>2]=y+ -1;if((y|0)==0){ac[c[(c[t>>2]|0)+8>>2]&127](t)}c[g>>2]=0;a:do{if((j|0)!=(k|0)){t=d;b:while(1){if((t|0)==0){u=1;d=0;t=0}else{d=c[t+12>>2]|0;if((d|0)==(c[t+16>>2]|0)){d=dc[c[(c[t>>2]|0)+36>>2]&63](t)|0}else{d=c[d>>2]|0}v=(d|0)==-1;u=v?1:0;d=v?0:t;t=v?0:t}if((e|0)!=0){v=c[e+12>>2]|0;if((v|0)==(c[e+16>>2]|0)){v=dc[c[(c[e>>2]|0)+36>>2]&63](e)|0}else{v=c[v>>2]|0}if(!((v|0)==-1)){if(!u){m=22;break}}else{m=20}}else{m=20}if((m|0)==20){m=0;if(u){e=0;m=22;break}else{e=0}}c:do{if((Zb[c[(c[s>>2]|0)+52>>2]&31](s,c[j>>2]|0,0)|0)<<24>>24==37){u=j+4|0;if((u|0)==(k|0)){m=25;break b}t=Zb[c[(c[s>>2]|0)+52>>2]&31](s,c[u>>2]|0,0)|0;if(t<<24>>24==48|t<<24>>24==69){u=j+8|0;if((u|0)==(k|0)){m=28;break b}j=u;u=Zb[c[(c[s>>2]|0)+52>>2]&31](s,c[u>>2]|0,0)|0}else{j=u;u=t;t=0}y=c[(c[b>>2]|0)+36>>2]|0;c[o>>2]=d;c[n>>2]=e;c[r+0>>2]=c[o+0>>2];c[p+0>>2]=c[n+0>>2];cc[y&3](q,b,r,p,f,g,h,u,t);j=j+4|0;d=c[q>>2]|0}else{if(!(Zb[c[(c[s>>2]|0)+12>>2]&31](s,8192,c[j>>2]|0)|0)){v=d+12|0;w=c[v>>2]|0;u=d+16|0;if((w|0)==(c[u>>2]|0)){w=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{w=c[w>>2]|0}y=mc[c[(c[s>>2]|0)+28>>2]&15](s,w)|0;if((y|0)!=(mc[c[(c[s>>2]|0)+28>>2]&15](s,c[j>>2]|0)|0)){m=64;break b}w=c[v>>2]|0;if((w|0)==(c[u>>2]|0)){dc[c[(c[d>>2]|0)+40>>2]&63](d)|0}else{c[v>>2]=w+4}j=j+4|0;d=t;break}do{j=j+4|0;if((j|0)==(k|0)){j=k;break}}while(Zb[c[(c[s>>2]|0)+12>>2]&31](s,8192,c[j>>2]|0)|0);u=e;v=e;while(1){if((d|0)==0){w=1;d=0}else{w=c[d+12>>2]|0;if((w|0)==(c[d+16>>2]|0)){w=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{w=c[w>>2]|0}x=(w|0)==-1;w=x?1:0;d=x?0:d;t=x?0:t}if((v|0)!=0){x=c[v+12>>2]|0;if((x|0)==(c[v+16>>2]|0)){v=dc[c[(c[v>>2]|0)+36>>2]&63](v)|0}else{v=c[x>>2]|0}if(!((v|0)==-1)){if(w^(u|0)==0){w=u;v=u}else{d=t;break c}}else{u=0;e=0;m=47}}else{m=47}if((m|0)==47){m=0;if(w){d=t;break c}else{w=u;v=0}}u=d+12|0;y=c[u>>2]|0;x=d+16|0;if((y|0)==(c[x>>2]|0)){y=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{y=c[y>>2]|0}if(!(Zb[c[(c[s>>2]|0)+12>>2]&31](s,8192,y)|0)){d=t;break c}y=c[u>>2]|0;if((y|0)==(c[x>>2]|0)){dc[c[(c[d>>2]|0)+40>>2]&63](d)|0;u=w;continue}else{c[u>>2]=y+4;u=w;continue}}}}while(0);if((j|0)==(k|0)){break a}if((c[g>>2]|0)==0){t=d}else{break a}}if((m|0)==22){c[g>>2]=4;break}else if((m|0)==25){c[g>>2]=4;break}else if((m|0)==28){c[g>>2]=4;break}else if((m|0)==64){c[g>>2]=4;d=t;break}}}while(0);if((d|0)==0){n=0;o=1}else{n=c[d+12>>2]|0;if((n|0)==(c[d+16>>2]|0)){n=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{n=c[n>>2]|0}o=(n|0)==-1;n=o?0:d;o=o?1:0}if((e|0)!=0){b=c[e+12>>2]|0;if((b|0)==(c[e+16>>2]|0)){b=dc[c[(c[e>>2]|0)+36>>2]&63](e)|0}else{b=c[b>>2]|0}if(!((b|0)==-1)){if(o){c[a>>2]=n;i=l;return}}else{m=75}}else{m=75}if((m|0)==75?!o:0){c[a>>2]=n;i=l;return}c[g>>2]=c[g>>2]|2;c[a>>2]=n;i=l;return}function cg(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function dg(a){a=a|0;return}function eg(a){a=a|0;return 2}function fg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0;j=i;bg(a,b,c[d>>2]|0,c[e>>2]|0,f,g,h,3712,3744|0);i=j;return}function gg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0;k=i;m=d+8|0;m=dc[c[(c[m>>2]|0)+20>>2]&63](m)|0;n=a[m]|0;if((n&1)==0){l=m+4|0;m=(n&255)>>>1}else{l=c[m+8>>2]|0;m=c[m+4>>2]|0}bg(b,d,c[e>>2]|0,c[f>>2]|0,g,h,j,l,l+(m<<2)|0);i=k;return}function hg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;l=j;k=c[f+28>>2]|0;f=k+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1158]|0)==-1)){c[l>>2]=4632;c[l+4>>2]=106;c[l+8>>2]=0;td(4632,l)}m=(c[4636>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>m>>>0)){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}l=c[l+(m<<2)>>2]|0;if((l|0)==0){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}m=c[f>>2]|0;c[f>>2]=m+ -1;if((m|0)==0){ac[c[(c[k>>2]|0)+8>>2]&127](k)}m=c[e>>2]|0;e=b+8|0;e=dc[c[c[e>>2]>>2]&63](e)|0;e=(Ze(d,m,e,e+168|0,l,g,0)|0)-e|0;if((e|0)>=168){m=c[d>>2]|0;c[a>>2]=m;i=j;return}c[h+24>>2]=((e|0)/12|0|0)%7|0;m=c[d>>2]|0;c[a>>2]=m;i=j;return}function ig(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;l=j;k=c[f+28>>2]|0;f=k+4|0;c[f>>2]=(c[f>>2]|0)+1;if(!((c[1158]|0)==-1)){c[l>>2]=4632;c[l+4>>2]=106;c[l+8>>2]=0;td(4632,l)}m=(c[4636>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>m>>>0)){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}l=c[l+(m<<2)>>2]|0;if((l|0)==0){m=Oa(4)|0;c[m>>2]=12496;Pb(m|0,12568,96)}m=c[f>>2]|0;c[f>>2]=m+ -1;if((m|0)==0){ac[c[(c[k>>2]|0)+8>>2]&127](k)}m=c[e>>2]|0;e=b+8|0;e=dc[c[(c[e>>2]|0)+4>>2]&63](e)|0;e=(Ze(d,m,e,e+288|0,l,g,0)|0)-e|0;if((e|0)>=288){m=c[d>>2]|0;c[a>>2]=m;i=j;return}c[h+16>>2]=((e|0)/12|0|0)%12|0;m=c[d>>2]|0;c[a>>2]=m;i=j;return}function jg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;k=b;f=c[f+28>>2]|0;j=f+4|0;c[j>>2]=(c[j>>2]|0)+1;if(!((c[1158]|0)==-1)){c[k>>2]=4632;c[k+4>>2]=106;c[k+8>>2]=0;td(4632,k)}l=(c[4636>>2]|0)+ -1|0;k=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-k>>2>>>0>l>>>0)){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}k=c[k+(l<<2)>>2]|0;if((k|0)==0){l=Oa(4)|0;c[l>>2]=12496;Pb(l|0,12568,96)}l=c[j>>2]|0;c[j>>2]=l+ -1;if((l|0)==0){ac[c[(c[f>>2]|0)+8>>2]&127](f)}e=lg(d,c[e>>2]|0,g,k,4)|0;if((c[g>>2]&4|0)!=0){l=c[d>>2]|0;c[a>>2]=l;i=b;return}if((e|0)<69){g=e+2e3|0}else{g=(e+ -69|0)>>>0<31?e+1900|0:e}c[h+20>>2]=g+ -1900;l=c[d>>2]|0;c[a>>2]=l;i=b;return}function kg(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;l=i;i=i+64|0;x=l;u=l+44|0;q=l+40|0;B=l+36|0;s=l+32|0;r=l+48|0;v=l+20|0;w=l+16|0;t=l+12|0;A=l+24|0;p=l+28|0;c[h>>2]=0;y=c[g+28>>2]|0;z=y+4|0;c[z>>2]=(c[z>>2]|0)+1;if(!((c[1158]|0)==-1)){c[x>>2]=4632;c[x+4>>2]=106;c[x+8>>2]=0;td(4632,x)}n=(c[4636>>2]|0)+ -1|0;C=c[y+8>>2]|0;if(!((c[y+12>>2]|0)-C>>2>>>0>n>>>0)){C=Oa(4)|0;c[C>>2]=12496;Pb(C|0,12568,96)}n=c[C+(n<<2)>>2]|0;if((n|0)==0){C=Oa(4)|0;c[C>>2]=12496;Pb(C|0,12568,96)}C=c[z>>2]|0;c[z>>2]=C+ -1;if((C|0)==0){ac[c[(c[y>>2]|0)+8>>2]&127](y)}a:do{switch(k<<24>>24|0){case 70:{bg(s,d,c[e>>2]|0,c[f>>2]|0,g,h,j,3776,3808|0);c[e>>2]=c[s>>2];break};case 109:{m=lg(e,c[f>>2]|0,h,n,2)|0;n=c[h>>2]|0;if((n&4|0)==0&(m|0)<13){c[j+16>>2]=m+ -1;break a}else{c[h>>2]=n|4;break a}};case 99:{n=d+8|0;n=dc[c[(c[n>>2]|0)+12>>2]&63](n)|0;o=a[n]|0;if((o&1)==0){m=n+4|0;n=(o&255)>>>1}else{m=c[n+8>>2]|0;n=c[n+4>>2]|0}bg(q,d,c[e>>2]|0,c[f>>2]|0,g,h,j,m,m+(n<<2)|0);c[e>>2]=c[q>>2];break};case 101:case 100:{m=j+12|0;j=lg(e,c[f>>2]|0,h,n,2)|0;n=c[h>>2]|0;if((n&4|0)==0?(j+ -1|0)>>>0<31:0){c[m>>2]=j;break a}c[h>>2]=n|4;break};case 73:{m=j+8|0;j=lg(e,c[f>>2]|0,h,n,2)|0;n=c[h>>2]|0;if((n&4|0)==0?(j+ -1|0)>>>0<12:0){c[m>>2]=j;break a}c[h>>2]=n|4;break};case 65:case 97:{B=c[f>>2]|0;C=d+8|0;C=dc[c[c[C>>2]>>2]&63](C)|0;h=(Ze(e,B,C,C+168|0,n,h,0)|0)-C|0;if((h|0)<168){c[j+24>>2]=((h|0)/12|0|0)%7|0}break};case 72:{n=lg(e,c[f>>2]|0,h,n,2)|0;m=c[h>>2]|0;if((m&4|0)==0&(n|0)<24){c[j+8>>2]=n;break a}else{c[h>>2]=m|4;break a}};case 116:case 110:{j=c[f>>2]|0;while(1){f=c[e>>2]|0;do{if((f|0)!=0){d=c[f+12>>2]|0;if((d|0)==(c[f+16>>2]|0)){f=dc[c[(c[f>>2]|0)+36>>2]&63](f)|0}else{f=c[d>>2]|0}if((f|0)==-1){c[e>>2]=0;f=1;break}else{f=(c[e>>2]|0)==0;break}}else{f=1}}while(0);if((j|0)!=0){d=c[j+12>>2]|0;if((d|0)==(c[j+16>>2]|0)){d=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{d=c[d>>2]|0}if(!((d|0)==-1)){if(!f){break}}else{m=52}}else{m=52}if((m|0)==52){m=0;if(f){j=0;break}else{j=0}}d=c[e>>2]|0;f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){f=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{f=c[f>>2]|0}if(!(Zb[c[(c[n>>2]|0)+12>>2]&31](n,8192,f)|0)){break}g=c[e>>2]|0;d=g+12|0;f=c[d>>2]|0;if((f|0)==(c[g+16>>2]|0)){dc[c[(c[g>>2]|0)+40>>2]&63](g)|0;continue}else{c[d>>2]=f+4;continue}}n=c[e>>2]|0;do{if((n|0)!=0){f=c[n+12>>2]|0;if((f|0)==(c[n+16>>2]|0)){n=dc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{n=c[f>>2]|0}if((n|0)==-1){c[e>>2]=0;n=1;break}else{n=(c[e>>2]|0)==0;break}}else{n=1}}while(0);if((j|0)!=0){f=c[j+12>>2]|0;if((f|0)==(c[j+16>>2]|0)){j=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{j=c[f>>2]|0}if(!((j|0)==-1)){if(n){break a}}else{m=73}}else{m=73}if((m|0)==73?!n:0){break a}c[h>>2]=c[h>>2]|2;break};case 68:{bg(B,d,c[e>>2]|0,c[f>>2]|0,g,h,j,3744,3776|0);c[e>>2]=c[B>>2];break};case 77:{n=lg(e,c[f>>2]|0,h,n,2)|0;m=c[h>>2]|0;if((m&4|0)==0&(n|0)<60){c[j+4>>2]=n;break a}else{c[h>>2]=m|4;break a}};case 106:{n=lg(e,c[f>>2]|0,h,n,3)|0;m=c[h>>2]|0;if((m&4|0)==0&(n|0)<366){c[j+28>>2]=n;break a}else{c[h>>2]=m|4;break a}};case 104:case 66:case 98:{B=c[f>>2]|0;C=d+8|0;C=dc[c[(c[C>>2]|0)+4>>2]&63](C)|0;h=(Ze(e,B,C,C+288|0,n,h,0)|0)-C|0;if((h|0)<288){c[j+16>>2]=((h|0)/12|0|0)%12|0}break};case 114:{bg(r,d,c[e>>2]|0,c[f>>2]|0,g,h,j,3808,3852|0);c[e>>2]=c[r>>2];break};case 84:{bg(w,d,c[e>>2]|0,c[f>>2]|0,g,h,j,3880,3912|0);c[e>>2]=c[w>>2];break};case 112:{m=j+8|0;f=c[f>>2]|0;j=d+8|0;j=dc[c[(c[j>>2]|0)+8>>2]&63](j)|0;d=a[j]|0;if((d&1)==0){d=(d&255)>>>1}else{d=c[j+4>>2]|0}g=a[j+12|0]|0;if((g&1)==0){g=(g&255)>>>1}else{g=c[j+16>>2]|0}if((d|0)==(0-g|0)){c[h>>2]=c[h>>2]|4;break a}C=Ze(e,f,j,j+24|0,n,h,0)|0;h=C-j|0;if((C|0)==(j|0)?(c[m>>2]|0)==12:0){c[m>>2]=0;break a}if((h|0)==12?(o=c[m>>2]|0,(o|0)<12):0){c[m>>2]=o+12}break};case 37:{j=c[f>>2]|0;d=c[e>>2]|0;do{if((d|0)!=0){f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){f=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{f=c[f>>2]|0}if((f|0)==-1){c[e>>2]=0;f=1;break}else{f=(c[e>>2]|0)==0;break}}else{f=1}}while(0);if((j|0)!=0){d=c[j+12>>2]|0;if((d|0)==(c[j+16>>2]|0)){d=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{d=c[d>>2]|0}if(!((d|0)==-1)){if(!f){m=125}}else{m=123}}else{m=123}if((m|0)==123){if(f){m=125}else{j=0}}if((m|0)==125){c[h>>2]=c[h>>2]|6;break a}d=c[e>>2]|0;f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){f=dc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{f=c[f>>2]|0}if(!((Zb[c[(c[n>>2]|0)+52>>2]&31](n,f,0)|0)<<24>>24==37)){c[h>>2]=c[h>>2]|4;break a}n=c[e>>2]|0;d=n+12|0;f=c[d>>2]|0;if((f|0)==(c[n+16>>2]|0)){dc[c[(c[n>>2]|0)+40>>2]&63](n)|0}else{c[d>>2]=f+4}f=c[e>>2]|0;do{if((f|0)!=0){n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){n=dc[c[(c[f>>2]|0)+36>>2]&63](f)|0}else{n=c[n>>2]|0}if((n|0)==-1){c[e>>2]=0;n=1;break}else{n=(c[e>>2]|0)==0;break}}else{n=1}}while(0);if((j|0)!=0){f=c[j+12>>2]|0;if((f|0)==(c[j+16>>2]|0)){j=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{j=c[f>>2]|0}if(!((j|0)==-1)){if(n){break a}}else{m=146}}else{m=146}if((m|0)==146?!n:0){break a}c[h>>2]=c[h>>2]|2;break};case 83:{m=lg(e,c[f>>2]|0,h,n,2)|0;n=c[h>>2]|0;if((n&4|0)==0&(m|0)<61){c[j>>2]=m;break a}else{c[h>>2]=n|4;break a}};case 121:{m=j+20|0;n=lg(e,c[f>>2]|0,h,n,4)|0;if((c[h>>2]&4|0)==0){if((n|0)<69){h=n+2e3|0}else{h=(n+ -69|0)>>>0<31?n+1900|0:n}c[m>>2]=h+ -1900}break};case 89:{m=lg(e,c[f>>2]|0,h,n,4)|0;if((c[h>>2]&4|0)==0){c[j+20>>2]=m+ -1900}break};case 82:{bg(v,d,c[e>>2]|0,c[f>>2]|0,g,h,j,3856,3876|0);c[e>>2]=c[v>>2];break};case 119:{m=lg(e,c[f>>2]|0,h,n,1)|0;n=c[h>>2]|0;if((n&4|0)==0&(m|0)<7){c[j+24>>2]=m;break a}else{c[h>>2]=n|4;break a}};case 120:{C=c[(c[d>>2]|0)+20>>2]|0;c[t>>2]=c[e>>2];c[A>>2]=c[f>>2];c[u+0>>2]=c[t+0>>2];c[x+0>>2]=c[A+0>>2];_b[C&63](b,d,u,x,g,h,j);i=l;return};case 88:{o=d+8|0;o=dc[c[(c[o>>2]|0)+24>>2]&63](o)|0;n=a[o]|0;if((n&1)==0){m=o+4|0;n=(n&255)>>>1}else{m=c[o+8>>2]|0;n=c[o+4>>2]|0}bg(p,d,c[e>>2]|0,c[f>>2]|0,g,h,j,m,m+(n<<2)|0);c[e>>2]=c[p>>2];break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}function lg(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;k=c[a>>2]|0;do{if((k|0)!=0){j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0)){j=dc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[a>>2]=0;j=1;break}else{j=(c[a>>2]|0)==0;break}}else{j=1}}while(0);if((b|0)!=0){k=c[b+12>>2]|0;if((k|0)==(c[b+16>>2]|0)){k=dc[c[(c[b>>2]|0)+36>>2]&63](b)|0}else{k=c[k>>2]|0}if(!((k|0)==-1)){if(!j){h=15}}else{h=13}}else{h=13}if((h|0)==13){if(j){h=15}else{b=0}}if((h|0)==15){c[d>>2]=c[d>>2]|6;n=0;i=g;return n|0}j=c[a>>2]|0;k=c[j+12>>2]|0;if((k|0)==(c[j+16>>2]|0)){j=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{j=c[k>>2]|0}if(!(Zb[c[(c[e>>2]|0)+12>>2]&31](e,2048,j)|0)){c[d>>2]=c[d>>2]|4;n=0;i=g;return n|0}j=(Zb[c[(c[e>>2]|0)+52>>2]&31](e,j,0)|0)<<24>>24;l=c[a>>2]|0;k=l+12|0;m=c[k>>2]|0;if((m|0)==(c[l+16>>2]|0)){dc[c[(c[l>>2]|0)+40>>2]&63](l)|0;k=b;l=b;b=j}else{c[k>>2]=m+4;k=b;l=b;b=j}while(1){b=b+ -48|0;f=f+ -1|0;j=c[a>>2]|0;do{if((j|0)!=0){m=c[j+12>>2]|0;if((m|0)==(c[j+16>>2]|0)){j=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{j=c[m>>2]|0}if((j|0)==-1){c[a>>2]=0;m=1;break}else{m=(c[a>>2]|0)==0;break}}else{m=1}}while(0);if((l|0)==0){j=k;l=0;n=1}else{j=c[l+12>>2]|0;if((j|0)==(c[l+16>>2]|0)){j=dc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{j=c[j>>2]|0}n=(j|0)==-1;j=n?0:k;l=n?0:k;n=n?1:(k|0)==0}k=c[a>>2]|0;if(!((m^n)&(f|0)>0)){break}m=c[k+12>>2]|0;if((m|0)==(c[k+16>>2]|0)){k=dc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{k=c[m>>2]|0}if(!(Zb[c[(c[e>>2]|0)+12>>2]&31](e,2048,k)|0)){h=59;break}b=((Zb[c[(c[e>>2]|0)+52>>2]&31](e,k,0)|0)<<24>>24)+(b*10|0)|0;n=c[a>>2]|0;m=n+12|0;k=c[m>>2]|0;if((k|0)==(c[n+16>>2]|0)){dc[c[(c[n>>2]|0)+40>>2]&63](n)|0;k=j;continue}else{c[m>>2]=k+4;k=j;continue}}if((h|0)==59){i=g;return b|0}do{if((k|0)!=0){e=c[k+12>>2]|0;if((e|0)==(c[k+16>>2]|0)){e=dc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{e=c[e>>2]|0}if((e|0)==-1){c[a>>2]=0;a=1;break}else{a=(c[a>>2]|0)==0;break}}else{a=1}}while(0);if((j|0)!=0){e=c[j+12>>2]|0;if((e|0)==(c[j+16>>2]|0)){e=dc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{e=c[e>>2]|0}if(!((e|0)==-1)){if(a){n=b;i=g;return n|0}}else{h=56}}else{h=56}if((h|0)==56?!a:0){n=b;i=g;return n|0}c[d>>2]=c[d>>2]|2;n=b;i=g;return n|0}function mg(b){b=b|0;var d=0,e=0,f=0;d=i;e=b+8|0;f=c[e>>2]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}if((f|0)!=(c[1136]|0)){jb(c[e>>2]|0)}if((b|0)==0){i=d;return}gk(b);i=d;return}function ng(b){b=b|0;var d=0,e=0;d=i;b=b+8|0;e=c[b>>2]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}if((e|0)==(c[1136]|0)){i=d;return}jb(c[b>>2]|0);i=d;return}function og(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0;f=i;i=i+112|0;n=f+100|0;g=f;a[n]=37;l=n+1|0;a[l]=j;m=n+2|0;a[m]=k;a[n+3|0]=0;if(!(k<<24>>24==0)){a[l]=k;a[m]=j}n=Xa(g|0,100,n|0,h|0,c[d+8>>2]|0)|0;h=g+n|0;j=c[e>>2]|0;if((n|0)==0){n=j;c[b>>2]=n;i=f;return}else{e=g;d=j}do{k=a[e]|0;do{if((d|0)!=0){g=d+24|0;l=c[g>>2]|0;if((l|0)==(c[d+28>>2]|0)){k=(mc[c[(c[d>>2]|0)+52>>2]&15](d,k&255)|0)==-1;j=k?0:j;d=k?0:d;break}else{c[g>>2]=l+1;a[l]=k;break}}else{d=0}}while(0);e=e+1|0}while((e|0)!=(h|0));c[b>>2]=j;i=f;return}function pg(b){b=b|0;var d=0,e=0,f=0;d=i;e=b+8|0;f=c[e>>2]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}if((f|0)!=(c[1136]|0)){jb(c[e>>2]|0)}if((b|0)==0){i=d;return}gk(b);i=d;return}function qg(b){b=b|0;var d=0,e=0;d=i;b=b+8|0;e=c[b>>2]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}if((e|0)==(c[1136]|0)){i=d;return}jb(c[b>>2]|0);i=d;return}function rg(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+528|0;o=f+516|0;p=f+416|0;m=f;l=f+8|0;g=f+16|0;a[o]=37;n=o+1|0;a[n]=j;q=o+2|0;a[q]=k;a[o+3|0]=0;if(!(k<<24>>24==0)){a[n]=k;a[q]=j}k=d+8|0;Xa(p|0,100,o|0,h|0,c[k>>2]|0)|0;d=m;c[d>>2]=0;c[d+4>>2]=0;c[l>>2]=p;k=$a(c[k>>2]|0)|0;d=Mj(g,l,100,m)|0;if((k|0)!=0){$a(k|0)|0}if((d|0)==-1){nh(5480)}k=g+(d<<2)|0;h=c[e>>2]|0;if((d|0)==0){q=h;c[b>>2]=q;i=f;return}else{e=h}do{d=c[g>>2]|0;if((e|0)==0){e=0}else{j=e+24|0;l=c[j>>2]|0;if((l|0)==(c[e+28>>2]|0)){d=mc[c[(c[e>>2]|0)+52>>2]&15](e,d)|0}else{c[j>>2]=l+4;c[l>>2]=d}d=(d|0)==-1;h=d?0:h;e=d?0:e}g=g+4|0}while((g|0)!=(k|0));c[b>>2]=h;i=f;return}function sg(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function tg(a){a=a|0;return}function ug(a){a=a|0;return 127}function vg(a){a=a|0;return 127}function wg(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function xg(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function yg(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function zg(b,c){b=b|0;c=c|0;a[b]=2;a[b+1|0]=45;a[b+2|0]=0;return}function Ag(a){a=a|0;return 0}function Bg(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Cg(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Dg(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Eg(a){a=a|0;return}function Fg(a){a=a|0;return 127}function Gg(a){a=a|0;return 127}function Hg(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Ig(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Jg(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Kg(b,c){b=b|0;c=c|0;a[b]=2;a[b+1|0]=45;a[b+2|0]=0;return}function Lg(a){a=a|0;return 0}function Mg(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Ng(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Og(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Pg(a){a=a|0;return}function Qg(a){a=a|0;return 2147483647}function Rg(a){a=a|0;return 2147483647}function Sg(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Tg(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Ug(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Vg(b,d){b=b|0;d=d|0;a[b]=2;d=b+4|0;c[d>>2]=45;c[d+4>>2]=0;return}function Wg(a){a=a|0;return 0}function Xg(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Yg(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Zg(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function _g(a){a=a|0;return}function $g(a){a=a|0;return 2147483647}function ah(a){a=a|0;return 2147483647}function bh(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function ch(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function dh(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function eh(b,d){b=b|0;d=d|0;a[b]=2;d=b+4|0;c[d>>2]=45;c[d+4>>2]=0;return}function fh(a){a=a|0;return 0}function gh(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function hh(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function ih(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function jh(a){a=a|0;return}function kh(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;m=i;i=i+240|0;q=m;u=m+140|0;d=m+16|0;r=m+24|0;t=m+28|0;s=m+30|0;p=m+40|0;c[d>>2]=u;n=d+4|0;c[n>>2]=107;o=c[h+28>>2]|0;y=o+4|0;c[y>>2]=(c[y>>2]|0)+1;if(!((c[1160]|0)==-1)){c[q>>2]=4640;c[q+4>>2]=106;c[q+8>>2]=0;td(4640,q)}v=(c[4644>>2]|0)+ -1|0;w=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-w>>2>>>0>v>>>0)){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}v=c[w+(v<<2)>>2]|0;if((v|0)==0){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}a[t]=0;do{if(mh(e,c[f>>2]|0,g,o,c[h+4>>2]|0,j,t,v,d,r,u+100|0)|0){jc[c[(c[v>>2]|0)+32>>2]&7](v,4272,4282|0,s)|0;h=c[r>>2]|0;u=c[d>>2]|0;g=h-u|0;if((g|0)>98){v=fk(g+2|0)|0;if((v|0)==0){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else{g=v}}else{g=0;v=p}if((a[t]|0)!=0){a[v]=45;v=v+1|0}if(u>>>0<h>>>0){t=s+10|0;h=s;do{y=a[u]|0;x=s;while(1){w=x+1|0;if((a[x]|0)==y<<24>>24){break}if((w|0)==(t|0)){x=t;break}else{x=w}}a[v]=a[4272+(x-h)|0]|0;u=u+1|0;v=v+1|0}while(u>>>0<(c[r>>2]|0)>>>0)}a[v]=0;c[q>>2]=k;if((Ka(p|0,4288,q|0)|0)==1){if((g|0)==0){break}gk(g);break}j=Oa(8)|0;c[j>>2]=1456;while(1){d=fk(28)|0;if((d|0)!=0){l=24;break}l=c[3356]|0;c[3356]=l+0;if((l|0)==0){l=23;break}hc[l&0]()}if((l|0)==23){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else if((l|0)==24){c[d+4>>2]=15;c[d>>2]=15;l=d+12|0;c[j+4>>2]=l;c[d+8>>2]=0;d=l+0|0;l=4296|0;m=d+16|0;do{a[d]=a[l]|0;d=d+1|0;l=l+1|0}while((d|0)<(m|0));Pb(j|0,1592,11)}}}while(0);p=c[e>>2]|0;if((p|0)!=0){if((c[p+12>>2]|0)==(c[p+16>>2]|0)?(dc[c[(c[p>>2]|0)+36>>2]&63](p)|0)==-1:0){c[e>>2]=0;p=0}}else{p=0}k=(p|0)==0;e=c[f>>2]|0;do{if((e|0)!=0){if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){if(k){break}else{l=38;break}}if(!((dc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1)){if(k){break}else{l=38;break}}else{c[f>>2]=0;l=36;break}}else{l=36}}while(0);if((l|0)==36?k:0){l=38}if((l|0)==38){c[j>>2]=c[j>>2]|2}c[b>>2]=p;x=o+4|0;y=c[x>>2]|0;c[x>>2]=y+ -1;if((y|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}l=c[d>>2]|0;c[d>>2]=0;if((l|0)==0){i=m;return}ac[c[n>>2]&127](l);i=m;return}function lh(a){a=a|0;return}function mh(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0;u=i;i=i+592|0;R=u;O=u+572|0;N=u+560|0;M=u+548|0;I=u+536|0;H=u+524|0;P=u+520|0;Q=u+508|0;J=u+496|0;L=u+576|0;K=u+432|0;W=u+32|0;F=u+12|0;v=u+16|0;q=u+480|0;w=u+444|0;r=u+456|0;t=u+468|0;s=u+492|0;c[F>>2]=0;c[v+0>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;if(g){if(!((c[1024]|0)==-1)){c[R>>2]=4096;c[R+4>>2]=106;c[R+8>>2]=0;td(4096,R)}K=(c[4100>>2]|0)+ -1|0;J=c[h+8>>2]|0;if(!((c[h+12>>2]|0)-J>>2>>>0>K>>>0)){ia=Oa(4)|0;c[ia>>2]=12496;Pb(ia|0,12568,96)}K=c[J+(K<<2)>>2]|0;if((K|0)==0){ia=Oa(4)|0;c[ia>>2]=12496;Pb(ia|0,12568,96)}bc[c[(c[K>>2]|0)+44>>2]&63](O,K);c[F>>2]=c[O>>2];bc[c[(c[K>>2]|0)+32>>2]&63](N,K);if((a[r]&1)==0){a[r+1|0]=0;a[r]=0}else{a[c[r+8>>2]|0]=0;c[r+4>>2]=0}xd(r);c[r+0>>2]=c[N+0>>2];c[r+4>>2]=c[N+4>>2];c[r+8>>2]=c[N+8>>2];c[N+0>>2]=0;c[N+4>>2]=0;c[N+8>>2]=0;bc[c[(c[K>>2]|0)+28>>2]&63](M,K);if((a[w]&1)==0){a[w+1|0]=0;a[w]=0}else{a[c[w+8>>2]|0]=0;c[w+4>>2]=0}xd(w);c[w+0>>2]=c[M+0>>2];c[w+4>>2]=c[M+4>>2];c[w+8>>2]=c[M+8>>2];c[M+0>>2]=0;c[M+4>>2]=0;c[M+8>>2]=0;h=dc[c[(c[K>>2]|0)+12>>2]&63](K)|0;J=dc[c[(c[K>>2]|0)+16>>2]&63](K)|0;bc[c[(c[K>>2]|0)+20>>2]&63](I,K);if((a[v]&1)==0){a[v+1|0]=0;a[v]=0}else{a[c[v+8>>2]|0]=0;c[v+4>>2]=0}xd(v);c[v+0>>2]=c[I+0>>2];c[v+4>>2]=c[I+4>>2];c[v+8>>2]=c[I+8>>2];c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;bc[c[(c[K>>2]|0)+24>>2]&63](H,K);if((a[q]&1)==0){a[q+1|0]=0;a[q]=0}else{a[c[q+8>>2]|0]=0;c[q+4>>2]=0}xd(q);c[q+0>>2]=c[H+0>>2];c[q+4>>2]=c[H+4>>2];c[q+8>>2]=c[H+8>>2];c[H+0>>2]=0;c[H+4>>2]=0;c[H+8>>2]=0;Y=dc[c[(c[K>>2]|0)+36>>2]&63](K)|0}else{if(!((c[1008]|0)==-1)){c[R>>2]=4032;c[R+4>>2]=106;c[R+8>>2]=0;td(4032,R)}H=(c[4036>>2]|0)+ -1|0;I=c[h+8>>2]|0;if(!((c[h+12>>2]|0)-I>>2>>>0>H>>>0)){ia=Oa(4)|0;c[ia>>2]=12496;Pb(ia|0,12568,96)}H=c[I+(H<<2)>>2]|0;if((H|0)==0){ia=Oa(4)|0;c[ia>>2]=12496;Pb(ia|0,12568,96)}bc[c[(c[H>>2]|0)+44>>2]&63](P,H);c[F>>2]=c[P>>2];bc[c[(c[H>>2]|0)+32>>2]&63](Q,H);if((a[r]&1)==0){a[r+1|0]=0;a[r]=0}else{a[c[r+8>>2]|0]=0;c[r+4>>2]=0}xd(r);c[r+0>>2]=c[Q+0>>2];c[r+4>>2]=c[Q+4>>2];c[r+8>>2]=c[Q+8>>2];c[Q+0>>2]=0;c[Q+4>>2]=0;c[Q+8>>2]=0;bc[c[(c[H>>2]|0)+28>>2]&63](J,H);if((a[w]&1)==0){a[w+1|0]=0;a[w]=0}else{a[c[w+8>>2]|0]=0;c[w+4>>2]=0}xd(w);c[w+0>>2]=c[J+0>>2];c[w+4>>2]=c[J+4>>2];c[w+8>>2]=c[J+8>>2];c[J+0>>2]=0;c[J+4>>2]=0;c[J+8>>2]=0;h=dc[c[(c[H>>2]|0)+12>>2]&63](H)|0;J=dc[c[(c[H>>2]|0)+16>>2]&63](H)|0;bc[c[(c[H>>2]|0)+20>>2]&63](L,H);if((a[v]&1)==0){a[v+1|0]=0;a[v]=0}else{a[c[v+8>>2]|0]=0;c[v+4>>2]=0}xd(v);c[v+0>>2]=c[L+0>>2];c[v+4>>2]=c[L+4>>2];c[v+8>>2]=c[L+8>>2];c[L+0>>2]=0;c[L+4>>2]=0;c[L+8>>2]=0;bc[c[(c[H>>2]|0)+24>>2]&63](K,H);if((a[q]&1)==0){a[q+1|0]=0;a[q]=0}else{a[c[q+8>>2]|0]=0;c[q+4>>2]=0}xd(q);c[q+0>>2]=c[K+0>>2];c[q+4>>2]=c[K+4>>2];c[q+8>>2]=c[K+8>>2];c[K+0>>2]=0;c[K+4>>2]=0;c[K+8>>2]=0;Y=dc[c[(c[H>>2]|0)+36>>2]&63](H)|0}c[o>>2]=c[n>>2];O=m+8|0;M=r+1|0;K=r+4|0;m=r+8|0;L=w+1|0;N=w+4|0;H=w+8|0;V=(j&512|0)!=0;U=q+1|0;I=q+8|0;T=q+4|0;S=t+1|0;j=t+8|0;g=t+4|0;R=F+3|0;Q=n+4|0;P=v+4|0;_=W+400|0;$=W;aa=W;X=0;W=0;Z=107;a:while(1){ba=c[e>>2]|0;do{if((ba|0)!=0){if((c[ba+12>>2]|0)==(c[ba+16>>2]|0)){if((dc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0)==-1){c[e>>2]=0;ba=0;break}else{ba=c[e>>2]|0;break}}}else{ba=0}}while(0);ba=(ba|0)==0;do{if((f|0)!=0){if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){if(ba){break}else{E=aa;G=Z;C=341;break a}}if(!((dc[c[(c[f>>2]|0)+36>>2]&63](f)|0)==-1)){if(!ba){E=aa;G=Z;C=341;break a}}else{C=48}}else{C=48}}while(0);if((C|0)==48){C=0;if(ba){E=aa;f=0;G=Z;C=341;break}else{f=0}}b:do{switch(a[F+X|0]|0){case 1:{if((X|0)==3){E=aa;G=Z;C=341;break a}ba=c[e>>2]|0;ca=c[ba+12>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){ba=dc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0}else{ba=d[ca]|0}if(!((ba&255)<<24>>24>-1)){C=82;break a}if((b[(c[O>>2]|0)+(ba<<24>>24<<1)>>1]&8192)==0){C=82;break a}da=c[e>>2]|0;ba=da+12|0;ca=c[ba>>2]|0;if((ca|0)==(c[da+16>>2]|0)){ba=dc[c[(c[da>>2]|0)+40>>2]&63](da)|0}else{c[ba>>2]=ca+1;ba=d[ca]|0}ba=ba&255;ca=a[t]|0;fa=(ca&1)!=0;if(fa){da=c[t>>2]|0;ea=da&255;da=(da&-2)+ -1|0;ca=c[g>>2]|0}else{ea=ca;da=10;ca=(ca&255)>>>1}do{if((ca|0)!=(da|0)){if(fa){ga=c[j>>2]|0;C=80;break}else{a[t]=(ca<<1)+2;ga=S;da=ca+1|0;break}}else{if((da|0)==-17){C=65;break a}C=(ea&1)==0?S:c[j>>2]|0;if(da>>>0<2147483623){fa=da+1|0;ea=da<<1;ea=fa>>>0<ea>>>0?ea:fa;if(ea>>>0<11){ea=11}else{ea=ea+16&-16}}else{ea=-17}fa=(ea|0)==0?1:ea;while(1){ga=fk(fa)|0;if((ga|0)!=0){break}ga=c[3356]|0;c[3356]=ga+0;if((ga|0)==0){C=73;break a}hc[ga&0]()}vk(ga|0,C|0,da|0)|0;if(!((da|0)==10|(C|0)==0)){gk(C)}c[j>>2]=ga;c[t>>2]=ea|1;C=80}}while(0);if((C|0)==80){da=ca+1|0;c[g>>2]=da}a[ga+ca|0]=ba;a[ga+da|0]=0;C=83;break};case 0:{C=83;break};case 3:{ba=a[w]|0;da=(ba&1)==0;if(da){ga=(ba&255)>>>1}else{ga=c[N>>2]|0}ca=a[r]|0;ea=(ca&1)==0;if(ea){fa=(ca&255)>>>1}else{fa=c[K>>2]|0}if((ga|0)!=(0-fa|0)){if(da){fa=(ba&255)>>>1}else{fa=c[N>>2]|0}if((fa|0)!=0){if(ea){ea=(ca&255)>>>1}else{ea=c[K>>2]|0}if((ea|0)!=0){da=c[e>>2]|0;fa=c[da+12>>2]|0;ea=c[da+16>>2]|0;if((fa|0)==(ea|0)){ca=dc[c[(c[da>>2]|0)+36>>2]&63](da)|0;ea=c[e>>2]|0;ba=a[w]|0;da=ea;fa=c[ea+12>>2]|0;ea=c[ea+16>>2]|0}else{ca=d[fa]|0}ga=da+12|0;ea=(fa|0)==(ea|0);if((ca&255)<<24>>24==(a[(ba&1)==0?L:c[H>>2]|0]|0)){if(ea){dc[c[(c[da>>2]|0)+40>>2]&63](da)|0}else{c[ga>>2]=fa+1}ba=a[w]|0;if((ba&1)==0){ba=(ba&255)>>>1}else{ba=c[N>>2]|0}W=ba>>>0>1?w:W;break b}if(ea){ba=dc[c[(c[da>>2]|0)+36>>2]&63](da)|0}else{ba=d[fa]|0}if(!((ba&255)<<24>>24==(a[(a[r]&1)==0?M:c[m>>2]|0]|0))){C=189;break a}da=c[e>>2]|0;ca=da+12|0;ba=c[ca>>2]|0;if((ba|0)==(c[da+16>>2]|0)){dc[c[(c[da>>2]|0)+40>>2]&63](da)|0}else{c[ca>>2]=ba+1}a[l]=1;ba=a[r]|0;if((ba&1)==0){ba=(ba&255)>>>1}else{ba=c[K>>2]|0}W=ba>>>0>1?r:W;break b}}if(da){ea=(ba&255)>>>1}else{ea=c[N>>2]|0}da=c[e>>2]|0;fa=c[da+12>>2]|0;ga=(fa|0)==(c[da+16>>2]|0);if((ea|0)==0){if(ga){ba=dc[c[(c[da>>2]|0)+36>>2]&63](da)|0;ca=a[r]|0}else{ba=d[fa]|0}if(!((ba&255)<<24>>24==(a[(ca&1)==0?M:c[m>>2]|0]|0))){break b}ba=c[e>>2]|0;da=ba+12|0;ca=c[da>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){dc[c[(c[ba>>2]|0)+40>>2]&63](ba)|0}else{c[da>>2]=ca+1}a[l]=1;ba=a[r]|0;if((ba&1)==0){ba=(ba&255)>>>1}else{ba=c[K>>2]|0}W=ba>>>0>1?r:W;break b}if(ga){ca=dc[c[(c[da>>2]|0)+36>>2]&63](da)|0;ba=a[w]|0}else{ca=d[fa]|0}if(!((ca&255)<<24>>24==(a[(ba&1)==0?L:c[H>>2]|0]|0))){a[l]=1;break b}da=c[e>>2]|0;ca=da+12|0;ba=c[ca>>2]|0;if((ba|0)==(c[da+16>>2]|0)){dc[c[(c[da>>2]|0)+40>>2]&63](da)|0}else{c[ca>>2]=ba+1}ba=a[w]|0;if((ba&1)==0){ba=(ba&255)>>>1}else{ba=c[N>>2]|0}W=ba>>>0>1?w:W}break};case 2:{if(!((W|0)!=0|X>>>0<2)){if((X|0)==2){ba=(a[R]|0)!=0}else{ba=0}if(!(V|ba)){W=0;break b}}ca=a[q]|0;da=(ca&1)==0;ba=da?U:c[I>>2]|0;c:do{if((X|0)!=0?(d[F+(X+ -1)|0]|0)<2:0){ea=ba+(da?(ca&255)>>>1:c[T>>2]|0)|0;fa=ba;while(1){if((fa|0)==(ea|0)){break}da=a[fa]|0;if(!(da<<24>>24>-1)){ea=fa;break}if((b[(c[O>>2]|0)+(da<<24>>24<<1)>>1]&8192)==0){ea=fa;break}else{fa=fa+1|0}}da=ea-ba|0;fa=a[t]|0;ga=(fa&1)==0;if(ga){ha=(fa&255)>>>1}else{ha=c[g>>2]|0}if(!(da>>>0>ha>>>0)){if(ga){fa=(fa&255)>>>1;ha=S;ga=fa;fa=t+(fa-da)+1|0}else{ia=c[j>>2]|0;fa=c[g>>2]|0;ha=ia;ga=fa;fa=ia+(fa-da)|0}da=ha+ga|0;if((fa|0)==(da|0)){da=f;ba=ea;ea=f}else{ga=ba;while(1){if((a[fa]|0)!=(a[ga]|0)){da=f;ea=f;break c}fa=fa+1|0;if((fa|0)==(da|0)){da=f;ba=ea;ea=f;break}else{ga=ga+1|0}}}}else{da=f;ea=f}}else{da=f;ea=f}}while(0);d:while(1){if((ca&1)==0){fa=U;ca=(ca&255)>>>1}else{fa=c[I>>2]|0;ca=c[T>>2]|0}if((ba|0)==(fa+ca|0)){break}ca=c[e>>2]|0;do{if((ca|0)!=0){if((c[ca+12>>2]|0)==(c[ca+16>>2]|0)){if((dc[c[(c[ca>>2]|0)+36>>2]&63](ca)|0)==-1){c[e>>2]=0;ca=0;break}else{ca=c[e>>2]|0;break}}}else{ca=0}}while(0);ca=(ca|0)==0;do{if((ea|0)!=0){if((c[ea+12>>2]|0)!=(c[ea+16>>2]|0)){if(ca){ca=da;break}else{break d}}if(!((dc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0)==-1)){if(ca^(da|0)==0){ca=da;ea=da}else{break d}}else{da=0;f=0;C=223}}else{C=223}}while(0);if((C|0)==223){C=0;if(ca){break}else{ca=da;ea=0}}da=c[e>>2]|0;fa=c[da+12>>2]|0;if((fa|0)==(c[da+16>>2]|0)){da=dc[c[(c[da>>2]|0)+36>>2]&63](da)|0}else{da=d[fa]|0}if(!((da&255)<<24>>24==(a[ba]|0))){break}da=c[e>>2]|0;fa=da+12|0;ga=c[fa>>2]|0;if((ga|0)==(c[da+16>>2]|0)){dc[c[(c[da>>2]|0)+40>>2]&63](da)|0}else{c[fa>>2]=ga+1}da=ca;ca=a[q]|0;ba=ba+1|0}if(V){da=a[q]|0;if((da&1)==0){ca=U;da=(da&255)>>>1}else{ca=c[I>>2]|0;da=c[T>>2]|0}if((ba|0)!=(ca+da|0)){C=238;break a}}break};case 4:{da=f;ca=f;ba=0;e:while(1){ea=c[e>>2]|0;do{if((ea|0)!=0){if((c[ea+12>>2]|0)==(c[ea+16>>2]|0)){if((dc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0)==-1){c[e>>2]=0;ea=0;break}else{ea=c[e>>2]|0;break}}}else{ea=0}}while(0);ea=(ea|0)==0;do{if((ca|0)!=0){if((c[ca+12>>2]|0)!=(c[ca+16>>2]|0)){if(ea){break}else{break e}}if(!((dc[c[(c[ca>>2]|0)+36>>2]&63](ca)|0)==-1)){if(!ea){break e}}else{da=0;f=0;C=248}}else{C=248}}while(0);if((C|0)==248){C=0;if(ea){break}else{ca=0}}ea=c[e>>2]|0;fa=c[ea+12>>2]|0;if((fa|0)==(c[ea+16>>2]|0)){fa=dc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0}else{fa=d[fa]|0}ea=fa&255;if(ea<<24>>24>-1?!((b[(c[O>>2]|0)+(fa<<24>>24<<1)>>1]&2048)==0):0){fa=c[o>>2]|0;if((fa|0)==(p|0)){ga=(c[Q>>2]|0)!=107;ha=c[n>>2]|0;p=p-ha|0;fa=p>>>0<2147483647?p<<1:-1;ha=hk(ga?ha:0,fa)|0;if((ha|0)==0){C=257;break a}if(!ga){ga=c[n>>2]|0;c[n>>2]=ha;if((ga|0)!=0){ac[c[Q>>2]&127](ga);ha=c[n>>2]|0}}else{c[n>>2]=ha}c[Q>>2]=108;ia=ha+p|0;c[o>>2]=ia;p=(c[n>>2]|0)+fa|0;fa=ia}c[o>>2]=fa+1;a[fa]=ea;ba=ba+1|0}else{fa=a[v]|0;if((fa&1)==0){fa=(fa&255)>>>1}else{fa=c[P>>2]|0}if(!((ba|0)!=0&(fa|0)!=0&ea<<24>>24==J<<24>>24)){break}if(($|0)==(_|0)){$=$-aa|0;_=$>>>0<2147483647?$<<1:-1;if((Z|0)==107){aa=0}Z=hk(aa,_)|0;if((Z|0)==0){C=272;break a}aa=Z;_=Z+(_>>>2<<2)|0;$=Z+($>>2<<2)|0;Z=108}c[$>>2]=ba;$=$+4|0;ba=0}ea=c[e>>2]|0;fa=ea+12|0;ga=c[fa>>2]|0;if((ga|0)==(c[ea+16>>2]|0)){dc[c[(c[ea>>2]|0)+40>>2]&63](ea)|0;continue}else{c[fa>>2]=ga+1;continue}}if(!((aa|0)==($|0)|(ba|0)==0)){if(($|0)==(_|0)){$=$-aa|0;_=$>>>0<2147483647?$<<1:-1;if((Z|0)==107){aa=0}Z=hk(aa,_)|0;if((Z|0)==0){C=283;break a}aa=Z;_=Z+(_>>>2<<2)|0;$=Z+($>>2<<2)|0;Z=108}c[$>>2]=ba;$=$+4|0}if((Y|0)>0){ba=c[e>>2]|0;do{if((ba|0)!=0){if((c[ba+12>>2]|0)==(c[ba+16>>2]|0)){if((dc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0)==-1){c[e>>2]=0;ba=0;break}else{ba=c[e>>2]|0;break}}}else{ba=0}}while(0);ba=(ba|0)==0;do{if((da|0)!=0){if((c[da+12>>2]|0)!=(c[da+16>>2]|0)){if(ba){break}else{C=302;break a}}if(!((dc[c[(c[da>>2]|0)+36>>2]&63](da)|0)==-1)){if(!ba){C=302;break a}}else{f=0;C=296}}else{C=296}}while(0);if((C|0)==296){C=0;if(ba){C=302;break a}else{da=0}}ba=c[e>>2]|0;ca=c[ba+12>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){ba=dc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0}else{ba=d[ca]|0}if(!((ba&255)<<24>>24==h<<24>>24)){C=302;break a}ca=c[e>>2]|0;ba=ca+12|0;ea=c[ba>>2]|0;if((ea|0)==(c[ca+16>>2]|0)){dc[c[(c[ca>>2]|0)+40>>2]&63](ca)|0;ea=da;ca=da}else{c[ba>>2]=ea+1;ea=da;ca=da}while(1){ba=c[e>>2]|0;do{if((ba|0)!=0){if((c[ba+12>>2]|0)==(c[ba+16>>2]|0)){if((dc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0)==-1){c[e>>2]=0;ba=0;break}else{ba=c[e>>2]|0;break}}}else{ba=0}}while(0);da=(ba|0)==0;do{if((ca|0)!=0){if((c[ca+12>>2]|0)!=(c[ca+16>>2]|0)){if(da){ba=ea;break}else{C=322;break a}}if(!((dc[c[(c[ca>>2]|0)+36>>2]&63](ca)|0)==-1)){if(da^(ea|0)==0){ba=ea;ca=ea}else{C=322;break a}}else{ba=0;f=0;C=315}}else{ba=ea;C=315}}while(0);if((C|0)==315){C=0;if(da){C=322;break a}else{ca=0}}da=c[e>>2]|0;ea=c[da+12>>2]|0;if((ea|0)==(c[da+16>>2]|0)){da=dc[c[(c[da>>2]|0)+36>>2]&63](da)|0}else{da=d[ea]|0}if(!((da&255)<<24>>24>-1)){C=322;break a}if((b[(c[O>>2]|0)+(da<<24>>24<<1)>>1]&2048)==0){C=322;break a}da=c[o>>2]|0;if((da|0)==(p|0)){ea=(c[Q>>2]|0)!=107;fa=c[n>>2]|0;da=p-fa|0;p=da>>>0<2147483647?da<<1:-1;fa=hk(ea?fa:0,p)|0;if((fa|0)==0){C=325;break a}if(!ea){ea=c[n>>2]|0;c[n>>2]=fa;if((ea|0)!=0){ac[c[Q>>2]&127](ea);fa=c[n>>2]|0}}else{c[n>>2]=fa}c[Q>>2]=108;da=fa+da|0;c[o>>2]=da;p=(c[n>>2]|0)+p|0}fa=c[e>>2]|0;ea=c[fa+12>>2]|0;if((ea|0)==(c[fa+16>>2]|0)){ea=dc[c[(c[fa>>2]|0)+36>>2]&63](fa)|0;da=c[o>>2]|0}else{ea=d[ea]|0}c[o>>2]=da+1;a[da]=ea;Y=Y+ -1|0;fa=c[e>>2]|0;ea=fa+12|0;da=c[ea>>2]|0;if((da|0)==(c[fa+16>>2]|0)){dc[c[(c[fa>>2]|0)+40>>2]&63](fa)|0}else{c[ea>>2]=da+1}if((Y|0)>0){ea=ba}else{break}}}if((c[o>>2]|0)==(c[n>>2]|0)){C=339;break a}break};default:{}}}while(0);f:do{if((C|0)==83){C=0;if((X|0)==3){E=aa;G=Z;C=341;break a}else{da=f;ca=f}while(1){ba=c[e>>2]|0;do{if((ba|0)!=0){if((c[ba+12>>2]|0)==(c[ba+16>>2]|0)){if((dc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0)==-1){c[e>>2]=0;ba=0;break}else{ba=c[e>>2]|0;break}}}else{ba=0}}while(0);ea=(ba|0)==0;do{if((ca|0)!=0){if((c[ca+12>>2]|0)!=(c[ca+16>>2]|0)){if(ea){ba=da;break}else{break f}}if(!((dc[c[(c[ca>>2]|0)+36>>2]&63](ca)|0)==-1)){if(ea^(da|0)==0){ba=da;ca=da}else{break f}}else{ba=0;f=0;C=93}}else{ba=da;C=93}}while(0);if((C|0)==93){C=0;if(ea){break f}else{ca=0}}da=c[e>>2]|0;ea=c[da+12>>2]|0;if((ea|0)==(c[da+16>>2]|0)){da=dc[c[(c[da>>2]|0)+36>>2]&63](da)|0}else{da=d[ea]|0}if(!((da&255)<<24>>24>-1)){break f}if((b[(c[O>>2]|0)+(da<<24>>24<<1)>>1]&8192)==0){break f}ea=c[e>>2]|0;fa=ea+12|0;da=c[fa>>2]|0;if((da|0)==(c[ea+16>>2]|0)){da=dc[c[(c[ea>>2]|0)+40>>2]&63](ea)|0}else{c[fa>>2]=da+1;da=d[da]|0}da=da&255;ea=a[t]|0;ga=(ea&1)!=0;if(ga){fa=c[t>>2]|0;ha=fa&255;fa=(fa&-2)+ -1|0;ea=c[g>>2]|0}else{ha=ea;fa=10;ea=(ea&255)>>>1}do{if((ea|0)!=(fa|0)){if(ga){ia=c[j>>2]|0;C=123;break}else{a[t]=(ea<<1)+2;ia=S;fa=ea+1|0;break}}else{if((fa|0)==-17){C=108;break a}C=(ha&1)==0?S:c[j>>2]|0;if(fa>>>0<2147483623){ga=fa+1|0;ha=fa<<1;ga=ga>>>0<ha>>>0?ha:ga;if(ga>>>0<11){ga=11}else{ga=ga+16&-16}}else{ga=-17}ha=(ga|0)==0?1:ga;while(1){ia=fk(ha)|0;if((ia|0)!=0){break}ia=c[3356]|0;c[3356]=ia+0;if((ia|0)==0){C=116;break a}hc[ia&0]()}vk(ia|0,C|0,fa|0)|0;if(!((fa|0)==10|(C|0)==0)){gk(C)}c[j>>2]=ia;c[t>>2]=ga|1;C=123}}while(0);if((C|0)==123){C=0;fa=ea+1|0;c[g>>2]=fa}a[ia+ea|0]=da;a[ia+fa|0]=0;da=ba}}}while(0);X=X+1|0;if(!(X>>>0<4)){E=aa;G=Z;C=341;break}}g:do{if((C|0)==65){ud()}else if((C|0)==73){ia=Oa(4)|0;c[ia>>2]=13440;Pb(ia|0,13488,104)}else if((C|0)==82){c[k>>2]=c[k>>2]|4;D=0;E=aa;G=Z}else if((C|0)==108){ud()}else if((C|0)==116){ia=Oa(4)|0;c[ia>>2]=13440;Pb(ia|0,13488,104)}else if((C|0)==189){c[k>>2]=c[k>>2]|4;D=0;E=aa;G=Z}else if((C|0)==238){c[k>>2]=c[k>>2]|4;D=0;E=aa;G=Z}else if((C|0)==257){ia=Oa(4)|0;c[ia>>2]=13440;Pb(ia|0,13488,104)}else if((C|0)==272){ia=Oa(4)|0;c[ia>>2]=13440;Pb(ia|0,13488,104)}else if((C|0)==283){ia=Oa(4)|0;c[ia>>2]=13440;Pb(ia|0,13488,104)}else if((C|0)==302){c[k>>2]=c[k>>2]|4;D=0;E=aa;G=Z}else if((C|0)==322){c[k>>2]=c[k>>2]|4;D=0;E=aa;G=Z}else if((C|0)==325){ia=Oa(4)|0;c[ia>>2]=13440;Pb(ia|0,13488,104)}else if((C|0)==339){c[k>>2]=c[k>>2]|4;D=0;E=aa;G=Z}else if((C|0)==341){h:do{if((W|0)!=0){n=W+1|0;D=W+8|0;o=W+4|0;F=1;i:while(1){l=a[W]|0;if((l&1)==0){l=(l&255)>>>1}else{l=c[o>>2]|0}if(!(F>>>0<l>>>0)){break h}l=c[e>>2]|0;do{if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((dc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1){c[e>>2]=0;l=0;break}else{l=c[e>>2]|0;break}}}else{l=0}}while(0);l=(l|0)==0;do{if((f|0)!=0){if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){if(l){break}else{break i}}if(!((dc[c[(c[f>>2]|0)+36>>2]&63](f)|0)==-1)){if(!l){break i}}else{C=356}}else{C=356}}while(0);if((C|0)==356){C=0;if(l){break}else{f=0}}l=c[e>>2]|0;h=c[l+12>>2]|0;if((h|0)==(c[l+16>>2]|0)){l=dc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{l=d[h]|0}if((a[W]&1)==0){h=n}else{h=c[D>>2]|0}if(!((l&255)<<24>>24==(a[h+F|0]|0))){break}F=F+1|0;J=c[e>>2]|0;h=J+12|0;l=c[h>>2]|0;if((l|0)==(c[J+16>>2]|0)){dc[c[(c[J>>2]|0)+40>>2]&63](J)|0;continue}else{c[h>>2]=l+1;continue}}c[k>>2]=c[k>>2]|4;D=0;break g}}while(0);if((E|0)!=($|0)){c[s>>2]=0;ph(v,E,$,s);if((c[s>>2]|0)==0){D=1}else{c[k>>2]=c[k>>2]|4;D=0}}else{D=1;E=$}}}while(0);if(!((a[t]&1)==0)?(x=c[j>>2]|0,(x|0)!=0):0){gk(x)}if(!((a[r]&1)==0)?(y=c[m>>2]|0,(y|0)!=0):0){gk(y)}if(!((a[w]&1)==0)?(B=c[H>>2]|0,(B|0)!=0):0){gk(B)}if(!((a[q]&1)==0)?(A=c[I>>2]|0,(A|0)!=0):0){gk(A)}if(!((a[v]&1)==0)?(z=c[v+8>>2]|0,(z|0)!=0):0){gk(z)}if((E|0)==0){i=u;return D|0}ac[G&127](E);i=u;return D|0}function nh(a){a=a|0;var b=0,d=0,e=0,f=0;d=Oa(8)|0;c[d>>2]=1456;b=qk(a|0)|0;e=b+13|0;e=(e|0)==0?1:e;while(1){f=fk(e)|0;if((f|0)!=0){e=6;break}f=c[3356]|0;c[3356]=f+0;if((f|0)==0){e=5;break}hc[f&0]()}if((e|0)==5){f=Oa(4)|0;c[f>>2]=13440;Pb(f|0,13488,104)}else if((e|0)==6){c[f+4>>2]=b;c[f>>2]=b;e=f+12|0;c[d+4>>2]=e;c[f+8>>2]=0;vk(e|0,a|0,b+1|0)|0;Pb(d|0,1592,11)}}function oh(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;m=i;i=i+144|0;p=m;t=m+32|0;d=m+16|0;q=m+24|0;s=m+28|0;c[d>>2]=t;l=d+4|0;c[l>>2]=107;n=c[h+28>>2]|0;u=n+4|0;c[u>>2]=(c[u>>2]|0)+1;if(!((c[1160]|0)==-1)){c[p>>2]=4640;c[p+4>>2]=106;c[p+8>>2]=0;td(4640,p)}r=(c[4644>>2]|0)+ -1|0;p=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-p>>2>>>0>r>>>0)){u=Oa(4)|0;c[u>>2]=12496;Pb(u|0,12568,96)}r=c[p+(r<<2)>>2]|0;if((r|0)==0){u=Oa(4)|0;c[u>>2]=12496;Pb(u|0,12568,96)}a[s]=0;p=c[f>>2]|0;do{if(mh(e,p,g,n,c[h+4>>2]|0,j,s,r,d,q,t+100|0)|0){if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}if((a[s]|0)!=0){g=mc[c[(c[r>>2]|0)+28>>2]&15](r,45)|0;h=a[k]|0;o=(h&1)!=0;if(o){s=(c[k>>2]&-2)+ -1|0;h=c[k+4>>2]|0}else{s=10;h=(h&255)>>>1}if((h|0)==(s|0)){zd(k,s,1,s,s,0);if((a[k]&1)==0){o=17}else{o=18}}else{if(o){o=18}else{o=17}}if((o|0)==17){a[k]=(h<<1)+2;t=k+1|0;s=h+1|0}else if((o|0)==18){t=c[k+8>>2]|0;s=h+1|0;c[k+4>>2]=s}a[t+h|0]=g;a[t+s|0]=0}r=mc[c[(c[r>>2]|0)+28>>2]&15](r,48)|0;h=c[d>>2]|0;q=c[q>>2]|0;g=q+ -1|0;a:do{if(h>>>0<g>>>0){while(1){s=h+1|0;if(!((a[h]|0)==r<<24>>24)){break a}if(s>>>0<g>>>0){h=s}else{h=s;break}}}}while(0);t=h;r=a[k]|0;if((r&1)==0){u=r;s=10;r=(r&255)>>>1}else{s=c[k>>2]|0;u=s&255;s=(s&-2)+ -1|0;r=c[k+4>>2]|0}g=q-t|0;if((q|0)!=(h|0)){if((s-r|0)>>>0<g>>>0){zd(k,s,r+g-s|0,r,r,0);u=a[k]|0}if((u&1)==0){s=k+1|0}else{s=c[k+8>>2]|0}t=q+(r-t)|0;u=s+r|0;while(1){a[u]=a[h]|0;h=h+1|0;if((h|0)==(q|0)){break}u=u+1|0}a[s+t|0]=0;q=r+g|0;if((a[k]&1)==0){a[k]=q<<1;break}else{c[k+4>>2]=q;break}}}}while(0);k=c[e>>2]|0;if((k|0)!=0){if((c[k+12>>2]|0)==(c[k+16>>2]|0)?(dc[c[(c[k>>2]|0)+36>>2]&63](k)|0)==-1:0){c[e>>2]=0;k=0}}else{k=0}e=(k|0)==0;do{if((p|0)!=0){if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(e){break}else{o=49;break}}if(!((dc[c[(c[p>>2]|0)+36>>2]&63](p)|0)==-1)){if(e){break}else{o=49;break}}else{c[f>>2]=0;o=47;break}}else{o=47}}while(0);if((o|0)==47?e:0){o=49}if((o|0)==49){c[j>>2]=c[j>>2]|2}c[b>>2]=k;t=n+4|0;u=c[t>>2]|0;c[t>>2]=u+ -1;if((u|0)==0){ac[c[(c[n>>2]|0)+8>>2]&127](n)}f=c[d>>2]|0;c[d>>2]=0;if((f|0)==0){i=m;return}ac[c[l>>2]&127](f);i=m;return}function ph(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;k=a[b]|0;if((k&1)==0){j=(k&255)>>>1}else{j=c[b+4>>2]|0}if((j|0)==0){i=g;return}if((d|0)!=(e|0)?(h=e+ -4|0,h>>>0>d>>>0):0){j=d;do{k=c[j>>2]|0;c[j>>2]=c[h>>2];c[h>>2]=k;j=j+4|0;h=h+ -4|0}while(j>>>0<h>>>0);h=a[b]|0}else{h=k}if((h&1)==0){k=b+1|0;b=(h&255)>>>1}else{k=c[b+8>>2]|0;b=c[b+4>>2]|0}e=e+ -4|0;h=a[k]|0;j=h<<24>>24<1|h<<24>>24==127;a:do{if(e>>>0>d>>>0){b=k+b|0;while(1){if(!j?(h<<24>>24|0)!=(c[d>>2]|0):0){break}k=(b-k|0)>1?k+1|0:k;d=d+4|0;h=a[k]|0;j=h<<24>>24<1|h<<24>>24==127;if(!(d>>>0<e>>>0)){break a}}c[f>>2]=4;i=g;return}}while(0);if(j){i=g;return}k=c[e>>2]|0;if(!(h<<24>>24>>>0<k>>>0|(k|0)==0)){i=g;return}c[f>>2]=4;i=g;return}function qh(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function rh(a){a=a|0;return}function sh(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;m=i;i=i+576|0;q=m;u=m+72|0;d=m+16|0;s=m+24|0;t=m+572|0;r=m+32|0;p=m+472|0;c[d>>2]=u;n=d+4|0;c[n>>2]=107;o=c[h+28>>2]|0;y=o+4|0;c[y>>2]=(c[y>>2]|0)+1;if(!((c[1158]|0)==-1)){c[q>>2]=4632;c[q+4>>2]=106;c[q+8>>2]=0;td(4632,q)}v=(c[4636>>2]|0)+ -1|0;w=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-w>>2>>>0>v>>>0)){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}v=c[w+(v<<2)>>2]|0;if((v|0)==0){y=Oa(4)|0;c[y>>2]=12496;Pb(y|0,12568,96)}a[t]=0;do{if(th(e,c[f>>2]|0,g,o,c[h+4>>2]|0,j,t,v,d,s,u+400|0)|0){jc[c[(c[v>>2]|0)+48>>2]&7](v,4352,4362|0,r)|0;g=c[s>>2]|0;v=c[d>>2]|0;h=g-v|0;if((h|0)>392){u=fk((h>>2)+2|0)|0;if((u|0)==0){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else{h=u}}else{h=0;u=p}if((a[t]|0)!=0){a[u]=45;u=u+1|0}if(v>>>0<g>>>0){t=r+40|0;g=r;do{x=c[v>>2]|0;w=r;while(1){y=w+4|0;if((c[w>>2]|0)==(x|0)){break}if((y|0)==(t|0)){w=t;break}else{w=y}}a[u]=a[4352+(w-g>>2)|0]|0;v=v+4|0;u=u+1|0}while(v>>>0<(c[s>>2]|0)>>>0)}a[u]=0;c[q>>2]=k;if((Ka(p|0,4288,q|0)|0)==1){if((h|0)==0){break}gk(h);break}b=Oa(8)|0;c[b>>2]=1456;while(1){f=fk(28)|0;if((f|0)!=0){l=24;break}l=c[3356]|0;c[3356]=l+0;if((l|0)==0){l=23;break}hc[l&0]()}if((l|0)==23){y=Oa(4)|0;c[y>>2]=13440;Pb(y|0,13488,104)}else if((l|0)==24){c[f+4>>2]=15;c[f>>2]=15;l=f+12|0;c[b+4>>2]=l;c[f+8>>2]=0;l=l+0|0;f=4296|0;d=l+16|0;do{a[l]=a[f]|0;l=l+1|0;f=f+1|0}while((l|0)<(d|0));Pb(b|0,1592,11)}}}while(0);k=c[e>>2]|0;if((k|0)!=0){p=c[k+12>>2]|0;if((p|0)==(c[k+16>>2]|0)){p=dc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{p=c[p>>2]|0}if((p|0)==-1){c[e>>2]=0;e=0;k=1}else{e=k;k=0}}else{e=0;k=1}q=c[f>>2]|0;do{if((q|0)!=0){p=c[q+12>>2]|0;if((p|0)==(c[q+16>>2]|0)){p=dc[c[(c[q>>2]|0)+36>>2]&63](q)|0}else{p=c[p>>2]|0}if(!((p|0)==-1)){if(k){break}else{l=41;break}}else{c[f>>2]=0;l=39;break}}else{l=39}}while(0);if((l|0)==39?k:0){l=41}if((l|0)==41){c[j>>2]=c[j>>2]|2}c[b>>2]=e;x=o+4|0;y=c[x>>2]|0;c[x>>2]=y+ -1;if((y|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}l=c[d>>2]|0;c[d>>2]=0;if((l|0)==0){i=m;return}ac[c[n>>2]&127](l);i=m;return}function th(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;w=i;i=i+592|0;N=w;K=w+572|0;L=w+560|0;M=w+548|0;D=w+536|0;H=w+524|0;G=w+520|0;J=w+508|0;I=w+496|0;C=w+576|0;E=w+432|0;O=w+32|0;F=w+12|0;q=w+16|0;u=w+480|0;r=w+444|0;s=w+456|0;t=w+468|0;A=w+492|0;c[F>>2]=0;c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;if(f){if(!((c[1056]|0)==-1)){c[N>>2]=4224;c[N+4>>2]=106;c[N+8>>2]=0;td(4224,N)}E=(c[4228>>2]|0)+ -1|0;C=c[g+8>>2]|0;if(!((c[g+12>>2]|0)-C>>2>>>0>E>>>0)){$=Oa(4)|0;c[$>>2]=12496;Pb($|0,12568,96)}C=c[C+(E<<2)>>2]|0;if((C|0)==0){$=Oa(4)|0;c[$>>2]=12496;Pb($|0,12568,96)}bc[c[(c[C>>2]|0)+44>>2]&63](K,C);c[F>>2]=c[K>>2];bc[c[(c[C>>2]|0)+32>>2]&63](L,C);if((a[s]&1)==0){c[s+4>>2]=0;a[s]=0}else{c[c[s+8>>2]>>2]=0;c[s+4>>2]=0}Bd(s);c[s+0>>2]=c[L+0>>2];c[s+4>>2]=c[L+4>>2];c[s+8>>2]=c[L+8>>2];c[L+0>>2]=0;c[L+4>>2]=0;c[L+8>>2]=0;bc[c[(c[C>>2]|0)+28>>2]&63](M,C);if((a[r]&1)==0){c[r+4>>2]=0;a[r]=0}else{c[c[r+8>>2]>>2]=0;c[r+4>>2]=0}Bd(r);c[r+0>>2]=c[M+0>>2];c[r+4>>2]=c[M+4>>2];c[r+8>>2]=c[M+8>>2];c[M+0>>2]=0;c[M+4>>2]=0;c[M+8>>2]=0;g=dc[c[(c[C>>2]|0)+12>>2]&63](C)|0;G=dc[c[(c[C>>2]|0)+16>>2]&63](C)|0;bc[c[(c[C>>2]|0)+20>>2]&63](D,C);if((a[q]&1)==0){a[q+1|0]=0;a[q]=0}else{a[c[q+8>>2]|0]=0;c[q+4>>2]=0}xd(q);c[q+0>>2]=c[D+0>>2];c[q+4>>2]=c[D+4>>2];c[q+8>>2]=c[D+8>>2];c[D+0>>2]=0;c[D+4>>2]=0;c[D+8>>2]=0;bc[c[(c[C>>2]|0)+24>>2]&63](H,C);if((a[u]&1)==0){c[u+4>>2]=0;a[u]=0}else{c[c[u+8>>2]>>2]=0;c[u+4>>2]=0}Bd(u);c[u+0>>2]=c[H+0>>2];c[u+4>>2]=c[H+4>>2];c[u+8>>2]=c[H+8>>2];c[H+0>>2]=0;c[H+4>>2]=0;c[H+8>>2]=0;Q=dc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{if(!((c[1040]|0)==-1)){c[N>>2]=4160;c[N+4>>2]=106;c[N+8>>2]=0;td(4160,N)}H=(c[4164>>2]|0)+ -1|0;D=c[g+8>>2]|0;if(!((c[g+12>>2]|0)-D>>2>>>0>H>>>0)){$=Oa(4)|0;c[$>>2]=12496;Pb($|0,12568,96)}D=c[D+(H<<2)>>2]|0;if((D|0)==0){$=Oa(4)|0;c[$>>2]=12496;Pb($|0,12568,96)}bc[c[(c[D>>2]|0)+44>>2]&63](G,D);c[F>>2]=c[G>>2];bc[c[(c[D>>2]|0)+32>>2]&63](J,D);if((a[s]&1)==0){c[s+4>>2]=0;a[s]=0}else{c[c[s+8>>2]>>2]=0;c[s+4>>2]=0}Bd(s);c[s+0>>2]=c[J+0>>2];c[s+4>>2]=c[J+4>>2];c[s+8>>2]=c[J+8>>2];c[J+0>>2]=0;c[J+4>>2]=0;c[J+8>>2]=0;bc[c[(c[D>>2]|0)+28>>2]&63](I,D);if((a[r]&1)==0){c[r+4>>2]=0;a[r]=0}else{c[c[r+8>>2]>>2]=0;c[r+4>>2]=0}Bd(r);c[r+0>>2]=c[I+0>>2];c[r+4>>2]=c[I+4>>2];c[r+8>>2]=c[I+8>>2];c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;g=dc[c[(c[D>>2]|0)+12>>2]&63](D)|0;G=dc[c[(c[D>>2]|0)+16>>2]&63](D)|0;bc[c[(c[D>>2]|0)+20>>2]&63](C,D);if((a[q]&1)==0){a[q+1|0]=0;a[q]=0}else{a[c[q+8>>2]|0]=0;c[q+4>>2]=0}xd(q);c[q+0>>2]=c[C+0>>2];c[q+4>>2]=c[C+4>>2];c[q+8>>2]=c[C+8>>2];c[C+0>>2]=0;c[C+4>>2]=0;c[C+8>>2]=0;bc[c[(c[D>>2]|0)+24>>2]&63](E,D);if((a[u]&1)==0){c[u+4>>2]=0;a[u]=0}else{c[c[u+8>>2]>>2]=0;c[u+4>>2]=0}Bd(u);c[u+0>>2]=c[E+0>>2];c[u+4>>2]=c[E+4>>2];c[u+8>>2]=c[E+8>>2];c[E+0>>2]=0;c[E+4>>2]=0;c[E+8>>2]=0;Q=dc[c[(c[D>>2]|0)+36>>2]&63](D)|0}c[n>>2]=c[m>>2];H=s+4|0;C=s+8|0;I=r+4|0;D=r+8|0;f=(h&512|0)!=0;L=u+4|0;E=u+8|0;M=t+4|0;h=t+8|0;K=F+3|0;N=m+4|0;J=q+4|0;S=O+400|0;T=O;U=O;P=0;O=0;R=107;a:while(1){W=c[b>>2]|0;do{if((W|0)!=0){V=c[W+12>>2]|0;if((V|0)==(c[W+16>>2]|0)){V=dc[c[(c[W>>2]|0)+36>>2]&63](W)|0}else{V=c[V>>2]|0}if((V|0)==-1){c[b>>2]=0;V=1;break}else{V=(c[b>>2]|0)==0;break}}else{V=1}}while(0);if((e|0)!=0){W=c[e+12>>2]|0;if((W|0)==(c[e+16>>2]|0)){W=dc[c[(c[e>>2]|0)+36>>2]&63](e)|0}else{W=c[W>>2]|0}if(!((W|0)==-1)){if(!V){B=337;break}}else{B=51}}else{B=51}if((B|0)==51){B=0;if(V){e=0;B=337;break}else{e=0}}b:do{switch(a[F+P|0]|0){case 1:{if((P|0)==3){B=337;break a}B=c[b>>2]|0;V=c[B+12>>2]|0;if((V|0)==(c[B+16>>2]|0)){B=dc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{B=c[V>>2]|0}if(!(Zb[c[(c[l>>2]|0)+12>>2]&31](l,8192,B)|0)){B=71;break a}V=c[b>>2]|0;W=V+12|0;B=c[W>>2]|0;if((B|0)==(c[V+16>>2]|0)){V=dc[c[(c[V>>2]|0)+40>>2]&63](V)|0}else{c[W>>2]=B+4;V=c[B>>2]|0}W=a[t]|0;B=(W&1)!=0;if(B){X=(c[t>>2]&-2)+ -1|0;W=c[M>>2]|0}else{X=1;W=(W&255)>>>1}if((W|0)==(X|0)){Cd(t,X,1,X,X,0,0);if((a[t]&1)==0){B=68}else{B=69}}else{if(B){B=69}else{B=68}}if((B|0)==68){a[t]=(W<<1)+2;Y=M;X=W+1|0}else if((B|0)==69){Y=c[h>>2]|0;X=W+1|0;c[M>>2]=X}c[Y+(W<<2)>>2]=V;c[Y+(X<<2)>>2]=0;B=72;break};case 3:{V=a[r]|0;X=(V&1)==0;if(X){Z=(V&255)>>>1}else{Z=c[I>>2]|0}W=a[s]|0;Y=(W&1)==0;if(Y){_=(W&255)>>>1}else{_=c[H>>2]|0}if((Z|0)==(0-_|0)){X=e}else{if(X){Z=(V&255)>>>1}else{Z=c[I>>2]|0}if((Z|0)!=0){if(Y){Y=(W&255)>>>1}else{Y=c[H>>2]|0}if((Y|0)!=0){X=c[b>>2]|0;Y=c[X+12>>2]|0;Z=c[X+16>>2]|0;if((Y|0)==(Z|0)){W=dc[c[(c[X>>2]|0)+36>>2]&63](X)|0;Z=c[b>>2]|0;V=a[r]|0;X=Z;Y=c[Z+12>>2]|0;Z=c[Z+16>>2]|0}else{W=c[Y>>2]|0}_=X+12|0;Z=(Y|0)==(Z|0);if((W|0)==(c[((V&1)==0?I:c[D>>2]|0)>>2]|0)){if(Z){dc[c[(c[X>>2]|0)+40>>2]&63](X)|0}else{c[_>>2]=Y+4}V=a[r]|0;if((V&1)==0){V=(V&255)>>>1}else{V=c[I>>2]|0}X=e;O=V>>>0>1?r:O;break b}if(Z){V=dc[c[(c[X>>2]|0)+36>>2]&63](X)|0}else{V=c[Y>>2]|0}if((V|0)!=(c[((a[s]&1)==0?H:c[C>>2]|0)>>2]|0)){B=167;break a}W=c[b>>2]|0;X=W+12|0;V=c[X>>2]|0;if((V|0)==(c[W+16>>2]|0)){dc[c[(c[W>>2]|0)+40>>2]&63](W)|0}else{c[X>>2]=V+4}a[k]=1;V=a[s]|0;if((V&1)==0){V=(V&255)>>>1}else{V=c[H>>2]|0}X=e;O=V>>>0>1?s:O;break b}}if(X){_=(V&255)>>>1}else{_=c[I>>2]|0}Z=c[b>>2]|0;Y=c[Z+12>>2]|0;X=(Y|0)==(c[Z+16>>2]|0);if((_|0)==0){if(X){V=dc[c[(c[Z>>2]|0)+36>>2]&63](Z)|0;W=a[s]|0}else{V=c[Y>>2]|0}if((V|0)!=(c[((W&1)==0?H:c[C>>2]|0)>>2]|0)){X=e;break b}V=c[b>>2]|0;W=V+12|0;X=c[W>>2]|0;if((X|0)==(c[V+16>>2]|0)){dc[c[(c[V>>2]|0)+40>>2]&63](V)|0}else{c[W>>2]=X+4}a[k]=1;V=a[s]|0;if((V&1)==0){V=(V&255)>>>1}else{V=c[H>>2]|0}X=e;O=V>>>0>1?s:O;break b}if(X){W=dc[c[(c[Z>>2]|0)+36>>2]&63](Z)|0;V=a[r]|0}else{W=c[Y>>2]|0}if((W|0)!=(c[((V&1)==0?I:c[D>>2]|0)>>2]|0)){a[k]=1;X=e;break b}V=c[b>>2]|0;W=V+12|0;X=c[W>>2]|0;if((X|0)==(c[V+16>>2]|0)){dc[c[(c[V>>2]|0)+40>>2]&63](V)|0}else{c[W>>2]=X+4}V=a[r]|0;if((V&1)==0){V=(V&255)>>>1}else{V=c[I>>2]|0}X=e;O=V>>>0>1?r:O}break};case 0:{B=72;break};case 2:{if(!((O|0)!=0|P>>>0<2)){if((P|0)==2){V=(a[K]|0)!=0}else{V=0}if(!(f|V)){X=e;O=0;break b}}Z=a[u]|0;V=(Z&1)==0?L:c[E>>2]|0;c:do{if((P|0)!=0?(d[F+(P+ -1)|0]|0)<2:0){while(1){if((Z&1)==0){X=L;W=(Z&255)>>>1}else{X=c[E>>2]|0;W=c[L>>2]|0}if((V|0)==(X+(W<<2)|0)){break}if(!(Zb[c[(c[l>>2]|0)+12>>2]&31](l,8192,c[V>>2]|0)|0)){B=180;break}Z=a[u]|0;V=V+4|0}if((B|0)==180){B=0;Z=a[u]|0}Y=(Z&1)==0?L:c[E>>2]|0;W=V-Y>>2;_=a[t]|0;X=(_&1)==0;if(X){$=(_&255)>>>1}else{$=c[M>>2]|0}if(!(W>>>0>$>>>0)){if(X){X=(_&255)>>>1;$=M;_=X;X=M+(X-W<<2)|0}else{aa=c[h>>2]|0;X=c[M>>2]|0;$=aa;_=X;X=aa+(X-W<<2)|0}W=$+(_<<2)|0;if((X|0)!=(W|0)){if((c[X>>2]|0)==(c[Y>>2]|0)){_=Y;while(1){X=X+4|0;_=_+4|0;if((X|0)==(W|0)){W=e;X=e;_=e;break c}if((c[X>>2]|0)!=(c[_>>2]|0)){W=e;X=e;V=Y;_=e;break}}}else{W=e;X=e;V=Y;_=e}}else{W=e;X=e;_=e}}else{W=e;X=e;V=Y;_=e}}else{W=e;X=e;_=e}}while(0);while(1){if((Z&1)==0){Y=L;Z=(Z&255)>>>1}else{Y=c[E>>2]|0;Z=c[L>>2]|0}if((V|0)==(Y+(Z<<2)|0)){break}Z=c[b>>2]|0;do{if((Z|0)!=0){Y=c[Z+12>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=dc[c[(c[Z>>2]|0)+36>>2]&63](Z)|0}else{Y=c[Y>>2]|0}if((Y|0)==-1){c[b>>2]=0;Y=1;break}else{Y=(c[b>>2]|0)==0;break}}else{Y=1}}while(0);if((_|0)!=0){Z=c[_+12>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Z=dc[c[(c[_>>2]|0)+36>>2]&63](_)|0}else{Z=c[Z>>2]|0}if(!((Z|0)==-1)){if(Y^(W|0)==0){Y=W;_=W}else{break}}else{W=0;X=0;e=0;B=208}}else{B=208}if((B|0)==208){B=0;if(Y){break}else{Y=W;_=0}}Z=c[b>>2]|0;W=c[Z+12>>2]|0;if((W|0)==(c[Z+16>>2]|0)){W=dc[c[(c[Z>>2]|0)+36>>2]&63](Z)|0}else{W=c[W>>2]|0}if((W|0)!=(c[V>>2]|0)){break}W=c[b>>2]|0;Z=W+12|0;$=c[Z>>2]|0;if(($|0)==(c[W+16>>2]|0)){dc[c[(c[W>>2]|0)+40>>2]&63](W)|0}else{c[Z>>2]=$+4}W=Y;Z=a[u]|0;V=V+4|0}if(f){Y=a[u]|0;if((Y&1)==0){W=L;Y=(Y&255)>>>1}else{W=c[E>>2]|0;Y=c[L>>2]|0}if((V|0)!=(W+(Y<<2)|0)){B=223;break a}}break};case 4:{W=e;X=e;V=0;while(1){Z=c[b>>2]|0;do{if((Z|0)!=0){Y=c[Z+12>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=dc[c[(c[Z>>2]|0)+36>>2]&63](Z)|0}else{Y=c[Y>>2]|0}if((Y|0)==-1){c[b>>2]=0;Y=1;break}else{Y=(c[b>>2]|0)==0;break}}else{Y=1}}while(0);if((X|0)!=0){Z=c[X+12>>2]|0;if((Z|0)==(c[X+16>>2]|0)){Z=dc[c[(c[X>>2]|0)+36>>2]&63](X)|0}else{Z=c[Z>>2]|0}if(!((Z|0)==-1)){if(!Y){break}}else{W=0;e=0;B=236}}else{B=236}if((B|0)==236){B=0;if(Y){X=0;break}else{X=0}}Y=c[b>>2]|0;Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=dc[c[(c[Y>>2]|0)+36>>2]&63](Y)|0}else{Y=c[Z>>2]|0}if(Zb[c[(c[l>>2]|0)+12>>2]&31](l,2048,Y)|0){Z=c[n>>2]|0;if((Z|0)==(o|0)){_=(c[N>>2]|0)!=107;$=c[m>>2]|0;Z=o-$|0;o=Z>>>0<2147483647?Z<<1:-1;Z=Z>>2;if(!_){$=0}$=hk($,o)|0;if(($|0)==0){B=246;break a}if(!_){_=c[m>>2]|0;c[m>>2]=$;if((_|0)!=0){ac[c[N>>2]&127](_);$=c[m>>2]|0}}else{c[m>>2]=$}c[N>>2]=108;Z=$+(Z<<2)|0;c[n>>2]=Z;o=(c[m>>2]|0)+(o>>>2<<2)|0}c[n>>2]=Z+4;c[Z>>2]=Y;V=V+1|0}else{Z=a[q]|0;if((Z&1)==0){Z=(Z&255)>>>1}else{Z=c[J>>2]|0}if(!((V|0)!=0&(Z|0)!=0&(Y|0)==(G|0))){break}if((T|0)==(S|0)){T=T-U|0;S=T>>>0<2147483647?T<<1:-1;if((R|0)==107){U=0}R=hk(U,S)|0;if((R|0)==0){B=261;break a}U=R;S=R+(S>>>2<<2)|0;T=R+(T>>2<<2)|0;R=108}c[T>>2]=V;T=T+4|0;V=0}Y=c[b>>2]|0;Z=Y+12|0;_=c[Z>>2]|0;if((_|0)==(c[Y+16>>2]|0)){dc[c[(c[Y>>2]|0)+40>>2]&63](Y)|0;continue}else{c[Z>>2]=_+4;continue}}if(!((U|0)==(T|0)|(V|0)==0)){if((T|0)==(S|0)){T=T-U|0;S=T>>>0<2147483647?T<<1:-1;if((R|0)==107){U=0}R=hk(U,S)|0;if((R|0)==0){B=272;break a}U=R;S=R+(S>>>2<<2)|0;T=R+(T>>2<<2)|0;R=108}c[T>>2]=V;T=T+4|0}if((Q|0)>0){X=c[b>>2]|0;do{if((X|0)!=0){V=c[X+12>>2]|0;if((V|0)==(c[X+16>>2]|0)){V=dc[c[(c[X>>2]|0)+36>>2]&63](X)|0}else{V=c[V>>2]|0}if((V|0)==-1){c[b>>2]=0;V=1;break}else{V=(c[b>>2]|0)==0;break}}else{V=1}}while(0);if((W|0)!=0){X=c[W+12>>2]|0;if((X|0)==(c[W+16>>2]|0)){X=dc[c[(c[W>>2]|0)+36>>2]&63](W)|0}else{X=c[X>>2]|0}if(!((X|0)==-1)){if(!V){B=294;break a}}else{e=0;B=288}}else{B=288}if((B|0)==288){B=0;if(V){B=294;break a}else{W=0}}V=c[b>>2]|0;X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){V=dc[c[(c[V>>2]|0)+36>>2]&63](V)|0}else{V=c[X>>2]|0}if((V|0)!=(g|0)){B=294;break a}V=c[b>>2]|0;X=V+12|0;Y=c[X>>2]|0;if((Y|0)==(c[V+16>>2]|0)){dc[c[(c[V>>2]|0)+40>>2]&63](V)|0;Y=W;X=W}else{c[X>>2]=Y+4;Y=W;X=W}while(1){V=c[b>>2]|0;do{if((V|0)!=0){Z=c[V+12>>2]|0;if((Z|0)==(c[V+16>>2]|0)){V=dc[c[(c[V>>2]|0)+36>>2]&63](V)|0}else{V=c[Z>>2]|0}if((V|0)==-1){c[b>>2]=0;Z=1;break}else{Z=(c[b>>2]|0)==0;break}}else{Z=1}}while(0);if((W|0)!=0){V=c[W+12>>2]|0;if((V|0)==(c[W+16>>2]|0)){V=dc[c[(c[W>>2]|0)+36>>2]&63](W)|0}else{V=c[V>>2]|0}if(!((V|0)==-1)){if(Z^(Y|0)==0){V=Y;W=Y}else{B=316;break a}}else{V=0;X=0;e=0;B=310}}else{V=Y;B=310}if((B|0)==310){B=0;if(Z){B=316;break a}else{W=0}}Z=c[b>>2]|0;Y=c[Z+12>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=dc[c[(c[Z>>2]|0)+36>>2]&63](Z)|0}else{Y=c[Y>>2]|0}if(!(Zb[c[(c[l>>2]|0)+12>>2]&31](l,2048,Y)|0)){B=316;break a}Y=c[n>>2]|0;if((Y|0)==(o|0)){Z=(c[N>>2]|0)!=107;_=c[m>>2]|0;Y=o-_|0;o=Y>>>0<2147483647?Y<<1:-1;Y=Y>>2;if(!Z){_=0}_=hk(_,o)|0;if((_|0)==0){B=321;break a}if(!Z){Z=c[m>>2]|0;c[m>>2]=_;if((Z|0)!=0){ac[c[N>>2]&127](Z);_=c[m>>2]|0}}else{c[m>>2]=_}c[N>>2]=108;Y=_+(Y<<2)|0;c[n>>2]=Y;o=(c[m>>2]|0)+(o>>>2<<2)|0}_=c[b>>2]|0;Z=c[_+12>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Z=dc[c[(c[_>>2]|0)+36>>2]&63](_)|0;Y=c[n>>2]|0}else{Z=c[Z>>2]|0}c[n>>2]=Y+4;c[Y>>2]=Z;Q=Q+ -1|0;_=c[b>>2]|0;Z=_+12|0;Y=c[Z>>2]|0;if((Y|0)==(c[_+16>>2]|0)){dc[c[(c[_>>2]|0)+40>>2]&63](_)|0}else{c[Z>>2]=Y+4}if((Q|0)>0){Y=V}else{break}}}if((c[n>>2]|0)==(c[m>>2]|0)){B=335;break a}break};default:{X=e}}}while(0);d:do{if((B|0)==72){B=0;if((P|0)==3){B=337;break a}else{Y=e;X=e;W=e}while(1){V=c[b>>2]|0;do{if((V|0)!=0){Z=c[V+12>>2]|0;if((Z|0)==(c[V+16>>2]|0)){V=dc[c[(c[V>>2]|0)+36>>2]&63](V)|0}else{V=c[Z>>2]|0}if((V|0)==-1){c[b>>2]=0;Z=1;break}else{Z=(c[b>>2]|0)==0;break}}else{Z=1}}while(0);if((W|0)!=0){V=c[W+12>>2]|0;if((V|0)==(c[W+16>>2]|0)){V=dc[c[(c[W>>2]|0)+36>>2]&63](W)|0}else{V=c[V>>2]|0}if(!((V|0)==-1)){if(Z^(Y|0)==0){V=Y;W=Y}else{break d}}else{V=0;X=0;e=0;B=85}}else{V=Y;B=85}if((B|0)==85){B=0;if(Z){break d}else{W=0}}Z=c[b>>2]|0;Y=c[Z+12>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=dc[c[(c[Z>>2]|0)+36>>2]&63](Z)|0}else{Y=c[Y>>2]|0}if(!(Zb[c[(c[l>>2]|0)+12>>2]&31](l,8192,Y)|0)){break d}Z=c[b>>2]|0;B=Z+12|0;Y=c[B>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=dc[c[(c[Z>>2]|0)+40>>2]&63](Z)|0}else{c[B>>2]=Y+4;Y=c[Y>>2]|0}Z=a[t]|0;_=(Z&1)!=0;if(_){B=(c[t>>2]&-2)+ -1|0;Z=c[M>>2]|0}else{B=1;Z=(Z&255)>>>1}if((Z|0)==(B|0)){Cd(t,B,1,B,B,0,0);if((a[t]&1)==0){B=100}else{B=101}}else{if(_){B=101}else{B=100}}if((B|0)==100){B=0;a[t]=(Z<<1)+2;_=M;$=Z+1|0}else if((B|0)==101){B=0;_=c[h>>2]|0;$=Z+1|0;c[M>>2]=$}c[_+(Z<<2)>>2]=Y;c[_+($<<2)>>2]=0;Y=V}}}while(0);P=P+1|0;if(!(P>>>0<4)){e=X;B=337;break}}e:do{if((B|0)==71){c[j>>2]=c[j>>2]|4;j=0;T=U}else if((B|0)==167){c[j>>2]=c[j>>2]|4;j=0;T=U}else if((B|0)==223){c[j>>2]=c[j>>2]|4;j=0;T=U}else if((B|0)==246){aa=Oa(4)|0;c[aa>>2]=13440;Pb(aa|0,13488,104)}else if((B|0)==261){aa=Oa(4)|0;c[aa>>2]=13440;Pb(aa|0,13488,104)}else if((B|0)==272){aa=Oa(4)|0;c[aa>>2]=13440;Pb(aa|0,13488,104)}else if((B|0)==294){c[j>>2]=c[j>>2]|4;j=0;T=U}else if((B|0)==316){c[j>>2]=c[j>>2]|4;j=0;T=U}else if((B|0)==321){aa=Oa(4)|0;c[aa>>2]=13440;Pb(aa|0,13488,104)}else if((B|0)==335){c[j>>2]=c[j>>2]|4;j=0;T=U}else if((B|0)==337){f:do{if((O|0)!=0){l=O+4|0;n=O+8|0;m=1;while(1){k=a[O]|0;if((k&1)==0){k=(k&255)>>>1}else{k=c[l>>2]|0}if(!(m>>>0<k>>>0)){break f}F=c[b>>2]|0;do{if((F|0)!=0){k=c[F+12>>2]|0;if((k|0)==(c[F+16>>2]|0)){k=dc[c[(c[F>>2]|0)+36>>2]&63](F)|0}else{k=c[k>>2]|0}if((k|0)==-1){c[b>>2]=0;k=1;break}else{k=(c[b>>2]|0)==0;break}}else{k=1}}while(0);if((e|0)!=0){F=c[e+12>>2]|0;if((F|0)==(c[e+16>>2]|0)){F=dc[c[(c[e>>2]|0)+36>>2]&63](e)|0}else{F=c[F>>2]|0}if(!((F|0)==-1)){if(!k){break}}else{B=355}}else{B=355}if((B|0)==355){B=0;if(k){break}else{e=0}}k=c[b>>2]|0;F=c[k+12>>2]|0;if((F|0)==(c[k+16>>2]|0)){F=dc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{F=c[F>>2]|0}if((a[O]&1)==0){k=l}else{k=c[n>>2]|0}if((F|0)!=(c[k+(m<<2)>>2]|0)){break}m=m+1|0;g=c[b>>2]|0;F=g+12|0;k=c[F>>2]|0;if((k|0)==(c[g+16>>2]|0)){dc[c[(c[g>>2]|0)+40>>2]&63](g)|0;continue}else{c[F>>2]=k+4;continue}}c[j>>2]=c[j>>2]|4;j=0;T=U;break e}}while(0);if((U|0)!=(T|0)){c[A>>2]=0;ph(q,U,T,A);if((c[A>>2]|0)==0){j=1;T=U}else{c[j>>2]=c[j>>2]|4;j=0;T=U}}else{j=1}}}while(0);if(!((a[t]&1)==0)?(v=c[h>>2]|0,(v|0)!=0):0){gk(v)}if(!((a[s]&1)==0)?(x=c[C>>2]|0,(x|0)!=0):0){gk(x)}if(!((a[r]&1)==0)?(y=c[D>>2]|0,(y|0)!=0):0){gk(y)}if(!((a[u]&1)==0)?(z=c[E>>2]|0,(z|0)!=0):0){gk(z)}if(!((a[q]&1)==0)?(p=c[q+8>>2]|0,(p|0)!=0):0){gk(p)}if((T|0)==0){i=w;return j|0}ac[R&127](T);i=w;return j|0}function uh(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;m=i;i=i+448|0;p=m;s=m+32|0;d=m+16|0;q=m+24|0;t=m+432|0;c[d>>2]=s;l=d+4|0;c[l>>2]=107;n=c[h+28>>2]|0;v=n+4|0;c[v>>2]=(c[v>>2]|0)+1;if(!((c[1158]|0)==-1)){c[p>>2]=4632;c[p+4>>2]=106;c[p+8>>2]=0;td(4632,p)}p=(c[4636>>2]|0)+ -1|0;r=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-r>>2>>>0>p>>>0)){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}r=c[r+(p<<2)>>2]|0;if((r|0)==0){v=Oa(4)|0;c[v>>2]=12496;Pb(v|0,12568,96)}a[t]=0;p=c[f>>2]|0;do{if(th(e,p,g,n,c[h+4>>2]|0,j,t,r,d,q,s+400|0)|0){if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}if((a[t]|0)!=0){h=mc[c[(c[r>>2]|0)+44>>2]&15](r,45)|0;g=a[k]|0;s=(g&1)!=0;if(s){o=(c[k>>2]&-2)+ -1|0;g=c[k+4>>2]|0}else{o=1;g=(g&255)>>>1}if((g|0)==(o|0)){Cd(k,o,1,o,o,0,0);if((a[k]&1)==0){o=17}else{o=18}}else{if(s){o=18}else{o=17}}if((o|0)==17){a[k]=(g<<1)+2;t=k+4|0;s=g+1|0}else if((o|0)==18){t=c[k+8>>2]|0;s=g+1|0;c[k+4>>2]=s}c[t+(g<<2)>>2]=h;c[t+(s<<2)>>2]=0}h=mc[c[(c[r>>2]|0)+44>>2]&15](r,48)|0;s=c[d>>2]|0;q=c[q>>2]|0;r=q+ -4|0;a:do{if(s>>>0<r>>>0){while(1){g=s+4|0;if((c[s>>2]|0)!=(h|0)){break a}if(g>>>0<r>>>0){s=g}else{s=g;break}}}}while(0);u=s;h=a[k]|0;if((h&1)==0){t=h;v=1;h=(h&255)>>>1}else{v=c[k>>2]|0;t=v&255;v=(v&-2)+ -1|0;h=c[k+4>>2]|0}g=q-u>>2;if((g|0)!=0){if((v-h|0)>>>0<g>>>0){Cd(k,v,h+g-v|0,h,h,0,0);t=a[k]|0}if((t&1)==0){t=k+4|0}else{t=c[k+8>>2]|0}v=t+(h<<2)|0;if((s|0)!=(q|0)){r=((r+(0-u)|0)>>>2)+1|0;while(1){c[v>>2]=c[s>>2];s=s+4|0;if((s|0)==(q|0)){break}v=v+4|0}v=t+(r+h<<2)|0}c[v>>2]=0;q=h+g|0;if((a[k]&1)==0){a[k]=q<<1;break}else{c[k+4>>2]=q;break}}}}while(0);k=c[e>>2]|0;if((k|0)!=0){q=c[k+12>>2]|0;if((q|0)==(c[k+16>>2]|0)){q=dc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{q=c[q>>2]|0}if((q|0)==-1){c[e>>2]=0;k=0;e=1}else{e=0}}else{k=0;e=1}do{if((p|0)!=0){q=c[p+12>>2]|0;if((q|0)==(c[p+16>>2]|0)){p=dc[c[(c[p>>2]|0)+36>>2]&63](p)|0}else{p=c[q>>2]|0}if(!((p|0)==-1)){if(e){break}else{o=54;break}}else{c[f>>2]=0;o=52;break}}else{o=52}}while(0);if((o|0)==52?e:0){o=54}if((o|0)==54){c[j>>2]=c[j>>2]|2}c[b>>2]=k;u=n+4|0;v=c[u>>2]|0;c[u>>2]=v+ -1;if((v|0)==0){ac[c[(c[n>>2]|0)+8>>2]&127](n)}b=c[d>>2]|0;c[d>>2]=0;if((b|0)==0){i=m;return}ac[c[l>>2]&127](b);i=m;return}function vh(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function wh(a){a=a|0;return}function xh(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;w=i;i=i+368|0;y=w;B=w+256|0;E=w+152|0;A=w+156|0;v=w+148|0;d=w+357|0;p=w+356|0;s=w+128|0;q=w+116|0;r=w+104|0;F=w+100|0;t=w+140|0;u=w+144|0;c[E>>2]=B;h[k>>3]=l;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=cb(B|0,100,4408,y|0)|0;if(B>>>0>99){if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}B=c[1136]|0;h[k>>3]=l;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=Bf(E,B,4408,y)|0;z=c[E>>2]|0;if((z|0)==0){G=Oa(4)|0;c[G>>2]=13440;Pb(G|0,13488,104)}A=fk(B)|0;if((A|0)==0){G=Oa(4)|0;c[G>>2]=13440;Pb(G|0,13488,104)}else{x=A}}else{x=0;z=0}C=c[g+28>>2]|0;G=C+4|0;c[G>>2]=(c[G>>2]|0)+1;if(!((c[1160]|0)==-1)){c[y>>2]=4640;c[y+4>>2]=106;c[y+8>>2]=0;td(4640,y)}D=(c[4644>>2]|0)+ -1|0;G=c[C+8>>2]|0;if(!((c[C+12>>2]|0)-G>>2>>>0>D>>>0)){G=Oa(4)|0;c[G>>2]=12496;Pb(G|0,12568,96)}D=c[G+(D<<2)>>2]|0;if((D|0)==0){G=Oa(4)|0;c[G>>2]=12496;Pb(G|0,12568,96)}G=c[E>>2]|0;jc[c[(c[D>>2]|0)+32>>2]&7](D,G,G+B|0,A)|0;if((B|0)==0){E=0}else{E=(a[c[E>>2]|0]|0)==45}c[v>>2]=0;c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;yh(f,E,C,v,d,p,s,q,r,F);f=c[F>>2]|0;if((B|0)>(f|0)){F=a[r]|0;if((F&1)==0){F=(F&255)>>>1}else{F=c[r+4>>2]|0}G=a[q]|0;if((G&1)==0){G=(G&255)>>>1}else{G=c[q+4>>2]|0}F=F+(B-f<<1|1)+G|0}else{F=a[r]|0;if((F&1)==0){F=(F&255)>>>1}else{F=c[r+4>>2]|0}G=a[q]|0;if((G&1)==0){G=(G&255)>>>1}else{G=c[q+4>>2]|0}F=F+2+G|0}F=F+f|0;if(F>>>0>100){y=fk(F)|0;if((y|0)==0){G=Oa(4)|0;c[G>>2]=13440;Pb(G|0,13488,104)}else{F=y}}else{F=0}zh(y,t,u,c[g+4>>2]|0,A,A+B|0,D,E,v,a[d]|0,a[p]|0,s,q,r,f);wf(b,c[e>>2]|0,y,c[t>>2]|0,c[u>>2]|0,g,j);if((F|0)!=0){gk(F)}if(!((a[r]&1)==0)?(n=c[r+8>>2]|0,(n|0)!=0):0){gk(n)}if(!((a[q]&1)==0)?(o=c[q+8>>2]|0,(o|0)!=0):0){gk(o)}if(!((a[s]&1)==0)?(m=c[s+8>>2]|0,(m|0)!=0):0){gk(m)}F=C+4|0;G=c[F>>2]|0;c[F>>2]=G+ -1;if((G|0)==0){ac[c[(c[C>>2]|0)+8>>2]&127](C)}if((x|0)!=0){gk(x)}if((z|0)==0){i=w;return}gk(z);i=w;return}



function yh(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;n=i;i=i+128|0;A=n;x=n+108|0;o=n+96|0;v=n+92|0;w=n+80|0;u=n+68|0;z=n+112|0;r=n+40|0;q=n+28|0;t=n+24|0;s=n+12|0;p=n+44|0;y=n+56|0;if(b){if(!((c[1024]|0)==-1)){c[A>>2]=4096;c[A+4>>2]=106;c[A+8>>2]=0;td(4096,A)}q=(c[4100>>2]|0)+ -1|0;p=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-p>>2>>>0>q>>>0)){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}p=c[p+(q<<2)>>2]|0;if((p|0)==0){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}q=c[p>>2]|0;if(d){bc[c[q+44>>2]&63](x,p);b=c[x>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[p>>2]|0)+32>>2]&63](o,p);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xd(l);c[l+0>>2]=c[o+0>>2];c[l+4>>2]=c[o+4>>2];c[l+8>>2]=c[o+8>>2];c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0}else{bc[c[q+40>>2]&63](v,p);b=c[v>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[p>>2]|0)+28>>2]&63](w,p);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xd(l);c[l+0>>2]=c[w+0>>2];c[l+4>>2]=c[w+4>>2];c[l+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0}a[g]=dc[c[(c[p>>2]|0)+12>>2]&63](p)|0;a[h]=dc[c[(c[p>>2]|0)+16>>2]&63](p)|0;bc[c[(c[p>>2]|0)+20>>2]&63](u,p);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xd(j);c[j+0>>2]=c[u+0>>2];c[j+4>>2]=c[u+4>>2];c[j+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;bc[c[(c[p>>2]|0)+24>>2]&63](z,p);if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}xd(k);c[k+0>>2]=c[z+0>>2];c[k+4>>2]=c[z+4>>2];c[k+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;b=dc[c[(c[p>>2]|0)+36>>2]&63](p)|0;c[m>>2]=b;i=n;return}else{if(!((c[1008]|0)==-1)){c[A>>2]=4032;c[A+4>>2]=106;c[A+8>>2]=0;td(4032,A)}u=(c[4036>>2]|0)+ -1|0;o=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-o>>2>>>0>u>>>0)){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}o=c[o+(u<<2)>>2]|0;if((o|0)==0){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}e=c[o>>2]|0;if(d){bc[c[e+44>>2]&63](r,o);b=c[r>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[o>>2]|0)+32>>2]&63](q,o);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xd(l);c[l+0>>2]=c[q+0>>2];c[l+4>>2]=c[q+4>>2];c[l+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0}else{bc[c[e+40>>2]&63](t,o);b=c[t>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[o>>2]|0)+28>>2]&63](s,o);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xd(l);c[l+0>>2]=c[s+0>>2];c[l+4>>2]=c[s+4>>2];c[l+8>>2]=c[s+8>>2];c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0}a[g]=dc[c[(c[o>>2]|0)+12>>2]&63](o)|0;a[h]=dc[c[(c[o>>2]|0)+16>>2]&63](o)|0;bc[c[(c[o>>2]|0)+20>>2]&63](p,o);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xd(j);c[j+0>>2]=c[p+0>>2];c[j+4>>2]=c[p+4>>2];c[j+8>>2]=c[p+8>>2];c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;bc[c[(c[o>>2]|0)+24>>2]&63](y,o);if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}xd(k);c[k+0>>2]=c[y+0>>2];c[k+4>>2]=c[y+4>>2];c[k+8>>2]=c[y+8>>2];c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;b=dc[c[(c[o>>2]|0)+36>>2]&63](o)|0;c[m>>2]=b;i=n;return}}function zh(d,e,f,g,h,j,k,l,m,n,o,p,q,r,s){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;var t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;t=i;c[f>>2]=d;v=r+1|0;w=r+8|0;u=r+4|0;D=(g&512|0)==0;I=q+1|0;B=q+8|0;C=q+4|0;z=(s|0)>0;F=p+1|0;J=p+8|0;E=p+4|0;A=k+8|0;y=0-s|0;K=s+ -1|0;x=(K|0)>0;L=0;do{switch(a[m+L|0]|0){case 2:{M=a[q]|0;N=(M&1)==0;if(N){O=(M&255)>>>1}else{O=c[C>>2]|0}if(!((O|0)==0|D)){if(N){P=I;O=(M&255)>>>1}else{P=c[B>>2]|0;O=c[C>>2]|0}M=P+O|0;Q=c[f>>2]|0;if((O|0)!=0){N=Q;while(1){a[N]=a[P]|0;P=P+1|0;if((P|0)==(M|0)){break}else{N=N+1|0}}Q=Q+O|0}c[f>>2]=Q}break};case 4:{M=c[f>>2]|0;h=l?h+1|0:h;a:do{if(h>>>0<j>>>0){O=h;while(1){N=a[O]|0;if(!(N<<24>>24>-1)){break a}P=O+1|0;if((b[(c[A>>2]|0)+(N<<24>>24<<1)>>1]&2048)==0){break a}if(P>>>0<j>>>0){O=P}else{O=P;break}}}else{O=h}}while(0);N=O;if(z){if(O>>>0>h>>>0){N=h+(0-N)|0;P=N>>>0<y>>>0?y:N;N=P+s|0;Q=O+ -1|0;S=a[Q]|0;c[f>>2]=M+1;a[M]=S;if(Q>>>0>h>>>0&x){R=K;do{S=c[f>>2]|0;Q=Q+ -1|0;T=a[Q]|0;c[f>>2]=S+1;a[S]=T;R=R+ -1|0;S=(R|0)>0}while(Q>>>0>h>>>0&S)}else{S=x}O=O+P|0;if(S){G=32}else{P=0}}else{N=s;G=32}if((G|0)==32){G=0;P=mc[c[(c[k>>2]|0)+28>>2]&15](k,48)|0}Q=c[f>>2]|0;c[f>>2]=Q+1;if((N|0)>0){do{a[Q]=P;N=N+ -1|0;Q=c[f>>2]|0;c[f>>2]=Q+1}while((N|0)>0)}a[Q]=n;N=O}else{N=O}if((N|0)==(h|0)){S=mc[c[(c[k>>2]|0)+28>>2]&15](k,48)|0;T=c[f>>2]|0;c[f>>2]=T+1;a[T]=S}else{P=a[p]|0;O=(P&1)==0;if(O){P=(P&255)>>>1}else{P=c[E>>2]|0}if((P|0)==0){O=-1;P=0;Q=0}else{if(O){O=F}else{O=c[J>>2]|0}O=a[O]|0;P=0;Q=0}while(1){if((Q|0)==(O|0)){R=c[f>>2]|0;c[f>>2]=R+1;a[R]=o;P=P+1|0;R=a[p]|0;Q=(R&1)==0;if(Q){R=(R&255)>>>1}else{R=c[E>>2]|0}if(P>>>0<R>>>0){if(Q){O=F}else{O=c[J>>2]|0}if((a[O+P|0]|0)==127){O=-1;Q=0}else{if(Q){O=F}else{O=c[J>>2]|0}O=a[O+P|0]|0;Q=0}}else{Q=0}}N=N+ -1|0;S=a[N]|0;T=c[f>>2]|0;c[f>>2]=T+1;a[T]=S;if((N|0)==(h|0)){break}else{Q=Q+1|0}}}N=c[f>>2]|0;if((M|0)!=(N|0)?(H=N+ -1|0,H>>>0>M>>>0):0){N=H;do{T=a[M]|0;a[M]=a[N]|0;a[N]=T;M=M+1|0;N=N+ -1|0}while(M>>>0<N>>>0)}break};case 1:{c[e>>2]=c[f>>2];S=mc[c[(c[k>>2]|0)+28>>2]&15](k,32)|0;T=c[f>>2]|0;c[f>>2]=T+1;a[T]=S;break};case 3:{N=a[r]|0;M=(N&1)==0;if(M){N=(N&255)>>>1}else{N=c[u>>2]|0}if((N|0)!=0){if(M){M=v}else{M=c[w>>2]|0}S=a[M]|0;T=c[f>>2]|0;c[f>>2]=T+1;a[T]=S}break};case 0:{c[e>>2]=c[f>>2];break};default:{}}L=L+1|0}while((L|0)!=4);l=a[r]|0;x=(l&1)==0;if(x){y=(l&255)>>>1}else{y=c[u>>2]|0}if(y>>>0>1){if(x){l=(l&255)>>>1}else{v=c[w>>2]|0;l=c[u>>2]|0}w=v+l|0;u=c[f>>2]|0;if((l|0)!=1){l=l+ -1|0;x=u;v=v+1|0;while(1){a[x]=a[v]|0;v=v+1|0;if((v|0)==(w|0)){break}else{x=x+1|0}}u=u+l|0}c[f>>2]=u}g=g&176;if((g|0)==32){c[e>>2]=c[f>>2];i=t;return}else if((g|0)==16){i=t;return}else{c[e>>2]=d;i=t;return}}function Ah(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;o=i;i=i+160|0;x=o;r=o+136|0;q=o+152|0;n=o+153|0;p=o+124|0;u=o+140|0;d=o+104|0;z=o+100|0;t=o+116|0;s=o+120|0;v=c[g+28>>2]|0;D=v+4|0;c[D>>2]=(c[D>>2]|0)+1;if(!((c[1160]|0)==-1)){c[x>>2]=4640;c[x+4>>2]=106;c[x+8>>2]=0;td(4640,x)}y=(c[4644>>2]|0)+ -1|0;w=c[v+8>>2]|0;if(!((c[v+12>>2]|0)-w>>2>>>0>y>>>0)){D=Oa(4)|0;c[D>>2]=12496;Pb(D|0,12568,96)}w=c[w+(y<<2)>>2]|0;if((w|0)==0){D=Oa(4)|0;c[D>>2]=12496;Pb(D|0,12568,96)}A=a[j]|0;y=(A&1)==0;if(y){A=(A&255)>>>1}else{A=c[j+4>>2]|0}if((A|0)==0){y=0}else{if(y){y=j+1|0}else{y=c[j+8>>2]|0}y=a[y]|0;y=y<<24>>24==(mc[c[(c[w>>2]|0)+28>>2]&15](w,45)|0)<<24>>24}c[r>>2]=0;c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;yh(f,y,v,r,q,n,p,u,d,z);f=a[j]|0;A=(f&1)==0;if(A){B=(f&255)>>>1}else{B=c[j+4>>2]|0}z=c[z>>2]|0;if((B|0)>(z|0)){if(A){B=(f&255)>>>1}else{B=c[j+4>>2]|0}C=a[d]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[d+4>>2]|0}D=a[u]|0;if((D&1)==0){D=(D&255)>>>1}else{D=c[u+4>>2]|0}B=C+(B-z<<1|1)+D|0}else{B=a[d]|0;if((B&1)==0){B=(B&255)>>>1}else{B=c[d+4>>2]|0}C=a[u]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[u+4>>2]|0}B=B+2+C|0}B=B+z|0;if(B>>>0>100){x=fk(B)|0;if((x|0)==0){D=Oa(4)|0;c[D>>2]=13440;Pb(D|0,13488,104)}else{B=x}}else{B=0}if(A){A=j+1|0;j=(f&255)>>>1}else{A=c[j+8>>2]|0;j=c[j+4>>2]|0}zh(x,t,s,c[g+4>>2]|0,A,A+j|0,w,y,r,a[q]|0,a[n]|0,p,u,d,z);wf(b,c[e>>2]|0,x,c[t>>2]|0,c[s>>2]|0,g,h);if((B|0)!=0){gk(B)}if(!((a[d]&1)==0)?(l=c[d+8>>2]|0,(l|0)!=0):0){gk(l)}if(!((a[u]&1)==0)?(m=c[u+8>>2]|0,(m|0)!=0):0){gk(m)}if(!((a[p]&1)==0)?(k=c[p+8>>2]|0,(k|0)!=0):0){gk(k)}C=v+4|0;D=c[C>>2]|0;c[C>>2]=D+ -1;if((D|0)!=0){i=o;return}ac[c[(c[v>>2]|0)+8>>2]&127](v);i=o;return}function Bh(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Ch(a){a=a|0;return}function Dh(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;w=i;i=i+976|0;y=w;B=w+864|0;E=w+856|0;A=w+456|0;v=w+452|0;d=w+448|0;p=w+860|0;s=w+428|0;q=w+416|0;r=w+404|0;F=w+400|0;t=w+440|0;u=w+444|0;c[E>>2]=B;h[k>>3]=l;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=cb(B|0,100,4408,y|0)|0;if(B>>>0>99){if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}B=c[1136]|0;h[k>>3]=l;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=Bf(E,B,4408,y)|0;z=c[E>>2]|0;if((z|0)==0){G=Oa(4)|0;c[G>>2]=13440;Pb(G|0,13488,104)}A=fk(B<<2)|0;if((A|0)==0){G=Oa(4)|0;c[G>>2]=13440;Pb(G|0,13488,104)}else{x=A}}else{x=0;z=0}C=c[g+28>>2]|0;G=C+4|0;c[G>>2]=(c[G>>2]|0)+1;if(!((c[1158]|0)==-1)){c[y>>2]=4632;c[y+4>>2]=106;c[y+8>>2]=0;td(4632,y)}D=(c[4636>>2]|0)+ -1|0;G=c[C+8>>2]|0;if(!((c[C+12>>2]|0)-G>>2>>>0>D>>>0)){G=Oa(4)|0;c[G>>2]=12496;Pb(G|0,12568,96)}D=c[G+(D<<2)>>2]|0;if((D|0)==0){G=Oa(4)|0;c[G>>2]=12496;Pb(G|0,12568,96)}G=c[E>>2]|0;jc[c[(c[D>>2]|0)+48>>2]&7](D,G,G+B|0,A)|0;if((B|0)==0){E=0}else{E=(a[c[E>>2]|0]|0)==45}c[v>>2]=0;c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Eh(f,E,C,v,d,p,s,q,r,F);f=c[F>>2]|0;if((B|0)>(f|0)){F=a[r]|0;if((F&1)==0){F=(F&255)>>>1}else{F=c[r+4>>2]|0}G=a[q]|0;if((G&1)==0){G=(G&255)>>>1}else{G=c[q+4>>2]|0}F=F+(B-f<<1|1)+G|0}else{F=a[r]|0;if((F&1)==0){F=(F&255)>>>1}else{F=c[r+4>>2]|0}G=a[q]|0;if((G&1)==0){G=(G&255)>>>1}else{G=c[q+4>>2]|0}F=F+2+G|0}F=F+f|0;if(F>>>0>100){y=fk(F<<2)|0;if((y|0)==0){G=Oa(4)|0;c[G>>2]=13440;Pb(G|0,13488,104)}else{F=y}}else{F=0}Fh(y,t,u,c[g+4>>2]|0,A,A+(B<<2)|0,D,E,v,c[d>>2]|0,c[p>>2]|0,s,q,r,f);Kf(b,c[e>>2]|0,y,c[t>>2]|0,c[u>>2]|0,g,j);if((F|0)!=0){gk(F)}if(!((a[r]&1)==0)?(n=c[r+8>>2]|0,(n|0)!=0):0){gk(n)}if(!((a[q]&1)==0)?(o=c[q+8>>2]|0,(o|0)!=0):0){gk(o)}if(!((a[s]&1)==0)?(m=c[s+8>>2]|0,(m|0)!=0):0){gk(m)}F=C+4|0;G=c[F>>2]|0;c[F>>2]=G+ -1;if((G|0)==0){ac[c[(c[C>>2]|0)+8>>2]&127](C)}if((x|0)!=0){gk(x)}if((z|0)==0){i=w;return}gk(z);i=w;return}function Eh(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;n=i;i=i+128|0;A=n;x=n+108|0;o=n+96|0;v=n+92|0;w=n+80|0;u=n+68|0;z=n+112|0;r=n+40|0;q=n+28|0;t=n+24|0;s=n+12|0;p=n+44|0;y=n+56|0;if(b){if(!((c[1056]|0)==-1)){c[A>>2]=4224;c[A+4>>2]=106;c[A+8>>2]=0;td(4224,A)}q=(c[4228>>2]|0)+ -1|0;p=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-p>>2>>>0>q>>>0)){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}p=c[p+(q<<2)>>2]|0;if((p|0)==0){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}q=c[p>>2]|0;if(d){bc[c[q+44>>2]&63](x,p);b=c[x>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[p>>2]|0)+32>>2]&63](o,p);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Bd(l);c[l+0>>2]=c[o+0>>2];c[l+4>>2]=c[o+4>>2];c[l+8>>2]=c[o+8>>2];c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0}else{bc[c[q+40>>2]&63](v,p);b=c[v>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[p>>2]|0)+28>>2]&63](w,p);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Bd(l);c[l+0>>2]=c[w+0>>2];c[l+4>>2]=c[w+4>>2];c[l+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0}c[g>>2]=dc[c[(c[p>>2]|0)+12>>2]&63](p)|0;c[h>>2]=dc[c[(c[p>>2]|0)+16>>2]&63](p)|0;bc[c[(c[p>>2]|0)+20>>2]&63](u,p);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xd(j);c[j+0>>2]=c[u+0>>2];c[j+4>>2]=c[u+4>>2];c[j+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;bc[c[(c[p>>2]|0)+24>>2]&63](z,p);if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Bd(k);c[k+0>>2]=c[z+0>>2];c[k+4>>2]=c[z+4>>2];c[k+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;b=dc[c[(c[p>>2]|0)+36>>2]&63](p)|0;c[m>>2]=b;i=n;return}else{if(!((c[1040]|0)==-1)){c[A>>2]=4160;c[A+4>>2]=106;c[A+8>>2]=0;td(4160,A)}u=(c[4164>>2]|0)+ -1|0;o=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-o>>2>>>0>u>>>0)){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}o=c[o+(u<<2)>>2]|0;if((o|0)==0){b=Oa(4)|0;c[b>>2]=12496;Pb(b|0,12568,96)}e=c[o>>2]|0;if(d){bc[c[e+44>>2]&63](r,o);b=c[r>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[o>>2]|0)+32>>2]&63](q,o);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Bd(l);c[l+0>>2]=c[q+0>>2];c[l+4>>2]=c[q+4>>2];c[l+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0}else{bc[c[e+40>>2]&63](t,o);b=c[t>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;bc[c[(c[o>>2]|0)+28>>2]&63](s,o);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Bd(l);c[l+0>>2]=c[s+0>>2];c[l+4>>2]=c[s+4>>2];c[l+8>>2]=c[s+8>>2];c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0}c[g>>2]=dc[c[(c[o>>2]|0)+12>>2]&63](o)|0;c[h>>2]=dc[c[(c[o>>2]|0)+16>>2]&63](o)|0;bc[c[(c[o>>2]|0)+20>>2]&63](p,o);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xd(j);c[j+0>>2]=c[p+0>>2];c[j+4>>2]=c[p+4>>2];c[j+8>>2]=c[p+8>>2];c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;bc[c[(c[o>>2]|0)+24>>2]&63](y,o);if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Bd(k);c[k+0>>2]=c[y+0>>2];c[k+4>>2]=c[y+4>>2];c[k+8>>2]=c[y+8>>2];c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;b=dc[c[(c[o>>2]|0)+36>>2]&63](o)|0;c[m>>2]=b;i=n;return}}function Fh(b,d,e,f,g,h,j,k,l,m,n,o,p,q,r){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;s=i;c[e>>2]=b;t=q+4|0;u=q+8|0;y=(f&512|0)==0;z=p+4|0;A=p+8|0;x=(r|0)>0;D=o+1|0;v=o+8|0;w=o+4|0;E=0;do{switch(a[l+E|0]|0){case 2:{F=a[p]|0;H=(F&1)==0;if(H){G=(F&255)>>>1}else{G=c[z>>2]|0}if(!((G|0)==0|y)){if(H){H=z;I=(F&255)>>>1}else{H=c[A>>2]|0;I=c[z>>2]|0}F=H+(I<<2)|0;G=c[e>>2]|0;if((I|0)!=0){I=H+(I+ -1<<2)+(0-H)|0;J=G;while(1){c[J>>2]=c[H>>2];H=H+4|0;if((H|0)==(F|0)){break}J=J+4|0}G=G+((I>>>2)+1<<2)|0}c[e>>2]=G}break};case 0:{c[d>>2]=c[e>>2];break};case 3:{G=a[q]|0;F=(G&1)==0;if(F){G=(G&255)>>>1}else{G=c[t>>2]|0}if((G|0)!=0){if(F){F=t}else{F=c[u>>2]|0}L=c[F>>2]|0;M=c[e>>2]|0;c[e>>2]=M+4;c[M>>2]=L}break};case 1:{c[d>>2]=c[e>>2];L=mc[c[(c[j>>2]|0)+44>>2]&15](j,32)|0;M=c[e>>2]|0;c[e>>2]=M+4;c[M>>2]=L;break};case 4:{F=c[e>>2]|0;g=k?g+4|0:g;a:do{if(g>>>0<h>>>0){G=g;while(1){H=G+4|0;if(!(Zb[c[(c[j>>2]|0)+12>>2]&31](j,2048,c[G>>2]|0)|0)){break a}if(H>>>0<h>>>0){G=H}else{G=H;break}}}else{G=g}}while(0);if(x){if(G>>>0>g>>>0){I=c[e>>2]|0;H=r;while(1){G=G+ -4|0;J=I+4|0;c[I>>2]=c[G>>2];H=H+ -1|0;K=(H|0)>0;if(!(G>>>0>g>>>0&K)){break}else{I=J}}c[e>>2]=J;if(K){B=34}else{c[e>>2]=I+8}}else{H=r;B=34}if((B|0)==34){B=0;I=mc[c[(c[j>>2]|0)+44>>2]&15](j,48)|0;J=c[e>>2]|0;M=J+4|0;c[e>>2]=M;if((H|0)>0){K=J;L=H;while(1){c[K>>2]=I;L=L+ -1|0;if((L|0)<=0){break}else{K=M;M=M+4|0}}c[e>>2]=J+(H+1<<2);J=J+(H<<2)|0}}c[J>>2]=m}if((G|0)==(g|0)){K=mc[c[(c[j>>2]|0)+44>>2]&15](j,48)|0;M=c[e>>2]|0;L=M+4|0;c[e>>2]=L;c[M>>2]=K}else{I=a[o]|0;H=(I&1)==0;if(H){I=(I&255)>>>1}else{I=c[w>>2]|0}if((I|0)==0){H=-1}else{if(H){H=D}else{H=c[v>>2]|0}H=a[H]|0}I=c[e>>2]|0;K=0;J=0;while(1){if((J|0)==(H|0)){J=I+4|0;c[e>>2]=J;c[I>>2]=n;K=K+1|0;L=a[o]|0;I=(L&1)==0;if(I){L=(L&255)>>>1}else{L=c[w>>2]|0}if(K>>>0<L>>>0){if(I){H=D}else{H=c[v>>2]|0}if((a[H+K|0]|0)==127){I=J;H=-1;J=0}else{if(I){H=D}else{H=c[v>>2]|0}I=J;H=a[H+K|0]|0;J=0}}else{I=J;J=0}}G=G+ -4|0;M=c[G>>2]|0;L=I+4|0;c[e>>2]=L;c[I>>2]=M;if((G|0)==(g|0)){break}else{I=L;J=J+1|0}}}if((F|0)!=(L|0)?(C=L+ -4|0,C>>>0>F>>>0):0){G=C;do{M=c[F>>2]|0;c[F>>2]=c[G>>2];c[G>>2]=M;F=F+4|0;G=G+ -4|0}while(F>>>0<G>>>0)}break};default:{}}E=E+1|0}while((E|0)!=4);w=a[q]|0;v=(w&1)==0;if(v){x=(w&255)>>>1}else{x=c[t>>2]|0}if(x>>>0>1){if(v){v=t;x=(w&255)>>>1}else{v=c[u>>2]|0;x=c[t>>2]|0}w=v+4|0;u=v+(x<<2)|0;t=c[e>>2]|0;if((x|0)!=1){x=v+(x+ -1<<2)+(0-w)|0;v=t;while(1){c[v>>2]=c[w>>2];w=w+4|0;if((w|0)==(u|0)){break}else{v=v+4|0}}t=t+((x>>>2)+1<<2)|0}c[e>>2]=t}f=f&176;if((f|0)==16){i=s;return}else if((f|0)==32){c[d>>2]=c[e>>2];i=s;return}else{c[d>>2]=b;i=s;return}}function Gh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;o=i;i=i+464|0;x=o;r=o+444|0;q=o+440|0;n=o+436|0;p=o+424|0;u=o+448|0;d=o+404|0;z=o+400|0;t=o+416|0;s=o+420|0;v=c[g+28>>2]|0;D=v+4|0;c[D>>2]=(c[D>>2]|0)+1;if(!((c[1158]|0)==-1)){c[x>>2]=4632;c[x+4>>2]=106;c[x+8>>2]=0;td(4632,x)}y=(c[4636>>2]|0)+ -1|0;w=c[v+8>>2]|0;if(!((c[v+12>>2]|0)-w>>2>>>0>y>>>0)){D=Oa(4)|0;c[D>>2]=12496;Pb(D|0,12568,96)}w=c[w+(y<<2)>>2]|0;if((w|0)==0){D=Oa(4)|0;c[D>>2]=12496;Pb(D|0,12568,96)}A=a[j]|0;y=(A&1)==0;if(y){A=(A&255)>>>1}else{A=c[j+4>>2]|0}if((A|0)==0){y=0}else{if(y){y=j+4|0}else{y=c[j+8>>2]|0}y=c[y>>2]|0;y=(y|0)==(mc[c[(c[w>>2]|0)+44>>2]&15](w,45)|0)}c[r>>2]=0;c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;Eh(f,y,v,r,q,n,p,u,d,z);f=a[j]|0;A=(f&1)==0;if(A){B=(f&255)>>>1}else{B=c[j+4>>2]|0}z=c[z>>2]|0;if((B|0)>(z|0)){if(A){B=(f&255)>>>1}else{B=c[j+4>>2]|0}C=a[d]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[d+4>>2]|0}D=a[u]|0;if((D&1)==0){D=(D&255)>>>1}else{D=c[u+4>>2]|0}B=C+(B-z<<1|1)+D|0}else{B=a[d]|0;if((B&1)==0){B=(B&255)>>>1}else{B=c[d+4>>2]|0}C=a[u]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[u+4>>2]|0}B=B+2+C|0}B=B+z|0;if(B>>>0>100){x=fk(B<<2)|0;if((x|0)==0){D=Oa(4)|0;c[D>>2]=13440;Pb(D|0,13488,104)}else{B=x}}else{B=0}if(A){A=j+4|0;j=(f&255)>>>1}else{A=c[j+8>>2]|0;j=c[j+4>>2]|0}Fh(x,t,s,c[g+4>>2]|0,A,A+(j<<2)|0,w,y,r,c[q>>2]|0,c[n>>2]|0,p,u,d,z);Kf(b,c[e>>2]|0,x,c[t>>2]|0,c[s>>2]|0,g,h);if((B|0)!=0){gk(B)}if(!((a[d]&1)==0)?(l=c[d+8>>2]|0,(l|0)!=0):0){gk(l)}if(!((a[u]&1)==0)?(m=c[u+8>>2]|0,(m|0)!=0):0){gk(m)}if(!((a[p]&1)==0)?(k=c[p+8>>2]|0,(k|0)!=0):0){gk(k)}C=v+4|0;D=c[C>>2]|0;c[C>>2]=D+ -1;if((D|0)!=0){i=o;return}ac[c[(c[v>>2]|0)+8>>2]&127](v);i=o;return}function Hh(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Ih(a){a=a|0;return}function Jh(b,d,e){b=b|0;d=d|0;e=e|0;b=i;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=Ub(d|0,1)|0;i=b;return e>>>((e|0)!=(-1|0)|0)|0}function Kh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=i;i=i+16|0;j=d;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;n=a[h]|0;if((n&1)==0){q=h+1|0;n=(n&255)>>>1}else{q=c[h+8>>2]|0;n=c[h+4>>2]|0}h=q+n|0;do{if((n|0)>0){n=j+4|0;p=j+1|0;o=j+8|0;s=0;a:while(1){r=a[q]|0;v=(s&1)!=0;if(v){t=c[j>>2]|0;u=t&255;t=(t&-2)+ -1|0;s=c[n>>2]|0}else{u=s;t=10;s=(s&255)>>>1}do{if((s|0)!=(t|0)){if(v){w=c[o>>2]|0;k=27;break}else{a[j]=(s<<1)+2;w=p;t=s+1|0;break}}else{if((t|0)==-17){k=12;break a}k=(u&1)==0?p:c[o>>2]|0;if(t>>>0<2147483623){u=t+1|0;v=t<<1;u=u>>>0<v>>>0?v:u;if(u>>>0<11){u=11}else{u=u+16&-16}}else{u=-17}v=(u|0)==0?1:u;while(1){w=fk(v)|0;if((w|0)!=0){break}w=c[3356]|0;c[3356]=w+0;if((w|0)==0){k=20;break a}hc[w&0]()}vk(w|0,k|0,t|0)|0;if(!((t|0)==10|(k|0)==0)){gk(k)}c[o>>2]=w;c[j>>2]=u|1;k=27}}while(0);if((k|0)==27){k=0;t=s+1|0;c[n>>2]=t}a[w+s|0]=r;a[w+t|0]=0;q=q+1|0;s=a[j]|0;if((q|0)==(h|0)){k=29;break}}if((k|0)==12){ud()}else if((k|0)==20){w=Oa(4)|0;c[w>>2]=13440;Pb(w|0,13488,104)}else if((k|0)==29){l=(e|0)==-1?-1:e<<1;m=(s&1)==0?p:c[o>>2]|0;break}}else{l=(e|0)==-1?-1:e<<1;m=j+1|0}}while(0);e=ab(l|0,f|0,g|0,m|0)|0;c[b+0>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;w=qk(e|0)|0;l=e+w|0;b:do{if((w|0)>0){m=b+4|0;g=b+1|0;f=b+8|0;n=0;while(1){h=a[e]|0;o=(n&1)!=0;if(o){k=(c[b>>2]&-2)+ -1|0;n=c[m>>2]|0}else{k=10;n=(n&255)>>>1}if((n|0)==(k|0)){zd(b,k,1,k,k,0);if((a[b]&1)==0){k=38}else{k=39}}else{if(o){k=39}else{k=38}}if((k|0)==38){a[b]=(n<<1)+2;p=g;o=n+1|0}else if((k|0)==39){p=c[f>>2]|0;o=n+1|0;c[m>>2]=o}a[p+n|0]=h;a[p+o|0]=0;e=e+1|0;if((e|0)==(l|0)){break b}n=a[b]|0}}}while(0);if((a[j]&1)==0){i=d;return}b=c[j+8>>2]|0;if((b|0)==0){i=d;return}gk(b);i=d;return}function Lh(a,b){a=a|0;b=b|0;a=i;Nb(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Mh(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Nh(a){a=a|0;return}function Oh(b,d,e){b=b|0;d=d|0;e=e|0;b=i;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=Ub(d|0,1)|0;i=b;return e>>>((e|0)!=(-1|0)|0)|0}function Ph(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+176|0;m=d;o=d+48|0;j=d+8|0;k=d+12|0;n=d+16|0;r=d+32|0;l=d+40|0;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;c[r+4>>2]=0;c[r>>2]=6256;s=a[h]|0;if((s&1)==0){w=h+4|0;s=(s&255)>>>1}else{w=c[h+8>>2]|0;s=c[h+4>>2]|0}h=w+(s<<2)|0;C=m;c[C>>2]=0;c[C+4>>2]=0;do{if((s|0)>0){s=o+32|0;v=n+4|0;u=n+1|0;t=n+8|0;x=6256|0;a:while(1){c[k>>2]=w;C=(ic[c[x+12>>2]&15](r,m,w,h,k,o,s,j)|0)==2;x=c[k>>2]|0;if(C|(x|0)==(w|0)){p=8;break}if(o>>>0<(c[j>>2]|0)>>>0){x=o;do{w=a[x]|0;y=a[n]|0;B=(y&1)!=0;if(B){z=c[n>>2]|0;A=z&255;z=(z&-2)+ -1|0;y=c[v>>2]|0}else{A=y;z=10;y=(y&255)>>>1}do{if((y|0)!=(z|0)){if(B){C=c[t>>2]|0;p=29;break}else{a[n]=(y<<1)+2;C=u;z=y+1|0;break}}else{if((z|0)==-17){p=14;break a}p=(A&1)==0?u:c[t>>2]|0;if(z>>>0<2147483623){B=z+1|0;A=z<<1;A=B>>>0<A>>>0?A:B;if(A>>>0<11){A=11}else{A=A+16&-16}}else{A=-17}B=(A|0)==0?1:A;while(1){C=fk(B)|0;if((C|0)!=0){break}C=c[3356]|0;c[3356]=C+0;if((C|0)==0){p=22;break a}hc[C&0]()}vk(C|0,p|0,z|0)|0;if(!((z|0)==10|(p|0)==0)){gk(p)}c[t>>2]=C;c[n>>2]=A|1;p=29}}while(0);if((p|0)==29){p=0;z=y+1|0;c[v>>2]=z}a[C+y|0]=w;a[C+z|0]=0;x=x+1|0}while(x>>>0<(c[j>>2]|0)>>>0);w=c[k>>2]|0}else{w=x}if(!(w>>>0<h>>>0)){p=34;break}x=c[r>>2]|0}if((p|0)==8){nh(5480)}else if((p|0)==14){ud()}else if((p|0)==22){C=Oa(4)|0;c[C>>2]=13440;Pb(C|0,13488,104)}else if((p|0)==34){q=(a[n]&1)==0;break}}else{q=1}}while(0);if(q){p=n+1|0}else{p=c[n+8>>2]|0}p=ab(((e|0)==-1?-1:e<<1)|0,f|0,g|0,p|0)|0;c[b+0>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[l+4>>2]=0;c[l>>2]=6360;C=qk(p|0)|0;r=p+C|0;B=m;c[B>>2]=0;c[B+4>>2]=0;b:do{if((C|0)>0){g=r;e=o+128|0;q=b+4|0;f=b+8|0;h=6360|0;while(1){c[k>>2]=p;C=(ic[c[h+16>>2]&15](l,m,p,(g-p|0)>32?p+32|0:r,k,o,e,j)|0)==2;h=c[k>>2]|0;if(C|(h|0)==(p|0)){break}if(o>>>0<(c[j>>2]|0)>>>0){s=o;do{h=c[s>>2]|0;t=a[b]|0;p=(t&1)!=0;if(p){u=(c[b>>2]&-2)+ -1|0;t=c[q>>2]|0}else{u=1;t=(t&255)>>>1}if((t|0)==(u|0)){Cd(b,u,1,u,u,0,0);if((a[b]&1)==0){p=49}else{p=50}}else{if(p){p=50}else{p=49}}if((p|0)==49){a[b]=(t<<1)+2;u=q;v=t+1|0}else if((p|0)==50){u=c[f>>2]|0;v=t+1|0;c[q>>2]=v}c[u+(t<<2)>>2]=h;c[u+(v<<2)>>2]=0;s=s+4|0}while(s>>>0<(c[j>>2]|0)>>>0);p=c[k>>2]|0}else{p=h}if(!(p>>>0<r>>>0)){break b}h=c[l>>2]|0}nh(5480)}}while(0);if((a[n]&1)==0){i=d;return}b=c[n+8>>2]|0;if((b|0)==0){i=d;return}gk(b);i=d;return}function Qh(a,b){a=a|0;b=b|0;a=i;Nb(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Rh(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=4728;b=b+8|0;e=c[b>>2]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}if((e|0)==(c[1136]|0)){i=d;return}jb(c[b>>2]|0);i=d;return}function Sh(a){a=a|0;var b=0;b=i;Th(a);if((a|0)!=0){gk(a)}i=b;return}function Th(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;c[b>>2]=4568;d=b+12|0;h=c[d>>2]|0;f=b+8|0;j=c[f>>2]|0;if((h|0)!=(j|0)){k=0;while(1){l=c[j+(k<<2)>>2]|0;if((l|0)!=0){h=l+4|0;j=c[h>>2]|0;c[h>>2]=j+ -1;if((j|0)==0){ac[c[(c[l>>2]|0)+8>>2]&127](l)}h=c[d>>2]|0;j=c[f>>2]|0}k=k+1|0;if(!(k>>>0<h-j>>2>>>0)){h=j;break}}}if(!((a[b+144|0]&1)==0)?(g=c[b+152>>2]|0,(g|0)!=0):0){gk(g);h=c[f>>2]|0}if((h|0)==0){i=e;return}f=c[d>>2]|0;if((f|0)!=(h|0)){c[d>>2]=f+(~((f+ -4+(0-h)|0)>>>2)<<2)}if((b+24|0)==(h|0)){a[b+136|0]=0;i=e;return}else{gk(h);i=e;return}}function Uh(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+16|0;e=b;if((a[4616]|0)!=0){L=c[1152]|0;i=b;return L|0}if((Ja(4616)|0)==0){L=c[1152]|0;i=b;return L|0}if((a[4592]|0)==0?(Ja(4592)|0)!=0:0){c[8948>>2]=0;c[2236]=4568;a[9080|0]=1;c[8956>>2]=8968;c[8952>>2]=8968;c[8960>>2]=9080;J=28;H=8968|0;do{c[H>>2]=0;I=c[8956>>2]|0;H=I+4|0;c[8956>>2]=H;J=J+ -1|0}while((J|0)!=0);a[9088|0]=2;a[9089|0]=67;a[9090|0]=0;J=c[8952>>2]|0;if((H|0)!=(J|0)){c[8956>>2]=I+(0-((I+(0-J)|0)>>>2)<<2)}c[9412>>2]=0;c[2352]=3056;if(!((c[770]|0)==-1)){c[e>>2]=3080;c[e+4>>2]=106;c[e+8>>2]=0;td(3080,e)}J=c[3084>>2]|0;H=J+ -1|0;c[9412>>2]=(c[9412>>2]|0)+1;I=c[8956>>2]|0;L=c[8952>>2]|0;K=I-L>>2;do{if(!(K>>>0>H>>>0)){if(K>>>0<J>>>0){Kj(8952|0,J-K|0);L=c[8952>>2]|0;break}if(K>>>0>J>>>0?(G=L+(J<<2)|0,(I|0)!=(G|0)):0){c[8956>>2]=I+(~((I+ -4+(0-G)|0)>>>2)<<2)}}}while(0);G=c[L+(H<<2)>>2]|0;if((G|0)!=0){K=G+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[G>>2]|0)+8>>2]&127](G)}L=c[8952>>2]|0}c[L+(H<<2)>>2]=9408;c[9404>>2]=0;c[2350]=3096;if(!((c[780]|0)==-1)){c[e>>2]=3120;c[e+4>>2]=106;c[e+8>>2]=0;td(3120,e)}H=c[3124>>2]|0;G=H+ -1|0;c[9404>>2]=(c[9404>>2]|0)+1;I=c[8956>>2]|0;J=c[8952>>2]|0;K=I-J>>2;do{if(!(K>>>0>G>>>0)){if(K>>>0<H>>>0){Kj(8952|0,H-K|0);J=c[8952>>2]|0;break}if(K>>>0>H>>>0?(F=J+(H<<2)|0,(I|0)!=(F|0)):0){c[8956>>2]=I+(~((I+ -4+(0-F)|0)>>>2)<<2)}}}while(0);F=c[J+(G<<2)>>2]|0;if((F|0)!=0){K=F+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[F>>2]|0)+8>>2]&127](F)}J=c[8952>>2]|0}c[J+(G<<2)>>2]=9400;c[9388>>2]=0;c[2346]=4656;c[9392>>2]=0;a[9396|0]=0;c[9392>>2]=c[(Ga()|0)>>2];if(!((c[1160]|0)==-1)){c[e>>2]=4640;c[e+4>>2]=106;c[e+8>>2]=0;td(4640,e)}J=c[4644>>2]|0;F=J+ -1|0;c[9388>>2]=(c[9388>>2]|0)+1;H=c[8956>>2]|0;G=c[8952>>2]|0;I=H-G>>2;do{if(!(I>>>0>F>>>0)){if(I>>>0<J>>>0){Kj(8952|0,J-I|0);G=c[8952>>2]|0;break}if(I>>>0>J>>>0?(E=G+(J<<2)|0,(H|0)!=(E|0)):0){c[8956>>2]=H+(~((H+ -4+(0-E)|0)>>>2)<<2)}}}while(0);E=c[G+(F<<2)>>2]|0;if((E|0)!=0){K=E+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[E>>2]|0)+8>>2]&127](E)}G=c[8952>>2]|0}c[G+(F<<2)>>2]=9384;c[9380>>2]=0;c[2344]=5576;if(!((c[1158]|0)==-1)){c[e>>2]=4632;c[e+4>>2]=106;c[e+8>>2]=0;td(4632,e)}G=c[4636>>2]|0;E=G+ -1|0;c[9380>>2]=(c[9380>>2]|0)+1;H=c[8956>>2]|0;I=c[8952>>2]|0;F=H-I>>2;do{if(!(F>>>0>E>>>0)){if(F>>>0<G>>>0){Kj(8952|0,G-F|0);I=c[8952>>2]|0;break}if(F>>>0>G>>>0?(D=I+(G<<2)|0,(H|0)!=(D|0)):0){c[8956>>2]=H+(~((H+ -4+(0-D)|0)>>>2)<<2)}}}while(0);D=c[I+(E<<2)>>2]|0;if((D|0)!=0){K=D+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[D>>2]|0)+8>>2]&127](D)}I=c[8952>>2]|0}c[I+(E<<2)>>2]=9376;c[9372>>2]=0;c[2342]=5792;if(!((c[1176]|0)==-1)){c[e>>2]=4704;c[e+4>>2]=106;c[e+8>>2]=0;td(4704,e)}G=c[4708>>2]|0;D=G+ -1|0;c[9372>>2]=(c[9372>>2]|0)+1;H=c[8956>>2]|0;E=c[8952>>2]|0;F=H-E>>2;do{if(!(F>>>0>D>>>0)){if(F>>>0<G>>>0){Kj(8952|0,G-F|0);E=c[8952>>2]|0;break}if(F>>>0>G>>>0?(C=E+(G<<2)|0,(H|0)!=(C|0)):0){c[8956>>2]=H+(~((H+ -4+(0-C)|0)>>>2)<<2)}}}while(0);C=c[E+(D<<2)>>2]|0;if((C|0)!=0){K=C+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[C>>2]|0)+8>>2]&127](C)}E=c[8952>>2]|0}c[E+(D<<2)>>2]=9368;c[9356>>2]=0;c[2338]=4728;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}c[9360>>2]=c[1136];if(!((c[1178]|0)==-1)){c[e>>2]=4712;c[e+4>>2]=106;c[e+8>>2]=0;td(4712,e)}G=c[4716>>2]|0;C=G+ -1|0;c[9356>>2]=(c[9356>>2]|0)+1;E=c[8956>>2]|0;D=c[8952>>2]|0;F=E-D>>2;do{if(!(F>>>0>C>>>0)){if(F>>>0<G>>>0){Kj(8952|0,G-F|0);D=c[8952>>2]|0;break}if(F>>>0>G>>>0?(B=D+(G<<2)|0,(E|0)!=(B|0)):0){c[8956>>2]=E+(~((E+ -4+(0-B)|0)>>>2)<<2)}}}while(0);B=c[D+(C<<2)>>2]|0;if((B|0)!=0){K=B+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[B>>2]|0)+8>>2]&127](B)}D=c[8952>>2]|0}c[D+(C<<2)>>2]=9352;c[9348>>2]=0;c[2336]=6016;if(!((c[1192]|0)==-1)){c[e>>2]=4768;c[e+4>>2]=106;c[e+8>>2]=0;td(4768,e)}D=c[4772>>2]|0;B=D+ -1|0;c[9348>>2]=(c[9348>>2]|0)+1;E=c[8956>>2]|0;F=c[8952>>2]|0;C=E-F>>2;do{if(!(C>>>0>B>>>0)){if(C>>>0<D>>>0){Kj(8952|0,D-C|0);F=c[8952>>2]|0;break}if(C>>>0>D>>>0?(A=F+(D<<2)|0,(E|0)!=(A|0)):0){c[8956>>2]=E+(~((E+ -4+(0-A)|0)>>>2)<<2)}}}while(0);A=c[F+(B<<2)>>2]|0;if((A|0)!=0){K=A+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[A>>2]|0)+8>>2]&127](A)}F=c[8952>>2]|0}c[F+(B<<2)>>2]=9344;c[9340>>2]=0;c[2334]=6136;if(!((c[1194]|0)==-1)){c[e>>2]=4776;c[e+4>>2]=106;c[e+8>>2]=0;td(4776,e)}C=c[4780>>2]|0;A=C+ -1|0;c[9340>>2]=(c[9340>>2]|0)+1;D=c[8956>>2]|0;E=c[8952>>2]|0;B=D-E>>2;do{if(!(B>>>0>A>>>0)){if(B>>>0<C>>>0){Kj(8952|0,C-B|0);E=c[8952>>2]|0;break}if(B>>>0>C>>>0?(z=E+(C<<2)|0,(D|0)!=(z|0)):0){c[8956>>2]=D+(~((D+ -4+(0-z)|0)>>>2)<<2)}}}while(0);z=c[E+(A<<2)>>2]|0;if((z|0)!=0){K=z+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[z>>2]|0)+8>>2]&127](z)}E=c[8952>>2]|0}c[E+(A<<2)>>2]=9336;c[9316>>2]=0;c[2328]=4808;a[9320|0]=46;a[9321|0]=44;c[9324>>2]=0;c[9328>>2]=0;c[9332>>2]=0;if(!((c[1196]|0)==-1)){c[e>>2]=4784;c[e+4>>2]=106;c[e+8>>2]=0;td(4784,e)}C=c[4788>>2]|0;z=C+ -1|0;c[9316>>2]=(c[9316>>2]|0)+1;B=c[8956>>2]|0;A=c[8952>>2]|0;D=B-A>>2;do{if(!(D>>>0>z>>>0)){if(D>>>0<C>>>0){Kj(8952|0,C-D|0);A=c[8952>>2]|0;break}if(D>>>0>C>>>0?(y=A+(C<<2)|0,(B|0)!=(y|0)):0){c[8956>>2]=B+(~((B+ -4+(0-y)|0)>>>2)<<2)}}}while(0);y=c[A+(z<<2)>>2]|0;if((y|0)!=0){K=y+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[y>>2]|0)+8>>2]&127](y)}A=c[8952>>2]|0}c[A+(z<<2)>>2]=9312;c[9284>>2]=0;c[2320]=4848;c[9288>>2]=46;c[9292>>2]=44;c[9296>>2]=0;c[9300>>2]=0;c[9304>>2]=0;if(!((c[1198]|0)==-1)){c[e>>2]=4792;c[e+4>>2]=106;c[e+8>>2]=0;td(4792,e)}A=c[4796>>2]|0;y=A+ -1|0;c[9284>>2]=(c[9284>>2]|0)+1;B=c[8956>>2]|0;C=c[8952>>2]|0;z=B-C>>2;do{if(!(z>>>0>y>>>0)){if(z>>>0<A>>>0){Kj(8952|0,A-z|0);C=c[8952>>2]|0;break}if(z>>>0>A>>>0?(x=C+(A<<2)|0,(B|0)!=(x|0)):0){c[8956>>2]=B+(~((B+ -4+(0-x)|0)>>>2)<<2)}}}while(0);x=c[C+(y<<2)>>2]|0;if((x|0)!=0){K=x+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[x>>2]|0)+8>>2]&127](x)}C=c[8952>>2]|0}c[C+(y<<2)>>2]=9280;c[9276>>2]=0;c[2318]=3136;if(!((c[798]|0)==-1)){c[e>>2]=3192;c[e+4>>2]=106;c[e+8>>2]=0;td(3192,e)}z=c[3196>>2]|0;x=z+ -1|0;c[9276>>2]=(c[9276>>2]|0)+1;A=c[8956>>2]|0;B=c[8952>>2]|0;y=A-B>>2;do{if(!(y>>>0>x>>>0)){if(y>>>0<z>>>0){Kj(8952|0,z-y|0);B=c[8952>>2]|0;break}if(y>>>0>z>>>0?(w=B+(z<<2)|0,(A|0)!=(w|0)):0){c[8956>>2]=A+(~((A+ -4+(0-w)|0)>>>2)<<2)}}}while(0);w=c[B+(x<<2)>>2]|0;if((w|0)!=0){K=w+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[w>>2]|0)+8>>2]&127](w)}B=c[8952>>2]|0}c[B+(x<<2)>>2]=9272;c[9268>>2]=0;c[2316]=3256;if(!((c[828]|0)==-1)){c[e>>2]=3312;c[e+4>>2]=106;c[e+8>>2]=0;td(3312,e)}x=c[3316>>2]|0;w=x+ -1|0;c[9268>>2]=(c[9268>>2]|0)+1;z=c[8956>>2]|0;y=c[8952>>2]|0;A=z-y>>2;do{if(!(A>>>0>w>>>0)){if(A>>>0<x>>>0){Kj(8952|0,x-A|0);y=c[8952>>2]|0;break}if(A>>>0>x>>>0?(v=y+(x<<2)|0,(z|0)!=(v|0)):0){c[8956>>2]=z+(~((z+ -4+(0-v)|0)>>>2)<<2)}}}while(0);v=c[y+(w<<2)>>2]|0;if((v|0)!=0){K=v+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[v>>2]|0)+8>>2]&127](v)}y=c[8952>>2]|0}c[y+(w<<2)>>2]=9264;c[9260>>2]=0;c[2314]=3328;if(!((c[844]|0)==-1)){c[e>>2]=3376;c[e+4>>2]=106;c[e+8>>2]=0;td(3376,e)}x=c[3380>>2]|0;v=x+ -1|0;c[9260>>2]=(c[9260>>2]|0)+1;y=c[8956>>2]|0;z=c[8952>>2]|0;w=y-z>>2;do{if(!(w>>>0>v>>>0)){if(w>>>0<x>>>0){Kj(8952|0,x-w|0);z=c[8952>>2]|0;break}if(w>>>0>x>>>0?(u=z+(x<<2)|0,(y|0)!=(u|0)):0){c[8956>>2]=y+(~((y+ -4+(0-u)|0)>>>2)<<2)}}}while(0);u=c[z+(v<<2)>>2]|0;if((u|0)!=0){K=u+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[u>>2]|0)+8>>2]&127](u)}z=c[8952>>2]|0}c[z+(v<<2)>>2]=9256;c[9252>>2]=0;c[2312]=3392;if(!((c[860]|0)==-1)){c[e>>2]=3440;c[e+4>>2]=106;c[e+8>>2]=0;td(3440,e)}w=c[3444>>2]|0;u=w+ -1|0;c[9252>>2]=(c[9252>>2]|0)+1;x=c[8956>>2]|0;y=c[8952>>2]|0;v=x-y>>2;do{if(!(v>>>0>u>>>0)){if(v>>>0<w>>>0){Kj(8952|0,w-v|0);y=c[8952>>2]|0;break}if(v>>>0>w>>>0?(t=y+(w<<2)|0,(x|0)!=(t|0)):0){c[8956>>2]=x+(~((x+ -4+(0-t)|0)>>>2)<<2)}}}while(0);t=c[y+(u<<2)>>2]|0;if((t|0)!=0){K=t+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[t>>2]|0)+8>>2]&127](t)}y=c[8952>>2]|0}c[y+(u<<2)>>2]=9248;c[9244>>2]=0;c[2310]=3984;if(!((c[1008]|0)==-1)){c[e>>2]=4032;c[e+4>>2]=106;c[e+8>>2]=0;td(4032,e)}v=c[4036>>2]|0;t=v+ -1|0;c[9244>>2]=(c[9244>>2]|0)+1;w=c[8956>>2]|0;x=c[8952>>2]|0;u=w-x>>2;do{if(!(u>>>0>t>>>0)){if(u>>>0<v>>>0){Kj(8952|0,v-u|0);x=c[8952>>2]|0;break}if(u>>>0>v>>>0?(s=x+(v<<2)|0,(w|0)!=(s|0)):0){c[8956>>2]=w+(~((w+ -4+(0-s)|0)>>>2)<<2)}}}while(0);s=c[x+(t<<2)>>2]|0;if((s|0)!=0){K=s+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[s>>2]|0)+8>>2]&127](s)}x=c[8952>>2]|0}c[x+(t<<2)>>2]=9240;c[9236>>2]=0;c[2308]=4048;if(!((c[1024]|0)==-1)){c[e>>2]=4096;c[e+4>>2]=106;c[e+8>>2]=0;td(4096,e)}v=c[4100>>2]|0;s=v+ -1|0;c[9236>>2]=(c[9236>>2]|0)+1;u=c[8956>>2]|0;t=c[8952>>2]|0;w=u-t>>2;do{if(!(w>>>0>s>>>0)){if(w>>>0<v>>>0){Kj(8952|0,v-w|0);t=c[8952>>2]|0;break}if(w>>>0>v>>>0?(r=t+(v<<2)|0,(u|0)!=(r|0)):0){c[8956>>2]=u+(~((u+ -4+(0-r)|0)>>>2)<<2)}}}while(0);r=c[t+(s<<2)>>2]|0;if((r|0)!=0){K=r+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[r>>2]|0)+8>>2]&127](r)}t=c[8952>>2]|0}c[t+(s<<2)>>2]=9232;c[9228>>2]=0;c[2306]=4112;if(!((c[1040]|0)==-1)){c[e>>2]=4160;c[e+4>>2]=106;c[e+8>>2]=0;td(4160,e)}t=c[4164>>2]|0;r=t+ -1|0;c[9228>>2]=(c[9228>>2]|0)+1;u=c[8956>>2]|0;v=c[8952>>2]|0;s=u-v>>2;do{if(!(s>>>0>r>>>0)){if(s>>>0<t>>>0){Kj(8952|0,t-s|0);v=c[8952>>2]|0;break}if(s>>>0>t>>>0?(q=v+(t<<2)|0,(u|0)!=(q|0)):0){c[8956>>2]=u+(~((u+ -4+(0-q)|0)>>>2)<<2)}}}while(0);q=c[v+(r<<2)>>2]|0;if((q|0)!=0){K=q+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[q>>2]|0)+8>>2]&127](q)}v=c[8952>>2]|0}c[v+(r<<2)>>2]=9224;c[9220>>2]=0;c[2304]=4176;if(!((c[1056]|0)==-1)){c[e>>2]=4224;c[e+4>>2]=106;c[e+8>>2]=0;td(4224,e)}s=c[4228>>2]|0;q=s+ -1|0;c[9220>>2]=(c[9220>>2]|0)+1;t=c[8956>>2]|0;u=c[8952>>2]|0;r=t-u>>2;do{if(!(r>>>0>q>>>0)){if(r>>>0<s>>>0){Kj(8952|0,s-r|0);u=c[8952>>2]|0;break}if(r>>>0>s>>>0?(p=u+(s<<2)|0,(t|0)!=(p|0)):0){c[8956>>2]=t+(~((t+ -4+(0-p)|0)>>>2)<<2)}}}while(0);p=c[u+(q<<2)>>2]|0;if((p|0)!=0){K=p+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[p>>2]|0)+8>>2]&127](p)}u=c[8952>>2]|0}c[u+(q<<2)>>2]=9216;c[9212>>2]=0;c[2302]=4240;if(!((c[1066]|0)==-1)){c[e>>2]=4264;c[e+4>>2]=106;c[e+8>>2]=0;td(4264,e)}t=c[4268>>2]|0;p=t+ -1|0;c[9212>>2]=(c[9212>>2]|0)+1;r=c[8956>>2]|0;q=c[8952>>2]|0;s=r-q>>2;do{if(!(s>>>0>p>>>0)){if(s>>>0<t>>>0){Kj(8952|0,t-s|0);q=c[8952>>2]|0;break}if(s>>>0>t>>>0?(o=q+(t<<2)|0,(r|0)!=(o|0)):0){c[8956>>2]=r+(~((r+ -4+(0-o)|0)>>>2)<<2)}}}while(0);o=c[q+(p<<2)>>2]|0;if((o|0)!=0){K=o+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[o>>2]|0)+8>>2]&127](o)}q=c[8952>>2]|0}c[q+(p<<2)>>2]=9208;c[9204>>2]=0;c[2300]=4320;if(!((c[1086]|0)==-1)){c[e>>2]=4344;c[e+4>>2]=106;c[e+8>>2]=0;td(4344,e)}q=c[4348>>2]|0;o=q+ -1|0;c[9204>>2]=(c[9204>>2]|0)+1;r=c[8956>>2]|0;s=c[8952>>2]|0;p=r-s>>2;do{if(!(p>>>0>o>>>0)){if(p>>>0<q>>>0){Kj(8952|0,q-p|0);s=c[8952>>2]|0;break}if(p>>>0>q>>>0?(n=s+(q<<2)|0,(r|0)!=(n|0)):0){c[8956>>2]=r+(~((r+ -4+(0-n)|0)>>>2)<<2)}}}while(0);n=c[s+(o<<2)>>2]|0;if((n|0)!=0){K=n+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[n>>2]|0)+8>>2]&127](n)}s=c[8952>>2]|0}c[s+(o<<2)>>2]=9200;c[9196>>2]=0;c[2298]=4376;if(!((c[1100]|0)==-1)){c[e>>2]=4400;c[e+4>>2]=106;c[e+8>>2]=0;td(4400,e)}p=c[4404>>2]|0;n=p+ -1|0;c[9196>>2]=(c[9196>>2]|0)+1;q=c[8956>>2]|0;r=c[8952>>2]|0;o=q-r>>2;do{if(!(o>>>0>n>>>0)){if(o>>>0<p>>>0){Kj(8952|0,p-o|0);r=c[8952>>2]|0;break}if(o>>>0>p>>>0?(m=r+(p<<2)|0,(q|0)!=(m|0)):0){c[8956>>2]=q+(~((q+ -4+(0-m)|0)>>>2)<<2)}}}while(0);m=c[r+(n<<2)>>2]|0;if((m|0)!=0){K=m+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[m>>2]|0)+8>>2]&127](m)}r=c[8952>>2]|0}c[r+(n<<2)>>2]=9192;c[9188>>2]=0;c[2296]=4424;if(!((c[1112]|0)==-1)){c[e>>2]=4448;c[e+4>>2]=106;c[e+8>>2]=0;td(4448,e)}p=c[4452>>2]|0;m=p+ -1|0;c[9188>>2]=(c[9188>>2]|0)+1;o=c[8956>>2]|0;n=c[8952>>2]|0;q=o-n>>2;do{if(!(q>>>0>m>>>0)){if(q>>>0<p>>>0){Kj(8952|0,p-q|0);n=c[8952>>2]|0;break}if(q>>>0>p>>>0?(l=n+(p<<2)|0,(o|0)!=(l|0)):0){c[8956>>2]=o+(~((o+ -4+(0-l)|0)>>>2)<<2)}}}while(0);l=c[n+(m<<2)>>2]|0;if((l|0)!=0){K=l+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[l>>2]|0)+8>>2]&127](l)}n=c[8952>>2]|0}c[n+(m<<2)>>2]=9184;c[9172>>2]=0;c[2292]=3472;c[9176>>2]=3520;if(!((c[888]|0)==-1)){c[e>>2]=3552;c[e+4>>2]=106;c[e+8>>2]=0;td(3552,e)}o=c[3556>>2]|0;l=o+ -1|0;c[9172>>2]=(c[9172>>2]|0)+1;p=c[8956>>2]|0;m=c[8952>>2]|0;n=p-m>>2;do{if(!(n>>>0>l>>>0)){if(n>>>0<o>>>0){Kj(8952|0,o-n|0);m=c[8952>>2]|0;break}if(n>>>0>o>>>0?(k=m+(o<<2)|0,(p|0)!=(k|0)):0){c[8956>>2]=p+(~((p+ -4+(0-k)|0)>>>2)<<2)}}}while(0);k=c[m+(l<<2)>>2]|0;if((k|0)!=0){K=k+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[k>>2]|0)+8>>2]&127](k)}m=c[8952>>2]|0}c[m+(l<<2)>>2]=9168;c[9156>>2]=0;c[2288]=3624;c[9160>>2]=3672;if(!((c[926]|0)==-1)){c[e>>2]=3704;c[e+4>>2]=106;c[e+8>>2]=0;td(3704,e)}m=c[3708>>2]|0;k=m+ -1|0;c[9156>>2]=(c[9156>>2]|0)+1;n=c[8956>>2]|0;o=c[8952>>2]|0;l=n-o>>2;do{if(!(l>>>0>k>>>0)){if(l>>>0<m>>>0){Kj(8952|0,m-l|0);o=c[8952>>2]|0;break}if(l>>>0>m>>>0?(j=o+(m<<2)|0,(n|0)!=(j|0)):0){c[8956>>2]=n+(~((n+ -4+(0-j)|0)>>>2)<<2)}}}while(0);j=c[o+(k<<2)>>2]|0;if((j|0)!=0){K=j+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[j>>2]|0)+8>>2]&127](j)}o=c[8952>>2]|0}c[o+(k<<2)>>2]=9152;c[9140>>2]=0;c[2284]=5512;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}c[9144>>2]=c[1136];c[2284]=3920;if(!((c[984]|0)==-1)){c[e>>2]=3936;c[e+4>>2]=106;c[e+8>>2]=0;td(3936,e)}m=c[3940>>2]|0;j=m+ -1|0;c[9140>>2]=(c[9140>>2]|0)+1;l=c[8956>>2]|0;k=c[8952>>2]|0;n=l-k>>2;do{if(!(n>>>0>j>>>0)){if(n>>>0<m>>>0){Kj(8952|0,m-n|0);k=c[8952>>2]|0;break}if(n>>>0>m>>>0?(h=k+(m<<2)|0,(l|0)!=(h|0)):0){c[8956>>2]=l+(~((l+ -4+(0-h)|0)>>>2)<<2)}}}while(0);h=c[k+(j<<2)>>2]|0;if((h|0)!=0){K=h+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[h>>2]|0)+8>>2]&127](h)}k=c[8952>>2]|0}c[k+(j<<2)>>2]=9136;c[9124>>2]=0;c[2280]=5512;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}c[9128>>2]=c[1136];c[2280]=3952;if(!((c[992]|0)==-1)){c[e>>2]=3968;c[e+4>>2]=106;c[e+8>>2]=0;td(3968,e)}j=c[3972>>2]|0;h=j+ -1|0;c[9124>>2]=(c[9124>>2]|0)+1;m=c[8956>>2]|0;k=c[8952>>2]|0;l=m-k>>2;do{if(!(l>>>0>h>>>0)){if(l>>>0<j>>>0){Kj(8952|0,j-l|0);k=c[8952>>2]|0;break}if(l>>>0>j>>>0?(g=k+(j<<2)|0,(m|0)!=(g|0)):0){c[8956>>2]=m+(~((m+ -4+(0-g)|0)>>>2)<<2)}}}while(0);g=c[k+(h<<2)>>2]|0;if((g|0)!=0){K=g+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[g>>2]|0)+8>>2]&127](g)}k=c[8952>>2]|0}c[k+(h<<2)>>2]=9120;c[9116>>2]=0;c[2278]=4464;if(!((c[1122]|0)==-1)){c[e>>2]=4488;c[e+4>>2]=106;c[e+8>>2]=0;td(4488,e)}k=c[4492>>2]|0;g=k+ -1|0;c[9116>>2]=(c[9116>>2]|0)+1;j=c[8956>>2]|0;h=c[8952>>2]|0;l=j-h>>2;do{if(!(l>>>0>g>>>0)){if(l>>>0<k>>>0){Kj(8952|0,k-l|0);h=c[8952>>2]|0;break}if(l>>>0>k>>>0?(f=h+(k<<2)|0,(j|0)!=(f|0)):0){c[8956>>2]=j+(~((j+ -4+(0-f)|0)>>>2)<<2)}}}while(0);f=c[h+(g<<2)>>2]|0;if((f|0)!=0){K=f+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[f>>2]|0)+8>>2]&127](f)}h=c[8952>>2]|0}c[h+(g<<2)>>2]=9112;c[9108>>2]=0;c[2276]=4504;if(!((c[1132]|0)==-1)){c[e>>2]=4528;c[e+4>>2]=106;c[e+8>>2]=0;td(4528,e)}h=c[4532>>2]|0;e=h+ -1|0;c[9108>>2]=(c[9108>>2]|0)+1;j=c[8956>>2]|0;g=c[8952>>2]|0;f=j-g>>2;do{if(!(f>>>0>e>>>0)){if(f>>>0<h>>>0){Kj(8952|0,h-f|0);g=c[8952>>2]|0;break}if(f>>>0>h>>>0?(d=g+(h<<2)|0,(j|0)!=(d|0)):0){c[8956>>2]=j+(~((j+ -4+(0-d)|0)>>>2)<<2)}}}while(0);d=c[g+(e<<2)>>2]|0;if((d|0)!=0){K=d+4|0;L=c[K>>2]|0;c[K>>2]=L+ -1;if((L|0)==0){ac[c[(c[d>>2]|0)+8>>2]&127](d)}g=c[8952>>2]|0}c[g+(e<<2)>>2]=9104;c[1146]=8944;Ua(4592)}L=c[1146]|0;c[1150]=L;L=L+4|0;c[L>>2]=(c[L>>2]|0)+1;c[1152]=4600;Ua(4616);L=c[1152]|0;i=b;return L|0}function Vh(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Wh(a){a=a|0;var b=0;b=i;if((a|0)==0){i=b;return}ac[c[(c[a>>2]|0)+4>>2]&127](a);i=b;return}function Xh(a){a=a|0;var b=0;b=c[1156]|0;c[1156]=b+1;c[a+4>>2]=b+1;return}function Yh(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Zh(a,d,e){a=a|0;d=d|0;e=e|0;a=i;if(!(e>>>0<128)){d=0;i=a;return d|0}d=(b[(c[(Ga()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;i=a;return d|0}function _h(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0;a=i;if((d|0)==(e|0)){g=d;i=a;return g|0}while(1){g=c[d>>2]|0;if(g>>>0<128){g=b[(c[(Ga()|0)>>2]|0)+(g<<1)>>1]|0}else{g=0}b[f>>1]=g;d=d+4|0;if((d|0)==(e|0)){break}else{f=f+2|0}}i=a;return e|0}function $h(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0;a=i;a:do{if((e|0)==(f|0)){f=e}else{do{g=c[e>>2]|0;if(g>>>0<128?!((b[(c[(Ga()|0)>>2]|0)+(g<<1)>>1]&d)<<16>>16==0):0){f=e;break a}e=e+4|0}while((e|0)!=(f|0))}}while(0);i=a;return f|0}function ai(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=i;a:do{if((e|0)==(f|0)){f=e}else{while(1){g=c[e>>2]|0;if(!(g>>>0<128)){f=e;break a}h=e+4|0;if((b[(c[(Ga()|0)>>2]|0)+(g<<1)>>1]&d)<<16>>16==0){f=e;break a}if((h|0)==(f|0)){break}else{e=h}}}}while(0);i=a;return f|0}function bi(a,b){a=a|0;b=b|0;a=i;if(!(b>>>0<128)){i=a;return b|0}b=c[(c[(ub()|0)>>2]|0)+(b<<2)>>2]|0;i=a;return b|0}function ci(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}do{e=c[b>>2]|0;if(e>>>0<128){e=c[(c[(ub()|0)>>2]|0)+(e<<2)>>2]|0}c[b>>2]=e;b=b+4|0}while((b|0)!=(d|0));i=a;return d|0}function di(a,b){a=a|0;b=b|0;a=i;if(!(b>>>0<128)){i=a;return b|0}b=c[(c[(ob()|0)>>2]|0)+(b<<2)>>2]|0;i=a;return b|0}function ei(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}do{e=c[b>>2]|0;if(e>>>0<128){e=c[(c[(ob()|0)>>2]|0)+(e<<2)>>2]|0}c[b>>2]=e;b=b+4|0}while((b|0)!=(d|0));i=a;return d|0}function fi(a,b){a=a|0;b=b|0;return b<<24>>24|0}function gi(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;b=i;if((d|0)==(e|0)){i=b;return d|0}while(1){c[f>>2]=a[d]|0;d=d+1|0;if((d|0)==(e|0)){break}else{f=f+4|0}}i=b;return e|0}function hi(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function ii(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;b=i;if((d|0)==(e|0)){k=d;i=b;return k|0}h=(e+ -4+(0-d)|0)>>>2;j=d;while(1){k=c[j>>2]|0;a[g]=k>>>0<128?k&255:f;j=j+4|0;if((j|0)==(e|0)){break}else{g=g+1|0}}k=d+(h+1<<2)|0;i=b;return k|0}function ji(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=4656;e=c[b+8>>2]|0;if((e|0)!=0){if((a[b+12|0]|0)!=0){gk(e)}if((b|0)==0){i=d;return}}gk(b);i=d;return}function ki(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=4656;e=c[b+8>>2]|0;if((e|0)!=0?(a[b+12|0]|0)!=0:0){gk(e)}i=d;return}function li(a,b){a=a|0;b=b|0;a=i;if(!(b<<24>>24>-1)){i=a;return b|0}b=c[(c[(ub()|0)>>2]|0)+((b&255)<<2)>>2]&255;i=a;return b|0}function mi(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}do{f=a[d]|0;if(f<<24>>24>-1){f=c[(c[(ub()|0)>>2]|0)+(f<<24>>24<<2)>>2]&255}a[d]=f;d=d+1|0}while((d|0)!=(e|0));i=b;return e|0}function ni(a,b){a=a|0;b=b|0;a=i;if(!(b<<24>>24>-1)){i=a;return b|0}b=c[(c[(ob()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;i=a;return b|0}function oi(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}do{f=a[d]|0;if(f<<24>>24>-1){f=c[(c[(ob()|0)>>2]|0)+(f<<24>>24<<2)>>2]&255}a[d]=f;d=d+1|0}while((d|0)!=(e|0));i=b;return e|0}function pi(a,b){a=a|0;b=b|0;return b|0}function qi(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;b=i;if((c|0)==(d|0)){d=c}else{while(1){a[e]=a[c]|0;c=c+1|0;if((c|0)==(d|0)){break}else{e=e+1|0}}}i=b;return d|0}function ri(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function si(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0;b=i;if((c|0)==(d|0)){g=c;i=b;return g|0}while(1){g=a[c]|0;a[f]=g<<24>>24>-1?g:e;c=c+1|0;if((c|0)==(d|0)){break}else{f=f+1|0}}i=b;return d|0}function ti(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function ui(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function vi(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function wi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function xi(a){a=a|0;return 1}function yi(a){a=a|0;return 1}function zi(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;c=d-c|0;return(c>>>0<e>>>0?c:e)|0}function Ai(a){a=a|0;return 1}function Bi(b){b=b|0;var d=0,e=0,f=0;d=i;c[b>>2]=4728;e=b+8|0;f=c[e>>2]|0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}if((f|0)!=(c[1136]|0)){jb(c[e>>2]|0)}if((b|0)==0){i=d;return}gk(b);i=d;return}function Ci(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+272|0;m=d+256|0;n=d;a:do{if((e|0)!=(f|0)){p=e;while(1){o=p+4|0;if((c[p>>2]|0)==0){break}if((o|0)==(f|0)){p=f;break}else{p=o}}c[k>>2]=h;c[g>>2]=e;if((h|0)!=(j|0)){o=j;b=b+8|0;while(1){v=p-e>>2;q=$a(c[b>>2]|0)|0;x=c[g>>2]|0;r=(h|0)!=0;u=r?o-h|0:256;t=r?h:n;b:do{if((x|0)==0|(u|0)==0){s=0}else{s=0;do{w=v>>>0>=u>>>0;if(!(w|v>>>0>32)){break b}w=w?u:v;v=v-w|0;c:do{if((t|0)==0){z=c[x>>2]|0;if((z|0)==0){w=0}else{w=0;y=x;while(1){if(z>>>0>127){z=Nj(m,z)|0;if((z|0)==-1){u=0;s=-1;break b}}else{z=1}w=z+w|0;y=y+4|0;z=c[y>>2]|0;if((z|0)==0){l=32;break}}}}else{d:do{if(w>>>0>3){y=t;z=w;while(1){A=c[x>>2]|0;if((A|0)==0){l=22;break d}if(A>>>0>127){A=Nj(y,A)|0;if((A|0)==-1){u=0;s=-1;break b}y=y+A|0;z=z-A|0}else{a[y]=A;y=y+1|0;z=z+ -1|0}x=x+4|0;if(!(z>>>0>3)){l=16;break}}}else{y=t;z=w;l=16}}while(0);if((l|0)==16){l=0;if((z|0)==0){z=0}else{l=22}}e:do{if((l|0)==22){while(1){l=0;A=c[x>>2]|0;if((A|0)==0){l=30;break}if(A>>>0>127){A=Nj(m,A)|0;if((A|0)==-1){u=0;s=-1;break b}if(A>>>0>z>>>0){l=26;break}Nj(y,c[x>>2]|0)|0;y=y+A|0;z=z-A|0}else{a[y]=A;y=y+1|0;z=z+ -1|0}if((z|0)==0){z=0;break e}else{x=x+4|0;l=22}}if((l|0)==26){w=w-z|0;l=32;break c}else if((l|0)==30){a[y]=0;break}}}while(0);w=w-z|0;x=0;l=32}}while(0);if((l|0)==32){l=0;if((w|0)==-1){u=0;s=-1;break b}}if((t|0)==(n|0)){t=n}else{u=u-w|0;t=t+w|0}s=w+s|0}while(!((x|0)==0|(u|0)==0))}}while(0);f:do{if((x|0)!=0){if(!((u|0)==0|(v|0)==0)){while(1){w=Nj(t,c[x>>2]|0)|0;if((w+1|0)>>>0<2){break}x=x+4|0;v=v+ -1|0;s=s+1|0;if((u|0)==(w|0)|(v|0)==0){break f}else{u=u-w|0;t=t+w|0}}t=(w|0)==0;x=t?0:x;s=t?s:-1}}else{x=0}}while(0);if(r){c[g>>2]=x}if((q|0)!=0){$a(q|0)|0}if((s|0)==-1){l=46;break}else if((s|0)==0){g=1;l=65;break}h=(c[k>>2]|0)+s|0;c[k>>2]=h;if((h|0)==(j|0)){l=63;break}if((p|0)==(f|0)){e=c[g>>2]|0;p=f}else{e=$a(c[b>>2]|0)|0;if((e|0)!=0){$a(e|0)|0}e=c[k>>2]|0;if((e|0)==(j|0)){g=1;l=65;break}c[k>>2]=e+1;a[e]=0;e=(c[g>>2]|0)+4|0;c[g>>2]=e;g:do{if((e|0)==(f|0)){p=f}else{p=e;while(1){h=p+4|0;if((c[p>>2]|0)==0){break g}if((h|0)==(f|0)){p=f;break}else{p=h}}}}while(0);h=c[k>>2]|0}if((e|0)==(f|0)|(h|0)==(j|0)){break a}}if((l|0)==46){c[k>>2]=h;h:do{if((e|0)!=(c[g>>2]|0)){do{j=c[e>>2]|0;f=$a(c[b>>2]|0)|0;j=Nj(h,j)|0;if((f|0)!=0){$a(f|0)|0}if((j|0)==-1){break h}h=(c[k>>2]|0)+j|0;c[k>>2]=h;e=e+4|0}while((e|0)!=(c[g>>2]|0))}}while(0);c[g>>2]=e;A=2;i=d;return A|0}else if((l|0)==63){e=c[g>>2]|0;break}else if((l|0)==65){i=d;return g|0}}}else{c[k>>2]=h;c[g>>2]=e}}while(0);A=(e|0)!=(f|0)|0;i=d;return A|0}function Di(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;l=i;i=i+1040|0;o=l+16|0;n=l+8|0;m=l;a:do{if((e|0)!=(f|0)){r=e;while(1){p=r+1|0;if((a[r]|0)==0){break}if((p|0)==(f|0)){r=f;break}else{r=p}}c[k>>2]=h;c[g>>2]=e;if((h|0)!=(j|0)){p=j;b=b+8|0;while(1){s=d;u=c[s+4>>2]|0;q=m;c[q>>2]=c[s>>2];c[q+4>>2]=u;q=r;u=q-e|0;s=$a(c[b>>2]|0)|0;y=c[g>>2]|0;c[n>>2]=y;t=(h|0)!=0;v=t?p-h>>2:256;x=t?h:o;b:do{if((y|0)==0|(v|0)==0){w=0}else{w=0;while(1){A=u>>>2;z=A>>>0>=v>>>0;if(!(z|u>>>0>131)){break b}y=z?v:A;u=u-y|0;y=Mj(x,n,y,d)|0;if((y|0)==-1){break}if((x|0)==(o|0)){x=o}else{v=v-y|0;x=x+(y<<2)|0}w=y+w|0;y=c[n>>2]|0;if((y|0)==0|(v|0)==0){break b}}v=0;y=c[n>>2]|0;w=-1}}while(0);c:do{if((y|0)!=0){if(!((v|0)==0|(u|0)==0)){while(1){z=Lj(x,y,u,d)|0;if((z+2|0)>>>0<3){break}y=y+z|0;c[n>>2]=y;v=v+ -1|0;w=w+1|0;if((v|0)==0|(u|0)==(z|0)){break c}else{u=u-z|0;x=x+4|0}}if((z|0)==0){c[n>>2]=0;y=0;break}else if((z|0)==-1){w=-1;break}else{c[d>>2]=0;break}}}else{y=0}}while(0);if(t){c[g>>2]=y}if((s|0)!=0){$a(s|0)|0}if((w|0)==-1){d=26;break}else if((w|0)==0){f=2;d=48;break}h=(c[k>>2]|0)+(w<<2)|0;c[k>>2]=h;if((h|0)==(j|0)){d=46;break}e=c[g>>2]|0;if((r|0)==(f|0)){r=f}else{q=$a(c[b>>2]|0)|0;e=Lj(h,e,1,d)|0;if((q|0)!=0){$a(q|0)|0}if((e|0)!=0){f=2;d=48;break}c[k>>2]=(c[k>>2]|0)+4;e=(c[g>>2]|0)+1|0;c[g>>2]=e;d:do{if((e|0)==(f|0)){r=f}else{r=e;while(1){q=r+1|0;if((a[r]|0)==0){break d}if((q|0)==(f|0)){r=f;break}else{r=q}}}}while(0);h=c[k>>2]|0}if((e|0)==(f|0)|(h|0)==(j|0)){break a}}if((d|0)==26){c[k>>2]=h;e:do{if((e|0)!=(c[g>>2]|0)){while(1){d=$a(c[b>>2]|0)|0;j=Lj(h,e,q-e|0,m)|0;if((d|0)!=0){$a(d|0)|0}if((j|0)==-1){d=31;break}else if((j|0)==-2){d=32;break}else if((j|0)==0){e=e+1|0}else{e=e+j|0}h=(c[k>>2]|0)+4|0;c[k>>2]=h;if((e|0)==(c[g>>2]|0)){break e}}if((d|0)==31){c[g>>2]=e;A=2;i=l;return A|0}else if((d|0)==32){c[g>>2]=e;A=1;i=l;return A|0}}}while(0);c[g>>2]=e;A=(e|0)!=(f|0)|0;i=l;return A|0}else if((d|0)==46){e=c[g>>2]|0;break}else if((d|0)==48){i=l;return f|0}}}else{c[k>>2]=h;c[g>>2]=e}}while(0);A=(e|0)!=(f|0)|0;i=l;return A|0}function Ei(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;b=i;c[f>>2]=d;a=$a(c[a+8>>2]|0)|0;if((a|0)==0){i=b;return 0}$a(a|0)|0;i=b;return 0}function Fi(a){a=a|0;var b=0,d=0;b=i;a=a+8|0;d=$a(c[a>>2]|0)|0;if((d|0)!=0){$a(d|0)|0}a=c[a>>2]|0;if((a|0)!=0){a=$a(a|0)|0;if((a|0)==0){a=0}else{$a(a|0)|0;a=0}}else{a=1}i=b;return a|0}function Gi(a){a=a|0;return 0}function Hi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;if((f|0)==0|(d|0)==(e|0)){m=0;i=g;return m|0}h=e;a=a+8|0;b=(b|0)!=0?b:12472;k=0;j=0;while(1){m=$a(c[a>>2]|0)|0;l=Lj(0,d,h-d|0,b)|0;if((m|0)!=0){$a(m|0)|0}if((l|0)==-2|(l|0)==-1){f=9;break}else if((l|0)==0){d=d+1|0;l=1}else{d=d+l|0}k=l+k|0;j=j+1|0;if(j>>>0>=f>>>0|(d|0)==(e|0)){f=9;break}}if((f|0)==9){i=g;return k|0}return 0}function Ii(a){a=a|0;var b=0;b=i;a=c[a+8>>2]|0;if((a|0)!=0){a=$a(a|0)|0;if((a|0)==0){a=4}else{$a(a|0)|0;a=4}}else{a=1}i=b;return a|0}function Ji(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Ki(d,f,g,h,j,k,l,m){d=d|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;f=i;d=h;a:do{if(g>>>0<h>>>0){o=g;n=k;while(1){q=b[o>>1]|0;p=q&65535;do{if((q&65535)<128){if((l-n|0)<1){h=1;break a}a[n]=q;n=n+1|0}else{if((q&65535)<2048){if((l-n|0)<2){h=1;break a}a[n]=p>>>6|192;a[n+1|0]=p&63|128;n=n+2|0;break}if((q&65535)<55296){if((l-n|0)<3){h=1;break a}a[n]=p>>>12|224;a[n+1|0]=p>>>6&63|128;a[n+2|0]=p&63|128;n=n+3|0;break}if(!((q&65535)<56320)){if((q&65535)<57344){h=2;break a}if((l-n|0)<3){h=1;break a}a[n]=p>>>12|224;a[n+1|0]=p>>>6&63|128;a[n+2|0]=p&63|128;n=n+3|0;break}if((d-o|0)<4){h=1;break a}q=o+2|0;r=e[q>>1]|0;if((r&64512|0)!=56320){h=2;break a}if((l-n|0)<4){h=1;break a}s=p&960;if(((s<<10)+65536|0)>>>0>1114111){h=2;break a}o=(s>>>6)+1|0;a[n]=o>>>2|240;a[n+1|0]=p>>>2&15|o<<4&48|128;a[n+2|0]=p<<4&48|r>>>6&15|128;a[n+3|0]=r&63|128;o=q;n=n+4|0}}while(0);o=o+2|0;if(!(o>>>0<h>>>0)){h=0;break}}}else{h=0;o=g;n=k}}while(0);c[j>>2]=g+(o-g>>1<<1);c[m>>2]=k+(n-k);i=f;return h|0}function Li(e,f,g,h,j,k,l,m){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;a:do{if(g>>>0<h>>>0){o=h;p=l;q=g;e=k;while(1){if(!(e>>>0<l>>>0)){n=31;break a}s=a[q]|0;r=s&255;do{if(s<<24>>24>-1){b[e>>1]=s&255;q=q+1|0}else{if((s&255)<194){h=2;break a}if((s&255)<224){if((o-q|0)<2){h=1;break a}s=d[q+1|0]|0;if((s&192|0)!=128){h=2;break a}b[e>>1]=s&63|r<<6&1984;q=q+2|0;break}if((s&255)<240){if((o-q|0)<3){h=1;break a}s=a[q+1|0]|0;t=a[q+2|0]|0;if((r|0)==237){if(!((s&-32)<<24>>24==-128)){h=2;break a}}else if((r|0)==224){if(!((s&-32)<<24>>24==-96)){h=2;break a}}else{if(!((s&-64)<<24>>24==-128)){h=2;break a}}t=t&255;if((t&192|0)!=128){h=2;break a}b[e>>1]=(s&255)<<6&4032|r<<12|t&63;q=q+3|0;break}if(!((s&255)<245)){h=2;break a}if((o-q|0)<4){h=1;break a}s=a[q+1|0]|0;t=a[q+2|0]|0;u=a[q+3|0]|0;if((r|0)==244){if(!((s&-16)<<24>>24==-128)){h=2;break a}}else if((r|0)==240){if(!((s+112<<24>>24&255)<48)){h=2;break a}}else{if(!((s&-64)<<24>>24==-128)){h=2;break a}}t=t&255;if((t&192|0)!=128){h=2;break a}u=u&255;if((u&192|0)!=128){h=2;break a}if((p-e|0)<4){h=1;break a}r=r&7;s=s&255;if((s<<12&196608|r<<18)>>>0>1114111){h=2;break a}b[e>>1]=s<<2&60|t>>>4&3|((s>>>4&3|r<<2)<<6)+16320|55296;e=e+2|0;b[e>>1]=t<<6&960|u&63|56320;q=q+4|0}}while(0);e=e+2|0;if(!(q>>>0<h>>>0)){n=31;break}}}else{q=g;e=k;n=31}}while(0);if((n|0)==31){h=q>>>0<h>>>0|0}c[j>>2]=g+(q-g);c[m>>2]=k+(e-k>>1<<1);i=f;return h|0}function Mi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Ni(a){a=a|0;return 0}function Oi(a){a=a|0;return 0}function Pi(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;c=i;a:do{if(d>>>0<e>>>0&(f|0)!=0){b=e;g=d;h=0;b:while(1){k=a[g]|0;j=k&255;do{if(k<<24>>24>-1){g=g+1|0}else{if((k&255)<194){break a}if((k&255)<224){if((b-g|0)<2){break a}if(!((a[g+1|0]&-64)<<24>>24==-128)){break a}g=g+2|0;break}if((k&255)<240){k=g;if((b-k|0)<3){break a}m=a[g+1|0]|0;l=a[g+2|0]|0;if((j|0)==224){if(!((m&-32)<<24>>24==-96)){e=14;break b}}else if((j|0)==237){if(!((m&-32)<<24>>24==-128)){e=16;break b}}else{if(!((m&-64)<<24>>24==-128)){e=18;break b}}if(!((l&-64)<<24>>24==-128)){break a}g=g+3|0;break}if(!((k&255)<245)){break a}k=g;if((b-k|0)<4){break a}if((f-h|0)>>>0<2){break a}n=a[g+1|0]|0;l=a[g+2|0]|0;m=a[g+3|0]|0;if((j|0)==240){if(!((n+112<<24>>24&255)<48)){e=26;break b}}else if((j|0)==244){if(!((n&-16)<<24>>24==-128)){e=28;break b}}else{if(!((n&-64)<<24>>24==-128)){e=30;break b}}if(!((l&-64)<<24>>24==-128)){break a}if(!((m&-64)<<24>>24==-128)){break a}if(((n&255)<<12&196608|j<<18&1835008)>>>0>1114111){break a}g=g+4|0;h=h+1|0}}while(0);h=h+1|0;if(!(g>>>0<e>>>0&h>>>0<f>>>0)){break a}}if((e|0)==14){n=k-d|0;i=c;return n|0}else if((e|0)==16){n=k-d|0;i=c;return n|0}else if((e|0)==18){n=k-d|0;i=c;return n|0}else if((e|0)==26){n=k-d|0;i=c;return n|0}else if((e|0)==28){n=k-d|0;i=c;return n|0}else if((e|0)==30){n=k-d|0;i=c;return n|0}}else{g=d}}while(0);n=g-d|0;i=c;return n|0}function Qi(a){a=a|0;return 4}function Ri(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Si(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0;d=i;a:do{if(e>>>0<f>>>0){b=e;l=h;while(1){m=c[b>>2]|0;if((m&-2048|0)==55296|m>>>0>1114111){f=2;break a}do{if(!(m>>>0<128)){if(m>>>0<2048){if((j-l|0)<2){f=1;break a}a[l]=m>>>6|192;a[l+1|0]=m&63|128;l=l+2|0;break}n=j-l|0;if(m>>>0<65536){if((n|0)<3){f=1;break a}a[l]=m>>>12|224;a[l+1|0]=m>>>6&63|128;a[l+2|0]=m&63|128;l=l+3|0;break}else{if((n|0)<4){f=1;break a}a[l]=m>>>18|240;a[l+1|0]=m>>>12&63|128;a[l+2|0]=m>>>6&63|128;a[l+3|0]=m&63|128;l=l+4|0;break}}else{if((j-l|0)<1){f=1;break a}a[l]=m;l=l+1|0}}while(0);b=b+4|0;if(!(b>>>0<f>>>0)){f=0;break}}}else{f=0;b=e;l=h}}while(0);c[g>>2]=e+(b-e>>2<<2);c[k>>2]=h+(l-h);i=d;return f|0}function Ti(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;a:do{if(f>>>0<g>>>0){o=g;n=f;b=j;while(1){if(!(b>>>0<k>>>0)){m=30;break a}q=a[n]|0;p=q&255;do{if(q<<24>>24>-1){c[b>>2]=p;n=n+1|0}else{if((q&255)<194){g=2;break a}if((q&255)<224){if((o-n|0)<2){g=1;break a}q=d[n+1|0]|0;if((q&192|0)!=128){g=2;break a}c[b>>2]=q&63|p<<6&1984;n=n+2|0;break}if((q&255)<240){if((o-n|0)<3){g=1;break a}q=a[n+1|0]|0;r=a[n+2|0]|0;if((p|0)==237){if(!((q&-32)<<24>>24==-128)){g=2;break a}}else if((p|0)==224){if(!((q&-32)<<24>>24==-96)){g=2;break a}}else{if(!((q&-64)<<24>>24==-128)){g=2;break a}}r=r&255;if((r&192|0)!=128){g=2;break a}c[b>>2]=(q&255)<<6&4032|p<<12&61440|r&63;n=n+3|0;break}if(!((q&255)<245)){g=2;break a}if((o-n|0)<4){g=1;break a}q=a[n+1|0]|0;r=a[n+2|0]|0;s=a[n+3|0]|0;if((p|0)==244){if(!((q&-16)<<24>>24==-128)){g=2;break a}}else if((p|0)==240){if(!((q+112<<24>>24&255)<48)){g=2;break a}}else{if(!((q&-64)<<24>>24==-128)){g=2;break a}}r=r&255;if((r&192|0)!=128){g=2;break a}s=s&255;if((s&192|0)!=128){g=2;break a}p=(q&255)<<12&258048|p<<18&1835008|r<<6&4032|s&63;if(p>>>0>1114111){g=2;break a}c[b>>2]=p;n=n+4|0}}while(0);b=b+4|0;if(!(n>>>0<g>>>0)){m=30;break}}}else{n=f;b=j;m=30}}while(0);if((m|0)==30){g=n>>>0<g>>>0|0}c[h>>2]=f+(n-f);c[l>>2]=j+(b-j>>2<<2);i=e;return g|0}function Ui(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Vi(a){a=a|0;return 0}function Wi(a){a=a|0;return 0}function Xi(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;c=i;a:do{if(d>>>0<e>>>0&(f|0)!=0){g=e;j=d;b=1;b:while(1){k=a[j]|0;h=k&255;do{if(k<<24>>24>-1){j=j+1|0}else{if((k&255)<194){break a}if((k&255)<224){if((g-j|0)<2){break a}if(!((a[j+1|0]&-64)<<24>>24==-128)){break a}j=j+2|0;break}if((k&255)<240){k=j;if((g-k|0)<3){break a}m=a[j+1|0]|0;l=a[j+2|0]|0;if((h|0)==224){if(!((m&-32)<<24>>24==-96)){e=14;break b}}else if((h|0)==237){if(!((m&-32)<<24>>24==-128)){e=16;break b}}else{if(!((m&-64)<<24>>24==-128)){e=18;break b}}if(!((l&-64)<<24>>24==-128)){break a}j=j+3|0;break}if(!((k&255)<245)){break a}k=j;if((g-k|0)<4){break a}m=a[j+1|0]|0;n=a[j+2|0]|0;l=a[j+3|0]|0;if((h|0)==240){if(!((m+112<<24>>24&255)<48)){e=25;break b}}else if((h|0)==244){if(!((m&-16)<<24>>24==-128)){e=27;break b}}else{if(!((m&-64)<<24>>24==-128)){e=29;break b}}if(!((n&-64)<<24>>24==-128)){break a}if(!((l&-64)<<24>>24==-128)){break a}if(((m&255)<<12&196608|h<<18&1835008)>>>0>1114111){break a}j=j+4|0}}while(0);if(!(j>>>0<e>>>0&b>>>0<f>>>0)){break a}b=b+1|0}if((e|0)==14){n=k-d|0;i=c;return n|0}else if((e|0)==16){n=k-d|0;i=c;return n|0}else if((e|0)==18){n=k-d|0;i=c;return n|0}else if((e|0)==25){n=k-d|0;i=c;return n|0}else if((e|0)==27){n=k-d|0;i=c;return n|0}else if((e|0)==29){n=k-d|0;i=c;return n|0}}else{j=d}}while(0);n=j-d|0;i=c;return n|0}function Yi(a){a=a|0;return 4}function Zi(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function _i(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function $i(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=4808;if(!((a[b+12|0]&1)==0)){e=c[b+20>>2]|0;if((e|0)!=0){gk(e)}if((b|0)==0){i=d;return}}gk(b);i=d;return}function aj(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=4808;if(!((a[b+12|0]&1)==0)?(e=c[b+20>>2]|0,(e|0)!=0):0){gk(e)}i=d;return}function bj(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=4848;if(!((a[b+16|0]&1)==0)){e=c[b+24>>2]|0;if((e|0)!=0){gk(e)}if((b|0)==0){i=d;return}}gk(b);i=d;return}function cj(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=4848;if(!((a[b+16|0]&1)==0)?(e=c[b+24>>2]|0,(e|0)!=0):0){gk(e)}i=d;return}function dj(b){b=b|0;return a[b+8|0]|0}function ej(a){a=a|0;return c[a+8>>2]|0}function fj(b){b=b|0;return a[b+9|0]|0}function gj(a){a=a|0;return c[a+12>>2]|0}function hj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=d+12|0;if((a[f]&1)==0){c[b+0>>2]=c[f+0>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];i=e;return}f=c[d+20>>2]|0;d=c[d+16>>2]|0;if(d>>>0>4294967279){ud()}do{if(!(d>>>0<11)){g=d+16&-16;h=(g|0)==0?1:g;while(1){j=fk(h)|0;if((j|0)!=0){h=12;break}j=c[3356]|0;c[3356]=j+0;if((j|0)==0){h=11;break}hc[j&0]()}if((h|0)==11){j=Oa(4)|0;c[j>>2]=13440;Pb(j|0,13488,104)}else if((h|0)==12){c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=d;break}}else{a[b]=d<<1;j=b+1|0}}while(0);vk(j|0,f|0,d|0)|0;a[j+d|0]=0;i=e;return}function ij(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=d+16|0;if((a[f]&1)==0){c[b+0>>2]=c[f+0>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];i=e;return}f=c[d+24>>2]|0;d=c[d+20>>2]|0;if(d>>>0>4294967279){ud()}do{if(!(d>>>0<11)){g=d+16&-16;h=(g|0)==0?1:g;while(1){j=fk(h)|0;if((j|0)!=0){h=12;break}j=c[3356]|0;c[3356]=j+0;if((j|0)==0){h=11;break}hc[j&0]()}if((h|0)==11){j=Oa(4)|0;c[j>>2]=13440;Pb(j|0,13488,104)}else if((h|0)==12){c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=d;break}}else{a[b]=d<<1;j=b+1|0}}while(0);vk(j|0,f|0,d|0)|0;a[j+d|0]=0;i=e;return}function jj(b,c){b=b|0;c=c|0;a[b]=8;c=b+1|0;a[c]=1702195828;a[c+1|0]=6649202;a[c+2|0]=25973;a[c+3|0]=101;a[b+5|0]=0;return}function kj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=i;while(1){d=fk(32)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=5;break}hc[d&0]()}if((e|0)==5){f=Oa(4)|0;c[f>>2]=13440;Pb(f|0,13488,104)}c[a+8>>2]=d;c[a>>2]=9;c[a+4>>2]=4;f=4;a=4880;e=d;while(1){f=f+ -1|0;c[e>>2]=c[a>>2];if((f|0)==0){break}else{a=a+4|0;e=e+4|0}}c[d+16>>2]=0;i=b;return}function lj(b,c){b=b|0;c=c|0;var d=0;c=i;a[b]=10;d=b+1|0;a[d+0|0]=a[4904|0]|0;a[d+1|0]=a[4905|0]|0;a[d+2|0]=a[4906|0]|0;a[d+3|0]=a[4907|0]|0;a[d+4|0]=a[4908|0]|0;a[b+6|0]=0;i=c;return}function mj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=i;while(1){d=fk(32)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=5;break}hc[d&0]()}if((e|0)==5){f=Oa(4)|0;c[f>>2]=13440;Pb(f|0,13488,104)}c[a+8>>2]=d;c[a>>2]=9;c[a+4>>2]=5;f=5;a=4912;e=d;while(1){f=f+ -1|0;c[e>>2]=c[a>>2];if((f|0)==0){break}else{a=a+4|0;e=e+4|0}}c[d+20>>2]=0;i=b;return}function nj(b){b=b|0;var d=0;b=i;if((a[4944]|0)!=0){d=c[1234]|0;i=b;return d|0}if((Ja(4944)|0)==0){d=c[1234]|0;i=b;return d|0}if((a[12112]|0)==0?(Ja(12112)|0)!=0:0){rk(11944,0,168)|0;Ua(12112)}vd(11944,12120);vd(11956|0,12128);vd(11968|0,12136);vd(11980|0,12144);vd(11992|0,12160);vd(12004|0,12176);vd(12016|0,12184);vd(12028|0,12200);vd(12040|0,12208);vd(12052|0,12216);vd(12064|0,12224);vd(12076|0,12232);vd(12088|0,12240);vd(12100|0,12248);c[1234]=11944;Ua(4944);d=c[1234]|0;i=b;return d|0}function oj(b){b=b|0;var d=0;b=i;if((a[4960]|0)!=0){d=c[1238]|0;i=b;return d|0}if((Ja(4960)|0)==0){d=c[1238]|0;i=b;return d|0}if((a[11576]|0)==0?(Ja(11576)|0)!=0:0){rk(11408,0,168)|0;Ua(11576)}Ad(11408,11584,6);Ad(11420|0,11616,6);Ad(11432|0,11648,7);Ad(11444|0,11680,9);Ad(11456|0,11720,8);Ad(11468|0,11760,6);Ad(11480|0,11792,8);Ad(11492|0,11832,3);Ad(11504|0,11848,3);Ad(11516|0,11864,3);Ad(11528|0,11880,3);Ad(11540|0,11896,3);Ad(11552|0,11912,3);Ad(11564|0,11928,3);c[1238]=11408;Ua(4960);d=c[1238]|0;i=b;return d|0}function pj(b){b=b|0;var d=0;b=i;if((a[4976]|0)!=0){d=c[1242]|0;i=b;return d|0}if((Ja(4976)|0)==0){d=c[1242]|0;i=b;return d|0}if((a[11184]|0)==0?(Ja(11184)|0)!=0:0){rk(10896,0,288)|0;Ua(11184)}vd(10896,11192);vd(10908|0,11200);vd(10920|0,11216);vd(10932|0,11224);vd(10944|0,11232);vd(10956|0,11240);vd(10968|0,11248);vd(10980|0,11256);vd(10992|0,11264);vd(11004|0,11280);vd(11016|0,11288);vd(11028|0,11304);vd(11040|0,11320);vd(11052|0,11328);vd(11064|0,11336);vd(11076|0,11344);vd(11088|0,11232);vd(11100|0,11352);vd(11112|0,11360);vd(11124|0,11368);vd(11136|0,11376);vd(11148|0,11384);vd(11160|0,11392);vd(11172|0,11400);c[1242]=10896;Ua(4976);d=c[1242]|0;i=b;return d|0}function qj(b){b=b|0;var d=0;b=i;if((a[4992]|0)!=0){d=c[1246]|0;i=b;return d|0}if((Ja(4992)|0)==0){d=c[1246]|0;i=b;return d|0}if((a[10344]|0)==0?(Ja(10344)|0)!=0:0){rk(10056,0,288)|0;Ua(10344)}Ad(10056,10352,7);Ad(10068|0,10384,8);Ad(10080|0,10424,5);Ad(10092|0,10448,5);Ad(10104|0,10768,3);Ad(10116|0,10472,4);Ad(10128|0,10496,4);Ad(10140|0,10520,6);Ad(10152|0,10552,9);Ad(10164|0,10592,7);Ad(10176|0,10624,8);Ad(10188|0,10664,8);Ad(10200|0,10704,3);Ad(10212|0,10720,3);Ad(10224|0,10736,3);Ad(10236|0,10752,3);Ad(10248|0,10768,3);Ad(10260|0,10784,3);Ad(10272|0,10800,3);Ad(10284|0,10816,3);Ad(10296|0,10832,3);Ad(10308|0,10848,3);Ad(10320|0,10864,3);Ad(10332|0,10880,3);c[1246]=10056;Ua(4992);d=c[1246]|0;i=b;return d|0}function rj(b){b=b|0;var d=0;b=i;if((a[5008]|0)!=0){d=c[1250]|0;i=b;return d|0}if((Ja(5008)|0)==0){d=c[1250]|0;i=b;return d|0}if((a[10032]|0)==0?(Ja(10032)|0)!=0:0){rk(9744,0,288)|0;Ua(10032)}vd(9744,10040);vd(9756|0,10048);c[1250]=9744;Ua(5008);d=c[1250]|0;i=b;return d|0}function sj(b){b=b|0;var d=0;b=i;if((a[5024]|0)!=0){d=c[1254]|0;i=b;return d|0}if((Ja(5024)|0)==0){d=c[1254]|0;i=b;return d|0}if((a[9704]|0)==0?(Ja(9704)|0)!=0:0){rk(9416,0,288)|0;Ua(9704)}Ad(9416,9712,2);Ad(9428|0,9728,2);c[1254]=9416;Ua(5024);d=c[1254]|0;i=b;return d|0}function tj(b){b=b|0;var c=0,d=0;b=i;if((a[5048]|0)!=0){i=b;return 5032}if((Ja(5048)|0)==0){i=b;return 5032}a[5032]=16;c=5033|0;d=c;a[d]=623865125;a[d+1|0]=2436973;a[d+2|0]=9519;a[d+3|0]=37;c=c+4|0;a[c]=2032480100;a[c+1|0]=7939375;a[c+2|0]=31013;a[c+3|0]=121;a[5041|0]=0;Ua(5048);i=b;return 5032}function uj(b){b=b|0;var d=0,e=0,f=0,g=0;b=i;if((a[5072]|0)!=0){i=b;return 5056}if((Ja(5072)|0)==0){i=b;return 5056}while(1){d=fk(48)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=6;break}hc[d&0]()}if((e|0)==6){g=Oa(4)|0;c[g>>2]=13440;Pb(g|0,13488,104)}c[5064>>2]=d;c[1264]=13;c[5060>>2]=8;g=8;e=5080;f=d;while(1){g=g+ -1|0;c[f>>2]=c[e>>2];if((g|0)==0){break}else{e=e+4|0;f=f+4|0}}c[d+32>>2]=0;Ua(5072);i=b;return 5056}function vj(b){b=b|0;var c=0,d=0;b=i;if((a[5136]|0)!=0){i=b;return 5120}if((Ja(5136)|0)==0){i=b;return 5120}a[5120]=16;c=5121|0;d=c;a[d]=624576549;a[d+1|0]=2439752;a[d+2|0]=9530;a[d+3|0]=37;c=c+4|0;a[c]=1394948685;a[c+1|0]=5449018;a[c+2|0]=21285;a[c+3|0]=83;a[5129|0]=0;Ua(5136);i=b;return 5120}function wj(b){b=b|0;var d=0,e=0,f=0,g=0;b=i;if((a[5160]|0)!=0){i=b;return 5144}if((Ja(5160)|0)==0){i=b;return 5144}while(1){d=fk(48)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=6;break}hc[d&0]()}if((e|0)==6){g=Oa(4)|0;c[g>>2]=13440;Pb(g|0,13488,104)}c[5152>>2]=d;c[1286]=13;c[5148>>2]=8;g=8;e=5168;f=d;while(1){g=g+ -1|0;c[f>>2]=c[e>>2];if((g|0)==0){break}else{e=e+4|0;f=f+4|0}}c[d+32>>2]=0;Ua(5160);i=b;return 5144}function xj(b){b=b|0;var d=0,e=0,f=0,g=0;b=i;if((a[5224]|0)!=0){i=b;return 5208}if((Ja(5224)|0)==0){i=b;return 5208}while(1){d=fk(32)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=6;break}hc[d&0]()}if((e|0)==6){g=Oa(4)|0;c[g>>2]=13440;Pb(g|0,13488,104)}c[5216>>2]=d;c[1302]=33;c[5212>>2]=20;g=d+0|0;f=5232|0;e=g+20|0;do{a[g]=a[f]|0;g=g+1|0;f=f+1|0}while((g|0)<(e|0));a[d+20|0]=0;Ua(5224);i=b;return 5208}function yj(b){b=b|0;var d=0,e=0,f=0,g=0;b=i;if((a[5272]|0)!=0){i=b;return 5256}if((Ja(5272)|0)==0){i=b;return 5256}while(1){d=fk(96)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=6;break}hc[d&0]()}if((e|0)==6){g=Oa(4)|0;c[g>>2]=13440;Pb(g|0,13488,104)}c[5264>>2]=d;c[1314]=25;c[5260>>2]=20;g=20;e=5280;f=d;while(1){g=g+ -1|0;c[f>>2]=c[e>>2];if((g|0)==0){break}else{e=e+4|0;f=f+4|0}}c[d+80>>2]=0;Ua(5272);i=b;return 5256}function zj(b){b=b|0;var d=0,e=0,f=0,g=0;b=i;if((a[5384]|0)!=0){i=b;return 5368}if((Ja(5384)|0)==0){i=b;return 5368}while(1){d=fk(16)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=6;break}hc[d&0]()}if((e|0)==6){g=Oa(4)|0;c[g>>2]=13440;Pb(g|0,13488,104)}c[5376>>2]=d;c[1342]=17;c[5372>>2]=11;g=d+0|0;f=5392|0;e=g+11|0;do{a[g]=a[f]|0;g=g+1|0;f=f+1|0}while((g|0)<(e|0));a[d+11|0]=0;Ua(5384);i=b;return 5368}function Aj(b){b=b|0;var d=0,e=0,f=0,g=0;b=i;if((a[5424]|0)!=0){i=b;return 5408}if((Ja(5424)|0)==0){i=b;return 5408}while(1){d=fk(48)|0;if((d|0)!=0){break}d=c[3356]|0;c[3356]=d+0;if((d|0)==0){e=6;break}hc[d&0]()}if((e|0)==6){g=Oa(4)|0;c[g>>2]=13440;Pb(g|0,13488,104)}c[5416>>2]=d;c[1352]=13;c[5412>>2]=11;g=11;e=5432;f=d;while(1){g=g+ -1|0;c[f>>2]=c[e>>2];if((g|0)==0){break}else{e=e+4|0;f=f+4|0}}c[d+44>>2]=0;Ua(5424);i=b;return 5408}function Bj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0.0,k=0,l=0,m=0,n=0;g=i;i=i+112|0;k=g;if((b|0)==(d|0)){c[e>>2]=4;j=0.0;i=g;return+j}h=Bb()|0;f=c[h>>2]|0;c[h>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}m=k+0|0;l=m+100|0;do{c[m>>2]=0;m=m+4|0}while((m|0)<(l|0));n=k+4|0;c[n>>2]=b;l=k+8|0;c[l>>2]=-1;c[k+44>>2]=b;c[k+76>>2]=-1;c[k+104>>2]=0;m=k+108|0;c[m>>2]=~b;c[k+100>>2]=-1;j=+mk(k,2);k=(c[n>>2]|0)-(c[l>>2]|0)+(c[m>>2]|0)|0;if((k|0)!=0){b=b+k|0}k=c[h>>2]|0;if((k|0)==0){c[h>>2]=f}if((b|0)!=(d|0)){c[e>>2]=4;j=0.0;i=g;return+j}if((k|0)!=34){i=g;return+j}c[e>>2]=4;i=g;return+j}function Cj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0.0,k=0,l=0,m=0,n=0;g=i;i=i+112|0;k=g;if((b|0)==(d|0)){c[e>>2]=4;j=0.0;i=g;return+j}h=Bb()|0;f=c[h>>2]|0;c[h>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}m=k+0|0;l=m+100|0;do{c[m>>2]=0;m=m+4|0}while((m|0)<(l|0));n=k+4|0;c[n>>2]=b;l=k+8|0;c[l>>2]=-1;c[k+44>>2]=b;c[k+76>>2]=-1;c[k+104>>2]=0;m=k+108|0;c[m>>2]=~b;c[k+100>>2]=-1;j=+mk(k,2);k=(c[n>>2]|0)-(c[l>>2]|0)+(c[m>>2]|0)|0;if((k|0)!=0){b=b+k|0}k=c[h>>2]|0;if((k|0)==0){c[h>>2]=f}if((b|0)!=(d|0)){c[e>>2]=4;j=0.0;i=g;return+j}if((k|0)!=34){i=g;return+j}c[e>>2]=4;i=g;return+j}function Dj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0.0,k=0,l=0,m=0,n=0;g=i;i=i+112|0;k=g;if((b|0)==(d|0)){c[e>>2]=4;j=0.0;i=g;return+j}h=Bb()|0;f=c[h>>2]|0;c[h>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}m=k+0|0;l=m+100|0;do{c[m>>2]=0;m=m+4|0}while((m|0)<(l|0));n=k+4|0;c[n>>2]=b;l=k+8|0;c[l>>2]=-1;c[k+44>>2]=b;c[k+76>>2]=-1;c[k+104>>2]=0;m=k+108|0;c[m>>2]=~b;c[k+100>>2]=-1;j=+mk(k,2);k=(c[n>>2]|0)-(c[l>>2]|0)+(c[m>>2]|0)|0;if((k|0)!=0){b=b+k|0}k=c[h>>2]|0;if((k|0)==0){c[h>>2]=f}if((b|0)!=(d|0)){c[e>>2]=4;j=0.0;i=g;return+j}if((k|0)==34){c[e>>2]=4}i=g;return+j}function Ej(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;i=i+16|0;h=g;do{if((b|0)!=(d|0)){if((a[b]|0)==45){c[e>>2]=4;e=0;b=0;break}k=Bb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}b=mb(b|0,h|0,f|0,c[1136]|0)|0;f=c[k>>2]|0;if((f|0)==0){c[k>>2]=j}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;e=0;b=0;break}if((f|0)==34){c[e>>2]=4;e=-1;b=-1}else{e=H}}else{c[e>>2]=4;e=0;b=0}}while(0);H=e;i=g;return b|0}function Fj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+16|0;g=h;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=h;return l|0}k=Bb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}f=mb(b|0,g|0,f|0,c[1136]|0)|0;b=H;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((l|0)==34|(b>>>0>0|(b|0)==0&f>>>0>4294967295)){c[e>>2]=4;l=-1;i=h;return l|0}else{l=f;i=h;return l|0}return 0}function Gj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+16|0;g=h;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=h;return l|0}k=Bb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}f=mb(b|0,g|0,f|0,c[1136]|0)|0;b=H;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((l|0)==34|(b>>>0>0|(b|0)==0&f>>>0>4294967295)){c[e>>2]=4;l=-1;i=h;return l|0}else{l=f;i=h;return l|0}return 0}function Hj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+16|0;g=h;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=h;return l|0}k=Bb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}f=mb(b|0,g|0,f|0,c[1136]|0)|0;b=H;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((l|0)==34|(b>>>0>0|(b|0)==0&f>>>0>65535)){c[e>>2]=4;l=-1;i=h;return l|0}else{l=f&65535;i=h;return l|0}return 0}function Ij(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+16|0;j=g;if((b|0)==(d|0)){c[e>>2]=4;b=0;l=0;H=b;i=g;return l|0}k=Bb()|0;h=c[k>>2]|0;c[k>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}b=Ea(b|0,j|0,f|0,c[1136]|0)|0;f=H;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=h}if((c[j>>2]|0)!=(d|0)){c[e>>2]=4;b=0;l=0;H=b;i=g;return l|0}if((l|0)==34){c[e>>2]=4;h=(f|0)>0|(f|0)==0&b>>>0>0;H=h?2147483647:-2147483648;i=g;return(h?-1:0)|0}else{l=b;H=f;i=g;return l|0}return 0}function Jj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+16|0;g=h;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}k=Bb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[4552]|0)==0?(Ja(4552)|0)!=0:0){c[1136]=bb(2147483647,12256,0)|0;Ua(4552)}b=Ea(b|0,g|0,f|0,c[1136]|0)|0;l=H;f=c[k>>2]|0;if((f|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}do{if((f|0)==34){c[e>>2]=4;if((l|0)>0|(l|0)==0&b>>>0>0){l=2147483647;i=h;return l|0}}else{if((l|0)<-1|(l|0)==-1&b>>>0<2147483648){c[e>>2]=4;break}if((l|0)>0|(l|0)==0&b>>>0>2147483647){c[e>>2]=4;l=2147483647;i=h;return l|0}else{l=b;i=h;return l|0}}}while(0);l=-2147483648;i=h;return l|0}function Kj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b+8|0;e=b+4|0;h=c[e>>2]|0;m=c[g>>2]|0;j=h;if(!(m-j>>2>>>0<d>>>0)){do{if((h|0)==0){g=0}else{c[h>>2]=0;g=c[e>>2]|0}h=g+4|0;c[e>>2]=h;d=d+ -1|0}while((d|0)!=0);i=f;return}h=b+16|0;n=c[b>>2]|0;j=j-n>>2;l=j+d|0;if(l>>>0>1073741823){e=Oa(8)|0;c[e>>2]=1432;while(1){f=fk(19)|0;if((f|0)!=0){k=11;break}f=c[3356]|0;c[3356]=f+0;if((f|0)==0){k=10;break}hc[f&0]()}if((k|0)==10){n=Oa(4)|0;c[n>>2]=13440;Pb(n|0,13488,104)}else if((k|0)==11){c[f+4>>2]=6;c[f>>2]=6;n=f+12|0;c[e+4>>2]=n;c[f+8>>2]=0;a[n+0|0]=a[4536|0]|0;a[n+1|0]=a[4537|0]|0;a[n+2|0]=a[4538|0]|0;a[n+3|0]=a[4539|0]|0;a[n+4|0]=a[4540|0]|0;a[n+5|0]=a[4541|0]|0;a[n+6|0]=a[4542|0]|0;c[e>>2]=1512;Pb(e|0,1552,9)}}m=m-n|0;if(m>>2>>>0<536870911){m=m>>1;l=m>>>0<l>>>0?l:m;if((l|0)!=0){m=b+128|0;if((a[m]|0)==0&l>>>0<29){a[m]=1;m=h}else{k=16}}else{l=0;m=0}}else{l=1073741823;k=16}do{if((k|0)==16){k=l<<2;k=(k|0)==0?1:k;while(1){m=fk(k)|0;if((m|0)!=0){k=21;break}m=c[3356]|0;c[3356]=m+0;if((m|0)==0){k=20;break}hc[m&0]()}if((k|0)==20){n=Oa(4)|0;c[n>>2]=13440;Pb(n|0,13488,104)}else if((k|0)==21){break}}}while(0);k=m+(j<<2)|0;do{if((k|0)==0){k=0}else{c[k>>2]=0}k=k+4|0;d=d+ -1|0}while((d|0)!=0);d=c[b>>2]|0;o=(c[e>>2]|0)-d|0;n=m+(j-(o>>2)<<2)|0;vk(n|0,d|0,o|0)|0;c[b>>2]=n;c[e>>2]=k;c[g>>2]=m+(l<<2);if((d|0)==0){i=f;return}if((h|0)==(d|0)){a[b+128|0]=0;i=f;return}else{gk(d);i=f;return}}function Lj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+16|0;h=g;c[h>>2]=b;f=(f|0)==0?12480:f;j=c[f>>2]|0;a:do{if((d|0)==0){if((j|0)==0){k=0;i=g;return k|0}}else{if((b|0)==0){c[h>>2]=h}else{h=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((j|0)==0){b=a[d]|0;j=b&255;if(b<<24>>24>-1){c[h>>2]=j;k=b<<24>>24!=0|0;i=g;return k|0}else{j=j+ -194|0;if(j>>>0>50){break a}b=e+ -1|0;j=c[12264+(j<<2)>>2]|0;d=d+1|0;break}}else{b=e}}while(0);b:do{if((b|0)!=0){k=a[d]|0;l=(k&255)>>>3;if((l+ -16|l+(j>>26))>>>0>7){break a}while(1){d=d+1|0;j=j<<6|(k&255)+ -128;b=b+ -1|0;if((j|0)>=0){break}if((b|0)==0){break b}k=a[d]|0;if(((k&255)+ -128|0)>>>0>63){break a}}c[f>>2]=0;c[h>>2]=j;l=e-b|0;i=g;return l|0}}while(0);c[f>>2]=j;l=-2;i=g;return l|0}}while(0);c[f>>2]=0;c[(Bb()|0)>>2]=84;l=-1;i=g;return l|0}function Mj(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;k=c[e>>2]|0;if((g|0)!=0?(l=c[g>>2]|0,(l|0)!=0):0){if((b|0)==0){j=f;g=16}else{c[g>>2]=0;j=f;g=36}}else{if((b|0)==0){j=f;g=7}else{j=f;g=6}}a:while(1){if((g|0)==6){if((j|0)==0){g=54;break}while(1){l=a[k]|0;do{if(((l&255)+ -1|0)>>>0<127?(k&3|0)==0&j>>>0>3:0){while(1){l=c[k>>2]|0;if(((l+ -16843009|l)&-2139062144|0)!=0){g=31;break}c[b>>2]=l&255;c[b+4>>2]=d[k+1|0]|0;c[b+8>>2]=d[k+2|0]|0;m=k+4|0;l=b+16|0;c[b+12>>2]=d[k+3|0]|0;j=j+ -4|0;if(j>>>0>3){b=l;k=m}else{g=30;break}}if((g|0)==30){b=l;l=a[m]|0;k=m;break}else if((g|0)==31){l=l&255;break}}}while(0);g=l&255;if(!((g+ -1|0)>>>0<127)){break}c[b>>2]=g;j=j+ -1|0;if((j|0)==0){g=54;break a}else{b=b+4|0;k=k+1|0}}g=g+ -194|0;if(g>>>0>50){g=48;break}l=c[12264+(g<<2)>>2]|0;k=k+1|0;g=36;continue}else if((g|0)==7){l=a[k]|0;if(((l&255)+ -1|0)>>>0<127?(k&3|0)==0:0){g=c[k>>2]|0;if(((g+ -16843009|g)&-2139062144|0)==0){do{k=k+4|0;j=j+ -4|0;g=c[k>>2]|0}while(((g+ -16843009|g)&-2139062144|0)==0)}l=g&255}g=l&255;if((g+ -1|0)>>>0<127){j=j+ -1|0;k=k+1|0;g=7;continue}g=g+ -194|0;if(g>>>0>50){g=48;break}l=c[12264+(g<<2)>>2]|0;k=k+1|0;g=16;continue}else if((g|0)==16){m=(d[k]|0)>>>3;if((m+ -16|m+(l>>26))>>>0>7){g=17;break}g=k+1|0;if((l&33554432|0)!=0){if(((d[g]|0)+ -128|0)>>>0>63){g=20;break}g=k+2|0;if((l&524288|0)==0){k=g}else{if(((d[g]|0)+ -128|0)>>>0>63){g=23;break}k=k+3|0}}else{k=g}j=j+ -1|0;g=7;continue}else if((g|0)==36){m=d[k]|0;g=m>>>3;if((g+ -16|g+(l>>26))>>>0>7){g=37;break}g=k+1|0;l=m+ -128|l<<6;if((l|0)<0){m=(d[g]|0)+ -128|0;if(m>>>0>63){g=40;break}g=k+2|0;l=m|l<<6;if((l|0)<0){g=(d[g]|0)+ -128|0;if(g>>>0>63){g=43;break}l=g|l<<6;k=k+3|0}else{k=g}}else{k=g}c[b>>2]=l;b=b+4|0;j=j+ -1|0;g=6;continue}}if((g|0)==17){k=k+ -1|0;g=46}else if((g|0)==20){k=k+ -1|0;g=46}else if((g|0)==23){k=k+ -1|0;g=46}else if((g|0)==37){k=k+ -1|0;g=46}else if((g|0)==40){k=k+ -1|0;g=46}else if((g|0)==43){k=k+ -1|0;g=46}else if((g|0)==54){i=h;return f|0}if((g|0)==46){if((l|0)==0){l=a[k]|0;g=48}}if((g|0)==48){if(l<<24>>24==0){if((b|0)!=0){c[b>>2]=0;c[e>>2]=0}m=f-j|0;i=h;return m|0}}c[(Bb()|0)>>2]=84;if((b|0)==0){m=-1;i=h;return m|0}c[e>>2]=k;m=-1;i=h;return m|0}function Nj(b,d){b=b|0;d=d|0;var e=0;e=i;if((b|0)==0){b=1;i=e;return b|0}if(d>>>0<128){a[b]=d;b=1;i=e;return b|0}if(d>>>0<2048){a[b]=d>>>6|192;a[b+1|0]=d&63|128;b=2;i=e;return b|0}if(d>>>0<55296|(d+ -57344|0)>>>0<8192){a[b]=d>>>12|224;a[b+1|0]=d>>>6&63|128;a[b+2|0]=d&63|128;b=3;i=e;return b|0}if((d+ -65536|0)>>>0<1048576){a[b]=d>>>18|240;a[b+1|0]=d>>>12&63|128;a[b+2|0]=d>>>6&63|128;a[b+3|0]=d&63|128;b=4;i=e;return b|0}else{c[(Bb()|0)>>2]=84;b=-1;i=e;return b|0}return 0}function Oj(a){a=a|0;var b=0;b=i;yb(a|0);if((a|0)!=0){gk(a)}i=b;return}function Pj(a){a=a|0;var b=0;b=i;yb(a|0);i=b;return}function Qj(a){a=a|0;return 12512}function Rj(a){a=a|0;return}function Sj(a){a=a|0;return}function Tj(a){a=a|0;return}function Uj(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Vj(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Wj(a){a=a|0;var b=0;b=i;if((a|0)!=0){gk(a)}i=b;return}function Xj(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;i=i+112|0;j=h+56|0;g=h;if((d|0)==(e|0)){u=1;i=h;return u|0}if((e|0)==0){u=0;i=h;return u|0}n=c[e>>2]|0;o=e+(c[n+ -8>>2]|0)|0;n=c[n+ -4>>2]|0;c[j>>2]=12680;c[j+4>>2]=e;c[j+8>>2]=12624;u=j+12|0;r=j+16|0;l=j+20|0;p=j+24|0;s=j+28|0;m=j+32|0;q=j+40|0;t=(n|0)==12680;e=u+0|0;k=e+40|0;do{c[e>>2]=0;e=e+4|0}while((e|0)<(k|0));b[u+40>>1]=0;a[u+42|0]=0;do{if(!t){$b[c[(c[n>>2]|0)+24>>2]&3](n,j,o,1,0);j=c[j+36>>2]|0;if((j|0)==1){if((c[p>>2]|0)!=1){if((c[q>>2]|0)!=0){u=0;i=h;return u|0}if((c[s>>2]|0)!=1){u=0;i=h;return u|0}if((c[m>>2]|0)!=1){u=0;i=h;return u|0}}j=c[r>>2]|0;break}else if((j|0)==0){if((c[q>>2]|0)!=1){u=0;i=h;return u|0}if((c[s>>2]|0)==1){j=(c[m>>2]|0)==1?c[l>>2]|0:0;break}else{u=0;i=h;return u|0}}else{u=0;i=h;return u|0}}else{c[j+48>>2]=1;lc[c[(c[3170]|0)+20>>2]&15](n,j,o,o,1,0);j=(c[p>>2]|0)==1?o:0}}while(0);if((j|0)==0){u=0;i=h;return u|0}e=g+0|0;k=e+56|0;do{c[e>>2]=0;e=e+4|0}while((e|0)<(k|0));c[g>>2]=j;c[g+8>>2]=d;c[g+12>>2]=-1;c[g+48>>2]=1;oc[c[(c[j>>2]|0)+28>>2]&7](j,g,c[f>>2]|0,1);if((c[g+24>>2]|0)!=1){u=0;i=h;return u|0}c[f>>2]=c[g+16>>2];u=1;i=h;return u|0}function Yj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((c[d+8>>2]|0)!=(b|0)){i=g;return}b=d+16|0;h=c[b>>2]|0;if((h|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function Zj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((b|0)!=(c[d+8>>2]|0)){h=c[b+8>>2]|0;oc[c[(c[h>>2]|0)+28>>2]&7](h,d,e,f);i=g;return}b=d+16|0;h=c[b>>2]|0;if((h|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function _j(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;if((b|0)==(c[d+8>>2]|0)){j=d+16|0;h=c[j>>2]|0;if((h|0)==0){c[j>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){l=d+36|0;c[l>>2]=(c[l>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}k=c[b+12>>2]|0;h=b+(k<<3)+16|0;j=c[b+20>>2]|0;l=j>>8;if((j&1|0)!=0){l=c[(c[e>>2]|0)+l>>2]|0}m=c[b+16>>2]|0;oc[c[(c[m>>2]|0)+28>>2]&7](m,d,e+l|0,(j&2|0)!=0?f:2);if((k|0)<=1){i=g;return}j=d+54|0;b=b+24|0;while(1){k=c[b+4>>2]|0;l=k>>8;if((k&1|0)!=0){l=c[(c[e>>2]|0)+l>>2]|0}m=c[b>>2]|0;oc[c[(c[m>>2]|0)+28>>2]&7](m,d,e+l|0,(k&2|0)!=0?f:2);if((a[j]|0)!=0){f=16;break}b=b+8|0;if(!(b>>>0<h>>>0)){f=16;break}}if((f|0)==16){i=g;return}}function $j(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}d=d+28|0;if((c[d>>2]|0)==1){i=h;return}c[d>>2]=f;i=h;return}if((b|0)==(c[d>>2]|0)){if((c[d+16>>2]|0)!=(e|0)?(m=d+20|0,(c[m>>2]|0)!=(e|0)):0){c[d+32>>2]=f;k=d+44|0;if((c[k>>2]|0)==4){i=h;return}w=c[b+12>>2]|0;q=b+(w<<3)+16|0;a:do{if((w|0)>0){s=d+52|0;t=d+53|0;o=d+54|0;n=b+8|0;r=d+24|0;u=0;p=0;b=b+16|0;b:do{a[s]=0;a[t]=0;v=c[b+4>>2]|0;w=v>>8;if((v&1|0)!=0){w=c[(c[e>>2]|0)+w>>2]|0}x=c[b>>2]|0;lc[c[(c[x>>2]|0)+20>>2]&15](x,d,e,e+w|0,2-(v>>>1&1)|0,g);if((a[o]|0)!=0){break}do{if((a[t]|0)!=0){if((a[s]|0)==0){if((c[n>>2]&1|0)==0){p=1;break b}else{p=1;break}}if((c[r>>2]|0)==1){n=27;break a}if((c[n>>2]&2|0)==0){n=27;break a}else{u=1;p=1}}}while(0);b=b+8|0}while(b>>>0<q>>>0);if(u){l=p;n=26}else{j=p;n=23}}else{j=0;n=23}}while(0);if((n|0)==23){c[m>>2]=e;x=d+40|0;c[x>>2]=(c[x>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1;if(j){n=27}else{n=28}}else{l=j;n=26}}if((n|0)==26){if(l){n=27}else{n=28}}if((n|0)==27){c[k>>2]=3;i=h;return}else if((n|0)==28){c[k>>2]=4;i=h;return}}if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}m=c[b+12>>2]|0;j=b+(m<<3)+16|0;l=c[b+20>>2]|0;n=l>>8;if((l&1|0)!=0){n=c[(c[e>>2]|0)+n>>2]|0}x=c[b+16>>2]|0;$b[c[(c[x>>2]|0)+24>>2]&3](x,d,e+n|0,(l&2|0)!=0?f:2,g);l=b+24|0;if((m|0)<=1){i=h;return}m=c[b+8>>2]|0;if((m&2|0)==0?(k=d+36|0,(c[k>>2]|0)!=1):0){if((m&1|0)==0){m=d+54|0;n=l;while(1){if((a[m]|0)!=0){n=53;break}if((c[k>>2]|0)==1){n=53;break}b=c[n+4>>2]|0;o=b>>8;if((b&1|0)!=0){o=c[(c[e>>2]|0)+o>>2]|0}x=c[n>>2]|0;$b[c[(c[x>>2]|0)+24>>2]&3](x,d,e+o|0,(b&2|0)!=0?f:2,g);n=n+8|0;if(!(n>>>0<j>>>0)){n=53;break}}if((n|0)==53){i=h;return}}m=d+24|0;n=d+54|0;o=l;while(1){if((a[n]|0)!=0){n=53;break}if((c[k>>2]|0)==1?(c[m>>2]|0)==1:0){n=53;break}b=c[o+4>>2]|0;p=b>>8;if((b&1|0)!=0){p=c[(c[e>>2]|0)+p>>2]|0}x=c[o>>2]|0;$b[c[(c[x>>2]|0)+24>>2]&3](x,d,e+p|0,(b&2|0)!=0?f:2,g);o=o+8|0;if(!(o>>>0<j>>>0)){n=53;break}}if((n|0)==53){i=h;return}}k=d+54|0;while(1){if((a[k]|0)!=0){n=53;break}m=c[l+4>>2]|0;n=m>>8;if((m&1|0)!=0){n=c[(c[e>>2]|0)+n>>2]|0}x=c[l>>2]|0;$b[c[(c[x>>2]|0)+24>>2]&3](x,d,e+n|0,(m&2|0)!=0?f:2,g);l=l+8|0;if(!(l>>>0<j>>>0)){n=53;break}}if((n|0)==53){i=h;return}}function ak(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}j=d+28|0;if((c[j>>2]|0)==1){i=h;return}c[j>>2]=f;i=h;return}if((b|0)!=(c[d>>2]|0)){l=c[b+8>>2]|0;$b[c[(c[l>>2]|0)+24>>2]&3](l,d,e,f,g);i=h;return}if((c[d+16>>2]|0)!=(e|0)?(k=d+20|0,(c[k>>2]|0)!=(e|0)):0){c[d+32>>2]=f;f=d+44|0;if((c[f>>2]|0)==4){i=h;return}l=d+52|0;a[l]=0;m=d+53|0;a[m]=0;b=c[b+8>>2]|0;lc[c[(c[b>>2]|0)+20>>2]&15](b,d,e,e,1,g);if((a[m]|0)!=0){if((a[l]|0)==0){b=1;j=13}}else{b=0;j=13}do{if((j|0)==13){c[k>>2]=e;m=d+40|0;c[m>>2]=(c[m>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1;if(b){break}}else{j=16}if((j|0)==16?b:0){break}c[f>>2]=4;i=h;return}}while(0);c[f>>2]=3;i=h;return}if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}function bk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;g=i;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){i=g;return}d=d+28|0;if((c[d>>2]|0)==1){i=g;return}c[d>>2]=f;i=g;return}if((c[d>>2]|0)!=(b|0)){i=g;return}if((c[d+16>>2]|0)!=(e|0)?(h=d+20|0,(c[h>>2]|0)!=(e|0)):0){c[d+32>>2]=f;c[h>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1}c[d+44>>2]=4;i=g;return}if((f|0)!=1){i=g;return}c[d+32>>2]=1;i=g;return}function ck(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;if((b|0)!=(c[d+8>>2]|0)){m=d+52|0;l=a[m]|0;o=d+53|0;n=a[o]|0;p=c[b+12>>2]|0;k=b+(p<<3)+16|0;a[m]=0;a[o]=0;q=c[b+20>>2]|0;r=q>>8;if((q&1|0)!=0){r=c[(c[f>>2]|0)+r>>2]|0}t=c[b+16>>2]|0;lc[c[(c[t>>2]|0)+20>>2]&15](t,d,e,f+r|0,(q&2|0)!=0?g:2,h);a:do{if((p|0)>1){q=d+24|0;p=b+8|0;r=d+54|0;b=b+24|0;do{if((a[r]|0)!=0){break a}if((a[m]|0)==0){if((a[o]|0)!=0?(c[p>>2]&1|0)==0:0){break a}}else{if((c[q>>2]|0)==1){break a}if((c[p>>2]&2|0)==0){break a}}a[m]=0;a[o]=0;s=c[b+4>>2]|0;t=s>>8;if((s&1|0)!=0){t=c[(c[f>>2]|0)+t>>2]|0}u=c[b>>2]|0;lc[c[(c[u>>2]|0)+20>>2]&15](u,d,e,f+t|0,(s&2|0)!=0?g:2,h);b=b+8|0}while(b>>>0<k>>>0)}}while(0);a[m]=l;a[o]=n;i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;h=d+16|0;k=c[h>>2]|0;if((k|0)==0){c[h>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((k|0)!=(e|0)){u=d+36|0;c[u>>2]=(c[u>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g}else{g=h}if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function dk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0;j=i;if((b|0)!=(c[d+8>>2]|0)){b=c[b+8>>2]|0;lc[c[(c[b>>2]|0)+20>>2]&15](b,d,e,f,g,h);i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;b=d+16|0;f=c[b>>2]|0;if((f|0)==0){c[b>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((f|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g}else{g=b}if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function ek(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;h=i;if((c[d+8>>2]|0)!=(b|0)){i=h;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=h;return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}if((b|0)!=(e|0)){b=d+36|0;c[b>>2]=(c[b>>2]|0)+1;a[d+54|0]=1;i=h;return}e=d+24|0;f=c[e>>2]|0;if((f|0)==2){c[e>>2]=g}else{g=f}if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}function fk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;b=i;do{if(a>>>0<245){if(a>>>0<11){a=16}else{a=a+11&-8}v=a>>>3;t=c[3232]|0;w=t>>>v;if((w&3|0)!=0){h=(w&1^1)+v|0;g=h<<1;e=12968+(g<<2)|0;g=12968+(g+2<<2)|0;j=c[g>>2]|0;d=j+8|0;f=c[d>>2]|0;do{if((e|0)!=(f|0)){if(f>>>0<(c[12944>>2]|0)>>>0){Mb()}k=f+12|0;if((c[k>>2]|0)==(j|0)){c[k>>2]=e;c[g>>2]=f;break}else{Mb()}}else{c[3232]=t&~(1<<h)}}while(0);H=h<<3;c[j+4>>2]=H|3;H=j+(H|4)|0;c[H>>2]=c[H>>2]|1;H=d;i=b;return H|0}if(a>>>0>(c[12936>>2]|0)>>>0){if((w|0)!=0){j=2<<v;j=w<<v&(j|0-j);j=(j&0-j)+ -1|0;d=j>>>12&16;j=j>>>d;h=j>>>5&8;j=j>>>h;g=j>>>2&4;j=j>>>g;f=j>>>1&2;j=j>>>f;e=j>>>1&1;e=(h|d|g|f|e)+(j>>>e)|0;j=e<<1;f=12968+(j<<2)|0;j=12968+(j+2<<2)|0;g=c[j>>2]|0;d=g+8|0;h=c[d>>2]|0;do{if((f|0)!=(h|0)){if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}k=h+12|0;if((c[k>>2]|0)==(g|0)){c[k>>2]=f;c[j>>2]=h;break}else{Mb()}}else{c[3232]=t&~(1<<e)}}while(0);h=e<<3;f=h-a|0;c[g+4>>2]=a|3;e=g+a|0;c[g+(a|4)>>2]=f|1;c[g+h>>2]=f;h=c[12936>>2]|0;if((h|0)!=0){g=c[12948>>2]|0;k=h>>>3;l=k<<1;h=12968+(l<<2)|0;j=c[3232]|0;k=1<<k;if((j&k|0)!=0){j=12968+(l+2<<2)|0;k=c[j>>2]|0;if(k>>>0<(c[12944>>2]|0)>>>0){Mb()}else{D=j;C=k}}else{c[3232]=j|k;D=12968+(l+2<<2)|0;C=h}c[D>>2]=g;c[C+12>>2]=g;c[g+8>>2]=C;c[g+12>>2]=h}c[12936>>2]=f;c[12948>>2]=e;H=d;i=b;return H|0}t=c[12932>>2]|0;if((t|0)!=0){d=(t&0-t)+ -1|0;G=d>>>12&16;d=d>>>G;F=d>>>5&8;d=d>>>F;H=d>>>2&4;d=d>>>H;h=d>>>1&2;d=d>>>h;e=d>>>1&1;e=c[13232+((F|G|H|h|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-a|0;h=e;while(1){g=c[h+16>>2]|0;if((g|0)==0){g=c[h+20>>2]|0;if((g|0)==0){break}}h=(c[g+4>>2]&-8)-a|0;f=h>>>0<d>>>0;d=f?h:d;h=g;e=f?g:e}h=c[12944>>2]|0;if(e>>>0<h>>>0){Mb()}f=e+a|0;if(!(e>>>0<f>>>0)){Mb()}g=c[e+24>>2]|0;j=c[e+12>>2]|0;do{if((j|0)==(e|0)){k=e+20|0;j=c[k>>2]|0;if((j|0)==0){k=e+16|0;j=c[k>>2]|0;if((j|0)==0){B=0;break}}while(1){m=j+20|0;l=c[m>>2]|0;if((l|0)!=0){j=l;k=m;continue}m=j+16|0;l=c[m>>2]|0;if((l|0)==0){break}else{j=l;k=m}}if(k>>>0<h>>>0){Mb()}else{c[k>>2]=0;B=j;break}}else{k=c[e+8>>2]|0;if(k>>>0<h>>>0){Mb()}h=k+12|0;if((c[h>>2]|0)!=(e|0)){Mb()}l=j+8|0;if((c[l>>2]|0)==(e|0)){c[h>>2]=j;c[l>>2]=k;B=j;break}else{Mb()}}}while(0);do{if((g|0)!=0){j=c[e+28>>2]|0;h=13232+(j<<2)|0;if((e|0)==(c[h>>2]|0)){c[h>>2]=B;if((B|0)==0){c[12932>>2]=c[12932>>2]&~(1<<j);break}}else{if(g>>>0<(c[12944>>2]|0)>>>0){Mb()}h=g+16|0;if((c[h>>2]|0)==(e|0)){c[h>>2]=B}else{c[g+20>>2]=B}if((B|0)==0){break}}if(B>>>0<(c[12944>>2]|0)>>>0){Mb()}c[B+24>>2]=g;g=c[e+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[B+16>>2]=g;c[g+24>>2]=B;break}}}while(0);g=c[e+20>>2]|0;if((g|0)!=0){if(g>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[B+20>>2]=g;c[g+24>>2]=B;break}}}}while(0);if(d>>>0<16){H=d+a|0;c[e+4>>2]=H|3;H=e+(H+4)|0;c[H>>2]=c[H>>2]|1}else{c[e+4>>2]=a|3;c[e+(a|4)>>2]=d|1;c[e+(d+a)>>2]=d;h=c[12936>>2]|0;if((h|0)!=0){g=c[12948>>2]|0;k=h>>>3;l=k<<1;h=12968+(l<<2)|0;j=c[3232]|0;k=1<<k;if((j&k|0)!=0){j=12968+(l+2<<2)|0;k=c[j>>2]|0;if(k>>>0<(c[12944>>2]|0)>>>0){Mb()}else{A=j;z=k}}else{c[3232]=j|k;A=12968+(l+2<<2)|0;z=h}c[A>>2]=g;c[z+12>>2]=g;c[g+8>>2]=z;c[g+12>>2]=h}c[12936>>2]=d;c[12948>>2]=f}H=e+8|0;i=b;return H|0}}}else{if(!(a>>>0>4294967231)){z=a+11|0;a=z&-8;B=c[12932>>2]|0;if((B|0)!=0){A=0-a|0;z=z>>>8;if((z|0)!=0){if(a>>>0>16777215){C=31}else{G=(z+1048320|0)>>>16&8;H=z<<G;F=(H+520192|0)>>>16&4;H=H<<F;C=(H+245760|0)>>>16&2;C=14-(F|G|C)+(H<<C>>>15)|0;C=a>>>(C+7|0)&1|C<<1}}else{C=0}F=c[13232+(C<<2)>>2]|0;a:do{if((F|0)==0){E=0;z=0}else{if((C|0)==31){z=0}else{z=25-(C>>>1)|0}E=0;D=a<<z;z=0;while(1){H=c[F+4>>2]&-8;G=H-a|0;if(G>>>0<A>>>0){if((H|0)==(a|0)){A=G;E=F;z=F;break a}else{A=G;z=F}}G=c[F+20>>2]|0;F=c[F+(D>>>31<<2)+16>>2]|0;E=(G|0)==0|(G|0)==(F|0)?E:G;if((F|0)==0){break}else{D=D<<1}}}}while(0);if((E|0)==0&(z|0)==0){H=2<<C;B=(H|0-H)&B;if((B|0)==0){break}H=(B&0-B)+ -1|0;D=H>>>12&16;H=H>>>D;C=H>>>5&8;H=H>>>C;F=H>>>2&4;H=H>>>F;G=H>>>1&2;H=H>>>G;E=H>>>1&1;E=c[13232+((C|D|F|G|E)+(H>>>E)<<2)>>2]|0}if((E|0)!=0){while(1){C=(c[E+4>>2]&-8)-a|0;B=C>>>0<A>>>0;A=B?C:A;z=B?E:z;B=c[E+16>>2]|0;if((B|0)!=0){E=B;continue}E=c[E+20>>2]|0;if((E|0)==0){break}}}if((z|0)!=0?A>>>0<((c[12936>>2]|0)-a|0)>>>0:0){f=c[12944>>2]|0;if(z>>>0<f>>>0){Mb()}d=z+a|0;if(!(z>>>0<d>>>0)){Mb()}e=c[z+24>>2]|0;h=c[z+12>>2]|0;do{if((h|0)==(z|0)){h=z+20|0;g=c[h>>2]|0;if((g|0)==0){h=z+16|0;g=c[h>>2]|0;if((g|0)==0){x=0;break}}while(1){k=g+20|0;j=c[k>>2]|0;if((j|0)!=0){g=j;h=k;continue}j=g+16|0;k=c[j>>2]|0;if((k|0)==0){break}else{g=k;h=j}}if(h>>>0<f>>>0){Mb()}else{c[h>>2]=0;x=g;break}}else{g=c[z+8>>2]|0;if(g>>>0<f>>>0){Mb()}j=g+12|0;if((c[j>>2]|0)!=(z|0)){Mb()}f=h+8|0;if((c[f>>2]|0)==(z|0)){c[j>>2]=h;c[f>>2]=g;x=h;break}else{Mb()}}}while(0);do{if((e|0)!=0){f=c[z+28>>2]|0;g=13232+(f<<2)|0;if((z|0)==(c[g>>2]|0)){c[g>>2]=x;if((x|0)==0){c[12932>>2]=c[12932>>2]&~(1<<f);break}}else{if(e>>>0<(c[12944>>2]|0)>>>0){Mb()}f=e+16|0;if((c[f>>2]|0)==(z|0)){c[f>>2]=x}else{c[e+20>>2]=x}if((x|0)==0){break}}if(x>>>0<(c[12944>>2]|0)>>>0){Mb()}c[x+24>>2]=e;e=c[z+16>>2]|0;do{if((e|0)!=0){if(e>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[x+16>>2]=e;c[e+24>>2]=x;break}}}while(0);e=c[z+20>>2]|0;if((e|0)!=0){if(e>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[x+20>>2]=e;c[e+24>>2]=x;break}}}}while(0);b:do{if(!(A>>>0<16)){c[z+4>>2]=a|3;c[z+(a|4)>>2]=A|1;c[z+(A+a)>>2]=A;f=A>>>3;if(A>>>0<256){h=f<<1;e=12968+(h<<2)|0;g=c[3232]|0;f=1<<f;if((g&f|0)!=0){g=12968+(h+2<<2)|0;f=c[g>>2]|0;if(f>>>0<(c[12944>>2]|0)>>>0){Mb()}else{w=g;v=f}}else{c[3232]=g|f;w=12968+(h+2<<2)|0;v=e}c[w>>2]=d;c[v+12>>2]=d;c[z+(a+8)>>2]=v;c[z+(a+12)>>2]=e;break}e=A>>>8;if((e|0)!=0){if(A>>>0>16777215){e=31}else{G=(e+1048320|0)>>>16&8;H=e<<G;F=(H+520192|0)>>>16&4;H=H<<F;e=(H+245760|0)>>>16&2;e=14-(F|G|e)+(H<<e>>>15)|0;e=A>>>(e+7|0)&1|e<<1}}else{e=0}h=13232+(e<<2)|0;c[z+(a+28)>>2]=e;c[z+(a+20)>>2]=0;c[z+(a+16)>>2]=0;f=c[12932>>2]|0;g=1<<e;if((f&g|0)==0){c[12932>>2]=f|g;c[h>>2]=d;c[z+(a+24)>>2]=h;c[z+(a+12)>>2]=d;c[z+(a+8)>>2]=d;break}f=c[h>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}c:do{if((c[f+4>>2]&-8|0)!=(A|0)){e=A<<e;while(1){h=f+(e>>>31<<2)+16|0;g=c[h>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(A|0)){t=g;break c}else{e=e<<1;f=g}}if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[h>>2]=d;c[z+(a+24)>>2]=f;c[z+(a+12)>>2]=d;c[z+(a+8)>>2]=d;break b}}else{t=f}}while(0);f=t+8|0;e=c[f>>2]|0;g=c[12944>>2]|0;if(t>>>0<g>>>0){Mb()}if(e>>>0<g>>>0){Mb()}else{c[e+12>>2]=d;c[f>>2]=d;c[z+(a+8)>>2]=e;c[z+(a+12)>>2]=t;c[z+(a+24)>>2]=0;break}}else{H=A+a|0;c[z+4>>2]=H|3;H=z+(H+4)|0;c[H>>2]=c[H>>2]|1}}while(0);H=z+8|0;i=b;return H|0}}}else{a=-1}}}while(0);t=c[12936>>2]|0;if(!(a>>>0>t>>>0)){e=t-a|0;d=c[12948>>2]|0;if(e>>>0>15){c[12948>>2]=d+a;c[12936>>2]=e;c[d+(a+4)>>2]=e|1;c[d+t>>2]=e;c[d+4>>2]=a|3}else{c[12936>>2]=0;c[12948>>2]=0;c[d+4>>2]=t|3;H=d+(t+4)|0;c[H>>2]=c[H>>2]|1}H=d+8|0;i=b;return H|0}t=c[12940>>2]|0;if(a>>>0<t>>>0){G=t-a|0;c[12940>>2]=G;H=c[12952>>2]|0;c[12952>>2]=H+a;c[H+(a+4)>>2]=G|1;c[H+4>>2]=a|3;H=H+8|0;i=b;return H|0}do{if((c[3350]|0)==0){t=Jb(30)|0;if((t+ -1&t|0)==0){c[13408>>2]=t;c[13404>>2]=t;c[13412>>2]=-1;c[13416>>2]=-1;c[13420>>2]=0;c[13372>>2]=0;c[3350]=(Wb(0)|0)&-16^1431655768;break}else{Mb()}}}while(0);v=a+48|0;A=c[13408>>2]|0;w=a+47|0;x=A+w|0;A=0-A|0;t=x&A;if(!(t>>>0>a>>>0)){H=0;i=b;return H|0}z=c[13368>>2]|0;if((z|0)!=0?(G=c[13360>>2]|0,H=G+t|0,H>>>0<=G>>>0|H>>>0>z>>>0):0){H=0;i=b;return H|0}d:do{if((c[13372>>2]&4|0)==0){B=c[12952>>2]|0;e:do{if((B|0)!=0){z=13376|0;while(1){C=c[z>>2]|0;if(!(C>>>0>B>>>0)?(y=z+4|0,(C+(c[y>>2]|0)|0)>>>0>B>>>0):0){break}z=c[z+8>>2]|0;if((z|0)==0){o=182;break e}}if((z|0)!=0){A=x-(c[12940>>2]|0)&A;if(A>>>0<2147483647){o=_a(A|0)|0;B=(o|0)==((c[z>>2]|0)+(c[y>>2]|0)|0);x=o;z=A;y=B?o:-1;A=B?A:0;o=191}else{A=0}}else{o=182}}else{o=182}}while(0);do{if((o|0)==182){y=_a(0)|0;if((y|0)!=(-1|0)){z=y;x=c[13404>>2]|0;A=x+ -1|0;if((A&z|0)==0){A=t}else{A=t-z+(A+z&0-x)|0}z=c[13360>>2]|0;B=z+A|0;if(A>>>0>a>>>0&A>>>0<2147483647){x=c[13368>>2]|0;if((x|0)!=0?B>>>0<=z>>>0|B>>>0>x>>>0:0){A=0;break}x=_a(A|0)|0;o=(x|0)==(y|0);z=A;y=o?y:-1;A=o?A:0;o=191}else{A=0}}else{A=0}}}while(0);f:do{if((o|0)==191){o=0-z|0;if((y|0)!=(-1|0)){s=y;p=A;o=202;break d}do{if((x|0)!=(-1|0)&z>>>0<2147483647&z>>>0<v>>>0?(u=c[13408>>2]|0,u=w-z+u&0-u,u>>>0<2147483647):0){if((_a(u|0)|0)==(-1|0)){_a(o|0)|0;break f}else{z=u+z|0;break}}}while(0);if((x|0)!=(-1|0)){s=x;p=z;o=202;break d}}}while(0);c[13372>>2]=c[13372>>2]|4;o=199}else{A=0;o=199}}while(0);if((((o|0)==199?t>>>0<2147483647:0)?(s=_a(t|0)|0,r=_a(0)|0,(r|0)!=(-1|0)&(s|0)!=(-1|0)&s>>>0<r>>>0):0)?(q=r-s|0,p=q>>>0>(a+40|0)>>>0,p):0){p=p?q:A;o=202}if((o|0)==202){q=(c[13360>>2]|0)+p|0;c[13360>>2]=q;if(q>>>0>(c[13364>>2]|0)>>>0){c[13364>>2]=q}q=c[12952>>2]|0;g:do{if((q|0)!=0){w=13376|0;while(1){r=c[w>>2]|0;u=w+4|0;v=c[u>>2]|0;if((s|0)==(r+v|0)){o=214;break}t=c[w+8>>2]|0;if((t|0)==0){break}else{w=t}}if(((o|0)==214?(c[w+12>>2]&8|0)==0:0)?q>>>0>=r>>>0&q>>>0<s>>>0:0){c[u>>2]=v+p;d=(c[12940>>2]|0)+p|0;e=q+8|0;if((e&7|0)==0){e=0}else{e=0-e&7}H=d-e|0;c[12952>>2]=q+e;c[12940>>2]=H;c[q+(e+4)>>2]=H|1;c[q+(d+4)>>2]=40;c[12956>>2]=c[13416>>2];break}if(s>>>0<(c[12944>>2]|0)>>>0){c[12944>>2]=s}u=s+p|0;r=13376|0;while(1){if((c[r>>2]|0)==(u|0)){o=224;break}t=c[r+8>>2]|0;if((t|0)==0){break}else{r=t}}if((o|0)==224?(c[r+12>>2]&8|0)==0:0){c[r>>2]=s;h=r+4|0;c[h>>2]=(c[h>>2]|0)+p;h=s+8|0;if((h&7|0)==0){h=0}else{h=0-h&7}j=s+(p+8)|0;if((j&7|0)==0){o=0}else{o=0-j&7}q=s+(o+p)|0;k=h+a|0;j=s+k|0;m=q-(s+h)-a|0;c[s+(h+4)>>2]=a|3;h:do{if((q|0)!=(c[12952>>2]|0)){if((q|0)==(c[12948>>2]|0)){H=(c[12936>>2]|0)+m|0;c[12936>>2]=H;c[12948>>2]=j;c[s+(k+4)>>2]=H|1;c[s+(H+k)>>2]=H;break}a=p+4|0;t=c[s+(o+a)>>2]|0;if((t&3|0)==1){n=t&-8;r=t>>>3;do{if(!(t>>>0<256)){l=c[s+((o|24)+p)>>2]|0;u=c[s+(p+12+o)>>2]|0;do{if((u|0)==(q|0)){u=o|16;t=s+(u+a)|0;r=c[t>>2]|0;if((r|0)==0){t=s+(u+p)|0;r=c[t>>2]|0;if((r|0)==0){g=0;break}}while(1){v=r+20|0;u=c[v>>2]|0;if((u|0)!=0){r=u;t=v;continue}u=r+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{r=v;t=u}}if(t>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[t>>2]=0;g=r;break}}else{t=c[s+((o|8)+p)>>2]|0;if(t>>>0<(c[12944>>2]|0)>>>0){Mb()}r=t+12|0;if((c[r>>2]|0)!=(q|0)){Mb()}v=u+8|0;if((c[v>>2]|0)==(q|0)){c[r>>2]=u;c[v>>2]=t;g=u;break}else{Mb()}}}while(0);if((l|0)!=0){r=c[s+(p+28+o)>>2]|0;t=13232+(r<<2)|0;if((q|0)==(c[t>>2]|0)){c[t>>2]=g;if((g|0)==0){c[12932>>2]=c[12932>>2]&~(1<<r);break}}else{if(l>>>0<(c[12944>>2]|0)>>>0){Mb()}r=l+16|0;if((c[r>>2]|0)==(q|0)){c[r>>2]=g}else{c[l+20>>2]=g}if((g|0)==0){break}}if(g>>>0<(c[12944>>2]|0)>>>0){Mb()}c[g+24>>2]=l;q=o|16;l=c[s+(q+p)>>2]|0;do{if((l|0)!=0){if(l>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[g+16>>2]=l;c[l+24>>2]=g;break}}}while(0);l=c[s+(q+a)>>2]|0;if((l|0)!=0){if(l>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[g+20>>2]=l;c[l+24>>2]=g;break}}}}else{g=c[s+((o|8)+p)>>2]|0;a=c[s+(p+12+o)>>2]|0;t=12968+(r<<1<<2)|0;if((g|0)!=(t|0)){if(g>>>0<(c[12944>>2]|0)>>>0){Mb()}if((c[g+12>>2]|0)!=(q|0)){Mb()}}if((a|0)==(g|0)){c[3232]=c[3232]&~(1<<r);break}if((a|0)!=(t|0)){if(a>>>0<(c[12944>>2]|0)>>>0){Mb()}r=a+8|0;if((c[r>>2]|0)==(q|0)){l=r}else{Mb()}}else{l=a+8|0}c[g+12>>2]=a;c[l>>2]=g}}while(0);q=s+((n|o)+p)|0;m=n+m|0}g=q+4|0;c[g>>2]=c[g>>2]&-2;c[s+(k+4)>>2]=m|1;c[s+(m+k)>>2]=m;g=m>>>3;if(m>>>0<256){m=g<<1;d=12968+(m<<2)|0;l=c[3232]|0;g=1<<g;if((l&g|0)!=0){l=12968+(m+2<<2)|0;g=c[l>>2]|0;if(g>>>0<(c[12944>>2]|0)>>>0){Mb()}else{e=l;f=g}}else{c[3232]=l|g;e=12968+(m+2<<2)|0;f=d}c[e>>2]=j;c[f+12>>2]=j;c[s+(k+8)>>2]=f;c[s+(k+12)>>2]=d;break}e=m>>>8;if((e|0)!=0){if(m>>>0>16777215){e=31}else{G=(e+1048320|0)>>>16&8;H=e<<G;F=(H+520192|0)>>>16&4;H=H<<F;e=(H+245760|0)>>>16&2;e=14-(F|G|e)+(H<<e>>>15)|0;e=m>>>(e+7|0)&1|e<<1}}else{e=0}f=13232+(e<<2)|0;c[s+(k+28)>>2]=e;c[s+(k+20)>>2]=0;c[s+(k+16)>>2]=0;l=c[12932>>2]|0;g=1<<e;if((l&g|0)==0){c[12932>>2]=l|g;c[f>>2]=j;c[s+(k+24)>>2]=f;c[s+(k+12)>>2]=j;c[s+(k+8)>>2]=j;break}f=c[f>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}i:do{if((c[f+4>>2]&-8|0)!=(m|0)){e=m<<e;while(1){g=f+(e>>>31<<2)+16|0;l=c[g>>2]|0;if((l|0)==0){break}if((c[l+4>>2]&-8|0)==(m|0)){d=l;break i}else{e=e<<1;f=l}}if(g>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[g>>2]=j;c[s+(k+24)>>2]=f;c[s+(k+12)>>2]=j;c[s+(k+8)>>2]=j;break h}}else{d=f}}while(0);f=d+8|0;e=c[f>>2]|0;g=c[12944>>2]|0;if(d>>>0<g>>>0){Mb()}if(e>>>0<g>>>0){Mb()}else{c[e+12>>2]=j;c[f>>2]=j;c[s+(k+8)>>2]=e;c[s+(k+12)>>2]=d;c[s+(k+24)>>2]=0;break}}else{H=(c[12940>>2]|0)+m|0;c[12940>>2]=H;c[12952>>2]=j;c[s+(k+4)>>2]=H|1}}while(0);H=s+(h|8)|0;i=b;return H|0}e=13376|0;while(1){d=c[e>>2]|0;if(!(d>>>0>q>>>0)?(n=c[e+4>>2]|0,m=d+n|0,m>>>0>q>>>0):0){break}e=c[e+8>>2]|0}e=d+(n+ -39)|0;if((e&7|0)==0){e=0}else{e=0-e&7}d=d+(n+ -47+e)|0;d=d>>>0<(q+16|0)>>>0?q:d;e=d+8|0;f=s+8|0;if((f&7|0)==0){f=0}else{f=0-f&7}H=p+ -40-f|0;c[12952>>2]=s+f;c[12940>>2]=H;c[s+(f+4)>>2]=H|1;c[s+(p+ -36)>>2]=40;c[12956>>2]=c[13416>>2];c[d+4>>2]=27;c[e+0>>2]=c[13376>>2];c[e+4>>2]=c[13380>>2];c[e+8>>2]=c[13384>>2];c[e+12>>2]=c[13388>>2];c[13376>>2]=s;c[13380>>2]=p;c[13388>>2]=0;c[13384>>2]=e;f=d+28|0;c[f>>2]=7;if((d+32|0)>>>0<m>>>0){while(1){e=f+4|0;c[e>>2]=7;if((f+8|0)>>>0<m>>>0){f=e}else{break}}}if((d|0)!=(q|0)){d=d-q|0;e=q+(d+4)|0;c[e>>2]=c[e>>2]&-2;c[q+4>>2]=d|1;c[q+d>>2]=d;e=d>>>3;if(d>>>0<256){f=e<<1;d=12968+(f<<2)|0;g=c[3232]|0;e=1<<e;if((g&e|0)!=0){f=12968+(f+2<<2)|0;e=c[f>>2]|0;if(e>>>0<(c[12944>>2]|0)>>>0){Mb()}else{j=f;k=e}}else{c[3232]=g|e;j=12968+(f+2<<2)|0;k=d}c[j>>2]=q;c[k+12>>2]=q;c[q+8>>2]=k;c[q+12>>2]=d;break}e=d>>>8;if((e|0)!=0){if(d>>>0>16777215){e=31}else{G=(e+1048320|0)>>>16&8;H=e<<G;F=(H+520192|0)>>>16&4;H=H<<F;e=(H+245760|0)>>>16&2;e=14-(F|G|e)+(H<<e>>>15)|0;e=d>>>(e+7|0)&1|e<<1}}else{e=0}j=13232+(e<<2)|0;c[q+28>>2]=e;c[q+20>>2]=0;c[q+16>>2]=0;f=c[12932>>2]|0;g=1<<e;if((f&g|0)==0){c[12932>>2]=f|g;c[j>>2]=q;c[q+24>>2]=j;c[q+12>>2]=q;c[q+8>>2]=q;break}f=c[j>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}j:do{if((c[f+4>>2]&-8|0)!=(d|0)){e=d<<e;while(1){j=f+(e>>>31<<2)+16|0;g=c[j>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(d|0)){h=g;break j}else{e=e<<1;f=g}}if(j>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[j>>2]=q;c[q+24>>2]=f;c[q+12>>2]=q;c[q+8>>2]=q;break g}}else{h=f}}while(0);f=h+8|0;e=c[f>>2]|0;d=c[12944>>2]|0;if(h>>>0<d>>>0){Mb()}if(e>>>0<d>>>0){Mb()}else{c[e+12>>2]=q;c[f>>2]=q;c[q+8>>2]=e;c[q+12>>2]=h;c[q+24>>2]=0;break}}}else{H=c[12944>>2]|0;if((H|0)==0|s>>>0<H>>>0){c[12944>>2]=s}c[13376>>2]=s;c[13380>>2]=p;c[13388>>2]=0;c[12964>>2]=c[3350];c[12960>>2]=-1;d=0;do{H=d<<1;G=12968+(H<<2)|0;c[12968+(H+3<<2)>>2]=G;c[12968+(H+2<<2)>>2]=G;d=d+1|0}while((d|0)!=32);d=s+8|0;if((d&7|0)==0){d=0}else{d=0-d&7}H=p+ -40-d|0;c[12952>>2]=s+d;c[12940>>2]=H;c[s+(d+4)>>2]=H|1;c[s+(p+ -36)>>2]=40;c[12956>>2]=c[13416>>2]}}while(0);d=c[12940>>2]|0;if(d>>>0>a>>>0){G=d-a|0;c[12940>>2]=G;H=c[12952>>2]|0;c[12952>>2]=H+a;c[H+(a+4)>>2]=G|1;c[H+4>>2]=a|3;H=H+8|0;i=b;return H|0}}c[(Bb()|0)>>2]=12;H=0;i=b;return H|0}function gk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;b=i;if((a|0)==0){i=b;return}q=a+ -8|0;r=c[12944>>2]|0;if(q>>>0<r>>>0){Mb()}o=c[a+ -4>>2]|0;n=o&3;if((n|0)==1){Mb()}j=o&-8;h=a+(j+ -8)|0;do{if((o&1|0)==0){u=c[q>>2]|0;if((n|0)==0){i=b;return}q=-8-u|0;o=a+q|0;n=u+j|0;if(o>>>0<r>>>0){Mb()}if((o|0)==(c[12948>>2]|0)){d=a+(j+ -4)|0;if((c[d>>2]&3|0)!=3){d=o;m=n;break}c[12936>>2]=n;c[d>>2]=c[d>>2]&-2;c[a+(q+4)>>2]=n|1;c[h>>2]=n;i=b;return}t=u>>>3;if(u>>>0<256){d=c[a+(q+8)>>2]|0;m=c[a+(q+12)>>2]|0;p=12968+(t<<1<<2)|0;if((d|0)!=(p|0)){if(d>>>0<r>>>0){Mb()}if((c[d+12>>2]|0)!=(o|0)){Mb()}}if((m|0)==(d|0)){c[3232]=c[3232]&~(1<<t);d=o;m=n;break}if((m|0)!=(p|0)){if(m>>>0<r>>>0){Mb()}p=m+8|0;if((c[p>>2]|0)==(o|0)){s=p}else{Mb()}}else{s=m+8|0}c[d+12>>2]=m;c[s>>2]=d;d=o;m=n;break}s=c[a+(q+24)>>2]|0;t=c[a+(q+12)>>2]|0;do{if((t|0)==(o|0)){u=a+(q+20)|0;t=c[u>>2]|0;if((t|0)==0){u=a+(q+16)|0;t=c[u>>2]|0;if((t|0)==0){p=0;break}}while(1){w=t+20|0;v=c[w>>2]|0;if((v|0)!=0){t=v;u=w;continue}v=t+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{t=w;u=v}}if(u>>>0<r>>>0){Mb()}else{c[u>>2]=0;p=t;break}}else{u=c[a+(q+8)>>2]|0;if(u>>>0<r>>>0){Mb()}r=u+12|0;if((c[r>>2]|0)!=(o|0)){Mb()}v=t+8|0;if((c[v>>2]|0)==(o|0)){c[r>>2]=t;c[v>>2]=u;p=t;break}else{Mb()}}}while(0);if((s|0)!=0){t=c[a+(q+28)>>2]|0;r=13232+(t<<2)|0;if((o|0)==(c[r>>2]|0)){c[r>>2]=p;if((p|0)==0){c[12932>>2]=c[12932>>2]&~(1<<t);d=o;m=n;break}}else{if(s>>>0<(c[12944>>2]|0)>>>0){Mb()}r=s+16|0;if((c[r>>2]|0)==(o|0)){c[r>>2]=p}else{c[s+20>>2]=p}if((p|0)==0){d=o;m=n;break}}if(p>>>0<(c[12944>>2]|0)>>>0){Mb()}c[p+24>>2]=s;r=c[a+(q+16)>>2]|0;do{if((r|0)!=0){if(r>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[p+16>>2]=r;c[r+24>>2]=p;break}}}while(0);q=c[a+(q+20)>>2]|0;if((q|0)!=0){if(q>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[p+20>>2]=q;c[q+24>>2]=p;d=o;m=n;break}}else{d=o;m=n}}else{d=o;m=n}}else{d=q;m=j}}while(0);if(!(d>>>0<h>>>0)){Mb()}n=a+(j+ -4)|0;o=c[n>>2]|0;if((o&1|0)==0){Mb()}if((o&2|0)==0){if((h|0)==(c[12952>>2]|0)){w=(c[12940>>2]|0)+m|0;c[12940>>2]=w;c[12952>>2]=d;c[d+4>>2]=w|1;if((d|0)!=(c[12948>>2]|0)){i=b;return}c[12948>>2]=0;c[12936>>2]=0;i=b;return}if((h|0)==(c[12948>>2]|0)){w=(c[12936>>2]|0)+m|0;c[12936>>2]=w;c[12948>>2]=d;c[d+4>>2]=w|1;c[d+w>>2]=w;i=b;return}m=(o&-8)+m|0;n=o>>>3;do{if(!(o>>>0<256)){l=c[a+(j+16)>>2]|0;q=c[a+(j|4)>>2]|0;do{if((q|0)==(h|0)){o=a+(j+12)|0;n=c[o>>2]|0;if((n|0)==0){o=a+(j+8)|0;n=c[o>>2]|0;if((n|0)==0){k=0;break}}while(1){p=n+20|0;q=c[p>>2]|0;if((q|0)!=0){n=q;o=p;continue}p=n+16|0;q=c[p>>2]|0;if((q|0)==0){break}else{n=q;o=p}}if(o>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[o>>2]=0;k=n;break}}else{o=c[a+j>>2]|0;if(o>>>0<(c[12944>>2]|0)>>>0){Mb()}p=o+12|0;if((c[p>>2]|0)!=(h|0)){Mb()}n=q+8|0;if((c[n>>2]|0)==(h|0)){c[p>>2]=q;c[n>>2]=o;k=q;break}else{Mb()}}}while(0);if((l|0)!=0){n=c[a+(j+20)>>2]|0;o=13232+(n<<2)|0;if((h|0)==(c[o>>2]|0)){c[o>>2]=k;if((k|0)==0){c[12932>>2]=c[12932>>2]&~(1<<n);break}}else{if(l>>>0<(c[12944>>2]|0)>>>0){Mb()}n=l+16|0;if((c[n>>2]|0)==(h|0)){c[n>>2]=k}else{c[l+20>>2]=k}if((k|0)==0){break}}if(k>>>0<(c[12944>>2]|0)>>>0){Mb()}c[k+24>>2]=l;h=c[a+(j+8)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[k+16>>2]=h;c[h+24>>2]=k;break}}}while(0);h=c[a+(j+12)>>2]|0;if((h|0)!=0){if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[k+20>>2]=h;c[h+24>>2]=k;break}}}}else{k=c[a+j>>2]|0;a=c[a+(j|4)>>2]|0;j=12968+(n<<1<<2)|0;if((k|0)!=(j|0)){if(k>>>0<(c[12944>>2]|0)>>>0){Mb()}if((c[k+12>>2]|0)!=(h|0)){Mb()}}if((a|0)==(k|0)){c[3232]=c[3232]&~(1<<n);break}if((a|0)!=(j|0)){if(a>>>0<(c[12944>>2]|0)>>>0){Mb()}j=a+8|0;if((c[j>>2]|0)==(h|0)){l=j}else{Mb()}}else{l=a+8|0}c[k+12>>2]=a;c[l>>2]=k}}while(0);c[d+4>>2]=m|1;c[d+m>>2]=m;if((d|0)==(c[12948>>2]|0)){c[12936>>2]=m;i=b;return}}else{c[n>>2]=o&-2;c[d+4>>2]=m|1;c[d+m>>2]=m}h=m>>>3;if(m>>>0<256){a=h<<1;e=12968+(a<<2)|0;j=c[3232]|0;h=1<<h;if((j&h|0)!=0){h=12968+(a+2<<2)|0;a=c[h>>2]|0;if(a>>>0<(c[12944>>2]|0)>>>0){Mb()}else{f=h;g=a}}else{c[3232]=j|h;f=12968+(a+2<<2)|0;g=e}c[f>>2]=d;c[g+12>>2]=d;c[d+8>>2]=g;c[d+12>>2]=e;i=b;return}f=m>>>8;if((f|0)!=0){if(m>>>0>16777215){f=31}else{v=(f+1048320|0)>>>16&8;w=f<<v;u=(w+520192|0)>>>16&4;w=w<<u;f=(w+245760|0)>>>16&2;f=14-(u|v|f)+(w<<f>>>15)|0;f=m>>>(f+7|0)&1|f<<1}}else{f=0}g=13232+(f<<2)|0;c[d+28>>2]=f;c[d+20>>2]=0;c[d+16>>2]=0;a=c[12932>>2]|0;h=1<<f;a:do{if((a&h|0)!=0){g=c[g>>2]|0;if((f|0)==31){f=0}else{f=25-(f>>>1)|0}b:do{if((c[g+4>>2]&-8|0)!=(m|0)){f=m<<f;a=g;while(1){h=a+(f>>>31<<2)+16|0;g=c[h>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(m|0)){e=g;break b}else{f=f<<1;a=g}}if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[h>>2]=d;c[d+24>>2]=a;c[d+12>>2]=d;c[d+8>>2]=d;break a}}else{e=g}}while(0);g=e+8|0;f=c[g>>2]|0;h=c[12944>>2]|0;if(e>>>0<h>>>0){Mb()}if(f>>>0<h>>>0){Mb()}else{c[f+12>>2]=d;c[g>>2]=d;c[d+8>>2]=f;c[d+12>>2]=e;c[d+24>>2]=0;break}}else{c[12932>>2]=a|h;c[g>>2]=d;c[d+24>>2]=g;c[d+12>>2]=d;c[d+8>>2]=d}}while(0);w=(c[12960>>2]|0)+ -1|0;c[12960>>2]=w;if((w|0)==0){d=13384|0}else{i=b;return}while(1){d=c[d>>2]|0;if((d|0)==0){break}else{d=d+8|0}}c[12960>>2]=-1;i=b;return}function hk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;if((a|0)==0){r=fk(b)|0;i=d;return r|0}if(b>>>0>4294967231){c[(Bb()|0)>>2]=12;r=0;i=d;return r|0}if(b>>>0<11){f=16}else{f=b+11&-8}e=a+ -4|0;k=c[e>>2]|0;l=k&-8;o=l+ -8|0;h=a+o|0;m=c[12944>>2]|0;if((a+ -8|0)>>>0<m>>>0){Mb()}r=k&3;if(!((r|0)!=1&(o|0)>-8)){Mb()}o=l|4;q=a+(o+ -8)|0;p=c[q>>2]|0;if((p&1|0)==0){Mb()}do{if((r|0)==0){if(!(f>>>0<256|l>>>0<(f|4)>>>0)?!((l-f|0)>>>0>c[13408>>2]<<1>>>0):0){r=a;i=d;return r|0}}else{if(!(l>>>0<f>>>0)){g=l-f|0;if(!(g>>>0>15)){r=a;i=d;return r|0}c[e>>2]=k&1|f|2;c[a+((f|4)+ -8)>>2]=g|3;c[q>>2]=c[q>>2]|1;ik(a+(f+ -8)|0,g);r=a;i=d;return r|0}if((h|0)==(c[12952>>2]|0)){g=(c[12940>>2]|0)+l|0;if(!(g>>>0>f>>>0)){break}r=g-f|0;c[e>>2]=k&1|f|2;c[a+((f|4)+ -8)>>2]=r|1;c[12952>>2]=a+(f+ -8);c[12940>>2]=r;r=a;i=d;return r|0}if((h|0)==(c[12948>>2]|0)){g=(c[12936>>2]|0)+l|0;if(g>>>0<f>>>0){break}h=g-f|0;if(h>>>0>15){c[e>>2]=k&1|f|2;c[a+((f|4)+ -8)>>2]=h|1;c[a+(g+ -8)>>2]=h;e=a+(g+ -4)|0;c[e>>2]=c[e>>2]&-2;e=a+(f+ -8)|0}else{c[e>>2]=k&1|g|2;e=a+(g+ -4)|0;c[e>>2]=c[e>>2]|1;e=0;h=0}c[12936>>2]=h;c[12948>>2]=e;r=a;i=d;return r|0}if((p&2|0)==0?(g=(p&-8)+l|0,!(g>>>0<f>>>0)):0){k=g-f|0;b=p>>>3;do{if(!(p>>>0<256)){n=c[a+(l+16)>>2]|0;o=c[a+o>>2]|0;do{if((o|0)==(h|0)){o=a+(l+12)|0;b=c[o>>2]|0;if((b|0)==0){o=a+(l+8)|0;b=c[o>>2]|0;if((b|0)==0){j=0;break}}while(1){q=b+20|0;p=c[q>>2]|0;if((p|0)!=0){b=p;o=q;continue}q=b+16|0;p=c[q>>2]|0;if((p|0)==0){break}else{b=p;o=q}}if(o>>>0<m>>>0){Mb()}else{c[o>>2]=0;j=b;break}}else{b=c[a+l>>2]|0;if(b>>>0<m>>>0){Mb()}m=b+12|0;if((c[m>>2]|0)!=(h|0)){Mb()}p=o+8|0;if((c[p>>2]|0)==(h|0)){c[m>>2]=o;c[p>>2]=b;j=o;break}else{Mb()}}}while(0);if((n|0)!=0){m=c[a+(l+20)>>2]|0;b=13232+(m<<2)|0;if((h|0)==(c[b>>2]|0)){c[b>>2]=j;if((j|0)==0){c[12932>>2]=c[12932>>2]&~(1<<m);break}}else{if(n>>>0<(c[12944>>2]|0)>>>0){Mb()}m=n+16|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=j}else{c[n+20>>2]=j}if((j|0)==0){break}}if(j>>>0<(c[12944>>2]|0)>>>0){Mb()}c[j+24>>2]=n;h=c[a+(l+8)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[j+16>>2]=h;c[h+24>>2]=j;break}}}while(0);h=c[a+(l+12)>>2]|0;if((h|0)!=0){if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[j+20>>2]=h;c[h+24>>2]=j;break}}}}else{j=c[a+l>>2]|0;l=c[a+o>>2]|0;o=12968+(b<<1<<2)|0;if((j|0)!=(o|0)){if(j>>>0<m>>>0){Mb()}if((c[j+12>>2]|0)!=(h|0)){Mb()}}if((l|0)==(j|0)){c[3232]=c[3232]&~(1<<b);break}if((l|0)!=(o|0)){if(l>>>0<m>>>0){Mb()}m=l+8|0;if((c[m>>2]|0)==(h|0)){n=m}else{Mb()}}else{n=l+8|0}c[j+12>>2]=l;c[n>>2]=j}}while(0);if(k>>>0<16){c[e>>2]=g|c[e>>2]&1|2;r=a+((g|4)+ -8)|0;c[r>>2]=c[r>>2]|1;r=a;i=d;return r|0}else{c[e>>2]=c[e>>2]&1|f|2;c[a+((f|4)+ -8)>>2]=k|3;r=a+((g|4)+ -8)|0;c[r>>2]=c[r>>2]|1;ik(a+(f+ -8)|0,k);r=a;i=d;return r|0}}}}while(0);f=fk(b)|0;if((f|0)==0){r=0;i=d;return r|0}r=c[e>>2]|0;e=(r&-8)-((r&3|0)==0?8:4)|0;vk(f|0,a|0,(e>>>0<b>>>0?e:b)|0)|0;gk(a);r=f;i=d;return r|0}function ik(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;h=a+b|0;l=c[a+4>>2]|0;do{if((l&1|0)==0){p=c[a>>2]|0;if((l&3|0)==0){i=d;return}l=a+(0-p)|0;m=p+b|0;q=c[12944>>2]|0;if(l>>>0<q>>>0){Mb()}if((l|0)==(c[12948>>2]|0)){e=a+(b+4)|0;if((c[e>>2]&3|0)!=3){e=l;n=m;break}c[12936>>2]=m;c[e>>2]=c[e>>2]&-2;c[a+(4-p)>>2]=m|1;c[h>>2]=m;i=d;return}s=p>>>3;if(p>>>0<256){e=c[a+(8-p)>>2]|0;n=c[a+(12-p)>>2]|0;o=12968+(s<<1<<2)|0;if((e|0)!=(o|0)){if(e>>>0<q>>>0){Mb()}if((c[e+12>>2]|0)!=(l|0)){Mb()}}if((n|0)==(e|0)){c[3232]=c[3232]&~(1<<s);e=l;n=m;break}if((n|0)!=(o|0)){if(n>>>0<q>>>0){Mb()}o=n+8|0;if((c[o>>2]|0)==(l|0)){r=o}else{Mb()}}else{r=n+8|0}c[e+12>>2]=n;c[r>>2]=e;e=l;n=m;break}r=c[a+(24-p)>>2]|0;t=c[a+(12-p)>>2]|0;do{if((t|0)==(l|0)){u=16-p|0;t=a+(u+4)|0;s=c[t>>2]|0;if((s|0)==0){t=a+u|0;s=c[t>>2]|0;if((s|0)==0){o=0;break}}while(1){u=s+20|0;v=c[u>>2]|0;if((v|0)!=0){s=v;t=u;continue}v=s+16|0;u=c[v>>2]|0;if((u|0)==0){break}else{s=u;t=v}}if(t>>>0<q>>>0){Mb()}else{c[t>>2]=0;o=s;break}}else{s=c[a+(8-p)>>2]|0;if(s>>>0<q>>>0){Mb()}u=s+12|0;if((c[u>>2]|0)!=(l|0)){Mb()}q=t+8|0;if((c[q>>2]|0)==(l|0)){c[u>>2]=t;c[q>>2]=s;o=t;break}else{Mb()}}}while(0);if((r|0)!=0){q=c[a+(28-p)>>2]|0;s=13232+(q<<2)|0;if((l|0)==(c[s>>2]|0)){c[s>>2]=o;if((o|0)==0){c[12932>>2]=c[12932>>2]&~(1<<q);e=l;n=m;break}}else{if(r>>>0<(c[12944>>2]|0)>>>0){Mb()}q=r+16|0;if((c[q>>2]|0)==(l|0)){c[q>>2]=o}else{c[r+20>>2]=o}if((o|0)==0){e=l;n=m;break}}if(o>>>0<(c[12944>>2]|0)>>>0){Mb()}c[o+24>>2]=r;p=16-p|0;q=c[a+p>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[o+16>>2]=q;c[q+24>>2]=o;break}}}while(0);p=c[a+(p+4)>>2]|0;if((p|0)!=0){if(p>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[o+20>>2]=p;c[p+24>>2]=o;e=l;n=m;break}}else{e=l;n=m}}else{e=l;n=m}}else{e=a;n=b}}while(0);l=c[12944>>2]|0;if(h>>>0<l>>>0){Mb()}m=a+(b+4)|0;o=c[m>>2]|0;if((o&2|0)==0){if((h|0)==(c[12952>>2]|0)){v=(c[12940>>2]|0)+n|0;c[12940>>2]=v;c[12952>>2]=e;c[e+4>>2]=v|1;if((e|0)!=(c[12948>>2]|0)){i=d;return}c[12948>>2]=0;c[12936>>2]=0;i=d;return}if((h|0)==(c[12948>>2]|0)){v=(c[12936>>2]|0)+n|0;c[12936>>2]=v;c[12948>>2]=e;c[e+4>>2]=v|1;c[e+v>>2]=v;i=d;return}n=(o&-8)+n|0;m=o>>>3;do{if(!(o>>>0<256)){k=c[a+(b+24)>>2]|0;m=c[a+(b+12)>>2]|0;do{if((m|0)==(h|0)){o=a+(b+20)|0;m=c[o>>2]|0;if((m|0)==0){o=a+(b+16)|0;m=c[o>>2]|0;if((m|0)==0){j=0;break}}while(1){q=m+20|0;p=c[q>>2]|0;if((p|0)!=0){m=p;o=q;continue}p=m+16|0;q=c[p>>2]|0;if((q|0)==0){break}else{m=q;o=p}}if(o>>>0<l>>>0){Mb()}else{c[o>>2]=0;j=m;break}}else{o=c[a+(b+8)>>2]|0;if(o>>>0<l>>>0){Mb()}l=o+12|0;if((c[l>>2]|0)!=(h|0)){Mb()}p=m+8|0;if((c[p>>2]|0)==(h|0)){c[l>>2]=m;c[p>>2]=o;j=m;break}else{Mb()}}}while(0);if((k|0)!=0){l=c[a+(b+28)>>2]|0;m=13232+(l<<2)|0;if((h|0)==(c[m>>2]|0)){c[m>>2]=j;if((j|0)==0){c[12932>>2]=c[12932>>2]&~(1<<l);break}}else{if(k>>>0<(c[12944>>2]|0)>>>0){Mb()}l=k+16|0;if((c[l>>2]|0)==(h|0)){c[l>>2]=j}else{c[k+20>>2]=j}if((j|0)==0){break}}if(j>>>0<(c[12944>>2]|0)>>>0){Mb()}c[j+24>>2]=k;h=c[a+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[j+16>>2]=h;c[h+24>>2]=j;break}}}while(0);h=c[a+(b+20)>>2]|0;if((h|0)!=0){if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}else{c[j+20>>2]=h;c[h+24>>2]=j;break}}}}else{j=c[a+(b+8)>>2]|0;a=c[a+(b+12)>>2]|0;b=12968+(m<<1<<2)|0;if((j|0)!=(b|0)){if(j>>>0<l>>>0){Mb()}if((c[j+12>>2]|0)!=(h|0)){Mb()}}if((a|0)==(j|0)){c[3232]=c[3232]&~(1<<m);break}if((a|0)!=(b|0)){if(a>>>0<l>>>0){Mb()}b=a+8|0;if((c[b>>2]|0)==(h|0)){k=b}else{Mb()}}else{k=a+8|0}c[j+12>>2]=a;c[k>>2]=j}}while(0);c[e+4>>2]=n|1;c[e+n>>2]=n;if((e|0)==(c[12948>>2]|0)){c[12936>>2]=n;i=d;return}}else{c[m>>2]=o&-2;c[e+4>>2]=n|1;c[e+n>>2]=n}a=n>>>3;if(n>>>0<256){b=a<<1;h=12968+(b<<2)|0;j=c[3232]|0;a=1<<a;if((j&a|0)!=0){b=12968+(b+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[12944>>2]|0)>>>0){Mb()}else{g=b;f=a}}else{c[3232]=j|a;g=12968+(b+2<<2)|0;f=h}c[g>>2]=e;c[f+12>>2]=e;c[e+8>>2]=f;c[e+12>>2]=h;i=d;return}f=n>>>8;if((f|0)!=0){if(n>>>0>16777215){f=31}else{u=(f+1048320|0)>>>16&8;v=f<<u;t=(v+520192|0)>>>16&4;v=v<<t;f=(v+245760|0)>>>16&2;f=14-(t|u|f)+(v<<f>>>15)|0;f=n>>>(f+7|0)&1|f<<1}}else{f=0}a=13232+(f<<2)|0;c[e+28>>2]=f;c[e+20>>2]=0;c[e+16>>2]=0;h=c[12932>>2]|0;g=1<<f;if((h&g|0)==0){c[12932>>2]=h|g;c[a>>2]=e;c[e+24>>2]=a;c[e+12>>2]=e;c[e+8>>2]=e;i=d;return}g=c[a>>2]|0;if((f|0)==31){f=0}else{f=25-(f>>>1)|0}a:do{if((c[g+4>>2]&-8|0)!=(n|0)){f=n<<f;a=g;while(1){h=a+(f>>>31<<2)+16|0;g=c[h>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(n|0)){break a}else{f=f<<1;a=g}}if(h>>>0<(c[12944>>2]|0)>>>0){Mb()}c[h>>2]=e;c[e+24>>2]=a;c[e+12>>2]=e;c[e+8>>2]=e;i=d;return}}while(0);f=g+8|0;a=c[f>>2]|0;h=c[12944>>2]|0;if(g>>>0<h>>>0){Mb()}if(a>>>0<h>>>0){Mb()}c[a+12>>2]=e;c[f>>2]=e;c[e+8>>2]=a;c[e+12>>2]=g;c[e+24>>2]=0;i=d;return}function jk(a){a=a|0;var b=0;b=i;yb(a|0);if((a|0)!=0){gk(a)}i=b;return}function kk(a){a=a|0;var b=0;b=i;yb(a|0);i=b;return}function lk(a){a=a|0;return 13456}



function mk(b,e){b=b|0;e=e|0;var f=0,g=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,I=0,J=0,K=0.0,L=0.0,M=0.0,N=0.0;f=i;i=i+512|0;l=f;if((e|0)==0){e=24;j=-149}else if((e|0)==1){e=53;j=-1074}else if((e|0)==2){e=53;j=-1074}else{M=0.0;i=f;return+M}o=b+4|0;p=b+100|0;do{g=c[o>>2]|0;if(g>>>0<(c[p>>2]|0)>>>0){c[o>>2]=g+1;z=d[g]|0}else{z=ok(b)|0}}while((Tb(z|0)|0)!=0);do{if((z|0)==43|(z|0)==45){g=1-(((z|0)==45)<<1)|0;u=c[o>>2]|0;if(u>>>0<(c[p>>2]|0)>>>0){c[o>>2]=u+1;z=d[u]|0;break}else{z=ok(b)|0;break}}else{g=1}}while(0);u=0;do{if((z|32|0)!=(a[13504+u|0]|0)){break}do{if(u>>>0<7){v=c[o>>2]|0;if(v>>>0<(c[p>>2]|0)>>>0){c[o>>2]=v+1;z=d[v]|0;break}else{z=ok(b)|0;break}}}while(0);u=u+1|0}while(u>>>0<8);do{if((u|0)==3){q=23}else if((u|0)!=8){if(!(u>>>0<4)){if((u|0)==8){break}else{q=23;break}}a:do{if((u|0)==0){u=0;do{if((z|32|0)!=(a[13520+u|0]|0)){break a}do{if(u>>>0<2){t=c[o>>2]|0;if(t>>>0<(c[p>>2]|0)>>>0){c[o>>2]=t+1;z=d[t]|0;break}else{z=ok(b)|0;break}}}while(0);u=u+1|0}while(u>>>0<3)}}while(0);if((u|0)==0){do{if((z|0)==48){t=c[o>>2]|0;if(t>>>0<(c[p>>2]|0)>>>0){c[o>>2]=t+1;t=d[t]|0}else{t=ok(b)|0}if((t|32|0)!=120){if((c[p>>2]|0)==0){z=48;break}c[o>>2]=(c[o>>2]|0)+ -1;z=48;break}l=c[o>>2]|0;if(l>>>0<(c[p>>2]|0)>>>0){c[o>>2]=l+1;C=d[l]|0;A=0}else{C=ok(b)|0;A=0}while(1){if((C|0)==46){q=66;break}else if((C|0)!=48){l=0;t=0;u=0;v=0;z=0;B=0;G=1.0;y=0;s=0.0;break}l=c[o>>2]|0;if(l>>>0<(c[p>>2]|0)>>>0){c[o>>2]=l+1;C=d[l]|0;A=1;continue}else{C=ok(b)|0;A=1;continue}}b:do{if((q|0)==66){l=c[o>>2]|0;if(l>>>0<(c[p>>2]|0)>>>0){c[o>>2]=l+1;C=d[l]|0}else{C=ok(b)|0}if((C|0)==48){u=-1;v=-1;while(1){l=c[o>>2]|0;if(l>>>0<(c[p>>2]|0)>>>0){c[o>>2]=l+1;C=d[l]|0}else{C=ok(b)|0}if((C|0)!=48){l=0;t=0;A=1;z=1;B=0;G=1.0;y=0;s=0.0;break b}J=tk(u|0,v|0,-1,-1)|0;u=J;v=H}}else{l=0;t=0;u=0;v=0;z=1;B=0;G=1.0;y=0;s=0.0}}}while(0);c:while(1){E=C+ -48|0;do{if(!(E>>>0<10)){F=C|32;D=(C|0)==46;if(!((F+ -97|0)>>>0<6|D)){break c}if(D){if((z|0)==0){u=t;v=l;z=1;break}else{C=46;break c}}else{E=(C|0)>57?F+ -87|0:E;q=80;break}}else{q=80}}while(0);if((q|0)==80){q=0;do{if(!((l|0)<0|(l|0)==0&t>>>0<8)){if((l|0)<0|(l|0)==0&t>>>0<14){M=G*.0625;K=M;s=s+M*+(E|0);break}if((E|0)!=0&(B|0)==0){B=1;K=G;s=s+G*.5}else{K=G}}else{K=G;y=E+(y<<4)|0}}while(0);t=tk(t|0,l|0,1,0)|0;l=H;A=1;G=K}C=c[o>>2]|0;if(C>>>0<(c[p>>2]|0)>>>0){c[o>>2]=C+1;C=d[C]|0;continue}else{C=ok(b)|0;continue}}if((A|0)==0){if((c[p>>2]|0)!=0?(r=c[o>>2]|0,c[o>>2]=r+ -2,(z|0)!=0):0){c[o>>2]=r+ -3}M=+(g|0)*0.0;i=f;return+M}r=(z|0)==0;q=r?t:u;r=r?l:v;if((l|0)<0|(l|0)==0&t>>>0<8){do{y=y<<4;t=tk(t|0,l|0,1,0)|0;l=H}while((l|0)<0|(l|0)==0&t>>>0<8)}if(!((C|32|0)==112?(n=nk(b)|0,m=H,!((n|0)==0&(m|0)==-2147483648)):0)){if((c[p>>2]|0)==0){n=0;m=0}else{c[o>>2]=(c[o>>2]|0)+ -1;n=0;m=0}}l=wk(q|0,r|0,2)|0;l=tk(l|0,H|0,-32,-1)|0;l=tk(l|0,H|0,n|0,m|0)|0;m=H;if((y|0)==0){M=+(g|0)*0.0;i=f;return+M}if((m|0)>0|(m|0)==0&l>>>0>(0-j|0)>>>0){c[(Bb()|0)>>2]=34;M=+(g|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=f;return+M}J=j+ -106|0;I=((J|0)<0)<<31>>31;if((m|0)<(I|0)|(m|0)==(I|0)&l>>>0<J>>>0){c[(Bb()|0)>>2]=34;M=+(g|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=f;return+M}if((y|0)>-1){do{y=y<<1;if(!(s>=.5)){G=s}else{G=s+-1.0;y=y|1}s=s+G;l=tk(l|0,m|0,-1,-1)|0;m=H}while((y|0)>-1)}j=sk(32,0,j|0,((j|0)<0)<<31>>31|0)|0;j=tk(l|0,m|0,j|0,H|0)|0;J=H;if(0>(J|0)|0==(J|0)&e>>>0>j>>>0){e=(j|0)<0?0:j}if((e|0)<53){j=84-e|0;if((j|0)>1023){m=j+ -1023|0;if((m|0)>1023){j=j+ -2046|0;j=(j|0)>1023?1023:j;K=x}else{j=m;K=8.98846567431158e+307}}else{if((j|0)<-1022){m=j+1022|0;if((m|0)<-1022){j=j+2044|0;j=(j|0)<-1022?-1022:j;K=0.0}else{j=m;K=2.2250738585072014e-308}}else{K=1.0}}I=wk(j+1023|0,0,52)|0;J=H;c[k>>2]=I;c[k+4>>2]=J;G=+(g|0);K=+Fb(+(K*+h[k>>3]),+G);if((e|0)<32&s!=0.0){J=y&1;y=(J^1)+y|0;s=(J|0)==0?0.0:s}}else{G=+(g|0);K=0.0}s=G*s+(K+G*+(y>>>0))-K;if(!(s!=0.0)){c[(Bb()|0)>>2]=34}if((l|0)>1023){s=s*8.98846567431158e+307;e=l+ -1023|0;if((e|0)>1023){e=l+ -2046|0;l=(e|0)>1023?1023:e;s=s*8.98846567431158e+307}else{l=e}}else{if((l|0)<-1022){s=s*2.2250738585072014e-308;e=l+1022|0;if((e|0)<-1022){e=l+2044|0;l=(e|0)<-1022?-1022:e;s=s*2.2250738585072014e-308}else{l=e}}}I=wk(l+1023|0,0,52)|0;J=H;c[k>>2]=I;c[k+4>>2]=J;M=s*+h[k>>3];i=f;return+M}}while(0);n=j+e|0;m=0-n|0;A=0;while(1){if((z|0)==46){q=141;break}else if((z|0)!=48){E=0;B=0;y=0;break}r=c[o>>2]|0;if(r>>>0<(c[p>>2]|0)>>>0){c[o>>2]=r+1;z=d[r]|0;A=1;continue}else{z=ok(b)|0;A=1;continue}}d:do{if((q|0)==141){r=c[o>>2]|0;if(r>>>0<(c[p>>2]|0)>>>0){c[o>>2]=r+1;z=d[r]|0}else{z=ok(b)|0}if((z|0)==48){E=-1;B=-1;while(1){r=c[o>>2]|0;if(r>>>0<(c[p>>2]|0)>>>0){c[o>>2]=r+1;z=d[r]|0}else{z=ok(b)|0}if((z|0)!=48){A=1;y=1;break d}J=tk(E|0,B|0,-1,-1)|0;E=J;B=H}}else{E=0;B=0;y=1}}}while(0);c[l>>2]=0;F=z+ -48|0;I=(z|0)==46;e:do{if(F>>>0<10|I){r=l+496|0;D=0;C=0;v=0;u=0;t=0;while(1){do{if(I){if((y|0)==0){E=D;B=C;y=1}else{break e}}else{J=tk(D|0,C|0,1,0)|0;C=H;I=(z|0)!=48;if((u|0)>=125){if(!I){D=J;break}c[r>>2]=c[r>>2]|1;D=J;break}A=l+(u<<2)|0;if((v|0)!=0){F=z+ -48+((c[A>>2]|0)*10|0)|0}c[A>>2]=F;v=v+1|0;z=(v|0)==9;D=J;A=1;v=z?0:v;u=(z&1)+u|0;t=I?J:t}}while(0);z=c[o>>2]|0;if(z>>>0<(c[p>>2]|0)>>>0){c[o>>2]=z+1;z=d[z]|0}else{z=ok(b)|0}F=z+ -48|0;I=(z|0)==46;if(!(F>>>0<10|I)){q=164;break}}}else{D=0;C=0;v=0;u=0;t=0;q=164}}while(0);if((q|0)==164){q=(y|0)==0;E=q?D:E;B=q?C:B}q=(A|0)!=0;if(q?(z|32|0)==101:0){r=nk(b)|0;y=H;if((r|0)==0&(y|0)==-2147483648){if((c[p>>2]|0)==0){r=0;y=0}else{c[o>>2]=(c[o>>2]|0)+ -1;r=0;y=0}}E=tk(r|0,y|0,E|0,B|0)|0;B=H}else{if((z|0)>-1?(c[p>>2]|0)!=0:0){c[o>>2]=(c[o>>2]|0)+ -1}}if(!q){c[(Bb()|0)>>2]=22;c[b+104>>2]=0;J=c[b+8>>2]|0;c[b+108>>2]=J-(c[o>>2]|0);c[p>>2]=J;M=0.0;i=f;return+M}o=c[l>>2]|0;if((o|0)==0){M=+(g|0)*0.0;i=f;return+M}do{if((E|0)==(D|0)&(B|0)==(C|0)&((C|0)<0|(C|0)==0&D>>>0<10)){if(!(e>>>0>30)?(o>>>e|0)!=0:0){break}M=+(g|0)*+(o>>>0);i=f;return+M}}while(0);J=(j|0)/-2|0;I=((J|0)<0)<<31>>31;if((B|0)>(I|0)|(B|0)==(I|0)&E>>>0>J>>>0){c[(Bb()|0)>>2]=34;M=+(g|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=f;return+M}J=j+ -106|0;I=((J|0)<0)<<31>>31;if((B|0)<(I|0)|(B|0)==(I|0)&E>>>0<J>>>0){c[(Bb()|0)>>2]=34;M=+(g|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=f;return+M}if((v|0)!=0){if((v|0)<9){o=l+(u<<2)|0;b=c[o>>2]|0;do{b=b*10|0;v=v+1|0}while((v|0)!=9);c[o>>2]=b}u=u+1|0}do{if((t|0)<9?(t|0)<=(E|0)&(E|0)<18:0){if((E|0)==9){M=+(g|0)*+((c[l>>2]|0)>>>0);i=f;return+M}if((E|0)<9){M=+(g|0)*+((c[l>>2]|0)>>>0)/+(c[13536+(8-E<<2)>>2]|0);i=f;return+M}b=e+27+(da(E,-3)|0)|0;o=c[l>>2]|0;if((b|0)<=30?(o>>>b|0)!=0:0){break}M=+(g|0)*+(o>>>0)*+(c[13536+(E+ -10<<2)>>2]|0);i=f;return+M}}while(0);o=(E|0)%9|0;if((o|0)==0){o=0;b=0;p=E}else{p=(E|0)>-1?o:o+9|0;b=c[13536+(8-p<<2)>>2]|0;if((u|0)!=0){q=1e9/(b|0)|0;o=0;v=0;t=0;while(1){I=l+(t<<2)|0;r=c[I>>2]|0;J=((r>>>0)/(b>>>0)|0)+v|0;c[I>>2]=J;v=da((r>>>0)%(b>>>0)|0,q)|0;r=t+1|0;if((t|0)==(o|0)&(J|0)==0){o=r&127;E=E+ -9|0}if((r|0)==(u|0)){break}else{t=r}}if((v|0)!=0){c[l+(u<<2)>>2]=v;u=u+1|0}}else{o=0;u=0}b=0;p=9-p+E|0}f:while(1){q=l+(o<<2)|0;if((p|0)<18){do{t=0;q=u+127|0;while(1){q=q&127;r=l+(q<<2)|0;v=wk(c[r>>2]|0,0,29)|0;v=tk(v|0,H|0,t|0,0)|0;t=H;if(t>>>0>0|(t|0)==0&v>>>0>1e9){J=Fk(v|0,t|0,1e9,0)|0;v=Gk(v|0,t|0,1e9,0)|0;t=J}else{t=0}c[r>>2]=v;r=(q|0)==(o|0);if(!((q|0)!=(u+127&127|0)|r)){u=(v|0)==0?q:u}if(r){break}else{q=q+ -1|0}}b=b+ -29|0}while((t|0)==0)}else{if((p|0)!=18){break}do{if(!((c[q>>2]|0)>>>0<9007199)){p=18;break f}t=0;r=u+127|0;while(1){r=r&127;v=l+(r<<2)|0;y=wk(c[v>>2]|0,0,29)|0;y=tk(y|0,H|0,t|0,0)|0;t=H;if(t>>>0>0|(t|0)==0&y>>>0>1e9){J=Fk(y|0,t|0,1e9,0)|0;y=Gk(y|0,t|0,1e9,0)|0;t=J}else{t=0}c[v>>2]=y;v=(r|0)==(o|0);if(!((r|0)!=(u+127&127|0)|v)){u=(y|0)==0?r:u}if(v){break}else{r=r+ -1|0}}b=b+ -29|0}while((t|0)==0)}o=o+127&127;if((o|0)==(u|0)){J=u+127&127;u=l+((u+126&127)<<2)|0;c[u>>2]=c[u>>2]|c[l+(J<<2)>>2];u=J}c[l+(o<<2)>>2]=t;p=p+9|0}g:while(1){q=u+1&127;r=l+((u+127&127)<<2)|0;while(1){v=(p|0)==18;t=(p|0)>27?9:1;while(1){y=0;while(1){z=y+o&127;if((z|0)==(u|0)){y=2;break}z=c[l+(z<<2)>>2]|0;B=c[13528+(y<<2)>>2]|0;if(z>>>0<B>>>0){y=2;break}A=y+1|0;if(z>>>0>B>>>0){break}if((A|0)<2){y=A}else{y=A;break}}if((y|0)==2&v){break g}b=b+t|0;if((o|0)==(u|0)){o=u}else{break}}z=(1<<t)+ -1|0;y=1e9>>>t;A=o;v=0;do{I=l+(o<<2)|0;J=c[I>>2]|0;B=(J>>>t)+v|0;c[I>>2]=B;v=da(J&z,y)|0;B=(o|0)==(A|0)&(B|0)==0;o=o+1&127;p=B?p+ -9|0:p;A=B?o:A}while((o|0)!=(u|0));if((v|0)==0){o=A;continue}if((q|0)!=(A|0)){break}c[r>>2]=c[r>>2]|1;o=A}c[l+(u<<2)>>2]=v;o=A;u=q}p=o&127;if((p|0)==(u|0)){c[l+(q+ -1<<2)>>2]=0;u=q}G=+((c[l+(p<<2)>>2]|0)>>>0);p=o+1&127;if((p|0)==(u|0)){u=u+1&127;c[l+(u+ -1<<2)>>2]=0}s=+(g|0);G=s*(G*1.0e9+ +((c[l+(p<<2)>>2]|0)>>>0));g=b+53|0;j=g-j|0;if((j|0)<(e|0)){e=(j|0)<0?0:j;p=1}else{p=0}if((e|0)<53){q=105-e|0;if((q|0)>1023){r=q+ -1023|0;if((r|0)>1023){q=q+ -2046|0;q=(q|0)>1023?1023:q;K=x}else{q=r;K=8.98846567431158e+307}}else{if((q|0)<-1022){r=q+1022|0;if((r|0)<-1022){q=q+2044|0;q=(q|0)<-1022?-1022:q;K=0.0}else{q=r;K=2.2250738585072014e-308}}else{K=1.0}}J=wk(q+1023|0,0,52)|0;q=H;c[k>>2]=J;c[k+4>>2]=q;K=+Fb(+(K*+h[k>>3]),+G);q=53-e|0;if((q|0)>1023){r=q+ -1023|0;if((r|0)>1023){q=q+ -2046|0;q=(q|0)>1023?1023:q;L=x}else{q=r;L=8.98846567431158e+307}}else{if((q|0)<-1022){r=q+1022|0;if((r|0)<-1022){q=q+2044|0;q=(q|0)<-1022?-1022:q;L=0.0}else{q=r;L=2.2250738585072014e-308}}else{L=1.0}}I=wk(q+1023|0,0,52)|0;J=H;c[k>>2]=I;c[k+4>>2]=J;N=+Ia(+G,+(L*+h[k>>3]));L=K;M=N;G=K+(G-N)}else{L=0.0;M=0.0}q=o+2&127;if((q|0)!=(u|0)){l=c[l+(q<<2)>>2]|0;do{if(!(l>>>0<5e8)){if(l>>>0>5e8){M=s*.75+M;break}if((o+3&127|0)==(u|0)){M=s*.5+M;break}else{M=s*.75+M;break}}else{if((l|0)==0?(o+3&127|0)==(u|0):0){break}M=s*.25+M}}while(0);if((53-e|0)>1?!(+Ia(+M,1.0)!=0.0):0){M=M+1.0}}s=G+M-L;do{if((g&2147483647|0)>(-2-n|0)){if(+S(+s)>=9007199254740992.0){p=(p|0)!=0&(e|0)==(j|0)?0:p;b=b+1|0;s=s*.5}if((b+50|0)<=(m|0)?!((p|0)!=0&M!=0.0):0){break}c[(Bb()|0)>>2]=34}}while(0);if((b|0)>1023){s=s*8.98846567431158e+307;e=b+ -1023|0;if((e|0)>1023){e=b+ -2046|0;b=(e|0)>1023?1023:e;s=s*8.98846567431158e+307}else{b=e}}else{if((b|0)<-1022){s=s*2.2250738585072014e-308;e=b+1022|0;if((e|0)<-1022){e=b+2044|0;b=(e|0)<-1022?-1022:e;s=s*2.2250738585072014e-308}else{b=e}}}I=wk(b+1023|0,0,52)|0;J=H;c[k>>2]=I;c[k+4>>2]=J;N=s*+h[k>>3];i=f;return+N}else if((u|0)==3){e=c[o>>2]|0;if(e>>>0<(c[p>>2]|0)>>>0){c[o>>2]=e+1;e=d[e]|0}else{e=ok(b)|0}if((e|0)==40){e=1}else{if((c[p>>2]|0)==0){N=w;i=f;return+N}c[o>>2]=(c[o>>2]|0)+ -1;N=w;i=f;return+N}while(1){g=c[o>>2]|0;if(g>>>0<(c[p>>2]|0)>>>0){c[o>>2]=g+1;g=d[g]|0}else{g=ok(b)|0}if(!((g+ -48|0)>>>0<10|(g+ -65|0)>>>0<26)?!((g+ -97|0)>>>0<26|(g|0)==95):0){break}e=e+1|0}if((g|0)==41){N=w;i=f;return+N}if((c[p>>2]|0)==0){N=w;i=f;return+N}g=(c[o>>2]|0)+ -1|0;c[o>>2]=g;if((e|0)==0){N=w;i=f;return+N}do{e=e+ -1|0;g=g+ -1|0}while((e|0)!=0);c[o>>2]=g;N=w;i=f;return+N}else{e=c[o>>2]|0;if((c[p>>2]|0)!=0){e=e+ -1|0;c[o>>2]=e}c[(Bb()|0)>>2]=22;c[b+104>>2]=0;J=c[b+8>>2]|0;c[b+108>>2]=J-e;c[p>>2]=J;N=0.0;i=f;return+N}}}while(0);if(((q|0)==23?(c[p>>2]|0)!=0:0)?(t=c[o>>2]|0,c[o>>2]=t+ -1,!(u>>>0<4)):0){c[o>>2]=t+(3-u+ -1)}N=+(g|0)*x;i=f;return+N}function nk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;f=a+4|0;g=c[f>>2]|0;e=a+100|0;if(g>>>0<(c[e>>2]|0)>>>0){c[f>>2]=g+1;k=d[g]|0}else{k=ok(a)|0}if((k|0)==43|(k|0)==45){g=(k|0)==45|0;h=c[f>>2]|0;if(h>>>0<(c[e>>2]|0)>>>0){c[f>>2]=h+1;k=d[h]|0}else{k=ok(a)|0}if(!((k+ -48|0)>>>0<10)?(c[e>>2]|0)!=0:0){c[f>>2]=(c[f>>2]|0)+ -1}}else{g=0}if((k+ -48|0)>>>0>9){if((c[e>>2]|0)==0){k=-2147483648;l=0;H=k;i=b;return l|0}c[f>>2]=(c[f>>2]|0)+ -1;k=-2147483648;l=0;H=k;i=b;return l|0}else{h=-48}while(1){h=h+k|0;j=c[f>>2]|0;if(j>>>0<(c[e>>2]|0)>>>0){c[f>>2]=j+1;k=d[j]|0}else{k=ok(a)|0}l=(k+ -48|0)>>>0<10;if(!(l&(h|0)<214748364)){break}h=(h*10|0)+ -48|0}j=((h|0)<0)<<31>>31;if(l){do{h=Ek(h|0,j|0,10,0)|0;h=tk(h|0,H|0,-48,-1)|0;h=tk(h|0,H|0,k|0,((k|0)<0)<<31>>31|0)|0;j=H;k=c[f>>2]|0;if(k>>>0<(c[e>>2]|0)>>>0){c[f>>2]=k+1;k=d[k]|0}else{k=ok(a)|0}}while((k+ -48|0)>>>0<10&((j|0)<21474836|(j|0)==21474836&h>>>0<2061584302))}if((k+ -48|0)>>>0<10){do{k=c[f>>2]|0;if(k>>>0<(c[e>>2]|0)>>>0){c[f>>2]=k+1;k=d[k]|0}else{k=ok(a)|0}}while((k+ -48|0)>>>0<10)}if((c[e>>2]|0)!=0){c[f>>2]=(c[f>>2]|0)+ -1}e=(g|0)!=0;a=sk(0,0,h|0,j|0)|0;f=e?H:j;l=e?a:h;H=f;i=b;return l|0}function ok(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+16|0;h=d;f=b+104|0;j=c[f>>2]|0;if(!((j|0)!=0?(c[b+108>>2]|0)>=(j|0):0)){g=3}a:do{if((g|0)==3){g=b+8|0;do{if((c[g>>2]|0)==0){k=b+74|0;j=a[k]|0;a[k]=j+255|j;k=b+20|0;j=b+44|0;if((c[k>>2]|0)>>>0>(c[j>>2]|0)>>>0){Zb[c[b+36>>2]&31](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[k>>2]=0;k=c[b>>2]|0;if((k&20|0)==0){k=c[j>>2]|0;c[g>>2]=k;c[b+4>>2]=k;break}if((k&4|0)==0){break a}c[b>>2]=k|32;break a}}while(0);if((Zb[c[b+32>>2]&31](b,h,1)|0)==1){h=a[h]|0;j=h&255;f=c[f>>2]|0;k=c[g>>2]|0;g=c[b+4>>2]|0;if((f|0)!=0?(e=f-(c[b+108>>2]|0)+ -1|0,(k-g|0)>(e|0)):0){c[b+100>>2]=g+e}else{c[b+100>>2]=k}if((k|0)!=0){f=b+108|0;c[f>>2]=k+1-g+(c[f>>2]|0)}b=g+ -1|0;if((a[b]|0)==h<<24>>24){k=j;i=d;return k|0}a[b]=h;k=j;i=d;return k|0}}}while(0);c[b+100>>2]=0;k=-1;i=d;return k|0}function pk(){c[374]=o;c[400]=o;c[3144]=o;c[3374]=o}function qk(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function rk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function sk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b=b-d-(c>>>0>a>>>0|0)>>>0;return(H=b,a-c>>>0|0)|0}function tk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return(H=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function uk(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function vk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return eb(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function wk(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){H=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}H=a<<c-32;return 0}function xk(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{vk(b,c,d)|0}return b|0}function yk(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){H=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}H=0;return b>>>c-32|0}function zk(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){H=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}H=(b|0)<0?-1:0;return b>>c-32|0}function Ak(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function Bk(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;d=b&65535;c=da(d,f)|0;e=a>>>16;d=(c>>>16)+(da(d,e)|0)|0;b=b>>>16;a=da(b,f)|0;return(H=(d>>>16)+(da(b,e)|0)+(((d&65535)+a|0)>>>16)|0,d+a<<16|c&65535|0)|0}function Ck(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;a=sk(e^a,f^b,e,f)|0;b=H;e=g^e;f=h^f;g=sk((Hk(a,b,sk(g^c,h^d,g,h)|0,H,0)|0)^e,H^f,e,f)|0;return g|0}function Dk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=sk(h^a,j^b,h,j)|0;b=H;Hk(a,b,sk(k^d,l^e,k,l)|0,H,f)|0;k=sk(c[f>>2]^h,c[f+4>>2]^j,h,j)|0;j=H;i=g;return(H=j,k)|0}function Ek(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;a=Bk(e,f)|0;c=H;return(H=(da(b,f)|0)+(da(d,e)|0)+c|c&0,a|0|0)|0}function Fk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=Hk(a,b,c,d,0)|0;return a|0}function Gk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+8|0;f=g|0;Hk(a,b,d,e,f)|0;i=g;return(H=c[f+4>>2]|0,c[f>>2]|0)|0}function Hk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=a;j=b;i=j;k=d;g=e;l=g;if((i|0)==0){d=(f|0)!=0;if((l|0)==0){if(d){c[f>>2]=(h>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(h>>>0)/(k>>>0)>>>0;return(H=l,m)|0}else{if(!d){l=0;m=0;return(H=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;l=0;m=0;return(H=l,m)|0}}m=(l|0)==0;do{if((k|0)!=0){if(!m){k=(uk(l|0)|0)-(uk(i|0)|0)|0;if(k>>>0<=31){l=k+1|0;m=31-k|0;b=k-31>>31;j=l;a=h>>>(l>>>0)&b|i<<m;b=i>>>(l>>>0)&b;l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(H=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(H=l,m)|0}l=k-1|0;if((l&k|0)!=0){m=(uk(k|0)|0)+33-(uk(i|0)|0)|0;p=64-m|0;k=32-m|0;n=k>>31;o=m-32|0;b=o>>31;j=m;a=k-1>>31&i>>>(o>>>0)|(i<<k|h>>>(m>>>0))&b;b=b&i>>>(m>>>0);l=h<<p&n;i=(i<<p|h>>>(o>>>0))&n|h<<k&m-33>>31;break}if((f|0)!=0){c[f>>2]=l&h;c[f+4>>2]=0}if((k|0)==1){o=j|b&0;p=a|0|0;return(H=o,p)|0}else{p=Ak(k|0)|0;o=i>>>(p>>>0)|0;p=i<<32-p|h>>>(p>>>0)|0;return(H=o,p)|0}}else{if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(k>>>0);c[f+4>>2]=0}o=0;p=(i>>>0)/(k>>>0)>>>0;return(H=o,p)|0}if((h|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}o=0;p=(i>>>0)/(l>>>0)>>>0;return(H=o,p)|0}k=l-1|0;if((k&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=k&i|b&0}o=0;p=i>>>((Ak(l|0)|0)>>>0);return(H=o,p)|0}k=(uk(l|0)|0)-(uk(i|0)|0)|0;if(k>>>0<=30){b=k+1|0;p=31-k|0;j=b;a=i<<p|h>>>(b>>>0);b=i>>>(b>>>0);l=0;i=h<<p;break}if((f|0)==0){o=0;p=0;return(H=o,p)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;o=0;p=0;return(H=o,p)|0}}while(0);if((j|0)==0){m=a;d=0;a=0}else{d=d|0|0;g=g|e&0;e=tk(d,g,-1,-1)|0;h=H;k=b;m=a;a=0;while(1){b=l>>>31|i<<1;l=a|l<<1;i=m<<1|i>>>31|0;k=m>>>31|k<<1|0;sk(e,h,i,k)|0;m=H;p=m>>31|((m|0)<0?-1:0)<<1;a=p&1;m=sk(i,k,p&d,(((m|0)<0?-1:0)>>31|((m|0)<0?-1:0)<<1)&g)|0;k=H;j=j-1|0;if((j|0)==0){break}else{i=b}}i=b;b=k;d=0}g=0;if((f|0)!=0){c[f>>2]=m;c[f+4>>2]=b}o=(l|0)>>>31|(i|g)<<1|(g<<1|l>>>31)&0|d;p=(l<<1|0>>>31)&-2|a;return(H=o,p)|0}function Ik(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Zb[a&31](b|0,c|0,d|0)|0}function Jk(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;_b[a&63](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Kk(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;$b[a&3](b|0,c|0,d|0,e|0,f|0)}function Lk(a,b){a=a|0;b=b|0;ac[a&127](b|0)}function Mk(a,b,c){a=a|0;b=b|0;c=c|0;bc[a&63](b|0,c|0)}function Nk(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;cc[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function Ok(a,b){a=a|0;b=b|0;return dc[a&63](b|0)|0}function Pk(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ec[a&3](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function Qk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;fc[a&0](b|0,c|0,d|0)}function Rk(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;gc[a&7](b|0,c|0,d|0,e|0,f|0,+g)}function Sk(a){a=a|0;hc[a&0]()}function Tk(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return ic[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function Uk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return jc[a&7](b|0,c|0,d|0,e|0)|0}function Vk(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;kc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Wk(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;lc[a&15](b|0,c|0,d|0,e|0,f|0,g|0)}function Xk(a,b,c){a=a|0;b=b|0;c=c|0;return mc[a&15](b|0,c|0)|0}function Yk(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return nc[a&15](b|0,c|0,d|0,e|0,f|0)|0}function Zk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;oc[a&7](b|0,c|0,d|0,e|0)}function _k(a,b,c){a=a|0;b=b|0;c=c|0;ea(0);return 0}function $k(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ea(1)}function al(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ea(2)}function bl(a){a=a|0;ea(3)}function cl(a,b){a=a|0;b=b|0;ea(4)}function dl(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ea(5)}function el(a){a=a|0;ea(6);return 0}function fl(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ea(7)}function gl(a,b,c){a=a|0;b=b|0;c=c|0;ea(8)}function hl(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ea(9)}function il(){ea(10)}function jl(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ea(11);return 0}function kl(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ea(12);return 0}function ll(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ea(13)}function ml(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ea(14)}function nl(a,b){a=a|0;b=b|0;ea(15);return 0}function ol(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ea(16);return 0}function pl(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ea(17)}




// EMSCRIPTEN_END_FUNCS
var Zb=[_k,Vd,_d,Pc,ce,Hd,Md,ad,Qd,Ae,Fe,Jh,Oh,mi,oi,ri,Zh,ci,ei,hi,Xj,_k,_k,_k,_k,_k,_k,_k,_k,_k,_k,_k];var _b=[$k,Ie,Ke,Le,Me,Ne,Oe,Pe,Qe,Re,Se,Te,Ye,_e,$e,af,bf,cf,df,ef,ff,gf,hf,xf,zf,Lf,Nf,Wf,Xf,Yf,Zf,_f,fg,gg,hg,ig,jg,Ah,Gh,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k,$k];var $b=[al,bk,ak,$j];var ac=[bl,Lc,Mc,Rc,Sc,Yc,Zc,cd,dd,ld,kd,od,nd,qd,rd,Fd,Ed,Td,Sd,fe,ee,he,ge,je,ie,le,ke,ne,me,pe,oe,re,qe,te,se,Dd,ue,we,ve,Wh,Ce,Be,He,Ge,Xe,We,rf,qf,Gf,Ff,Uf,Tf,dg,cg,ng,mg,qg,pg,tg,sg,Eg,Dg,Pg,Og,_g,Zg,jh,ih,rh,qh,wh,vh,Ch,Bh,Ih,Hh,Nh,Mh,Th,Sh,ki,ji,Rh,Bi,aj,$i,cj,bj,xe,Vh,Yh,ti,Ji,Ri,Zi,_i,Pj,Oj,Rj,Uj,Sj,Tj,Vj,Wj,kk,jk,Xh,lh,gk,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl];var bc=[cl,Nc,Tc,_c,ed,Gd,Ud,wg,xg,yg,zg,Bg,Cg,Hg,Ig,Jg,Kg,Mg,Ng,Sg,Tg,Ug,Vg,Xg,Yg,bh,ch,dh,eh,gh,hh,Lh,Qh,hj,jj,lj,ij,kj,mj,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl,cl];var cc=[dl,$f,kg,dl];var dc=[el,Oc,Zd,$d,ae,Yd,Uc,Vc,$c,Ld,Nd,Od,Kd,fd,gd,md,pd,Vf,nj,pj,rj,xj,zj,tj,vj,eg,oj,qj,sj,yj,Aj,uj,wj,ug,vg,Ag,Fg,Gg,Lg,Qg,Rg,Wg,$g,ah,fh,Fi,Gi,Ii,dj,fj,ej,gj,xi,yi,Ai,Ni,Oi,Qi,Vi,Wi,Yi,Qj,lk,el];var ec=[fl,xh,Dh,fl];var fc=[gl];var gc=[hl,Af,Df,Of,Qf,hl,hl,hl];var hc=[il];var ic=[jl,Ci,Di,ui,vi,Ki,Li,Si,Ti,jl,jl,jl,jl,jl,jl,jl];var jc=[kl,qi,_h,$h,ai,gi,kl,kl];var kc=[ll,og,rg,kh,oh,sh,uh,ll];var lc=[ml,Wd,Id,sf,tf,yf,Ef,Hf,If,Mf,Rf,Kh,Ph,ek,dk,ck];var mc=[nl,be,Qc,Wc,de,Pd,bd,hd,Rd,li,ni,pi,bi,di,fi,nl];var nc=[ol,ye,De,si,Ei,Hi,ii,wi,zi,Mi,Pi,Ui,Xi,ol,ol,ol];var oc=[pl,Xd,Jd,ze,Ee,Yj,Zj,_j];return{_strlen:qk,_free:gk,_realloc:hk,_i64Add:tk,_memmove:xk,_i64Subtract:sk,_memset:rk,_malloc:fk,_memcpy:vk,_llvm_ctlz_i32:uk,_c_best_direction:Fc,_bitshift64Shl:wk,__GLOBAL__I_a:jd,runPostSets:pk,stackAlloc:pc,stackSave:qc,stackRestore:rc,setThrew:sc,setTempRet0:vc,setTempRet1:wc,setTempRet2:xc,setTempRet3:yc,setTempRet4:zc,setTempRet5:Ac,setTempRet6:Bc,setTempRet7:Cc,setTempRet8:Dc,setTempRet9:Ec,dynCall_iiii:Ik,dynCall_viiiiiii:Jk,dynCall_viiiii:Kk,dynCall_vi:Lk,dynCall_vii:Mk,dynCall_viiiiiiiii:Nk,dynCall_ii:Ok,dynCall_viiiiiid:Pk,dynCall_viii:Qk,dynCall_viiiiid:Rk,dynCall_v:Sk,dynCall_iiiiiiiii:Tk,dynCall_iiiii:Uk,dynCall_viiiiiiii:Vk,dynCall_viiiiii:Wk,dynCall_iii:Xk,dynCall_iiiiii:Yk,dynCall_viiii:Zk}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiii": invoke_iiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_ii": invoke_ii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viii": invoke_viii, "invoke_viiiiid": invoke_viiiiid, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_fabs": _fabs, "_pthread_cond_wait": _pthread_cond_wait, "_send": _send, "_strtoll_l": _strtoll_l, "_vsscanf": _vsscanf, "___ctype_b_loc": ___ctype_b_loc, "__ZSt9terminatev": __ZSt9terminatev, "_fmod": _fmod, "___cxa_guard_acquire": ___cxa_guard_acquire, "_sscanf": _sscanf, "___cxa_is_number_type": ___cxa_is_number_type, "_ungetc": _ungetc, "__getFloat": __getFloat, "___cxa_allocate_exception": ___cxa_allocate_exception, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_ceilf": _ceilf, "_isxdigit_l": _isxdigit_l, "_strtoll": _strtoll, "_fflush": _fflush, "___cxa_guard_release": ___cxa_guard_release, "__addDays": __addDays, "_pwrite": _pwrite, "_strftime_l": _strftime_l, "__scanString": __scanString, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_uselocale": _uselocale, "_catgets": _catgets, "_newlocale": _newlocale, "_snprintf": _snprintf, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_pread": _pread, "___resumeException": ___resumeException, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_freelocale": _freelocale, "_strtoull": _strtoull, "_strftime": _strftime, "_strtoull_l": _strtoull_l, "__arraySum": __arraySum, "___ctype_tolower_loc": ___ctype_tolower_loc, "_isdigit_l": _isdigit_l, "_asprintf": _asprintf, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_fread": _fread, "_isxdigit": _isxdigit, "___ctype_toupper_loc": ___ctype_toupper_loc, "_pthread_mutex_lock": _pthread_mutex_lock, "__reallyNegative": __reallyNegative, "_vasprintf": _vasprintf, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "_write": _write, "__isLeapYear": __isLeapYear, "___errno_location": ___errno_location, "_recv": _recv, "_vsnprintf": _vsnprintf, "__exit": __exit, "_copysign": _copysign, "_fgetc": _fgetc, "_mkport": _mkport, "___cxa_does_inherit": ___cxa_does_inherit, "_sysconf": _sysconf, "_pthread_cond_broadcast": _pthread_cond_broadcast, "__parseInt64": __parseInt64, "_abort": _abort, "_catclose": _catclose, "_fwrite": _fwrite, "___cxa_throw": ___cxa_throw, "_isdigit": _isdigit, "_sprintf": _sprintf, "__formatString": __formatString, "_isspace": _isspace, "_catopen": _catopen, "_exit": _exit, "_time": _time, "_read": _read, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTISt9exception": __ZTISt9exception, "_stderr": _stderr, "_stdin": _stdin, "_stdout": _stdout }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _llvm_ctlz_i32 = Module["_llvm_ctlz_i32"] = asm["_llvm_ctlz_i32"];
var _c_best_direction = Module["_c_best_direction"] = asm["_c_best_direction"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

Module["noExitRuntime"] = true;

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






