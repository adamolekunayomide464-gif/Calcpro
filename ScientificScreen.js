import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Vibration,
} from 'react-native';
import { colors, radius } from './theme';
import { fmtNum } from './math';

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? Infinity : a / b;
    case 'xʸ': return Math.pow(a, b);
    case 'EE': return a * Math.pow(10, b);
    default: return b;
  }
}

export default function ScientificScreen() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [operand, setOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitNext, setWaitNext] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeOp, setActiveOp] = useState(null);
  const [angleMode, setAngleMode] = useState('deg');

  const toRad = v => angleMode === 'deg' ? v * Math.PI / 180 : v;
  const fromRad = v => angleMode === 'deg' ? v * 180 / Math.PI : v;

  const clearAll = () => {
    setDisplay('0'); setHistory(''); setOperand(null);
    setOperator(null); setWaitNext(false); setIsError(false); setActiveOp(null);
  };

  const inputDigit = (d) => {
    Vibration.vibrate(15);
    if (isError) { setDisplay(d); setIsError(false); return; }
    if (waitNext) { setDisplay(d); setWaitNext(false); return; }
    setDisplay(prev => prev === '0' ? d : prev.length < 12 ? prev + d : prev);
  };

  const inputDot = () => {
    if (waitNext) { setDisplay('0.'); setWaitNext(false); return; }
    if (!display.includes('.')) setDisplay(prev => prev + '.');
  };

  const toggleSign = () => setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
  const percent = () => setDisplay(prev => String(parseFloat(prev) / 100));

  const handleOp = (op) => {
    Vibration.vibrate(15);
    const cur = parseFloat(display);
    if (operand !== null && !waitNext) {
      const res = compute(operand, cur, operator);
      setDisplay(fmtNum(res));
      setHistory(`${fmtNum(res)} ${op}`);
      setOperand(res);
    } else {
      setOperand(cur);
      setHistory(`${display} ${op}`);
    }
    setOperator(op); setWaitNext(true); setActiveOp(op);
  };

  const equals = () => {
    Vibration.vibrate(25);
    if (operand === null || operator === null) return;
    const cur = parseFloat(display);
    const res = compute(operand, cur, operator);
    setHistory(`${operand} ${operator} ${cur} =`);
    setDisplay(isFinite(res) ? fmtNum(res) : res > 0 ? '∞' : '-∞');
    if (!isFinite(res)) setIsError(true);
    setOperand(null); setOperator(null); setWaitNext(true); setActiveOp(null);
  };

  const applyFn = (fn) => {
    Vibration.vibrate(15);
    const x = parseFloat(display);
    let res;
    try {
      switch (fn) {
        case 'sin':   res = Math.sin(toRad(x)); break;
        case 'cos':   res = Math.cos(toRad(x)); break;
        case 'tan':   res = Math.tan(toRad(x)); break;
        case 'sin⁻¹': res = fromRad(Math.asin(x)); break;
        case 'cos⁻¹': res = fromRad(Math.acos(x)); break;
        case 'tan⁻¹': res = fromRad(Math.atan(x)); break;
        case 'sinh':  res = Math.sinh(x); break;
        case 'cosh':  res = Math.cosh(x); break;
        case 'tanh':  res = Math.tanh(x); break;
        case 'asinh': res = Math.asinh(x); break;
        case 'acosh': res = Math.acosh(x); break;
        case 'atanh': res = Math.atanh(x); break;
        case 'log':   res = Math.log10(x); break;
        case 'ln':    res = Math.log(x); break;
        case 'log₂':  res = Math.log2(x); break;
        case '√':     res = Math.sqrt(x); break;
        case '∛':     res = Math.cbrt(x); break;
        case 'x²':    res = x * x; break;
        case 'x³':    res = x * x * x; break;
        case '1/x':   res = 1 / x; break;
        case 'x!':
          if (x < 0 || !Number.isInteger(x)) { res = NaN; }
          else { res = 1; for (let i = 2; i <= x; i++) res *= i; }
          break;
        case 'eˣ':   res = Math.exp(x); break;
        case '10ˣ':  res = Math.pow(10, x); break;
        case 'π':    res = Math.PI; break;
        case 'e':    res = Math.E; break;
        case 'abs':  res = Math.abs(x); break;
        case '⌊x⌋':  res = Math.floor(x); break;
        case '⌈x⌉':  res = Math.ceil(x); break;
        case 'Rnd':  res = Math.random(); break;
        default: res = x;
      }
    } catch { res = NaN; }

    if (isNaN(res) || !isFinite(res)) {
      setDisplay('Error'); setIsError(true);
    } else {
      setHistory(`${fn}(${display})`);
      setDisplay(fmtNum(res));
      setWaitNext(true);
    }
  };

  const displaySize = display.length > 10 ? 22 : display.length > 7 ? 28 : 36;

  const K = ({ label, type = 'fn', onPress, isActive }) => (
    <TouchableOpacity
      style={[
        s.key,
        type === 'num' && s.keyNum,
        type === 'op' && s.keyOp,
        type === 'eq' && s.keyEq,
        type === 'clear' && s.keyClear,
        type === 'angle' && s.keyAngle,
        isActive && s.keyActive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        s.keyText,
        type === 'num' && s.keyTextNum,
        type === 'op' && s.keyTextOp,
        type === 'eq' && s.keyTextEq,
        type === 'clear' && s.keyTextClear,
        type === 'angle' && s.keyTextAngle,
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  const row = (...items) => (
    <View style={s.row}>
      {items.map((item, i) => <K key={i} {...item} />)}
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.display}>
        <Text style={s.historyText} numberOfLines={1}>{history}</Text>
        <Text style={[s.mainText, { fontSize: displaySize }, isError && s.errorText]} numberOfLines={1}>
          {display}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
        {/* Row 1 */}
        {row(
          { label: angleMode === 'deg' ? 'DEG' : 'RAD', type: 'angle', onPress: () => setAngleMode(m => m === 'deg' ? 'rad' : 'deg') },
          { label: 'AC', type: 'clear', onPress: clearAll },
          { label: '+/−', onPress: toggleSign },
          { label: '%', onPress: percent },
          { label: '÷', type: 'op', isActive: activeOp === '÷', onPress: () => handleOp('÷') },
        )}
        {/* Trig */}
        {row(
          { label: 'sin', onPress: () => applyFn('sin') },
          { label: 'cos', onPress: () => applyFn('cos') },
          { label: 'tan', onPress: () => applyFn('tan') },
          { label: '7', type: 'num', onPress: () => inputDigit('7') },
          { label: '×', type: 'op', isActive: activeOp === '×', onPress: () => handleOp('×') },
        )}
        {row(
          { label: 'sin⁻¹', onPress: () => applyFn('sin⁻¹') },
          { label: 'cos⁻¹', onPress: () => applyFn('cos⁻¹') },
          { label: 'tan⁻¹', onPress: () => applyFn('tan⁻¹') },
          { label: '8', type: 'num', onPress: () => inputDigit('8') },
          { label: '−', type: 'op', isActive: activeOp === '−', onPress: () => handleOp('−') },
        )}
        {/* Hyperbolic */}
        {row(
          { label: 'sinh', onPress: () => applyFn('sinh') },
          { label: 'cosh', onPress: () => applyFn('cosh') },
          { label: 'tanh', onPress: () => applyFn('tanh') },
          { label: '9', type: 'num', onPress: () => inputDigit('9') },
          { label: '+', type: 'op', isActive: activeOp === '+', onPress: () => handleOp('+') },
        )}
        {row(
          { label: 'asinh', onPress: () => applyFn('asinh') },
          { label: 'acosh', onPress: () => applyFn('acosh') },
          { label: 'atanh', onPress: () => applyFn('atanh') },
          { label: '4', type: 'num', onPress: () => inputDigit('4') },
          { label: '5', type: 'num', onPress: () => inputDigit('5') },
        )}
        {/* Log & powers */}
        {row(
          { label: 'log', onPress: () => applyFn('log') },
          { label: 'ln', onPress: () => applyFn('ln') },
          { label: 'log₂', onPress: () => applyFn('log₂') },
          { label: '6', type: 'num', onPress: () => inputDigit('6') },
          { label: 'xʸ', type: 'op', isActive: activeOp === 'xʸ', onPress: () => handleOp('xʸ') },
        )}
        {row(
          { label: 'x²', onPress: () => applyFn('x²') },
          { label: 'x³', onPress: () => applyFn('x³') },
          { label: '√', onPress: () => applyFn('√') },
          { label: '∛', onPress: () => applyFn('∛') },
          { label: '1/x', onPress: () => applyFn('1/x') },
        )}
        {row(
          { label: 'eˣ', onPress: () => applyFn('eˣ') },
          { label: '10ˣ', onPress: () => applyFn('10ˣ') },
          { label: 'x!', onPress: () => applyFn('x!') },
          { label: 'abs', onPress: () => applyFn('abs') },
          { label: 'Rnd', onPress: () => applyFn('Rnd') },
        )}
        {/* Constants & bottom row */}
        {row(
          { label: 'π', onPress: () => applyFn('π') },
          { label: 'e', onPress: () => applyFn('e') },
          { label: '⌊x⌋', onPress: () => applyFn('⌊x⌋') },
          { label: '⌈x⌉', onPress: () => applyFn('⌈x⌉') },
          { label: 'EE', type: 'op', isActive: activeOp === 'EE', onPress: () => handleOp('EE') },
        )}
        {row(
          { label: '1', type: 'num', onPress: () => inputDigit('1') },
          { label: '2', type: 'num', onPress: () => inputDigit('2') },
          { label: '3', type: 'num', onPress: () => inputDigit('3') },
          { label: '0', type: 'num', onPress: () => inputDigit('0') },
          { label: '.', type: 'num', onPress: inputDot },
        )}
        {row(
          { label: '=', type: 'eq', onPress: equals },
        )}
      </ScrollView>
    </View>
  );
}

const GAP = 7;
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  display: {
    height: 110, backgroundColor: colors.displayBg,
    justifyContent: 'flex-end', padding: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  historyText: { color: colors.textMuted, fontSize: 12, textAlign: 'right', marginBottom: 2, fontFamily: 'monospace' },
  mainText: { color: colors.textPrimary, textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' },
  errorText: { color: colors.red },
  grid: { padding: 10, gap: GAP },
  row: { flexDirection: 'row', gap: GAP },
  key: {
    flex: 1, height: 52, borderRadius: radius.sm,
    backgroundColor: colors.keyFn,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  keyNum: { backgroundColor: colors.keyNum },
  keyOp: { backgroundColor: colors.keyOp },
  keyEq: { backgroundColor: colors.cyan, borderWidth: 0, height: 52 },
  keyClear: { backgroundColor: colors.keyClear },
  keyAngle: { backgroundColor: '#0d1f3c', borderColor: colors.cyan },
  keyActive: { borderColor: colors.cyan, borderWidth: 2 },
  keyText: { color: colors.blueDim, fontSize: 12, fontWeight: '600' },
  keyTextNum: { color: colors.textPrimary, fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  keyTextOp: { color: colors.blue, fontSize: 18 },
  keyTextEq: { color: colors.displayBg, fontSize: 22, fontWeight: 'bold' },
  keyTextClear: { color: colors.red, fontSize: 13, fontWeight: '600' },
  keyTextAngle: { color: colors.cyan, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});