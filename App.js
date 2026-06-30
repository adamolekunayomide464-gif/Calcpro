import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { colors } from './theme';
import StandardScreen from './StandardScreen';
import ScientificScreen from './ScientificScreen';
import MatrixScreen from './MatrixScreen';
import StatisticsScreen from './StatisticsScreen';
const TABS = [
  { key: 'std',  label: 'Basic' },
  { key: 'sci',  label: 'Scientific' },
  { key: 'mat',  label: 'Matrix' },
  { key: 'stat', label: 'Statistics' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('std');

  const renderScreen = () => {
    switch (activeTab) {
      case 'std':  return <StandardScreen />;
      case 'sci':  return <ScientificScreen />;
      case 'mat':  return <MatrixScreen />;
      case 'stat': return <StatisticsScreen />;
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>⚡ Calc Pro</Text>
        <Text style={s.headerSub}>Scientific Calculator</Text>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Screen content */}
      <View style={s.screen}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: colors.displayBg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.cyan, fontSize: 20, fontWeight: '800', letterSpacing: 0.5,
  },
  headerSub: {
    color: colors.textMuted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 11, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.cyan,
    backgroundColor: 'rgba(0,200,255,0.05)',
  },
  tabText: {
    color: colors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  tabTextActive: { color: colors.cyan },
  screen: { flex: 1 },
});