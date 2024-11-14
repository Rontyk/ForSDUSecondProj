document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = 'e393f2312ec6bab2770ac7d0b7c1ccae';
  let switchap = true;

  const inputci = document.getElementById('input-location');
  const ulsuggs = document.getElementById('dropdown-suggestions');
   const btnSearch = document.getElementById('btn-search');
  const btnLocation = document.getElementById('btn-location');
   const toggleUnit = document.getElementById('toggle-unit');
  const currentInfo = document.getElementById('current-info');
  const forecastInfo = document.getElementById('forecast-info');

  inputci.addEventListener('input', () => {
      if (inputci.value.length > 0) {
          ulsuggs.classList.remove('hidden');
          const query = inputci.value.trim();
          if (query.length > 2) {
              fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`)
                  .then(res => res.json())
                  .then(data => {
                      ulsuggs.innerHTML = '';
                      data.forEach(item => {
                          const listItem = document.createElement('li');
                          listItem.textContent = `${item.name}, ${item.country}`;
                          listItem.addEventListener('click', () => {
                              inputci.value = `${item.name}, ${item.country}`;
                              ulsuggs.innerHTML = '';
                              fetchWeather(item.lat, item.lon);
                          });
                          ulsuggs.appendChild(listItem);
                      });
                  })
                  .catch(() => alert('Error loading suggestions.'));
          } else {
              ulsuggs.innerHTML = '';
          }
      } else {
          ulsuggs.classList.add('hidden');
      }
  });

  document.addEventListener('click', (e) => {
      if (!ulsuggs.contains(e.target) && e.target !== inputci) {
          ulsuggs.innerHTML = '';
      }
  });

  btnSearch.addEventListener('click', () => {
      const query = inputci.value.trim();
      if (query) {
          const [city, country] = query.split(',');
          getCoordinates(city.trim(), country ? country.trim() : '');
          } else {
          alert('Please provide a city name.');
       }
  });

  btnLocation.addEventListener('click', () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(({ coords }) => {
              fetchWeather(coords.latitude, coords.longitude);
          }, () => alert('Location access denied.'));
      } else {
          alert('Geolocation is not supported by your browser.');
      }
  });

   toggleUnit.addEventListener('click', () => {
       switchap = !switchap;
      toggleUnit.textContent = switchap ? 'Switch to °F' : 'Switch to °C';
       const query = inputci.value.trim();
      if (query) {
          const [city, country] = query.split(',');
          getCoordinates(city.trim(), country ? country.trim() : '');
      } else {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(({ coords }) => {
                  fetchWeather(coords.latitude, coords.longitude);
              });
          }
      }
  });

   const getCoordinates = (city, country = '') => {
       fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${API_KEY}`)
          .then(res => res.json())
          .then(data => {
              if (data.length) {
                  fetchWeather(data[0].lat, data[0].lon);
               } else {
                  alert('City not found.');
              }
          });
  };

  const fetchWeather = (lat, lon) => {
      const unit = switchap ? 'metric' : 'imperial';
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`)
           .then(res => res.json())
          .then(showCurrentWeather);
 
       fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`)
          .then(res => res.json())
          .then(({ list }) => displayForecast(list));
  };

  const showCurrentWeather = (data) => {
      const icon = data.weather[0].icon;
       currentInfo.innerHTML = `
          <h2>${data.name}</h2>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
           <p>${data.weather[0].description}</p>
            <p>Temp: ${data.main.temp}°${switchap ? 'C' : 'F'}</p>
           <p>Humidity: ${data.main.humidity}%</p>
           <p>Wind: ${data.wind.speed} ${switchap ? 'm/s' : 'mph'}</p>
      `;
  };

  const displayForecast = (data) => {
      const grouped = {};
      data.forEach(item => {
          const day = item.dt_txt.split(' ')[0];
          if (!grouped[day]) grouped[day] = [];
           grouped[day].push(item);
      });

       forecastInfo.innerHTML = Object.keys(grouped).slice(0, 5).map(day => {
          const dayData = grouped[day][Math.floor(grouped[day].length / 2)];
          const icon = dayData.weather[0].icon;
           return `
              <div class="forecast-card">
                  <h3>${new Date(day).toLocaleDateString(undefined, { weekday: 'long' })}</h3>
                  <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
                   <p>${dayData.weather[0].description}</p>
                  <p>${dayData.main.temp.toFixed(1)}°${switchap ? 'C' : 'F'}</p>
              </div>
          `;
       }).join('');
  };
});

