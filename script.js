const container = document.getElementById("bars-container");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const sizeRange = document.getElementById("sizeRange");
const sizeValue = document.getElementById("sizeValue");
const tooltip = document.getElementById("tooltip");
const sortButton = document.getElementById("sort-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");

let array = [];
let isSorting = false;
let isPaused = false;
let pauseResolve;

// Function to generate random array and render bars
function generateBars(num = parseInt(sizeRange.value)) {
  if (isSorting) return; // Prevent generating new bars during sorting

  array = [];
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < num; i++) {
    const value = Math.floor(Math.random() * 300) + 10;
    array.push(value);

    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.classList.remove("sorted", "active"); // Reset classes
    bar.style.height = `${value}px`;
    bar.style.width = `${Math.floor(800 / num)}px`; // Adjust width based on number of bars
    fragment.appendChild(bar);
  }

  container.appendChild(fragment);
  tooltip.textContent = "New array generated. Click 'Start Bubble Sort' to begin!";
}

// Function to update the speed display
function updateSpeedDisplay() {
  speedValue.textContent = `${speedRange.value} ms`;
}

// Function to update the size display
function updateSizeDisplay() {
  sizeValue.textContent = `${sizeRange.value}`;
}

// Function to update the visual representation based on the array
function renderBars(highlightIndices = [], sortedIndices = []) {
  const bars = document.querySelectorAll(".bar");
  bars.forEach((bar, index) => {
    bar.style.height = `${array[index]}px`;
    if (highlightIndices.includes(index)) {
      bar.classList.add("active");
    } else if (sortedIndices.includes(index)) {
      bar.classList.add("sorted");
    } else {
      bar.classList.remove("active", "sorted");
    }
  });
}

// Utility function to pause execution for visualization
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to handle pause functionality
function pauseSort() {
  if (!isSorting || isPaused) return;
  isPaused = true;
  pauseButton.disabled = true;
  resumeButton.disabled = false;
  tooltip.textContent = "Sorting paused.";
}

// Function to handle resume functionality
function resumeSort() {
  if (!isSorting || !isPaused) return;
  isPaused = false;
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  tooltip.textContent = "Resuming sorting...";
  if (pauseResolve) pauseResolve();
}

// Function to pause the async process
function waitIfPaused() {
  if (!isPaused) return Promise.resolve();
  return new Promise(resolve => {
    pauseResolve = resolve;
  });
}

// Function to perform Bubble Sort and visualize the process
async function bubbleSort() {
  if (isSorting) return; // Prevent multiple sort operations
  isSorting = true;
  disableControls(true);
  tooltip.textContent = "Starting Bubble Sort...";

  const n = array.length;
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      await waitIfPaused();

      // Highlight the bars being compared
      renderBars([j, j + 1], []);
      tooltip.textContent = `Comparing indices ${j} and ${j + 1}`;
      await sleep(speedRange.value);

      if (array[j] > array[j + 1]) {
        // Swap in the array
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
        tooltip.textContent = `Swapped indices ${j} and ${j + 1}`;
        renderBars([j, j + 1], []);
        await sleep(speedRange.value);
      }
      // Remove highlight
      renderBars([], []);
    }

    // Mark the last sorted element
    bars[n - i - 1].classList.add("sorted");
    tooltip.textContent = `Element at index ${n - i - 1} is sorted.`;
    
    if (!swapped) {
      // If no two elements were swapped in the inner loop, array is sorted
      break;
    }
  }

  // Mark all elements as sorted after sorting
  bars.forEach(bar => bar.classList.add("sorted"));

  tooltip.textContent = "Bubble Sort Completed!";
  disableControls(false);
  isSorting = false;
  isPaused = false;
  pauseButton.disabled = true;
  resumeButton.disabled = true;
}


// Function to perform Selection Sort and visualize the process
async function selectionSort() {
  if (isSorting) return;
  isSorting = true;
  disableControls(true);
  tooltip.textContent = "Starting Selection Sort...";
  
  const n = array.length;
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      await waitIfPaused();
      
      // Highlight the bars being compared
      renderBars([j, minIndex], []);
      tooltip.textContent = `Comparing indices ${j} and ${minIndex}`;
      await sleep(speedRange.value);
      
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }

    // Swap if needed
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      renderBars([], [i, minIndex]);
      tooltip.textContent = `Swapped indices ${i} and ${minIndex}`;
      await sleep(speedRange.value);
    }
    
    bars[i].classList.add("sorted");
  }

  // Mark the last element as sorted
  bars[n - 1].classList.add("sorted");

  // Mark all elements as sorted after sorting
  bars.forEach(bar => bar.classList.add("sorted"));

  tooltip.textContent = "Selection Sort Completed!";
  disableControls(false);
  isSorting = false;
  isPaused = false;
  pauseButton.disabled = true;
  resumeButton.disabled = true;
}


// Function to perform Insertion Sort and visualize the process
async function insertionSort() {
  if (isSorting) return;
  isSorting = true;
  disableControls(true);
  tooltip.textContent = "Starting Insertion Sort...";

  const n = array.length;
  const bars = document.querySelectorAll(".bar");

  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;

    // Highlight the current key being inserted
    renderBars([], [i]);
    tooltip.textContent = `Inserting ${key} at the correct position`;
    await sleep(speedRange.value);

    while (j >= 0 && array[j] > key) {
      await waitIfPaused();
      array[j + 1] = array[j];
      j--;
      renderBars([], [j + 1]); // Highlight the bar being moved
      await sleep(speedRange.value);
    }
    array[j + 1] = key;

    // Render the bars after insertion
    renderBars([], [j + 1]);
    bars[j + 1].classList.add("sorted");
  }

  // Mark all elements as sorted after sorting
  bars.forEach(bar => bar.classList.add("sorted"));

  tooltip.textContent = "Insertion Sort Completed!";
  disableControls(false);
  isSorting = false;
  isPaused = false;
  pauseButton.disabled = true;
  resumeButton.disabled = true;
}


// Function to perform Quick Sort and visualize the process
async function quickSort() {
  if (isSorting) return;
  isSorting = true;
  disableControls(true);
  tooltip.textContent = "Starting Quick Sort...";

  async function partition(low, high) {
    const pivot = array[high];
    let i = low - 1;
    const bars = document.querySelectorAll(".bar");

    for (let j = low; j < high; j++) {
      await waitIfPaused();
      renderBars([j, high], []); // Highlight pivot and current bar
      tooltip.textContent = `Comparing ${array[j]} with pivot ${pivot}`;
      await sleep(speedRange.value);

      if (array[j] < pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        bars[i].classList.add("sorted");
        renderBars([], [i, j]);
        tooltip.textContent = `Swapped ${array[j]} and ${array[i]}`;
        await sleep(speedRange.value);
      }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    bars[i + 1].classList.add("sorted");
    renderBars([], [i + 1, high]);
    await sleep(speedRange.value);
    return i + 1;
  }

  async function quickSortRecursive(low, high) {
    if (low < high) {
      const pi = await partition(low, high);
      await quickSortRecursive(low, pi - 1);
      await quickSortRecursive(pi + 1, high);
    }
  }

  await quickSortRecursive(0, array.length - 1);
  
  // Mark all bars as sorted
  const allSorted = document.querySelectorAll(".bar");
  allSorted.forEach(bar => bar.classList.add("sorted"));

  tooltip.textContent = "Quick Sort Completed!";
  disableControls(false);
  isSorting = false;
  isPaused = false;
  pauseButton.disabled = true;
  resumeButton.disabled = true;
}

// Function to perform Merge Sort and visualize the process
async function mergeSort() {
  if (isSorting) return;
  isSorting = true;
  disableControls(true);
  tooltip.textContent = "Starting Merge Sort...";
  
  async function merge(left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;
    const L = array.slice(left, mid + 1);
    const R = array.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
      await waitIfPaused();
      renderBars([k], []); // Highlight the current index
      tooltip.textContent = `Merging ${L[i]} and ${R[j]}`;
      await sleep(speedRange.value);

      if (L[i] <= R[j]) {
        array[k] = L[i];
        i++;
      } else {
        array[k] = R[j];
        j++;
      }
      k++;
    }

    while (i < n1) {
      await waitIfPaused();
      array[k] = L[i];
      renderBars([], [k]);
      tooltip.textContent = `Copying ${L[i]}`;
      await sleep(speedRange.value);
      i++;
      k++;
    }

    while (j < n2) {
      await waitIfPaused();
      array[k] = R[j];
      renderBars([], [k]);
      tooltip.textContent = `Copying ${R[j]}`;
      await sleep(speedRange.value);
      j++;
      k++;
    }

    // Mark the merged portion as sorted
    for (let idx = left; idx <= right; idx++) {
      document.querySelectorAll(".bar")[idx].classList.add("sorted");
    }
  }

  async function mergeSortRecursive(left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      await mergeSortRecursive(left, mid);
      await mergeSortRecursive(mid + 1, right);
      await merge(left, mid, right);
    }
  }

  await mergeSortRecursive(0, array.length - 1);

  // Mark all bars as sorted
  const allSorted = document.querySelectorAll(".bar");
  allSorted.forEach(bar => bar.classList.add("sorted"));

  tooltip.textContent = "Merge Sort Completed!";
  disableControls(false);
  isSorting = false;
  isPaused = false;
  pauseButton.disabled = true;
  resumeButton.disabled = true;
}

// Function to disable/enable controls
function disableControls(disable) {
  sortButton.disabled = disable;
  pauseButton.disabled = !disable;
  resumeButton.disabled = !disable;
}

// Initial generation of bars
generateBars();
updateSpeedDisplay();
updateSizeDisplay();

// Add event listeners for sliders to update the displayed values
speedRange.addEventListener('input', updateSpeedDisplay);
sizeRange.addEventListener('input', updateSizeDisplay);

