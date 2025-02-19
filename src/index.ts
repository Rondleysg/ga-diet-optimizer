import { runGeneticAlgorithm } from "./genetic/geneticAlgorithm";

const targetProtein = 150;
const targetCarbs = 200;
const allergies: string[] = ["LEITE"];
const penalizedFoods: string[] = ["SOJA"];

const bestDiet = runGeneticAlgorithm(targetProtein, targetCarbs, allergies, penalizedFoods, 1000, 10);
console.log("Melhor dieta encontrada:", bestDiet);


/*

*/