// utils.js
export async function fetchFilters(volume) {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwOM0eT0znOupFJ4fegXfjcs0lf40QywHzIpaOPrPGX9ifkOINUJhg2f2crYaK_0gWm/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volume: volume }),
      }
    );
    const data = await response.json();

    if (data.success) {
      //Se añade el id a cada filtro.
      const filtersWithId = data.resultados.map((filter, index) => ({
        ...filter,
        id: index + 1,
      }));
      return { data: { filters: filtersWithId } };
    } else {
      return { error: data.error };
    }
  } catch (error) {
    console.error("Error en fetchFilters:", error);
    return { error: { userMessage: "Error al obtener los filtros." } };
  }
}

export function calculateRecommendedFlow(volume) {
  let caudalRecomendado = volume * 5;

  if (volume <= 60) {
    caudalRecomendado = Math.max(caudalRecomendado, 250);
  } else if (volume <= 100) {
    caudalRecomendado = Math.max(caudalRecomendado, 400);
  } else if (volume <= 200) {
    caudalRecomendado = Math.max(caudalRecomendado, 600);
  } else if (volume <= 300) {
    caudalRecomendado = Math.max(caudalRecomendado, 1000);
  } else if (volume <= 400) {
    caudalRecomendado = Math.max(caudalRecomendado, 1500);
  }

  return caudalRecomendado;
}

export function classifyFilters(filters, recommendedFlow) {
  const filtros = {
    recomendados: [],
    adecuados: [],
    noAdecuados: [],
  };
  const stats = {
    totalFilters: filters.length,
    recommendedFilters: 0,
    suitableFilters: 0,
    unsuitableFilters: 0,
  };
  const specialMessages = [];

  for (const filtro of filters) {
    const caudal = filtro["Caudal (l/h)"];

    if (caudal >= recommendedFlow) {
      filtros.recomendados.push(filtro);
      stats.recommendedFilters++;
    } else if (caudal >= recommendedFlow * 0.6) {
      filtros.adecuados.push(filtro);
      stats.suitableFilters++;
    } else {
      filtros.noAdecuados.push(filtro);
      stats.unsuitableFilters++;
    }
  }

  if (filtros.recomendados.length === 0) {
    specialMessages.push(
      "No se han encontrado filtros recomendados. Considera un filtro de mayor caudal."
    );
  }

  return { filtros, stats, specialMessages };
}
