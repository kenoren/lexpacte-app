'use client'

import { useState, useEffect } from 'react'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

type ReportMode = 'buyer' | 'seller'

type AnalysisRow = {
  category: string
  point: string
  summary: string
  risk: string
  recommendation: string
}

function cleanText(text: string): string {
  if (!text) return ''
  return text.replace(/\*\*/g, '').replace(/###/g, '').replace(/\|/g, '').replace(/<br\s*\/?>/gi, '\n').trim()
}

function parseFullAnalysis(markdown: string) {
  const lines = markdown.split('\n')
  const rows: AnalysisRow[] = []
  let majorAlerts: string[] = []
  let globalScore = 'À DÉFINIR'

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && !trimmed.includes('---') && !trimmed.toLowerCase().includes('catégorie')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      if (cells.length >= 4) {
        rows.push({
          category: cells[0] || 'Général',
          point: cells[1] || 'Clause',
          summary: cells[2] || '-',
          risk: cells[3] || 'MODÉRÉ',
          recommendation: cells[4] || ''
        })
      }
    }
  }

  const scoreRegex = /(?:Score|Indice|NIVEAU)\s*[:*]*\s*([A-ZÉ0-9/ ]+)/i
  const scoreMatch = markdown.match(scoreRegex)
  if (scoreMatch) globalScore = scoreMatch[1].trim().toUpperCase()

  const alertSection = markdown.match(/(?:Priorités|Alertes|Arguments)[\s\S]*?(?=\n\n|###|\||$)/i)
  if (alertSection) {
    majorAlerts = alertSection[0]
        .split('\n')
        .filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
        .map(l => l.replace(/^[- \d.]*/, '').replace(/\*\*/g, '').trim())
        .slice(0, 5)
  }

  return { rows, majorAlerts, globalScore }
}

const styles = StyleSheet.create({
  page: { padding: 45, fontFamily: 'Helvetica', paddingBottom: 70 },
  coverPage: { backgroundColor: '#0F172A', color: '#ffffff', flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  confidentialBadge: { position: 'absolute', top: 30, right: 45, color: '#EF4444', fontSize: 9, fontWeight: 'bold' },
  mainTitle: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase' },
  subTitle: { fontSize: 12, color: '#94A3B8', marginBottom: 40, textAlign: 'center' },
  sectionTitle: { fontSize: 13, color: '#0F172A', fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', borderLeft: '3 solid #0F172A', paddingLeft: 10 },
  scoreBox: { padding: 15, marginBottom: 20, border: '1 solid #EF4444', backgroundColor: '#FEF2F2', flexDirection: 'row', justifyContent: 'space-between' },
  alertBox: { backgroundColor: '#F8FAFC', padding: 20, marginBottom: 25, border: '0.5 solid #E2E8F0' },
  table: { display: 'flex' as any, width: '100%', borderStyle: 'solid', borderWidth: 0.5, borderColor: '#CBD5E1' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#CBD5E1', minHeight: 40, alignItems: 'center' },
  colHeader: { backgroundColor: '#1E293B', color: '#fff', fontSize: 8, fontWeight: 'bold', padding: 8 },
  col1: { width: '12%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1' },
  col2: { width: '15%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1' },
  col3: { width: '30%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1' },
  col4: { width: '10%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1', textAlign: 'center' },
  col5: { width: '33%', padding: 8 },
  text: { fontSize: 7.5, color: '#334155', lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 30, left: 45, right: 45, borderTop: '0.5 solid #E2E8F0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: '#94A3B8' },
  legalNotice: { fontSize: 6.5, color: '#94A3B8', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }
})

export function ReportGenerator({ analysisMarkdown, mode = 'buyer' }: { analysisMarkdown: string, mode?: ReportMode }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [reportConfig, setReportConfig] = useState({
    mainTitle: mode === 'buyer' ? "AUDIT D'ACQUISITION" : "VENDOR DUE DILIGENCE (VDD)",
    subTitle: "ANALYSE STRATÉGIQUE ET SÉCURISATION CONTRACTUELLE",
    clientName: "Direction Générale / Département M&A",
    globalScore: "",
    scoreLabel: mode === 'buyer' ? "NIVEAU D'EXPOSITION GLOBAL" : "INDICE DE FRAGILITÉ DU PRIX",
    alertsLabel: mode === 'buyer' ? "PRIORITÉS DE NÉGOCIATION" : "ARGUMENTS D'ATTAQUE ACHETEUR",
    alerts: [] as string[],
    rows: [] as AnalysisRow[]
  })

  useEffect(() => {
    if (analysisMarkdown) {
      const parsed = parseFullAnalysis(analysisMarkdown)
      setReportConfig(prev => ({
        ...prev,
        globalScore: parsed.globalScore,
        alerts: parsed.majorAlerts,
        rows: parsed.rows
      }))
    }
  }, [analysisMarkdown])

  if (!analysisMarkdown) return null

  const handleRowChange = (index: number, field: keyof AnalysisRow, value: string) => {
    const updatedRows = [...reportConfig.rows]
    updatedRows[index][field] = value
    setReportConfig({ ...reportConfig, rows: updatedRows })
  }

  const handleAlertChange = (index: number, value: string) => {
    const updatedAlerts = [...reportConfig.alerts]
    updatedAlerts[index] = value
    setReportConfig({ ...reportConfig, alerts: updatedAlerts })
  }

  const PDF_FOOTER = (
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Lexpacte.ai - Intelligence Juridique Augmentée</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
      </View>
  )

  const LEGAL_DISCLAIMER = "LIMITATION DE RESPONSABILITÉ : Ce document est une synthèse produite par Lexpacte AI. Il ne constitue pas un conseil juridique et doit impérativement être revu et validé par un avocat avant toute mise en œuvre."

  const MyDocument = () => (
      <Document title={reportConfig.mainTitle}>
        {/* PAGE DE GARDE */}
        <Page size="A4" style={styles.coverPage}>
          <Text style={styles.confidentialBadge}>STRICTEMENT CONFIDENTIEL</Text>
          <Text style={styles.mainTitle}>{reportConfig.mainTitle}</Text>
          <Text style={styles.subTitle}>{reportConfig.subTitle}</Text>
          <View style={{ width: '100%', borderTop: '1 solid #334155', paddingTop: 20 }}>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>Client : {reportConfig.clientName}</Text>
            <Text style={{ fontSize: 10 }}>Date : {new Date().toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 60, width: '100%', paddingHorizontal: 60 }}>
            <Text style={styles.legalNotice}>{LEGAL_DISCLAIMER}</Text>
          </View>
        </Page>

        {/* PAGE SYNTHÈSE */}
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>1. Synthèse de l'Analyse</Text>
          <View style={styles.scoreBox}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{reportConfig.scoreLabel} :</Text>
            <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 14 }}>{reportConfig.globalScore}</Text>
          </View>
          <View style={styles.alertBox}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 10 }}>{reportConfig.alertsLabel} :</Text>
            {reportConfig.alerts.map((a, i) => (<Text key={i} style={{ fontSize: 8.5, marginBottom: 5 }}>• {cleanText(a)}</Text>))}
          </View>
          <Text style={styles.legalNotice}>{LEGAL_DISCLAIMER}</Text>
          {PDF_FOOTER}
        </Page>

        {/* PAGE MATRICE */}
        <Page size="A4" orientation="landscape" style={styles.page}>
          <Text style={styles.sectionTitle}>2. Matrice de Risques & Recommandations</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: '#1E293B' }]}>
              <Text style={[styles.col1, styles.colHeader]}>DOMAINE</Text>
              <Text style={[styles.col2, styles.colHeader]}>CLAUSE</Text>
              <Text style={[styles.col3, styles.colHeader]}>ANALYSE</Text>
              <Text style={[styles.col4, styles.colHeader]}>RISQUE</Text>
              <Text style={[styles.col5, styles.colHeader]}>RECOMMANDATION</Text>
            </View>
            {reportConfig.rows.map((row, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.col1, styles.text]}>{cleanText(row.category)}</Text>
                  <Text style={[styles.col2, styles.text]}>{cleanText(row.point)}</Text>
                  <Text style={[styles.col3, styles.text]}>{cleanText(row.summary)}</Text>
                  <Text style={[styles.col4, styles.text, { fontWeight: 'bold' }]}>{cleanText(row.risk)}</Text>
                  <Text style={[styles.col5, styles.text, { fontStyle: 'italic', color: '#1E40AF' }]}>{cleanText(row.recommendation)}</Text>
                </View>
            ))}
          </View>
          <Text style={styles.legalNotice}>{LEGAL_DISCLAIMER}</Text>
          {PDF_FOOTER}
        </Page>
      </Document>
  )

  return (
      <div className="mt-8 flex flex-col items-center">
        <div className="w-full max-w-xl bg-slate-900 rounded-3xl p-8 text-center shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">Rapport Prêt</h3>
          <p className="text-slate-400 mb-8 font-medium italic">"L'IA prépare, l'avocat valide."</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setIsPreviewOpen(true)} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Réviser & Signer
            </button>
            <PDFDownloadLink document={<MyDocument />} fileName="Rapport_Lexpacte_Expert.pdf" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg">
              {({ loading }) => loading ? 'Génération...' : 'Télécharger'}
            </PDFDownloadLink>
          </div>
        </div>

        {isPreviewOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-[98vw] h-[96vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* TOOLBAR */}
                <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-20">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Espace de Travail Avocat</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Toutes les modifications sont incluses dans le PDF final</p>
                  </div>
                  <button onClick={() => setIsPreviewOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
                    Confirmer la Rédaction
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-8 space-y-8 bg-slate-50/50">
                  {/* CONFIG GLOBALE */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase border-b pb-2">Couverture</h4>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Titre</label>
                        <input className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:bg-white outline-none" value={reportConfig.mainTitle} onChange={e => setReportConfig({...reportConfig, mainTitle: e.target.value})} /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Client</label>
                        <input className="w-full p-3 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white outline-none" value={reportConfig.clientName} onChange={e => setReportConfig({...reportConfig, clientName: e.target.value})} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black text-red-600 uppercase border-b pb-2">Score de Risque</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Libellé</label>
                          <input className="w-full p-3 bg-slate-50 border rounded-xl text-slate-900 outline-none" value={reportConfig.scoreLabel} onChange={e => setReportConfig({...reportConfig, scoreLabel: e.target.value})} /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Valeur</label>
                          <input className="w-full p-3 bg-slate-50 border border-red-200 rounded-xl text-red-600 font-black outline-none" value={reportConfig.globalScore} onChange={e => setReportConfig({...reportConfig, globalScore: e.target.value})} /></div>
                      </div>
                    </div>
                  </section>

                  {/* MATRICE D'ÉDITION */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900 text-white text-[10px] uppercase">
                      <tr>
                        <th className="p-5 w-[15%]">Domaine / Clause</th>
                        <th className="p-5 w-[35%] border-l border-slate-700">Analyse (IA)</th>
                        <th className="p-5 w-[40%] border-l border-slate-700 bg-blue-900">Recommandation Avocat (Éditable)</th>
                        <th className="p-5 w-[10%] text-center border-l border-slate-700">Risque</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                      {reportConfig.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 align-top">
                              <input className="w-full bg-transparent font-bold text-xs text-slate-900 outline-none mb-1" value={row.category} onChange={e => handleRowChange(idx, 'category', e.target.value)} />
                              <input className="w-full bg-transparent text-[10px] text-slate-500 outline-none italic" value={row.point} onChange={e => handleRowChange(idx, 'point', e.target.value)} />
                            </td>
                            <td className="p-4 align-top border-l border-slate-50">
                              <textarea className="w-full bg-white border p-3 rounded-lg text-xs text-slate-900 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500" rows={6} value={row.summary} onChange={e => handleRowChange(idx, 'summary', e.target.value)} />
                            </td>
                            <td className="p-4 align-top border-l border-blue-50 bg-blue-50/30">
                              <textarea className="w-full bg-white border border-blue-200 p-3 rounded-lg text-xs text-blue-900 font-bold italic leading-relaxed outline-none focus:ring-2 focus:ring-blue-600 shadow-md" rows={6} value={row.recommendation} onChange={e => handleRowChange(idx, 'recommendation', e.target.value)} />
                            </td>
                            <td className="p-4 align-top border-l border-slate-50">
                              <input className="w-full bg-slate-100 p-2 rounded text-[10px] font-black text-center text-slate-700 outline-none uppercase" value={row.risk} onChange={e => handleRowChange(idx, 'risk', e.target.value)} />
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}