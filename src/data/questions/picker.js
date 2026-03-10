import { getRandomQuestion } from "./index";

/**
 * Choisit automatiquement la difficulté selon le contexte du jeu
 */
export function pickQuestion({ mode, theme, playerLevel = 1, turn = 1 } = {}) {
  let difficulty = 1;

  switch (mode) {
    // mode révision → toujours facile au début
    case "revision":
      difficulty = playerLevel;
      break;

    // duel → dépend du duel choisi
    case "duel_quick":
      difficulty = 1;
      break;

    case "duel_standard":
      difficulty = Math.random() < 0.5 ? 1 : 2;
      break;

    case "duel_challenge":
      difficulty = 3;
      break;

    // collectif → difficulté augmente avec la progression sur le plateau
    case "collectif":
      if (turn < 15) difficulty = 1;
      else if (turn < 35) difficulty = 2;
      else difficulty = 3;
      break;

    default:
      difficulty = 1;
  }

  return getRandomQuestion({ theme, difficulty });
}