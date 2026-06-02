export const QUESTIONS = [
  {
    id: 1,
    question: '第一次小组讨论时，你通常会？',
    options: [
      { key: 'A', text: '先提出几个可能的方向，让大家有东西可以讨论', scores: { I: 2, X: 1 } },
      { key: 'B', text: '先拆解作业要求，看看需要完成哪些部分', scores: { S: 2, R: 1 } },
      { key: 'C', text: '先确认大家的时间、能力和分工意愿', scores: { C: 2, A: 1 } },
      { key: 'D', text: '先观察大家的想法，再选择自己能接的位置', scores: { A: 2, X: -1 } },
    ],
  },
  {
    id: 2,
    question: '当小组一开始没有方向时，你更可能？',
    options: [
      { key: 'A', text: '快速抛出一些大胆或有趣的概念', scores: { I: 2, X: 1 } },
      { key: 'B', text: '去找相关案例或参考项目', scores: { D: 2, R: 1 } },
      { key: 'C', text: '先问清楚老师的要求和评分重点', scores: { S: 1, R: 2 } },
      { key: 'D', text: '等大家先说，再整理可以做的方向', scores: { C: 1, S: 1, X: -1 } },
    ],
  },
  {
    id: 3,
    question: '当大家讨论开始跑偏时，你通常会？',
    options: [
      { key: 'A', text: '顺着新方向继续发散，也许会有新可能', scores: { I: 2, A: 1 } },
      { key: 'B', text: '把讨论拉回任务目标和时间限制', scores: { S: 2, R: 1 } },
      { key: 'C', text: '提醒大家先定一个阶段性结论', scores: { E: 1, S: 1 } },
      { key: 'D', text: '观察大家是否还有参与感，避免气氛变僵', scores: { C: 2, A: 1 } },
    ],
  },
  {
    id: 4,
    question: '当群聊很久没人回复时，你会？',
    options: [
      { key: 'A', text: '主动发一个新想法或话题，让讨论重新开始', scores: { I: 1, X: 2 } },
      { key: 'B', text: '直接整理当前进度并提醒下一步该做什么', scores: { E: 2, S: 1 } },
      { key: 'C', text: '用比较轻松的方式问大家现在什么情况', scores: { C: 2, A: 1 } },
      { key: 'D', text: '不太主动催，等有人说话后再补充', scores: { A: 1, X: -1 } },
    ],
  },
  {
    id: 5,
    question: '当小组需要确定选题时，你更看重？',
    options: [
      { key: 'A', text: '这个题目是否新颖、有表达空间', scores: { I: 2, V: 1 } },
      { key: 'B', text: '这个题目是否有足够资料和案例支撑', scores: { D: 2, R: 1 } },
      { key: 'C', text: '这个题目是否能按时完成', scores: { E: 1, R: 2 } },
      { key: 'D', text: '这个题目是否大家都能参与进去', scores: { C: 2, A: 1 } },
    ],
  },
  {
    id: 6,
    question: '当小组提出一个很有趣但不确定能不能做的方案时，你会？',
    options: [
      { key: 'A', text: '先想它可能呈现出的效果和亮点', scores: { I: 2, V: 1 } },
      { key: 'B', text: '先判断它的风险和实现难度', scores: { R: 2, P: 1 } },
      { key: 'C', text: '先试着做一个小样或测试', scores: { P: 2, E: 1 } },
      { key: 'D', text: '先问大家愿不愿意承担这个方案的工作量', scores: { C: 1, A: 1, R: 1 } },
    ],
  },
  {
    id: 7,
    question: '当老师要求做前期调研时，你更可能？',
    options: [
      { key: 'A', text: '找大量案例、文献、图片和背景资料', scores: { D: 2, E: 1 } },
      { key: 'B', text: '把资料分类整理成几个方向', scores: { D: 1, S: 2 } },
      { key: 'C', text: '判断哪些资料真正能支撑方案', scores: { D: 1, R: 2 } },
      { key: 'D', text: '负责把资料讲给大家听，让小组理解', scores: { O: 1, C: 1, D: 1 } },
    ],
  },
  {
    id: 8,
    question: '当资料太多、大家不知道怎么用时，你会？',
    options: [
      { key: 'A', text: '从资料里提炼几个新的概念方向', scores: { I: 1, D: 1 } },
      { key: 'B', text: '建立一个清晰的信息结构或目录', scores: { S: 2, D: 1 } },
      { key: 'C', text: '删除不相关内容，保留最有用的依据', scores: { R: 2, S: 1 } },
      { key: 'D', text: '把资料转成图表、版式或展示内容', scores: { V: 2, S: 1 } },
    ],
  },
  {
    id: 9,
    question: '小组开始分工时，你更倾向于？',
    options: [
      { key: 'A', text: '选择自己最感兴趣、最能发挥想法的部分', scores: { I: 1, X: 1 } },
      { key: 'B', text: '根据任务结构分配每个人负责的模块', scores: { S: 2, C: 1 } },
      { key: 'C', text: '主动接下能推进进度的任务', scores: { E: 2, X: 1 } },
      { key: 'D', text: '接下目前没人认领但必须完成的部分', scores: { A: 2, E: 1, X: -1 } },
    ],
  },
  {
    id: 10,
    question: '当某个任务没人愿意做时，你通常会？',
    options: [
      { key: 'A', text: '提议换一种做法，让任务变得更有意思', scores: { I: 1, A: 1 } },
      { key: 'B', text: '重新拆分任务，降低它的难度', scores: { S: 1, A: 1 } },
      { key: 'C', text: '直接接过来完成，避免影响进度', scores: { E: 2, A: 1, X: -1 } },
      { key: 'D', text: '询问大家为什么不想做，再协调分配', scores: { C: 2, A: 1 } },
    ],
  },
  {
    id: 11,
    question: '当项目进入执行阶段时，你最容易进入哪种状态？',
    options: [
      { key: 'A', text: '还会不断想到新的补充方向', scores: { I: 2, T: 1 } },
      { key: 'B', text: '按照已经确定的结构推进', scores: { E: 2, S: 1 } },
      { key: 'C', text: '关注大家有没有按时完成自己的部分', scores: { E: 1, C: 1 } },
      { key: 'D', text: '根据缺口随时补位，不太固定做某一块', scores: { A: 2, E: 1 } },
    ],
  },
  {
    id: 12,
    question: '当小组进度落后时，你更可能？',
    options: [
      { key: 'A', text: '提出一个更简单但更有表现力的新方案', scores: { I: 1, A: 1 } },
      { key: 'B', text: '重新排时间表，明确每个人接下来做什么', scores: { S: 2, E: 1 } },
      { key: 'C', text: '直接开始赶工，先把成果做出来', scores: { E: 2, T: 1 } },
      { key: 'D', text: '帮大家协调任务，避免有人完全掉线', scores: { C: 2, A: 1 } },
    ],
  },
  {
    id: 13,
    question: '当项目需要做视觉呈现、PPT 或排版时，你会？',
    options: [
      { key: 'A', text: '想一个统一的视觉概念或风格', scores: { V: 2, I: 1 } },
      { key: 'B', text: '先整理内容结构，再决定版式', scores: { V: 1, S: 2 } },
      { key: 'C', text: '直接动手做页面，把东西先排出来', scores: { V: 2, E: 1 } },
      { key: 'D', text: '协调大家统一图片、文字和格式', scores: { V: 1, C: 1, S: 1 } },
    ],
  },
  {
    id: 14,
    question: '当内容逻辑还不清楚，但有人希望你“先美化一下”时，你会？',
    options: [
      { key: 'A', text: '先用视觉风格把整体感觉做出来', scores: { V: 2, I: 1 } },
      { key: 'B', text: '要求先把内容结构确认清楚', scores: { S: 2, R: 1 } },
      { key: 'C', text: '先完成一个可展示版本，之后再改', scores: { E: 2, V: 1 } },
      { key: 'D', text: '提醒大家视觉不能替代内容逻辑', scores: { R: 2, V: 1 } },
    ],
  },
  {
    id: 15,
    question: '当项目涉及技术、软件、建模、剪辑或装置制作时，你更可能？',
    options: [
      { key: 'A', text: '想这个技术能带来什么体验效果', scores: { I: 1, P: 1 } },
      { key: 'B', text: '判断技术能不能实现、成本有多高', scores: { P: 2, R: 1 } },
      { key: 'C', text: '直接尝试做一个测试版本', scores: { P: 2, E: 1 } },
      { key: 'D', text: '找会相关技术的人沟通或协作', scores: { C: 1, A: 1, P: 1 } },
    ],
  },
  {
    id: 16,
    question: '当别人不理解某个技术实现难度时，你会？',
    options: [
      { key: 'A', text: '用例子解释它可能达到的效果', scores: { O: 1, P: 1 } },
      { key: 'B', text: '明确说明它的限制和风险', scores: { R: 2, P: 1 } },
      { key: 'C', text: '直接演示一个小样，让大家看见结果', scores: { P: 2, E: 1 } },
      { key: 'D', text: '尝试把技术任务拆成大家能理解的步骤', scores: { S: 1, C: 1, P: 1 } },
    ],
  },
  {
    id: 17,
    question: '当组内出现分歧时，你更常做什么？',
    options: [
      { key: 'A', text: '提出第三种可能，让大家换个角度看', scores: { I: 1, A: 1 } },
      { key: 'B', text: '分析不同意见各自的利弊', scores: { R: 2, S: 1 } },
      { key: 'C', text: '先推动大家做一个临时决定', scores: { E: 1, S: 1 } },
      { key: 'D', text: '缓和语气，避免讨论变成争吵', scores: { C: 2, A: 1 } },
    ],
  },
  {
    id: 18,
    question: '当你觉得某个方案有明显问题时，你会？',
    options: [
      { key: 'A', text: '重新提出一个替代方向', scores: { I: 1, R: 1 } },
      { key: 'B', text: '直接指出问题，并说明原因', scores: { R: 2, X: 1 } },
      { key: 'C', text: '先私下和关键成员沟通，再决定怎么说', scores: { C: 1, R: 1 } },
      { key: 'D', text: '如果大家都很兴奋，可能会先保留意见', scores: { A: 1, X: -1 } },
    ],
  },
  {
    id: 19,
    question: '当有组员情绪低落或明显不想参与时，你会？',
    options: [
      { key: 'A', text: '用新的想法重新激发他的兴趣', scores: { I: 1, C: 1 } },
      { key: 'B', text: '调整任务，让他承担更合适的部分', scores: { A: 2, C: 1 } },
      { key: 'C', text: '主动和他沟通，了解原因', scores: { C: 2, O: 1 } },
      { key: 'D', text: '先不打扰，自己补上缺口', scores: { A: 1, E: 1, X: -1 } },
    ],
  },
  {
    id: 20,
    question: '当小组需要正式汇报时，你更可能？',
    options: [
      { key: 'A', text: '负责讲项目概念和亮点', scores: { O: 2, I: 1 } },
      { key: 'B', text: '负责讲项目逻辑和流程', scores: { O: 1, S: 2 } },
      { key: 'C', text: '负责讲实际完成情况和推进过程', scores: { O: 1, E: 1 } },
      { key: 'D', text: '不一定上台，但会帮忙准备内容和稿子', scores: { D: 1, S: 1, X: -1 } },
    ],
  },
  {
    id: 21,
    question: '当老师现场提问或质疑时，你会？',
    options: [
      { key: 'A', text: '从概念价值上回应问题', scores: { O: 2, I: 1 } },
      { key: 'B', text: '用结构化方式解释项目逻辑', scores: { O: 1, S: 2 } },
      { key: 'C', text: '直接说明限制、风险和改进方向', scores: { R: 2, O: 1 } },
      { key: 'D', text: '根据现场气氛补充说明，避免冷场', scores: { C: 1, O: 1, A: 1 } },
    ],
  },
  {
    id: 22,
    question: '当距离 DDL 只剩很短时间时，你通常会？',
    options: [
      { key: 'A', text: '仍然会突然想到更好的改法', scores: { I: 1, T: 1 } },
      { key: 'B', text: '按照优先级砍掉不必要内容', scores: { S: 1, R: 1, E: 1 } },
      { key: 'C', text: '进入高强度执行状态，先交出来', scores: { T: 2, E: 2 } },
      { key: 'D', text: '帮大家查漏补缺，哪里缺就补哪里', scores: { A: 2, E: 1, T: 1 } },
    ],
  },
  {
    id: 23,
    question: '你最容易被别人这样评价：',
    options: [
      { key: 'A', text: '“TA 想法很多，经常能打开方向。”', scores: { I: 2, X: 1 } },
      { key: 'B', text: '“TA 很会整理，把东西讲清楚。”', scores: { S: 2, O: 1 } },
      { key: 'C', text: '“TA 很靠谱，最后总能把事情做完。”', scores: { E: 2, A: 1 } },
      { key: 'D', text: '“TA 很会协调，大家跟 TA 合作比较舒服。”', scores: { C: 2, A: 1 } },
    ],
  },
  {
    id: 24,
    question: '你觉得自己在小组里最容易被误用成什么？',
    options: [
      { key: 'A', text: '只负责想点子，但不参与后面判断', scores: { I: 1, X: 1, R: -1 } },
      { key: 'B', text: '只负责收拾结构和逻辑，替大家做决定', scores: { S: 1, R: 1 } },
      { key: 'C', text: '只负责兜底和补位，哪里缺就去哪', scores: { A: 2, E: 1, X: -1 } },
      { key: 'D', text: '只负责包装、汇报或台前展示', scores: { V: 1, O: 1, X: 1 } },
    ],
  },
  {
    id: 25,
    question: '如果让你选择本次合作中最想尝试的角色，你会选？',
    options: [
      { key: 'A', text: '提出方向、概念和新的可能性', scores: { I: 2, X: 1 } },
      { key: 'B', text: '建立结构、规划流程和判断重点', scores: { S: 2, R: 1 } },
      { key: 'C', text: '推进任务、完成制作和保证交付', scores: { E: 2, P: 1 } },
      { key: 'D', text: '沟通协调、展示表达和连接成员', scores: { C: 1, O: 1, X: 1 } },
    ],
  },
]
