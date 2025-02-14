import { filtersData } from "./data.js";
import { filterCardComponent } from "./components.js";
import { filterModalComponent } from "./components.js";
import {
  calculateRecommendedFlow,
  classifyFilters,
  fetchFilters,
} from "./utils.js";

new Vue({
  el: "#app",
  components: {
    "filter-card": filterCardComponent,
    "filter-modal": filterModalComponent,
  },
  data: {
    version: "2.1.1",
    inputMode: "dimensions",
    length: null,
    width: null,
    height: null,
    aquariumVolume: null,
    showResults: false,
    errorMessage: null,
    filtros: {
      recomendados: [],
      adecuados: [],
      noAdecuados: [],
    },
    stats: {
      totalFilters: 0,
      recommendedFilters: 0,
      suitableFilters: 0,
      unsuitableFilters: 0,
    },
    tankInfo: null,
    specialMessages: [],
    currentTab: "recomendados",
    currentView: "grid",
    showModal: false,
    selectedFilter: null,
    tips: filtersData.tips, // Usamos los datos importados
    currentTipIndex: 0,
    currentTip: {},
  },
  mounted() {
    this.showRandomTip();
  },
  methods: {
    switchInputMode(mode) {
      this.inputMode = mode;
      this.resetForm();
    },
    async handleFormSubmit() {
      this.errorMessage = null;
      this.showResults = false;

      let volume;
      if (this.inputMode === "dimensions") {
        if (!this.length || !this.width || !this.height) {
          this.errorMessage = "Por favor, introduce todas las dimensiones.";
          return;
        }
        volume = (this.length * this.width * this.height) / 1000;
      } else {
        if (!this.aquariumVolume) {
          this.errorMessage = "Por favor, introduce el volumen.";
          return;
        }
        volume = this.aquariumVolume;
      }

      try {
        const { data, error } = await fetchFilters(volume); //Usamos nuestra función

        if (error) {
          this.errorMessage = error.userMessage;
          return;
        }
        const recommendedFlow = calculateRecommendedFlow(volume); //Desde utils.js
        const classification = classifyFilters(data.filters, recommendedFlow); //Desde utils.js

        this.filtros = classification.filtros;
        this.stats = classification.stats;
        this.tankInfo = {
          volumen: volume,
          caudalRecomendado: recommendedFlow,
        };
        this.specialMessages = classification.specialMessages;
        this.showResults = true;
        this.showBanner(); // Mostrar el banner después de mostrar los resultados
      } catch (error) {
        this.errorMessage = "Error al obtener los resultados.";
        console.error("Error:", error);
      }
    },
    switchResultTab(tab) {
      this.currentTab = tab;
    },
    switchView(view) {
      this.currentView = view;
    },
    showFilterDetails(id) {
      const filter = this.findFilterById(id);
      if (filter) {
        this.selectedFilter = filter;
        this.showModal = true;
      }
    },
    closeModal() {
      this.showModal = false;
      this.selectedFilter = null;
    },
    findFilterById(id) {
      for (const categoria in this.filtros) {
        const filtro = this.filtros[categoria].find((f) => f.id === id);
        if (filtro) {
          return filtro;
        }
      }
      return null;
    },
    resetForm() {
      this.length = null;
      this.width = null;
      this.height = null;
      this.aquariumVolume = null;
      this.showResults = false;
      this.errorMessage = null;
    },
    showBanner() {
      document.getElementById("disclaimerBanner").style.display = "block";
    },
    hideBanner() {
      document.getElementById("disclaimerBanner").style.display = "none";
    },
    showRandomTip() {
      this.currentTipIndex = Math.floor(Math.random() * this.tips.length);
      this.currentTip = this.tips[this.currentTipIndex];
    },
    showNextTip() {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
      this.currentTip = this.tips[this.currentTipIndex];
    },
  },
});
