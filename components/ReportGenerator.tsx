'use client'

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

type AnalysisRow = {
  category: string
  point: string
  summary: string
  risk: string
  recommendation: string
}

function cleanText(text: string): string {
  if (!text) return ''
  return text
      .replace(/\*\*/g, '')
      .replace(/\|/g, '')
      .replace(/###/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .trim()
}

function parseFullAnalysis(markdown: string) {
  const lines = markdown.split('\n')
  const rows: AnalysisRow[] = []
  let majorAlerts: string[] = []
  let globalScore = 'NON DÉFINI'

  // 1. Extraction du Score - Version Ultra-Robuste
  // Cherche n'importe quelle ligne contenant "Score" puis capture le premier mot en majuscule qui suit
  const scoreRegex = /(?:Score de Risque Global|Score)\s*[:*]*\s*(CRITIQUE|MODÉRÉ|FAIBLE|ÉLEVÉ)/i
  const scoreMatch = markdown.match(scoreRegex)
  if (scoreMatch) {
    globalScore = scoreMatch[1].toUpperCase()
  }

  // 2. Extraction des Priorités
  const alertSection = markdown.match(/(?:Priorités de Négociation|Alertes Majeures)[\s\S]*?(?=\n\n|###|\||$)/i)
  if (alertSection) {
    majorAlerts = alertSection[0]
        .split('\n')
        .filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
        .map(l => cleanText(l.replace(/^[- \d.]*/, '')))
        .slice(0, 6)
  }

  // 3. Extraction du Tableau
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && !trimmed.includes('---') && !trimmed.toLowerCase().includes('catégorie')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      if (cells.length >= 4) {
        rows.push({
          category: cleanText(cells[0] || 'Général'),
          point: cleanText(cells[1] || 'Clause'),
          summary: cleanText(cells[2] || '-'),
          risk: cleanText(cells[3] || 'MODÉRÉ'),
          recommendation: cleanText(cells[4] || '')
        })
      }
    }
  }

  return { rows, majorAlerts, globalScore }
}

const styles = StyleSheet.create({
  page: { padding: 45, fontFamily: 'Helvetica', paddingBottom: 65 },
  coverPage: { backgroundColor: '#0F172A', color: '#ffffff', flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  confidentialBadge: { position: 'absolute', top: 30, right: 45, color: '#EF4444', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  mainTitle: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, letterSpacing: 1 },
  subTitle: { fontSize: 12, color: '#94A3B8', marginBottom: 40, letterSpacing: 2 },
  sectionTitle: { fontSize: 14, color: '#0F172A', fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', borderLeft: '3 solid #0F172A', paddingLeft: 10 },
  scoreBox: { padding: 15, borderRadius: 2, marginBottom: 20, border: '1 solid #EF4444', backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 2, marginBottom: 25, border: '0.5 solid #E2E8F0' },
  methodologyBox: { marginTop: 30, padding: 15, backgroundColor: '#F1F5F9', borderRadius: 2 },
  legalDisclaimerBox: { position: 'absolute', bottom: 60, left: 60, right: 60, padding: 15, borderTop: '1 solid #334155' },
  legalText: { fontSize: 7, textAlign: 'center', lineHeight: 1.4, color: '#94A3B8' },
  table: { display: 'flex' as any, width: '100%', borderStyle: 'solid', borderWidth: 0.5, borderColor: '#CBD5E1' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#CBD5E1', minHeight: 40, alignItems: 'center' },
  colHeader: { backgroundColor: '#1E293B', color: '#fff', fontSize: 8, fontWeight: 'bold', padding: 8 },
  col1: { width: '12%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1' },
  col2: { width: '15%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1' },
  col3: { width: '38%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1' },
  col4: { width: '10%', padding: 8, borderRightWidth: 0.5, borderColor: '#CBD5E1', textAlign: 'center' },
  col5: { width: '25%', padding: 8 },
  text: { fontSize: 7.5, color: '#334155', lineHeight: 1.5 },
  riskText: { fontSize: 7, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 45, right: 45, borderTop: '0.5 solid #E2E8F0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#94A3B8' }
})

export function ReportGenerator({ analysisMarkdown }: { analysisMarkdown: string }) {
  if (!analysisMarkdown) return null
  const { rows, majorAlerts, globalScore } = parseFullAnalysis(analysisMarkdown)

  const Footer = () => (
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>LEXPACTE.AI – Direction Juridique Augmentée</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Document n°${Math.floor(Date.now()/1000)} — Page ${pageNumber} / ${totalPages}`} />
      </View>
  )

  const doc = (
      <Document title="Audit Juridique Expert - Lexpacte">
        {/* PAGE DE GARDE */}
        <Page size="A4" style={styles.coverPage}>
          <Text style={styles.confidentialBadge}>STRICTEMENT CONFIDENTIEL</Text>
          <Text style={styles.mainTitle}>RAPPORT D'AUDIT JURIDIQUE</Text>
          <Text style={styles.subTitle}>ANALYSE DES RISQUES CONTRACTUELS & RECOMMANDATIONS</Text>

          <View style={{ width: '100%', borderTop: '1 solid #334155', paddingTop: 20 }}>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>Client : Direction Générale / Département M&A</Text>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>Date : {new Date().toLocaleDateString('fr-FR')}</Text>
            <Text style={{ fontSize: 10 }}>Objet : Revue stratégique de conformité et sécurisation des actifs</Text>
          </View>

          <View style={styles.legalDisclaimerBox}>
            <Text style={styles.legalText}>
              LIMITATION DE RESPONSABILITÉ : Ce document est une synthèse produite par un système d'intelligence artificielle spécialisé.
              Il ne constitue pas un conseil juridique au sens de la loi n° 71-1130 du 31 décembre 1971.
              L'analyse est délivrée à titre purement indicatif et doit impérativement faire l'objet d'une revue par un avocat inscrit au barreau
              avant toute mise en œuvre ou signature contractuelle.
            </Text>
          </View>
        </Page>

        {/* MÉTHODOLOGIE & SYNTHÈSE */}
        <Page size="A4" style={styles.page}>
          <Text style={styles.confidentialBadge}>CONFIDENTIEL</Text>
          <Text style={styles.sectionTitle}>1. Synthèse de l'Exposition</Text>

          <View style={styles.scoreBox}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E293B' }}>NIVEAU D'EXPOSITION GLOBAL :</Text>
            <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 14 }}>{globalScore}</Text>
          </View>

          <View style={styles.alertBox}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 10, color: '#1E293B' }}>POINTS DE VIGILANCE PRIORITAIRES :</Text>
            {majorAlerts.length > 0 ? majorAlerts.map((a, i) => (
                <Text key={i} style={{ fontSize: 8.5, marginBottom: 6, color: '#334155' }}>• {a}</Text>
            )) : <Text style={styles.text}>Aucune alerte majeure identifiée.</Text>}
          </View>

          <Text style={styles.sectionTitle}>2. Méthodologie & Référentiel</Text>
          <View style={styles.methodologyBox}>
            <Text style={[styles.text, { marginBottom: 5 }]}>• Analyse effectuée sur la base du Code civil (Réforme 2016) et du Code de commerce.</Text>
            <Text style={[styles.text, { marginBottom: 5 }]}>• Évaluation de la conformité jurisprudentielle (Cour de cassation).</Text>
            <Text style={[styles.text]}>• Identification des clauses créant un déséquilibre significatif (Art. 1171 C. civ).</Text>
          </View>
          <Footer />
        </Page>

        {/* ANALYSE DÉTAILLÉE (PAYSAGE) */}
        <Page size="A4" orientation="landscape" style={styles.page}>
          <Text style={styles.confidentialBadge}>CONFIDENTIEL</Text>
          <Text style={styles.sectionTitle}>3. Matrice de Risques & Préconisations Rédactionnelles</Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: '#1E293B' }]}>
              <Text style={[styles.col1, styles.colHeader]}>DOMAINE</Text>
              <Text style={[styles.col2, styles.colHeader]}>CLAUSE VISÉE</Text>
              <Text style={[styles.col3, styles.colHeader]}>ANALYSE JURIDIQUE & FONDEMENT</Text>
              <Text style={[styles.col4, styles.colHeader]}>NIVEAU</Text>
              <Text style={[styles.col5, styles.colHeader]}>RECOMMANDATION (PRÊT-À-INSERER)</Text>
            </View>

            {rows.map((row, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.col1, styles.text, { fontWeight: 'bold' }]}>{row.category}</Text>
                  <Text style={[styles.col2, styles.text]}>{row.point}</Text>
                  <Text style={[styles.col3, styles.text]}>{row.summary}</Text>
                  <View style={styles.col4}>
                    <Text style={[styles.riskText, { color: row.risk.includes('CRITIQUE') || row.risk.includes('ÉLEVÉ') ? '#EF4444' : '#64748B' }]}>
                      {row.risk}
                    </Text>
                  </View>
                  <Text style={[styles.col5, styles.text, { fontStyle: 'italic', color: '#1E40AF' }]}>
                    {row.recommendation}
                  </Text>
                </View>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 7, color: '#94A3B8' }}>Note : Les recommandations en bleu sont des propositions de rédaction contractuelle conformes à l'intérêt de l'Acquéreur.</Text>
          </View>
          <Footer />
        </Page>
      </Document>
  )

  return (
      <div className="mt-8 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="Store 9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Expertise finalisée</h3>
            <p className="text-sm text-slate-500">Le rapport de conformité est prêt pour téléchargement.</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Statut du document :</span>
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase">Certifié conforme</span>
          </div>
          <p className="text-xs text-slate-400 italic">Ce rapport inclut la matrice des risques et les clauses de substitution prêtes-à-l'emploi.</p>
        </div>

        <PDFDownloadLink
            document={doc}
            fileName={`Rapport_Expert_Lexpacte_${new Date().toISOString().split('T')[0]}.pdf`}
            className="w-full flex justify-center items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          {({ loading }) => (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="Store 4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                {loading ? 'Génération du rapport expert...' : 'Télécharger le Rapport Expert (PDF)'}
              </>
          )}
        </PDFDownloadLink>
      </div>
  )
}