
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
            { index: 15, answer: 'help', alternatives: ['assistance'] }
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
            { index: 13, answer: 'partial', alternatives: ['store credit', 'gift card'] },
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
            { index: 12, answer: 'concise', alternatives: ['tight', 'to the point'] }
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
            { index: 11, answer: 'this', alternatives: [] }
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
            { index: 11, answer: 'leave', alternatives: ['finish'] }
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
            { index: 8, answer: 'enjoy', alternatives: ['take it easy', 'slow down'] }
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
            { index: 6, answer: 'stronger', alternatives: ['clearer', 'better'] }
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
            { index: 4, answer: 'hurry', alternatives: ['rush'] },
            { index: 5, answer: 'labour', alternatives: ['push'] },
            { index: 6, answer: 'touch', alternatives: ['contact'] }
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
            { index: 5, answer: 'timing', alternatives: ['delivery'] }
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
            { index: 5, answer: 'sense', alternatives: ['logic'] }
        ],
        deepDive: [
            { index: 6, phrase: 'fussy', insight: 'Common UK word for being hard to please.' }
        ]
    },
    {
        id: 'social-8-old-friend',
        category: 'Social',
        topic: 'Catching Up with an Old Friend',
        context: 'Two old friends meet and reconnect.',
        characters: [
            { name: 'Sam', description: 'Relaxed.' },
            { name: 'Chris', description: 'Busy but friendly.' }
        ],
        dialogue: [
            { speaker: 'Sam', text: 'Chris! Is that you? I haven\'t seen you in ages.' },
            { speaker: 'Chris', text: 'Sam! What a surprise. How ________?' },
            { speaker: 'Sam', text: 'I\'m ________, thanks. Just taking a stroll. What have you ________?' },
            { speaker: 'Chris', text: 'Not much, just ________ with work lately. By the way, did you hear about Sarah\'s wedding?' },
            { speaker: 'Sam', text: 'No! That ________. When is it?' },
            { speaker: 'Chris', text: 'Next month. I still need to ________ if I can make it, though.' }
        ],
        answerVariations: [
            { index: 1, answer: 'is it going', alternatives: ['are you doing', 'have you been'] },
            { index: 2, answer: 'doing well', alternatives: ['not too bad', 'pretty good'] },
            { index: 3, answer: 'been up to', alternatives: ['been doing', 'been up to lately'] },
            { index: 4, answer: 'swamped', alternatives: ['busy', 'tied up'] },
            { index: 5, answer: 'sounds nice', alternatives: ['sounds good', 'sounds lovely'] },
            { index: 6, answer: 'make up my mind', alternatives: ['decide', 'figure out'] }
        ],
        deepDive: [
            { index: 1, phrase: 'is it going', insight: 'The classic warm greeting for friends.' },
            { index: 4, phrase: 'swamped', insight: 'A very natural way to describe being busy without sounding stressed.' },
            { index: 6, phrase: 'make up my mind', insight: 'Used for decisions that require some thought.' }
        ]
    },
    {
        id: 'social-9-weekend-plans',
        category: 'Social',
        topic: 'Making Weekend Plans',
        context: 'Two colleagues deciding what to do on Saturday.',
        characters: [
            { name: 'Jo', description: 'Proactive.' },
            { name: 'Alex', description: 'Flexible.' }
        ],
        dialogue: [
            { speaker: 'Jo', text: 'Hey Alex, any plans for the weekend?' },
            { speaker: 'Alex', text: 'Not yet. I was thinking of just ________.' },
            { speaker: 'Jo', text: 'Why don\'t we go for a hike? The weather is supposed to be ________.' },
            { speaker: 'Alex', text: 'That sounds ________. What time were you ________?' },
            { speaker: 'Jo', text: 'Maybe around ten?' },
            { speaker: 'Alex', text: 'Perfect. Let\'s ________ on Friday to confirm the details.' },
            { speaker: 'Jo', text: 'Great. We can always ________ if the weather changes.' }
        ],
        answerVariations: [
            { index: 1, answer: 'taking it easy', alternatives: ['relaxing', 'staying in'] },
            { index: 2, answer: 'lovely', alternatives: ['nice', 'bright', 'pleasant'] },
            { index: 3, answer: 'like a plan', alternatives: ['good', 'great'] },
            { index: 4, answer: 'thinking', alternatives: ['planning', 'aiming'] },
            { index: 5, answer: 'touch base', alternatives: ['catch up', 'check in'] },
            { index: 6, answer: 'play it by ear', alternatives: ['see how it goes', 'decide then'] }
        ],
        deepDive: [
            { index: 1, phrase: 'taking it easy', insight: 'High-value phrase for "relaxing".' },
            { index: 2, phrase: 'lovely', insight: 'British/IELTS 9 favorite for "good".' },
            { index: 5, phrase: 'touch base', insight: 'Professional but friendly way to say "let\'s talk later".' },
            { index: 6, phrase: 'play it by ear', insight: 'Idiom for being flexible.' }
        ]
    },
    {
        id: 'social-10-new-neighbor',
        category: 'Social',
        topic: 'Meeting a New Neighbor',
        context: 'Welcoming someone who just moved in next door.',
        characters: [
            { name: 'Mrs. Higgins', description: 'Welcoming.' },
            { name: 'Mark', description: 'New neighbor.' }
        ],
        dialogue: [
            { speaker: 'Mrs. Higgins', text: 'Hello there! I\'m Mrs. Higgins from next door.' },
            { speaker: 'Mark', text: 'Oh, hi! I\'m Mark. ________ you.' },
            { speaker: 'Mrs. Higgins', text: 'Welcome to the neighborhood. It\'s quite ________ here, I hope you like it.' },
            { speaker: 'Mark', text: 'Thanks. It seems ________ so far.' },
            { speaker: 'Mrs. Higgins', text: 'If you ever need a ________, just let me know.' },
            { speaker: 'Mark', text: 'That\'s very ________ of you. I appreciate it.' }
        ],
        answerVariations: [
            { index: 1, answer: 'Nice to meet', alternatives: ['Pleasure to meet', 'Good to meet'] },
            { index: 2, answer: 'peaceful', alternatives: ['quiet', 'residential', 'calm'] },
            { index: 3, answer: 'lovely', alternatives: ['nice', 'great', 'fine'] },
            { index: 4, answer: 'hand', alternatives: ['favor', 'bit of help'] },
            { index: 5, answer: 'kind', alternatives: ['thoughtful', 'nice'] }
        ],
        deepDive: [
            { index: 1, phrase: 'Nice to meet', insight: 'Standard, can\'t go wrong.' },
            { index: 2, phrase: 'peaceful', insight: 'Describes an area well—very IELTS friendly.' },
            { index: 4, phrase: 'need a hand', insight: 'Native idiom for "need help".' }
        ]
    },
    {
        id: 'workplace-6-proposal-feedback',
        category: 'Workplace',
        topic: 'Giving Feedback on a Proposal',
        context: 'Discussing a new project timeline with a colleague.',
        characters: [
            { name: 'Taylor', description: 'Lead.' },
            { name: 'Alex', description: 'Coordinator.' }
        ],
        dialogue: [
            { speaker: 'Taylor', text: 'Thanks for sending over the proposal, Alex.' },
            { speaker: 'Alex', text: 'No problem. What did you think?' },
            { speaker: 'Taylor', text: 'Overall, I see your ________. However, I have a slightly ________ view on the timeline.' },
            { speaker: 'Alex', text: 'Oh? Is it too ________?' },
            { speaker: 'Taylor', text: 'Possibly. From my ________, it might need some ________ to be realistic.' },
            { speaker: 'Alex', text: 'That\'s fair. Maybe we could ________ the rollout and see?' }
        ],
        answerVariations: [
            { index: 1, answer: 'point', alternatives: ['reasoning', 'logic'] },
            { index: 2, answer: 'different', alternatives: ['alternative', 'broader'] },
            { index: 3, answer: 'tight', alternatives: ['critical', 'sensitive'] },
            { index: 4, answer: 'perspective', alternatives: ['point of view', 'experience'] },
            { index: 5, answer: 'fine-tuning', alternatives: ['refining', 'adjustment'] },
            { index: 6, answer: 'pilot', alternatives: ['phase', 'stagger'] }
        ],
        deepDive: [
            { index: 2, phrase: 'different view', insight: 'A soft way to disagree without being negative.' },
            { index: 5, phrase: 'fine-tuning', insight: 'Implies the idea is good, but needs minor changes.' },
            { index: 6, phrase: 'pilot', insight: 'Very professional "corporate" English for "testing".' }
        ]
    },
    {
        id: 'workplace-7-ask-help',
        category: 'Workplace',
        topic: 'Asking for Help at Work',
        context: 'Needing assistance with a complex spreadsheet.',
        characters: [
            { name: 'Sarah', description: 'Busy.' },
            { name: 'Sam', description: 'Needing help.' }
        ],
        dialogue: [
            { speaker: 'Sam', text: 'Hey Sarah, do you ________ a minute?' },
            { speaker: 'Sarah', text: 'Yeah, what\'s up?' },
            { speaker: 'Sam', text: 'Well, to be ________, I\'m a bit ________ with this data.' },
            { speaker: 'Sarah', text: 'No worries. What do you need?' },
            { speaker: 'Sam', text: 'Could you do me a ________ and take a ________ look at this formula?' },
            { speaker: 'Sarah', text: 'Sure. Go ________.' },
            { speaker: 'Sam', text: 'Thanks, I really ________ your help.' }
        ],
        answerVariations: [
            { index: 1, answer: 'have got', alternatives: ['have'] },
            { index: 2, answer: 'honest', alternatives: ['frank', 'upfront'] },
            { index: 3, answer: 'swamped', alternatives: ['overwhelmed', 'busy'] },
            { index: 4, answer: 'favour', alternatives: ['hand'] },
            { index: 5, answer: 'quick', alternatives: ['brief', 'fast'] },
            { index: 6, answer: 'ahead', alternatives: ['on then'] },
            { index: 7, answer: 'appreciate', alternatives: ['value', 'thank you for'] }
        ],
        deepDive: [
            { index: 1, phrase: 'have you got', insight: 'Natural British/Common English for "do you have".' },
            { index: 3, phrase: 'swamped', insight: 'Great for admitting you\'re busy/overwhelmed professionally.' },
            { index: 4, phrase: 'do me a favour', insight: 'Actually makes the other person feel valued.' }
        ]
    },
    {
        id: 'workplace-8-handle-mistake',
        category: 'Workplace',
        topic: 'Handling a Mistake at Work',
        context: 'A report was sent with the wrong numbers.',
        characters: [
            { name: 'Manager', description: 'Calm.' },
            { name: 'Employee', description: 'Responsible.' }
        ],
        dialogue: [
            { speaker: 'Employee', text: 'I\'m sorry to ________ you, but something has ________ up.' },
            { speaker: 'Manager', text: 'What happened?' },
            { speaker: 'Employee', text: 'To be ________, I made a small mistake on the report.' },
            { speaker: 'Manager', text: 'I see. Well, let\'s ________ down and look at it properly.' },
            { speaker: 'Employee', text: 'I\'ve already ________ how to fix it. I\'ll send a revised version ________.' },
            { speaker: 'Manager', text: 'Good. Lesson ________. Let\'s make sure it doesn\'t happen again.' }
        ],
        answerVariations: [
            { index: 1, answer: 'interrupt', alternatives: ['bother', 'disturb'] },
            { index: 2, answer: 'come', alternatives: ['cropped', 'turned'] },
            { index: 3, answer: 'honest', alternatives: ['frank', 'upfront'] },
            { index: 4, answer: 'calm', alternatives: ['sit', 'settle'] },
            { index: 5, answer: 'figured out', alternatives: ['worked out', 'ironed out'] },
            { index: 6, answer: 'shortly', alternatives: ['soon', 'in a bit'] }
        ],
        deepDive: [
            { index: 2, phrase: 'something has come up', insight: 'The perfect vague phrase for a problem.' },
            { index: 5, phrase: 'figured out', insight: 'Collaborative and proactive phrasing.' },
            { index: 7, phrase: 'lesson learned', insight: 'Accepts responsibility and signals moving forward.' }
        ]
    },
    {
        id: 'service-8-restaurant-order',
        category: 'Service/Logistics',
        topic: 'Ordering at a Restaurant',
        context: 'Ordering lunch for two.',
        characters: [
            { name: 'Waiter', description: 'Professional.' },
            { name: 'Customer', description: 'Polite.' }
        ],
        dialogue: [
            { speaker: 'Waiter', text: 'Are you ready to order, or do you need a ________?' },
            { speaker: 'Customer', text: 'I think we\'re ________.' },
            { speaker: 'Waiter', text: 'Great. What can I get for you?' },
            { speaker: 'Customer', text: 'I\'ll ________ the grilled fish, please.' },
            { speaker: 'Waiter', text: 'Excellent choice. And for you?' },
            { speaker: 'Customer', text: 'Could I have the salad, but ________ the dressing?' },
            { speaker: 'Waiter', text: 'Of course. Anything else?' },
            { speaker: 'Customer', text: 'No, that\'s ________. Thanks for your ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'moment', alternatives: ['minute', 'second'] },
            { index: 2, answer: 'good', alternatives: ['set', 'ready'] },
            { index: 3, answer: 'have', alternatives: ['take', 'order'] },
            { index: 4, answer: 'without', alternatives: ['no', 'easy on'] },
            { index: 5, answer: 'everything', alternatives: ['all', 'it'] },
            { index: 6, answer: 'help', alternatives: ['assistance', 'time'] }
        ],
        deepDive: [
            { index: 1, phrase: 'need a moment', insight: 'Standard restaurant etiquette.' },
            { index: 3, phrase: 'I\'ll have the...', insight: 'The most natural way to order.' },
            { index: 5, phrase: 'that\'s everything', insight: 'Signals the end of the order clearly.' }
        ]
    },
    {
        id: 'service-9-return-faulty',
        category: 'Service/Logistics',
        topic: 'Returning a Faulty Item',
        context: 'Bringing back a toaster that doesn\'t work.',
        characters: [
            { name: 'Shop Assistant', description: 'Polite.' },
            { name: 'Customer', description: 'Firm but calm.' }
        ],
        dialogue: [
            { speaker: 'Shop Assistant', text: 'Hello. How can I assist you today?' },
            { speaker: 'Customer', text: 'Hi. I\'d like to ________ this toaster, please.' },
            { speaker: 'Shop Assistant', text: 'Of course. What seems to be the ________?' },
            { speaker: 'Customer', text: 'It\'s ________, and it doesn\'t toast ________.' },
            { speaker: 'Shop Assistant', text: 'I see. Do you have the ________?' },
            { speaker: 'Customer', text: 'Yes, here you ________. I\'d prefer a ________, if possible.' }
        ],
        answerVariations: [
            { index: 1, answer: 'return', alternatives: ['refund', 'bring back'] },
            { index: 2, answer: 'problem', alternatives: ['issue', 'trouble'] },
            { index: 3, answer: 'faulty', alternatives: ['damaged', 'broken', 'defective'] },
            { index: 4, answer: 'properly', alternatives: ['correctly', 'at all'] },
            { index: 5, answer: 'receipt', alternatives: ['proof of purchase'] },
            { index: 6, answer: 'go', alternatives: ['are'] }
        ],
        deepDive: [
            { index: 1, phrase: 'I\'d like to return', insight: 'Direct but polite opening.' },
            { index: 3, phrase: 'faulty', insight: 'The standard word for "doesn\'t work well".' },
            { index: 5, phrase: 'receipt', insight: 'Essential for returns.' }
        ]
    },
    {
        id: 'service-10-hotel-checkout',
        category: 'Service/Logistics',
        topic: 'Hotel Checkout with Issues',
        context: 'Checking out of a hotel and addressing unexpected charges.',
        characters: [
            { name: 'Receptionist', description: 'Professional.' },
            { name: 'Guest', description: 'Concerned.' }
        ],
        dialogue: [
            { speaker: 'Receptionist', text: 'Good morning. How was your ________?' },
            { speaker: 'Guest', text: 'It was lovely, thanks. But I noticed there\'s a ________ on my bill.' },
            { speaker: 'Receptionist', text: 'I see. What seems to be the issue?' },
            { speaker: 'Guest', text: 'I didn\'t ________ anything from the minibar, but I\'ve been ________.' },
            { speaker: 'Receptionist', text: 'Let me check that for you. Can I see your ________?' },
            { speaker: 'Guest', text: 'Of course. I booked a ________ room, not a ________ one.' },
            { speaker: 'Receptionist', text: 'You\'re absolutely ________. I apologize for the error. I\'ll ________ it immediately.' }
        ],
        answerVariations: [
            { index: 1, answer: 'stay', alternatives: ['visit', 'time'] },
            { index: 2, answer: 'charge', alternatives: ['fee', 'cost'] },
            { index: 3, answer: 'order', alternatives: ['take', 'use'] },
            { index: 4, answer: 'charged', alternatives: ['billed'] },
            { index: 5, answer: 'room key', alternatives: ['keycard', 'folio'] },
            { index: 6, answer: 'standard', alternatives: ['basic', 'single'] },
            { index: 7, answer: 'premium', alternatives: ['deluxe', 'suite'] }
        ],
        deepDive: [
            { index: 2, phrase: 'charge on my bill', insight: 'The polite way to question unexpected costs.' },
            { index: 8, phrase: 'you\'re absolutely right', insight: 'Acknowledgment that signals a quick resolution.' }
        ]
    },
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
            { index: 6, phrase: 'take away', insight: 'Phrasal verb: extremely common in British English, native speech marker.' },
            { index: 10, phrase: 'there you go', insight: 'Fixed phrase from LOCKED CHUNKS - used constantly by natives.' },
            { index: 18, phrase: 'sorry to bother you', insight: 'Polite interruption phrase - shows deference, very natural.' },
            { index: 26, phrase: 'I really appreciate it', insight: 'Universal chunk - expresses gratitude in mature, professional way.' }
        ]
    },
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
            { index: 16, answer: 'help', alternatives: ['assistance'] }
        ],
        deepDive: [
            { index: 1, phrase: 'How can I help you?', insight: 'LOCKED CHUNK - standard opening for service interactions.' },
            { index: 2, phrase: 'reservation/booking', insight: 'Both common; "booking" slightly more modern.' },
            { index: 5, phrase: 'here you go', insight: 'LOCKED CHUNK - universal for handing items.' }
        ]
    },
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
            { index: 17, answer: 'all', alternatives: ['everything'] }
        ],
        deepDive: [
            { index: 2, phrase: 'I\'d like to return', insight: 'Direct but polite LOCKED CHUNK for formal requests.' },
            { index: 4, phrase: 'faulty', insight: 'Standard UK English for "not working properly".' },
            { index: 9, phrase: 'here you go', insight: 'LOCKED CHUNK - universal handing-over phrase.' }
        ]
    },
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
,

    {
        id: 'advanced-5',
        category: 'Advanced',
        topic: 'Negotiating Business Partnership Terms',
        context: 'Two entrepreneurs discussing equity split and governance for a joint venture.',
        characters: [
            { name: 'Alex', description: 'Experienced entrepreneur' },
            { name: 'Jordan', description: 'Entrepreneur with distribution network' },
            { name: 'You', description: 'You' }
        ],
        dialogue: [
            { speaker: 'Alex', text: 'I ________ your interest in partnering with us.' },
            { speaker: 'Jordan', text: 'Your market positioning is ________, but we need to ________ equity split.' },
            { speaker: 'Alex', text: 'We were ________ a 60-40 arrangement.' },
            { speaker: 'Jordan', text: 'That seems somewhat ________ given our distribution reach.' },
            { speaker: 'Alex', text: 'I ________ your point. What if we structured it with ________-based adjustments?' },
            { speaker: 'Jordan', text: 'Now we\'re ________. That introduces ________ and rewards for results.' },
            { speaker: 'Alex', text: 'Exactly. We should ________ operational control too.' },
            { speaker: 'Jordan', text: 'Essential. We\'ll need ________ access to financial records.' },
            { speaker: 'Alex', text: 'Understood. Shall we ________ a follow-up with legal teams?' },
            { speaker: 'Jordan', text: 'Perfect. I\'ll have counsel draft an MOU by ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'appreciate', alternatives: ['value'] },
            { index: 2, answer: 'impeccable', alternatives: ['excellent'] },
            { index: 3, answer: 'discuss', alternatives: ['clarify'] },
            { index: 4, answer: 'thinking', alternatives: ['proposing'] },
            { index: 5, answer: 'lopsided', alternatives: ['unbalanced'] },
            { index: 6, answer: 'see', alternatives: ['understand'] },
            { index: 7, answer: 'performance', alternatives: ['merit'] },
            { index: 8, answer: 'talking', alternatives: ['on the same page'] },
            { index: 9, answer: 'clarify', alternatives: ['define'] },
            { index: 10, answer: 'transparent', alternatives: ['open'] }
        ],
        deepDive: [
            { index: 1, phrase: 'appreciate', insight: 'Formal opening showing respect in negotiations.' },
            { index: 2, phrase: 'impeccable', insight: 'Premium adjective for business reputation.' },
            { index: 5, phrase: 'lopsided', insight: 'Diplomatic way to say unfair or unbalanced.' }
        ]
    },
    {
        id: 'workplace-32',
        category: 'Workplace',
        topic: 'Performance Review and Career Advancement',
        context: 'Manager and employee discussing promotion and development opportunity.',
        characters: [
            { name: 'Manager', description: 'Senior manager' },
            { name: 'Sam', description: 'High-performing employee' },
            { name: 'You', description: 'You' }
        ],
        dialogue: [
            { speaker: 'Manager', text: 'Sam, your performance has been ________. I want to discuss your career.' },
            { speaker: 'Sam', text: 'Thank you. I\'ve been ________ to explore growth opportunities.' },
            { speaker: 'Manager', text: 'We\'re considering ________ you to senior analyst.' },
            { speaker: 'Sam', text: 'That\'s exciting. What would the role ________?' },
            { speaker: 'Manager', text: 'You\'d ________ a team and report to the department head.' },
            { speaker: 'Sam', text: 'What about ________ development and certifications?' },
            { speaker: 'Manager', text: 'Absolutely. We allocate ________ for continuous learning.' },
            { speaker: 'Sam', text: 'And ________ terms, what range do you envision?' },
            { speaker: 'Manager', text: 'A 25% increase plus ________ bonuses.' },
            { speaker: 'Sam', text: 'That\'s ________. When would this start?' },
            { speaker: 'Manager', text: 'Next month, pending your ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'exceptional', alternatives: ['outstanding'] },
            { index: 2, answer: 'keen', alternatives: ['eager'] },
            { index: 3, answer: 'promoting', alternatives: ['advancing'] },
            { index: 4, answer: 'entail', alternatives: ['involve'] },
            { index: 5, answer: 'oversee', alternatives: ['manage'] },
            { index: 6, answer: 'professional', alternatives: ['career'] },
            { index: 7, answer: 'funds', alternatives: ['budget', 'money'] },
            { index: 8, answer: 'salary', alternatives: ['compensation'] },
            { index: 9, answer: 'performance', alternatives: ['merit'] },
            { index: 10, answer: 'generous', alternatives: ['competitive'] },
            { index: 11, answer: 'acceptance', alternatives: ['approval'] }
        ],
        deepDive: [
            { index: 1, phrase: 'exceptional', insight: 'Standard praise showing genuine impression.' },
            { index: 3, phrase: 'promoting', insight: 'Professional term for career advancement.' }
        ]
    },
    {
        id: 'advanced-6',
        category: 'Advanced',
        topic: 'Debating Environmental Sustainability',
        context: 'Leadership team discussing climate targets and feasibility.',
        characters: [
            { name: 'Lisa', description: 'Sustainability director' },
            { name: 'Martin', description: 'Finance director' },
            { name: 'CEO', description: 'Chief executive' },
            { name: 'You', description: 'You' }
        ],
        dialogue: [
            { speaker: 'Lisa', text: 'Our sustainability targets are ________. We need carbon neutrality by 2030.' },
            { speaker: 'Martin', text: 'I ________ the sentiment, but that\'s ________ given our constraints.' },
            { speaker: 'Lisa', text: 'Or simply ________? Competitors are already ________ this.' },
            { speaker: 'Martin', text: 'They can ________ it. Our margins are ________.' },
            { speaker: 'Lisa', text: 'That\'s a false ________. Early investment yields long-term ________.' },
            { speaker: 'Martin', text: 'Perhaps, but ________ costs are substantial.' },
            { speaker: 'CEO', text: 'Lisa, prepare a ________. Martin, document your ________.' },
            { speaker: 'Lisa', text: 'I\'ll include ________ from successful transitions.' },
            { speaker: 'Martin', text: 'I\'ll provide ________ on our capabilities.' },
            { speaker: 'CEO', text: 'Excellent. Let\'s ________ in two weeks.' }
        ],
        answerVariations: [
            { index: 1, answer: 'insufficient', alternatives: ['inadequate'] },
            { index: 2, answer: 'appreciate', alternatives: ['understand'] },
            { index: 3, answer: 'unrealistic', alternatives: ['unfeasible'] },
            { index: 4, answer: 'unambitious', alternatives: ['timid'] },
            { index: 5, answer: 'making', alternatives: ['embracing'] },
            { index: 6, answer: 'afford', alternatives: ['sustain'] },
            { index: 7, answer: 'tighter', alternatives: ['lower'] },
            { index: 8, answer: 'dichotomy', alternatives: ['false choice'] },
            { index: 9, answer: 'benefits', alternatives: ['returns'] },
            { index: 10, answer: 'transition', alternatives: ['implementation'] }
        ],
        deepDive: [
            { index: 1, phrase: 'insufficient', insight: 'Formal business critique showing gaps.' },
            { index: 8, phrase: 'dichotomy', insight: 'Advanced debate term for false choice.' }
        ]
    },
    {
        id: 'advanced-virtual-meetings',
        category: 'Advanced',
        topic: 'Adjusting to Virtual Meeting Culture',
        context: 'Colleagues discussing challenges of remote work and video conferencing etiquette',
        characters: [
            { name: 'Alex', description: 'Colleague reflecting on remote work challenges' },
            { name: 'Sam', description: 'Colleague sharing perspective on video call fatigue' }
        ],
        dialogue: [
            { speaker: 'Alex', text: 'I\'ve been reflecting on how differently we communicate now compared to before the pandemic. Video calls have definitely ________ the way we interact professionally.' },
            { speaker: 'Sam', text: 'Absolutely. I find that people are more ________ to speak up on video than they were in person, which can be both positive and challenging.' },
            { speaker: 'Alex', text: 'That\'s a fair ________. I\'ve noticed we ________ less informal chat before meetings start. We just log in and get straight to business.' },
            { speaker: 'Sam', text: 'Exactly. There\'s a loss of ________. Those water cooler moments where you\'d catch up on personal matters are ________.' },
            { speaker: 'Alex', text: 'Do you think we should ________ schedule some casual virtual coffee meetings?' },
            { speaker: 'Sam', text: 'That\'s a ________ idea, but people seem ________ by "Zoom fatigue." We need to ________ the number of meetings overall.' },
            { speaker: 'Alex', text: 'I ________ your perspective. Perhaps we could establish clearer norms - like video-off Fridays or meeting-free afternoons?' },
            { speaker: 'Sam', text: 'That would be ________. It would give people space to concentrate on deep work.' }
        ],
        answerVariations: [
            { index: 1, answer: 'transformed', alternatives: ['changed', 'altered', 'reshaped'] },
            { index: 2, answer: 'reluctant', alternatives: ['hesitant', 'unwilling', 'resistant'] },
            { index: 3, answer: 'point', alternatives: ['observation', 'perspective', 'view'] },
            { index: 4, answer: 'encounter', alternatives: ['experience', 'have', 'see'] },
            { index: 5, answer: 'rapport', alternatives: ['connection', 'relationship', 'bond'] },
            { index: 6, answer: 'diminished', alternatives: ['reduced', 'weakened', 'lessened'] },
            { index: 7, answer: 'intentionally', alternatives: ['deliberately', 'on purpose', 'purposefully'] },
            { index: 8, answer: 'valid', alternatives: ['good', 'sound', 'reasonable'] }
        ],
        deepDive: [
            { index: 1, phrase: 'transformed', insight: 'C1 verb: metaphorical transformation. Better than "changed" in formal discourse.' },
            { index: 2, phrase: 'reluctant', insight: 'Adjective collocation: "reluctant to" + infinitive. Shows hesitation with reluctance.' },
            { index: 3, phrase: 'point', insight: 'Casual but effective: "That\'s a good point" is universal in academic discussion.' },
            { index: 4, phrase: 'encounter', insight: 'Formal verb: "encounter" more sophisticated than "have" or "see".' },
            { index: 5, phrase: 'rapport', insight: 'French origin noun meaning interpersonal connection. Key in social/professional contexts.' },
            { index: 6, phrase: 'diminished', insight: 'Past participle as adjective. Suggests gradual or natural decline.' },
            { index: 7, phrase: 'intentionally', insight: 'Adverb from intent. Emphasizes deliberate action, not accident.' },
            { index: 8, phrase: 'valid', insight: 'C1 adjective: grants legitimacy to an idea more forcefully than "good".' }
        ]
    },
    {
        id: 'advanced-ai-displacement',
        category: 'Advanced',
        topic: 'Debating AI and Job Displacement',
        context: 'Two professionals discussing impact of artificial intelligence on employment and careers',
        characters: [
            { name: 'Jordan', description: 'Professional concerned about AI impact on employment' },
            { name: 'Casey', description: 'Optimistic professional advocating for upskilling' }
        ],
        dialogue: [
            { speaker: 'Jordan', text: 'The rapid advancement of AI has been creating considerable ________ in the workplace. Many worry their jobs will become ________.' },
            { speaker: 'Casey', text: 'I understand the concern, but historically, technological innovation has ________ rather than eliminated employment opportunities.' },
            { speaker: 'Jordan', text: 'That may be true historically, but the pace is ________ now. We don\'t have time to ________ and reskill.' },
            { speaker: 'Casey', text: 'True, but I think we\'re seeing ________ in how companies approach this. Some are investing in upskilling programmes.' },
            { speaker: 'Jordan', text: 'I ________ that\'s commendable, though it\'s not universal. The burden shouldn\'t fall entirely on ________.' },
            { speaker: 'Casey', text: 'Agreed. There\'s a pressing need for policy ________. Governments should establish frameworks to support transitions.' },
            { speaker: 'Jordan', text: 'And not just financially. Workers need ________ that career pivots are feasible and achievable.' },
            { speaker: 'Casey', text: 'Absolutely. The narrative around AI needs to shift from threat to ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'concern', alternatives: ['worry', 'anxiety', 'apprehension'] },
            { index: 2, answer: 'redundant', alternatives: ['obsolete', 'unnecessary', 'superfluous'] },
            { index: 3, answer: 'created', alternatives: ['generated', 'produced', 'made'] },
            { index: 4, answer: 'unprecedented', alternatives: ['unparalleled', 'extraordinary', 'remarkable'] },
            { index: 5, answer: 'adapt', alternatives: ['adjust', 'acclimate', 'evolve'] },
            { index: 6, answer: 'positive momentum', alternatives: ['progress', 'advancement', 'improvement'] },
            { index: 7, answer: 'acknowledge', alternatives: ['recognize', 'admit', 'concede'] },
            { index: 8, answer: 'opportunity', alternatives: ['chance', 'possibility', 'prospect'] }
        ],
        deepDive: [
            { index: 1, phrase: 'concern', insight: 'Noun abstract. Collocation: "express concern", "raise concern".' },
            { index: 2, phrase: 'redundant', insight: 'C1 adjective: replaced/unnecessary. Technical term borrowed from engineering.' },
            { index: 3, phrase: 'created', insight: 'Simple past with strong context: AI "created" opportunities, not just effects.' },
            { index: 4, phrase: 'unprecedented', insight: 'C1 adjective: "without precedent". Emphasizes novelty and challenge.' },
            { index: 5, phrase: 'adapt', insight: 'Key verb in IELTS Speaking Part 3: how people respond to change.' },
            { index: 6, phrase: 'positive momentum', insight: 'Collocation: abstract noun + direction indicator. Business jargon.' },
            { index: 7, phrase: 'acknowledge', insight: 'Formal verb: recognize validity even while disagreeing.' },
            { index: 8, phrase: 'opportunity', insight: 'Positive reframing: from "job loss" to "opportunity". Rhetorical strategy.' }
        ]
    },
    {
        id: 'advanced-sustainability',
        category: 'Advanced',
        topic: 'Corporate Sustainability and Profit Tensions',
        context: 'Executives discussing balancing environmental responsibility with shareholder returns',
        characters: [
            { name: 'Morgan', description: 'Executive balancing sustainability with shareholder returns' },
            { name: 'Taylor', description: 'Executive advocating for long-term ESG value' }
        ],
        dialogue: [
            { speaker: 'Morgan', text: 'Our sustainability initiatives are being ________ by investors who prioritize short-term profits.' },
            { speaker: 'Taylor', text: 'It\'s a genuine ________, though I believe the calculus is changing. ESG considerations are increasingly ________ with long-term value.' },
            { speaker: 'Morgan', text: 'Perhaps, but the evidence remains ________. We\'ve had to scale back several programmes due to budget ________.' },
            { speaker: 'Taylor', text: 'I sympathize with the constraint, but consider this: brand damage from environmental negligence is far more ________.' },
            { speaker: 'Morgan', text: 'That\'s a valid ________. We\'ve seen competitors suffer reputationally. Still, our board wants ________ that investments yield measurable returns.' },
            { speaker: 'Taylor', text: 'Have you ________ communicating the indirect benefits? Cost savings from efficiency, talent attraction, regulatory advantage?' },
            { speaker: 'Morgan', text: 'We have, but the messaging hasn\'t quite ________ through. The business case needs to be more ________.' },
            { speaker: 'Taylor', text: 'Perhaps we could partner with analysts to quantify the ROI more ________. That might help persuade the sceptics.' }
        ],
        answerVariations: [
            { index: 1, answer: 'questioned', alternatives: ['challenged', 'disputed', 'scrutinized'] },
            { index: 2, answer: 'tension', alternatives: ['conflict', 'strain', 'competition'] },
            { index: 3, answer: 'aligned', alternatives: ['connected', 'related', 'associated'] },
            { index: 4, answer: 'mixed', alternatives: ['inconclusive', 'unclear', 'ambiguous'] },
            { index: 5, answer: 'constraints', alternatives: ['limitations', 'restrictions', 'obstacles'] },
            { index: 6, answer: 'devastating', alternatives: ['catastrophic', 'terrible', 'ruinous'] },
            { index: 7, answer: 'assurance', alternatives: ['guarantee', 'proof', 'evidence'] },
            { index: 8, answer: 'comprehensively', alternatives: ['thoroughly', 'carefully', 'systematically'] }
        ],
        deepDive: [
            { index: 1, phrase: 'questioned', insight: 'Past participle: passive voice construction for neutrality.' },
            { index: 2, phrase: 'tension', insight: 'Abstract noun: intellectual conflict without personal animosity.' },
            { index: 3, phrase: 'aligned', insight: 'Business metaphor: strategy/values/interests "align" (become compatible).' },
            { index: 4, phrase: 'mixed', insight: 'Adjective for evidence: results neither clearly positive nor negative.' },
            { index: 5, phrase: 'constraints', insight: 'Business jargon: limitations imposed by external factors (budget, resources).' },
            { index: 6, phrase: 'devastating', insight: 'Hyperbolic but defensible: reputation damage costs more than remediation.' },
            { index: 7, phrase: 'assurance', insight: 'Noun from assure: commitment to certainty. Corporate language.' },
            { index: 8, phrase: 'comprehensively', insight: 'Adverb: covering all aspects thoroughly. Shows systematic thinking.' }
        ]
    },
    {
        id: 'advanced-language-learning',
        category: 'Advanced',
        topic: 'Strategies for Effective Language Acquisition',
        context: 'Language professionals discussing modern approaches to adult language learning',
        characters: [
            { name: 'Professor Chen', description: 'Language educator promoting communicative approaches' },
            { name: 'David', description: 'Student discussing modern language learning methodology' }
        ],
        dialogue: [
            { speaker: 'Professor Chen', text: 'The traditional approach to language education has been ________ for decades, yet outcomes haven\'t improved proportionally.' },
            { speaker: 'David', text: 'What specifically would you ________ to change?' },
            { speaker: 'Professor Chen', text: 'The over-emphasis on grammar rules. Students memorize paradigms but remain ________ when attempting real communication.' },
            { speaker: 'David', text: 'So you\'d advocate for more ________ speaking practice?' },
            { speaker: 'Professor Chen', text: 'Precisely. Coupled with authentic materials - podcasts, films, social media. Learners need to be ________ to genuine language as it\'s actually used.' },
            { speaker: 'David', text: 'But doesn\'t that create difficulties for beginners who lack the foundation to ________ complex input?' },
            { speaker: 'Professor Chen', text: 'A fair ________. I\'d advocate for a ________ approach - scaffolded exposure combined with targeted grammar instruction when it serves communication.' },
            { speaker: 'David', text: 'That sounds pragmatic. Have you had success ________ this methodology in formal classroom settings?' }
        ],
        answerVariations: [
            { index: 1, answer: 'unchanged', alternatives: ['the same', 'unaltered', 'constant'] },
            { index: 2, answer: 'argue', alternatives: ['suggest', 'propose', 'advocate'] },
            { index: 3, answer: 'incompetent', alternatives: ['incapable', 'unable', 'unqualified'] },
            { index: 4, answer: 'extensive', alternatives: ['significant', 'substantial', 'considerable'] },
            { index: 5, answer: 'exposed', alternatives: ['subjected', 'vulnerable', 'open'] },
            { index: 6, answer: 'process', alternatives: ['understand', 'grasp', 'comprehend'] },
            { index: 7, answer: 'observation', alternatives: ['point', 'comment', 'note'] },
            { index: 8, answer: 'implementing', alternatives: ['applying', 'using', 'employing'] }
        ],
        deepDive: [
            { index: 1, phrase: 'unchanged', insight: 'Negative prefix + past participle: remains as it was.' },
            { index: 2, phrase: 'argue', insight: 'Academic verb: "argue for/against" = present evidence-based position.' },
            { index: 3, phrase: 'incompetent', insight: 'C1+ negative judgment: lacking skill/ability. Stronger than "unable".' },
            { index: 4, phrase: 'extensive', insight: 'C1 adjective: large in scope/scale. Indicates serious engagement.' },
            { index: 5, phrase: 'exposed', insight: 'Passive construction: "be exposed to" = receive/encounter (often involuntary).' },
            { index: 6, phrase: 'process', insight: 'Verb in learning context: mentally work through information.' },
            { index: 7, phrase: 'observation', insight: 'Formal noun: result of careful attention. Grounds opinion in evidence.' },
            { index: 8, phrase: 'implementing', insight: 'Gerund: putting plan/method into action. Shows practical application.' }
        ]
    }
];
