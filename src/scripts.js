/**
 * @fileoverview Scripts de la interfaz de usuario para el Recomendador de Filtros.
 * @version 2.1.1
 * @lastUpdate 2025-02-14
 */

// Componente para la tarjeta de filtro
Vue.component("filter-card", {
  props: ["filtro", "categoria"],
  template: `
    <div class="filter-card" :class="categoria" @click="$emit('click')">
      <div class="filter-header">
        <h3>{{ filtro["Marca y Modelo"] }}</h3>
        <span class="status-badge">{{ statusText }}</span>
      </div>
      <div class="filter-specs">
        <div class="spec-item">
          <span class="spec-label">Caudal:</span>
          <span class="spec-value">{{ filtro["Caudal (l/h)"] }} L/h</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Volumen filtrante (teórico):</span>
          <span class="spec-value">{{ filtro["Volúmen vaso del filtro (l)"] }} L</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Consumo:</span>
          <span class="spec-value">{{ filtro["Consumo (W)"] }} W</span>
        </div>
      </div>
      <div class="filter-footer">
        <a v-if="filtro.ASIN" :href="affiliateLink" class="affiliate-button amazon" target="_blank" rel="nofollow noopener">Ver en Amazon</a>
      </div>
    </div>
  `,
  computed: {
    statusText() {
      switch (this.categoria) {
        case "recomendados":
          return "Recomendado";
        case "adecuados":
          return "Adecuado";
        case "noAdecuados":
          return "No Adecuado";
        default:
          return "";
      }
    },
    affiliateLink() {
      return (
        "https://www.amazon.es/dp/" +
        this.filtro.ASIN +
        "/?tag=TU_TAG_DE_AFILIADO-21"
      );
    },
  },
});

// Componente para el modal
Vue.component("filter-modal", {
  props: ["filtro"],
  template: `
    <div id="filterModal" class="modal" role="dialog" aria-labelledby="modalTitle" v-if="filtro">
      <div class="modal-content">
        <button @click="$emit('close')" class="close-modal" aria-label="Cerrar">&times;</button>
        <div class="filter-details">
          <h2>{{ filtro["Marca y Modelo"] }}</h2>
          <div class="filter-specs-detailed">
            <div class="spec-group">
              <h3>Especificaciones Técnicas</h3>
              <p><strong>Caudal:</strong> {{ filtro["Caudal (l/h)"] }} L/h</p>
              <p><strong>Volumen del vaso:</strong> {{ filtro["Volúmen vaso del filtro (l)"] }} L</p>
              <p><strong>Consumo:</strong> {{ filtro["Consumo (W)"] }} W</p>
              <p><strong>Cestas:</strong> {{ filtro["Cestas"] }}</p>
              <p><strong>Volumen prefiltro:</strong> 
                <span v-if="filtro['Volúmen prefiltro (l)'] > 0">{{ filtro["Volúmen prefiltro (l)"] }} L</span>
                <span v-else>Este modelo no dispone de prefiltro o no hay información al respecto.</span>
              </p>
              <p><strong>Volumen filtrante real:</strong> 
                <span v-if="filtro['Volúmen filtrante real (l)'] > 0">{{ filtro["Volúmen filtrante real (l)"] }} L</span>
                <span v-else>La marca no facilita el valor o no hay información al respecto.</span>
              </p>
            </div>
            <div class="filtration-recommendation">
              <h3>📊 Distribución Recomendada del Material Filtrante</h3>
              <div class="filtration-bars">
                <div class="filtration-bar biological" :style="{ width: biologicalPercentage + '%' }">
                  <span class="bar-label">Biológico: {{ biologicalVolume }}L ({{ biologicalPercentage }}%)</span>
                </div>
                <div class="filtration-bar mechanical" :style="{ width: mechanicalPercentage + '%' }">
                  <span class="bar-label">Mecánico: {{ mechanicalVolume }}L ({{ mechanicalPercentage }}%)</span>
                </div>
              </div>
              <div class="filtration-notes">
                <p><strong>Volumen total disponible:</strong> {{ filtro["Volúmen vaso del filtro (l)"] }}L</p>
                <p><em>Nota: Esta distribución asegura un equilibrio óptimo entre la filtración mecánica y biológica.</em></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  computed: {
    biologicalVolume() {
      return Math.round(this.filtro["Volúmen filtrante real (l)"] * 0.9);
    },
    mechanicalVolume() {
      return Math.round(this.filtro["Volúmen filtrante real (l)"] * 0.1);
    },
    biologicalPercentage() {
      return 90;
    },
    mechanicalPercentage() {
      return 10;
    },
  },
});

new Vue({
  el: "#app",
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
    tips: [
      {
        message:
          "🔄 Mantenimiento del material biológico: Cambia solo un 25% del material biológico 'viejo' por 'nuevo' durante las limpiezas del filtro. ¡Nunca lo cambies todo de golpe! Algunos materiales pierden eficacia con el tiempo al obstruirse sus poros.",
        icon: "🔄",
      },
      // ... (resto de los mensajes de `Messages.TIPS`) ...
    ],
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

      let formData = {};
      if (this.inputMode === "dimensions") {
        if (!this.length || !this.width || !this.height) {
          this.errorMessage = "Por favor, introduce todas las dimensiones.";
          return;
        }
        formData = {
          length: this.length,
          width: this.width,
          height: this.height,
        };
      } else {
        if (!this.aquariumVolume) {
          this.errorMessage = "Por favor, introduce el volumen.";
          return;
        }
        formData = { volume: this.aquariumVolume };
      }

      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbwOM0eT0znOupFJ4fegXfjcs0lf40QywHzIpaOPrPGX9ifkOINUJhg2f2crYaK_0gWm/exec",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const data = await response.json();

        if (data.success) {
          this.filtros = data.filtros;
          this.stats = data.stats;
          this.tankInfo = data.tankInfo;
          this.specialMessages = data.mensajesEspeciales;
          this.showResults = true;
          this.showBanner(); // Mostrar el banner después de mostrar los resultados
        } else {
          this.errorMessage = data.error.userMessage;
        }
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
