import { foodDatabase } from "../data/foodDatabase";
import { Diet } from "../models/Diet";
import { Food } from "../models/Food";
import { GeneticAlgorithmResult } from "../models/GeneticAlgorithmResult";

export function generateInitialPopulation(size: number, dietSize: number): Diet[] {
  const population: Diet[] = [];
  const usedFoodCombinations = new Set<string>();

  while (population.length < size) {
    const foods: Food[] = [];
    while (foods.length < dietSize) {
      const randomFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
      if (!foods.find((food) => food.name === randomFood.name)) {
        foods.push(randomFood);
      }
    }

    const foodNames = foods
      .map((food) => food.name)
      .sort()
      .join(",");
    if (!usedFoodCombinations.has(foodNames)) {
      usedFoodCombinations.add(foodNames);
      population.push({ foods, carbs: 0, protein: 0, score: Infinity });
    }
  }

  return population;
}

export function evaluateFitness(
  diet: Diet,
  targetProtein: number,
  targetCarbs: number,
  bannedFoods: string[],
  penalizedFoods: string[]
): void {
  let penalty = 0;
  diet.carbs = 0;
  diet.protein = 0;

  for (const food of diet.foods) {
    if (bannedFoods.includes(food.name) || food.allergic.some((allergen) => bannedFoods.includes(allergen))) {
      diet.score = Infinity;
      return;
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

  return;
}

export function selectParents(population: Diet[]): Diet[] {
  return population.sort((a, b) => a.score - b.score).slice(0, population.length / 2);
}

export function crossover(parent1: Diet, parent2: Diet): Diet {
  const childFoods: Food[] = [];
  const usedFoodNames = new Set<string>();

  const foodsParent1 = [...parent1.foods];
  const foodsParent2 = [...parent2.foods];

  const addUniqueFood = (food: Food) => {
    if (!usedFoodNames.has(food.name)) {
      childFoods.push(food);
      usedFoodNames.add(food.name);
    }
  };

  while (childFoods.length < parent1.foods.length) {
    const hasUniqueFoods = foodsParent1.length > 0 || foodsParent2.length > 0;

    if (hasUniqueFoods) {
      const chooseFromParent1 = Math.random() < 0.5;

      if (chooseFromParent1 && foodsParent1.length > 0) {
        const food = foodsParent1.shift()!;
        addUniqueFood(food);
      } else if (foodsParent2.length > 0) {
        const food = foodsParent2.shift()!;
        addUniqueFood(food);
      }
    } else {
      const randomFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
      addUniqueFood(randomFood);
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
  generations: number = 300,
  populationSize: number = 300,
  mutationRate: number = 0.5,
  dietSize: number = 10
): GeneticAlgorithmResult {
  let population = generateInitialPopulation(populationSize, dietSize);

  let bestDiet: Diet = { foods: [], carbs: 0, protein: 0, score: Infinity };

  // Variables for generating graphs
  const fitnessOverGenerations: number[] = [];
  const bubbleChartData: { x: number; y: number; r: number }[] = [];
  const diversityOverGenerations: number[] = [];

  for (let i = 0; i < generations; i++) {
    population.forEach((diet) =>
      evaluateFitness(diet, targetProtein, targetCarbs, bannedFoods, penalizedFoods)
    );

    const parents = selectParents(population);

    const topDiet = parents[0];
    if (!bestDiet || topDiet.score < bestDiet.score) {
      bestDiet = topDiet;
    }

    if (i === 0 || i === 5 || i === 10 || i === 15 || i === 20 || i === 30 || i === generations - 1) {
      const items = population.slice(0, 100);
      for (let j = 0; j < items.length; j++) {
        bubbleChartData.push({ x: items[j].protein, y: items[j].carbs, r: 5 });
      }
    }

    if (i % 25 === 0 || i === generations - 1) {
      fitnessOverGenerations.push(topDiet.score);

      const uniqueFoods = new Set<string>();
      population.forEach((diet) => diet.foods.forEach((food) => uniqueFoods.add(food.name)));
      diversityOverGenerations.push(uniqueFoods.size);
    }

    const newPopulation = [bestDiet];
    const newUsedFoodCombinations = new Set<string>();
    newUsedFoodCombinations.add(
      bestDiet.foods
        .map((food) => food.name)
        .sort()
        .join(",")
    );

    while (newPopulation.length < population.length) {
      const parent1 = parents[Math.floor(Math.random() * parents.length)];
      const parent2 = parents[Math.floor(Math.random() * parents.length)];
      const child = crossover(parent1, parent2);
      const mutatedChild = mutate(child, mutationRate);

      const foodNames = mutatedChild.foods
        .map((food) => food.name)
        .sort()
        .join(",");
      if (!newUsedFoodCombinations.has(foodNames)) {
        newUsedFoodCombinations.add(foodNames);
        newPopulation.push(mutatedChild);
      }
    }
    population = newPopulation;
  }

  bestDiet.foods = bestDiet.foods.sort((a, b) => a.name.localeCompare(b.name));

  return {
    bestDiet,
    fitnessOverGenerations,
    diversityOverGenerations,
    bubbleChartData,
  };
}
