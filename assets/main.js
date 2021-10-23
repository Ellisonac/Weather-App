var apiKey = "ba14bcb96b596c6917caf22edb9cad52";
var summaryEl = document.querySelector("#weather-summary");
var cardsEl = document.querySelector("#weather-day-cards");
var searchedEl = document.querySelector("#searched-cities");
var uvi;

//Call format: https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

// Check out https://openweathermap.org/forecast5 for multi-day
// May need new call for UVI

function callWeatherApi(e) {
  e.preventDefault();

  let cityName = document.querySelector("#location").value;

  let apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&exclude=minutely,hourly&appid="+apiKey;

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {

          let latLon = [data.city.coord.lat,data.city.coord.lon]
          uvi = getFullData(latLon)
          
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to Weather. Error Code ' + error);
    });
}

// Secondary api call to get UV that is not in the forecast
function getFullData(latLon) {
  let fullUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+latLon[0]+"&lon="+latLon[1]+"&exclude=minutely,hourly&appid="+apiKey;
  let cityName = document.querySelector("#location").value;

  fetch(fullUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          displayWeather(data,cityName);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to Weather. Error Code ' + error);
    });

}

function KtoF(temperature) {
  return (temperature-273.15)*9/5 + 32;
}

function displayWeather(data,cityName) {
  console.log(data)

  // Add searched city
  let searched = document.createElement("a");
  searched.innerHTML = cityName;
  searched.classList = 'button card m-2';
  searchedEl.append(searched);

  // Clearing weather and forecast blocks
  Array.from(summaryEl.children).forEach((child) => {
    summaryEl.removeChild(child);
  })

  Array.from(cardsEl.children).forEach((child) => {
    cardsEl.removeChild(child);
  })

  // Main card for weather
  // temp, wind, humidity, UV index
  summaryEl.classList = summaryEl.classList + " p-2";

  let h2 = document.createElement("h2");
  h2.innerHTML = cityName;
  summaryEl.append(h2);

  let timeEl = document.createElement("p");
  timeEl.innerHTML = moment.unix(data.current.dt).format("MMMM DD, YYYY");
  summaryEl.append(timeEl);

  // First forecast as current weather?
  let weatherEl = document.createElement("p");
  weatherEl.innerHTML = data.current.weather[0].main;
  summaryEl.append(weatherEl);

  let temp = document.createElement("p");
  temp.innerHTML = 'Temperature: ' + Math.round(KtoF(data.current.temp)) + ' &#176;F';
  summaryEl.append(temp)

  let hum = document.createElement("p");
  hum.innerHTML = 'Humidity: ' + (data.current.humidity) + '%';
  summaryEl.append(hum)

  let wind = document.createElement("p");
  wind.innerHTML = 'Wind Speed: ' + (data.current.wind_speed) + ' MPH';
  summaryEl.append(wind)

  let uv = document.createElement("p");
  uv.innerHTML = 'UVI: ' + (data.current.uvi);
  summaryEl.append(uv)


  // Start 5-day forecast block

  let title = document.createElement('h2');
  title.innerHTML = "5-Day Forecast";
  cardsEl.append(title);

  data.daily.forEach((forecast) => {
    let block = document.createElement('div');
    block.classList = "card m-2 p-2";
    
    let day = document.createElement('h2');
    day.innerHTML = moment.unix(forecast.dt).format('ddd');
    block.append(day);

    let type = document.createElement('p');
    type.innerHTML = forecast.weather[0].main;
    block.append(type);

    let dayTemp = document.createElement('p');
    dayTemp.innerHTML = Math.round(KtoF(forecast.temp.day))+ ' &#176;F';
    block.append(dayTemp);
    
    cardsEl.append(block);
    // temps.push(KtoF(forecast.temp.day));

  })
  

  


}

document.querySelector("#submit-button").addEventListener("click",callWeatherApi);