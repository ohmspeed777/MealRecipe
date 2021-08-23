const app = document.querySelector('.app');
const baseUrl = 'https://themealdb.com/api/json/v1/1';

const screen = {
  main: app.querySelector('.main-screen'),
  recipeList: app.querySelector('.recipe-list'),
  recipe: app.querySelector('.recipe-screen'),
};

//----------------------------  mark up ------------------------------------ //
const createCategoriesMarkup = (categories) => {
  return categories
    .map((el) => {
      return `<div class="category">${el.strCategory}</div>`;
    })
    .join('');
};

const createRecipeMarkup = (recipes) => {
  return recipes
    .map((el) => {
      return `
        <div data-recipe-id="${el.idMeal}" class="item"> 
            <div class="back-btn">&lt;</div>
            <div class="thumbnail">
              <img src="${el.strMealThumb}" alt="" />
            </div>
            <div class="details">
              <h2>${el.strMeal}</h2>
            </div>
        </div>`;
    })
    .join('');
};

const createIngredientMarkup = (ingredient) => {
  // generate ul
  const liMarkup = [...new Array(20)]
    .map((_, index) => {
      if (ingredient[0][`strIngredient${index}`]) {
        return `<li>${ingredient[0][`strIngredient${index}`]}</li>`;
      }
    })
    .filter((el) => el)
    .join('');

  // generate ol
  const olMarkup = ingredient[0].strInstructions
    .trim()
    .split('\r\n')
    .map((el) => `<li>${el}</li>`)
    .join('');


  return ingredient
    .map((el) => {
      return `
        <div class="back-btn">&lt;</div>
        <div class="thumbnail">
          <img src="${el.strMealThumb}" alt="${el.strMeal}" />
        </div>
        <div class="details">
          <h2>${el.strMeal}</h2>
          <div>
            <div class="h4">Ingredients</div>
            <ul>
            ${liMarkup}
            </ul>
          </div>
          <div>
            <div class="h4">Instructions</div>
            <ol>
            ${olMarkup}
            </ol>
          </div>
        </div>
    `;
    })
    .join('');
};
//----------------------------  end mark up ------------------------------------ //

//----------------------------  display ------------------------------------ //
const resetScreen = (screen) => {
  screen.innerHTML = '';
};

const toggle = () => {
  screen.main.classList.toggle('hidden');
  screen.recipe.classList.toggle('hidden');
};

// render
const renderRecipe = (recipes) => {
  resetScreen(screen.recipeList);
  const markup = createRecipeMarkup(recipes);
  screen.recipeList.insertAdjacentHTML('afterbegin', markup);
};

const renderIngredient = (ingredient) => {
  resetScreen(screen.recipe);
  const markup = createIngredientMarkup(ingredient);
  screen.recipe.insertAdjacentHTML('afterbegin', markup);
  screen.recipe.querySelector('.back-btn').addEventListener('click', () => {
    resetScreen(screen.recipe);
    toggle();
  });
};

const renderCategories = (categories) => {
  const markup = createCategoriesMarkup(categories);
  screen.main
    .querySelector('.categories')
    .insertAdjacentHTML('afterbegin', markup);
};
//----------------------------  end display ------------------------------------ //

//----------------------------  api ------------------------------------ //
// fetch api recipe
const getRecipeFromCategory = async (category) => {
  try {
    const res = await fetch(`${baseUrl}/filter.php?c=${category}`).then((res) =>
      res.json()
    );
    return res.meals;
  } catch (err) {
    console.err(err);
    return false;
  }
};

const getIngredient = async (id) => {
  try {
    const res = await fetch(`${baseUrl}/lookup.php?i=${id}`).then((res) =>
      res.json()
    );
    return res.meals;
  } catch (err) {
    return false;
  }
};

const getCategories = async () => {
  try {
    const res = await fetch(`${baseUrl}/list.php?c=list`).then((res) =>
      res.json()
    );
    return res.meals;
  } catch (err) {
    return false;
  }
};
//----------------------------  end api ------------------------------------ //

//----------------------------  event ------------------------------------ //
const handleClickCategory = async (e) => {
  // check category
  const category = e.target.closest('.category');
  if (!category) return;

  // selector all active class
  const active = Array.from(
    category.parentElement.querySelectorAll('.category.active')
  );

  // remove active
  if (active) {
    active.forEach((el) => el.classList.remove('active'));
  }

  // add active
  category.classList.add('active');

  // render recipe
  const recipes = await getRecipeFromCategory(category.innerText);
  if (recipes) renderRecipe(recipes);
};

const handleClickRecipe = async (e) => {
  const recipe = e.target.closest('.item');
  // console.log(recipe)
  if (!recipe) return;

  console.log(recipe.dataset.recipeId);
  const ingredient = await getIngredient(recipe.dataset.recipeId);
  if (ingredient) renderIngredient(ingredient);
  toggle();
};

//----------------------------  end event ------------------------------------ //

const main = async () => {
  try {
    const categories = await getCategories();

    // add item
    renderCategories(categories);

    // add event
    screen.main
      .querySelector('.categories')
      .addEventListener('click', handleClickCategory);

    screen.recipeList.addEventListener('click', handleClickRecipe);
  } catch (err) {
    console.err(err);
  }
};

main();
