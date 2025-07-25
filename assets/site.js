let cocktails = [];

function getUniqueIngredients(cocktailData) {
  const ingredients = new Set();

  cocktailData.forEach(cocktail => {
    cocktail.ingredients.forEach(ingredient => {
      if (ingredient.type !== 'garnish') {
        ingredients.add(ingredient.name);
      }
    });
  });

  return Array.from(ingredients).sort();
}

function filterCocktails(selectedIngredients) {
  if (selectedIngredients.length === 0) {
    return cocktails;
  }

  return cocktails.filter(cocktail => {
    const cocktailIngredients = cocktail.ingredients
      .filter(ing => ing.type !== 'garnish')
      .map(ing => ing.name);

    return selectedIngredients.every(selected =>
      cocktailIngredients.includes(selected)
    );
  });
}

function displayResults(filteredCocktails) {
  const allCocktailDivs = document.querySelectorAll('[data-cocktail]');
  const filteredNames = filteredCocktails.map(cocktail => cocktail.name);

  allCocktailDivs.forEach(div => {
    const cocktailName = div.getAttribute('data-cocktail');
    if (filteredNames.includes(cocktailName)) {
      div.style.display = '';
    } else {
      div.style.display = 'none';
    }
  });

  const noResultsDiv = document.getElementById('no-results-message');
  noResultsDiv.style.display = filteredCocktails.length === 0 ? '' : 'none';
}


async function loadCocktails() {
  try {
    const response = await fetch('./assets/cocktails.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    cocktails = await response.json();
    initializeSelect2();
  } catch (error) {
    console.error('Error loading cocktails:', error);
  }
}

function initializeSelect2() {
  const uniqueIngredients = getUniqueIngredients(cocktails);

  const selectElement = $('#ingredient-filter');
  uniqueIngredients.forEach(ingredient => {
    selectElement.append(new Option(ingredient, ingredient));
  });

  selectElement.select2({
    theme: 'classic',
    placeholder: "Search for cocktail recipes...",
    allowClear: true,
    tags: true,
    tokenSeparators: [',', ' '],
    createTag: function (params) {
      const term = $.trim(params.term);
      if (term === '') {
        return null;
      }
      return {
        id: term,
        text: term,
        newTag: true
      };
    }
  });

  selectElement.on('change', function() {
    const selectedIngredients = $(this).val() || [];
    const filteredCocktails = filterCocktails(selectedIngredients);
    displayResults(filteredCocktails);
  });
}





function changeUnit(newUnit) {
  console.log('setting unit ' + newUnit);
  localStorage.setItem('units', newUnit);

  const selectedUnit = document.getElementById('selectedUnit');
  if (!selectedUnit) {
    return;
  }

  let newClassName = '';
  switch (newUnit) {
    case 'Imperial':
      newClassName = 'fas fa-balance-scale';
      break;
    case 'Metric':
      newClassName = 'fas fa-ruler';
      break;
    case 'Parts':
      newClassName = 'fas fa-divide';
      break;
  }
  selectedUnit.className = newClassName + ' me-2';

  document.querySelectorAll('.selectedUnit').forEach(element => {
    element.className = 'dropdown-item selectedUnit';
    if (element.getAttribute('data-unit') === newUnit) {
      element.className += ' bg-info';
    }
  });

  const unitValues = document.querySelectorAll('.amount');
  unitValues.forEach(element => {
    const newValue = +element.getAttribute('data-amount');
    const amountType = element.getAttribute('data-amountType');

    if (amountType === 'absolute') {
      element.textContent = newValue;
    } else if (!!amountType) {
      element.textContent = newValue + ' ' + amountType;
    } else {
      switch (newUnit) {
        case 'Imperial':
          element.textContent = formatAmount(newValue) + ' oz';
          break;
        case 'Metric':
          element.textContent = (newValue * 30) + ' ml';
          break;
        case 'Parts':
          element.textContent = formatAmount(newValue);
          break;
      }
    }
  });
}

function formatAmount(amount) {
  const wholePart = Math.floor(amount);
  const fractionalPart = amount - wholePart;

  if (fractionalPart === 0) {
    return wholePart.toString();
  } else if (Math.abs(fractionalPart - 0.25) < 0.0001) {
    return wholePart > 0 ? `${wholePart} ¼` : '¼';
  } else if (Math.abs(fractionalPart - 0.5) < 0.0001) {
    return wholePart > 0 ? `${wholePart} ½` : '½';
  } else if (Math.abs(fractionalPart - 0.75) < 0.0001) {
    return wholePart > 0 ? `${wholePart} ¾` : '¾';
  } else {
    return amount.toString();
  }
}






$(document).ready(function() {
  const unit = localStorage.getItem('units');
  if (unit) {
    changeUnit(unit);
  }
  loadCocktails();
});
