/**
 * Create Extracted Scenarios from PDF Content
 *
 * Manually curated scenarios based on Learn w_ J.pdf content
 * Focus: Highest quality scenarios with clear LOCKED CHUNKS alignment
 */

import { RoleplayScript } from '../services/staticData';

export const extractedScenarios: RoleplayScript[] = [
  // Café Scenario - 33 blanks extracted from PDF
  {
    id: 'service-31-cafe-full-flow',
    category: 'Service/Logistics',
    topic: 'At a Café (Full 3-Minute Flow)',
    context: 'Ordering a drink at a busy café, handling a beverage issue, and polite conversation with barista.',
    characters: [
      { name: 'Barista', description: 'Efficient and busy café staff member' },
      { name: 'You', description: 'Customer' }
    ],
    dialogue: [
      { speaker: 'Barista', text: 'Hi there. What can I get for you?' },
      { speaker: 'You', text: 'Hi. Can I have a ________ ________, please?' },
      { speaker: 'Barista', text: 'Sure. Would you like it hot or ________?' },
      { speaker: 'You', text: '________, please.' },
      { speaker: 'Barista', text: 'No problem. Any milk preference?' },
      { speaker: 'You', text: 'Yes, ________ milk, please.' },
      { speaker: 'Barista', text: 'Anything else?' },
      { speaker: 'You', text: 'I\'ll also have a ________.' },
      { speaker: 'Barista', text: 'Eat in or take ________?' },
      { speaker: 'You', text: 'Eat ________, please.' },
      { speaker: 'Barista', text: 'That\'ll be £5.50. You can pay by card or ________.' },
      { speaker: 'You', text: 'Card is ________.' },
      { speaker: 'Barista', text: 'Great. Just tap when you\'re ready.' },
      { speaker: 'You', text: 'There you ________.' },
      { speaker: 'Barista', text: 'Perfect. Your order will be ready in about ________ minutes.' },
      { speaker: 'You', text: 'No ________.' },
      { speaker: 'Barista', text: 'Here you go. One ________ ________ and a ________.' },
      { speaker: 'You', text: 'Thanks a ________.' },
      { speaker: 'Barista', text: 'Careful, it\'s quite ________.' },
      { speaker: 'You', text: 'That\'s ________. Thank you.' },
      { speaker: 'You', text: 'Excuse me, sorry to ________ you.' },
      { speaker: 'Barista', text: 'No worries. What\'s up?' },
      { speaker: 'You', text: 'I think this is supposed to be ________, but it tastes a bit ________.' },
      { speaker: 'Barista', text: 'Oh, sorry about that. Would you like me to ________ it?' },
      { speaker: 'You', text: 'Yes, that would be ________, thanks.' },
      { speaker: 'Barista', text: 'Give me just a ________.' },
      { speaker: 'Barista', text: 'Here you go. I\'ve made it ________ this time.' },
      { speaker: 'You', text: 'That\'s much ________. I really ________ it.' },
      { speaker: 'Barista', text: 'Glad to hear that. Are you working today or just ________?' },
      { speaker: 'You', text: 'Just ________. I needed a bit of ________ time.' },
      { speaker: 'Barista', text: 'Sounds nice. It\'s pretty ________ in here today.' },
      { speaker: 'You', text: 'Yeah, I like it when it\'s not too ________.' },
      { speaker: 'Barista', text: 'Same. Makes the day feel more ________.' },
      { speaker: 'You', text: 'Everything was ________. Thanks for your ________.' },
      { speaker: 'Barista', text: 'You\'re welcome. Have a ________ day.' },
      { speaker: 'You', text: 'You ________. See you ________.' }
    ],
    answerVariations: [
      { index: 1, answer: 'flat white', alternatives: ['cappuccino', 'latte', 'americano', 'black coffee'] },
      { index: 2, answer: 'hot', alternatives: ['iced', 'cold'] },
      { index: 3, answer: 'hot', alternatives: ['iced'] },
      { index: 4, answer: 'oat', alternatives: ['regular', 'semi-skimmed', 'skimmed', 'soy'] },
      { index: 5, answer: 'croissant', alternatives: ['muffin', 'sandwich', 'slice of cake', 'brownie'] },
      { index: 6, answer: 'away', alternatives: ['out'] },
      { index: 7, answer: 'in', alternatives: ['here'] },
      { index: 8, answer: 'cash', alternatives: [] },
      { index: 9, answer: 'fine', alternatives: ['good', 'perfect', 'okay'] },
      { index: 10, answer: 'go', alternatives: [] },
      { index: 11, answer: 'five', alternatives: ['two', 'three'] },
      { index: 12, answer: 'problem', alternatives: ['worries'] },
      { index: 13, answer: 'flat white', alternatives: ['latte', 'cappuccino'] },
      { index: 14, answer: 'croissant', alternatives: ['muffin', 'sandwich'] },
      { index: 15, answer: 'lot', alternatives: ['bunch'] },
      { index: 16, answer: 'hot', alternatives: ['warm'] },
      { index: 17, answer: 'fine', alternatives: ['okay', 'alright'] },
      { index: 18, answer: 'bother', alternatives: ['interrupt'] },
      { index: 19, answer: 'hot', alternatives: ['sweet', 'strong'] },
      { index: 20, answer: 'cold', alternatives: ['weak', 'bitter'] },
      { index: 21, answer: 'remake', alternatives: ['change', 'fix'] },
      { index: 22, answer: 'great', alternatives: ['lovely', 'perfect'] },
      { index: 23, answer: 'second', alternatives: ['moment'] },
      { index: 24, answer: 'fresh', alternatives: ['hotter', 'stronger'] },
      { index: 25, answer: 'better', alternatives: ['nicer'] },
      { index: 26, answer: 'appreciate', alternatives: ['like', 'enjoy'] },
      { index: 27, answer: 'relaxing', alternatives: ['chilling', 'taking a break'] },
      { index: 28, answer: 'relaxing', alternatives: ['taking it easy', 'having a break'] },
      { index: 29, answer: 'quiet', alternatives: ['personal', 'down'] },
      { index: 30, answer: 'calm', alternatives: ['quiet', 'relaxed'] },
      { index: 31, answer: 'busy', alternatives: ['noisy', 'crowded'] },
      { index: 32, answer: 'great', alternatives: ['lovely', 'perfect'] },
      { index: 33, answer: 'help', alternatives: ['service'] },
      { index: 34, answer: 'nice', alternatives: ['good', 'lovely'] },
      { index: 35, answer: 'too', alternatives: ['as well'] },
      { index: 36, answer: 'later', alternatives: ['soon'] }
    ],
    deepDive: [
      { index: 1, phrase: 'flat white', insight: 'Universal IELTS chunk - specific coffee order, very common in UK.' },
      { index: 8, phrase: 'take away', insight: 'Phrasal verb: extremely common in British English, native speech marker.' },
      { index: 10, phrase: 'there you go', insight: 'Fixed phrase from LOCKED CHUNKS - used constantly by natives.' },
      { index: 18, phrase: 'sorry to bother you', insight: 'Polite interruption phrase - shows deference, very natural.' },
      { index: 26, phrase: 'I really appreciate it', insight: 'Universal chunk - expresses gratitude in mature, professional way.' }
    ]
  },

  // Airport Check-In Scenario
  {
    id: 'service-32-airport-checkin',
    category: 'Service/Logistics',
    topic: 'Airport Check-In (Full 3-Minute Flow)',
    context: 'Checking in at airport counter - passport, bags, seat selection, and flight confirmation.',
    characters: [
      { name: 'Check-in Agent', description: 'Professional airport staff member' },
      { name: 'You', description: 'Traveller' }
    ],
    dialogue: [
      { speaker: 'Check-in Agent', text: 'Good morning. May I see your passport, please?' },
      { speaker: 'You', text: 'Good morning. Here you ________.' },
      { speaker: 'Check-in Agent', text: 'Thank you. Where are you flying ________ today?' },
      { speaker: 'You', text: 'I\'m flying to ________.' },
      { speaker: 'Check-in Agent', text: 'Is this for business or ________?' },
      { speaker: 'You', text: 'It\'s for ________.' },
      { speaker: 'Check-in Agent', text: 'Do you have any bags to ________ in?' },
      { speaker: 'You', text: 'Yes, I have ________ bag.' },
      { speaker: 'Check-in Agent', text: 'Please place your bag on the ________.' },
      { speaker: 'You', text: 'Sure. Here you ________.' },
      { speaker: 'Check-in Agent', text: 'Your bag is ________ kilos, which is fine. Did you pack your bags ________?' },
      { speaker: 'You', text: 'Yes, I packed them ________.' },
      { speaker: 'Check-in Agent', text: 'Are you carrying any liquids, sharp objects, or ________ items?' },
      { speaker: 'You', text: 'No, nothing like ________.' },
      { speaker: 'Check-in Agent', text: 'Do you have a seat preference? Window or ________?' },
      { speaker: 'You', text: 'A ________ seat, if possible.' },
      { speaker: 'Check-in Agent', text: 'Let me check... yes, I can do that. Would you like to sit near the aisle or ________ the wing?' },
      { speaker: 'You', text: 'Near the ________, please.' },
      { speaker: 'Check-in Agent', text: 'Alright. Here is your boarding ________.' },
      { speaker: 'Check-in Agent', text: 'Boarding starts at ________, and your gate is ________.' },
      { speaker: 'You', text: 'Okay. How long does boarding usually ________?' },
      { speaker: 'Check-in Agent', text: 'About ________ minutes.' },
      { speaker: 'You', text: 'Great. Is the flight ________ on time?' },
      { speaker: 'Check-in Agent', text: 'Yes, everything looks ________.' },
      { speaker: 'You', text: 'Perfect. Thank you for your ________.' },
      { speaker: 'Check-in Agent', text: 'You\'re welcome. Have a ________ flight.' }
    ],
    answerVariations: [
      { index: 1, answer: 'go', alternatives: ['are'] },
      { index: 2, answer: 'to', alternatives: ['out to', 'off to'] },
      { index: 3, answer: 'Paris', alternatives: ['Berlin', 'London', 'Rome'] },
      { index: 4, answer: 'leisure', alternatives: ['holiday', 'personal travel'] },
      { index: 5, answer: 'leisure', alternatives: ['holiday'] },
      { index: 6, answer: 'check', alternatives: ['check in', 'put in'] },
      { index: 7, answer: 'one', alternatives: ['just one', 'a single'] },
      { index: 8, answer: 'scale', alternatives: ['belt', 'conveyor'] },
      { index: 9, answer: 'go', alternatives: ['are'] },
      { index: 10, answer: 'about', alternatives: ['around', 'just under'] },
      { index: 11, answer: 'yourself', alternatives: ['on your own'] },
      { index: 12, answer: 'restricted', alternatives: ['dangerous', 'prohibited'] },
      { index: 13, answer: 'that', alternatives: ['those', 'that at all'] },
      { index: 14, answer: 'aisle', alternatives: ['middle'] },
      { index: 15, answer: 'window', alternatives: ['aisle'] },
      { index: 16, answer: 'near', alternatives: ['under', 'by'] },
      { index: 17, answer: 'aisle', alternatives: ['window', 'front'] },
      { index: 18, answer: 'pass', alternatives: ['card'] },
      { index: 19, answer: 'six thirty', alternatives: ['seven', 'shortly'] },
      { index: 20, answer: 'A12', alternatives: ['B7', 'C3'] },
      { index: 21, answer: 'take', alternatives: ['last'] },
      { index: 22, answer: 'still', alternatives: ['running', 'expected to be'] },
      { index: 23, answer: 'fine', alternatives: ['good', 'on schedule', 'normal'] },
      { index: 24, answer: 'help', alternatives: ['assistance'] },
      { index: 25, answer: 'pleasant', alternatives: ['safe', 'nice'] }
    ],
    deepDive: [
      { index: 1, phrase: 'here you go', insight: 'LOCKED CHUNK - universal phrase for handing items over.' },
      { index: 3, phrase: 'leisure', insight: 'Standard UK English for vacation/holiday travel.' },
      { index: 15, phrase: 'window seat', insight: 'Common preference phrase, natural and native.' },
      { index: 24, phrase: 'help / assistance', insight: 'Both are LOCKED CHUNKS; assistance is slightly more formal.' }
    ]
  },

  // Hotel Check-In Scenario
  {
    id: 'service-33-hotel-checkin',
    category: 'Service/Logistics',
    topic: 'Hotel Check-In (Fill the Blanks)',
    context: 'Arriving at a hotel, checking in, and arranging amenities.',
    characters: [
      { name: 'Receptionist', description: 'Professional hotel staff member' },
      { name: 'You', description: 'Guest' }
    ],
    dialogue: [
      { speaker: 'Receptionist', text: 'Good evening. How can I ________ you?' },
      { speaker: 'You', text: 'Hi, I have a ________ under the name ________.' },
      { speaker: 'Receptionist', text: 'Let me check. May I see your ________, please?' },
      { speaker: 'You', text: 'Sure. Here you ________.' },
      { speaker: 'Receptionist', text: 'Thank you. You\'re staying for ________ nights, correct?' },
      { speaker: 'You', text: 'Yes, that\'s ________.' },
      { speaker: 'Receptionist', text: 'Would you like a room with a ________ or a ________ view?' },
      { speaker: 'You', text: 'A ________ view, if possible.' },
      { speaker: 'Receptionist', text: 'No problem. Breakfast is ________ from 7 to 10 a.m.' },
      { speaker: 'You', text: 'Great. Is Wi-Fi ________ in the room?' },
      { speaker: 'Receptionist', text: 'Yes, it\'s completely ________.' },
      { speaker: 'You', text: 'Perfect. What time is ________?' },
      { speaker: 'Receptionist', text: 'Check-out is at ________.' },
      { speaker: 'You', text: 'That\'s fine. Thank you for your ________.' },
      { speaker: 'Receptionist', text: 'You\'re welcome. Enjoy your ________.' },
      { speaker: 'You', text: 'Thanks. Have a ________ evening.' }
    ],
    answerVariations: [
      { index: 1, answer: 'help', alternatives: ['assist'] },
      { index: 2, answer: 'reservation', alternatives: ['booking'] },
      { index: 3, answer: 'Alex Smith', alternatives: ['[Your Name]'] },
      { index: 4, answer: 'passport', alternatives: ['ID'] },
      { index: 5, answer: 'go', alternatives: ['are'] },
      { index: 6, answer: 'two', alternatives: ['one', 'three', 'a few'] },
      { index: 7, answer: 'correct', alternatives: ['right', 'fine'] },
      { index: 8, answer: 'city', alternatives: ['garden', 'sea', 'street'] },
      { index: 9, answer: 'pool', alternatives: ['courtyard', 'mountain'] },
      { index: 10, answer: 'city', alternatives: ['garden', 'sea', 'pool'] },
      { index: 11, answer: 'served', alternatives: ['available', 'included'] },
      { index: 12, answer: 'available', alternatives: ['included', 'free'] },
      { index: 13, answer: 'free', alternatives: ['included', 'unlimited'] },
      { index: 14, answer: 'check-out', alternatives: [] },
      { index: 15, answer: 'eleven', alternatives: ['ten', 'noon'] },
      { index: 16, answer: 'help', alternatives: ['assistance'] },
      { index: 17, answer: 'stay', alternatives: ['visit'] },
      { index: 18, answer: 'nice', alternatives: ['good', 'pleasant'] }
    ],
    deepDive: [
      { index: 1, phrase: 'How can I help you?', insight: 'LOCKED CHUNK - standard opening for service interactions.' },
      { index: 2, phrase: 'reservation/booking', insight: 'Both common; "booking" slightly more modern.' },
      { index: 5, phrase: 'here you go', insight: 'LOCKED CHUNK - universal for handing items.' }
    ]
  },

  // Shopping Return Scenario
  {
    id: 'service-34-shopping-return',
    category: 'Service/Logistics',
    topic: 'Shopping Return / Refund',
    context: 'Returning a faulty item to a shop for refund or exchange.',
    characters: [
      { name: 'Shop Assistant', description: 'Helpful sales staff member' },
      { name: 'You', description: 'Customer' }
    ],
    dialogue: [
      { speaker: 'Shop Assistant', text: 'Hi there. How can I ________ you?' },
      { speaker: 'You', text: 'Hi. I\'d like to ________ this item, please.' },
      { speaker: 'Shop Assistant', text: 'Of course. What seems to be the ________?' },
      { speaker: 'You', text: 'It\'s ________, and it doesn\'t work ________.' },
      { speaker: 'Shop Assistant', text: 'I see. When did you ________ it?' },
      { speaker: 'You', text: 'I bought it ________.' },
      { speaker: 'Shop Assistant', text: 'Do you have the ________?' },
      { speaker: 'You', text: 'Yes, here you ________.' },
      { speaker: 'Shop Assistant', text: 'Would you like a ________ or an exchange?' },
      { speaker: 'You', text: 'I\'d prefer a ________, please.' },
      { speaker: 'Shop Assistant', text: 'That\'s fine. The refund will go back to your original ________.' },
      { speaker: 'You', text: 'That\'s ________.' },
      { speaker: 'Shop Assistant', text: 'It should take about ________ days to process.' },
      { speaker: 'You', text: 'No ________.' },
      { speaker: 'Shop Assistant', text: 'Is there anything else I can ________ you with?' },
      { speaker: 'You', text: 'No, that\'s ________. Thanks for your ________.' },
      { speaker: 'Shop Assistant', text: 'You\'re welcome. Have a ________ day.' }
    ],
    answerVariations: [
      { index: 1, answer: 'help', alternatives: ['assist'] },
      { index: 2, answer: 'return', alternatives: ['refund', 'bring back'] },
      { index: 3, answer: 'problem', alternatives: ['issue', 'trouble'] },
      { index: 4, answer: 'faulty', alternatives: ['damaged', 'broken', 'defective'] },
      { index: 5, answer: 'properly', alternatives: ['correctly', 'at all'] },
      { index: 6, answer: 'buy', alternatives: ['purchase'] },
      { index: 7, answer: 'last week', alternatives: ['yesterday', 'a few days ago'] },
      { index: 8, answer: 'receipt', alternatives: ['proof of purchase'] },
      { index: 9, answer: 'go', alternatives: ['are'] },
      { index: 10, answer: 'refund', alternatives: ['replacement'] },
      { index: 11, answer: 'refund', alternatives: ['replacement'] },
      { index: 12, answer: 'payment method', alternatives: ['card', 'account'] },
      { index: 13, answer: 'fine', alternatives: ['okay', 'perfect'] },
      { index: 14, answer: 'three', alternatives: ['five', 'seven'] },
      { index: 15, answer: 'problem', alternatives: ['worries'] },
      { index: 16, answer: 'help', alternatives: ['assist'] },
      { index: 17, answer: 'all', alternatives: ['everything'] },
      { index: 18, answer: 'help', alternatives: ['assistance', 'time'] },
      { index: 19, answer: 'nice', alternatives: ['good', 'lovely'] }
    ],
    deepDive: [
      { index: 2, phrase: 'I\'d like to return', insight: 'Direct but polite LOCKED CHUNK for formal requests.' },
      { index: 4, phrase: 'faulty', insight: 'Standard UK English for "not working properly".' },
      { index: 9, phrase: 'here you go', insight: 'LOCKED CHUNK - universal handing-over phrase.' }
    ]
  },

  // Workplace Disagreement Scenario
  {
    id: 'workplace-31-disagreement',
    category: 'Workplace',
    topic: 'Workplace Disagreement (Calm Resolution)',
    context: 'Two colleagues discussing an approach with respectful disagreement and alignment.',
    characters: [
      { name: 'Colleague', description: 'Peer at work' },
      { name: 'You', description: 'Team member' }
    ],
    dialogue: [
      { speaker: 'Colleague', text: 'I think we should move forward with this approach as is.' },
      { speaker: 'You', text: 'I see your point. I just have a slightly ________ view on this.' },
      { speaker: 'Colleague', text: 'Okay, let\'s hear it.' },
      { speaker: 'You', text: 'From my perspective, there might be a ________ risk if we proceed this way.' },
      { speaker: 'Colleague', text: 'What kind of risk are you referring to?' },
      { speaker: 'You', text: 'Mainly around ________ and how it could impact the final outcome.' },
      { speaker: 'Colleague', text: 'That\'s interesting. Can you explain a bit more?' },
      { speaker: 'You', text: 'Sure. Based on what we\'ve seen so far, the current plan could ________ timelines and put extra pressure on the team.' },
      { speaker: 'Colleague', text: 'I\'m not sure I agree with that.' },
      { speaker: 'You', text: 'That\'s fair. I\'m not saying the idea is ________, just that it may need some ________.' },
      { speaker: 'Colleague', text: 'What would you suggest instead?' },
      { speaker: 'You', text: 'One option could be to ________ the rollout and test it on a smaller ________ first.' },
      { speaker: 'Colleague', text: 'That might slow things down.' },
      { speaker: 'You', text: 'Possibly in the short term, yes. But in the long run, it could ________ rework and reduce overall risk.' },
      { speaker: 'Colleague', text: 'I see both sides here.' },
      { speaker: 'You', text: 'Ultimately, I\'m happy to support whichever direction we choose. I just wanted to ________ this concern before we commit.' }
    ],
    answerVariations: [
      { index: 1, answer: 'different', alternatives: ['alternative', 'broader'] },
      { index: 2, answer: 'potential', alternatives: ['significant', 'operational', 'long-term'] },
      { index: 3, answer: 'delivery', alternatives: ['execution', 'timing', 'alignment'] },
      { index: 4, answer: 'affect', alternatives: ['impact', 'delay', 'stretch'] },
      { index: 5, answer: 'wrong', alternatives: ['bad', 'flawed', 'off-base'] },
      { index: 6, answer: 'refining', alternatives: ['adjustment', 'reworking', 'fine-tuning'] },
      { index: 7, answer: 'pilot', alternatives: ['delay', 'stagger', 'phase'] },
      { index: 8, answer: 'scale', alternatives: ['group', 'cohort', 'segment'] },
      { index: 9, answer: 'reduce', alternatives: ['minimize', 'avoid', 'cut down on'] },
      { index: 10, answer: 'flag', alternatives: ['raise', 'surface', 'highlight'] }
    ],
    deepDive: [
      { index: 1, phrase: 'I see your point', insight: 'LOCKED CHUNK - acknowledgment without agreement.' },
      { index: 2, phrase: 'from my perspective', insight: 'LOCKED CHUNK - polite way to introduce differing opinion.' },
      { index: 10, phrase: 'flag this concern', insight: 'Workplace LOCKED CHUNK - professional, measured language.' }
    ]
  },

  // Social: Catching Up with Friend
  {
    id: 'social-31-catching-up',
    category: 'Social',
    topic: 'Catching Up with an Old Friend',
    context: 'Informal conversation with a friend you haven\'t seen in a while.',
    characters: [
      { name: 'Friend', description: 'Close acquaintance' },
      { name: 'You', description: 'You' }
    ],
    dialogue: [
      { speaker: 'You', text: 'Hey, nice to see you again. Nice to ________ you.' },
      { speaker: 'Friend', text: 'Yeah, it\'s good to see you too. It\'s a ________. So, how\'s it ________?' },
      { speaker: 'You', text: 'Not too bad, actually. Busy, but in a good way. What about you? What have you been ________ to?' },
      { speaker: 'Friend', text: 'A bit of this and that, really. Work\'s been hectic. To be honest, I\'ve been thinking about making a few changes.' },
      { speaker: 'You', text: 'Oh yeah? That\'s interesting. From my perspective, that can be a good thing, depending on the timing.' },
      { speaker: 'Friend', text: 'Exactly. I mean, I see the benefits, but it\'s not an easy decision.' },
      { speaker: 'You', text: 'I see your point. Change always sounds good in theory, but the reality can be different.' },
      { speaker: 'Friend', text: 'True. Some people say you should just go for it.' },
      { speaker: 'You', text: 'That makes sense, but I\'m not sure I agree with that completely. It really depends on the situation.' },
      { speaker: 'Friend', text: 'Fair enough. Everyone\'s circumstances are different.' },
      { speaker: 'You', text: 'By the way, are you still living in the same area?' },
      { speaker: 'Friend', text: 'Yeah, for now. Though I\'ve thought about moving.' },
      { speaker: 'You', text: 'Really? Well, to be honest, I\'d probably stay put if I were you.' },
      { speaker: 'Friend', text: 'Oh? Why\'s that?' },
      { speaker: 'You', text: 'From my perspective, moving sounds exciting, but it can be stressful. And if things are working, sometimes it\'s better not to rush.' },
      { speaker: 'Friend', text: 'I get that, but I beg to differ slightly. A new place can be a ________ of fresh air, you know?' },
      { speaker: 'You', text: 'That\'s true. I\'m not saying you\'re wrong. I just think it\'s worth thinking it through.' },
      { speaker: 'Friend', text: 'Yeah, fair enough. I suppose there\'s no rush.' },
      { speaker: 'You', text: 'Exactly. You can always play it by ________ and see how things go.' },
      { speaker: 'Friend', text: 'That\'s probably the smartest approach.' },
      { speaker: 'You', text: 'Anyway, I don\'t want to keep you too long. But it was really good catching up.' },
      { speaker: 'Friend', text: 'Same here. We should do this more often.' },
      { speaker: 'You', text: 'Definitely. Let\'s keep in ________.' },
      { speaker: 'Friend', text: 'For sure. Alright, take care.' },
      { speaker: 'You', text: 'You too. Take ________.' }
    ],
    answerVariations: [
      { index: 1, answer: 'see', alternatives: ['meet'] },
      { index: 2, answer: 'pleasure', alternatives: [] },
      { index: 3, answer: 'going', alternatives: ['going with you'] },
      { index: 4, answer: 'up to', alternatives: ['up to lately'] },
      { index: 5, answer: 'breath', alternatives: ['something refreshing'] },
      { index: 6, answer: 'ear', alternatives: ['see how it goes'] },
      { index: 7, answer: 'touch', alternatives: ['contact'] },
      { index: 8, answer: 'care', alternatives: ['it easy'] }
    ],
    deepDive: [
      { index: 1, phrase: 'Nice to see you', insight: 'LOCKED CHUNK - universal greeting.' },
      { index: 5, phrase: 'a breath of fresh air', insight: 'LOCKED CHUNK - idiom expressing positive change.' },
      { index: 7, phrase: 'let\'s keep in touch', insight: 'LOCKED CHUNK - natural closing phrase.' }
    ]
  }
];

export default extractedScenarios;
