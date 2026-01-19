'use client'

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

type AnalysisRow = {
  point: string
  summary: string
  risk: string
  recommendation?: string
}

type ReportGeneratorProps = {
  analysisMarkdown: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#0b1233',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
    color: '#4b5563',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#111827',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#0b1233',
    padding: 6,
    width: '25%',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
    width: '25%',
  },
  tableCellHeader: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
    color: '#111827',
  },
  badge: {
    fontSize: 10,
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
})

// Parse a markdown table into structured rows (very simple parser, assumes well-formed table)
function parseAnalysisMarkdown(markdown: string): AnalysisRow[] {
  const lines = markdown.split('\n').filter((l) => l.trim().startsWith('|'))
  if (lines.length < 3) return []

  // Skip header + separator
  const dataLines = lines.slice(2)

  return dataLines
    .map((line) =>
      line
        .trim()
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim()),
    )
    .filter((cols) => cols.length >= 3)
    .map((cols) => ({
      point: cols[0],
      summary: cols[1],
      risk: cols[2],
      recommendation: cols[3],
    }))
}

function riskColor(risk: string) {
  const r = risk.toLowerCase()
  if (r.includes('critique')) return '#b91c1c'
  if (r.includes('modéré')) return '#d97706'
  return '#059669'
}

function createReportDoc(analysisMarkdown: string) {
  const rows = parseAnalysisMarkdown(analysisMarkdown)
  const today = format(new Date(), 'dd/MM/yyyy')

  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={styles.page}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 28, marginBottom: 10, color: '#2563eb' }}>Lexpacte.ai</Text>
          <Text style={styles.title}>RAPPORT DE DUE DILIGENCE JURIDIQUE</Text>
          <Text style={styles.subtitle}>Audit de cession de parts sociales</Text>
          <Text style={{ marginTop: 20, fontSize: 12, color: '#6b7280' }}>
            Rapport généré automatiquement – {today}
          </Text>
        </View>
      </Page>

      {/* Synthèse exécutive (placeholder simple basé sur le markdown brut) */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>SYNTHÈSE EXÉCUTIVE</Text>
        <Text style={{ fontSize: 12, marginBottom: 8, color: '#111827' }}>
          Score de risque global : à déterminer sur la base des points de vigilance ci-dessous.
        </Text>
        <Text style={{ fontSize: 10, color: '#4b5563' }}>
          Ce rapport présente les principaux risques juridiques identifiés dans le cadre de la
          cession, en se concentrant sur les clauses de changement de contrôle, la garantie
          d&apos;actif et de passif, la non-concurrence et les conditions suspendives.
        </Text>
      </Page>

      {/* Tableau d'analyse détaillé */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>TABLEAU D&apos;ANALYSE DÉTAILLÉ</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Point de vigilance</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Analyse / Résumé</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Niveau de Risque</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Recommandation de négociation</Text>
            </View>
          </View>

          {rows.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.point}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.summary}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text
                  style={{
                    ...styles.badge,
                    backgroundColor: riskColor(row.risk),
                    color: '#ffffff',
                  }}
                >
                  {row.risk}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.recommendation ?? '-'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export function ReportGenerator({ analysisMarkdown }: ReportGeneratorProps) {
  if (!analysisMarkdown) return null

  const doc = createReportDoc(analysisMarkdown)

  return (
    <PDFDownloadLink
      document={doc}
      fileName="rapport-due-diligence-lexpacte.pdf"
      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
    >
      {({ loading }) => (loading ? 'Préparation du PDF...' : 'Télécharger le rapport PDF')}
    </PDFDownloadLink>
  )
}

