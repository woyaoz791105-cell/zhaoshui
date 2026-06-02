import {
  DIMENSION_KEYS,
  DIMENSION_MAP,
  DIMENSION_TAGS,
  DIMENSIONS,
} from '../data/dimensions.js'
import { AUXILIARY_ROLE_MAP, AUXILIARY_ROLES } from '../data/roles.js'
import { QUESTIONS } from '../data/questions.js'

const emptyScores = (value = 0) =>
  Object.fromEntries(DIMENSION_KEYS.map((dimension) => [dimension, value]))

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const roundScore = (value) => Number(clamp(value).toFixed(1))

const formulaScore = (weights, scores) =>
  Object.entries(weights).reduce((total, [dimension, weight]) => {
    return total + (scores[dimension] ?? 0) * weight
  }, 0)

const questionMaxScores = QUESTIONS.reduce((totals, question) => {
  DIMENSION_KEYS.forEach((dimension) => {
    const bestPositive = Math.max(
      0,
      ...question.options.map((option) => option.scores[dimension] ?? 0),
    )
    totals[dimension] += bestPositive
  })

  return totals
}, emptyScores())

export function rankDimensions(scores) {
  return DIMENSIONS.map((dimension, index) => ({
    ...dimension,
    score: Number((scores[dimension.key] ?? 0).toFixed(1)),
    order: index,
  })).sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score
    return left.order - right.order
  })
}

export function calculateDimensionScores(answers) {
  const rawScores = emptyScores()

  QUESTIONS.forEach((question, index) => {
    const answerKey = answers[index]
    const option = question.options.find((item) => item.key === answerKey)

    if (!option) return

    Object.entries(option.scores).forEach(([dimension, value]) => {
      rawScores[dimension] += value
    })
  })

  return Object.fromEntries(
    DIMENSION_KEYS.map((dimension) => {
      const max = questionMaxScores[dimension] || 1
      return [dimension, roundScore((rawScores[dimension] / max) * 100)]
    }),
  )
}

export function generateCollaborationCode(scores) {
  return rankDimensions(scores)
    .slice(0, 3)
    .map((dimension) => dimension.key)
    .join('')
}

export function getCodeDimensions(code) {
  return code.split('').map((key) => DIMENSION_MAP[key]).filter(Boolean)
}

export function getDimensionExplanation(code) {
  return getCodeDimensions(code)
    .map((dimension) => dimension.name)
    .join(' / ')
}

export function calculateRoleMatches(scores) {
  return AUXILIARY_ROLES.map((role) => ({
    ...role,
    score: roundScore(formulaScore(role.weights, scores)),
  })).sort((left, right) => right.score - left.score)
}

export function getAuxiliaryRoleTendencies(scores) {
  return calculateRoleMatches(scores).slice(0, 2)
}

function reviewRatingToScore(rating) {
  return clamp(Number(rating || 0) * 20)
}

function getPeerDimensionSignals(review) {
  const signals = Object.fromEntries(DIMENSION_KEYS.map((dimension) => [dimension, []]))
  const topDimensions = review.topDimensions ?? []

  Object.entries(review.ratings ?? {}).forEach(([dimension, rating]) => {
    if (!DIMENSION_KEYS.includes(dimension)) return

    const topDimensionBoost = topDimensions.includes(dimension) ? 8 : 0
    signals[dimension].push(clamp(reviewRatingToScore(rating) + topDimensionBoost))
  })

  topDimensions.forEach((dimension) => {
    if (!DIMENSION_KEYS.includes(dimension)) return
    if ((review.ratings ?? {})[dimension]) return
    signals[dimension].push(84)
  })

  return signals
}

export function calculateReviewAverageScores(peerReviews = [], fallbackScores = null) {
  if (!peerReviews.length) {
    return {
      averageScores: fallbackScores ? { ...fallbackScores } : emptyScores(),
      dimensionSignalCounts: emptyScores(),
      hasReviews: false,
    }
  }

  const collectedSignals = Object.fromEntries(DIMENSION_KEYS.map((dimension) => [dimension, []]))

  peerReviews.forEach((review) => {
    const signals = getPeerDimensionSignals(review)
    DIMENSION_KEYS.forEach((dimension) => {
      collectedSignals[dimension].push(...signals[dimension])
    })
  })

  const dimensionSignalCounts = {}
  const averageScores = {}

  DIMENSION_KEYS.forEach((dimension) => {
    const signals = collectedSignals[dimension]
    dimensionSignalCounts[dimension] = signals.length
    const peerAverage = signals.length
      ? signals.reduce((total, value) => total + value, 0) / signals.length
      : (fallbackScores?.[dimension] ?? 0)

    averageScores[dimension] = roundScore(peerAverage)
  })

  return { averageScores, dimensionSignalCounts, hasReviews: true }
}

export function mergePeerScores(
  initialScores,
  peerReviews = [],
  weights = { initial: 0.4, peer: 0.6 },
) {
  const { averageScores: peerAverageScores, dimensionSignalCounts, hasReviews } =
    calculateReviewAverageScores(peerReviews, initialScores)
  const updatedScores = {}

  DIMENSION_KEYS.forEach((dimension) => {
    updatedScores[dimension] = roundScore(
      initialScores[dimension] * weights.initial + peerAverageScores[dimension] * weights.peer,
    )
  })

  return { peerAverageScores, updatedScores, dimensionSignalCounts, hasReviews }
}

export function getCodeStatus(initialCode, updatedCode, roleScores) {
  const ranked = rankDimensions(roleScores)
  const thirdScore = ranked[2]?.score ?? 0
  const fourthScore = ranked[3]?.score ?? 0
  const isUnstable = thirdScore - fourthScore <= 3

  if (isUnstable) {
    return {
      label: '不稳定',
      tone: 'unstable',
      description: '最高维度之间的分差很小，当前标签容易被一次合作经历改写。',
    }
  }

  if (initialCode === updatedCode) {
    return {
      label: '被强化',
      tone: 'strong',
      description: '他人评价与系统初评基本一致，原有三字母代码被进一步强化。',
    }
  }

  const initialLetters = initialCode.split('').sort().join('')
  const updatedLetters = updatedCode.split('').sort().join('')

  if (initialLetters === updatedLetters) {
    return {
      label: '发生重排',
      tone: 'reorder',
      description: '核心维度没有变，但排序改变了：某些能力在合作后变得更突出。',
    }
  }

  return {
    label: '发生偏移',
    tone: 'shift',
    description: '他人评价引入了新的高位维度，协作标签出现了方向偏移。',
  }
}

export function getReviewTags(peerReviews = []) {
  const counter = new Map()

  peerReviews.forEach((review) => {
    const role = AUXILIARY_ROLE_MAP[review.auxiliaryRoleId]
    const tags = [
      ...(review.tags ?? []),
      ...(review.topDimensions ?? []).map((dimension) => DIMENSION_TAGS[dimension]).filter(Boolean),
      role?.name,
    ].filter(Boolean)

    tags.forEach((tag) => counter.set(tag, (counter.get(tag) ?? 0) + 1))
  })

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN'))
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }))
}

export function getProjectAverageScores(project) {
  const reviews = project?.reviews ?? []
  const collectedScores = Object.fromEntries(DIMENSION_KEYS.map((dimension) => [dimension, []]))

  reviews.forEach((review) => {
    const ratings = review.ratings ?? {}

    Object.entries(ratings).forEach(([dimension, rating]) => {
      if (!DIMENSION_KEYS.includes(dimension)) return
      collectedScores[dimension].push(clamp(Number(rating || 0), 0, 5))
    })

    ;(review.topDimensions ?? []).forEach((dimension) => {
      if (!DIMENSION_KEYS.includes(dimension)) return
      if (ratings[dimension]) return
      collectedScores[dimension].push(4.2)
    })
  })

  return Object.fromEntries(
    DIMENSION_KEYS.map((dimension) => {
      const values = collectedScores[dimension]
      const average = values.length
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0

      return [dimension, Number(average.toFixed(1))]
    }),
  )
}

export function getTopProjectDimensions(project, limit = 5) {
  const averageScores = getProjectAverageScores(project)

  return DIMENSIONS.map((dimension, index) => ({
    ...dimension,
    averageScore: averageScores[dimension.key] ?? 0,
    order: index,
  }))
    .filter((dimension) => dimension.averageScore > 0)
    .sort((left, right) => right.averageScore - left.averageScore || left.order - right.order)
    .slice(0, limit)
}

function normalizeProjects(user) {
  if (Array.isArray(user.projects) && user.projects.length) {
    return user.projects.map((project, index) => ({
      projectId: project.projectId ?? `project-${index + 1}`,
      name: project.name ?? project.projectName ?? `项目 ${index + 1}`,
      description: project.description ?? project.projectDescription ?? '暂无项目简介。',
      time: project.time ?? project.projectTime ?? '未填写',
      selfDescription: project.selfDescription ?? '尚未填写。',
      images: project.images ?? [],
      reviews: project.reviews ?? project.peerReviews ?? [],
    }))
  }

  return [
    {
      projectId: 'default-project',
      name: '当前小组项目',
      description: '这是当前用户默认参与的项目，用于绑定同项目成员评价。',
      time: '进行中',
      selfDescription: user.selfNotes?.tryNext || '尚未填写。',
      images: [],
      reviews: user.peerReviews ?? [],
    },
  ]
}

function buildProjectModel(project, initialCode) {
  const reviews = project.reviews ?? []
  const { averageScores: projectAverageScores, dimensionSignalCounts, hasReviews } =
    calculateReviewAverageScores(reviews)
  const projectCode = hasReviews ? generateCollaborationCode(projectAverageScores) : null
  const projectAuxiliaryRoles = hasReviews ? getAuxiliaryRoleTendencies(projectAverageScores) : []
  const projectStatus = hasReviews
    ? getCodeStatus(initialCode, projectCode, projectAverageScores)
    : {
        label: '待评价',
        tone: 'unstable',
        description: '这个项目还没有收到同项目成员评价，暂时无法生成项目协作代码。',
      }

  return {
    ...project,
    reviews,
    projectAverageScores,
    dimensionSignalCounts,
    hasReviews,
    projectCode,
    projectAuxiliaryRoles,
    projectStatus,
    reviewTags: getReviewTags(reviews),
  }
}

export function buildProfileModel(user) {
  const initialScores = user.initialScores
  const initialCode = user.initialCode ?? generateCollaborationCode(initialScores)
  const initialAuxiliaryRoles = getAuxiliaryRoleTendencies(initialScores)
  const projects = normalizeProjects(user)
  const projectModels = projects.map((project) => buildProjectModel(project, initialCode))
  const allProjectReviews = projectModels.flatMap((project) => project.reviews)
  const { peerAverageScores, updatedScores, dimensionSignalCounts } = mergePeerScores(
    initialScores,
    allProjectReviews,
    { initial: 0.4, peer: 0.6 },
  )
  const updatedCode = generateCollaborationCode(updatedScores)
  const updatedAuxiliaryRoles = getAuxiliaryRoleTendencies(updatedScores)
  const status = getCodeStatus(initialCode, updatedCode, updatedScores)

  return {
    ...user,
    initialCode,
    initialScores,
    initialAuxiliaryRoles,
    projects: projectModels,
    allProjectReviews,
    peerAverageScores,
    updatedScores,
    comprehensiveScores: updatedScores,
    comprehensiveCode: updatedCode,
    dimensionSignalCounts,
    updatedCode,
    updatedAuxiliaryRoles,
    status,
    reviewTags: getReviewTags(allProjectReviews),
    peerReviews: allProjectReviews,
  }
}
