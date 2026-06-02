export const DIMENSIONS = [
  {
    key: 'I',
    name: '发散力',
    label: 'I 发散力',
    short: '发散',
    description: '提出想法、打开方向',
    color: '#000000',
  },
  {
    key: 'S',
    name: '结构力',
    label: 'S 结构力',
    short: '结构',
    description: '梳理逻辑、搭建框架',
    color: '#1f1f1f',
  },
  {
    key: 'E',
    name: '执行力',
    label: 'E 执行力',
    short: '执行',
    description: '推进任务、完成产出',
    color: '#303030',
  },
  {
    key: 'C',
    name: '连接力',
    label: 'C 连接力',
    short: '连接',
    description: '沟通协调、维持互动',
    color: '#444444',
  },
  {
    key: 'R',
    name: '评估力',
    label: 'R 评估力',
    short: '评估',
    description: '判断风险、指出问题',
    color: '#555555',
  },
  {
    key: 'A',
    name: '适应力',
    label: 'A 适应力',
    short: '适应',
    description: '补位、应急、切换任务',
    color: '#666666',
  },
  {
    key: 'X',
    name: '表达显性度',
    label: 'X 表达显性度',
    short: '显性',
    description: '主动表达、展示贡献',
    color: '#777777',
  },
  {
    key: 'T',
    name: '时间启动模式',
    label: 'T 时间启动模式',
    short: 'DDL',
    description: '是否依赖 DDL / 压力激活',
    color: '#888888',
  },
  {
    key: 'D',
    name: '调研力',
    label: 'D 调研力',
    short: '调研',
    description: '搜集资料、案例、文献、依据',
    color: '#999999',
  },
  {
    key: 'V',
    name: '视觉呈现力',
    label: 'V 视觉呈现力',
    short: '视觉',
    description: 'PPT、版式、图像、视觉包装',
    color: '#aaaaaa',
  },
  {
    key: 'P',
    name: '专业实现力',
    label: 'P 专业实现力',
    short: '实现',
    description: '建模、剪辑、代码、软件、制作',
    color: '#bbbbbb',
  },
  {
    key: 'O',
    name: '口头表达力',
    label: 'O 口头表达力',
    short: '口头',
    description: '汇报、答辩、对外说明',
    color: '#cccccc',
  },
]

export const DIMENSION_KEYS = DIMENSIONS.map((dimension) => dimension.key)

export const DIMENSION_MAP = Object.fromEntries(
  DIMENSIONS.map((dimension) => [dimension.key, dimension]),
)

export const CORE_REVIEW_DIMENSIONS = ['I', 'S', 'E', 'C', 'R', 'A']

export const OPTIONAL_REVIEW_DIMENSIONS = ['D', 'V', 'P', 'O']

export const DIMENSION_TAGS = {
  I: '想法打开',
  S: '结构清楚',
  E: '推进交付',
  C: '沟通稳定',
  R: '风险敏感',
  A: '愿意补位',
  X: '表达主动',
  T: 'DDL爆发',
  D: '资料扎实',
  V: '视觉呈现',
  P: '技术实现',
  O: '汇报表达',
}
