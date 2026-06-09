import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Badge,
  Code2,
  Image as ImageIcon,
  ListChecks,
  Repeat2,
  Search,
  UserRound,
} from 'lucide-react'
import { DimensionBars } from './components/DimensionBars.jsx'
import {
  CORE_REVIEW_DIMENSIONS,
  DIMENSION_MAP,
  DIMENSION_TAGS,
  DIMENSIONS,
  OPTIONAL_REVIEW_DIMENSIONS,
} from './data/dimensions.js'
import { AUXILIARY_ROLE_MAP, AUXILIARY_ROLES } from './data/roles.js'
import { QUESTIONS } from './data/questions.js'
import { sampleUsers } from './data/sampleUser.js'
import {
  buildProfileModel,
  calculateDimensionScores,
  generateCollaborationCode,
  getCodeDimensions,
  getDimensionExplanation,
  getTopProjectDimensions,
} from './lib/scoring.js'

const STORAGE_KEY = 'zhaoshui.currentUser.v1'

const ABILITY_FILTER_OPTIONS = [
  '用户研究',
  '资料整理',
  '访谈记录',
  '案例分析',
  'PPT结构',
  '视觉排版',
  '原型制作',
  '汇报表达',
  '视频剪辑',
  '代码实现',
  '模型制作',
  '流程图',
]

const DURATION_FILTER_OPTIONS = ['一周', '一月', '三月', '半年', '更长']

const COLLABORATION_MODE_OPTIONS = ['线上', '线下', '线上线下均可']

const emptyPeopleFilters = () => ({
  abilityTags: [],
  durationTags: [],
  collaborationModes: [],
})

const emptyAnswers = () => Array(QUESTIONS.length).fill(null)

const defaultSelfNotes = {
  missing: '',
  avoid: '',
  tryNext: '',
}

const emptyProjectDraft = () => ({
  projectId: '',
  name: '',
  description: '',
  time: '',
  selfDescription: '',
  reviews: [],
})

const projectToDraft = (project = {}) => ({
  projectId: project.projectId ?? '',
  name: project.name ?? project.projectName ?? '',
  description: project.description ?? project.projectDescription ?? '',
  time: project.time ?? project.projectTime ?? '',
  selfDescription: project.selfDescription ?? '',
  reviews: project.reviews ?? project.peerReviews ?? [],
})

const projectHasContent = (project = {}) =>
  ['name', 'description', 'time', 'selfDescription'].some((key) => project[key]?.trim())

const createProjectFromDraft = (project = {}, index = 0) => {
  const name = project.name?.trim()

  return {
    projectId: project.projectId?.trim() || `project-${Date.now()}-${index + 1}`,
    name: name || `未命名项目 ${index + 1}`,
    description: project.description?.trim() || '暂无项目简介。',
    time: project.time?.trim() || '未填写',
    selfDescription: project.selfDescription?.trim() || '尚未填写。',
    images: project.images ?? [],
    reviews: project.reviews ?? [],
  }
}

const normalizeProjectDrafts = (projects = [], fallbackProjects = []) => {
  const filledProjects = projects.filter(projectHasContent)
  if (filledProjects.length) return filledProjects.map(createProjectFromDraft)
  if (fallbackProjects.length) return fallbackProjects

  return [createDefaultProject()]
}

const createDefaultProject = () => ({
  projectId: 'current-project-1',
  name: '当前小组项目',
  description: '这是当前用户默认参与的项目，用于模拟同项目成员评价。',
  time: '进行中',
  selfDescription: '尚未填写。',
  images: [],
  reviews: [],
})

const getRawProjects = (user) => {
  if (Array.isArray(user.projects) && user.projects.length) return user.projects

  return [
    {
      ...createDefaultProject(),
      selfDescription: user.selfNotes?.tryNext || '尚未填写。',
      reviews: user.peerReviews ?? [],
    },
  ]
}

const actionPhrases = {
  I: '打开新的讨论方向',
  S: '整理逻辑与任务结构',
  E: '推进任务并完成产出',
  C: '连接成员并维持互动',
  R: '识别风险和判断问题',
  A: '根据小组缺口灵活补位',
  X: '主动表达并展示贡献',
  T: '在压力节点被快速激活',
  D: '搜集资料与证据',
  V: '包装视觉呈现',
  P: '完成专业技术实现',
  O: '承担汇报与对外说明',
}

function loadStoredUser() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistStoredUser(user) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

function removeStoredUser() {
  window.localStorage.removeItem(STORAGE_KEY)
}

function createProfileFromAnswers(answers) {
  const initialScores = calculateDimensionScores(answers)
  const initialCode = generateCollaborationCode(initialScores)

  return {
    id: 'current-user',
    name: '我的协作卡',
    answers,
    initialScores,
    initialCode,
    abilityTags: [],
    durationTags: [],
    collaborationMode: '',
    personalTags: [],
    selfNotes: defaultSelfNotes,
    projects: [createDefaultProject()],
    peerReviews: [],
    createdAt: new Date().toISOString(),
  }
}

function getSystemExplanation(code) {
  const phrases = code
    .split('')
    .map((letter) => actionPhrases[letter])
    .filter(Boolean)

  return `你在合作中通常能够${phrases.join('、')}。但这只是系统把协作方式压缩成标签后的第一版读数，它方便被检索，也可能遮住更复杂的你。`
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => loadStoredUser())
  const [view, setView] = useState('home')
  const [answers, setAnswers] = useState(() => currentUser?.answers ?? emptyAnswers())
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedSampleId, setSelectedSampleId] = useState(sampleUsers[0].id)
  const [selectedProjectId, setSelectedProjectId] = useState('current-project-1')
  const [chatMessages, setChatMessages] = useState([])

  const currentProfile = useMemo(
    () => (currentUser ? buildProfileModel(currentUser) : null),
    [currentUser],
  )
  const sampleProfiles = useMemo(() => sampleUsers.map((user) => buildProfileModel(user)), [])
  const selectedSampleProfile = useMemo(
    () => sampleProfiles.find((profile) => profile.id === selectedSampleId) ?? sampleProfiles[0],
    [sampleProfiles, selectedSampleId],
  )

  const saveCurrentUser = (nextUser) => {
    setCurrentUser(nextUser)
    persistStoredUser(nextUser)
  }

  const startQuiz = () => {
    setAnswers(emptyAnswers())
    setQuestionIndex(0)
    setView('quiz')
  }

  const finishQuiz = (finalAnswers) => {
    const nextUser = createProfileFromAnswers(finalAnswers)
    saveCurrentUser(nextUser)
    setView('initial-result')
  }

  const resetAndRestart = () => {
    removeStoredUser()
    setCurrentUser(null)
    startQuiz()
  }

  const submitSelfNotes = (selfNotes, projects = []) => {
    if (!currentUser) return
    const nextProjects = normalizeProjectDrafts(projects, getRawProjects(currentUser))

    saveCurrentUser({
      ...currentUser,
      selfNotes,
      projects: nextProjects,
    })
    setView('profile')
  }

  const addProjectToCurrentUser = (projectDraft) => {
    if (!currentUser) return
    const projects = getRawProjects(currentUser)
    const nextProject = createProjectFromDraft(projectDraft, projects.length)

    saveCurrentUser({
      ...currentUser,
      projects: [...projects, nextProject],
      peerReviews: [],
    })
    setSelectedProjectId(nextProject.projectId)
  }

  const submitPeerReview = (review) => {
    if (!currentUser) return
    const projects = getRawProjects(currentUser)
    const targetProjectId = selectedProjectId || projects[0]?.projectId

    saveCurrentUser({
      ...currentUser,
      projects: projects.map((project) =>
        project.projectId === targetProjectId
          ? { ...project, reviews: [...(project.reviews ?? []), review] }
          : project,
      ),
      peerReviews: [],
    })
    setView('profile')
  }

  return (
    <main className="flowing-bg min-h-screen px-4 py-5 text-ink md:px-8 md:py-8">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5">
        <AppHeader
          onHome={() => setView('home')}
          onOpenProfile={() => setView(currentProfile ? 'profile' : 'sea')}
          onOpenSea={() => setView('sea')}
        />

        {view === 'home' && (
          <HomePage
            hasProfile={Boolean(currentProfile)}
            onOpenExisting={() => setView(currentProfile ? 'profile' : 'sea')}
            onStart={startQuiz}
          />
        )}

        {view === 'quiz' && (
          <QuizPage
            answers={answers}
            currentIndex={questionIndex}
            onBack={() => setQuestionIndex((index) => Math.max(0, index - 1))}
            onChangeAnswer={(answerKey) => {
              setAnswers((previous) => {
                const nextAnswers = [...previous]
                nextAnswers[questionIndex] = answerKey
                return nextAnswers
              })
            }}
            onNext={() => {
              if (questionIndex === QUESTIONS.length - 1) {
                finishQuiz(answers)
                return
              }
              setQuestionIndex((index) => index + 1)
            }}
          />
        )}

        {view === 'initial-result' && currentProfile && (
          <InitialResultPage profile={currentProfile} onContinue={() => setView('self-notes')} />
        )}

        {view === 'self-notes' && currentProfile && (
          <SelfSupplementPage
            initialNotes={currentProfile.selfNotes}
            initialProjects={currentProfile.projects}
            onSubmit={submitSelfNotes}
          />
        )}

        {view === 'profile' && currentProfile && (
          <ProfilePage
            onAddProject={addProjectToCurrentUser}
            onInviteProject={(projectId) => {
              setSelectedProjectId(projectId)
              setView('review')
            }}
            onOpenSample={() => setView('sea')}
            onRestart={resetAndRestart}
            profile={currentProfile}
          />
        )}

        {view === 'review' && currentProfile && (
          <PeerReviewPage
            onCancel={() => setView('profile')}
            onSubmit={submitPeerReview}
            profile={currentProfile}
            project={
              currentProfile.projects.find((project) => project.projectId === selectedProjectId) ??
              currentProfile.projects[0]
            }
          />
        )}

        {view === 'sea' && (
          <PeopleSeaPage
            onOpenProfile={(profileId) => {
              setSelectedSampleId(profileId)
              setView('sample')
            }}
            profiles={sampleProfiles}
          />
        )}

        {view === 'sample' && (
          <ProfilePage
            isSample
            onChat={() => {
              setChatMessages([])
              setView('chat')
            }}
            onOpenSample={() => setView('sea')}
            onRestart={startQuiz}
            profile={selectedSampleProfile}
          />
        )}

        {view === 'chat' && (
          <ChatPage
            messages={chatMessages}
            onBack={() => setView('sample')}
            onSend={(message) => {
              const text = message.trim()
              if (!text) return
              setChatMessages((previous) => [
                ...previous,
                { id: `me-${Date.now()}`, sender: '我', text },
                {
                  id: `reply-${Date.now()}`,
                  sender: selectedSampleProfile.name,
                  text: getMockReply(selectedSampleProfile),
                },
              ])
            }}
            profile={selectedSampleProfile}
          />
        )}
      </div>
    </main>
  )
}

function AppHeader({ onHome, onOpenProfile, onOpenSea }) {
  return (
    <header className="site-header">
      <div className="grid items-center gap-4 md:grid-cols-[auto_1fr]">
        <button className="brand-title" onClick={onHome} type="button">
          <span>找谁</span>
          <span className="brand-title-en">WhoTo</span>
        </button>

        <nav className="flex items-center justify-start gap-8 md:justify-end">
          <button className="nav-link" onClick={onHome} type="button">
            首页
          </button>
          <button className="nav-link" onClick={onOpenSea} type="button">
            人海
          </button>
          <button className="nav-link" onClick={onOpenProfile} type="button">
            当前用户
          </button>
        </nav>
      </div>
    </header>
  )
}

function HomePage({ hasProfile, onOpenExisting, onStart }) {
  return (
    <section className="home-hero">
      <div className="home-stage">
        <div className="home-copy">
        <h1 className="home-title">
          <span>找谁</span>
          <span className="home-title-en">WhoTo</span>
        </h1>

        <div className="home-subtitle">
          <p>小组合作的角色评价系统</p>
          <p className="home-subtitle-en">A Role and Rating System for Student Collaboration</p>
        </div>

        <div className="home-actions">
          <button className="home-button home-button-primary" onClick={onStart} type="button">
            开始生成我的类型
            <span aria-hidden="true">→</span>
          </button>
          <button className="home-button home-button-secondary" onClick={onOpenExisting} type="button">
            已有角色
            <span aria-hidden="true">→</span>
          </button>
        </div>
        </div>
      </div>
    </section>
  )
}

function PeopleSeaPage({ onOpenProfile, profiles }) {
  const [filters, setFilters] = useState(() => emptyPeopleFilters())
  const filteredProfiles = useMemo(
    () => profiles.filter((profile) => matchesPeopleFilters(profile, filters)),
    [filters, profiles],
  )
  const hasFilters = Object.values(filters).some((values) => values.length > 0)

  const toggleFilter = (group, value) => {
    setFilters((previous) => {
      const selectedValues = previous[group]
      const nextValues = selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]

      return { ...previous, [group]: nextValues }
    })
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-[34px] border border-ink bg-paper/85 p-5 shadow-card md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate">People Sea</p>
            <h2 className="mt-2 font-sans text-4xl font-bold leading-tight text-ink md:text-5xl">人海</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate">
            <span>{filteredProfiles.length} / {profiles.length} 个协作对象</span>
            <button
              className="rounded-full border border-ink/20 bg-white/50 px-4 py-2 text-xs font-bold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!hasFilters}
              onClick={() => setFilters(emptyPeopleFilters())}
              type="button"
            >
              重置筛选
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <PeopleFilterGroup
            label="可参与任务"
            onToggle={(value) => toggleFilter('abilityTags', value)}
            options={ABILITY_FILTER_OPTIONS}
            selected={filters.abilityTags}
          />
          <PeopleFilterGroup
            label="可接受项目时长"
            onToggle={(value) => toggleFilter('durationTags', value)}
            options={DURATION_FILTER_OPTIONS}
            selected={filters.durationTags}
          />
          <PeopleFilterGroup
            label="合作形式"
            onToggle={(value) => toggleFilter('collaborationModes', value)}
            options={COLLABORATION_MODE_OPTIONS}
            selected={filters.collaborationModes}
          />
        </div>
      </article>

      {filteredProfiles.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <PeopleCard key={profile.id} onOpenProfile={onOpenProfile} profile={profile} />
          ))}
        </div>
      ) : (
        <article className="rounded-[30px] border border-dashed border-ink/20 bg-paper/75 p-10 text-center shadow-card">
          <p className="text-sm font-bold text-slate">暂时没有找到合适的协作对象。</p>
        </article>
      )}
    </section>
  )
}

function matchesPeopleFilters(profile, filters) {
  const abilityMatched = matchAny(profile.abilityTags, filters.abilityTags)
  const durationMatched = matchAny(profile.durationTags, filters.durationTags)
  const modeMatched = matchCollaborationMode(profile.collaborationMode, filters.collaborationModes)

  return abilityMatched && durationMatched && modeMatched
}

function matchAny(values = [], selectedValues = []) {
  if (!selectedValues.length) return true
  return selectedValues.some((value) => values.includes(value))
}

function matchCollaborationMode(mode = '', selectedModes = []) {
  if (!selectedModes.length) return true

  return selectedModes.some((selectedMode) => {
    if (selectedMode === '线上') return mode === '线上' || mode === '线上线下均可'
    if (selectedMode === '线下') return mode === '线下' || mode === '线上线下均可'
    return mode === selectedMode
  })
}

function PeopleFilterGroup({ label, onToggle, options, selected }) {
  return (
    <section className="grid gap-2 md:grid-cols-[7.5rem_1fr] md:items-start">
      <p className="pt-1 text-xs font-bold text-slate">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip key={option} onClick={() => onToggle(option)} selected={selected.includes(option)}>
            {option}
          </FilterChip>
        ))}
      </div>
    </section>
  )
}

function FilterChip({ children, onClick, selected }) {
  return (
    <button
      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition hover:-translate-y-0.5 ${
        selected
          ? 'border-[#06102a] bg-[#06102a] text-white shadow-sticker'
          : 'border-ink/10 bg-white/35 text-ink hover:border-ink/30 hover:bg-white/60'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function PeopleCard({ onOpenProfile, profile }) {
  const code = profile.code ?? profile.updatedCode ?? profile.comprehensiveCode
  const dimensions = profile.dimensions ?? getCodeDimensions(code).map((dimension) => dimension.name)
  const keywords = profile.keywords ?? []
  const personalTags = profile.personalTags ?? []
  const abilityTags = profile.abilityTags ?? []
  const durationTags = profile.durationTags ?? []
  const projectCount = profile.projectCount ?? profile.projects.length
  const reviewCount = profile.reviewCount ?? profile.allProjectReviews.length
  const latestProject = profile.latestProject ?? profile.projects[0]?.name ?? '暂无项目'

  return (
    <button
      className="group rounded-[30px] border border-ink/20 bg-paper/85 p-5 text-left shadow-card transition hover:-translate-y-1 hover:border-ink hover:bg-white/80"
      onClick={() => onOpenProfile(profile.id)}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink bg-white/75 text-lg font-black text-ink">
            {profile.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-ink">{profile.name}</p>
            <p className="mt-1 truncate text-xs text-slate">{profile.major}</p>
          </div>
        </div>
        <span className="rounded-full border border-ink bg-white/70 px-3 py-1.5 font-mono text-sm font-bold text-ink">
          {code} 型
        </span>
      </div>

      <p className="mt-4 text-sm font-bold text-olive">{dimensions.slice(0, 3).join(' / ')}</p>

      <TagRow className="mt-4" tags={keywords.slice(0, 3)} variant="quiet" />
      <TagRow className="mt-3" tags={personalTags.slice(0, 3)} variant="accent" />

      <div className="mt-5 rounded-[22px] border border-ink/10 bg-white/40 p-4">
        <p className="text-[11px] font-bold text-slate">可参与任务</p>
        <TagRow className="mt-2" tags={abilityTags.slice(0, 4)} variant="outline" />
        <div className="mt-4 grid gap-3 text-xs text-slate sm:grid-cols-2">
          <div>
            <p className="font-bold text-ink">可接受时长</p>
            <p className="mt-1">{durationTags.join(' / ') || '暂未设置'}</p>
          </div>
          <div>
            <p className="font-bold text-ink">合作形式</p>
            <p className="mt-1">{profile.collaborationMode || '暂未设置'}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <MiniStat label="参与项目" value={`${projectCount} 个`} />
        <MiniStat label="收到评价" value={`${reviewCount} 条`} />
      </div>

      <div className="mt-4 rounded-[22px] border border-ink/10 bg-paper/65 p-4">
        <p className="text-[11px] font-bold text-slate">最近项目</p>
        <p className="mt-1 truncate text-sm font-bold text-ink">{latestProject}</p>
        <p className="mt-3 line-clamp-2 text-xs leading-6 text-slate">{profile.reason}</p>
      </div>
    </button>
  )
}

function TagRow({ className = '', tags = [], variant = 'quiet' }) {
  const variantClass = {
    accent: 'border-[#06102a] bg-[#06102a] text-white',
    outline: 'border-ink/15 bg-white/45 text-ink',
    quiet: 'border-ink/10 bg-paper/70 text-slate',
  }[variant]

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span key={tag} className={`rounded-full border px-3 py-1 text-xs font-bold ${variantClass}`}>
          {tag}
        </span>
      ))}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/45 p-3">
      <p className="text-[11px] font-bold text-slate">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-ink">{value}</p>
    </div>
  )
}

function QuizPage({ answers, currentIndex, onBack, onChangeAnswer, onNext }) {
  const question = QUESTIONS[currentIndex]
  const selectedAnswer = answers[currentIndex]
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <article className="rounded-[34px] border border-ink/10 bg-white/80 p-5 shadow-card md:p-8">
        <div className="flex flex-col gap-5 border-b border-dashed border-ink/20 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate">
              Question {String(currentIndex + 1).padStart(2, '0')} / {QUESTIONS.length}
            </p>
            <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-snug text-ink md:text-3xl">
              {question.question}
            </h2>
          </div>
          <div className="min-w-56 rounded-2xl border border-ink/10 bg-paper p-4">
            <div className="flex justify-between text-xs text-slate">
              <span>当前进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4">
          {question.options.map((option) => {
            const selected = selectedAnswer === option.key
            return (
              <button
                className={`group rounded-[26px] border p-5 text-left transition ${
                  selected
                    ? 'border-ink bg-accentSoft shadow-sticker'
                    : 'border-ink/10 bg-paper/50 hover:-translate-y-0.5 hover:border-ink/30 hover:bg-white'
                }`}
                key={option.key}
                onClick={() => onChangeAnswer(option.key)}
                type="button"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/25 bg-white font-mono text-sm">
                    {option.key}
                  </span>
                  <div>
                    <p className="text-base leading-7 text-ink">{option.text}</p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
                      {Object.entries(option.scores)
                        .map(([dimension, value]) => `${dimension}${value > 0 ? '+' : ''}${value}`)
                        .join(' / ')}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button className="btn-secondary" disabled={currentIndex === 0} onClick={onBack} type="button">
            上一步
          </button>
          <button className="btn-primary" disabled={!selectedAnswer} onClick={onNext} type="button">
            {currentIndex === QUESTIONS.length - 1 ? '生成初始结果' : '下一步'}
          </button>
        </div>
      </article>

      <aside className="rounded-[34px] border border-ink/10 bg-shell p-5 shadow-card">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">Answer Map</p>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {QUESTIONS.map((item, index) => {
            const answered = Boolean(answers[index])
            const active = index === currentIndex

            return (
              <div
                className={`flex aspect-square items-center justify-center rounded-2xl border font-mono text-xs ${
                  active
                    ? 'border-accentDeep bg-accentSoft text-ink'
                    : answered
                      ? 'border-ink/20 bg-white text-ink'
                      : 'border-ink/10 bg-paper/60 text-slate'
                }`}
                key={item.id}
              >
                {String(index + 1).padStart(2, '0')}
              </div>
            )
          })}
        </div>
        <div className="mt-6 rotate-[-1deg] rounded-[24px] border border-accentDeep/15 bg-accentSoft/80 p-5 shadow-sticker">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">批注</p>
          <p className="mt-3 text-sm leading-7 text-olive">
            每一道选择都会被翻译成维度分数。翻译越顺滑，越需要留意：人也越容易被系统当成一种输入格式。
          </p>
        </div>
      </aside>
    </section>
  )
}

function InitialResultPage({ onContinue, profile }) {
  const codeDimensions = getCodeDimensions(profile.initialCode)

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[34px] border border-ink/10 bg-white/80 p-6 shadow-card md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate">Initial System Result</p>
        <div className="mt-5">
          <h2 className="font-sans text-6xl font-bold leading-none text-ink">{profile.initialCode} 型</h2>
          <p className="mt-4 text-lg text-olive">{getDimensionExplanation(profile.initialCode)}较高</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.initialAuxiliaryRoles.map((role) => (
              <RolePill key={role.id} role={role} />
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-3">
          {codeDimensions.map((dimension) => (
            <div key={dimension.key} className="rounded-2xl border border-ink/10 bg-paper/60 p-4">
              <p className="font-mono text-xs text-slate">{dimension.key}</p>
              <p className="mt-1 font-medium text-ink">{dimension.name}</p>
              <p className="mt-2 text-sm leading-6 text-olive">{dimension.description}</p>
            </div>
          ))}
        </div>

        <section className="mt-7 rounded-[26px] border border-accentDeep/15 bg-accentSoft/50 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">System Explanation</p>
          <p className="mt-3 text-sm leading-7 text-olive">{getSystemExplanation(profile.initialCode)}</p>
        </section>

        <button className="btn-primary mt-7 w-full justify-center" onClick={onContinue} type="button">
          继续到自我补充（可跳过）
        </button>
      </article>

      <DimensionBars scores={profile.initialScores} title="系统初评维度分数" />
    </section>
  )
}

function SelfSupplementPage({ initialNotes, initialProjects = [], onSubmit }) {
  const [notes, setNotes] = useState(initialNotes ?? defaultSelfNotes)
  const [projectDrafts, setProjectDrafts] = useState(() =>
    initialProjects.length ? initialProjects.map(projectToDraft) : [emptyProjectDraft()],
  )

  const updateNote = (key, value) => {
    setNotes((previous) => ({ ...previous, [key]: value }))
  }

  const updateProjectDraft = (index, patch) => {
    setProjectDrafts((previous) =>
      previous.map((project, projectIndex) =>
        projectIndex === index ? { ...project, ...patch } : project,
      ),
    )
  }

  const addProjectDraft = () => {
    setProjectDrafts((previous) => [...previous, emptyProjectDraft()])
  }

  const removeProjectDraft = (index) => {
    setProjectDrafts((previous) =>
      previous.length <= 1 ? [emptyProjectDraft()] : previous.filter((_, projectIndex) => projectIndex !== index),
    )
  }

  const collectProjects = () => normalizeProjectDrafts(projectDrafts, initialProjects)

  return (
    <section className="mx-auto w-full max-w-4xl rounded-[36px] border border-ink/10 bg-white/80 p-6 shadow-card md:p-9">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate">Self Annotation Layer</p>
      <h2 className="mt-3 font-sans text-4xl font-bold text-ink">给系统标签加一层自己的批注</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-olive">
        这部分可以填写，也可以跳过。它不会改变初始分数，只会像贴在系统标签上的便签，提醒未来合作对象：标签之外还有边界、意愿和没有被看见的部分。
      </p>

      <div className="mt-8 grid gap-5">
        <StickyTextarea
          label="系统没写到的是"
          onChange={(value) => updateNote('missing', value)}
          placeholder="例如：我需要明确边界后才会更稳定地补位。"
          value={notes.missing}
        />
        <StickyTextarea
          label="我不希望被默认"
          onChange={(value) => updateNote('avoid', value)}
          placeholder="例如：不要默认我会负责所有收尾和救火。"
          value={notes.avoid}
        />
        <StickyTextarea
          label="本次合作中我想尝试"
          onChange={(value) => updateNote('tryNext', value)}
          placeholder="例如：我想尝试更早表达自己的判断，而不是只在最后补位。"
          value={notes.tryNext}
        />
      </div>

      <section className="mt-8 rounded-[30px] border border-ink/10 bg-paper/75 p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">Participation Projects</p>
            <h3 className="mt-2 text-2xl font-bold text-ink">添加我参与过的项目</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-olive">
              这里填写的是评价将来要绑定的项目。后续同项目成员评价时，会保存到对应项目下面。
            </p>
          </div>
          <button className="btn-secondary" onClick={addProjectDraft} type="button">
            添加一个项目
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          {projectDrafts.map((project, index) => (
            <ProjectDraftCard
              key={project.projectId || `new-project-${index}`}
              index={index}
              onChange={(patch) => updateProjectDraft(index, patch)}
              onRemove={() => removeProjectDraft(index)}
              project={project}
              removable={projectDrafts.length > 1 || projectHasContent(project)}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button className="btn-secondary" onClick={() => onSubmit({ ...defaultSelfNotes }, collectProjects())} type="button">
          跳过，直接生成个人页面
        </button>
        <button className="btn-primary" onClick={() => onSubmit(notes, collectProjects())} type="button">
          保存并生成个人页面
        </button>
      </div>
    </section>
  )
}

function ProjectDraftCard({ index, onChange, onRemove, project, removable = true }) {
  return (
    <article className="rounded-[24px] border border-ink/10 bg-white/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate">
          Project {String(index + 1).padStart(2, '0')}
        </p>
        {removable && (
          <button className="text-xs font-bold text-slate transition hover:text-ink" onClick={onRemove} type="button">
            移除
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-ink">
          项目名称
          <input
            className="input-field"
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="例如：AI 美育短视频课程设计"
            value={project.name}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-ink">
          项目时间
          <input
            className="input-field"
            onChange={(event) => onChange({ time: event.target.value })}
            placeholder="例如：2026 春季 / 第 8-12 周"
            value={project.time}
          />
        </label>

        <ProjectPhotoUploadMock />

        <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">
          项目简介
          <textarea
            className="min-h-24 w-full resize-y rounded-2xl border border-ink/10 bg-paper/80 px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-slate/60 focus:border-ink/40 focus:bg-white"
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="简单写这个项目做什么、合作目标是什么。"
            value={project.description}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">
          我在该项目中的自我描述
          <textarea
            className="min-h-24 w-full resize-y rounded-2xl border border-ink/10 bg-paper/80 px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-slate/60 focus:border-ink/40 focus:bg-white"
            onChange={(event) => onChange({ selfDescription: event.target.value })}
            placeholder="例如：我主要负责资料整理、脚本结构和最后收尾。"
            value={project.selfDescription}
          />
        </label>
      </div>
    </article>
  )
}

function ProjectPhotoUploadMock() {
  return (
    <section className="md:col-span-2 rounded-[22px] border border-dashed border-ink/20 bg-shell/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <ImageIcon size={16} strokeWidth={1.8} />
            项目照片
          </p>
          <p className="mt-1 text-xs font-normal leading-6 text-slate">
            第一版为视觉占位，展示项目照片上传入口，暂不保存真实图片。
          </p>
        </div>
        <button className="btn-secondary pointer-events-none px-4 py-2 opacity-70" disabled type="button">
          上传照片
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            className="flex aspect-[16/9] items-center justify-center rounded-2xl border border-ink/10 bg-paper/70 text-xs font-bold text-slate"
            key={item}
          >
            待添加图片
          </div>
        ))}
      </div>
    </section>
  )
}

function ProfilePage({
  isSample = false,
  onAddProject,
  onChat,
  onInviteProject,
  onOpenSample,
  onRestart,
  profile,
}) {
  const prompt = profile.samplePrompt ?? getProfilePrompt(profile)

  return (
    <section className="grid gap-5">
      <article className="rounded-[36px] border border-ink/10 bg-paper/85 p-6 shadow-card md:p-8">
        <div className="max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate">
            {isSample ? 'Sample User Page' : 'Personal Collaboration Page'}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <h2 className="font-sans text-6xl font-bold leading-none text-ink">{profile.updatedCode} 型</h2>
            <span className={`status-stamp status-${profile.status.tone}`}>{profile.status.label}</span>
          </div>
          <p className="mt-4 text-lg text-olive">{getDimensionExplanation(profile.updatedCode)}较高</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate">{prompt}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MiniReport title="系统初始代码" value={`${profile.initialCode} 型`} />
          <MiniReport title="综合协作代码" value={`${profile.comprehensiveCode} 型`} />
          <MiniReport title="代码变化情况" value={`${profile.initialCode} → ${profile.comprehensiveCode}`} />
        </div>

        <section className="mt-6 rounded-[26px] border border-ink/10 bg-paper/70 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">Auxiliary Tendency Shift</p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <RoleList roles={profile.initialAuxiliaryRoles} />
            <span className="hidden font-mono text-slate md:block">→</span>
            <RoleList roles={profile.updatedAuxiliaryRoles} />
          </div>
        </section>
      </article>

      <MySkillsSection profile={profile} />

      <ProjectSection
        isSample={isSample}
        onAddProject={onAddProject}
        onInviteProject={onInviteProject}
        projects={profile.projects}
      />

      <section className="grid gap-5 md:grid-cols-2">
        <SelfNotesCard notes={profile.selfNotes} />
        <ReviewTagsCard tags={profile.reviewTags} />
      </section>

      <div className="flex flex-col gap-3 rounded-[30px] border border-ink/10 bg-paper/80 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
          {!isSample && (
            <button className="btn-secondary" onClick={onOpenSample} type="button">
              查看人海
            </button>
          )}
          {isSample ? (
            <button className="btn-primary" onClick={onChat} type="button">
              与Ta沟通
            </button>
          ) : (
            <button className="btn-secondary" onClick={onRestart} type="button">
              重新测试
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function getMockReply(profile) {
  const code = profile.comprehensiveCode
  const topProject = profile.projects[0]

  return `你好，我是${profile.name}。如果是和《${topProject.name}》类似的项目，你可以优先找我聊 ${getDimensionExplanation(code)} 相关的分工。`
}

function ChatPage({ messages, onBack, onSend, profile }) {
  const [draft, setDraft] = useState('')

  const send = () => {
    onSend(draft)
    setDraft('')
  }

  return (
    <section className="mx-auto grid w-full max-w-4xl gap-5">
      <article className="rounded-[34px] border border-ink bg-paper/85 p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate">Mock Contact</p>
            <h2 className="mt-3 text-4xl font-bold text-ink">与 {profile.name} 沟通</h2>
          </div>
          <button className="btn-secondary" onClick={onBack} type="button">
            返回个人页
          </button>
        </div>

        <div className="mt-6 min-h-80 rounded-[28px] border border-ink/20 bg-shell/70 p-4">
          <div className="grid gap-3">
            <ChatBubble
              sender={profile.name}
              text={`你好，我是${profile.name}。你可以问我适合在项目里承担什么，也可以直接说明你正在找什么样的组员。`}
            />
            {messages.map((message) => (
              <ChatBubble key={message.id} mine={message.sender === '我'} {...message} />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="input-field"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send()
            }}
            placeholder="输入一条模拟消息，例如：你适合负责什么？"
            value={draft}
          />
          <button className="btn-primary" onClick={send} type="button">
            发送
          </button>
        </div>
      </article>
    </section>
  )
}

function ChatBubble({ mine = false, sender, text }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-[24px] border border-ink p-4 ${mine ? 'bg-ink text-white' : 'bg-paper/90 text-ink'}`}>
        <p className={`text-xs font-bold ${mine ? 'text-white/70' : 'text-slate'}`}>{sender}</p>
        <p className="mt-2 text-sm leading-7">{text}</p>
      </div>
    </div>
  )
}

function ProjectSection({ isSample, onAddProject, onInviteProject, projects }) {
  const [showAddProject, setShowAddProject] = useState(false)
  const [projectDraft, setProjectDraft] = useState(() => emptyProjectDraft())
  const [projectError, setProjectError] = useState('')

  const updateProjectDraft = (patch) => {
    setProjectDraft((previous) => ({ ...previous, ...patch }))
    setProjectError('')
  }

  const submitProject = () => {
    if (!projectDraft.name.trim()) {
      setProjectError('请至少填写项目名称。')
      return
    }

    onAddProject?.(projectDraft)
    setProjectDraft(emptyProjectDraft())
    setShowAddProject(false)
  }

  return (
    <section className="rounded-[34px] border border-ink bg-paper/85 p-6 shadow-card md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">Participation Projects</p>
          <h3 className="mt-2 text-2xl font-bold text-ink">参与项目</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-ink px-3 py-1 text-xs text-slate">
            {projects.length} 个项目
          </span>
          {!isSample && (
            <button className="btn-secondary px-4 py-2" onClick={() => setShowAddProject((open) => !open)} type="button">
              {showAddProject ? '收起' : '添加参与项目'}
            </button>
          )}
        </div>
      </div>

      {!isSample && showAddProject && (
        <div className="mt-6 rounded-[28px] border border-dashed border-ink/20 bg-shell/70 p-5">
          <ProjectDraftCard
            index={projects.length}
            onChange={updateProjectDraft}
            onRemove={() => {
              setProjectDraft(emptyProjectDraft())
              setShowAddProject(false)
              setProjectError('')
            }}
            project={projectDraft}
          />
          {projectError && <p className="mt-3 text-sm font-bold text-ink">{projectError}</p>}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              className="btn-secondary"
              onClick={() => {
                setProjectDraft(emptyProjectDraft())
                setShowAddProject(false)
                setProjectError('')
              }}
              type="button"
            >
              取消
            </button>
            <button className="btn-primary" onClick={submitProject} type="button">
              保存项目
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-5">
        {projects.map((project) => (
          <article key={project.projectId} className="rounded-[30px] border border-ink/20 bg-white/60 p-5 shadow-sticker md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate">
                  {project.projectId} / {project.time}
                </p>
                <h4 className="mt-2 text-2xl font-bold text-ink">《{project.name}》</h4>
                <p className="mt-3 text-sm leading-7 text-olive">{project.description}</p>
              </div>
              <div className="min-w-40 rounded-2xl border border-ink bg-accentSoft p-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs text-slate">
                  <Code2 size={14} strokeWidth={1.8} />
                  项目协作代码
                </p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {project.projectCode ? `${project.projectCode} 型` : '待评价'}
                </p>
                <p className="mt-2 text-xs text-slate">{project.reviews.length} 条项目评价</p>
              </div>
            </div>

            <ProjectVisualPreview project={project} />

            <div className="mt-5 rounded-2xl border border-dashed border-ink/20 bg-shell/70 p-4">
              <p className="text-xs font-bold text-slate">用户在该项目中的自我描述</p>
              <p className="mt-2 text-sm leading-7 text-ink">{project.selfDescription || '尚未填写。'}</p>
            </div>

            <ProjectDimensionTrace project={project} />

            {project.projectAuxiliaryRoles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.projectAuxiliaryRoles.map((role) => (
                  <RolePill key={role.id} role={role} />
                ))}
              </div>
            )}

            <div className="mt-5">
              <p className="mb-3 text-xs font-bold text-slate">项目成员评价</p>
              <div className="grid gap-4 md:grid-cols-2">
              {project.reviews.length ? (
                project.reviews.map((review) => (
                  <ProjectReviewCard key={review.id} review={review} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-ink/20 bg-shell/70 p-4 text-sm leading-7 text-slate md:col-span-2">
                  这个项目还没有收到同项目成员评价。
                </div>
              )}
              </div>
            </div>

            {!isSample && (
              <button
                className="btn-primary mt-5"
                onClick={() => onInviteProject(project.projectId)}
                type="button"
              >
                邀请同项目成员评价
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function ProjectVisualPreview({ project }) {
  const images = Array.isArray(project.images) ? project.images.filter(Boolean).slice(0, 3) : []
  const visibleImages = images.length ? images : [null]
  const gridClass =
    visibleImages.length >= 3
      ? 'md:grid-cols-3'
      : visibleImages.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-1'

  return (
    <section className="mt-5 rounded-[26px] border border-ink/10 bg-shell/55 p-3">
      <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate">
        <ImageIcon size={15} strokeWidth={1.8} />
        内容展示
      </div>
      <div className={`grid gap-3 ${gridClass}`}>
        {visibleImages.map((image, index) => (
          <ProjectImageFrame
            className="aspect-[16/9]"
            image={image}
            key={image || `${project.projectId}-placeholder-${index}`}
            label={`${project.name} ${index + 1}`}
            tone={index}
          />
        ))}
      </div>
    </section>
  )
}

function ProjectImageFrame({ className = '', image, label, tone = 0 }) {
  const [failed, setFailed] = useState(false)
  const shouldShowImage = image && !failed

  return (
    <div className={`project-image-frame ${className}`}>
      {shouldShowImage ? (
        <img
          alt={`${label} 项目视觉预览`}
          className="h-full w-full object-cover opacity-90 saturate-[0.78]"
          onError={() => setFailed(true)}
          src={image}
        />
      ) : (
        <div className={`project-image-placeholder project-image-placeholder-${tone % 3}`} />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-ink/10" />
    </div>
  )
}

function ProjectDimensionTrace({ project }) {
  const topDimensions = getTopProjectDimensions(project, 5)

  return (
    <section className="mt-5 rounded-[24px] border border-ink/10 bg-paper/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate">项目维度表现</p>
        <span className="text-[11px] text-slate">{project.reviews.length ? '来自项目成员评价' : '暂无项目评价'}</span>
      </div>

      {topDimensions.length ? (
        <div className="mt-4 grid gap-3">
          {topDimensions.map((dimension) => (
            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] items-center gap-3" key={dimension.key}>
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="font-mono text-sm font-bold text-ink">{dimension.key}</span>
                <span className="truncate text-xs font-bold text-slate">{dimension.name}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-mist/70">
                <div
                  className="h-full rounded-full bg-ink/70 transition-all duration-500"
                  style={{ width: `${Math.min(100, (dimension.averageScore / 5) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-slate">{dimension.averageScore.toFixed(1)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-white/45 p-4 text-sm leading-7 text-slate">
          暂无项目评价，项目维度表现会在同项目成员提交评价后生成。
        </p>
      )}
    </section>
  )
}

function ProjectReviewCard({ review }) {
  const role = AUXILIARY_ROLE_MAP[review.auxiliaryRoleId]

  return (
    <article className="rounded-[24px] border border-ink/15 bg-paper/75 p-5 shadow-sticker">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <UserRound className="mt-0.5 text-slate" size={16} strokeWidth={1.8} />
          <div>
          <p className="font-bold text-ink">{review.reviewerName}</p>
          <p className="mt-1 text-xs text-slate">{role?.name ?? '未选择辅助倾向'}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-white/65 px-2.5 py-1 font-mono text-xs">
          <Badge size={14} strokeWidth={1.8} />
          {review.topDimensions?.join('') || '---'}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-olive">{review.comment}</p>
      <div className="mt-4 grid gap-3 text-xs leading-6 text-slate">
        <ReviewDetailRow icon={ListChecks} label="主要承担" value={review.contribution} />
        <ReviewDetailRow icon={Search} label="被低估的贡献" value={review.underestimated} />
        <ReviewDetailRow icon={AlertTriangle} label="过度调用的地方" value={review.overused} />
        <ReviewDetailRow icon={Repeat2} label="下次优先找 TA" value={review.nextCollaboration} />
      </div>
    </article>
  )
}

function ReviewDetailRow({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-[18px_minmax(0,1fr)] gap-2 rounded-2xl border border-ink/10 bg-white/45 p-3">
      <Icon className="mt-0.5 text-slate" size={16} strokeWidth={1.8} />
      <div>
        <p className="font-bold text-ink">{label}</p>
        <p className="mt-1 text-slate">{value || '未填写'}</p>
      </div>
    </div>
  )
}

function PeerReviewPage({ onCancel, onSubmit, profile, project }) {
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    reviewerName: '',
    topDimensions: [],
    ratingDimensions: [...CORE_REVIEW_DIMENSIONS],
    ratings: Object.fromEntries(
      [...CORE_REVIEW_DIMENSIONS, ...OPTIONAL_REVIEW_DIMENSIONS].map((dimension) => [dimension, 3]),
    ),
    auxiliaryRoleId: 'hidden-worker',
    contribution: '',
    comment: '',
    underestimated: '',
    overused: '',
    nextCollaboration: '',
  }))

  const updateForm = (patch) => {
    setForm((previous) => ({ ...previous, ...patch }))
  }

  const toggleTopDimension = (dimension) => {
    const exists = form.topDimensions.includes(dimension)

    if (exists) {
      updateForm({ topDimensions: form.topDimensions.filter((item) => item !== dimension) })
      return
    }

    if (form.topDimensions.length >= 3) return
    updateForm({ topDimensions: [...form.topDimensions, dimension] })
  }

  const toggleRatingDimension = (dimension) => {
    const exists = form.ratingDimensions.includes(dimension)
    updateForm({
      ratingDimensions: exists
        ? form.ratingDimensions.filter((item) => item !== dimension)
        : [...form.ratingDimensions, dimension],
    })
  }

  const submit = () => {
    if (form.topDimensions.length !== 3) {
      setError('请选择 TA 在这个项目中最明显的三个协作维度。')
      return
    }

    const role = AUXILIARY_ROLE_MAP[form.auxiliaryRoleId]
    const ratings = Object.fromEntries(
      form.ratingDimensions.map((dimension) => [dimension, form.ratings[dimension] ?? 3]),
    )

    onSubmit({
      id: `review-${Date.now()}`,
      reviewerName: form.reviewerName.trim() || '匿名',
      topDimensions: form.topDimensions,
      ratings,
      auxiliaryRoleId: form.auxiliaryRoleId,
      contribution: form.contribution.trim(),
      comment: form.comment.trim() || 'TA 在这个项目中的协作表现比较稳定，但还需要更多具体评价。',
      underestimated: form.underestimated.trim(),
      overused: form.overused.trim(),
      nextCollaboration: form.nextCollaboration.trim(),
      tags: [
        ...form.topDimensions.map((dimension) => DIMENSION_TAGS[dimension]).filter(Boolean),
        role?.name,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <article className="rounded-[36px] border border-ink/10 bg-white/80 p-6 shadow-card md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate">Project-bound Peer Review</p>
        <h2 className="mt-3 font-sans text-4xl font-bold text-ink">项目内成员评价</h2>
        <p className="mt-4 text-sm leading-7 text-olive">
          你正在评价：{profile.name} 在《{project.name}》项目中的表现。只有和 TA 参与过同一个项目的人，才应该填写这份评价。
        </p>

        <div className="mt-8 grid gap-6">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-ink">评价者姓名（选填）</span>
            <input
              className="input-field"
              onChange={(event) => updateForm({ reviewerName: event.target.value })}
              placeholder="不填则显示匿名"
              value={form.reviewerName}
            />
          </label>

          <FormBlock title="在这个项目中，TA 最明显的三个协作维度是什么？">
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {DIMENSIONS.map((dimension) => {
                const selected = form.topDimensions.includes(dimension.key)
                return (
                  <button
                    className={`dimension-chip ${selected ? 'dimension-chip-selected' : ''}`}
                    key={dimension.key}
                    onClick={() => toggleTopDimension(dimension.key)}
                    type="button"
                  >
                    <span className="font-mono">{dimension.key}</span>
                    <span>{dimension.name}</span>
                  </button>
                )
              })}
            </div>
          </FormBlock>

          <FormBlock title="在这个项目中，对 TA 的协作表现进行 1-5 分评分">
            <div className="mb-4 rounded-2xl border border-dashed border-ink/20 bg-paper/60 p-4">
              <p className="text-sm text-slate">默认评分 I / S / E / C / R / A，也可以加入 D / V / P / O。</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONAL_REVIEW_DIMENSIONS.map((dimension) => (
                  <button
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      form.ratingDimensions.includes(dimension)
                        ? 'border-accentDeep bg-accentSoft text-ink'
                        : 'border-ink/20 bg-white text-slate hover:border-ink/40'
                    }`}
                    key={dimension}
                    onClick={() => toggleRatingDimension(dimension)}
                    type="button"
                  >
                    {dimension} {DIMENSION_MAP[dimension].name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              {form.ratingDimensions.map((dimension) => (
                <RatingRow
                  dimension={dimension}
                  key={dimension}
                  onChange={(rating) =>
                    updateForm({ ratings: { ...form.ratings, [dimension]: rating } })
                  }
                  value={form.ratings[dimension]}
                />
              ))}
            </div>
          </FormBlock>

          <FormBlock title="在这个项目中，TA 更接近哪种辅助人格倾向？">
            <select
              className="input-field"
              onChange={(event) => updateForm({ auxiliaryRoleId: event.target.value })}
              value={form.auxiliaryRoleId}
            >
              {AUXILIARY_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}｜{role.alias}
                </option>
              ))}
            </select>
          </FormBlock>

          <StickyTextarea
            label="在这个项目中，TA 主要承担了什么？"
            onChange={(value) => updateForm({ contribution: value })}
            placeholder="例如：负责资料整理、推进进度、补齐最后交付内容。"
            value={form.contribution}
          />
          <StickyTextarea
            label="在这个项目中的一句评价"
            onChange={(value) => updateForm({ comment: value })}
            placeholder="例如：在这个项目里，TA 很会补位，但很多贡献不太容易被看见。"
            value={form.comment}
          />
          <StickyTextarea
            label="在这个项目中，TA 被低估的贡献是什么？"
            onChange={(value) => updateForm({ underestimated: value })}
            placeholder="例如：收尾、资料整理、临时救场。"
            value={form.underestimated}
          />
          <StickyTextarea
            label="在这个项目中，TA 是否被过度调用？体现在哪里？"
            onChange={(value) => updateForm({ overused: value })}
            placeholder="例如：大家默认 TA 会兜底。"
            value={form.overused}
          />
          <StickyTextarea
            label="如果下次再和 TA 合作，你会优先找 TA 做什么？"
            onChange={(value) => updateForm({ nextCollaboration: value })}
            placeholder="例如：项目收尾、进度推进、汇报表达。"
            value={form.nextCollaboration}
          />
        </div>

        {error && <p className="mt-5 rounded-2xl bg-accentSoft px-4 py-3 text-sm text-ink">{error}</p>}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button className="btn-secondary" onClick={onCancel} type="button">
            返回个人页面
          </button>
          <button className="btn-primary" onClick={submit} type="button">
            提交项目评价
          </button>
        </div>
      </article>

      <aside className="rounded-[36px] border border-ink/10 bg-shell p-6 shadow-card">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">Project Context</p>
        <div className="mt-5 space-y-4">
          <div className="rounded-[24px] border border-ink bg-white p-5">
            <p className="text-xs font-bold text-slate">当前绑定项目</p>
            <h3 className="mt-2 text-xl font-bold text-ink">《{project.name}》</h3>
            <p className="mt-3 text-sm leading-7 text-olive">{project.description}</p>
            <p className="mt-3 font-mono text-xs text-slate">{project.projectId} / {project.time}</p>
          </div>
          <div className="rotate-2 rounded-[24px] border border-ink/10 bg-white/70 p-5 shadow-sticker">
            <p className="text-sm leading-7 text-olive">
              这条评价会保存到对应 projectId 下，并参与该项目协作代码计算。
            </p>
          </div>
          <div className="-rotate-1 rounded-[24px] border border-accentDeep/15 bg-accentSoft/80 p-5 shadow-sticker">
            <p className="text-sm leading-7 text-olive">
              综合协作代码会汇总所有项目评价，而不是把任何一次项目表现直接当成完整的人。
            </p>
          </div>
        </div>
      </aside>
    </section>
  )
}

function getProfilePrompt(profile) {
  if (!profile.allProjectReviews.length) {
    return '当前页面还只有系统初评、参与项目和自我补充。同项目成员评价提交后，系统会分别计算项目协作代码和综合协作代码。'
  }

  return `你的核心维度从 ${profile.initialCode} 变为 ${profile.comprehensiveCode}。${profile.status.description} 这份页面同时展示了不同项目评价如何共同改写综合协作标签。`
}

function RolePill({ role }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white/70 px-3 py-1.5 text-sm text-ink">
      {role.name}
      <span className="text-xs text-slate">｜{role.alias}</span>
    </span>
  )
}

function RoleList({ roles }) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <RolePill key={role.id} role={role} />
      ))}
    </div>
  )
}

function MiniReport({ title, value }) {
  return (
    <section className="rounded-[24px] border border-ink/10 bg-paper/70 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate">{title}</p>
      <p className="mt-3 font-sans text-3xl font-bold text-ink">{value}</p>
    </section>
  )
}

function MySkillsSection({ profile }) {
  const abilityTags = profile.abilityTags ?? []
  const durationTags = profile.durationTags ?? []
  const collaborationMode = profile.collaborationMode || '暂未设置'

  return (
    <section className="rounded-[34px] border border-ink/20 bg-paper/85 p-6 shadow-card md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">
            MY COLLABORATION SKILLS
          </p>
          <h3 className="mt-2 text-2xl font-bold text-ink">我的能力</h3>
        </div>
        <span className="rounded-full border border-ink/15 bg-white/45 px-3 py-1 text-xs font-bold text-slate">
          这个人能参与什么
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <SkillTagBlock label="可参与任务" tags={abilityTags} variant="accent" />
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <SkillTagBlock label="可接受项目时长" tags={durationTags} variant="outline" />
          <div className="rounded-[22px] border border-ink/10 bg-white/40 p-4">
            <p className="text-xs font-bold text-slate">合作形式</p>
            <span className="mt-3 inline-flex rounded-full border border-ink/15 bg-white/55 px-3 py-1.5 text-xs font-bold text-ink">
              {collaborationMode}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function SkillTagBlock({ label, tags = [], variant = 'outline' }) {
  return (
    <div className="rounded-[22px] border border-ink/10 bg-white/40 p-4">
      <p className="text-xs font-bold text-slate">{label}</p>
      {tags.length ? (
        <TagRow className="mt-3" tags={tags} variant={variant} />
      ) : (
        <span className="mt-3 inline-flex rounded-full border border-dashed border-ink/20 bg-paper/70 px-3 py-1.5 text-xs font-bold text-slate">
          暂未设置
        </span>
      )}
    </div>
  )
}

function SelfNotesCard({ notes }) {
  const items = [
    ['系统没写到的是', notes?.missing],
    ['我不希望被默认', notes?.avoid],
    ['本次合作中我想尝试', notes?.tryNext],
  ]

  return (
    <section className="rounded-[30px] border border-accentDeep/15 bg-accentSoft/80 p-5 shadow-sticker">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">Self Notes</p>
      <div className="mt-4 grid gap-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-ink/10 bg-white/50 p-4">
            <p className="text-xs font-medium text-slate">{label}</p>
            <p className="mt-2 text-sm leading-7 text-ink">{value || '尚未填写。'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReviewTagsCard({ tags }) {
  return (
    <section className="rounded-[30px] border border-ink/10 bg-white/75 p-5 shadow-card">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">High Frequency Tags</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length ? (
          tags.map((tag) => (
            <span key={tag.label} className="rounded-full border border-ink/20 bg-paper px-3 py-1.5 text-sm text-ink">
              {tag.label} ×{tag.count}
            </span>
          ))
        ) : (
          <p className="text-sm leading-7 text-slate">暂无他人评价标签。邀请组员评价后，这里会出现高频贴纸。</p>
        )}
      </div>
    </section>
  )
}

function StickyTextarea({ label, onChange, placeholder, value }) {
  return (
    <label className="block rotate-[-0.5deg] rounded-[26px] border border-accentDeep/15 bg-accentSoft/80 p-5 shadow-sticker">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        className="mt-3 min-h-28 w-full resize-y rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm leading-7 text-ink outline-none transition placeholder:text-slate/70 focus:border-ink/40"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

function FormBlock({ children, title }) {
  return (
    <section className="rounded-[26px] border border-ink/10 bg-paper/60 p-5">
      <p className="mb-4 text-sm font-medium text-ink">{title}</p>
      {children}
    </section>
  )
}

function RatingRow({ dimension, onChange, value }) {
  const meta = DIMENSION_MAP[dimension]

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-ink">
            {meta.key} {meta.name}
          </p>
          <p className="mt-1 text-xs text-slate">{meta.description}</p>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-sm transition ${
                value === rating
                  ? 'border-accentDeep bg-accentSoft text-ink'
                  : 'border-ink/20 bg-paper text-slate hover:border-ink/40'
              }`}
              key={rating}
              onClick={() => onChange(rating)}
              type="button"
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
