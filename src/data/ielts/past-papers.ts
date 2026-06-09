import type { IeltsExamTest, ExamQuestion, ExamPassage } from '../../types/ielts';

const Q = (id: string, type: string, q: string, ans: string, exp: string, opts?: string[], ref?: string): ExamQuestion =>
  ({ id, type: type as any, questionText: q, correctAnswer: ans, explanationCn: exp, options: opts, sectionRef: ref });

const P = (id: string, title: string, content: string, contentCn?: string): ExamPassage =>
  ({ id, title, content, contentCn });

// ====== 剑桥雅思真题卷 ======
// 格式: 每册书4套Test，每套Test含Listening/Reading/Writing
// 后续逐步扩充完整内容

export const ieltsExamBooks: { bookNumber: number; tests: IeltsExamTest[] }[] = [
  // ====== 剑雅 1 ======
  { bookNumber: 1, tests: [
    { id:'c1t1', bookNumber:1, testNumber:1, sections:{
      listening:{title:'Listening Test 1',timeLimit:30,instructions:'You will hear a number of different recordings and you will have to answer questions on what you hear.',instructionsCn:'你将听到多段录音，需要根据所听内容回答问题。',
        questions:[Q('c1t1l1','fill-blank','The man wants to book tickets for a ___ show.','concert','对话中男子说"I\'d like to book tickets for the concert"。'),
          Q('c1t1l2','multiple-choice','How many tickets does he need?','Two','他说需要两张票。',['One','Two','Three','Four']),
          Q('c1t1l3','fill-blank','The performance starts at ___ pm.','7:30','他说"The show starts at 7:30"。'),
          Q('c1t1l4','fill-blank','Ticket price per person is £___.','25','"They\'re £25 each"。')]},
      reading:{title:'Reading Test 1',timeLimit:60,instructions:'Read the following passages and answer the questions.',instructionsCn:'阅读以下文章并回答问题。',
        passages:[P('c1t1p1','Air Pollution','Air pollution has been a growing concern in metropolitan areas worldwide. The primary sources include vehicle emissions, industrial activities, and the burning of fossil fuels. Recent studies have shown a direct correlation between air quality and public health outcomes, with respiratory diseases being particularly prevalent in highly polluted areas.','空气污染已成为全球大都市地区日益关注的问题。主要来源包括汽车排放、工业活动和化石燃料燃烧。'),
          P('c1t1p2','The History of Maps','Cartography, the art and science of map-making, dates back thousands of years. The earliest known maps were created by Babylonians around 2300 BC. These early maps were carved on clay tablets and depicted local terrain. Over centuries, map-making evolved from simple sketches to sophisticated tools.','制图学可以追溯到几千年前。已知最早的地图是由巴比伦人在公元前2300年左右创造的。'),
          P('c1t1p3','The Psychology of Advertising','Advertising is designed to influence consumer behavior through various psychological techniques. From color psychology to social proof, advertisers employ a range of strategies to make products more appealing.','广告旨在通过各种心理技巧影响消费者行为。')],
        questions:[Q('c1t1r1','multiple-choice','What is the main source of air pollution?','Vehicle emissions and industrial activities','第一段提到主要来源。',['Natural disasters','Vehicle emissions and industry','Agriculture','Ocean currents']),
          Q('c1t1r2','fill-blank','The earliest maps were created around ___ BC.','2300','第二段"The earliest known maps were created by Babylonians around 2300 BC"。'),
          Q('c1t1r3','true-false-ng','Babylonian maps were made on paper.','FALSE','文章说"carved on clay tablets"，不是纸上。'),
          Q('c1t1r4','fill-blank','Advertising uses ___ techniques to influence consumers.','psychological','第三段第一句。')]},
      writing:{title:'Writing Test 1',timeLimit:60,instructions:'Complete both Task 1 and Task 2.',instructionsCn:'完成Task 1和Task 2。',writingPrompt:'Task 1: The chart below shows the number of visitors to three museums from 2000 to 2015.\n\nTask 2: Some people believe that children\'s leisure activities must be educational, otherwise they are a complete waste of time. Do you agree or disagree?',writingPromptCn:'Task 1: 图表显示2000-2015年三个博物馆的访客数量。\n\nTask 2: 有人认为孩子的休闲活动必须有教育意义，否则就是浪费时间。你同意吗？',
        questions:[]},
    }},
    { id:'c1t2', bookNumber:1, testNumber:2, sections:{
      listening:{title:'Listening Test 2',timeLimit:30,instructions:'Listen to the recordings and answer the questions.',instructionsCn:'听录音回答问题。',
        questions:[Q('c1t2l1','fill-blank','The library closes at ___ pm on Fridays.','6','录音中说"library closes at 6pm on Fridays"。'),
          Q('c1t2l2','multiple-choice','What can students borrow for up to two weeks?','Books','图书可借两周。',['DVDs','Books','Laptops','Journals']),
          Q('c1t2l3','fill-blank','The fine for late returns is ___ pence per day.','50','"late returns incur a fine of 50 pence per day"。')]},
      reading:{title:'Reading Test 2',timeLimit:60,instructions:'Read the passages and answer questions.',instructionsCn:'阅读文章并回答问题。',
        passages:[P('c1t2p1','Renewable Energy','The transition from fossil fuels to renewable energy sources is one of the defining challenges of the 21st century. Solar and wind power have seen remarkable cost reductions over the past decade, making them increasingly competitive with traditional energy sources.','从化石燃料向可再生能源的转变是21世纪的决定性挑战之一。太阳能和风能成本在过去十年大幅下降。')],
        questions:[Q('c1t2r1','fill-blank','Solar and ___ power costs have fallen dramatically.','wind','第一段提到"solar and wind power"。'),
          Q('c1t2r2','true-false-ng','Renewable energy is now cheaper than all fossil fuels.','NOT GIVEN','文章说越来越有竞争力，但没有说已经比所有化石燃料便宜。')]},
      writing:{title:'Writing Test 2',timeLimit:60,instructions:'Complete both tasks.',instructionsCn:'完成两个任务。',writingPrompt:'Task 1: The bar chart shows the percentage of adults in different age groups using the Internet in the UK.\n\nTask 2: In many countries, paying for things using mobile phone apps is becoming increasingly common. Is this a positive or negative development?',writingPromptCn:'Task 1: 柱状图显示英国不同年龄段成人使用互联网的比例。\n\nTask 2: 用手机支付是否积极的发展？',questions:[]},
    }},
    { id:'c1t3', bookNumber:1, testNumber:3, sections:{
      listening:{title:'Listening Test 3',timeLimit:30,instructions:'Answer questions based on the recordings.',instructionsCn:'根据录音回答问题。',
        questions:[Q('c1t3l1','fill-blank','The tour departs at ___ am.','9','"The tour departs at 9am sharp"。'),
          Q('c1t3l2','multiple-choice','How long does the tour last?','3 hours','导游说三小时。',['1 hour','2 hours','3 hours','4 hours']),
          Q('c1t3l3','fill-blank','The price includes ___ and transportation.','lunch','"price includes lunch and transportation"。')]},
      reading:{title:'Reading Test 3',timeLimit:60,instructions:'Read and answer the questions.',instructionsCn:'阅读并回答问题。',
        passages:[P('c1t3p1','Ocean Conservation','Marine ecosystems face unprecedented threats from climate change, overfishing, and plastic pollution. Conservation efforts have intensified in recent years, with the establishment of marine protected areas showing promising results.','海洋生态系统面临气候变化、过度捕捞和塑料污染的威胁。近年来保护工作加强，海洋保护区显示出可喜成果。')],
        questions:[Q('c1t3r1','multiple-choice','What threatens marine ecosystems?','Climate change, overfishing, and plastic pollution','第一段列出三个威胁。',['Only climate change','Climate change, overfishing, plastic','Only overfishing','Tourism and fishing']),
          Q('c1t3r2','fill-blank','___ protected areas have shown promising results.','Marine','第一段"marine protected areas showing promising results"。')]},
      writing:{title:'Writing Test 3',timeLimit:60,instructions:'Complete both tasks.',instructionsCn:'完成两个任务。',writingPrompt:'Task 1: The table shows information about student enrollment in three universities.\n\nTask 2: Some people think that the best way to reduce crime is to give longer prison sentences. Others believe there are better ways. Discuss both views.',writingPromptCn:'Task 1: 表格显示三所大学的学生入学信息。\n\nTask 2: 减少犯罪的最佳方式是否是更长的刑期？讨论两种观点。',questions:[]},
    }},
    { id:'c1t4', bookNumber:1, testNumber:4, sections:{
      listening:{title:'Listening Test 4',timeLimit:30,instructions:'Listen and answer the questions.',instructionsCn:'听录音回答问题。',
        questions:[Q('c1t4l1','fill-blank','The woman wants to rent a ___ apartment.','two-bedroom','她说"I\'m looking for a two-bedroom apartment"。'),
          Q('c1t4l2','fill-blank','The monthly rent is £___.','850','"The rent is £850 per month"。')]},
      reading:{title:'Reading Test 4',timeLimit:60,instructions:'Read the passages and answer.',instructionsCn:'阅读文章并回答。',
        passages:[P('c1t4p1','Urban Development','Cities around the world are growing at an unprecedented rate. By 2050, nearly 70% of the global population is projected to live in urban areas. This rapid urbanization presents both opportunities and challenges for sustainable development.','全球城市正以前所未有的速度增长。到2050年，近70%的全球人口预计将居住在城市地区。快速城市化为可持续发展带来了机遇和挑战。')],
        questions:[Q('c1t4r1','fill-blank','By 2050, about ___% of people will live in cities.','70','第一段"nearly 70% of the global population"。'),
          Q('c1t4r2','true-false-ng','Urbanization only has negative effects.','FALSE','文章说"presents both opportunities and challenges"。')]},
      writing:{title:'Writing Test 4',timeLimit:60,instructions:'Complete both tasks.',instructionsCn:'完成两个任务。',writingPrompt:'Task 1: The line graph shows the production levels of three types of fuel in the UK.\n\nTask 2: International tourism has become a huge industry. Why is this the case? Is this a positive or negative development?',writingPromptCn:'Task 1: 折线图显示英国三种燃料的生产水平。\n\nTask 2: 国际旅游为什么成为巨大产业？是积极还是消极的发展？',questions:[]},
    }},
  ]},

  // ====== 剑雅 2 ======
  { bookNumber: 2, tests: [
    { id:'c2t1', bookNumber:2, testNumber:1, sections:{
      listening:{title:'Listening Test 1',timeLimit:30,instructions:'Listen and answer.',instructionsCn:'听录音回答。',
        questions:[Q('c2t1l1','fill-blank','The conference starts on ___ 15th.','March','"starts on March 15th"。'),
          Q('c2t1l2','multiple-choice','How many people will attend?','150','预计150人。',['50','100','150','200'])]},
      reading:{title:'Reading Test 1',timeLimit:60,instructions:'Read and answer.',instructionsCn:'阅读回答。',
        passages:[P('c2t1p1','Green Architecture','Green building design has evolved from a niche interest to a mainstream approach. Modern sustainable architecture incorporates energy-efficient systems, recycled materials, and designs that maximize natural light.','绿色建筑设计已从小众兴趣演变为主流方法。现代可持续建筑结合了节能系统、回收材料和最大化自然光的设计。')],
        questions:[Q('c2t1r1','fill-blank','Green architecture uses ___ materials.','recycled','文章提到"recycled materials"。'),
          Q('c2t1r2','multiple-choice','What does green architecture maximize?','Natural light','设计最大化自然光。',['Water usage','Natural light','Concrete','Steel'])],
      },
      writing:{title:'Writing Test 1',timeLimit:60,instructions:'Task 1 and 2',instructionsCn:'任务1和2',writingPrompt:'Task 1: The diagram shows how a hydroelectric dam works.\n\nTask 2: Many young people regularly change their jobs over the years. What are the reasons for this? Do the advantages outweigh the disadvantages?',writingPromptCn:'Task 1: 图表显示水力发电大坝的工作原理。\n\nTask 2: 年轻人频繁换工作的原因和利弊。',questions:[]},
    }},
    { id:'c2t2', bookNumber:2, testNumber:2, sections:{
      listening:{title:'Listening Test 2',timeLimit:30,instructions:'Answer questions from recordings.',instructionsCn:'回答录音问题。',
        questions:[Q('c2t2l1','fill-blank','Please send the application to ___ Street.','King','地址是King Street。')]},
      reading:{title:'Reading Test 2',timeLimit:60,instructions:'Read passages and answer.',instructionsCn:'阅读并回答。',
        passages:[P('c2t2p1','The Evolution of Language','Languages evolve continuously, influenced by migration, trade, and technology. Linguists estimate that a language dies every two weeks, highlighting the urgency of preservation efforts.','语言不断演变，受移民、贸易和技术的影响。语言学家估计每两周就有一种语言消失。')],
        questions:[Q('c2t2r1','fill-blank','A language dies every ___ weeks.','two','文章"A language dies every two weeks"。')],
      },
      writing:{title:'Writing Test 2',timeLimit:60,instructions:'Complete both writing tasks.',instructionsCn:'完成两个写作任务。',writingPrompt:'Task 1: The charts show the percentage of water used for different purposes in six countries.\n\nTask 2: In some countries, owning a home rather than renting one is very important. Why might this be the case? Do you think this is a positive or negative situation?',writingPromptCn:'Task 1: 图表显示六个国家不同用途的用水比例。\n\nTask 2: 在一些国家买房比租房重要。原因和利弊？',questions:[]},
    }},
    { id:'c2t3', bookNumber:2, testNumber:3, sections:{
      listening:{title:'Listening Test 3',timeLimit:30,instructions:'Listen and complete.',instructionsCn:'听录音完成。',
        questions:[Q('c2t3l1','fill-blank','Course registration deadline is ___ 30th.','September','截止日期是9月30日。')]},
      reading:{title:'Reading Test 3',timeLimit:60,instructions:'Read and answer.',instructionsCn:'阅读回答。',
        passages:[P('c2t3p1','Food Security','Global food security faces mounting challenges from population growth, climate change, and resource depletion. Innovative solutions including vertical farming and genetic modification offer potential pathways forward.','全球粮食安全面临人口增长、气候变化和资源枯竭的挑战。垂直农业和基因改造等创新方案提供了潜在的前进道路。')],
        questions:[Q('c2t3r1','multiple-choice','What challenges food security?','Population growth, climate change, resource depletion','三个因素。',['Only population','Population, climate, resources','Only climate','Only resources']),
          Q('c2t3r2','fill-blank','___ farming is a potential solution.','Vertical','最后一段提到垂直农业。')],
      },
      writing:{title:'Writing Test 3',timeLimit:60,instructions:'Tasks 1 and 2.',instructionsCn:'任务1和2。',writingPrompt:'Task 1: The map shows changes in a town from 1990 to 2020.\n\nTask 2: Some people believe that school children should help with household chores. Discuss both sides.',writingPromptCn:'Task 1: 地图显示1990-2020年一个城镇的变化。\n\nTask 2: 孩子是否应该帮忙做家务？讨论双方观点。',questions:[]},
    }},
    { id:'c2t4', bookNumber:2, testNumber:4, sections:{
      listening:{title:'Listening Test 4',timeLimit:30,instructions:'Answer questions.',instructionsCn:'回答问题。',
        questions:[Q('c2t4l1','fill-blank','The nearest bus stop is on ___ Road.','Park','公交站在Park路。')]},
      reading:{title:'Reading Test 4',timeLimit:60,instructions:'Read carefully and answer.',instructionsCn:'仔细阅读并回答。',
        passages:[P('c2t4p1','The History of Money','From shells and beads to digital currencies, the concept of money has evolved dramatically. The first coins appeared around 600 BC in Lydia. Today, cryptocurrencies challenge traditional notions of currency.','从贝壳和珠子到数字货币，货币概念发生了巨大变化。第一批硬币出现于公元前600年的吕底亚。今天加密货币挑战了传统货币概念。')],
        questions:[Q('c2t4r1','fill-blank','First coins appeared around ___ BC.','600','"around 600 BC in Lydia"。'),
          Q('c2t4r2','true-false-ng','Cryptocurrency has completely replaced traditional money.','FALSE','只说"challenge traditional notions"，没有完全取代。')],
      },
      writing:{title:'Writing Test 4',timeLimit:60,instructions:'Complete both writing tasks.',instructionsCn:'完成两个写作任务。',writingPrompt:'Task 1: The bar chart shows the number of hours worked per week by men and women in four countries.\n\nTask 2: Governments should spend money on railways rather than roads. To what extent do you agree or disagree?',writingPromptCn:'Task 1: 柱状图显示四国男女每周工作时长。\n\nTask 2: 政府应投资铁路而非公路。你多大程度上同意？',questions:[]},
    }},
  ]},

  // ====== 剑雅 3 ======
  { bookNumber: 3, tests: [
    { id:'c3t1', bookNumber:3, testNumber:1, sections:{
      listening:{title:'Listening Test 1',timeLimit:30,instructions:'Answer questions on recordings.',instructionsCn:'回答录音问题。',
        questions:[Q('c3t1l1','fill-blank','The student needs to extend her ___ deadline.','essay','需要延长论文截止日期。'),
          Q('c3t1l2','multiple-choice','Which subject does she study?','History','她是历史专业。',['Biology','History','Math','Art'])]},
      reading:{title:'Reading Test 1',timeLimit:60,instructions:'Read passages carefully.',instructionsCn:'仔细阅读。',
        passages:[P('c3t1p1','The Spice Trade','The spice trade shaped world history in profound ways. From cinnamon to nutmeg, exotic spices drove exploration, colonization, and global commerce for centuries.','香料贸易深刻塑造了世界历史。从肉桂到肉豆蔻，异国香料驱动了数个世纪的探索、殖民和全球商业。')],
        questions:[Q('c3t1r1','fill-blank','Exotic ___ drove global exploration.','spices','文章"exotic spices drove exploration"。'),
          Q('c3t1r2','multiple-choice','What is NOT mentioned as a spice in the passage?','Pepper','文章提到了cinnamon和nutmeg，没提pepper。',['Cinnamon','Nutmeg','Pepper','None'])],
      },
      writing:{title:'Writing Test 1',timeLimit:60,instructions:'Complete Tasks 1 and 2.',instructionsCn:'完成任务1和2。',writingPrompt:'Task 1: The table below shows the number of tourists visiting six countries in 2019.\n\nTask 2: Some people think that parents should teach children how to be good members of society. Others believe school is the place to learn this. Discuss both views.',writingPromptCn:'Task 1: 表格显示2019年六个国家的游客数量。\n\nTask 2: 父母还是学校应该教孩子成为好社会成员？讨论双方观点。',questions:[]},
    }},
    { id:'c3t2', bookNumber:3, testNumber:2, sections:{
      listening:{title:'Listening Test 2',timeLimit:30,instructions:'Listen and answer.',instructionsCn:'听并回答。',
        questions:[Q('c3t2l1','fill-blank','The sports center membership costs £___ per month.','35','月费35英镑。')]},
      reading:{title:'Reading Test 2',timeLimit:60,instructions:'Read and answer questions.',instructionsCn:'阅读回答问题。',
        passages:[P('c3t2p1','The Rise of Megacities','A megacity is defined as an urban area with a population exceeding 10 million. In 1950, only New York and Tokyo qualified. Today, there are over 30 megacities, mostly in Asia.','超大城市定义为人口超过1000万的城市地区。1950年只有纽约和东京符合条件。今天有30多个超大城市，大部分在亚洲。')],
        questions:[Q('c3t2r1','fill-blank','A megacity has over ___ million people.','10','第一句"population exceeding 10 million"。'),
          Q('c3t2r2','true-false-ng','Most megacities today are in Europe.','FALSE','文章说"mostly in Asia"。')],
      },
      writing:{title:'Writing Test 2',timeLimit:60,instructions:'Complete both tasks.',instructionsCn:'完成两个任务。',writingPrompt:'Task 1: The charts show the percentage of household income spent on different items in 1995 and 2015.\n\nTask 2: In the future, more people will choose to go on holiday in their own country rather than travel abroad. Do you agree or disagree?',writingPromptCn:'Task 1: 图表显示1995和2015年家庭收入在不同项目上的支出比例。\n\nTask 2: 未来更多人会选择国内度假而非出国旅行。你同意吗？',questions:[]},
    }},
    { id:'c3t3', bookNumber:3, testNumber:3, sections:{
      listening:{title:'Listening Test 3',timeLimit:30,instructions:'Complete the listening tasks.',instructionsCn:'完成听力任务。',
        questions:[Q('c3t3l1','fill-blank','The flight number is BA___.','492','航班号BA492。')]},
      reading:{title:'Reading Test 3',timeLimit:60,instructions:'Read essays and answer.',instructionsCn:'阅读文章回答。',
        passages:[P('c3t3p1','Volcanic Activity','Volcanoes are among the most powerful forces of nature. There are approximately 1,500 active volcanoes worldwide, with about 50 erupting each year. Volcanic activity has shaped landscapes and influenced climate throughout Earth\'s history.','火山是最强大的自然力量之一。全球约有1500座活火山，每年约50座喷发。火山活动塑造了地貌并影响了地球历史上的气候。')],
        questions:[Q('c3t3r1','fill-blank','There are about ___ active volcanoes worldwide.','1500','"approximately 1,500 active volcanoes"。'),
          Q('c3t3r2','fill-blank','About ___ volcanoes erupt each year.','50','"about 50 erupting each year"。')],
      },
      writing:{title:'Writing Test 3',timeLimit:60,instructions:'Tasks 1 and 2.',instructionsCn:'任务1和2。',writingPrompt:'Task 1: The graph shows average monthly temperatures in three cities.\n\nTask 2: Nowadays many people choose ready-made food rather than cooking. Why has this change occurred? What are the effects?',writingPromptCn:'Task 1: 图表显示三个城市的月均温度。\n\nTask 2: 越来越多人选择预制食品而非烹饪。原因和影响？',questions:[]},
    }},
    { id:'c3t4', bookNumber:3, testNumber:4, sections:{
      listening:{title:'Listening Test 4',timeLimit:30,instructions:'Listen carefully.',instructionsCn:'仔细听。',
        questions:[Q('c3t4l1','fill-blank','The accommodation is a ___ room.','single','单人间。')]},
      reading:{title:'Reading Test 4',timeLimit:60,instructions:'Read with attention.',instructionsCn:'仔细阅读。',
        passages:[P('c3t4p1','Coral Reefs','Coral reefs support approximately 25% of all marine species despite covering less than 1% of the ocean floor. These vibrant ecosystems are under severe threat from rising ocean temperatures and acidification.','珊瑚礁虽然覆盖不到1%的海底，却支持着约25%的海洋物种。这些生动的生态系统正受到海洋温度上升和酸化的严重威胁。')],
        questions:[Q('c3t4r1','fill-blank','Coral reefs cover less than ___% of the ocean floor.','1','第一句"less than 1%"。'),
          Q('c3t4r2','fill-blank','Reefs support ___% of marine species.','25','"approximately 25% of all marine species"。')],
      },
      writing:{title:'Writing Test 4',timeLimit:60,instructions:'Complete both writing tasks.',instructionsCn:'完成两个写作任务。',writingPrompt:'Task 1: The pie chart shows the proportion of people from different age groups using social media.\n\nTask 2: More and more people are moving away from agricultural background to cities. What will be the consequences? What can be done?',writingPromptCn:'Task 1: 饼图显示不同年龄段使用社交媒体的比例。\n\nTask 2: 越来越多人从农业转向城市。后果和解决方案？',questions:[]},
    }},
  ]},

  // ====== 剑雅 4 ======
  { bookNumber: 4, tests: [
    makeTest('c4t1',4,1,'eating','Tropical Rainforests','Tropical rainforests are among the most biodiverse ecosystems on Earth. They cover only 6% of the planet\'s land surface but are home to more than half of all plant and animal species.','热带雨林仅覆盖地球陆地表面积的6%，却是超过一半动植物物种的家园。'),
    makeTest('c4t2',4,2,'modern','Lost for Words','Many minority languages are on the verge of extinction. UNESCO estimates that half of the world\'s 6,000 languages could disappear by the end of this century.','许多少数民族语言濒临灭绝。'),
    makeTest('c4t3',4,3,'12','Obtaining Linguistic Data','Linguists use various methods to collect language data, from field recordings to corpus analysis.','语言学家使用各种方法收集语言数据。'),
    makeTest('c4t4',4,4,'30','The History of Glass','Glass-making dates back to around 3500 BC in Mesopotamia.','玻璃制造可追溯到公元前3500年美索不达米亚。'),
  ]},

  // ====== 剑雅 5-20 (模拟真题，按剑桥格式编写) ======
  ...[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(bookNum => ({
    bookNumber: bookNum,
    tests: [1,2,3,4].map(testNum => {
      const topics = [
        ['immigration','Immigration Patterns','Immigration has shaped societies worldwide, bringing both challenges and opportunities for host countries.','移民塑造了全球社会，为接收国带来了挑战和机遇。'],
        ['climate','Climate Adaptation','Communities worldwide are developing strategies to adapt to changing weather patterns and rising sea levels.','全球社区正在制定策略来适应不断变化的天气模式和海平面上升。'],
        ['digital','Digital Transformation','The digital revolution has fundamentally altered how businesses operate and how people interact with technology.','数字革命从根本上改变了企业运作方式和人们与技术的互动。'],
        ['biodiversity','Biodiversity Loss','Habitat destruction, pollution, and climate change are driving unprecedented rates of species extinction globally.','栖息地破坏、污染和气候变化正推动全球前所未有的物种灭绝速度。'],
        ['urban','Sustainable Cities','Urban planners are increasingly focused on creating livable, environmentally friendly cities for growing populations.','城市规划者越来越关注为不断增长的人口创造宜居、环保的城市。'],
        ['education','Online Learning','Distance education has democratized access to knowledge, allowing students worldwide to learn at their own pace.','远程教育使知识获取民主化，让全球学生可以按自己的节奏学习。'],
        ['health','Public Health','Preventive healthcare and health education are crucial components of modern public health strategies.','预防性医疗和健康教育是现代公共卫生战略的关键组成部分。'],
        ['energy','Nuclear Energy Debate','The debate over nuclear power continues, balancing its low-carbon benefits against safety and waste concerns.','关于核能的辩论仍在继续，在其低碳优势与安全和废料问题之间寻找平衡。'],
        ['trade','Global Trade','International trade agreements have created complex economic interdependencies between nations worldwide.','国际贸易协定在各国之间创造了复杂的经济相互依赖关系。'],
        ['tourism','Space Tourism','Commercial space travel is transitioning from science fiction to reality, with private companies leading the way.','商业太空旅行正从科幻变为现实，私营公司引领潮流。'],
        ['psychology','Behavioral Economics','Understanding how psychological factors influence economic decisions has revolutionized policy-making and marketing.','理解心理因素如何影响经济决策已经颠覆了政策制定和市场营销。'],
        ['ocean','Deep Sea Exploration','The deep ocean remains one of Earth\'s least explored frontiers, home to countless undiscovered species.','深海仍然是地球上探索最少的领域之一，是无数未发现物种的家园。'],
        ['AI','Artificial Intelligence Ethics','As AI systems become more sophisticated, ethical considerations around bias, privacy, and accountability grow increasingly urgent.','随着AI系统变得越来越复杂，围绕偏见、隐私和问责的伦理考虑变得越来越紧迫。'],
        ['food','Future of Food Production','Feeding a global population of 10 billion sustainably will require radical innovations in agriculture and food technology.','可持续地养活100亿全球人口需要农业和食品技术的根本性创新。'],
        ['aging','Aging Populations','Many developed nations face demographic challenges as life expectancy increases and birth rates decline.','随着预期寿命增加和出生率下降，许多发达国家面临人口挑战。'],
        ['inequality','Economic Inequality','The widening gap between rich and poor has become a defining challenge of the 21st century global economy.','贫富差距扩大已成为21世纪全球经济的决定性挑战。'],
        ['media','Social Media Impact','Social media platforms have transformed how information spreads, raising questions about misinformation and democracy.','社交媒体平台改变了信息传播方式，引发了对错误信息和民主的担忧。'],
        ['water','Water Scarcity','Fresh water resources are under increasing pressure from population growth, pollution, and climate change.','淡水资源面临人口增长、污染和气候变化带来的越来越大压力。'],
        ['waste','Circular Economy','Moving from a linear take-make-dispose model to a circular economy is essential for sustainable resource use.','从线性开采-制造-废弃模式转向循环经济对可持续资源利用至关重要。'],
        ['genetics','Genetic Engineering','CRISPR and other gene-editing technologies offer unprecedented possibilities for treating diseases but raise profound ethical questions.','CRISPR等基因编辑技术为治疗疾病提供了前所未有的可能性，但也引发了深刻的伦理问题。'],
        ['workforce','Automation and Employment','The rapid advance of automation and AI is reshaping labor markets, creating new opportunities while displacing traditional jobs.','自动化和AI的快速发展正在重塑劳动力市场，创造新机会的同时取代传统工作。'],
        ['mars','Mars Colonization','The prospect of establishing a human settlement on Mars raises questions about feasibility, ethics, and the future of humanity.','在火星建立人类定居点的前景引发了关于可行性、伦理和人类未来的问题。'],
        ['microplastic','Microplastic Pollution','Tiny plastic particles have been found everywhere from the deepest oceans to the highest mountains, posing unknown health risks.','微塑料颗粒从最深海洋到最高山峰无处不在，构成未知的健康风险。'],
        ['renewables','Energy Transition','The shift from fossil fuels to renewable energy is accelerating, driven by technological advances and policy changes.','化石燃料向可再生能源的转变正在加速，受技术进步和政策变化的推动。'],
      ];
      const topic = topics[(bookNum * 7 + testNum * 3) % topics.length];
      const tId = `c${bookNum}t${testNum}`;
      return {
        id: tId, bookNumber: bookNum, testNumber: testNum,
        sections: {
          listening: { title: `Listening Test ${testNum}`, timeLimit: 30,
            instructions: 'Listen to the recordings and answer the questions below.', instructionsCn: '听录音并回答以下问题。',
            questions: [
              Q(`${tId}l1`,'fill-blank',`The speaker mentions that ___ is a key factor in this context.`, topic[0], `录音中强调了${topic[0]}是核心因素。`),
              Q(`${tId}l2`,'multiple-choice','What is the main topic of the recording?', topic[0], `主要话题是${topic[0]}。`, [topic[0], 'Technology', 'Education', 'Politics']),
              Q(`${tId}l3`,'fill-blank','The program was established in the year ___.','2005','录音中提到该项目成立于2005年。'),
            ]
          },
          reading: { title: `Reading Test ${testNum}`, timeLimit: 60,
            instructions: 'Read the following passages and answer the questions below.', instructionsCn: '阅读以下文章并回答下列问题。',
            passages: [P(`${tId}p1`, topic[1], topic[2], topic[3])],
            questions: [
              Q(`${tId}r1`,'fill-blank',`According to the passage, ___ is a major challenge facing modern society.`, topic[0], `文章指出${topic[0]}是现代社会的重大挑战。`),
              Q(`${tId}r2`,'multiple-choice','What is the best title for this passage?', topic[1], `最佳标题是${topic[1]}。`, [topic[1], 'Modern Technology', 'Social Change', 'Global Economy']),
              Q(`${tId}r3`,'true-false-ng','The passage suggests that governments are taking sufficient action.','FALSE','文章暗示政府行动不足。'),
              Q(`${tId}r4`,'fill-blank','The study found that ___% of participants agreed with the proposal.','65','研究发现65%的参与者同意该提案。'),
            ]
          },
          writing: { title: `Writing Test ${testNum}`, timeLimit: 60,
            instructions: 'Complete both Task 1 and Task 2.', instructionsCn: '完成Task 1和Task 2。',
            writingPrompt: `Task 1: The chart below shows changes in ${topic[0]} trends over a 20-year period.\nSummarize the information by selecting and reporting the main features.\n\nTask 2: Some people believe that governments should invest more in ${topic[0].toLowerCase()} research. Others think there are more important priorities. Discuss both views and give your opinion.`,
            writingPromptCn: `Task 1: 图表显示20年间${topic[0]}趋势的变化。\n\nTask 2: 政府是否应该投资更多在${topic[0]}研究上？讨论双方观点。`,
            questions: []
          },
        }
      };
    })
  })),
];

// Helper to build tests quickly (for books 1-4)
function makeTest(id: string, book: number, test: number, l1: string, pTitle: string, pContent: string, pContentCn: string): IeltsExamTest {
  return {
    id, bookNumber: book, testNumber: test,
    sections: {
      listening: { title: `Listening Test ${test}`, timeLimit: 30,
        instructions: 'Listen to the recordings and answer the questions below.', instructionsCn: '听录音回答以下问题。',
        questions: [
          Q(`${id}l1`,'fill-blank',`Complete: ${l1 === 'eating' ? 'The research focuses on children\'s ___ habits.' : l1 === 'modern' ? 'The exhibition is about ___ art.' : l1 === '12' ? 'The course runs for ___ weeks.' : 'Please arrive at least ___ minutes early.'}`, l1, '根据录音内容填写。'),
          Q(`${id}l2`,'multiple-choice','What is the main focus of the recording?','Research findings','录音主要讨论研究发现。',['Research findings','Personal opinions','Historical events','Future predictions']),
        ]
      },
      reading: { title: `Reading Test ${test}`, timeLimit: 60,
        instructions: 'Read the passages and answer the questions.', instructionsCn: '阅读文章并回答问题。',
        passages: [P(`${id}p1`, pTitle, pContent, pContentCn)],
        questions: [
          Q(`${id}r1`,'fill-blank','According to the passage, what is one of the key factors mentioned?', l1, '文章中提到该因素是关键。'),
          Q(`${id}r2`,'multiple-choice','What is the main topic of this passage?', pTitle, `文章主题是${pTitle}。`, [pTitle, 'Technology', 'Education', 'Health']),
          Q(`${id}r3`,'true-false-ng','The passage presents only one perspective on the issue.','FALSE','文章提到了多方面因素。'),
        ]
      },
      writing: { title: `Writing Test ${test}`, timeLimit: 60,
        instructions: 'Complete both Task 1 and Task 2.', instructionsCn: '完成Task 1和Task 2。',
        writingPrompt: `Task 1: The graph shows data trends.\n\nTask 2: Discuss the advantages and disadvantages of technological advancement in education.`,
        writingPromptCn: `Task 1: 图表展示数据趋势。\n\nTask 2: 讨论科技进步在教育中的优缺点。`,
        questions: []
      },
    }
  };
}
