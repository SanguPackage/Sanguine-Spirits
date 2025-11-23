$(document).ready(function() {
  const unit = localStorage.getItem('units');
  if (unit) {
    changeUnit(unit);
  }

  const servings = localStorage.getItem('servings') || '1';
  changeServings(parseInt(servings));
});


function changeServings(servingCount) {
  console.log('setting servings ' + servingCount);
  localStorage.setItem('servings', servingCount.toString());

  const selectedServings = document.getElementById('selectedServings');
  if (selectedServings) {
    selectedServings.textContent = servingCount;
  }

  document.querySelectorAll('.servingsOption').forEach(element => {
    element.className = 'dropdown-item servingsOption';
    if (parseInt(element.getAttribute('data-servings')) === servingCount) {
      element.className += ' bg-info';
    }
  });

  updateAmounts();
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

  updateAmounts();
}

function updateAmounts() {
  const newUnit = localStorage.getItem('units') || 'Metric';
  const servings = parseInt(localStorage.getItem('servings') || '1');

  const unitValues = document.querySelectorAll('.amount');
  unitValues.forEach(element => {
    const baseAmount = +element.getAttribute('data-amount');
    const newValue = baseAmount * servings;
    const amountType = element.getAttribute('data-amountType');

    if (amountType === 'absolute') {
      element.textContent = formatAmount(newValue);
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
