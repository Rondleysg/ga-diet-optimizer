import { foodDatabase } from "../data/foodDatabase";
import { Diet } from "../models/Diet";
import { Food } from "../models/Food";

export function generateInitialPopulation(size: number, dietSize: number): Diet[] {
  return Array.from({ length: size }, () => {
    const foods: Food[] = [];

    while (foods.length < dietSize) {
      const randomFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
      if (!foods.find((food) => food.name === randomFood.name)) {
        foods.push(randomFood);
      }
    }

    return { foods, carbs: 0, protein: 0, score: Infinity };
  });
}

export function evaluateFitness(
  diet: Diet,
  targetProtein: number,
  targetCarbs: number,
  bannedFoods: string[],
  penalizedFoods: string[]
): number {
  let penalty = 0;
  diet.carbs = 0;
  diet.protein = 0;

  for (const food of diet.foods) {
    if (bannedFoods.includes(food.name) || food.allergic.some((allergen) => bannedFoods.includes(allergen))) {
      return Infinity;
    }
    if (
      penalizedFoods.includes(food.name) ||
      food.allergic.some((allergen) => penalizedFoods.includes(allergen))
    ) {
      penalty += 10;
    }

    diet.protein += food.protein;
    diet.carbs += food.carbs;
  }

  const proteinDiff = Math.abs(targetProtein - diet.protein);
  const carbsDiff = Math.abs(targetCarbs - diet.carbs);

  diet.score = proteinDiff + carbsDiff + penalty;

  return diet.score;
}

// Método elitista
export function selectParents(population: Diet[]): Diet[] {
  return population.sort((a, b) => a.score - b.score).slice(0, population.length / 2);
}

/* Método torneio
export function selectParents(population: Diet[], tournamentSize: number = 3): Diet[] {
  const selectedParents: Diet[] = [];

  while (selectedParents.length < population.length / 2) {
    const tournament: Diet[] = [];

    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }

    tournament.sort((a, b) => a.score - b.score);
    selectedParents.push(tournament[0]);
  }

  return selectedParents;
}
*/

export function crossover(parent1: Diet, parent2: Diet): Diet {
  const childFoods: Food[] = [];
  const usedFoodNames = new Set<string>();

  for (const food of parent1.foods) {
    if (!usedFoodNames.has(food.name)) {
      childFoods.push(food);
      usedFoodNames.add(food.name);
    }
  }

  for (const food of parent2.foods) {
    if (!usedFoodNames.has(food.name) && childFoods.length < parent1.foods.length) {
      childFoods.push(food);
      usedFoodNames.add(food.name);
    }
  }

  while (childFoods.length < parent1.foods.length) {
    const randomFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
    if (!usedFoodNames.has(randomFood.name)) {
      childFoods.push(randomFood);
      usedFoodNames.add(randomFood.name);
    }
  }

  return { foods: childFoods, carbs: 0, protein: 0, score: Infinity };
}

export function mutate(diet: Diet, mutationRate: number): Diet {
  if (Math.random() < mutationRate) {
    const currentFoodNames = new Set(diet.foods.map((f) => f.name));
    let newFood;

    do {
      newFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
    } while (currentFoodNames.has(newFood.name));

    const index = Math.floor(Math.random() * diet.foods.length);
    diet.foods[index] = newFood;
  }

  return diet;
}

export function runGeneticAlgorithm(
  targetProtein: number,
  targetCarbs: number,
  bannedFoods: string[],
  penalizedFoods: string[],
  generations: number = 100,
  dietSize: number = 10
): Diet {
  let population = generateInitialPopulation(generations, dietSize);

  let bestDiet: Diet = { foods: [], carbs: 0, protein: 0, score: Infinity };

  for (let i = 0; i < generations; i++) {
    population.forEach((diet) =>
      evaluateFitness(diet, targetProtein, targetCarbs, bannedFoods, penalizedFoods)
    );

    const parents = selectParents(population);
    if (parents.length === 0) {
      console.warn("População extinta! Reiniciando...");
      population = generateInitialPopulation(generations, dietSize);
      continue;
    }

    const topDiet = parents[0];
    if (!bestDiet || topDiet.score < bestDiet.score) {
      bestDiet = topDiet;
    }

    population = [];
    for (let i = 0; i < parents.length - 1; i++) {
      const child = crossover(parents[i], parents[i + 1]);
      const mutated = mutate(child, 0.5);
      population.push(mutated);
    }
  }

  return bestDiet;
}
