
export interface RoleplayScript {
    id: string;
    category: 'Social' | 'Workplace' | 'Service/Logistics' | 'Advanced';
    topic: string;
    context: string;
    characters: {
        name: string;
        description: string;
        avatarUrl?: string;
    }[];
    dialogue: {
        speaker: string;
        text: string;
    }[];
    answerVariations: {
        index: number;
        answer: string;
        alternatives: string[];
    }[];
    deepDive: {
        index: number;
        phrase: string;
        insight: string;
    }[];
    backgroundUrl?: string;
}

export const CURATED_ROLEPLAYS: RoleplayScript[] = [
    {
        id: 'social-1-flatmate',
        category: 'Social',
        topic: 'Meeting a New Flatmate',
        context: 'First meeting in the new shared house.',
        characters: [
            { name: 'Jack', description: 'Friendly flatmate.', avatarUrl: '/avatars/jack_character_3d_1770270663949.png' },
            { name: 'You', description: 'New flatmate.' }
        ],
        dialogue: [
            { speaker: 'Jack', text: 'Hello, I’m Jack. I’m the new flatmate.' },
            { speaker: 'You', text: 'Hello, my name is Alex. Nice to ________ you.' },
            { speaker: 'Jack', text: 'Nice to meet you too. So, this is the house. It’s really ________, isn’t it?' },
            { speaker: 'You', text: 'Yes, it is. But it’s very difficult to keep ________.' },
            { speaker: 'Jack', text: 'Don’t worry. Your accent is very clear. Where are you ________?' },
            { speaker: 'You', text: 'I’m from ________.' },
            { speaker: 'Jack', text: 'That’s interesting. How long have you been living here?' },
            { speaker: 'You', text: 'I’ve been living here for about ________.' },
            { speaker: 'Jack', text: 'Do you like it so far?' },
            { speaker: 'You', text: 'Yes, I do. The area is quite ________, and the people are very ________.' },
            { speaker: 'Jack', text: 'That’s good to hear. By the way, what do you do for ________?' },
            { speaker: 'You', text: 'I work as a ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'meet', alternatives: ['see', 'finally meet'] },
            { index: 2, answer: 'bright', alternatives: ['nice', 'spacious', 'comfortable', 'lovely'] },
            { index: 3, answer: 'clean', alternatives: ['tidy', 'organized', 'neat'] },
            { index: 4, answer: 'from', alternatives: ['originally from', 'coming from'] },
            { index: 5, answer: 'London', alternatives: ['overseas'] },
            { index: 6, answer: 'six months', alternatives: ['quite a while', 'nearly a year'] },
            { index: 7, answer: 'quiet', alternatives: ['convenient', 'pleasant', 'peaceful'] },
            { index: 8, answer: 'friendly', alternatives: ['welcoming', 'polite', 'approachable'] },
            { index: 9, answer: 'a living', alternatives: ['work', 'a career'] },
            { index: 10, answer: 'designer', alternatives: ['teacher', 'engineer'] }
        ],
        deepDive: [
            { index: 1, phrase: 'meet', insight: 'Standard greeting. Responses often include "too".' },
            { index: 6, phrase: 'quite a while', insight: 'Vagueness signals native-like comfort with the language.' },
            { index: 8, phrase: 'friendly', insight: 'Default positive adjective, never wrong.' }
        ]
    },
    {
        id: 'service-1-cafe',
        category: 'Service/Logistics',
        topic: 'At a Café (Three Minute Flow)',
        context: 'Ordering and handling a drink issue in a busy café.',
        characters: [
            { name: 'Barista', description: 'Efficient and busy.', avatarUrl: '/avatars/barista.png' },
            { name: 'You', description: 'Customer.' }
        ],
        backgroundUrl: '/avatars/london_cafe_interior_3d_1770271472049.png',
        dialogue: [
            { speaker: 'Barista', text: 'Hi there. What can I get for you?' },
            { speaker: 'You', text: 'Hi. Can I have a ________ ________, please?' },
            { speaker: 'Barista', text: 'Sure. Would you like it hot or ________?' },
            { speaker: 'You', text: '________, please.' },
            { speaker: 'Barista', text: 'No problem. Any milk preference?' },
            { speaker: 'You', text: 'Yes, ________ milk, please.' },
            { speaker: 'Barista', text: 'Anything else?' },
            { speaker: 'You', text: 'I’ll also have a ________.' },
            { speaker: 'Barista', text: 'Eat in or take ________?' },
            { speaker: 'You', text: 'Eat ________, please.' },
            { speaker: 'Barista', text: 'That’ll be £5.50. You can pay by card or ________.' },
            { speaker: 'You', text: 'Card is ________.' },
            { speaker: 'Barista', text: 'Great. Just tap when you’re ready.' },
            { speaker: 'You', text: 'There you ________.' },
            { speaker: 'Barista', text: 'Perfect. Your order will be ready in about ________ minutes.' },
            { speaker: 'You', text: 'No ________.' },
            { speaker: 'You', text: 'Excuse me, sorry to ________ you.' },
            { speaker: 'Barista', text: 'No worries. What’s up?' },
            { speaker: 'You', text: 'I think this is supposed to be ________, but it tastes a bit ________.' },
            { speaker: 'Barista', text: 'Oh, sorry about that. Would you like me to ________ it?' },
            { speaker: 'You', text: 'Yes, that would be ________, thanks.' },
            { speaker: 'Barista', text: 'Here you go. I’ve made it ________ this time.' },
            { speaker: 'You', text: 'That’s much ________. I really ________ it.' }
        ],
        answerVariations: [
            { index: 1, answer: 'flat', alternatives: ['latte', 'cappuccino', 'black'] },
            { index: 2, answer: 'white', alternatives: ['coffee', 'americano'] },
            { index: 3, answer: 'iced', alternatives: ['cold'] },
            { index: 4, answer: 'Hot', alternatives: ['Iced'] },
            { index: 5, answer: 'oat', alternatives: ['soy', 'regular', 'skimmed'] },
            { index: 6, answer: 'croissant', alternatives: ['muffin', 'brownie'] },
            { index: 7, answer: 'away', alternatives: ['out'] },
            { index: 8, answer: 'in', alternatives: ['here'] },
            { index: 9, answer: 'cash', alternatives: [] },
            { index: 10, answer: 'fine', alternatives: ['perfect', 'okay'] },
            { index: 11, answer: 'go', alternatives: ['are'] },
            { index: 12, answer: 'three', alternatives: ['five'] },
            { index: 13, answer: 'problem', alternatives: ['worries'] },
            { index: 14, answer: 'bother', alternatives: ['interrupt'] },
            { index: 15, answer: 'hot', alternatives: ['sweet', 'strong'] },
            { index: 16, answer: 'cold', alternatives: ['weak', 'bitter'] },
            { index: 17, answer: 'remade', alternatives: ['fixed', 'exchanged'] },
            { index: 18, answer: 'great', alternatives: ['lovely', 'perfect'] },
            { index: 19, answer: 'fresh', alternatives: ['hotter', 'stronger'] },
            { index: 20, answer: 'better', alternatives: ['nicer'] },
            { index: 21, answer: 'appreciate', alternatives: ['enjoy', 'like'] }
        ],
        deepDive: [
            { index: 11, phrase: 'There you go', insight: 'Fixed phrase for handing something over. Don’t overthink it.' },
            { index: 14, phrase: 'sorry to bother you', insight: 'Standard polite interruptive phrase.' },
            { index: 21, phrase: 'really appreciate it', insight: 'Common way to signal satisfaction after an issue is fixed.' }
        ]
    },
    {
        id: 'service-2-airport',
        category: 'Service/Logistics',
        topic: 'Airport Check-In Flow',
        context: 'The full check-in experience from passport to boarding pass.',
        characters: [
            { name: 'Agent', description: 'Official and efficient.' },
            { name: 'You', description: 'Traveler.' }
        ],
        dialogue: [
            { speaker: 'Agent', text: 'Good morning. May I see your passport, please?' },
            { speaker: 'You', text: 'Good morning. Here you ________.' },
            { speaker: 'Agent', text: 'Thank you. Where are you flying ________ today?' },
            { speaker: 'You', text: 'I’m flying to ________.' },
            { speaker: 'Agent', text: 'Is this for business or ________?' },
            { speaker: 'You', text: 'It’s for ________.' },
            { speaker: 'Agent', text: 'Do you have any bags to ________ in?' },
            { speaker: 'You', text: 'Yes, I have ________ bag.' },
            { speaker: 'Agent', text: 'Please place your bag on the ________.' },
            { speaker: 'You', text: 'Sure. Here you ________.' },
            { speaker: 'Agent', text: 'Thank you. Your bag is ________ kilos, which is fine.' },
            { speaker: 'Agent', text: 'Did you pack your bags ________?' },
            { speaker: 'You', text: 'Yes, I packed them ________.' },
            { speaker: 'Agent', text: 'Are you carrying any liquids, sharp objects, or ________ items?' },
            { speaker: 'You', text: 'No, nothing like ________.' },
            { speaker: 'Agent', text: 'Do you have a seat preference? Window or ________?' },
            { speaker: 'You', text: 'A ________ seat, if possible.' },
            { speaker: 'Agent', text: 'Alright. Here is your boarding ________.' },
            { speaker: 'You', text: 'Thank you. How long does boarding usually ________?' },
            { speaker: 'Agent', text: 'About ________ minutes. Is the flight still ________ on time?' },
            { speaker: 'Agent', text: 'Yes, everything looks ________.' },
            { speaker: 'You', text: 'Perfect. Thank you for your ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'go', alternatives: ['are'] },
            { index: 2, answer: 'to', alternatives: ['out to', 'off to'] },
            { index: 3, answer: 'London', alternatives: ['Tokyo', 'New York'] },
            { index: 4, answer: 'leisure', alternatives: ['holiday', 'personal travel'] },
            { index: 5, answer: 'pleasure', alternatives: ['vacation'] },
            { index: 6, answer: 'check', alternatives: ['check in', 'put in'] },
            { index: 7, answer: 'one', alternatives: ['just one', 'a single'] },
            { index: 8, answer: 'scale', alternatives: ['belt', 'conveyor'] },
            { index: 9, answer: 'are', alternatives: ['go'] },
            { index: 10, answer: '20', alternatives: ['around 20'] },
            { index: 11, answer: 'yourself', alternatives: ['on your own'] },
            { index: 12, answer: 'myself', alternatives: ['on my own'] },
            { index: 13, answer: 'prohibited', alternatives: ['restricted', 'dangerous'] },
            { index: 14, answer: 'that', alternatives: ['those', 'that at all'] },
            { index: 15, answer: 'aisle', alternatives: ['middle'] },
            { index: 16, answer: 'window', alternatives: ['aisle'] },
            { index: 17, answer: 'pass', alternatives: ['card'] },
            { index: 18, answer: 'take', alternatives: ['last'] },
            { index: 19, answer: '30', alternatives: [] },
            { index: 20, answer: 'running', alternatives: ['expected to be'] },
            { index: 21, answer: 'fine', alternatives: ['good', 'on schedule'] },
            { index: 22, answer: 'help', alternatives: ['assistance'] }
        ],
        deepDive: [
            { index: 11, phrase: 'yourself', insight: 'Standard security question phrase.' },
            { index: 17, phrase: 'boarding pass', insight: 'The official term for your flight ticket document.' }
        ]
    },
    {
        id: 'service-3-hotel-full',
        category: 'Service/Logistics',
        topic: 'Hotel Check-In',
        context: 'Checking into a hotel with specific room preferences.',
        characters: [
            { name: 'Receptionist', description: 'Helpful and polite.' },
            { name: 'You', description: 'Guest.' }
        ],
        dialogue: [
            { speaker: 'Receptionist', text: 'Good evening. How can I ________ you?' },
            { speaker: 'You', text: 'Hi, I have a ________ under the name Alex Smith.' },
            { speaker: 'Receptionist', text: 'Let me check. May I see your ________, please?' },
            { speaker: 'You', text: 'Sure. Here you ________.' },
            { speaker: 'Receptionist', text: 'Thank you. You’re staying for ________ nights, correct?' },
            { speaker: 'You', text: 'Yes, that’s ________.' },
            { speaker: 'Receptionist', text: 'Would you like a room with a ________ or a ________ view?' },
            { speaker: 'You', text: 'A ________ view, if possible.' },
            { speaker: 'Receptionist', text: 'No problem. Breakfast is ________ from 7 to 10 a.m.' },
            { speaker: 'You', text: 'Great. Is Wi-Fi ________ in the room?' },
            { speaker: 'Receptionist', text: 'Yes, it’s completely ________.' },
            { speaker: 'You', text: 'Perfect. What time is ________?' },
            { speaker: 'Receptionist', text: 'Check-out is at ________.' },
            { speaker: 'You', text: 'That’s fine. Thank you for your ________.' },
            { speaker: 'Receptionist', text: 'You’re welcome. Enjoy your ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'help', alternatives: ['assist'] },
            { index: 2, answer: 'reservation', alternatives: ['booking'] },
            { index: 3, answer: 'passport', alternatives: ['ID'] },
            { index: 4, answer: 'go', alternatives: ['are'] },
            { index: 5, answer: 'three', alternatives: ['two', 'few'] },
            { index: 6, answer: 'right', alternatives: ['correct', 'fine'] },
            { index: 7, answer: 'city', alternatives: ['garden', 'sea', 'street'] },
            { index: 8, answer: 'courtyard', alternatives: ['pool', 'mountain'] },
            { index: 9, answer: 'sea', alternatives: ['garden', 'pool'] },
            { index: 10, answer: 'served', alternatives: ['available', 'included'] },
            { index: 11, answer: 'available', alternatives: ['included', 'free'] },
            { index: 12, answer: 'free', alternatives: ['included', 'unlimited'] },
            { index: 13, answer: 'check-out', alternatives: [] },
            { index: 14, answer: 'eleven', alternatives: ['noon'] },
            { index: 15, answer: 'help', alternatives: ['assistance'] },
            { index: 16, answer: 'stay', alternatives: ['visit'] }
        ],
        deepDive: [
            { index: 12, phrase: 'completely free', insight: 'High-value signal. "Included" is standard, but "completely free" sounds more native.' }
        ]
    },
    {
        id: 'service-4-return-no-receipt',
        category: 'Service/Logistics',
        topic: 'Returning a Faulty Item',
        context: 'Handling a return for a faulty item when you’ve lost the receipt.',
        characters: [
            { name: 'Assistant', description: 'Helpful store assistant.', avatarUrl: '/avatars/assistant.png' },
            { name: 'You', description: 'Customer seeking a fair outcome.' }
        ],
        dialogue: [
            { speaker: 'Assistant', text: 'Hi there. How can I help you today?' },
            { speaker: 'You', text: 'Hi. I’d like to ________ this item, please.' },
            { speaker: 'Assistant', text: 'Of course. What seems to be the problem?' },
            { speaker: 'You', text: 'It’s ________, and it stopped working after ________ days.' },
            { speaker: 'Assistant', text: 'I see. When did you buy it?' },
            { speaker: 'You', text: 'I bought it ________.' },
            { speaker: 'Assistant', text: 'Do you happen to have the receipt with you?' },
            { speaker: 'You', text: 'Actually, I don’t have the ________ anymore.' },
            { speaker: 'Assistant', text: 'Okay. Did you pay by card or ________?' },
            { speaker: 'You', text: 'I paid by ________.' },
            { speaker: 'Assistant', text: 'That helps. Sometimes we can still locate the ________ using the payment record.' },
            { speaker: 'Assistant', text: 'Do you remember roughly what ________ you came in?' },
            { speaker: 'You', text: 'It was around ________ in the afternoon.' },
            { speaker: 'Assistant', text: 'Alright, let me check our system. Are you looking for a refund or an ________?' },
            { speaker: 'You', text: 'Ideally, I’d like a ________.' },
            { speaker: 'Assistant', text: 'I understand. Without a receipt, our policy usually allows for a ________ refund or an exchange.' },
            { speaker: 'You', text: 'I see. That’s understandable. To be honest, I’ve barely ________ the item.' }
        ],
        answerVariations: [
            { index: 1, answer: 'return', alternatives: ['get a refund on', 'bring back'] },
            { index: 2, answer: 'faulty', alternatives: ['defective', 'damaged'] },
            { index: 3, answer: 'a few', alternatives: ['two', 'three'] },
            { index: 4, answer: 'last week', alternatives: ['recently', 'a few days ago'] },
            { index: 5, answer: 'receipt', alternatives: ['proof of purchase'] },
            { index: 6, answer: 'cash', alternatives: [] },
            { index: 7, answer: 'card', alternatives: ['debit card'] },
            { index: 8, answer: 'transaction', alternatives: ['purchase', 'order'] },
            { index: 9, answer: 'time', alternatives: ['day'] },
            { index: 10, answer: 'three', alternatives: ['four', 'half past three'] },
            { index: 11, answer: 'exchange', alternatives: ['replacement'] },
            { index: 12, answer: 'refund', alternatives: ['full refund'] },
            { index: 13, 城镇: ['store credit', 'partial', 'gift card'] },
            { index: 14, answer: 'used', alternatives: ['touched', 'had a chance to use'] }
        ],
        deepDive: [
            { index: 5, phrase: 'proof of purchase', insight: 'The formal synonym for receipt. Useful for IELTS/Professional English.' }
        ]
    },
    {
        id: 'advanced-1-manager-escalation',
        category: 'Advanced',
        topic: 'Manager Escalation (Hard)',
        context: 'Advocating for a return after an assistant says no.',
        characters: [
            { name: 'Assistant', description: 'Rule-follower.' },
            { name: 'Manager', description: 'Decision maker.' },
            { name: 'You', description: 'Polite but persistent customer.' }
        ],
        dialogue: [
            { speaker: 'Assistant', text: 'I understand your concern, but unfortunately this is our standard return policy.' },
            { speaker: 'You', text: 'I see. Thanks for explaining. Would it be possible to ________ to the manager for a moment?' },
            { speaker: 'Assistant', text: 'Of course. I’ll let them know. Please give me a ________.' },
            { speaker: 'Manager', text: 'Hello. I’m the store manager. I understand there’s an issue with a return?' },
            { speaker: 'You', text: 'Yes, thanks for coming over. I completely understand the ________, but I was hoping you might be able to ________.' },
            { speaker: 'Manager', text: 'Could you briefly explain what happened?' },
            { speaker: 'You', text: 'Of course. I purchased this item ________, and it stopped working within ________ days.' },
            { speaker: 'You', text: 'Ideally, I’d like a ________, but I’m open to ________ if that’s more appropriate.' },
            { speaker: 'Manager', text: 'I can’t approve a full refund to your original payment method, but I can offer ________.' },
            { speaker: 'You', text: 'I appreciate you looking into this. Could you clarify what that would ________?' },
            { speaker: 'Manager', text: 'We can issue store credit for the full ________.' },
            { speaker: 'You', text: 'That sounds ________. I’m happy to go ahead with that.' }
        ],
        answerVariations: [
            { index: 1, answer: 'speak', alternatives: ['talk', 'have a word'] },
            { index: 2, answer: 'moment', alternatives: ['minute', 'second'] },
            { index: 3, answer: 'policy', alternatives: ['situation', 'process'] },
            { index: 4, answer: 'help', alternatives: ['make an exception', 'look into it'] },
            { index: 5, answer: 'recently', alternatives: ['last week'] },
            { index: 6, answer: 'two', alternatives: ['three', 'a few'] },
            { index: 7, answer: 'refund', alternatives: ['full refund'] },
            { index: 8, answer: 'exchange', alternatives: ['store credit'] },
            { index: 9, answer: 'store credit', alternatives: ['a gift card'] },
            { index: 10, answer: 'mean', alternatives: ['involve', 'look like'] },
            { index: 11, answer: 'amount', alternatives: ['value', 'purchase price'] },
            { index: 12, answer: 'fair', alternatives: ['reasonable', 'fine'] }
        ],
        deepDive: [
            { index: 1, phrase: 'have a word', insight: 'Very British, polite way to ask for a conversation.' },
            { index: 4, phrase: 'make an exception', insight: 'The master phrase for asking for a rule to be bent.' }
        ]
    },
    {
        id: 'advanced-2-manager-no',
        category: 'Advanced',
        topic: 'When the Manager Says No',
        context: 'Handling a complete refusal with grace and professionalism.',
        characters: [
            { name: 'Manager', description: 'Firm but polite.' },
            { name: 'You', description: 'Customer handling disappointment.' }
        ],
        dialogue: [
            { speaker: 'Manager', text: 'I understand where you’re coming from, but I’m afraid I won’t be able to make an exception in this case.' },
            { speaker: 'You', text: 'I see. Thanks for being ________ with me.' },
            { speaker: 'Manager', text: 'Without a receipt or proof of purchase, we’re unable to offer a refund.' },
            { speaker: 'You', text: 'I understand the policy. I just wanted to check, as I thought it was worth a ________.' },
            { speaker: 'Manager', text: 'I appreciate that. Unfortunately, my hands are ________.' },
            { speaker: 'You', text: 'Fair enough. I don’t want to make a ________ about it.' },
            { speaker: 'Manager', text: 'Thank you for understanding.' },
            { speaker: 'You', text: 'Just so I’m clear, there’s no ________ at all, even as store credit?' },
            { speaker: 'Manager', text: 'I’m afraid not. This is a hard ________.' },
            { speaker: 'You', text: 'Alright. No worries. I won’t ________ the point.' },
            { speaker: 'You', text: 'It’s okay. These things ________.' },
            { speaker: 'Manager', text: 'I’m sorry we couldn’t help more. If you find the receipt later, we’d be happy to take another look.' },
            { speaker: 'You', text: 'That’s good to know. I’ll keep that in ________. Thanks for taking the time to ________ it anyway.' }
        ],
        answerVariations: [
            { index: 1, answer: 'honest', alternatives: ['upfront', 'clear', 'straight'] },
            { index: 2, answer: 'try', alternatives: ['shot', 'check', 'conversation'] },
            { index: 3, answer: 'tied', alternatives: ['bound'] },
            { index: 4, answer: 'fuss', alternatives: ['scene', 'big deal'] },
            { index: 5, answer: 'possibility', alternatives: ['option', 'way'] },
            { index: 6, answer: 'no', alternatives: ['line', 'stop'] },
            { index: 7, answer: 'push', alternatives: ['press', 'argue', 'labour'] },
            { index: 8, answer: 'happen', alternatives: ['come up', 'occur'] },
            { index: 9, answer: 'mind', alternatives: ['note'] },
            { index: 10, answer: 'review', alternatives: ['look into', 'explain'] }
        ],
        deepDive: [
            { index: 3, phrase: 'hands are tied', insight: 'Idiom meaning "I have no power to change this".' },
            { index: 4, phrase: 'make a fuss', insight: 'Britishism for "causing trouble" or "complaining loudly".' },
            { index: 7, phrase: 'push the point', insight: 'Polite way to signal you are stopping the argument.' }
        ]
    },
    {
        id: 'workplace-1-disagreement',
        category: 'Workplace',
        topic: 'Workplace Disagreement',
        context: 'Offering an alternative view in a meeting without being confrontational.',
        characters: [
            { name: 'Colleague', description: 'Opinionated but professional.' },
            { name: 'Manager', description: 'Facilitator.' },
            { name: 'You', description: 'Thoughtful team member.' }
        ],
        dialogue: [
            { speaker: 'Colleague', text: 'I think we should move forward with this approach as it is.' },
            { speaker: 'You', text: 'I see your point. I just have a slightly ________ view on this.' },
            { speaker: 'Manager', text: 'Okay, let’s hear it.' },
            { speaker: 'You', text: 'From my perspective, there might be a ________ risk if we proceed this way.' },
            { speaker: 'Colleague', text: 'What kind of risk are you referring to?' },
            { speaker: 'You', text: 'Mainly around ________ and how it could impact the final outcome.' },
            { speaker: 'Manager', text: 'That’s interesting. Can you explain a bit more?' },
            { speaker: 'You', text: 'Sure. Based on what we’ve seen so far, the current plan could ________ timelines and put extra pressure on the team.' },
            { speaker: 'Colleague', text: 'I’m not sure I agree with that.' },
            { speaker: 'You', text: 'That’s fair. I’m not saying the idea is ________, just that it may need some ________.' },
            { speaker: 'Manager', text: 'What would you suggest instead?' },
            { speaker: 'You', text: 'One option could be to ________ the rollout and test it on a smaller ________ first.' },
            { speaker: 'You', text: 'Ultimately, I’m happy to support whichever direction we choose. I just wanted to ________ this concern before we commit.' }
        ],
        answerVariations: [
            { index: 1, answer: 'different', alternatives: ['alternative', 'broader'] },
            { index: 2, answer: 'potential', alternatives: ['significant', 'long-term'] },
            { index: 3, answer: 'timing', alternatives: ['execution', 'alignment'] },
            { index: 4, answer: 'stretch', alternatives: ['affect', 'impact', 'delay'] },
            { index: 5, answer: 'flawed', alternatives: ['wrong', 'bad', 'off-base'] },
            { index: 6, answer: 'fine-tuning', alternatives: ['refining', 'adjustment'] },
            { index: 7, answer: 'pilot', alternatives: ['phase', 'stagger'] },
            { index: 8, answer: 'scale', alternatives: ['limited', 'initial'] },
            { index: 9, answer: 'flag', alternatives: ['raise', 'surface', 'highlight'] }
        ],
        deepDive: [
            { index: 1, phrase: 'different view', insight: 'Softer than saying "I disagree".' },
            { index: 9, phrase: 'flag a concern', insight: 'The professional way to highlight a risk without sounding negative.' }
        ]
    },
    {
        id: 'advanced-3-manager-pushback',
        category: 'Advanced',
        topic: 'Manager Pushes Back Harder',
        context: 'A high-stakes disagreement where the manager is dismissive.',
        characters: [
            { name: 'Manager', description: 'Time-pressured and firm.' },
            { name: 'You', description: 'Senior-level contributor standing ground.' }
        ],
        dialogue: [
            { speaker: 'Manager', text: 'We’re on a tight timeline. Reopening this now could slow things down.' },
            { speaker: 'You', text: 'I agree timing is ________. My concern is that moving too quickly here could create ________ issues later.' },
            { speaker: 'Manager', text: 'We can’t design for every possible risk.' },
            { speaker: 'You', text: 'Absolutely. I’m not suggesting we cover ________. I’m referring to one specific area that might ________ the rollout.' },
            { speaker: 'You', text: 'My hesitation is that fixing it later may be more ________ and disruptive than addressing it now.' },
            { speaker: 'Manager', text: 'So what exactly are you proposing at this stage?' },
            { speaker: 'You', text: 'At minimum, I’d suggest we ________ the assumption around ________ and confirm it with real data before launch.' },
            { speaker: 'Manager', text: 'We’ve already committed resources based on the current plan.' },
            { speaker: 'You', text: 'I’m aware of that. I’m not asking to change the entire ________, just to make a small ________ adjustment.' },
            { speaker: 'You', text: 'This is one of those moments where I felt it was ________ to speak up.' },
            { speaker: 'Manager', text: 'Alright. Put together a short summary, no more than ________ page, and we’ll review it tomorrow.' },
            { speaker: 'You', text: 'That works. I’ll keep it ________ and focused. Thanks for the ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'tight', alternatives: ['critical', 'sensitive'] },
            { index: 2, answer: 'downstream', alternatives: ['knock-on', 'operational'] },
            { index: 3, answer: 'everything', alternatives: ['every scenario', 'every edge case'] },
            { index: 4, answer: 'disrupt', alternatives: ['delay', 'complicate', 'undermine'] },
            { index: 5, answer: 'costly', alternatives: ['time-consuming', 'expensive'] },
            { index: 6, answer: 'validate', alternatives: ['pressure-test', 'revisit'] },
            { index: 7, answer: 'capacity', alternatives: ['adoption', 'dependencies'] },
            { index: 8, answer: 'plan', alternatives: ['direction', 'strategy'] },
            { index: 9, answer: 'tactical', alternatives: ['minor', 'minor', 'targeted'] },
            { index: 10, answer: 'important', alternatives: ['responsible', 'necessary'] },
            { index: 11, answer: 'one', alternatives: ['a single'] },
            { index: 12, answer: 'concise', alternatives: ['tight', 'to the point'] },
            { index: 13, answer: 'openness', alternatives: ['time', 'discussion'] }
        ],
        deepDive: [
            { index: 2, phrase: 'downstream issues', insight: 'High-level business term for future problems caused by today’s choices.' },
            { index: 6, phrase: 'pressure-test', insight: 'Corporate idiom for checking if a theory holds up in reality.' },
            { index: 10, phrase: 'responsible to speak up', insight: 'A power move phrase: framing disagreement as a duty to the company.' }
        ]
    },
    {
        id: 'workplace-2-feedback',
        category: 'Workplace',
        topic: 'Negative Feedback on a Report',
        context: 'Correcting a colleague’s work without bruising their ego.',
        characters: [
            { name: 'Colleague', description: 'Hard worker but needs guidance.' },
            { name: 'You', description: 'Reviewer/Mentor.' }
        ],
        dialogue: [
            { speaker: 'You', text: 'Thanks for sharing the report. Before we circulate it more widely, I wanted to walk through a few ________ points with you.' },
            { speaker: 'Colleague', text: 'Sure. What did you think?' },
            { speaker: 'You', text: 'Overall, the structure is solid, and the effort is clear. That said, there are a few areas where the report could be ________.' },
            { speaker: 'You', text: 'Starting with the executive summary, I think the key message gets a bit ________. It might help to make the main takeaway more ________ upfront.' },
            { speaker: 'You', text: 'The challenge is that senior readers tend to focus on ________ first, so clarity there really ________.' },
            { speaker: 'You', text: 'In the analysis section, some of the assumptions aren’t fully ________.' },
            { speaker: 'Colleague', text: 'I didn’t want to overcomplicate it.' },
            { speaker: 'You', text: 'I appreciate that. It’s a balance, but right now it might feel a bit ________ to someone less close to the work.' },
            { speaker: 'You', text: 'Another thing to flag is tone. In a few places, the language comes across as quite ________.' },
            { speaker: 'You', text: 'I think softening it slightly and grounding it more in ________ would help.' },
            { speaker: 'You', text: 'On the recommendations page, I’d recommend a quick ________ pass just to improve flow and remove repetition.' },
            { speaker: 'You', text: 'To be clear, the content is there. This is more about ________ and making sure the report lands the way we intend.' }
        ],
        answerVariations: [
            { index: 1, answer: 'key', alternatives: ['specific', 'important'] },
            { index: 2, answer: 'sharper', alternatives: ['stronger', 'clearer'] },
            { index: 3, answer: 'lost', alternatives: ['buried', 'diluted'] },
            { index: 4, answer: 'explicit', alternatives: ['clear', 'direct'] },
            { index: 5, answer: 'summary', alternatives: ['headlines', 'top-line messages'] },
            { index: 6, answer: 'matters', alternatives: ['counts', 'sets the tone'] },
            { index: 7, answer: 'justified', alternatives: ['explained', 'supported'] },
            { index: 8, answer: 'thin', alternatives: ['light', 'underdeveloped'] },
            { index: 9, answer: 'absolute', alternatives: ['strong', 'assertive'] },
            { index: 10, answer: 'evidence', alternatives: ['data', 'facts'] },
            { index: 11, answer: 'polish', alternatives: ['editing', 'clarity'] },
            { index: 12, answer: 'framing', alternatives: ['positioning', 'presentation'] }
        ],
        deepDive: [
            { index: 1, phrase: 'walk through', insight: 'The collaborative alternative to "discuss" or "critique".' },
            { index: 12, phrase: 'lands the way we intend', insight: 'Modern professional way to talk about the receiver’s reaction.' }
        ]
    },
    {
        id: 'social-2-catch-up',
        category: 'Social',
        topic: 'Catching Up with an Old Friend',
        context: 'A deep catch-up covering life changes and advice.',
        characters: [
            { name: 'Friend', description: 'Hectic worker.' },
            { name: 'You', description: 'Empathetic listener.' }
        ],
        dialogue: [
            { speaker: 'You', text: 'Hey, nice to see you again. Nice to ________ you.' },
            { speaker: 'Friend', text: 'Yeah, it’s good to see you too. It’s a ________. So, how’s it ________?' },
            { speaker: 'You', text: 'Not too bad, actually. Busy, but in a good way. What have you been ________ to?' },
            { speaker: 'Friend', text: 'Work’s been hectic. To be honest, I’ve been thinking about making a few changes.' },
            { speaker: 'You', text: 'Oh yeah? From my perspective, that can be a good thing, depending on the timing.' },
            { speaker: 'Friend', text: 'Exactly. I mean, I see the benefits, but it’s not an easy decision.' },
            { speaker: 'You', text: 'I see your point. Change always sounds good in theory, but the reality can be different.' },
            { speaker: 'Friend', text: 'I’ve thought about moving. A new place can be a ________ of fresh air, you know?' },
            { speaker: 'You', text: 'That’s true. You can always play it by ________ and see how things go.' },
            { speaker: 'You', text: 'Anyway, I don’t want to keep you too long. Let’s keep in ________.' },
            { speaker: 'You', text: 'Alright, take care. You too. Take ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'see', alternatives: ['meet'] },
            { index: 2, answer: 'pleasure', alternatives: ['surprise'] },
            { index: 3, answer: 'going', alternatives: ['moving'] },
            { index: 4, answer: 'up', alternatives: ['doing'] },
            { index: 5, answer: 'breath', alternatives: ['blast'] },
            { index: 6, answer: 'ear', alternatives: ['whim'] },
            { index: 7, answer: 'touch', alternatives: ['contact'] },
            { index: 8, answer: 'it easy', alternatives: ['care'] }
        ],
        deepDive: [
            { index: 5, phrase: 'breath of fresh air', insight: 'Idiom for a positive, new change.' },
            { index: 6, phrase: 'play it by ear', insight: 'One of the most used native idioms for being flexible.' }
        ]
    },
    {
        id: 'social-3-weekend-plans',
        category: 'Social',
        topic: 'Changing Weekend Plans',
        context: 'Cancelling a meeting last-minute without being rude.',
        characters: [
            { name: 'Friend A', description: 'Disappointed but kind.' },
            { name: 'Friend B', description: 'The one cancelling.' }
        ],
        dialogue: [
            { speaker: 'Friend A', text: 'Hey, how’s it ________? So, about the weekend, are you still free?' },
            { speaker: 'Friend B', text: 'I was thinking we could grab a coffee. How does that ________?' },
            { speaker: 'Friend A', text: 'Saturday works for me, but we could also play it by ________, depending on the weather.' },
            { speaker: 'Friend B', text: 'Around four-ish? Yeah, that makes ________.' },
            { speaker: 'Friend B', text: 'Hey, quick message. I just wanted to let you know that something has ________ up.' },
            { speaker: 'Friend A', text: 'Oh right. What happened?' },
            { speaker: 'Friend B', text: 'To be honest, I’ve had to help out at home unexpectedly. That’s a bit of a shame, but fair ________.' },
            { speaker: 'Friend B', text: 'Yeah, it’s a ________, but there’s not much I can do. These things ________.' },
            { speaker: 'Friend B', text: 'I didn’t want to mess you around. Would Sunday work, or would you rather ________ leave it?' }
        ],
        answerVariations: [
            { index: 1, answer: 'going', alternatives: ['moving'] },
            { index: 2, answer: 'sound', alternatives: ['work'] },
            { index: 3, answer: 'ear', alternatives: ['whim'] },
            { index: 4, answer: 'sense', alternatives: ['logic'] },
            { index: 5, answer: 'come', alternatives: ['cropped'] },
            { index: 6, answer: 'enough', alternatives: ['play'] },
            { index: 7, answer: 'shame', alternatives: ['pity'] },
            { index: 8, answer: 'happen', alternatives: ['occur'] },
            { index: 9, answer: 'not', alternatives: ['rather not'] }
        ],
        deepDive: [
            { index: 5, phrase: 'something has come up', insight: 'The perfect vague phrase for cancelling without over-explaining.' },
            { index: 8, phrase: 'these things happen', insight: 'The native "social glue" phrase for accepting an apology for a minor issue.' }
        ]
    },
    {
        id: 'workplace-3-disagreement-polite',
        category: 'Workplace',
        topic: 'Polite Disagreement at Work',
        context: 'Calibrating a project approach with a colleague.',
        characters: [
            { name: 'Colleague A', description: 'Direct.' },
            { name: 'Colleague B', description: 'Cautious collaborator.' }
        ],
        dialogue: [
            { speaker: 'Colleague A', text: 'Alright, shall we go straight to the ________?' },
            { speaker: 'Colleague B', text: 'From my ________, I think we should keep the plan fairly simple.' },
            { speaker: 'Colleague A', text: 'I see your ________, but I’m not completely convinced.' },
            { speaker: 'Colleague B', text: 'To be ________, I think the current plan might be too cautious.' },
            { speaker: 'Colleague A', text: 'I can understand that, and that makes ________ in some ways.' },
            { speaker: 'Colleague A', text: 'Possibly, but I’m not sure I ________ with that entirely.' },
            { speaker: 'Colleague B', text: 'What I ________ is, if something goes wrong, it’ll be harder to fix later. Am I making ________?' },
            { speaker: 'Colleague A', text: 'Fair ________. I guess it comes down to how much uncertainty we’re comfortable with.' },
            { speaker: 'Colleague B', text: 'I hear that, but I beg to ________ slightly. Stability matters more.' },
            { speaker: 'Colleague A', text: 'The point is ________, we could test things on a smaller scale first.' },
            { speaker: 'Colleague B', text: 'Sounds like a ________. Shall we move ________ to the next item?' }
        ],
        answerVariations: [
            { index: 1, answer: 'point', alternatives: ['issue'] },
            { index: 2, answer: 'perspective', alternatives: ['view'] },
            { index: 3, answer: 'point', alternatives: ['argument'] },
            { index: 4, answer: 'honest', alternatives: ['frank'] },
            { index: 5, answer: 'sense', alternatives: ['logic'] },
            { index: 6, answer: 'agree', alternatives: ['concur'] },
            { index: 7, answer: 'mean', alternatives: ['want to say'] },
            { index: 8, answer: 'sense', alternatives: ['myself clear'] },
            { index: 9, answer: 'enough', alternatives: ['point taken'] },
            { index: 10, answer: 'differ', alternatives: ['disagree'] },
            { index: 11, answer: 'this', alternatives: [] },
            { index: 12, answer: 'plan', alternatives: ['good plan'] },
            { index: 13, answer: 'on', alternatives: ['forward'] }
        ],
        deepDive: [
            { index: 1, phrase: 'straight to the point', insight: 'Professional request for efficiency.' },
            { index: 10, phrase: 'beg to differ', insight: 'The classic, ultra-polite way to express a strong disagreement.' }
        ]
    },
    {
        id: 'workplace-4-asking-help',
        category: 'Workplace',
        topic: 'Asking for Help (Without Weakness)',
        context: 'Enlisting a colleague’s expertise for a second opinion.',
        characters: [
            { name: 'Colleague', description: 'Expert.' },
            { name: 'You', description: 'Confident but careful user.' }
        ],
        dialogue: [
            { speaker: 'You', text: 'Hi, how’s it ________? Have you got a minute?' },
            { speaker: 'You', text: 'Well, to be ________, I was hoping you could help me with something.' },
            { speaker: 'You', text: 'Could you do me a ________ and take a quick look at this? I just want a second opinion.' },
            { speaker: 'Colleague', text: 'Yeah, of course. Go ________.' },
            { speaker: 'You', text: 'From my ________, it looks fine, but I’m not completely sure.' },
            { speaker: 'You', text: 'I see your ________, but do you think this part is clear enough?' },
            { speaker: 'You', text: 'Right. That makes ________. I was worried it might be a bit confusing.' },
            { speaker: 'You', text: 'To be honest, I didn’t want to bother you, but I didn’t want to get it wrong either.' },
            { speaker: 'You', text: 'I really appreciate your ________. Don’t ________, happy to help.' },
            { speaker: 'You', text: 'Do you mind if I ________ one small change? I’ll ________ it here.' },
            { speaker: 'You', text: 'Let’s keep in ________. Take ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'going', alternatives: ['moving'] },
            { index: 2, answer: 'honest', alternatives: ['frank'] },
            { index: 3, answer: 'favour', alternatives: ['hand'] },
            { index: 4, answer: 'ahead', alternatives: ['on then'] },
            { index: 5, answer: 'perspective', alternatives: ['view'] },
            { index: 6, answer: 'point', alternatives: ['idea'] },
            { index: 7, answer: 'sense', alternatives: ['logic'] },
            { index: 8, answer: 'help', alternatives: ['time'] },
            { index: 9, answer: 'mention it', alternatives: ['worry'] },
            { index: 10, answer: 'make', alternatives: ['change'] },
            { index: 11, answer: 'leave', alternatives: ['finish'] },
            { index: 12, answer: 'touch', alternatives: ['contact'] },
            { index: 13, answer: 'care', alternatives: ['it easy'] }
        ],
        deepDive: [
            { index: 3, phrase: 'do me a favour', insight: 'Actually makes the other person feel valued, rather than bothered.' },
            { index: 11, phrase: 'leave it here', insight: 'Excellent phrase for ending a collaboration session cleanly.' }
        ]
    },
    {
        id: 'social-4-daily-routines',
        category: 'Social',
        topic: 'Daily Life & Routines',
        context: 'Discussing work-life balance and weekend habits.',
        characters: [
            { name: 'Jack', description: 'Curious flatmate.' },
            { name: 'You', description: 'Balanced professional.' }
        ],
        dialogue: [
            { speaker: 'Jack', text: 'So, what do you usually do after work?' },
            { speaker: 'You', text: 'I usually ________ home, have a quick ________, and then ________ for a while.' },
            { speaker: 'Jack', text: 'Sounds relaxed. Do you go out during the week?' },
            { speaker: 'You', text: 'Not very often. I mostly stay ________, but sometimes I ________ friends.' },
            { speaker: 'Jack', text: 'And what about weekends?' },
            { speaker: 'You', text: 'On weekends, I try to ________ up early, ________ some exercise, and ________ myself.' },
            { speaker: 'Jack', text: 'Do you prefer living with others or living ________?' },
            { speaker: 'You', text: 'It’s more ________, and I can be more ________ with my time.' }
        ],
        answerVariations: [
            { index: 1, answer: 'head', alternatives: ['go', 'get', 'walk'] },
            { index: 2, answer: 'bite', alternatives: ['rest', 'break'] },
            { index: 3, answer: 'unwind', alternatives: ['relax', 'switch off'] },
            { index: 4, answer: 'in', alternatives: ['home', 'indoors'] },
            { index: 5, answer: 'catch up with', alternatives: ['see', 'meet'] },
            { index: 6, answer: 'get', alternatives: ['wake', 'be'] },
            { index: 7, answer: 'do', alternatives: ['get', 'fit in'] },
            { index: 8, answer: 'enjoy', alternatives: ['take it easy', 'slow down'] },
            { index: 9, answer: 'alone', alternatives: ['on my own', 'by myself'] },
            { index: 10, answer: 'peaceful', alternatives: ['relaxed', 'quiet'] },
            { index: 11, answer: 'flexible', alternatives: ['independent', 'free'] }
        ],
        deepDive: [
            { index: 3, phrase: 'unwind', insight: 'More advanced than "relax". Very common in native UK English.' },
            { index: 9, phrase: 'on my own', insight: 'Very natural UK alternative to "alone".' }
        ]
    },
    {
        id: 'advanced-4-honesty-tact',
        category: 'Advanced',
        topic: 'Honest Opinion (Tactful)',
        context: 'Providing direct feedback without breaking the relationship.',
        characters: [
            { name: 'Colleague', description: 'Seeking validation.' },
            { name: 'You', description: 'Tactful supervisor.' }
        ],
        dialogue: [
            { speaker: 'Colleague', text: 'From my perspective, the idea has potential. What do you think?' },
            { speaker: 'You', text: 'Well, to be ________, I think the concept is interesting.' },
            { speaker: 'You', text: 'I see your ________, but from my ________, there are significant risks.' },
            { speaker: 'You', text: 'The point is ________, we don’t have to ignore the risk to keep moving.' },
            { speaker: 'You', text: 'On the other ________, if we address this now, the results will be much ________.' },
            { speaker: 'You', text: 'I appreciate you being ________ to this discussion.' }
        ],
        answerVariations: [
            { index: 1, answer: 'honest', alternatives: ['frank', 'straight'] },
            { index: 2, answer: 'point', alternatives: ['argument', 'view'] },
            { index: 3, answer: 'perspective', alternatives: ['side', 'point of view'] },
            { index: 4, answer: 'this', alternatives: [] },
            { index: 5, answer: 'hand', alternatives: ['side'] },
            { index: 6, answer: 'stronger', alternatives: ['clearer', 'better'] },
            { index: 7, answer: 'open', alternatives: ['receptive', 'flexible'] }
        ],
        deepDive: [
            { index: 1, phrase: 'To be honest', insight: 'The classic "softener" for an opposing opinion.' },
            { index: 5, phrase: 'on the other hand', insight: 'Perfect transition for showing the positive side of a critique.' }
        ]
    },
    {
        id: 'social-5-running-into',
        category: 'Social',
        topic: 'Running into Someone',
        context: 'A street encounter with surprise and quick catch-up.',
        characters: [
            { name: 'Person A', description: 'Surprised.' },
            { name: 'You', description: 'Happy to chat.' }
        ],
        dialogue: [
            { speaker: 'Person A', text: 'Oh wow, hi! I didn’t expect to see you here. How’s it ________?' },
            { speaker: 'You', text: 'Yeah, what are the chances? Not too bad, actually. You?' },
            { speaker: 'Person A', text: 'Great. It’s a ________ to run into you. What have you been ________ to lately?' },
            { speaker: 'You', text: 'A bit of this and that. I’m in a bit of a ________, but we should catch up properly.' },
            { speaker: 'You', text: 'Anyway, I won’t ________ the point. Let’s keep in ________.' },
            { speaker: 'You', text: 'Take ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'going', alternatives: ['moving'] },
            { index: 2, answer: 'pleasure', alternatives: ['surprise'] },
            { index: 3, answer: 'up', alternatives: ['doing'] },
            { index: 4, 区间: ['hurry', 'rush'] },
            { index: 5, answer: 'labour', alternatives: ['push'] },
            { index: 6, answer: 'touch', alternatives: ['contact'] },
            { index: 7, answer: 'care', alternatives: ['it easy'] }
        ],
        deepDive: [
            { index: 2, phrase: 'what are the chances', insight: 'The standard native way to comment on an unexpected encounter.' }
        ]
    },
    {
        id: 'service-5-security',
        category: 'Service/Logistics',
        topic: 'Airport Security',
        context: 'Getting through the security line smoothly.',
        characters: [
            { name: 'Security', description: 'Official.' },
            { name: 'You', description: 'Traveler.' }
        ],
        dialogue: [
            { speaker: 'Security', text: 'Good morning. Are you carrying any liquids, sharp objects, or ________ items?' },
            { speaker: 'You', text: 'No, nothing like ________.' },
            { speaker: 'Security', text: 'Did you pack your bags ________?' },
            { speaker: 'You', text: 'Yes, I packed them ________.' },
            { speaker: 'Security', text: 'Please place your electronics in a separate ________.' },
            { speaker: 'You', text: 'Sure. Here you ________.' },
            { speaker: 'Security', text: 'Alright. Go ________ the scanner, please.' },
            { speaker: 'You', text: 'Perfect. Thank you for your ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'prohibited', alternatives: ['restricted', 'dangerous'] },
            { index: 2, answer: 'that', alternatives: ['that at all'] },
            { index: 3, answer: 'yourself', alternatives: ['on your own'] },
            { index: 4, answer: 'myself', alternatives: [] },
            { index: 5, answer: 'tray', alternatives: ['bin'] },
            { index: 6, answer: 'go', alternatives: ['are'] },
            { index: 7, answer: 'through', alternatives: [] },
            { index: 8, answer: 'patience', alternatives: ['help'] }
        ],
        deepDive: [
            { index: 3, phrase: 'pack your bags yourself', insight: 'Universal requirement for air travel safety.' }
        ]
    },
    {
        id: 'workplace-5-marketing-sync',
        category: 'Workplace',
        topic: 'Marketing Sync-up',
        context: 'A quick talk about project status and blockers.',
        characters: [
            { name: 'Sam', description: 'Lead.' },
            { name: 'You', description: 'Strategist.' }
        ],
        dialogue: [
            { speaker: 'Sam', text: 'Hi there! Do you have a minute to ________? I want to make sure the campaign is ________.' },
            { speaker: 'You', text: 'Hey Sam. Yes, of course. ________, how’s it going?' },
            { speaker: 'You', text: 'From my ________, things are looking good, but we have one ________ issue.' },
            { speaker: 'You', text: 'I just wanted to ________ this concern before launch.' },
            { speaker: 'Sam', text: 'I appreciate you being ________ to the discussion. Let’s ________ this offline.' }
        ],
        answerVariations: [
            { index: 1, answer: 'touch base', alternatives: ['talk', 'chat'] },
            { index: 2, answer: 'on track', alternatives: ['moving'] },
            { index: 3, answer: 'Actually', alternatives: [] },
            { index: 4, answer: 'perspective', alternatives: ['view'] },
            { index: 5, answer: 'timing', alternatives: ['delivery'] },
            { index: 6, answer: 'flag', alternatives: ['raise'] },
            { index: 7, answer: 'open', alternatives: ['receptive'] },
            { index: 8, answer: 'take', alternatives: ['discuss'] }
        ],
        deepDive: [
            { index: 1, phrase: 'touch base', insight: 'The most common corporate idiom for a short check-in.' }
        ]
    },
    {
        id: 'social-6-career-decisions',
        category: 'Social',
        topic: 'Talk about Career Decisions',
        context: 'Sharing advice over coffee in a busy café.',
        characters: [
            { name: 'Jamie', description: 'Stressed.' },
            { name: 'You', description: 'Advisor.' }
        ],
        dialogue: [
            { speaker: 'Jamie', text: 'Sorry I’m late! Shall we ________ and grab a bite?' },
            { speaker: 'You', text: 'No worries! How’s it going? You look like you’ve had a ________ week.' },
            { speaker: 'Jamie', text: 'I have. I’m thinking about leaving my job.' },
            { speaker: 'You', text: 'Well, to be ________, I’d probably stay put for now.' },
            { speaker: 'You', text: 'I see your ________, but moving right now might be ________.' },
            { speaker: 'You', text: 'You can always play it by ________ and see how things go.' }
        ],
        answerVariations: [
            { index: 1, answer: 'sit down', alternatives: ['grab a table'] },
            { index: 2, answer: 'long', alternatives: ['tough', 'hectic'] },
            { index: 3, answer: 'honest', alternatives: ['frank'] },
            { index: 4, answer: 'point', alternatives: ['logic'] },
            { index: 5, answer: 'risky', alternatives: ['tough'] },
            { index: 6, answer: 'ear', alternatives: ['whim'] }
        ],
        deepDive: [
            { index: 2, phrase: 'long week', insight: 'The understated native way to say a week was exhausting.' }
        ]
    },
    {
        id: 'social-7-house-rules',
        category: 'Social',
        topic: 'London Shared House Rules',
        context: 'A friendly talk about chores and boundaries.',
        characters: [
            { name: 'Alex', description: 'Flatmate.' },
            { name: 'You', description: 'Newcomer.' }
        ],
        dialogue: [
            { speaker: 'Alex', text: 'Welcome back. What have you been ________?' },
            { speaker: 'You', text: 'Not too much. ________, I was wondering about the kitchen rules.' },
            { speaker: 'Alex', text: 'Oh, it’s pretty ________. We just try to keep things ________.' },
            { speaker: 'You', text: 'That makes ________. I’m not ________ at all, I’m pretty easy-going.' },
            { speaker: 'You', text: 'By the way, what’s the protocol for ________ trash?' }
        ],
        answerVariations: [
            { index: 1, answer: 'up to', alternatives: ['doing'] },
            { index: 2, answer: 'Actually', alternatives: ['To be honest'] },
            { index: 3, answer: 'relaxed', alternatives: ['flexible'] },
            { index: 4, answer: 'tidy', alternatives: ['clean'] },
            { index: 5, answer: 'sense', alternatives: ['logic'] },
            { index: 6, answer: 'fussy', alternatives: ['picky'] },
            { index: 7, answer: 'taking out', alternatives: [] }
        ],
        deepDive: [
            { index: 6, phrase: 'fussy', insight: 'Common UK word for being hard to please.' }
        ]
    }
];
