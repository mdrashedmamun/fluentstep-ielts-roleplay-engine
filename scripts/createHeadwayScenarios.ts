/**
 * Manual Headway Scenario Creator
 * Creates high-quality IELTS Band 9 scenarios using Headway topics
 * Uses extraction services for blank insertion, transformation, and validation
 *
 * Workflow:
 * 1. Define dialogue in Headway style (Everyday English, Listening, Speaking)
 * 2. Run through blank inserter (intelligent LOCKED_CHUNKS targeting)
 * 3. Transform to RoleplayScript format
 * 4. Validate with adaptive compliance
 * 5. Integrate into staticData.ts
 */

import { insertBlanksIntelligently } from '../src/services/blankInserter';
import { transformToRoleplayScript } from '../src/services/scenarioTransformer';
import { validateWithAdaptiveCompliance, suggestContentType, createConfigForScenario } from '../src/services/adaptiveChunkValidator';
import { RoleplayScript } from '../src/services/staticData';

/**
 * Headway Advanced Scenarios - Oxford Quality
 * C1-C2 Level Natural British English
 */

const HEADWAY_SCENARIOS = [
  {
    title: 'Negotiating a Business Partnership',
    context: 'Two entrepreneurs discussing terms of a potential partnership',
    type: 'advanced_discussion',
    dialogue: [
      { speaker: 'Alex', text: 'I appreciate your interest in partnering with us. We\'ve established a strong track record in the market.' },
      { speaker: 'Jordan', text: 'Yes, your brand reputation is impeccable. However, we need to discuss the equity split and financial commitments.' },
      { speaker: 'Alex', text: 'Fair point. We were thinking a 60-40 arrangement, given our market presence and initial capital investment.' },
      { speaker: 'Jordan', text: 'That seems somewhat lopsided. Given our distribution network and customer base, we\'d argue for a more equitable arrangement.' },
      { speaker: 'Alex', text: 'I see your point. Perhaps we could structure it differently - performance-based adjustments over the first three years?' },
      { speaker: 'Jordan', text: 'Now we\'re talking. That introduces flexibility and rewards both parties for delivering results.' },
      { speaker: 'Alex', text: 'Exactly. We should also clarify operational control. I assume you\'d want a seat on the board?' },
      { speaker: 'Jordan', text: 'Absolutely essential. And we\'ll need transparent access to financial records on a quarterly basis.' },
      { speaker: 'Alex', text: 'That goes without saying. Shall we schedule a follow-up with our legal teams to iron out the details?' },
      { speaker: 'Jordan', text: 'Perfect. I\'ll have my lawyer draft a preliminary memorandum of understanding by next week.' }
    ]
  },
  {
    title: 'Discussing Career Development',
    context: 'Manager and employee reviewing performance and career prospects',
    type: 'workplace',
    dialogue: [
      { speaker: 'Manager', text: 'Your performance this quarter has been exceptional. I wanted to have a candid conversation about your career trajectory.' },
      { speaker: 'Sam', text: 'Thank you. I appreciate that feedback. I\'ve been keen to discuss potential growth opportunities.' },
      { speaker: 'Manager', text: 'We\'re considering promoting you to senior analyst. However, it comes with increased responsibility.' },
      { speaker: 'Sam', text: 'That\'s fantastic news. What would the role entail, particularly regarding team leadership?' },
      { speaker: 'Manager', text: 'You\'d oversee a team of three junior analysts and report directly to the department head.' },
      { speaker: 'Sam', text: 'That sounds substantial. What about professional development? Would there be budget for certifications?' },
      { speaker: 'Manager', text: 'Absolutely. We allocate funds for continuous learning. Many employees pursue advanced credentials.' },
      { speaker: 'Sam', text: 'Excellent. And salary-wise, what range were you envisioning for this position?' },
      { speaker: 'Manager', text: 'We\'re looking at a 25% increase from your current base, plus performance bonuses.' },
      { speaker: 'Sam', text: 'That\'s generous. When would the transition occur?' },
      { speaker: 'Manager', text: 'We\'d like you to start in the new role next month, pending your acceptance.' }
    ]
  },
  {
    title: 'Resolving a Hotel Complaint',
    context: 'Guest discussing issues with their room and seeking resolution',
    type: 'service',
    dialogue: [
      { speaker: 'Guest', text: 'Excuse me, I\'d like to discuss some issues with my accommodation. I\'m not entirely satisfied.' },
      { speaker: 'Manager', text: 'I\'m terribly sorry to hear that. Could you elaborate on the specific problems you\'ve encountered?' },
      { speaker: 'Guest', text: 'The air conditioning is barely functioning, the internet connection is intermittent, and the noise from the adjacent room is quite intrusive.' },
      { speaker: 'Manager', text: 'Those are legitimate concerns, and I sincerely apologize. Let me address each one immediately.' },
      { speaker: 'Guest', text: 'I appreciate that. What can actually be done at this point in my stay?' },
      { speaker: 'Manager', text: 'I can relocate you to a superior room at no additional charge. Additionally, I\'ll have maintenance attend to the AC immediately.' },
      { speaker: 'Guest', text: 'A room change would be helpful. How soon can this be arranged?' },
      { speaker: 'Manager', text: 'We can have you moved within the hour. Would you prefer a quieter room away from the main corridor?' },
      { speaker: 'Guest', text: 'Yes, that would be ideal. And regarding the inconvenience, is there any compensation offered?' },
      { speaker: 'Manager', text: 'Certainly. I\'d like to offer a complimentary upgrade on your final night and a voucher for our spa services.' },
      { speaker: 'Guest', text: 'That\'s a gracious gesture. Thank you for handling this so professionally.' }
    ]
  },
  {
    title: 'Debating Environmental Policy',
    context: 'Colleagues discussing company sustainability initiatives at a team meeting',
    type: 'advanced_discussion',
    dialogue: [
      { speaker: 'Lisa', text: 'Our current sustainability targets are insufficient. We need to commit to carbon neutrality by 2030.' },
      { speaker: 'Martin', text: 'I appreciate the sentiment, but that timeline is unrealistic given our operational constraints.' },
      { speaker: 'Lisa', text: 'Unrealistic, or simply unambitious? Competitors are already making this commitment.' },
      { speaker: 'Martin', text: 'Competitors can afford it; our profit margins are tighter. We need to balance environmental responsibility with financial viability.' },
      { speaker: 'Lisa', text: 'That\'s a false dichotomy. Companies that invest in sustainability early typically see improved margins long-term.' },
      { speaker: 'Martin', text: 'Perhaps, but the transition costs are substantial. Have you considered the infrastructure investments required?' },
      { speaker: 'Lisa', text: 'Of course. But government incentives and partnerships can offset those costs significantly.' },
      { speaker: 'CEO', text: 'Both of you make valid points. Let\'s examine the data objectively - Lisa, could you prepare a comprehensive cost-benefit analysis?' },
      { speaker: 'Lisa', text: 'Absolutely. I\'ll include case studies from similar industries who\'ve undergone transitions.' },
      { speaker: 'Martin', text: 'And I\'ll document our current infrastructure capabilities and transition requirements.' },
      { speaker: 'CEO', text: 'Excellent. We\'ll revisit this in two weeks with comprehensive proposals.' }
    ]
  },
  {
    title: 'Catching Up With an Old Friend',
    context: 'Two friends reconnecting after several years apart',
    type: 'social',
    dialogue: [
      { speaker: 'Emma', text: 'Goodness, it\'s been what, five years? You haven\'t changed a bit!' },
      { speaker: 'Rachel', text: 'Says you! You look absolutely fabulous. What have you been up to all this time?' },
      { speaker: 'Emma', text: 'Oh, you know, the usual - work consumed most of my thirties. I\'ve changed jobs twice, moved flats three times.' },
      { speaker: 'Rachel', text: 'Blimey, that\'s hectic. Are you happy with where you\'re at now?' },
      { speaker: 'Emma', text: 'Mostly, yes. The job is fulfilling, though the commute is a nightmare. How about you? Still with the same company?' },
      { speaker: 'Rachel', text: 'Actually, I took the plunge and started my own consultancy. It\'s terrifying but exhilarating.' },
      { speaker: 'Emma', text: 'That\'s brilliant! I always said you had the entrepreneurial spirit. How\'s business treating you?' },
      { speaker: 'Rachel', text: 'We\'re growing steadily. Some months are feast, others famine, but overall I can\'t complain.' },
      { speaker: 'Emma', text: 'That\'s wonderful. You know, we really should do this more often. Life\'s too short to lose touch.' },
      { speaker: 'Rachel', text: 'Absolutely. Let\'s promise to catch up monthly, even if it\'s just a quick coffee.' },
      { speaker: 'Emma', text: 'Deal. Same time next month?' },
      { speaker: 'Rachel', text: 'Perfect. I\'ve missed this.' }
    ]
  },
  {
    title: 'Booking a Corporate Training Course',
    context: 'HR manager contacting a training provider to arrange employee development',
    type: 'workplace',
    dialogue: [
      { speaker: 'Manager', text: 'Good morning. We\'re interested in scheduling a leadership development programme for our management team.' },
      { speaker: 'Trainer', text: 'Excellent. We offer several tailored programmes. How many participants are we looking at?' },
      { speaker: 'Manager', text: 'Initially, twelve managers across three departments. What options do you recommend?' },
      { speaker: 'Trainer', text: 'For that group size, we could do a three-day intensive or a series of half-day workshops. What\'s your preference?' },
      { speaker: 'Manager', text: 'The half-day option appeals more - it minimizes disruption to operations. How would the content be structured?' },
      { speaker: 'Trainer', text: 'Week one focuses on self-awareness and emotional intelligence. Week two covers team dynamics and conflict resolution.' },
      { speaker: 'Manager', text: 'That sounds comprehensive. What about post-training support? We want sustained behaviour change.' },
      { speaker: 'Trainer', text: 'We include three follow-up coaching sessions per participant and a group reunion workshop after six months.' },
      { speaker: 'Manager', text: 'Perfect. What would the total investment be, and do you offer flexible payment terms?' },
      { speaker: 'Trainer', text: 'For this scope, roughly £8,000. We offer three payment options or can discuss custom arrangements.' },
      { speaker: 'Manager', text: 'Excellent. Could you email a detailed proposal by Friday?' }
    ]
  },
  {
    title: 'Discussing Climate Change Solutions',
    context: 'Academics at a conference debating approaches to environmental sustainability',
    type: 'advanced_discussion',
    dialogue: [
      { speaker: 'Dr. Chen', text: 'The consensus on renewable energy adoption is clear, yet implementation remains glacial. Why the disconnect?' },
      { speaker: 'Prof. Anderson', text: 'Political will and vested interests in fossil fuel industries. Economics haven\'t shifted sufficiently.' },
      { speaker: 'Dr. Chen', text: 'But that\'s precisely backward. Renewables are now cost-competitive. The barrier is inertia, not economics.' },
      { speaker: 'Prof. Anderson', text: 'True, but infrastructure transition requires massive capital. Governments hesitate to invest.' },
      { speaker: 'Dr. Chen', text: 'Yet they subsidize fossil fuels extensively. Imagine redirecting that capital toward renewables.' },
      { speaker: 'Prof. Jones', text: 'The challenge isn\'t individual technologies but systemic transformation. We need integrated solutions.' },
      { speaker: 'Dr. Chen', text: 'Agreed. Carbon pricing, renewable mandates, infrastructure investment - simultaneously.' },
      { speaker: 'Prof. Anderson', text: 'That requires international coordination. How realistic is that given geopolitical tensions?' },
      { speaker: 'Prof. Jones', text: 'Climate impacts transcend borders. Nations will coordinate when consequences become undeniable.' },
      { speaker: 'Dr. Chen', text: 'By which point, adaptation becomes costlier than mitigation. We\'re running out of time.' }
    ]
  }
];

/**
 * Create a RoleplayScript from a Headway scenario
 */
async function createScenarioScript(scenario: (typeof HEADWAY_SCENARIOS)[0], id: string): Promise<{
  scenario: RoleplayScript;
  compliance: any;
  success: boolean;
}> {
  try {
    // Step 1: Insert blanks intelligently
    console.log(`\n⚙️  Processing: ${scenario.title}`);
    const blankResult = insertBlanksIntelligently(scenario.dialogue, 12);
    console.log(`  ✓ Inserted ${blankResult.blanksInserted} blanks`);

    // Step 2: Create scenario object for transformation
    const parsedScenario = {
      title: scenario.title,
      context: scenario.context,
      characters: Array.from(new Set(scenario.dialogue.map(d => d.speaker))).concat(['You']),
      dialogue: blankResult.dialogue,
      answers: blankResult.answers.map((a, idx) => ({
        index: idx + 1,
        lineIndex: -1,
        blankPosition: -1,
        answer: a.answer,
        alternatives: a.alternatives
      })),
      rawText: scenario.dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n')
    };

    // Step 3: Transform to RoleplayScript
    const transformed = transformToRoleplayScript(parsedScenario);
    const script = transformed.scenario;
    script.id = id;

    // Step 4: Validate with adaptive compliance
    const contentType = suggestContentType(
      scenario.dialogue.map(d => d.speaker),
      scenario.dialogue
    );
    const config = createConfigForScenario(contentType, 'C1');
    const compliance = validateWithAdaptiveCompliance(
      blankResult.answers.map(a => a.answer),
      config
    );

    console.log(
      `  ✓ Compliance: ${compliance.complianceScore}% (target: ${config.targetCompliance}%) | Type: ${contentType}`
    );

    return {
      scenario: script,
      compliance,
      success: compliance.passesAdaptiveThreshold
    };
  } catch (error) {
    console.error(
      `  ✗ Failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      scenario: null as any,
      compliance: null,
      success: false
    };
  }
}

/**
 * Main: Create all scenarios
 */
async function createAllScenarios() {
  console.log('\n🎯 Creating New Headway Advanced Scenarios');
  console.log('═'.repeat(60));

  const results: any[] = [];

  // Map scenarios to category IDs
  const categoryMap: Record<string, { prefix: string; counter: number }> = {
    advanced_discussion: { prefix: 'advanced', counter: 5 },
    workplace: { prefix: 'workplace', counter: 32 },
    service: { prefix: 'service', counter: 37 },
    social: { prefix: 'social', counter: 32 }
  };

  for (const scenario of HEADWAY_SCENARIOS) {
    const category = scenario.type;
    const mapping = categoryMap[category];

    if (!mapping) {
      console.warn(`⚠️ Unknown category: ${category}`);
      continue;
    }

    const id = `${mapping.prefix}-${mapping.counter}`;
    mapping.counter++;

    const result = await createScenarioScript(scenario, id);
    if (result.success) {
      results.push(result);
    }
  }

  // Output results
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Created ${results.length}/${HEADWAY_SCENARIOS.length} scenarios`);

  // Display TypeScript code to add to staticData.ts
  console.log('\n📋 Add to services/staticData.ts:\n');
  console.log('const HEADWAY_SCENARIOS: RoleplayScript[] = [');

  for (const result of results) {
    const s = result.scenario;
    console.log(`  {
    id: '${s.id}',
    category: '${s.category}',
    topic: '${s.topic.replace(/'/g, "\\'")}',
    context: '${s.context.replace(/'/g, "\\'")}',
    characters: [
      ${s.characters.map(c => `{ name: '${c.name}', description: '${c.description}' }`).join(',\n      ')}
    ],
    dialogue: [
      ${s.dialogue.map(d => `{ speaker: '${d.speaker}', text: '${d.text.replace(/'/g, "\\'")}' }`).join(',\n      ')}
    ],
    answerVariations: [
      ${s.answerVariations.map(a => `{ index: ${a.index}, answer: '${a.answer.replace(/'/g, "\\'")}', alternatives: [${a.alternatives.map(alt => `'${alt.replace(/'/g, "\\'")}'`).join(', ')}] }`).join(',\n      ')}
    ],
    deepDive: [
      ${s.deepDive.slice(0, 3).map(d => `{ index: ${d.index}, phrase: '${d.phrase.replace(/'/g, "\\'")}', insight: '${d.insight.replace(/'/g, "\\'")}'}`).join(',\n      ')}
    ]
  },`);
  }

  console.log('];');

  // Compliance summary
  console.log(`\n📊 Compliance Summary:`);
  const avgCompliance = results.reduce((sum, r) => sum + (r.compliance?.complianceScore || 0), 0) / results.length;
  console.log(`  Average: ${avgCompliance.toFixed(0)}%`);
  console.log(`  Range: ${Math.min(...results.map(r => r.compliance?.complianceScore || 0)).toFixed(0)}% - ${Math.max(...results.map(r => r.compliance?.complianceScore || 0)).toFixed(0)}%`);

  console.log('\n✨ Scenarios ready for integration!\n');
}

// Run
createAllScenarios().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
