import { Food } from "./Food";

export interface Diet {
  foods: Food[];
  carbs: number;
  protein: number;
  score: number;
}
