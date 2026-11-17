import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, Check, Columns3, Ellipsis, Mail, MessageCircle, Pause, Phone, Play, Store, Table2 } from 'lucide-react';
import type { Merchant } from '@/types';
import { Avatar, Button, Drawer, ExternalButton, StatusBadge } from '@/components/ui';
import { AdminHeader, DrawerSection, Kv, Menu, MiniSelect, SearchField, Th, ViewSwitch, tableCls } from '@/components/admin/kit';
import { Meter } from '@/components/admin/charts';
import { customerWhatsapp, fmtInt, telHref } from '@/components/admin/data';
import { useMerchants } from '@/hooks/useData';
import { usePageMeta, useStore } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { merchantService } from '@/services/api';
import { storage } from '@/services/storage';
import { site } from '@/config/site';
import { activeCities, cityName } from '@/config/locations';
import { cn, formatDate, timeAgo } from '@/utils';

type MStatus = Merchant['status'];
const STAGES: { key: MStatus; label: string; hint: string; accent: string }[] = [
  { key: 'lead', label: 'Lead', hint: 'New sign-ups to qualify', accent: '#ff6a13' },
  { key: 'onboarding', label: 'Onboarding', hint: 'Docs, pricing & test runs', accent: '#1f5fe6' },
  { key: 'active', label: 'Active', hint: 'Live and shipping', accent: '#0f9d58' },
  { key: 'paused', label: 'Paused', hint: 'Temporarily inactive', accent: '#7f8aa8' },
];
const CHECKLIST = [
  { key: 'kyc', label: 'Business registration (CAC) received', hint: 'Document review is a future workflow — demo checkbox only.' },
  { key: 'contact', label: 'Primary contact verified by phone' },
  { key: 'pickup', label: 'Pickup locations & hours captured' },
  { key: 'pricing', label: 'Pricing tier agreed' },
  { key: 'settlement', label: 'Settlement details on file (demo)', hint: 'No real bank details are collected in this demo.' },
  { key: 'test', label: 'First test delivery completed' },
  { key: 'training', label: 'Merchant dashboard walkthrough' },
];
const CHECK_KEY = 'admin-merchant-checklist';
const readChecks = () => storage.get<Record<string, string[]>>(CHECK_KEY, {});

const volumeOf = (v: string) => {
  const nums = v.match(/\d+/g)?.map(Number) ?? [];
  if (v.includes('+')) return (nums[0] ?? 0) * 1.2;
  return nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0] ?? 0;
};

export default function MerchantsPage() {
  usePageMeta('Merchants');
  const merchants = useMerchants();
  const checks = useStore(CHECK_KEY, readChecks);
  const toast = useToast();
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [selId, setSelId] = useState<string | null>(null);
  const close = useCallback(() => setSelId(null), []);

  const industries = [...new Set(merchants.map((m) => m.industry))].sort();
  const list = useMemo(
    () => merchants.filter((m) => (city === 'all' || m.cityId === city) && (industry === 'all' || m.industry === industry) && (!q.trim() || [m.businessName, m.contactName, m.email, m.industry].join(' ').toLowerCase().includes(q.trim().toLowerCase()))),
    [merchants, city, industry, q],
  );

  const setStatus = (m: Merchant, status: MStatus) => {
    if (m.status === status) return;
    merchantService.update(m.id, { status });
    toast({ title: `${m.businessName} → ${STAGES.find((s) => s.key === status)?.label}`, body: 'Merchant status updated (demo).' });
  };
  const nextOf = (s: MStatus): MStatus | null => (s === 'lead' ? 'onboarding' : s === 'onboarding' ? 'active' : null);
  const sel = merchants.find((m) => m.id === selId) ?? null;
  const progress = (id: string) => Math.round(((checks[id]?.length ?? 0) / CHECKLIST.length) * 100);

  const actions = (m: Merchant) => [
    { label: 'Open details', onSelect: () => setSelId(m.id) },
    ...STAGES.filter((s) => s.key !== m.status).map((s) => ({ label: `Move to ${s.label}`, onSelect: () => setStatus(m, s.key) })),
  ];

  return (
    <div className="mx-auto max-w-[1440px]">
      <AdminHeader
        eyebrow="Partners"
        title="Merchants"
        description="Businesses using DoorstepGo for deliveries. Qualify leads, track onboarding and manage active accounts."
        actions={<ViewSwitch label="Merchants view" value={view} onChange={setView} options={[{ value: 'pipeline', label: 'Pipeline', icon: <Columns3 /> }, { value: 'table', label: 'Table', icon: <Table2 /> }]} />}
      >
        <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ['Merchants', merchants.length],
            ...STAGES.slice(0, 3).map((s) => [s.label, merchants.filter((m) => m.status === s.key).length] as const),
            ['Est. monthly deliveries', fmtInt(merchants.filter((m) => m.status === 'active').reduce((s, m) => s + volumeOf(m.monthlyVolume), 0))],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl border border-line bg-white px-3 py-2"><dt className="truncate text-[11px] font-semibold text-muted">{l}</dt><dd className="font-display text-lg font-bold text-ink-900 tabular-nums">{v}</dd></div>
          ))}
        </dl>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <SearchField className="md:w-72" value={q} onChange={setQ} placeholder="Search business, contact…" label="Search merchants" />
          <div className="grid grid-cols-2 gap-2 md:flex">
            <MiniSelect label="City" value={city} onChange={(e) => setCity(e.target.value)} options={[{ value: 'all', label: 'All cities' }, ...activeCities.map((c) => ({ value: c.id, label: c.name }))]} />
            <MiniSelect label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} options={[{ value: 'all', label: 'All industries' }, ...industries.map((i) => ({ value: i, label: i }))]} />
          </div>
          <span className="text-xs text-muted md:ml-auto">{list.length} of {merchants.length}</span>
        </div>
      </AdminHeader>

      {view === 'pipeline' ? (
        <div className="scrollbar-none -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="grid min-w-[980px] grid-cols-4 gap-3">
            {STAGES.map((s) => {
              const items = list.filter((m) => m.status === s.key);
              return (
                <section key={s.key} aria-label={`${s.label}, ${items.length} merchants`} className="flex min-h-[360px] flex-col rounded-2xl border border-line bg-surface-2/60 p-2">
                  <header className="px-1.5 pt-1 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="size-2 rounded-full" style={{ background: s.accent }} />
                      <h2 className="text-[13px] font-semibold text-ink-900">{s.label}</h2>
                      <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-text-2 tabular-nums ring-1 ring-line">{items.length}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted">{s.hint}</p>
                  </header>
                  <div className="flex flex-1 flex-col gap-2">
                    {items.map((m) => {
                      const next = nextOf(m.status);
                      return (
                        <article key={m.id} className="rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgb(10_22_64/0.05)] transition hover:border-brand-300 hover:shadow-soft">
                          <div className="flex items-start gap-2.5">
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-900 font-display text-xs font-bold text-white">{m.businessName.slice(0, 2).toUpperCase()}</span>
                            <div className="min-w-0 flex-1">
                              <button type="button" onClick={() => setSelId(m.id)} className="block truncate text-left text-[13px] font-semibold text-ink-900 hover:text-brand-700">{m.businessName}</button>
                              <p className="truncate text-[11px] text-muted">{m.industry} · {cityName(m.cityId)}</p>
                            </div>
                            <Menu label={`Actions for ${m.businessName}`} trigger={<Ellipsis className="size-4" />} items={actions(m)} />
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-2">
                            <span>{m.monthlyVolume}</span>
                            <span className="text-muted">{timeAgo(m.createdAt)}</span>
                          </div>
                          {m.status === 'onboarding' && (
                            <div className="mt-2">
                              <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted"><span>Checklist</span><span className="tabular-nums">{progress(m.id)}%</span></div>
                              <Meter value={progress(m.id)} label={`${m.businessName} onboarding progress`} />
                            </div>
                          )}
                          <div className="mt-2.5 flex gap-1.5 border-t border-line pt-2">
                            {next && <button type="button" onClick={() => setStatus(m, next)} className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand-50 px-2.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100">{next === 'onboarding' ? 'Start onboarding' : 'Activate'}<ArrowRight className="size-3" aria-hidden /></button>}
                            {m.status === 'active' && <button type="button" onClick={() => setStatus(m, 'paused')} className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-text-2 hover:bg-surface-2"><Pause className="size-3" aria-hidden />Pause</button>}
                            {m.status === 'paused' && <button type="button" onClick={() => setStatus(m, 'active')} className="inline-flex h-8 items-center gap-1 rounded-lg bg-ok-bg px-2.5 text-[11px] font-semibold text-ok hover:brightness-95"><Play className="size-3" aria-hidden />Resume</button>}
                            <button type="button" onClick={() => setSelId(m.id)} className="ml-auto h-8 rounded-lg px-2.5 text-[11px] font-semibold text-text-2 hover:bg-surface-2">Details</button>
                          </div>
                        </article>
                      );
                    })}
                    {!items.length && <p className="grid flex-1 place-items-center rounded-xl border border-dashed border-line-strong text-xs text-muted">Empty</p>}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className={tableCls.wrap}>
            <table className={tableCls.table}>
              <thead className={tableCls.head}>
                <tr><Th className="pl-4">Business</Th><Th>Contact</Th><Th>Industry</Th><Th>City</Th><Th>Volume</Th><Th>Status</Th><Th>Joined</Th><Th className="pr-4"><span className="sr-only">Actions</span></Th></tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id} className={tableCls.row}>
                    <td className="py-2.5 pr-3 pl-4"><button type="button" onClick={() => setSelId(m.id)} className="font-semibold text-ink-900 hover:text-brand-700">{m.businessName}</button></td>
                    <td className={tableCls.td}><p>{m.contactName}</p><p className="text-xs text-muted">{m.email}</p></td>
                    <td className={tableCls.td}>{m.industry}</td>
                    <td className={tableCls.td}>{cityName(m.cityId)}</td>
                    <td className={tableCls.td}>{m.monthlyVolume}</td>
                    <td className={tableCls.td}>
                      <label className="sr-only" htmlFor={`ms-${m.id}`}>Status for {m.businessName}</label>
                      <select id={`ms-${m.id}`} value={m.status} onChange={(e) => setStatus(m, e.target.value as MStatus)} className="h-8 rounded-lg border border-line-strong bg-white px-2 text-xs font-semibold">
                        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className={cn(tableCls.td, 'text-xs text-text-2')}>{formatDate(m.createdAt)}</td>
                    <td className="py-2.5 pr-4"><Menu label={`Actions for ${m.businessName}`} trigger={<Ellipsis className="size-4" />} items={actions(m)} /></td>
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={8} className="px-4 py-14 text-center text-sm text-muted">No merchants match.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer open={!!sel} onClose={close} title={sel?.businessName ?? 'Merchant'}>
        {sel && (
          <div className="text-sm">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid size-11 place-items-center rounded-xl bg-ink-900 text-white"><Store className="size-5" aria-hidden /></span>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold text-ink-900">{sel.industry}</p><p className="text-xs text-muted">{cityName(sel.cityId)} · since {formatDate(sel.createdAt)}</p></div>
              <StatusBadge status={sel.status} />
            </div>
            <DrawerSection title="Status pipeline">
              <div role="radiogroup" aria-label="Merchant status" className="grid grid-cols-4 gap-1">
                {STAGES.map((s, i) => {
                  const cur = STAGES.findIndex((x) => x.key === sel.status);
                  const active = s.key === sel.status;
                  return (
                    <button key={s.key} type="button" role="radio" aria-checked={active} onClick={() => setStatus(sel, s.key)} className={cn('rounded-lg px-1 py-2 text-[11px] font-semibold transition', active ? 'bg-ink-900 text-white' : i < cur && sel.status !== 'paused' ? 'bg-ok-bg text-ok' : 'bg-surface-2 text-text-2 hover:bg-brand-50 hover:text-brand-700')}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </DrawerSection>
            <DrawerSection title="Contact">
              <div className="flex items-center gap-3">
                <Avatar name={sel.contactName} size={36} />
                <div className="min-w-0"><p className="font-semibold text-ink-900">{sel.contactName}</p><p className="truncate text-xs text-muted">{sel.email}</p></div>
              </div>
              <dl className="mt-2 divide-y divide-line">
                <Kv label="Phone">{sel.phone}</Kv>
                <Kv label="Industry">{sel.industry}</Kv>
                <Kv label="City">{cityName(sel.cityId)}</Kv>
                <Kv label="Monthly volume">{sel.monthlyVolume}</Kv>
              </dl>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ExternalButton size="sm" variant="outline" href={`mailto:${sel.email}?subject=${encodeURIComponent(`${site.name} merchant onboarding`)}`} iconLeft={<Mail className="size-4" />}>Email</ExternalButton>
                <ExternalButton size="sm" variant="outline" href={telHref(sel.phone)} iconLeft={<Phone className="size-4" />}>Call</ExternalButton>
                <ExternalButton size="sm" variant="outline" target="_blank" rel="noreferrer" href={customerWhatsapp(sel.phone, `Hello ${sel.contactName.split(' ')[0]}, this is ${site.name} partnerships about ${sel.businessName}.`)} iconLeft={<MessageCircle className="size-4" />}>Chat</ExternalButton>
              </div>
            </DrawerSection>
            <DrawerSection title="Onboarding checklist" action={<span className="text-xs font-semibold text-ink-900 tabular-nums">{progress(sel.id)}%</span>}>
              <Meter value={progress(sel.id)} label="Onboarding progress" className="mb-3" />
              <ul className="space-y-1">
                {CHECKLIST.map((c) => {
                  const done = checks[sel.id]?.includes(c.key) ?? false;
                  return (
                    <li key={c.key}>
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-surface-2">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={(e) => storage.update<Record<string, string[]>>(CHECK_KEY, {}, (p) => {
                            const cur = new Set(p[sel.id] ?? []);
                            if (e.target.checked) cur.add(c.key); else cur.delete(c.key);
                            return { ...p, [sel.id]: [...cur] };
                          })}
                          className="mt-0.5 size-4 accent-brand-600"
                        />
                        <span>
                          <span className={cn('block font-medium', done ? 'text-muted line-through' : 'text-ink-900')}>{c.label}</span>
                          {c.hint && <span className="block text-[11px] text-muted">{c.hint}</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {progress(sel.id) === 100 && sel.status !== 'active' && (
                <Button size="sm" variant="brand" block className="mt-3" iconLeft={<Check className="size-4" />} onClick={() => setStatus(sel, 'active')}>Checklist complete — activate merchant</Button>
              )}
            </DrawerSection>
          </div>
        )}
      </Drawer>
    </div>
  );
}
