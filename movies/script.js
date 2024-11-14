const API_KEY = '0140b2f1de2f0e354aff011b1392fc18';
const API_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const searchBar = document.getElementById('search-bar');
const movieList = document.getElementById('movie-list');
const detailsOverlay = document.getElementById('details-overlay');
const detsCont = document.getElementById('details-content');
const closeOverlay = document.getElementById('close-overlay');
const waticonca = document.getElementById('watchlist-icon');
const watchlist = document.getElementById('watchlist');
const wlcontent = document.getElementById('watchlist-content');

let watchlistMovies = JSON.parse(localStorage.getItem('watchlistMovies')) || [];

searchBar.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (query) {
    const movies = await fetchMovies(query);
    renderMovies(movies);
  } else {
    movieList.innerHTML = '';
  }
});

async function fetchMovies(query) {
  const response = await fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
  const data = await response.json();
  return data.results || [];
}

function renderMovies(movies) {
    movieList.innerHTML = '';
    movies.forEach((mv) => {
      const movieCard = document.createElement('div');
      movieCard.classList.add('movie-card');
      movieCard.innerHTML = `
        <img src="${mv.poster_path ? IMG_URL + mv.poster_path : ''}" alt="${mv.title}">
        <h3>${mv.title}</h3>
        <button class="add-to-watchlist">Add to Watchlist</button>
       
      `;
      movieCard.querySelector('.add-to-watchlist').addEventListener('click', (e) => {
        e.stopPropagation(); 
        addToWatchlist(mv);
      });
      movieCard.addEventListener('click', () => showDetails(mv.id));
      movieList.appendChild(movieCard);
    });
  }

  async function showDetails(movieId) {
    const movie = await fetchMovieDetails(movieId);
    detsCont.innerHTML = `
      <h2>${movie.title}</h2>
      <img src="${movie.poster_path ? IMG_URL + movie.poster_path : ''}" alt="${movie.title}">
      <p>${movie.overview || 'No description available.'}</p>
      <p>Rating: ${movie.vote_average || 'N/A'}</p>
      <p>Release Date: ${movie.release_date || 'N/A'}</p>
      <button class="add-to-watchlist">Add to Watchlist</button>
       <button class="close-overlay" onclick="closeas();">Close</button>
    `;
    detailsOverlay.classList.add('visible'); 
  }

function closeas() {
    detailsOverlay.classList.remove('visible'); 

  }
  
  closeOverlay.addEventListener('click', () => {
    detailsOverlay.classList.remove('visible');
  });

async function fetchMovieDetails(movieId) {
  const response = await fetch(`${API_URL}/movie/${movieId}?api_key=${API_KEY}`);
  return response.json();
}

closeOverlay.addEventListener('click', () => {
  detailsOverlay.classList.add('hidden');
});

waticonca.addEventListener('click', () => {
    watchlist.classList.toggle('hidden');
    renderWatchlist();
  });
  
  function addToWatchlist(movie) {
    if (!watchlistMovies.some(m => m.id === movie.id)) {
      const movieToAdd = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || '',
      };
      watchlistMovies.push(movieToAdd);
       localStorage.setItem('watchlistMovies', JSON.stringify(watchlistMovies));
      renderWatchlist();
    } else {
      alert("This movie is already in your watchlist!");
    }
  }
  
  function renderWatchlist() {
    movieList.innerHTML = '';
    wlcontent.innerHTML = '';
    if (watchlistMovies.length === 0) {
      wlcontent.innerHTML = '<p>Your watchlist is empty.</p>';
    } else {
       watchlistMovies.forEach((movie) => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
          <img src="${movie.poster_path ? IMG_URL + movie.poster_path : ''}" alt="${movie.title}">
          <h3>${movie.title}</h3>
          <button class="remove-from-watchlist">Remove</button>
        `;
         movieCard.querySelector('.remove-from-watchlist').addEventListener('click', () => removeFromWatchlist(movie.id));
        wlcontent.appendChild(movieCard);
      });
    }
  }
  
  function removeFromWatchlist(movieId) {
    watchlistMovies = watchlistMovies.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlistMovies', JSON.stringify(watchlistMovies));
    renderWatchlist();
  }
  
renderWatchlist();