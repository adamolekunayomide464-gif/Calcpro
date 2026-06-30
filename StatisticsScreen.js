import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView,
} from 'react-native';
import { colors, radius } from './theme';
import {
  statMean, statMedian, statVariance, nCr, nPr, fmtNum,
} from './math';

export default function StatisticsScreen() {
  const [data, setData] = useState([]);
  const [input, setInput] = useState('');
  const [nVal, setNVal] = useState('');
  const [rVal, setRVal] = useState('');
  const [permResult, setPermResult] = useState(null);

  const addValue = () => {
    const v = parseFloat(input);
    if (!isNaN(v)) { setData(d => [...d, v]); setInput(''); }
  };

  const calcPerm = () => {
    const n = parseInt(nVal), r = parseInt(rVal);
    if (!isNaN(n) && !isNaN(r)) setPermResult({ p: nPr(n, r), c: nCr(n, r) });
  };

  const stats = data.length > 0 ? [
    ['Count', data.length],
    ['Sum', data.reduce((a, b) => a + b, 0)],
    ['Mean', statMean(data)],
    ['Median', statMedian(data)],
    ['Min', Math.min(...data)],
    ['Max', Math.max(...data)],
    ['Range', Math.max(...data) - Math.min(...data)],
    ['Variance (pop)', statVariance(data, true)],
    ['Std Dev (pop)', Math.sqrt(statVariance(data, true))],
    ...(data.length > 1 ? [
      ['Variance (sample)', statVariance(data, false)],
      ['Std Dev (sample)', Math.sqrt(statVariance(data, false))],
    ] : []),
  ] : [];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* Data input */}
      <Text style={s.sectionLabel}>Dataset</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.textInput} value={input} placeholder="Enter a number"
          placeholderTextColor={colors.textMuted} keyboardType="numeric"
          onChangeText={setInput}
          onSubmitEditing={addValue}
        />
        <TouchableOpacity style={s.addBtn} onPress={addValue}>
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.addBtn, { borderColor: colors.red }]} onPress={() => setData([])}>
          <Text style={[s.addBtnText, { color: colors.red }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={s.dataDisplay}>
        <Text style={s.dataText} numberOfLines={3}>
          {data.length === 0 ? 'No data yet — add values above' : `[${data.join(', ')}]`}
        </Text>
      </View>

      {/* Stats results */}
      {stats.length > 0 && (
        <>
          <Text style={s.sectionLabel}>Statistical Results</Text>
          <View style={s.statsGrid}>
            {stats.map(([label, val]) => (
              <View key={label} style={s.statCard}>
                <Text style={s.statLabel}>{label}</Text>
                <Text style={s.statValue}>{fmtNum(val)}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Permutations & Combinations */}
      <Text style={[s.sectionLabel, { marginTop: 20 }]}>Permutations & Combinations</Text>
      <View style={s.inputRow}>
        <TextInput
          style={[s.textInput, { flex: 1 }]} value={nVal} placeholder="n"
          placeholderTextColor={colors.textMuted} keyboardType="numeric"
          onChangeText={setNVal}
        />
        <TextInput
          style={[s.textInput, { flex: 1 }]} value={rVal} placeholder="r"
          placeholderTextColor={colors.textMuted} keyboardType="numeric"
          onChangeText={setRVal}
        />
        <TouchableOpacity style={s.addBtn} onPress={calcPerm}>
          <Text style={s.addBtnText}>Calc</Text>
        </TouchableOpacity>
      </View>

      {permResult && (
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>P(n,r) — Permutations</Text>
            <Text style={s.statValue}>{permResult.p}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>C(n,r) — Combinations</Text>
            <Text style={s.statValue}>{permResult.c}</Text>
          </View>
        </View>
      )}

      <View style={s.formulaBox}>
        <Text style={s.formulaTitle}>Formulas</Text>
        <Text style={s.formulaText}>P(n,r) = n! / (n−r)!</Text>
        <Text style={s.formulaText}>C(n,r) = n! / (r! × (n−r)!)</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    color: colors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10,
  },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  textInput: {
    flex: 2, height: 44, borderRadius: radius.sm,
    backgroundColor: colors.displayBg, borderWidth: 1, borderColor: colors.border,
    color: colors.textPrimary, fontFamily: 'monospace', fontSize: 15,
    paddingHorizontal: 12,
  },
  addBtn: {
    height: 44, paddingHorizontal: 14, borderRadius: radius.sm,
    backgroundColor: colors.keyOp, borderWidth: 1, borderColor: colors.cyan,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: colors.cyan, fontWeight: '700', fontSize: 13 },
  dataDisplay: {
    backgroundColor: colors.displayBg, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
    padding: 10, minHeight: 44, marginBottom: 20,
  },
  dataText: { color: colors.textMuted, fontFamily: 'monospace', fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statCard: {
    backgroundColor: colors.displayBg, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
    padding: 12, minWidth: '47%', flex: 1,
  },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  statValue: { color: colors.textPrimary, fontFamily: 'monospace', fontSize: 16, marginTop: 4, fontWeight: 'bold' },
  formulaBox: {
    marginTop: 16, backgroundColor: colors.displayBg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  formulaTitle: { color: colors.cyan, fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  formulaText: { color: colors.textSecondary, fontFamily: 'monospace', fontSize: 13, marginBottom: 4 },
});