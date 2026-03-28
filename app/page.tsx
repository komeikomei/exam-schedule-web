'use client'
import { useState } from 'react'
import { supabase, ExamRow } from '@/lib/supabase'

const TE: Record<string, string> = {
  '書類審査': '#dbeafe|#1e40af', '活動実績評価': '#dbeafe|#1e40af',
  '小論文': '#fef9c3|#854d0e', '適性検査': '#fef9c3|#854d0e',
  '共通テスト利用': '#fef9c3|#854d0e', '教科試験': '#fef9c3|#854d0e',
  '面接（個人）': '#dcfce7|#166534', '面接（集団）': '#dcfce7|#166534', '口頭試問': '#dcfce7|#166534',
  'プレゼンテーション': '#ede9fe|#5b21b6', 'グループディスカッション': '#ede9fe|#5b21b6',
  '実技試験': '#fee2e2|#991b1b',
}
const teStyle = (t: string) => {
  const v = TE[t] || '#f3f4f6|#374151'
  const [bg, color] = v.split('|')
  return { background: bg, color, fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 500, whiteSpace: 'nowrap' as const }
}
const gpaColor = (g: number) => g === 0 ? '#f3f4f6|#9ca3af' : g >= 3.8 ? '#d1fae5|#065f46' : g >= 3.5 ? '#fef3c7|#92400e' : '#f0fdf4|#166534'
const eikenColor = (e: string) => !e || e === '不問' ? '#f3f4f6|#9ca3af' : ['準1級','1級'].includes(e) ? '#dbeafe|#1e40af' : ['準2級','2級'].includes(e) ? '#fef3c7|#92400e' : '#d1fae5|#065f46'
const parseColor = (s: string) => { const [bg, color] = s.split('|'); return { bg, color } }

const PREFS: Record<string, string[]> = {
  '北海道・東北': ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県'],
  '関東': ['茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県'],
  '中部': ['新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県'],
  '近畿': ['三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県'],
  '中国・四国': ['鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県'],
  '九州・沖縄': ['福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'],
}

export default function Home() {
  const [q, setQ] = useState('')
  const [examType, setExamType] = useState('')
  const [kind, setKind] = useState('')
  const [region, setRegion] = useState('')
  const [pref, setPref] = useState('')
  const [gpaMin, setGpaMin] = useState('')
  const [rows, setRows] = useState<ExamRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [openRows, setOpenRows] = useState<Set<string>>(new Set())
  const PER_PAGE = 20

  const search = async (p = 1) => {
    setLoading(true); setSearched(true); setPage(p)
    const from = (p - 1) * PER_PAGE
    let query = supabase.from('v_exam_list').select('*', { count: 'exact' })
      .order('app_end', { ascending: true, nullsFirst: false }).range(from, from + PER_PAGE - 1)
    if (q) query = query.or(`school_name.ilike.%${q}%,dept.ilike.%${q}%`)
    if (examType) query = query.eq('exam_type', examType)
    if (kind) query = query.eq('kind', kind)
    if (pref) query = query.eq('pref', pref)
    else if (region && PREFS[region]) query = query.in('pref', PREFS[region])
    if (gpaMin) query = query.or(`gpa_min.lte.${gpaMin},gpa_min.eq.0`)
    const { data, count } = await query
    setRows((data ?? []) as ExamRow[]); setTotal(count ?? 0); setLoading(false)
  }

  const reset = () => { setQ(''); setExamType(''); setKind(''); setRegion(''); setPref(''); setGpaMin(''); setRows([]); setSearched(false) }
  const toggle = (id: string) => setOpenRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const pages = Math.ceil(total / PER_PAGE)
  const hasFilter = q || examType || kind || region || pref || gpaMin

  const s = {
    wrap: { maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' } as React.CSSProperties,
    header: { background: '#1e3a5f', padding: '28px 0 24px', marginBottom: 32 } as React.CSSProperties,
    headerInner: { maxWidth: 1100, margin: '0 auto', padding: '0 20px' } as React.CSSProperties,
    h1: { fontFamily: "'Noto Serif JP', serif", fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '0.02em' } as React.CSSProperties,
    sub: { fontSize: 12, color: '#93c5fd', margin: 0 } as React.CSSProperties,
    notice: { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#78350f', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' } as React.CSSProperties,
    searchWrap: { display: 'flex', gap: 10, marginBottom: 14 } as React.CSSProperties,
    input: { flex: 1, border: '1.5px solid #d1d5db', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontFamily: "'Noto Sans JP', sans-serif", background: '#fff', outline: 'none' } as React.CSSProperties,
    btnPrimary: { background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: '0.05em' } as React.CSSProperties,
    filtersWrap: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const },
    sel: { border: '1.5px solid #d1d5db', borderRadius: 8, padding: '7px 10px', fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", background: '#fff', color: '#1f2937' } as React.CSSProperties,
    resetBtn: { border: '1.5px solid #d1d5db', borderRadius: 8, padding: '7px 14px', fontSize: 13, background: 'transparent', cursor: 'pointer', color: '#6b7280', fontFamily: "'Noto Sans JP', sans-serif" } as React.CSSProperties,
    empty: { textAlign: 'center' as const, padding: '64px 20px', color: '#9ca3af' },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { fontSize: 15, fontWeight: 500, color: '#6b7280', margin: '0 0 6px' },
    emptyDesc: { fontSize: 13, margin: 0, lineHeight: 1.7 },
    meta: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
    table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
    th: { padding: '10px 12px', background: '#f8f7f4', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e5e7eb', textAlign: 'center' as const, letterSpacing: '0.05em' },
    td: { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' as const, fontSize: 13 },
    detailCell: { padding: '16px 20px', background: '#fafaf8', borderBottom: '2px solid #e5e7eb' },
  }

  return (
    <>
      <header style={s.header}>
        <div style={s.headerInner}>
          <h1 style={s.h1}>受験スケジュールナビ</h1>
          <p style={s.sub}>大学・専門学校の募集要項・試験日程を一元管理 ／ 学校推薦型選抜は公募制のみ掲載</p>
        </div>
      </header>

      <div style={s.wrap}>
        <div style={s.notice}>
          <span>⚠️</span>
          <span>掲載情報は参考です。出願前に必ず各校公式サイトでご確認ください。日程は変更になる場合があります。</span>
        </div>

        <div style={s.searchWrap}>
          <input style={s.input} placeholder="学校名・学部名で検索（例：早稲田、文学部、保育）" value={q}
            onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search(1)} />
          <button style={s.btnPrimary} onClick={() => search(1)}>検 索</button>
        </div>

        <div style={s.filtersWrap}>
          <select style={s.sel} value={examType} onChange={e => setExamType(e.target.value)}>
            <option value="">すべての入試区分</option>
            <option value="総合型選抜">総合型選抜</option>
            <option value="学校推薦型選抜（公募制）">学校推薦型選抜（公募制）</option>
            <option value="一般選抜">一般選抜</option>
          </select>
          <select style={s.sel} value={kind} onChange={e => setKind(e.target.value)}>
            <option value="">すべての学校種別</option>
            <option value="大学">大学</option>
            <option value="短期大学">短期大学</option>
            <option value="専門学校">専門学校</option>
          </select>
          <select style={s.sel} value={region} onChange={e => { setRegion(e.target.value); setPref('') }}>
            <option value="">地方で絞り込み</option>
            {Object.keys(PREFS).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {region && (
            <select style={s.sel} value={pref} onChange={e => setPref(e.target.value)}>
              <option value="">都道府県を選択</option>
              {PREFS[region].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <select style={s.sel} value={gpaMin} onChange={e => setGpaMin(e.target.value)}>
            <option value="">評定平均（絞り込み）</option>
            <option value="3.0">3.0以上</option>
            <option value="3.5">3.5以上</option>
            <option value="3.8">3.8以上</option>
          </select>
          {hasFilter && <button style={s.resetBtn} onClick={reset}>✕ リセット</button>}
        </div>

        {!searched ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🎓</div>
            <p style={s.emptyTitle}>学校名を入力、またはフィルターを選択してください</p>
            <p style={s.emptyDesc}>「詳細」ボタンで出願資格・評定平均・英検・備考を確認できます</p>
          </div>
        ) : loading ? (
          <div style={s.empty}><p style={s.emptyTitle}>読み込み中...</p></div>
        ) : rows.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🔍</div>
            <p style={s.emptyTitle}>該当する学校が見つかりませんでした</p>
            <p style={s.emptyDesc}>検索キーワードやフィルターを変えてお試しください</p>
          </div>
        ) : (
          <>
            <p style={s.meta}>{total.toLocaleString()}件 · {page}/{pages}ページ</p>
            <table style={s.table}>
              <thead>
                <tr>
                  {['学校名','区分','回','出願期間','一次試験 / 内容','二次試験 / 内容','合格発表','要項',''].map((h, i) => (
                    <th key={i} style={{ ...s.th, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const key = row.school_id + (row.exam_round || '')
                  const isOpen = openRows.has(key)
                  const typeColor = row.exam_type?.includes('総合型') ? '#dbeafe|#1e40af' : row.exam_type?.includes('推薦') ? '#dcfce7|#166534' : '#f3f4f6|#374151'
                  const { bg: typeBg, color: typeCol } = parseColor(typeColor)
                  const gpaParsed = parseColor(gpaColor(row.gpa_min))
                  const eikenParsed = parseColor(eikenColor(row.eiken))
                  const rowBg = isOpen ? '#fafaf8' : i % 2 === 0 ? '#fff' : '#fdfcfb'
                  return (
                    <>
                      <tr key={key} style={{ background: rowBg, cursor: 'pointer' }}
                        onClick={() => toggle(key)}>
                        <td style={{ ...s.td, textAlign: 'left', minWidth: 160 }}>
                          <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 13 }}>{row.school_name}</div>
                          {row.dept && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{row.dept}</div>}
                          {row.pref && <span style={{ fontSize: 10, background: '#ede9fe', color: '#5b21b6', borderRadius: 3, padding: '1px 6px', display: 'inline-block', marginTop: 3 }}>{row.pref}</span>}
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, background: typeBg, color: typeCol, borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>{row.exam_type}</span>
                        </td>
                        <td style={{ ...s.td, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>{row.exam_round || '—'}</td>
                        <td style={{ ...s.td, textAlign: 'center', fontSize: 11, whiteSpace: 'nowrap', color: '#374151' }}>
                          {row.app_start && row.app_end ? `${row.app_start}〜${row.app_end}` : row.app_end || <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          {row.ex1_date ? <>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 3 }}>{row.ex1_date}</div>
                            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                              {(row.ex1_content || []).map((t, j) => <span key={j} style={teStyle(t)}>{t}</span>)}
                            </div>
                          </> : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          {row.ex2_date ? <>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 3 }}>{row.ex2_date}</div>
                            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                              {(row.ex2_content || []).map((t, j) => <span key={j} style={teStyle(t)}>{t}</span>)}
                            </div>
                          </> : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td style={{ ...s.td, textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{row.result_date || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          {row.url ? <a href={row.url} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#1e3a5f', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                            onClick={e => e.stopPropagation()}>要項↗</a> : '—'}
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 8px' }}>
                            {isOpen ? '▲' : '詳細▼'}
                          </span>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${key}-d`}>
                          <td colSpan={9} style={s.detailCell}>
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                              <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', margin: '0 0 10px', textTransform: 'uppercase' }}>出願条件</p>
                                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: gpaParsed.bg, color: gpaParsed.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                      <span style={{ fontSize: row.gpa_min > 0 ? 18 : 13, lineHeight: 1 }}>{row.gpa_min > 0 ? row.gpa_min.toFixed(1) : '不問'}</span>
                                      {row.gpa_min > 0 && <span style={{ fontSize: 9 }}>以上</span>}
                                    </div>
                                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '4px 0 0' }}>評定平均</p>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <span style={{ background: eikenParsed.bg, color: eikenParsed.color, fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6, display: 'inline-block' }}>
                                      英検 {row.eiken || '不問'}{row.eiken && row.eiken !== '不問' ? ' 以上' : ''}
                                    </span>
                                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '4px 0 0' }}>英語資格</p>
                                  </div>
                                </div>
                              </div>
                              {row.qualification && (
                                <div style={{ flex: 1, minWidth: 180 }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', margin: '0 0 6px', textTransform: 'uppercase' }}>出願資格</p>
                                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{row.qualification}</p>
                                </div>
                              )}
                              {row.note && (
                                <div style={{ flex: 1, minWidth: 180 }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', margin: '0 0 6px', textTransform: 'uppercase' }}>備考・特記事項</p>
                                  <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7, margin: 0, borderLeft: '3px solid #fcd34d', paddingLeft: 10 }}>{row.note}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>

            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                <button onClick={() => search(page - 1)} disabled={page <= 1}
                  style={{ padding: '6px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, fontSize: 13 }}>◀</button>
                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`e${p}`} style={{ padding: '6px 4px', color: '#9ca3af', fontSize: 13 }}>…</span>}
                      <button key={p} onClick={() => search(p)}
                        style={{ padding: '6px 14px', border: '1.5px solid', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: p === page ? 700 : 400, background: p === page ? '#1e3a5f' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#1e3a5f' : '#d1d5db' }}>{p}</button>
                    </>
                  ))}
                <button onClick={() => search(page + 1)} disabled={page >= pages}
                  style={{ padding: '6px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: page >= pages ? 'not-allowed' : 'pointer', opacity: page >= pages ? 0.4 : 1, fontSize: 13 }}>▶</button>
              </div>
            )}
          </>
        )}

        <footer style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.8 }}>
          <p style={{ margin: 0 }}>受験スケジュールナビ ／ 掲載情報は参考です。出願前に必ず各校公式サイトでご確認ください。</p>
          <p style={{ margin: '4px 0 0' }}>学校推薦型選抜は公募制のみ掲載しています。指定校制は対象外です。</p>
        </footer>
      </div>
    </>
  )
}