import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert,
} from 'react-native';
import { colors, radius } from './theme';
import { matDet, matTranspose, matMul, matInverse, fmtMat, fmtNum } from './math';

function makeEmpty(n) {
  return Array.from({ length: n }, () => Array(n).fill(''));
}

function getMatrix(data, size) {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      const v = parseFloat(data[r][c]);
      return isNaN(v) ? 0 : v;
    })
  );
}

export default function MatrixScreen() {
  const [size, setSize] = useState(2);
  const [matA, setMatA] = useState(makeEmpty(4));
  const [matB, setMatB] = useState(makeEmpty(4));
  const [result, setResult] = useState('');

  const changeSize = (n) => {
    setSize(n);
    setResult('');
  };

  const updateA = (r, c, val) => {
    const nxt = matA.map(row => [...row]);
    nxt[r][c] = val;
    setMatA(nxt);
  };

  const updateB = (r, c, val) => {
    const nxt = matB.map(row => [...row]);
    nxt[r][c] = val;
    setMatB(nxt);
  };

  const doOp = (op) => {
    try {
      const A = getMatrix(matA, size);
      const B = getMatrix(matB, size);
      let res;
      if (op === 'A+B')       res = A.map((r, i) => r.map((v, j) => v + B[i][j]));
      else if (op === 'A−B')  res = A.map((r, i) => r.map((v, j) => v - B[i][j]));
      else if (op === 'A×B')  res = matMul(A, B);
      else if (op === 'Aᵀ')   res = matTranspose(A);
      else if (op === 'det(A)') { setResult(`det(A) = ${fmtNum(matDet(A))}`); return; }
      else if (op === 'A⁻¹') {
        const inv = matInverse(A);
        if (!inv) { setResult('Singular matrix — no inverse exists.'); return; }
        res = inv;
      }
      setResult(fmtMat(res));
    } catch (e) {
      setResult('Error: ' + e.message);
    }
  };

  const MatInput = ({ data, update, label }) => (
    <View style={s.matBlock}>
      <Text style={s.matLabel}>{label}</Text>
      {Array.from({ length: size }, (_, r) => (
        <View key={r} style={s.matRow}>
          {Array.from({ length: size }, (_, c) => (
            <TextInput
              key={c}
              style={s.matCell}
              value={data[r][c]}
              onChangeText={v => update(r, c, v)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {/* Size selector */}
      <Text style={s.sectionLabel}>Matrix Size</Text>
      <View style={s.sizeRow}>
        {[2, 3, 4].map(n => (
          <TouchableOpacity
            key={n} style={[s.sizeBtn, size === n && s.sizeBtnActive]}
            onPress={() => changeSize(n)}
          >
            <Text style={[s.sizeBtnText, size === n && s.sizeBtnTextActive]}>{n}×{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Matrix inputs */}
      <MatInput data={matA} update={updateA} label="Matrix A" />
      <MatInput data={matB} update={updateB} label="Matrix B" />

      {/* Operations */}
      <Text style={s.sectionLabel}>Operations</Text>
      <View style={s.opsGrid}>
        {['A+B', 'A−B', 'A×B', 'Aᵀ', 'det(A)', 'A⁻¹'].map(op => (
          <TouchableOpacity key={op} style={s.opBtn} onPress={() => doOp(op)} activeOpacity={0.7}>
            <Text style={s.opBtnText}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result */}
      {result !== '' && (
        <View style={s.resultBox}>
          <Text style={s.sectionLabel}>Result</Text>
          <Text style={s.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    color: colors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
  },
  sizeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sizeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  sizeBtnActive: { borderColor: colors.cyan, backgroundColor: '#0d2a4a' },
  sizeBtnText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  sizeBtnTextActive: { color: colors.cyan },
  matBlock: { marginBottom: 16 },
  matLabel: { color: colors.textDim, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  matRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  matCell: {
    flex: 1, height: 44, borderRadius: radius.sm,
    backgroundColor: colors.displayBg, borderWidth: 1, borderColor: colors.border,
    color: colors.textPrimary, fontFamily: 'monospace', fontSize: 14,
    textAlign: 'center',
  },
  opsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  opBtn: {
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: radius.sm, backgroundColor: colors.keyOp,
    borderWidth: 1, borderColor: colors.border, minWidth: 80, alignItems: 'center',
  },
  opBtnText: { color: colors.blueDim, fontWeight: '700', fontSize: 13 },
  resultBox: {
    backgroundColor: colors.displayBg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  resultText: {
    color: colors.textPrimary, fontFamily: 'monospace',
    fontSize: 13, lineHeight: 22,
  },
});