
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
            {
                name: 'Jack',
                description: 'Friendly flatmate.',
                avatarUrl: 'file:///Users/md.rashedmamun/.gemini/antigravity/brain/4d7f0e87-7039-46d3-a59f-b4c1b97a07bd/jack_character_3d_1770270663949.png'
            },
            { name: 'You', description: 'New flatmate.' }
        ],
        dialogue: [
            { speaker: 'Jack', text: 'Hello, I’m Jack. I’m the new flatmate.' },
            { speaker: 'You', text: 'Hello, my name is Alex. Nice to ________ you.' },
            { speaker: 'Jack', text: 'Nice to meet you too. So, this is the house. It’s really ________, isn’t it?' },
            { speaker: 'You', text: 'Yes, it is. But it’s very difficult to keep ________.' },
            { speaker: 'Jack', text: 'Don’t worry. Your accent is very clear. Where are you ________?' },
            { speaker: 'You', text: 'I’m from ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'meet', alternatives: ['see', 'finally meet'] },
            { index: 2, answer: 'bright', alternatives: ['nice', 'spacious', 'comfortable'] },
            { index: 3, answer: 'clean', alternatives: ['tidy', 'organized'] },
            { index: 4, answer: 'from', alternatives: ['originally from'] }
        ],
        deepDive: [
            { index: 1, phrase: 'meet', insight: 'Standard greeting. Responses often include "too".' }
        ]
    },
    {
        id: 'social-2-background',
        category: 'Social',
        topic: 'Background Talk',
        context: 'Getting to know a new acquaintance.',
        characters: [
            { name: 'Jack', description: 'Curious friend.' },
            { name: 'You', description: 'Providing background.' }
        ],
        dialogue: [
            { speaker: 'Jack', text: 'That’s interesting. How long have you been living here?' },
            { speaker: 'You', text: 'I’ve been living here for about ________.' },
            { speaker: 'Jack', text: 'Do you like it so far?' },
            { speaker: 'You', text: 'Yes, I do. The area is quite ________, and the people are very ________.' },
            { speaker: 'Jack', text: 'That’s good to hear. By the way, what do you do for ________?' },
            { speaker: 'You', text: 'I work as a ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'six months', alternatives: ['quite a while', 'nearly a year'] },
            { index: 2, answer: 'quiet', alternatives: ['convenient', 'pleasant'] },
            { index: 3, answer: 'friendly', alternatives: ['welcoming', 'polite'] },
            { index: 4, answer: 'a living', alternatives: ['work'] }
        ],
        deepDive: [
            { index: 1, phrase: 'quite a while', insight: 'Vagueness signals native-like comfort with the language.' }
        ]
    },
    {
        id: 'service-3-hotel',
        category: 'Service/Logistics',
        topic: 'Hotel Check-In',
        context: 'Checking into a hotel.',
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
            { speaker: 'You', text: 'Yes, that’s ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'help', alternatives: ['assist'] },
            { index: 2, answer: 'reservation', alternatives: ['booking'] },
            { index: 3, answer: 'passport', alternatives: ['ID'] },
            { index: 4, answer: 'go', alternatives: ['are'] },
            { index: 5, answer: 'three', alternatives: ['two'] },
            { index: 6, answer: 'right', alternatives: ['correct'] }
        ],
        deepDive: [
            { index: 2, phrase: 'reservation', insight: 'Standard for professional bookings.' }
        ]
    },
    {
        id: 'service-5-manager-escalation',
        category: 'Advanced',
        topic: 'Manager Escalation',
        context: 'Asking to speak to a manager after a standard policy refusal.',
        characters: [
            { name: 'Assistant', description: 'Polite but following rules.' },
            { name: 'You', description: 'Calmly escalating.' },
            { name: 'Manager', description: 'Ready to solve issues.' }
        ],
        dialogue: [
            { speaker: 'Assistant', text: 'I understand your concern, but unfortunately this is our standard return policy.' },
            { speaker: 'You', text: 'I see. Thanks for explaining. Would it be possible to ________ to the manager for a moment?' },
            { speaker: 'Assistant', text: 'Of course. I’ll let them know. Please give me a ________.' },
            { speaker: 'Manager', text: 'Hello. I’m the store manager. I understand there’s an issue with a return?' },
            { speaker: 'You', text: 'Yes, thanks for coming over. I completely understand the ________, but I was hoping you might be able to ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'speak', alternatives: ['talk', 'have a word'] },
            { index: 2, answer: 'moment', alternatives: ['minute', 'second'] },
            { index: 3, answer: 'policy', alternatives: ['situation', 'process'] },
            { index: 4, answer: 'help', alternatives: ['make an exception', 'look into it'] }
        ],
        deepDive: [
            { index: 1, phrase: 'speak to the manager', insight: 'Non-aggressive way to ask for escalation.' },
            { index: 4, phrase: 'make an exception', insight: 'Polite way to ask for a deviation from standard rules.' }
        ]
    },
    {
        id: 'workplace-2-help',
        category: 'Workplace',
        topic: 'Asking for Help',
        context: 'Needing a second opinion on a task without sounding weak.',
        characters: [
            { name: 'Colleague', description: 'Competent and busy.' },
            { name: 'You', description: 'Professional needing help.' }
        ],
        dialogue: [
            { speaker: 'You', text: 'Hi, how’s it ________? Have you got a minute?' },
            { speaker: 'Colleague', text: 'Yeah, not too bad. What’s up?' },
            { speaker: 'You', text: 'Well, to be ________, I was hoping you could help me with something.' },
            { speaker: 'Colleague', text: 'Sure. What do you need?' },
            { speaker: 'You', text: 'Could you do me a ________ and take a quick look at this?' }
        ],
        answerVariations: [
            { index: 1, answer: 'going', alternatives: ['moving'] },
            { index: 2, answer: 'honest', alternatives: ['upfront', 'frank'] },
            { index: 3, answer: 'favor', alternatives: ['hand'] }
        ],
        deepDive: [
            { index: 3, phrase: 'do me a favor', insight: 'A standard workplace request that signals collaboration.' }
        ]
    },
    {
        id: 'service-6-shopping-return-full',
        category: 'Service/Logistics',
        topic: 'Returning a Faulty Item',
        context: 'Full flow of returning a toaster that doesn’t work properly.',
        characters: [
            { name: 'Shop Assistant', description: 'Polite and professional.' },
            { name: 'You', description: 'Firm but calm customer.' }
        ],
        dialogue: [
            { speaker: 'Shop Assistant', text: 'Hi there. How can I ________ you?' },
            { speaker: 'You', text: 'Hi. I’d like to ________ this toaster, please.' },
            { speaker: 'Shop Assistant', text: 'Of course. What seems to be the ________?' },
            { speaker: 'You', text: 'It’s ________, and it doesn’t work ________.' },
            { speaker: 'Shop Assistant', text: 'I see. When did you ________ it?' },
            { speaker: 'You', text: 'I bought it ________.' },
            { speaker: 'Shop Assistant', text: 'Do you have the ________?' },
            { speaker: 'You', text: 'Yes, here you ________. I’d prefer a ________, if possible.' }
        ],
        answerVariations: [
            { index: 1, answer: 'help', alternatives: ['assist'] },
            { index: 2, answer: 'return', alternatives: ['get a refund on'] },
            { index: 3, answer: 'problem', alternatives: ['issue'] },
            { index: 4, answer: 'faulty', alternatives: ['damaged'] },
            { index: 5, answer: 'properly', alternatives: ['correctly'] },
            { index: 6, answer: 'buy', alternatives: ['purchase'] },
            { index: 7, answer: 'yesterday', alternatives: ['last week'] },
            { index: 8, answer: 'receipt', alternatives: ['proof of purchase'] },
            { index: 9, answer: 'go', alternatives: ['are'] },
            { index: 10, answer: 'refund', alternatives: ['replacement'] }
        ],
        deepDive: [
            { index: 5, phrase: 'properly', insight: 'Using precision in descriptions is a native signal.' }
        ]
    },
    {
        id: 'advanced-1-manager-pushback',
        category: 'Advanced',
        topic: 'Manager Pushes Back',
        context: 'The manager is refusing the request due to tight timelines.',
        characters: [
            { name: 'Manager', description: 'Focused on deadlines.' },
            { name: 'You', description: 'Persistent but respectful.' }
        ],
        dialogue: [
            { speaker: 'Manager', text: 'I hear what you’re saying, but we’ve already discussed this, and the decision has been made.' },
            { speaker: 'You', text: 'I understand that a decision has been made. I just wanted to ________ one concern before we move forward.' },
            { speaker: 'Manager', text: 'We’re on a tight timeline. Reopening this now could slow things down.' },
            { speaker: 'You', text: 'I agree timing is ________. My concern is that moving too quickly here could create ________ issues later.' },
            { speaker: 'Manager', text: 'We can’t design for every possible risk.' },
            { speaker: 'You', text: 'Absolutely. I’m not suggesting we cover ________. I’m referring to one specific area that might ________ the rollout.' }
        ],
        answerVariations: [
            { index: 1, answer: 'flag', alternatives: ['raise', 'surface'] },
            { index: 2, answer: 'tight', alternatives: ['critical', 'sensitive'] },
            { index: 3, answer: 'downstream', alternatives: ['knock-on', 'operational'] },
            { index: 4, answer: 'everything', alternatives: ['every scenario'] },
            { index: 5, answer: 'delay', alternatives: ['disrupt', 'complicate'] }
        ],
        deepDive: [
            { index: 1, phrase: 'flag a concern', insight: 'The quiet "power word" for professional disagreement.' }
        ]
    },
    {
        id: 'workplace-3-feedback',
        category: 'Workplace',
        topic: 'Negative Feedback on Report',
        context: 'Giving critical but constructive feedback to a colleague.',
        characters: [
            { name: 'Colleague', description: 'Hard worker.' },
            { name: 'You', description: 'Reviewer aiming for clarity.' }
        ],
        dialogue: [
            { speaker: 'You', text: 'Thanks for sharing the report. Before we circulate it more widely, I wanted to walk through a few ________ points with you.' },
            { speaker: 'Colleague', text: 'Sure. What did you think?' },
            { speaker: 'You', text: 'Overall, the structure is solid, and the effort is clear. That said, there are a few areas where the report could be ________.' },
            { speaker: 'Colleague', text: 'Okay. Which parts specifically?' },
            { speaker: 'You', text: 'Starting with the executive summary, I think the key message gets a bit ________. It might help to make the main takeaway more ________ upfront.' }
        ],
        answerVariations: [
            { index: 1, answer: 'key', alternatives: ['specific'] },
            { index: 2, answer: 'stronger', alternatives: ['clearer'] },
            { index: 3, answer: 'lost', alternatives: ['diluted'] },
            { index: 4, answer: 'explicit', alternatives: ['clear'] }
        ],
        deepDive: [
            { index: 1, phrase: 'walk through', insight: 'A collaborative way to say "discuss" or "review".' }
        ]
    },
    {
        id: 'social-4-old-friend',
        category: 'Social',
        topic: 'Catching Up with an Old Friend',
        context: 'Unexpectedly running into a friend.',
        characters: [
            { name: 'Friend', description: 'Warm and friendly.' },
            { name: 'You', description: 'Communicative.' }
        ],
        dialogue: [
            { speaker: 'You', text: 'Hey, nice to see you again. Nice to ________ you.' },
            { speaker: 'Friend', text: 'Yeah, it’s good to see you too. It’s a ________. So, how’s it ________?' },
            { speaker: 'You', text: 'Not too bad, actually. Busy, but in a good way. What about you? What have you been ________ to?' }
        ],
        answerVariations: [
            { index: 1, answer: 'meet', alternatives: ['see'] },
            { index: 2, answer: 'pleasure', alternatives: ['surprise'] },
            { index: 3, answer: 'going', alternatives: ['moving'] },
            { index: 4, answer: 'up', alternatives: ['doing'] }
        ],
        deepDive: [
            { index: 2, phrase: 'It’s a pleasure', insight: 'Polite standalone response.' }
        ]
    },
    {
        id: 'social-5-weekend-plans',
        category: 'Social',
        topic: 'Making & Changing Plans',
        context: 'Friends planning a weekend meeting.',
        characters: [
            { name: 'Friend A', description: 'Planner.' },
            { name: 'Friend B', description: 'Flexible.' }
        ],
        dialogue: [
            { speaker: 'Friend A', text: 'Hey, how’s it ________? So, about the weekend, are you still free?' },
            { speaker: 'Friend B', text: 'Not too bad, thanks. You? Yeah, I should be.' },
            { speaker: 'Friend A', text: 'I was thinking we could grab a coffee. How does that ________?' },
            { speaker: 'Friend B', text: 'Sounds ________. Saturday or Sunday?' },
            { speaker: 'Friend A', text: 'Saturday works for me, but we could also play it by ________, depending on the weather.' }
        ],
        answerVariations: [
            { index: 1, answer: 'going', alternatives: ['moving'] },
            { index: 2, answer: 'sound', alternatives: ['work'] },
            { index: 3, answer: 'good', alternatives: ['great'] },
            { index: 4, answer: 'ear', alternatives: ['whim'] }
        ],
        deepDive: [
            { index: 4, phrase: 'play it by ear', insight: 'Idioma for flexibility.' }
        ]
    },
    {
        id: 'workplace-4-tension',
        category: 'Advanced',
        topic: 'Handling Mild Tension',
        context: 'Two coworkers resolving an awkward exchange from earlier.',
        characters: [
            { name: 'Colleague A', description: 'Regretful about a past interaction.' },
            { name: 'Colleague B', description: 'Open to clearing the air.' }
        ],
        dialogue: [
            { speaker: 'Colleague A', text: 'Hey, do you mind if I ________ something up? I feel like we might’ve got off on the wrong ________ earlier.' },
            { speaker: 'Colleague B', text: 'Yeah, I felt that too. It didn’t sit well with me.' },
            { speaker: 'Colleague A', text: 'I see your ________. My tone probably came across as sharper than I intended.' },
            { speaker: 'Colleague B', text: 'That makes ________. At the time, it felt a bit dismissive.' }
        ],
        answerVariations: [
            { index: 1, answer: 'bring', alternatives: ['raise'] },
            { index: 2, answer: 'foot', alternatives: ['start'] },
            { index: 3, answer: 'point', alternatives: ['view'] },
            { index: 4, answer: 'sense', alternatives: ['logic'] }
        ],
        deepDive: [
            { index: 2, phrase: 'wrong foot', insight: 'Idiom for starting a relationship badly.' }
        ]
    },
    {
        id: 'social-6-ending-conversation',
        category: 'Social',
        topic: 'Ending a Conversation Politely',
        context: 'Finishing a chat without being rude.',
        characters: [
            { name: 'Person A', description: 'In a bit of a hurry.' },
            { name: 'Person B', description: 'Understanding friend.' }
        ],
        dialogue: [
            { speaker: 'Person A', text: 'Anyway, it’s been really nice chatting. Before I forget, how’s it ________ been on your end lately?' },
            { speaker: 'Person B', text: 'Pretty good, actually. Busy, but nothing I can’t handle.' },
            { speaker: 'Person A', text: 'That’s good to hear. I hate to say this, but I’m in a bit of a ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'going', alternatives: ['moving'] },
            { index: 2, answer: 'hurry', alternatives: ['rush'] }
        ],
        deepDive: [
            { index: 2, phrase: 'in a bit of a hurry', insight: 'Signals you need to leave politely.' }
        ]
    },
    {
        id: 'workplace-5-deciding',
        category: 'Workplace',
        topic: 'Deciding Something Together',
        context: 'Collaborating on a choice.',
        characters: [
            { name: 'Sam', description: 'Low-key.' },
            { name: 'Alex', description: 'Active.' }
        ],
        dialogue: [
            { speaker: 'Sam', text: 'From my ________, we could either go out or just keep things low-key.' },
            { speaker: 'Alex', text: 'To be honest, I’m a bit tired. I’d probably rather ________ stay in.' },
            { speaker: 'Sam', text: 'Fair enough. I see your ________. It’s been a long week.' }
        ],
        answerVariations: [
            { index: 1, answer: 'perspective', alternatives: ['view'] },
            { index: 2, answer: 'just', alternatives: [] },
            { index: 3, answer: 'point', alternatives: ['side'] }
        ],
        deepDive: [
            { index: 1, phrase: 'perspective', insight: 'Introducing an opinion professionally.' }
        ]
    },
    {
        id: 'advanced-3-small-problem',
        category: 'Advanced',
        topic: 'Small Problem Escalates',
        context: 'Handling a mistake calmly.',
        characters: [
            { name: 'Lead', description: 'Observant.' },
            { name: 'Member', description: 'Responsible.' }
        ],
        dialogue: [
            { speaker: 'Lead', text: 'Before we go further, could you go straight to the ________?' },
            { speaker: 'Member', text: 'The report didn’t go out on time, and now we’re behind schedule.' },
            { speaker: 'Lead', text: 'I see your ________. Mistakes happen.' }
        ],
        answerVariations: [
            { index: 1, answer: 'point', alternatives: ['issue'] },
            { index: 2, answer: 'point', alternatives: ['reasoning'] }
        ],
        deepDive: [
            { index: 1, phrase: 'straight to the point', insight: 'Requesting directness.' }
        ]
    },
    {
        id: 'gemini-1-london',
        category: 'Social',
        topic: 'Shared House rules',
        context: 'In London kitchen.',
        characters: [
            { name: 'Alex', description: 'Flatmate.' },
            { name: 'You', description: 'Newcomer.' }
        ],
        dialogue: [
            { speaker: 'Alex', text: 'Oh, hey! I didn’t hear you come in. ________, how’s it going?' },
            { speaker: 'You', text: 'Hi Alex! ________, not too bad thanks.' },
            { speaker: 'Alex', text: 'Welcome back. What have you been ________?' }
        ],
        answerVariations: [
            { index: 1, answer: 'By the way', alternatives: [] },
            { index: 2, answer: 'Actually', alternatives: [] },
            { index: 3, answer: 'up to', alternatives: [] }
        ],
        deepDive: [
            { index: 1, phrase: 'By the way', insight: 'Connector for changing topics.' }
        ]
    },
    {
        id: 'gemini-2-wedvisa',
        category: 'Workplace',
        topic: 'Marketing Sync-up',
        context: 'Discussing project concern.',
        characters: [
            { name: 'Sam', description: 'Project Lead.' },
            { name: 'You', description: 'Marketing Strategist.' }
        ],
        dialogue: [
            { speaker: 'Sam', text: 'Hi there! Do you have a minute to ________? I want to make sure the campaign is ________.' },
            { speaker: 'You', text: 'Hey Sam. Yes, of course. ________, how’s it going?' }
        ],
        answerVariations: [
            { index: 1, answer: 'touch base', alternatives: [] },
            { index: 2, answer: 'on track', alternatives: [] },
            { index: 3, answer: 'By the way', alternatives: [] }
        ],
        deepDive: [
            { index: 1, phrase: 'touch base', insight: 'Brief talk idiom.' }
        ]
    },
    {
        id: 'gemini-3-shoreditch',
        category: 'Social',
        topic: 'Career Decisions',
        context: 'Busy café setting.',
        characters: [
            { name: 'Jamie', description: 'Stressed.' },
            { name: 'You', description: 'Listener.' }
        ],
        dialogue: [
            { speaker: 'Jamie', text: 'Sorry I’m late! Shall we ________ and grab a bite?' },
            { speaker: 'You', text: 'No worries! How’s it going? You look like you’ve had a ________ week.' }
        ],
        answerVariations: [
            { index: 1, answer: 'sit down', alternatives: [] },
            { index: 2, answer: 'long', alternatives: [] }
        ],
        deepDive: [
            { index: 2, phrase: 'long week', insight: 'Common way to say a week was hard.' }
        ]
    },
    {
        id: 'service-7-airport-variation',
        category: 'Service/Logistics',
        topic: 'Airport Security',
        context: 'Security line.',
        characters: [
            { name: 'Security', description: 'Efficient.' },
            { name: 'You', description: 'Traveler.' }
        ],
        dialogue: [
            { speaker: 'Security', text: 'Did you pack your bags ________?' },
            { speaker: 'You', text: 'Yes, I packed them ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'yourself', alternatives: [] },
            { index: 2, answer: 'myself', alternatives: [] }
        ],
        deepDive: [
            { index: 1, phrase: 'yourself', insight: 'Standard check for security.' }
        ]
    },
    {
        id: 'social-7-running-into',
        category: 'Social',
        topic: 'Running into Someone',
        context: 'Street encounter.',
        characters: [
            { name: 'Person A', description: 'Surprised.' },
            { name: 'Person B', description: 'Happy.' }
        ],
        dialogue: [
            { speaker: 'Person A', text: 'Oh wow, hi! I didn’t expect to see you here. How’s it ________?' },
            { speaker: 'Person B', text: 'Yeah, what are the chances? Not too bad, actually. You?' }
        ],
        answerVariations: [
            { index: 1, answer: 'going', alternatives: [] }
        ],
        deepDive: [
            { index: 1, phrase: 'going', insight: 'Standard greeting.' }
        ]
    },
    {
        id: 'advanced-4-honesty',
        category: 'Advanced',
        topic: 'Honest Opinion',
        context: 'Tactful feedback.',
        characters: [
            { name: 'Person A', description: 'Asking.' },
            { name: 'Person B', description: 'Informing.' }
        ],
        dialogue: [
            { speaker: 'Person A', text: 'Well, to be ________, I think the idea has potential.' },
            { speaker: 'Person B', text: 'I see your ________, but from my ________, there are risks.' }
        ],
        answerVariations: [
            { index: 1, answer: 'honest', alternatives: [] },
            { index: 2, answer: 'point', alternatives: [] },
            { index: 3, answer: 'perspective', alternatives: [] }
        ],
        deepDive: [
            { index: 1, phrase: 'To be honest', insight: 'A classic softener.' }
        ]
    },
    {
        id: 'social-8-weekend-change',
        category: 'Social',
        topic: 'Changing Plans',
        context: 'emergency change.',
        characters: [
            { name: 'Friend A', description: 'Stressed.' },
            { name: 'Friend B', description: 'Kind.' }
        ],
        dialogue: [
            { speaker: 'Friend A', text: 'I just wanted to let you know that something has ________ up.' },
            { speaker: 'Friend B', text: 'Ah, okay. That’s a bit of a shame, but fair ________.' }
        ],
        answerVariations: [
            { index: 1, answer: 'come', alternatives: [] },
            { index: 2, answer: 'enough', alternatives: [] }
        ],
        deepDive: [
            { index: 1, phrase: 'come up', insight: 'Perfect vague phrase for problems.' }
        ]
    }
];
