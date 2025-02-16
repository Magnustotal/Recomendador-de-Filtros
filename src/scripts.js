// src/script.js

import { setupEventListeners } from './interfaz.js';
// import { loadInitialData } from './datos.js'; // Descomentar si se implementa la carga inicial

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
            {
                message: "🧽 Limpieza regular: Limpia el prefiltro (si tu filtro tiene uno) con frecuencia para evitar que se obstruya y reduzca el caudal.",
                icon: "🧽",
            },
            {
                message: "🧪 Material filtrante químico: Si usas material filtrante químico (como carbón activado), reemplázalo regularmente según las instrucciones del fabricante.",
                icon: "🧪",
            },
            {
                message: "🐠 Compatibilidad: Asegúrate de que el filtro que elijas sea compatible con el tipo de peces y plantas que tienes en tu acuario.",
                icon: "🐠",
            },
            {
                message: "💡 Caudal: Un caudal demasiado alto puede estresar a los peces, mientras que un caudal demasiado bajo puede no ser suficiente para mantener el agua limpia.",
                icon: "💡",
            },
            {
                message: "🌱 Plantas: Las plantas ayudan a mantener el agua limpia y oxigenada, lo que reduce la carga sobre el filtro.",
                icon: "🌱",
            },
        ],
        currentTipIndex: 0,
        currentTip: {},
        showBanner: true,
    },
    mounted() {
        this.showRandomTip();
        // this.loadInitialData(); // Descomentar si se implementa la carga inicial
        setupEventListeners(this);
    },
    methods: {
        switchInputMode(mode) {
            this.inputMode = mode;
            this.resetForm();
        },
        async handleFormSubmit() {
          // La función handleFormSubmit ahora está vacía, ya que su logica ha sido trasladada.
        },
        switchResultTab(tab) {
            this.currentTab = tab;
        },
        switchView(view) {
            this.currentView = view;
            this.updateTableData();
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
            this.filtros = {
              recomendados: [],
              adecuados: [],
              noAdecuados: [],
            };
            this.stats = {
              totalFilters: 0,
              recommendedFilters: 0,
              suitableFilters: 0,
              unsuitableFilters: 0,
            };
            this.tankInfo = null;
            this.specialMessages = [];