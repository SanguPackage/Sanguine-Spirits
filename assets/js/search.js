let search = null;


$(document).ready(function() {
  if ($('#ingredient-filter').length) {
    loadCocktails();
  }
});


async function loadCocktails() {
  try {
    const response = await fetch('./assets/cocktails.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cocktails = await response.json();
    search = new CocktailSearch(cocktails);
    initializeSelect2();
  } catch (error) {
    console.error('Error loading cocktails:', error);
  }
}




function initializeSelect2() {
  const uniqueIngredients = search.getUniqueIngredients();

  const selectElement = $('#ingredient-filter');
  uniqueIngredients.forEach(ingredient => {
    selectElement.append(new Option(ingredient, ingredient));
  });

  selectElement.select2({
    theme: 'classic',
    placeholder: 'Search for cocktail recipes...',
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
    localStorage.setItem('filters', JSON.stringify(selectedIngredients));
    debugger;
    const filteredCocktails = filterCocktails(selectedIngredients);
    displayResults(filteredCocktails);
  });

  const defaultSelectedOptions = localStorage.getItem('filters');
  if (defaultSelectedOptions) {
    selectElement.val(JSON.parse(defaultSelectedOptions)).trigger('change');
  }
}



function filterCocktails(selectedIngredients) {
  if (selectedIngredients.length === 0) {
    return cocktails;
  }

  // return cocktails.filter(cocktail => {
  //   const cocktailIngredients = cocktail.ingredients
  //     .filter(ing => ing.type !== 'garnish')
  //     .map(ing => ing.name);

  //   return selectedIngredients.every(selected => cocktailIngredients.includes(selected));
  // });

  const result = search.searchAdvanced(selectedIngredients.join(' '));
  console.log('result', result);
  return result;
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





// Using: https://emersonbottero.github.io/flexsearch
class CocktailSearch {
  constructor(cocktails) {
    this.cocktails = cocktails;
    this.index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['name', 'spirit', "desc", 'ingredients', 'steps'],
      },
      tokenize: 'forward',
      resolution: 9,
    });

    this.initializeIndex();
  }

  initializeIndex() {
    this.cocktails.forEach((cocktail, index) => {
      const ingredientsText = cocktail.ingredients
        .map(ing => ing.name)
        .join(' ');

      const stepsText = cocktail.steps ? cocktail.steps.join(' ') : '';

      const searchableDoc = {
        id: index,
        name: cocktail.name,
        spirit: cocktail.spirit,
        desc: cocktail.desc,
        ingredients: ingredientsText,
        steps: stepsText,
      };

      this.index.add(searchableDoc);
    });
  }

  getUniqueIngredients() {
    const ingredients = new Set();

    this.cocktails.forEach(cocktail => {
      cocktail.ingredients.forEach(ingredient => {
        if (ingredient.spirit || ingredient.name === cocktail.spirit) {
          ingredients.add(ingredient.name);
        }
      });
    });

    return Array.from(ingredients).sort();
  }

  search(query, limit = 1000) {
    if (!query || query.trim() === '') {
      return this.cocktails.slice(0, limit);
    }

    const results = this.index.search(query, { limit });

    const cocktailIds = new Set();
    const searchResults = [];

    results.forEach(fieldResult => {
      if (fieldResult.result) {
        fieldResult.result.forEach(id => {
          if (!cocktailIds.has(id)) {
            cocktailIds.add(id);
            searchResults.push(this.cocktails[id]);
          }
        });
      }
    });

    return searchResults.slice(0, limit);
  }

  searchAdvanced(query, limit = 1000) {
    const fields = ['name', 'spirit', 'desc', 'ingredients'];

    if (!query || query.trim() === '') {
      return this.cocktails.slice(0, limit);
    }

    const results = this.index.search(query, {
      index: fields,
      limit: limit * 2,
    });

    const scoredResults = new Map();

    results.forEach(fieldResult => {
      const field = fieldResult.field;
      const fieldResults = fieldResult.result || [];

      fieldResults.forEach(id => {
        if (!scoredResults.has(id)) {
          scoredResults.set(id, { id, score: 0 });
        }

        // Weight different fields
        let weight = 1;
        switch (field) {
          case 'name':
            weight = 4;
            break;
          case 'spirit':
            weight = 3;
            break;
          case 'ingredients':
            weight = 2;
            break;
          case 'desc':
            weight = 1;
            break;
        }

        scoredResults.get(id).score += weight;
      });
    });

    return Array.from(scoredResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => this.cocktails[result.id]);
  }

  searchBySpirit(spirit, limit = 1000) {
    return this.cocktails
      .filter(cocktail => cocktail.spirit.toLowerCase().includes(spirit.toLowerCase()))
      .slice(0, limit);
  }

  searchByIngredient(ingredient, limit = 1000) {
    return this.cocktails
      .filter(cocktail => cocktail.ingredients.some(ing => ing.name.toLowerCase().includes(ingredient.toLowerCase())))
      .slice(0, limit);
  }
}

search = new CocktailSearch([]);
