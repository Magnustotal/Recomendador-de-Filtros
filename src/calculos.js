// src/calculos.js

// Función auxiliar para calcular el volumen (ejemplo de sub-función)
function calcularVolumen(length, width, height) {
    return length * width * height / 1000;
}

export function calcular(formData, filtrosData) { // Recibe los datos del formulario Y los datos de los filtros.
    let volumen;
    if (formData.volume) {
        volumen = formData.volume;
    } else {
        volumen = calcularVolumen(formData.length, formData.width, formData.height);
    }

    const tankInfo = {
        volumen: volumen,
        caudalRecomendado: volumen * 5, //  5 veces el volumen por hora.
    };

    const filtros = {
        recomendados: [],
        adecuados: [],
        noAdecuados: [],
    };

    const stats = {
        totalFilters: filtrosData.length,
        recommendedFilters: 0,
        suitableFilters: 0,
        unsuitableFilters: 0,
    };

    const specialMessages = [];


    filtrosData.forEach(filtro => {

        const caudalFiltro = filtro["Caudal (l/h)"];
        const volumenFiltro = filtro["Volúmen vaso del filtro (l)"];

        // Calcula la relación caudal/volumen y volumenFiltrante/volumenAcuario
        const relacionCaudalVolumen = caudalFiltro / volumen;

        // Determina la categoría del filtro
        if (relacionCaudalVolumen >= 5 && relacionCaudalVolumen <= 10 ) {
            filtros.recomendados.push(filtro);
            stats.recommendedFilters++;
        } else if (relacionCaudalVolumen > 3 || relacionCaudalVolumen < 10) {
            filtros.adecuados.push(filtro);
            stats.suitableFilters++;
        } else {
            filtros.noAdecuados.push(filtro);
            stats.unsuitableFilters++;
        }
    });
    if (stats.recommendedFilters === 0) {
        specialMessages.push("No se encontraron filtros altamente recomendados. Se muestran los filtros adecuados.");
    }
      return { filtros, stats, tankInfo, mensajesEspeciales: specialMessages }; // Retorna un objeto con todo
}