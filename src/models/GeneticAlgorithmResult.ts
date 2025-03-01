import { Diet } from "./Diet";

export interface GeneticAlgorithmResult {
  bestDiet: Diet;
  fitnessOverGenerations: number[];
  diversityOverGenerations: number[];
  bubbleChartData: { x: number; y: number; r: number }[];
}
