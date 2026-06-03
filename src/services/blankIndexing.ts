import type { RoleplayScript } from './staticData';

export type AnswerIndexBase = 0 | 1;

export function getAnswerIndexBase(script: Pick<RoleplayScript, 'answerVariations'>): AnswerIndexBase {
  const firstIndex = script.answerVariations[0]?.index;
  return firstIndex === 0 ? 0 : 1;
}

export function getAnswerIndexForBlank(
  script: Pick<RoleplayScript, 'answerVariations'>,
  renderedBlankIndex: number
): number {
  return renderedBlankIndex + getAnswerIndexBase(script);
}

export function getAnswerDataForBlank(
  script: Pick<RoleplayScript, 'answerVariations'>,
  renderedBlankIndex: number
): RoleplayScript['answerVariations'][number] | undefined {
  const answerIndex = getAnswerIndexForBlank(script, renderedBlankIndex);
  return script.answerVariations.find((answer) => answer.index === answerIndex);
}

export function countDialogueBlanks(script: Pick<RoleplayScript, 'dialogue'>): number {
  return script.dialogue.reduce((count, turn) => count + (turn.text.match(/________/g) || []).length, 0);
}
