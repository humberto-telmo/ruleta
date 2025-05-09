// Definir los límites para los últimos 37 y 12 números
const historyLimit37 = 37;
const historyLimit12 = 12;

// Definición explícita de las calles con sus números (base + vecinos)
const streets = {
    1: [1, 2, 3, 33, 20, 21, 25, 35, 26],
    4: [4, 5, 6, 19, 21, 10, 24, 34, 27],
    7: [7, 8, 9, 29, 28, 30, 23, 31, 22],
    10: [10, 11, 12, 23, 5, 36, 30, 28, 35],
    13: [13, 14, 15, 27, 36, 20, 31, 32, 19],
    16: [16, 17, 18, 24, 33, 25, 34, 22, 29],
    19: [19, 20, 21, 15, 4, 1, 14, 2],
    22: [22, 23, 24, 9, 18, 8, 10, 5, 16],
    25: [25, 26, 27, 2, 17, 3, 0, 6, 13],
    28: [28, 29, 30, 7, 12, 18, 11, 8],
    31: [31, 32, 33, 14, 9, 0, 15, 16, 1],
    34: [34, 35, 36, 17, 6, 12, 3, 13, 11]
};

// Definición de los números base de cada calle (primeros tres números)
const baseStreetNumbers = {
    1: [1, 2, 3],
    4: [4, 5, 6],
    7: [7, 8, 9],
    10: [10, 11, 12],
    13: [13, 14, 15],
    16: [16, 17, 18],
    19: [19, 20, 21],
    22: [22, 23, 24],
    25: [25, 26, 27],
    28: [28, 29, 30],
    31: [31, 32, 33],
    34: [34, 35, 36]
};

// Colores de los números en la ruleta europea
const numberColors = {
    '0': 'green',
    '1': 'red',
    '2': 'black',
    '3': 'red',
    '4': 'black',
    '5': 'red',
    '6': 'black',
    '7': 'red',
    '8': 'black',
    '9': 'red',
    '10': 'black',
    '11': 'black',
    '12': 'red',
    '13': 'black',
    '14': 'red',
    '15': 'black',
    '16': 'red',
    '17': 'black',
    '18': 'red',
    '19': 'red',
    '20': 'black',
    '21': 'red',
    '22': 'black',
    '23': 'red',
    '24': 'black',
    '25': 'red',
    '26': 'black',
    '27': 'red',
    '28': 'black',
    '29': 'black',
    '30': 'red',
    '31': 'black',
    '32': 'red',
    '33': 'black',
    '34': 'red',
    '35': 'black',
    '36': 'red'
};

// Contadores para cada calle (últimos 37 números)
const streetCounts37 = {};
Object.keys(streets).forEach(street => streetCounts37[street] = 0);

// Contadores para cada calle (últimos 12 números)
const streetCounts12 = {};
Object.keys(streets).forEach(street => streetCounts12[street] = 0);

// Contadores para cada número (0-36)
const numberCounts = {};
for (let i = 0; i <= 36; i++) {
    numberCounts[i] = 0;
}

// Historial para números ingresados
let recentNumbers = [];

// Historial de pares activos (pares con 2+ apariciones)
let activePairs = {};

// Cargar historial desde localStorage al iniciar
function loadHistory() {
    const savedHistory = localStorage.getItem('recentNumbers');
    if (savedHistory) {
        recentNumbers = JSON.parse(savedHistory).map(Number);
        if (recentNumbers.length > 0) {
            updateHistoryGrid();
            updateCounts(historyLimit37, streetCounts37, 'bar37');
            updateCounts(historyLimit12, streetCounts12, 'bar12');
            updateRanking();
            updateNumberRanking();
            updateColdNumbers();
            updateHotNumbers();
            updatePairsTable();
            updateAssistantSuggestion();
        }
    }
}

// Guardar historial en localStorage
function saveHistory() {
    localStorage.setItem('recentNumbers', JSON.stringify(recentNumbers));
}

// Actualizar la grilla de historial
function updateHistoryGrid() {
    const historyGrid = document.getElementById('historyGrid');
    historyGrid.innerHTML = '';
    recentNumbers.forEach(num => {
        const numberDiv = document.createElement('div');
        numberDiv.className = `history-number ${numberColors[num.toString()]}`;
        numberDiv.textContent = num;
        historyGrid.appendChild(numberDiv);
    });
    historyGrid.scrollLeft = historyGrid.scrollWidth;
}

// Inicializar barras para últimos 37 números
const barsContainer = document.getElementById('barsContainerInner');
const orderedStreets = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
orderedStreets.forEach(street => {
    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';
    barContainer.innerHTML = `
        <div class="bar bar37" id="bar37_${street}" style="height: 14px;">
            <div class="bar-count">0</div>
            <div class="bar-label">${street}</div>
        </div>
    `;
    barsContainer.appendChild(barContainer);
});

// Inicializar barras para últimos 12 números
const barsContainer12 = document.getElementById('barsContainer12Inner');
orderedStreets.forEach(street => {
    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';
    barContainer.innerHTML = `
        <div class="bar bar12" id="bar12_${street}" style="height: 14px;">
            <div class="bar-count">0</div>
            <div class="bar-label">${street}</div>
        </div>
    `;
    barsContainer12.appendChild(barContainer);
});

// Añadir manejador de eventos para la tecla Enter
document.getElementById('numberInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        processNumber();
    }
});

// Añadir manejador de eventos para el botón de ingreso
document.getElementById('submitButton').addEventListener('click', function() {
    processNumber();
});

// Añadir manejador de eventos para el botón de reinicio
document.getElementById('resetButton').addEventListener('click', function() {
    resetAll();
});

// Función para verificar si una calle está completa en los últimos 12 números
function checkCompletedStreets() {
    const last12Numbers = recentNumbers.slice(-12);
    const completedStreets = [];
    Object.keys(baseStreetNumbers).forEach(street => {
        const streetNumbers = baseStreetNumbers[street];
        const isComplete = streetNumbers.every(num => last12Numbers.includes(num));
        if (isComplete) {
            completedStreets.push(street);
        }
    });
    return completedStreets;
}

// Función para mostrar una alerta
function showAlert(message) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertMessage.style.display = 'block';
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 8000); // Aumentado de 5000 ms a 8000 ms
}

// Función para verificar si el último número coincide con el inicio de un par inverso esperado
function checkForExpectedInversePair(lastNumber) {
    Object.keys(activePairs).forEach(pair => {
        const [num1, num2] = pair.split('-').map(Number);
        const inversePair = `${num2}-${num1}`;
        if (lastNumber === num2) {
            showAlert(`⚠️ ¡Atención! Salió un ${num2}, estamos esperando un ${num1} para completar el patrón ${inversePair} 🎯`);
        }
    });
}

// Función para actualizar la tabla de pares consecutivos
function updatePairsTable() {
    const pairsTableBody = document.getElementById('pairsTableBody');
    pairsTableBody.innerHTML = '';
    const pairCounts = {};
    for (let i = 0; i < recentNumbers.length - 1; i++) {
        const pair = `${recentNumbers[i]}-${recentNumbers[i+1]}`;
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    }
    activePairs = {};
    Object.keys(pairCounts).forEach(pair => {
        if (pairCounts[pair] >= 2) {
            activePairs[pair] = pairCounts[pair];
        }
    });
    const filteredPairs = Object.keys(pairCounts).filter(pair => pairCounts[pair] >= 2);
    filteredPairs.forEach(pair => {
        const [num1, num2] = pair.split('-').map(Number);
        const inversePair = `${num2}-${num1}`;
        const inverseCount = pairCounts[inversePair] || 0;
        const row = document.createElement('tr');
        const pairCell = document.createElement('td');
        const pairDiv1 = document.createElement('div');
        pairDiv1.className = `pair-number-cell ${numberColors[num1]}`;
        pairDiv1.textContent = num1;
        const pairDiv2 = document.createElement('div');
        pairDiv2.className = `pair-number-cell ${numberColors[num2]}`;
        pairDiv2.textContent = num2;
        pairCell.appendChild(pairDiv1);
        pairCell.appendChild(document.createTextNode('-'));
        pairCell.appendChild(pairDiv2);
        const pairCountCell = document.createElement('td');
        pairCountCell.textContent = pairCounts[pair];
        const inversePairCell = document.createElement('td');
        const inverseDiv1 = document.createElement('div');
        inverseDiv1.className = `pair-number-cell ${numberColors[num2]}`;
        inverseDiv1.textContent = num2;
        const inverseDiv2 = document.createElement('div');
        inverseDiv2.className = `pair-number-cell ${numberColors[num1]}`;
        inverseDiv2.textContent = num1;
        inversePairCell.appendChild(inverseDiv1);
        inversePairCell.appendChild(document.createTextNode('-'));
        inversePairCell.appendChild(inverseDiv2);
        const inverseCountCell = document.createElement('td');
        inverseCountCell.textContent = inverseCount;
        row.appendChild(pairCell);
        row.appendChild(pairCountCell);
        row.appendChild(inversePairCell);
        row.appendChild(inverseCountCell);
        pairsTableBody.appendChild(row);
    });
}

// Función para actualizar la sugerencia del asistente
function updateAssistantSuggestion() {
    const assistantMessage = document.getElementById('assistantMessage');
    if (recentNumbers.length < historyLimit37) {
        const numbersRemaining = historyLimit37 - recentNumbers.length;
        assistantMessage.textContent = `Sugerencia: Ingresa más números (faltan ${numbersRemaining} para 37) para recibir una recomendación de calle.`;
        return;
    }
    let minCount = Infinity;
    let suggestedStreet = null;
    Object.keys(streetCounts37).forEach(street => {
        if (streetCounts37[street] < minCount) {
            minCount = streetCounts37[street];
            suggestedStreet = street;
        } else if (streetCounts37[street] === minCount && suggestedStreet !== null) {
            if (Math.random() < 0.5) suggestedStreet = street;
        }
    });
    const streetSuggestion = `Considera la calle ${suggestedStreet} (solo ${minCount} apariciones).`;
    const colorCounts = { red: 0, black: 0, green: 0 };
    recentNumbers.forEach(num => colorCounts[numberColors[num]]++);
    const expectedRedBlack = Math.round(historyLimit37 / 2);
    const expectedGreen = 1;
    let colorTrend = '';
    if (colorCounts.red > expectedRedBlack + 3) {
        colorTrend = `Más rojos de lo esperado (${colorCounts.red} rojos, ${colorCounts.black} negros, ${colorCounts.green} verde).`;
    } else if (colorCounts.black > expectedRedBlack + 3) {
        colorTrend = `Más negros de lo esperado (${colorCounts.red} rojos, ${colorCounts.black} negros, ${colorCounts.green} verde).`;
    } else if (colorCounts.green > expectedGreen + 1) {
        colorTrend = `Más verdes de lo esperado (${colorCounts.red} rojos, ${colorCounts.black} negros, ${colorCounts.green} verde).`;
    } else {
        colorTrend = `Distribución equilibrada (${colorCounts.red} rojos, ${colorCounts.black} negros, ${colorCounts.green} verde).`;
    }
    const lastFiveNumbers = recentNumbers.slice(-5);
    const lastFiveCounts = {};
    let maxStreetCount = 0;
    let maxStreet = null;
    lastFiveNumbers.forEach(num => {
        Object.keys(streets).forEach(street => {
            if (streets[street].includes(num)) {
                lastFiveCounts[street] = (lastFiveCounts[street] || 0) + 1;
                if (lastFiveCounts[street] > maxStreetCount) {
                    maxStreetCount = lastFiveCounts[street];
                    maxStreet = street;
                }
            }
        });
    });
    const repetitionTrend = maxStreetCount >= 2 ? `Racha: La calle ${maxStreet} apareció ${maxStreetCount} veces en las últimas 5 tiradas.` : 'Sin rachas recientes en las últimas 5 tiradas.';
    let pairItems = '';
    if (Object.keys(activePairs).length === 0) {
        pairItems = '<li>No se detectaron pares consecutivos repetidos.</li>';
    } else {
        Object.keys(activePairs).forEach(pair => {
            const [num1, num2] = pair.split('-').map(Number);
            pairItems += `<li>El par ${num1}-${num2} apareció ${activePairs[pair]} veces. ¡Esté atento al inverso ${num2}-${num1}!</li>`;
        });
    }
    assistantMessage.innerHTML = `
        Análisis de patrones:
        <ul>
            <li>${streetSuggestion}</li>
            <li>${colorTrend}</li>
            <li>${repetitionTrend}</li>
            ${pairItems}
        </ul>
    `;
}

// Función para recalcular contadores basados en los últimos N números
function updateCounts(limit, streetCounts, barPrefix) {
    Object.keys(streetCounts).forEach(street => streetCounts[street] = 0);
    if (barPrefix === 'bar37') {
        Object.keys(numberCounts).forEach(num => numberCounts[num] = 0);
    }
    const lastNumbers = recentNumbers.slice(-limit);
    lastNumbers.forEach(number => {
        if (barPrefix === 'bar37') {
            numberCounts[number]++;
        }
        Object.keys(streets).forEach(street => {
            if (streets[street].includes(number)) {
                streetCounts[street]++;
            }
        });
    });
    const maxCount = Math.max(...Object.values(streetCounts));
    const maxStreets = Object.keys(streetCounts).filter(street => streetCounts[street] === maxCount).map(String);
    orderedStreets.forEach(street => {
        const height = maxCount ? (streetCounts[street] / maxCount) * 140 + 14 : 14;
        const bar = document.getElementById(`${barPrefix}_${street}`);
        bar.style.height = `${height}px`;
        bar.querySelector('.bar-count').textContent = streetCounts[street];
        bar.classList.remove('max');
        bar.classList.add('bar', barPrefix);
        if (maxCount > 0 && maxStreets.includes(String(street))) {
            bar.classList.add('max');
        }
    });
}

// Función para actualizar los números fríos (menos salidos en últimos 37)
function updateColdNumbers() {
    const coldNumbersBody = document.getElementById('coldNumbersBody');
    coldNumbersBody.innerHTML = '';
    const sortedNumbers = Object.keys(numberCounts)
        .sort((a, b) => numberCounts[a] - numberCounts[b] || a - b)
        .slice(0, 6);
    sortedNumbers.forEach(num => {
        const row = document.createElement('tr');
        const numberCell = document.createElement('td');
        const numberDiv = document.createElement('div');
        numberDiv.className = `cold-number-cell ${numberColors[num]}`;
        numberDiv.textContent = num;
        numberCell.appendChild(numberDiv);
        const countCell = document.createElement('td');
        countCell.textContent = numberCounts[num];
        row.appendChild(numberCell);
        row.appendChild(countCell);
        coldNumbersBody.appendChild(row);
    });
}

// Función para actualizar los números calientes (más salidos en últimos 37)
function updateHotNumbers() {
    const hotNumbersBody = document.getElementById('hotNumbersBody');
    hotNumbersBody.innerHTML = '';
    const sortedNumbers = Object.keys(numberCounts)
        .sort((a, b) => numberCounts[b] - numberCounts[a] || a - b)
        .slice(0, 6);
    sortedNumbers.forEach(num => {
        const row = document.createElement('tr');
        const numberCell = document.createElement('td');
        const numberDiv = document.createElement('div');
        numberDiv.className = `hot-number-cell ${numberColors[num]}`;
        numberDiv.textContent = num;
        numberCell.appendChild(numberDiv);
        const countCell = document.createElement('td');
        countCell.textContent = numberCounts[num];
        row.appendChild(numberCell);
        row.appendChild(countCell);
        hotNumbersBody.appendChild(row);
    });
}

// Función para procesar el número ingresado
function processNumber() {
    const input = document.getElementById('numberInput');
    const errorMessage = document.getElementById('errorMessage');
    const number = parseInt(input.value);
    if (isNaN(number) || number < 0 || number > 36) {
        errorMessage.textContent = 'Por favor, ingresa un número entre 0 y 36.';
        errorMessage.style.display = 'block';
        input.value = '';
        return;
    }
    input.value = '';
    errorMessage.style.display = 'none';
    recentNumbers.push(number);
    if (recentNumbers.length > historyLimit37) recentNumbers.shift();
    saveHistory();
    updateCounts(historyLimit37, streetCounts37, 'bar37');
    updateCounts(historyLimit12, streetCounts12, 'bar12');
    const completedStreets = checkCompletedStreets();
    if (completedStreets.length > 0) {
        const message = `¡Se complet${completedStreets.length > 1 ? 'aron las calles' : 'ó la calle'} ${completedStreets.join(' y ')}!`;
        showAlert(message);
    }
    updateHistoryGrid();
    updateRanking();
    updateNumberRanking();
    updateColdNumbers();
    updateHotNumbers();
    updatePairsTable();
    checkForExpectedInversePair(number);
    updateAssistantSuggestion();
}

// Función para actualizar el ranking de calles
function updateRanking() {
    const rankingBody = document.getElementById('rankingBody');
    rankingBody.innerHTML = '';
    const sortedStreets = Object.keys(streetCounts37).sort((a, b) => streetCounts37[b] - streetCounts37[a]);
    sortedStreets.forEach(street => {
        const row = document.createElement('tr');
        const streetCell = document.createElement('td');
        const streetDiv = document.createElement('div');
        streetDiv.className = 'street-ranking-cell';
        streetDiv.textContent = street;
        streetCell.appendChild(streetDiv);
        const countCell = document.createElement('td');
        countCell.textContent = streetCounts37[street];
        row.appendChild(streetCell);
        row.appendChild(countCell);
        rankingBody.appendChild(row);
    });
}

// Función para actualizar el ranking de números
function updateNumberRanking() {
    const numberRankingBody = document.getElementById('numberRankingBody');
    numberRankingBody.innerHTML = '';
    const sortedNumbers = Object.keys(numberCounts)
        .sort((a, b) => numberCounts[b] - numberCounts[a])
        .filter(num => numberCounts[num] > 0);
    sortedNumbers.forEach(num => {
        const row = document.createElement('tr');
        const numberCell = document.createElement('td');
        const numberDiv = document.createElement('div');
        numberDiv.className = `number-ranking-cell ${numberColors[num]}`;
        numberDiv.textContent = num;
        numberCell.appendChild(numberDiv);
        const countCell = document.createElement('td');
        countCell.textContent = numberCounts[num];
        row.appendChild(numberCell);
        row.appendChild(countCell);
        numberRankingBody.appendChild(row);
    });
}

// Función para reiniciar todos los datos
function resetAll() {
    recentNumbers = [];
    activePairs = {};
    localStorage.removeItem('recentNumbers');
    Object.keys(streetCounts37).forEach(street => streetCounts37[street] = 0);
    Object.keys(streetCounts12).forEach(street => streetCounts12[street] = 0);
    Object.keys(numberCounts).forEach(num => numberCounts[num] = 0);
    orderedStreets.forEach(street => {
        const bar37 = document.getElementById(`bar37_${street}`);
        const bar12 = document.getElementById(`bar12_${street}`);
        bar37.style.height = '14px';
        bar37.querySelector('.bar-count').textContent = '0';
        bar37.classList.remove('max');
        bar12.style.height = '14px';
        bar12.querySelector('.bar-count').textContent = '0';
        bar12.classList.remove('max');
    });
    updateHistoryGrid();
    document.getElementById('rankingBody').innerHTML = '';
    document.getElementById('numberRankingBody').innerHTML = '';
    document.getElementById('coldNumbersBody').innerHTML = '';
    document.getElementById('hotNumbersBody').innerHTML = '';
    document.getElementById('pairsTableBody').innerHTML = '';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('numberInput').value = '';
    showAlert('Historial reiniciado.');
    updateAssistantSuggestion();
}

// Cargar historial al iniciar
loadHistory();