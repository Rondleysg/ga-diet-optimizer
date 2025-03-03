import { performance } from "perf_hooks";
import { runGeneticAlgorithm } from "../genetic/geneticAlgorithm";

export function runExperiments(
  targetProtein: number,
  targetCarbs: number,
  bannedFoods: string[],
  penalizedFoods: string[],
  populationSizes: number[],
  generationsList: number[],
  dietSizes: number[],
  mutationRates: number[],
  repetitions: number = 20
) {
  const results: any[] = [];

  for (const populationSize of populationSizes) {
    for (const generations of generationsList) {
      for (const dietSize of dietSizes) {
        for (const mutationRate of mutationRates) {
          let scores: number[] = [];
          let executionTimes: number[] = [];

          console.log(
            `Testing: Population = ${populationSize}, Generations = ${generations}, DietSize = ${dietSize}, Tm = ${mutationRate}`
          );

          for (let i = 0; i < repetitions; i++) {
            const start = performance.now();
            const result = runGeneticAlgorithm(
              targetProtein,
              targetCarbs,
              bannedFoods,
              penalizedFoods,
              generations,
              populationSize,
              mutationRate,
              dietSize
            );
            const end = performance.now();

            scores.push(result.bestDiet.score);
            executionTimes.push(end - start);
          }

          const average = scores.reduce((a, b) => a + b, 0) / scores.length;
          const best = Math.min(...scores);
          const worse = Math.max(...scores);
          const standardDeviation = Math.sqrt(
            scores.map(x => Math.pow(x - average, 2)).reduce((a, b) => a + b, 0) / scores.length
          );
          const averageTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;

          results.push({
            population: populationSize,
            generations: generations,
            diet: dietSize,
            mutationRate: mutationRate,
            averageTime: `${averageTime.toFixed(2)}ms`,
            average: average.toFixed(2),
            best: best.toFixed(2),
            worse: worse.toFixed(2),
            standardDeviation: standardDeviation.toFixed(2),
          });
        }
      }
    }
  }

  console.table(results);
  return results;
}

runExperiments(150, 200, ["LEITE"], ["SOJA"], [150, 300, 400], [150, 300, 400], [10], [0.3, 0.5, 0.8]);