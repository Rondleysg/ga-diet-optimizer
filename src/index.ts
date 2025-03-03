import { runGeneticAlgorithm } from "./genetic/geneticAlgorithm";
import Chart from "chart.js/auto";

const targetProtein = 150;
const targetCarbs = 200;
const allergies: string[] = ["LEITE"];
const penalizedFoods: string[] = ["SOJA"];
const generateCharts = true;

const algorithmsBestIndividualScores: number[] = [];

if (generateCharts) {
  for (let i = 0; i < 4; i++) {
    algorithmsBestIndividualScores.push(
      runGeneticAlgorithm(
        targetProtein,
        targetCarbs,
        allergies,
        penalizedFoods,
        150 + i * 50,
        150 + i * 50,
        0.3
      ).bestDiet.score
    );
  }
}

const { bestDiet, fitnessOverGenerations, diversityOverGenerations, bubbleChartData } = runGeneticAlgorithm(
  targetProtein,
  targetCarbs,
  allergies,
  penalizedFoods,
  400,
  400,
  0.3
);
console.log("Melhor dieta encontrada:", bestDiet);
if (generateCharts) algorithmsBestIndividualScores.push(bestDiet.score);

if (generateCharts) {
  document.addEventListener("DOMContentLoaded", () => {
    const fitnessChartElement = document.getElementById("fitnessChart") as HTMLCanvasElement;
    new Chart(fitnessChartElement, {
      type: "line",
      data: {
        labels: fitnessOverGenerations.map((_, i) => `${i * 25}`),
        datasets: [
          {
            label: "Score of the best individual of the generation",
            data: fitnessOverGenerations,
            borderColor: "rgba(75, 192, 192, 1)",
            fill: true,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Score",
            },
          },
          x: {
            title: {
              display: true,
              text: "Generation",
            },
          },
        },
      },
    });

    const fitnessChartElement2 = document.getElementById("fitnessChart2") as HTMLCanvasElement;
    new Chart(fitnessChartElement2, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: "First Generation",
            data: bubbleChartData.slice(0, 100),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
          },
          {
            label: "Generation 5",
            data: bubbleChartData.slice(100, 200),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
          {
            label: "Generation 10",
            data: bubbleChartData.slice(200, 300),
            backgroundColor: "rgba(255, 206, 86, 0.6)",
          },
          {
            label: "Generation 15",
            data: bubbleChartData.slice(300, 400),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
          {
            label: "Generation 20",
            data: bubbleChartData.slice(400, 500),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
          },
          {
            label: "Generation 30",
            data: bubbleChartData.slice(500, 600),
            backgroundColor: "rgba(255, 159, 64, 0.6)",
          },
          {
            label: `Last Generation`,
            data: bubbleChartData.slice(600, 700),
            backgroundColor: "rgba(255, 0, 0, 1)",
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Protein (g)",
            },
            ticks: {
              stepSize: 1,
            },
          },
          y: {
            title: {
              display: true,
              text: "Carbs (g)",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const data = context.raw! as { x: number; y: number; r: number };

                return `Protein (g): ${data.x}, Carbs (g): ${data.y}, ${context.dataset.label}`;
              },
            },
          },
        },
      },
    });

    const diversityChartElement = document.getElementById("diversityChart") as HTMLCanvasElement;
    new Chart(diversityChartElement, {
      type: "line",
      data: {
        labels: diversityOverGenerations.map((_, i) => `${i * 25}`),
        datasets: [
          {
            label: "Diversity (Single Foods)",
            data: diversityOverGenerations,
            borderColor: "rgba(153, 102, 255, 1)",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Foods",
            },
          },
          x: {
            title: {
              display: true,
              text: "Generation",
            },
          },
        },
      },
    });

    const algorithmsBestIndividualScoresChartElement = document.getElementById(
      "algorithmsBestIndividualScoresChart"
    ) as HTMLCanvasElement;
    new Chart(algorithmsBestIndividualScoresChartElement, {
      type: "line",
      data: {
        labels: algorithmsBestIndividualScores.map((_, i) => `${150 + i * 50 === 350 ? 400 : 150 + i * 50}`),
        datasets: [
          {
            label: "Score of the best individual of the algorithm",
            data: algorithmsBestIndividualScores,
            borderColor: "rgba(75, 192, 192, 1)",
            fill: true,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Score",
            },
          },
          x: {
            title: {
              display: true,
              text: "Generation/Population Size",
            },
          },
        },
      },
    });
  });
}
