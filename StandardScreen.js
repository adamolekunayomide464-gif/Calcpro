import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Vibration,
} from 'react-native';
import { colors, radius } from './theme';
import { fmtNum } from './math';

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? Infinity : a / b;
    default: return b;
  }
}

export default function StandardScreen() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [operand, setOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitNext, setWaitNext] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeOp, setActiveOp] = useState(null);

  const clearAll = () => {
    setDisplay('0'); setHistory(''); setOperand(null);
    setOperator(null); setWaitNext(false); setIsError(false); setActiveOp(null);
  };

  const inputDigit = (d) => {
    Vibration.vibrate(20);
    if (isError) { setDisplay(d); setIsError(false); return; }
    if (waitNext) { setDisplay(d); setWaitNext(false); return; }
    setDisplay(prev => prev === '0' ? d : prev.length < 12 ? prev + d : prev);
  };

  const inputDot = () => {
    Vibration.vibrate(20);
    if (waitNext) { setDisplay('0.'); setWaitNext(false); return; }
    if (!display.includes('.')) setDisplay(prev => prev + '.');
  };

  const toggleSign = () => setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
  const percent = () => setDisplay(prev => String(parseFloat(prev) / 100));

  const handleOp = (op) => {
    Vibration.vibrate(20);
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
    Vibration.vibrate(30);
    if (operand === null || operator === null) return;
    const cur = parseFloat(display);
    const res = compute(operand, cur, operator);
    setHistory(`${operand} ${operator} ${cur} =`);
    setDisplay(isFinite(res) ? fmtNum(res) : res > 0 ? '∞' : '-∞');
    if (!isFinite(res)) setIsError(true);
    setOperand(null); setOperator(null); setWaitNext(true); setActiveOp(null);
  };

  const displaySize = display.length > 10 ? 28 : display.length > 7 ? 36 : 48;

  const Key = ({ label, type = 'fn', onPress, isActive, span }) => (
    <TouchableOpacity
      style={[
        s.key,
        type === 'num' && s.keyNum,
        type === 'op' && s.keyOp,
        type === 'eq' && s.keyEq,
        type === 'clear' && s.keyClear,
        isActive && s.keyActive,
        span === 2 && s.keySpan2,
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
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Display */}
      <View style={s.display}>
        <Text style={s.historyText} numberOfLines={1}>{history}</Text>
        <Text style={[s.mainText, { fontSize: displaySize }, isError && s.errorText]} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={s.grid}>
        <View style={s.row}>
          <Key label="AC" type="clear" onPress={clearAll} />
          <Key label="+/−" onPress={toggleSign} />
          <Key label="%" onPress={percent} />
          <Key label="÷" type="op" isActive={activeOp === '÷'} onPress={() => handleOp('÷')} />
        </View>
        <View style={s.row}>
          <Key label="7" type="num" onPress={() => inputDigit('7')} />
          <Key label="8" type="num" onPress={() => inputDigit('8')} />
          <Key label="9" type="num" onPress={() => inputDigit('9')} />
          <Key label="×" type="op" isActive={activeOp === '×'} onPress={() => handleOp('×')} />
        </View>
        <View style={s.row}>
          <Key label="4" type="num" onPress={() => inputDigit('4')} />
          <Key label="5" type="num" onPress={() => inputDigit('5')} />
          <Key label="6" type="num" onPress={() => inputDigit('6')} />
          <Key label="−" type="op" isActive={activeOp === '−'} onPress={() => handleOp('−')} />
        </View>
        <View style={s.row}>
          <Key label="1" type="num" onPress={() => inputDigit('1')} />
          <Key label="2" type="num" onPress={() => inputDigit('2')} />
          <Key label="3" type="num" onPress={() => inputDigit('3')} />
          <Key label="+" type="op" isActive={activeOp === '+'} onPress={() => handleOp('+')} />
        </View>
        <View style={s.row}>
          <Key label="0" type="num" span={2} onPress={() => inputDigit('0')} />
          <Key label="." type="num" onPress={inputDot} />
          <Key label="=" type="eq" onPress={equals} />
        </View>
      </View>
    </View>
  );
}

const GAP = 10;
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  display: {
    flex: 1, backgroundColor: colors.displayBg,
    justifyContent: 'flex-end', padding: 24,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  historyText: { color: colors.textMuted, fontSize: 14, textAlign: 'right', marginBottom: 4, fontFamily: 'monospace' },
  mainText: { color: colors.textPrimary, textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' },
  errorText: { color: colors.red },
  grid: { padding: 12, gap: GAP },
  row: { flexDirection: 'row', gap: GAP },
  key: {
    flex: 1, height: 72, borderRadius: radius.md,
    backgroundColor: colors.keyFn,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  keyNum: { backgroundColor: colors.keyNum },
  keyOp: { backgroundColor: colors.keyOp },
  keyEq: { backgroundColor: colors.cyan, borderWidth: 0 },
  keyClear: { backgroundColor: colors.keyClear },
  keyActive: { borderColor: colors.cyan, borderWidth: 2 },
  keySpan2: { flex: 2 },
  keyText: { color: colors.blueDim, fontSize: 16, fontWeight: '600' },
  keyTextNum: { color: colors.textPrimary, fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace' },
  keyTextOp: { color: colors.blue, fontSize: 22 },
  keyTextEq: { color: colors.displayBg, fontSize: 26, fontWeight: 'bold' },
  keyTextClear: { color: colors.red, fontSize: 16, fontWeight: '600' },
});