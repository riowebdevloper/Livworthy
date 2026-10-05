import React, { useEffect, useMemo, useState } from 'react';

type AdminUser = {
  userId?: string;
  id?: string;
  email: string;
  role: string;
};

type ContentPage = {
  id?: string;
  slug: string;
  locale: string;
  title: string;
  metaDescription: string;
  workflowState: string;
  isIndexable?: boolean;
  authorEmail?: string;
  reviewerEmail?: string | null;
  canonicalUrl?: string | null;
  blocksJson: unknown[];
  evidenceSourceIds: string[];
  updatedAt?: string;
};

const SESSION_KEY = 'livworthy_admin_session';

const emptyPage: ContentPage = {
  slug: '',
  locale: 'en',
  title: '',
  metaDescription: '',
  workflowState: 'DRAFTED',
  blocksJson: [],
  evidenceSourceIds: [],
};

async function requestJson<T>(
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

export const AdminApp: React.FC = () => {
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_KEY) || '');
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'reviews' | 'users' | 'audit'>('overview');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ContentPage>(emptyPage);
  const [blocksText, setBlocksText] = useState('[]');
  const [evidenceText, setEvidenceText] = useState('[]');
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>({});

  const canManageUsers = user?.role === 'ADMIN';
  const canSeeAudit = user?.role === 'ADMIN';
  const canEditContent = ['ADMIN', 'CONTENT_EDITOR'].includes(user?.role || '');
  const canReview = ['ADMIN', 'REVIEWER', 'SEO_REVIEWER'].includes(user?.role || '');
  const canPublish = ['ADMIN', 'REVIEWER'].includes(user?.role || '');
  const canApproveIndex = ['ADMIN', 'SEO_REVIEWER'].includes(user?.role || '');

  useEffect(() => {
    document.title = 'LivWorthy Admin';
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow, noarchive';
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    requestJson<{ user: AdminUser }>('/api/admin/me', token)
      .then((response) => setUser(response.user))
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setToken('');
        setUser(null);
      });
  }, [token]);

  const navItems = useMemo(() => {
    const items = [
      ['overview', 'Overview'],
      ['content', 'Content'],
      ['reviews', 'Reviews'],
    ] as const;
    return [
      ...items,
      ...(canManageUsers ? ([['users', 'Users']] as const) : []),
      ...(canSeeAudit ? ([['audit', 'Audit']] as const) : []),
    ];
  }, [canManageUsers, canSeeAudit]);

  async function refreshOverview() {
    const [health, tax, vitals, fx] = await Promise.all([
      requestJson<any>('/api/health/ready', token).catch((e) => ({ ready: false, error: e.message })),
      requestJson<any>('/api/tax/registry', token).catch((e) => ({ error: e.message })),
      requestJson<any>('/api/rum/summary', token).catch((e) => ({ error: e.message })),
      requestJson<any>('/api/fx/latest', token).catch((e) => ({ error: e.message })),
    ]);
    setOverview({ health, tax, vitals, fx });
  }

  async function refreshContent() {
    const result = await requestJson<{ pages: ContentPage[] }>('/api/content?locale=en', token);
    setPages(result.pages || []);
  }

  async function refreshReviews() {
    const result = await requestJson<{ reviews: any[] }>('/api/reviews', token);
    setReviews(result.reviews || []);
  }

  async function refreshUsers() {
    if (!canManageUsers) return;
    const result = await requestJson<{ users: any[] }>('/api/admin/users', token);
    setUsers(result.users || []);
  }

  async function refreshAudit() {
    if (!canSeeAudit) return;
    const result = await requestJson<{ logs: any[] }>('/api/admin/audit-logs?limit=100', token);
    setAuditLogs(result.logs || []);
  }

  useEffect(() => {
    if (!user) return;
    setError('');
    if (activeTab === 'overview') refreshOverview().catch((e) => setError(e.message));
    if (activeTab === 'content') refreshContent().catch((e) => setError(e.message));
    if (activeTab === 'reviews') {
      Promise.all([refreshReviews(), refreshContent()]).catch((e) => setError(e.message));
    }
    if (activeTab === 'users') refreshUsers().catch((e) => setError(e.message));
    if (activeTab === 'audit') refreshAudit().catch((e) => setError(e.message));
  }, [activeTab, user]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await requestJson<{ token: string; user: AdminUser }>('/api/admin/login', undefined, {
        method: 'POST',
        body: JSON.stringify({
          email: String(form.get('email') || ''),
          password: String(form.get('password') || ''),
          totpCode: String(form.get('totpCode') || '') || undefined,
        }),
      });
      sessionStorage.setItem(SESSION_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
    } catch (e: any) {
      setError(e.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setToken('');
    setUser(null);
  }

  function editPage(page: ContentPage) {
    setSelectedPage({ ...page });
    setBlocksText(JSON.stringify(page.blocksJson || [], null, 2));
    setEvidenceText(JSON.stringify(page.evidenceSourceIds || [], null, 2));
    setNotice('');
    setError('');
  }

  function newPage() {
    editPage({ ...emptyPage });
  }

  async function savePage(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const blocksJson = JSON.parse(blocksText || '[]');
      const evidenceSourceIds = JSON.parse(evidenceText || '[]');
      if (!Array.isArray(blocksJson) || !Array.isArray(evidenceSourceIds)) {
        throw new Error('Blocks and evidence source IDs must be JSON arrays.');
      }
      const result = await requestJson<{ page: ContentPage }>('/api/content', token, {
        method: 'POST',
        body: JSON.stringify({ ...selectedPage, blocksJson, evidenceSourceIds }),
      });
      setNotice(`Saved ${result.page.slug} as ${result.page.workflowState}.`);
      editPage(result.page);
      await refreshContent();
    } catch (e: any) {
      setError(e.message || 'Unable to save content.');
    } finally {
      setLoading(false);
    }
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    try {
      await requestJson('/api/reviews', token, {
        method: 'POST',
        body: JSON.stringify({
          contentPageId: String(form.get('contentPageId') || ''),
          status: String(form.get('status') || 'PENDING'),
          feedbackNotes: String(form.get('feedbackNotes') || ''),
          statutoryCheckPassed: form.get('statutoryCheckPassed') === 'on',
        }),
      });
      setNotice('Editorial review recorded.');
      formEl.reset();
      await refreshReviews();
    } catch (e: any) {
      setError(e.message || 'Unable to record review.');
    } finally {
      setLoading(false);
    }
  }


  async function transitionWorkflow(page: ContentPage, workflowState: string) {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const result = await requestJson<{ page: ContentPage }>(
        `/api/content/${encodeURIComponent(page.slug)}/workflow?locale=${encodeURIComponent(page.locale || 'en')}`,
        token,
        { method: 'POST', body: JSON.stringify({ workflowState }) },
      );
      setNotice(`${result.page.title} moved to ${result.page.workflowState}.`);
      await Promise.all([refreshContent(), refreshReviews()]);
    } catch (e: any) {
      setError(e.message || 'Unable to update workflow state.');
    } finally {
      setLoading(false);
    }
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    try {
      await requestJson('/api/admin/users', token, {
        method: 'POST',
        body: JSON.stringify({
          email: String(form.get('email') || ''),
          password: String(form.get('password') || ''),
          role: String(form.get('role') || 'READ_ONLY'),
        }),
      });
      setNotice('User saved.');
      formEl.reset();
      await refreshUsers();
    } catch (e: any) {
      setError(e.message || 'Unable to save user.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F7F8F5] flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-white border border-[#DCE3E0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <a href="/" className="text-sm font-black text-[#102A2E]">LivWorthy</a>
            <h1 className="text-2xl font-black text-[#102A2E] mt-4">Admin sign in</h1>
            <p className="text-sm text-[#60706D] mt-1">CMS, reviews, data operations and audit controls.</p>
          </div>
          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          <form onSubmit={login} className="space-y-4">
            <label className="block text-sm font-semibold text-[#102A2E]">
              Email
              <input name="email" type="email" required autoComplete="username" className="mt-1 w-full rounded-lg border border-[#DCE3E0] px-3 py-2.5 outline-none focus:border-[#167D75]" />
            </label>
            <label className="block text-sm font-semibold text-[#102A2E]">
              Password
              <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-[#DCE3E0] px-3 py-2.5 outline-none focus:border-[#167D75]" />
            </label>
            <label className="block text-sm font-semibold text-[#102A2E]">
              MFA code <span className="font-normal text-[#60706D]">(if enabled)</span>
              <input name="totpCode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="mt-1 w-full rounded-lg border border-[#DCE3E0] px-3 py-2.5 outline-none focus:border-[#167D75]" />
            </label>
            <button disabled={loading} className="w-full rounded-xl bg-[#102A2E] px-4 py-3 text-sm font-bold text-white hover:bg-[#167D75] disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#102A2E]">
      <header className="sticky top-0 z-20 border-b border-[#DCE3E0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <div className="font-black">LivWorthy Admin</div>
            <div className="text-xs text-[#60706D]">{user.email} · {user.role}</div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="rounded-lg border border-[#DCE3E0] px-3 py-2 text-xs font-semibold hover:bg-[#F7F8F5]">Public site</a>
            <button onClick={logout} className="rounded-lg bg-[#102A2E] px-3 py-2 text-xs font-semibold text-white">Sign out</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6" aria-label="Admin sections">
          {navItems.map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id as typeof activeTab)} className={`rounded-lg px-3 py-2 text-xs font-bold whitespace-nowrap ${activeTab === id ? 'bg-[#DDF2EC] text-[#0D625B]' : 'text-[#60706D] hover:bg-[#F7F8F5]'}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {notice && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Operations overview</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Readiness" value={overview.health?.ready ? 'Ready' : 'Needs attention'} detail={overview.health?.database || overview.health?.error || 'Loading'} />
              <Metric label="Tax adapters" value={String(overview.tax?.totalSupportedCountries ?? '—')} detail="Executable country adapters" />
              <Metric label="RUM samples" value={String(overview.vitals?.vitals?.totalSamples ?? '—')} detail="Recent web-vitals records" />
              <Metric label="FX status" value={overview.fx?.snapshot?.status || '—'} detail={overview.fx?.snapshot?.provider || 'Latest snapshot'} />
            </div>
            <button onClick={() => refreshOverview().catch((e) => setError(e.message))} className="rounded-lg border border-[#DCE3E0] bg-white px-4 py-2 text-sm font-bold">Refresh diagnostics</button>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <section className="rounded-2xl border border-[#DCE3E0] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h1 className="font-black">Content</h1>
                {canEditContent && <button onClick={newPage} className="rounded-lg bg-[#102A2E] px-3 py-2 text-xs font-bold text-white">New</button>}
              </div>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {pages.map((page) => (
                  <button key={page.id || `${page.locale}:${page.slug}`} onClick={() => editPage(page)} className="w-full rounded-xl border border-[#DCE3E0] p-3 text-left hover:border-[#167D75]">
                    <div className="text-sm font-bold">{page.title}</div>
                    <div className="mt-1 text-xs text-[#60706D]">/{page.slug} · {page.locale} · {page.workflowState}</div>
                  </button>
                ))}
                {pages.length === 0 && <p className="text-sm text-[#60706D]">No CMS pages found.</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-[#DCE3E0] bg-white p-4 sm:p-6">
              <h2 className="text-lg font-black">{selectedPage.slug ? 'Edit page' : 'Create page'}</h2>
              <form onSubmit={savePage} className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Slug"><input required value={selectedPage.slug} onChange={(e) => setSelectedPage({ ...selectedPage, slug: e.target.value.replace(/^\/+/, '') })} className="admin-input" /></Field>
                <Field label="Locale"><input required value={selectedPage.locale} onChange={(e) => setSelectedPage({ ...selectedPage, locale: e.target.value })} className="admin-input" /></Field>
                <div className="sm:col-span-2"><Field label="Title"><input required value={selectedPage.title} onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })} className="admin-input" /></Field></div>
                <div className="sm:col-span-2"><Field label="Meta description"><textarea required rows={3} value={selectedPage.metaDescription} onChange={(e) => setSelectedPage({ ...selectedPage, metaDescription: e.target.value })} className="admin-input" /></Field></div>
                <Field label="Workflow state">
                  <select value={selectedPage.workflowState} onChange={(e) => setSelectedPage({ ...selectedPage, workflowState: e.target.value })} className="admin-input">
                    <option>DRAFTED</option><option>IN_REVIEW</option>
                    {canReview && <option>APPROVED</option>}
                    {canPublish && <option>PUBLISHED</option>}
                    {canApproveIndex && <option>INDEX_APPROVED</option>}
                  </select>
                </Field>
                <Field label="Canonical URL"><input value={selectedPage.canonicalUrl || ''} onChange={(e) => setSelectedPage({ ...selectedPage, canonicalUrl: e.target.value })} className="admin-input" /></Field>
                <div className="sm:col-span-2"><Field label="Content blocks JSON"><textarea rows={10} value={blocksText} onChange={(e) => setBlocksText(e.target.value)} className="admin-input font-mono text-xs" /></Field></div>
                <div className="sm:col-span-2"><Field label="Evidence source IDs JSON"><textarea rows={5} value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} className="admin-input font-mono text-xs" /></Field></div>
                <div className="sm:col-span-2">
                  {canEditContent ? (
                    <button disabled={loading} className="rounded-xl bg-[#102A2E] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Saving…' : 'Save content'}</button>
                  ) : (
                    <p className="text-sm text-[#60706D]">Your role can inspect content here but cannot edit page fields.</p>
                  )}
                </div>
              </form>
            </section>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <section className="rounded-2xl border border-[#DCE3E0] bg-white p-4 sm:p-6">
              <h1 className="text-lg font-black">Record review</h1>
              {canReview ? (
                <form onSubmit={submitReview} className="mt-4 space-y-4">
                  <Field label="Content page">
                    <select name="contentPageId" required className="admin-input">
                      <option value="">Select page</option>
                      {pages.map((page) => <option key={page.id} value={page.id}>{page.title}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select name="status" className="admin-input"><option>PENDING</option><option>APPROVED</option><option>CHANGES_REQUESTED</option><option>REJECTED</option></select>
                  </Field>
                  <Field label="Feedback"><textarea name="feedbackNotes" rows={5} className="admin-input" /></Field>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="statutoryCheckPassed" defaultChecked /> Statutory check passed</label>
                  <button disabled={loading} className="rounded-xl bg-[#102A2E] px-4 py-2.5 text-sm font-bold text-white">Record review</button>
                </form>
              ) : <p className="mt-3 text-sm text-[#60706D]">Your role can view reviews but cannot submit them.</p>}
            </section>
            <section className="space-y-6">
              <div className="rounded-2xl border border-[#DCE3E0] bg-white p-4 sm:p-6">
                <h2 className="text-lg font-black">Workflow actions</h2>
                <div className="mt-4 space-y-3">
                  {pages.map((page) => (
                    <div key={page.id || page.slug} className="rounded-xl border border-[#DCE3E0] p-3">
                      <div className="text-sm font-bold">{page.title}</div>
                      <div className="mt-1 text-xs text-[#60706D]">/{page.slug} · {page.workflowState}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {canReview && <button disabled={loading} onClick={() => transitionWorkflow(page, 'APPROVED')} className="rounded-lg border border-[#DCE3E0] px-3 py-1.5 text-xs font-bold">Approve</button>}
                        {canPublish && <button disabled={loading} onClick={() => transitionWorkflow(page, 'PUBLISHED')} className="rounded-lg bg-[#102A2E] px-3 py-1.5 text-xs font-bold text-white">Publish</button>}
                        {canApproveIndex && <button disabled={loading} onClick={() => transitionWorkflow(page, 'INDEX_APPROVED')} className="rounded-lg bg-[#167D75] px-3 py-1.5 text-xs font-bold text-white">Approve indexing</button>}
                      </div>
                    </div>
                  ))}
                  {pages.length === 0 && <p className="text-sm text-[#60706D]">No content pages available.</p>}
                </div>
              </div>
              <div className="rounded-2xl border border-[#DCE3E0] bg-white p-4 sm:p-6">
              <h2 className="text-lg font-black">Review history</h2>
              <div className="mt-4 divide-y divide-[#DCE3E0]">
                {reviews.map((review) => <JsonRow key={review.id} item={review} />)}
                {reviews.length === 0 && <p className="py-4 text-sm text-[#60706D]">No reviews recorded.</p>}
              </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'users' && canManageUsers && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <section className="rounded-2xl border border-[#DCE3E0] bg-white p-4 sm:p-6">
              <h1 className="text-lg font-black">Add or update user</h1>
              <form onSubmit={createUser} className="mt-4 space-y-4">
                <Field label="Email"><input name="email" type="email" required className="admin-input" /></Field>
                <Field label="Password"><input name="password" type="password" required minLength={12} className="admin-input" /></Field>
                <Field label="Role">
                  <select name="role" className="admin-input">
                    {['ADMIN','DATA_EDITOR','CONTENT_EDITOR','REVIEWER','SEO_REVIEWER','READ_ONLY'].map((role) => <option key={role}>{role}</option>)}
                  </select>
                </Field>
                <button disabled={loading} className="rounded-xl bg-[#102A2E] px-4 py-2.5 text-sm font-bold text-white">Save user</button>
              </form>
            </section>
            <section className="rounded-2xl border border-[#DCE3E0] bg-white p-4 sm:p-6">
              <h2 className="text-lg font-black">Users</h2>
              <div className="mt-4 divide-y divide-[#DCE3E0]">
                {users.map((adminUser) => <JsonRow key={adminUser.id || adminUser.email} item={adminUser} />)}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'audit' && canSeeAudit && (
          <section className="rounded-2xl border border-[#DCE3E0] bg-white p-4 sm:p-6">
            <h1 className="text-lg font-black">Audit log</h1>
            <div className="mt-4 divide-y divide-[#DCE3E0]">
              {auditLogs.map((log) => <JsonRow key={log.id} item={log} />)}
              {auditLogs.length === 0 && <p className="py-4 text-sm text-[#60706D]">No audit records.</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; detail?: string }> = ({ label, value, detail }) => (
  <div className="rounded-2xl border border-[#DCE3E0] bg-white p-4">
    <div className="text-xs font-bold uppercase tracking-wide text-[#60706D]">{label}</div>
    <div className="mt-2 text-2xl font-black">{value}</div>
    {detail && <div className="mt-1 text-xs text-[#60706D]">{detail}</div>}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block text-xs font-bold uppercase tracking-wide text-[#60706D]">
    <span className="mb-1.5 block">{label}</span>
    {children}
  </label>
);

const JsonRow: React.FC<{ item: any }> = ({ item }) => (
  <details className="py-3">
    <summary className="cursor-pointer text-sm font-bold">
      {item.title || item.email || item.action || item.status || item.id || 'Record'}
      <span className="ml-2 text-xs font-normal text-[#60706D]">{item.role || item.workflowState || item.entityType || ''}</span>
    </summary>
    <pre className="mt-2 overflow-x-auto rounded-lg bg-[#F7F8F5] p-3 text-[11px] leading-relaxed">{JSON.stringify(item, null, 2)}</pre>
  </details>
);
