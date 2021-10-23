var apiKey = "ba14bcb96b596c6917caf22edb9cad52";
var summaryEl = document.querySelector("#weather-summary");
var cardsEl = document.querySelector("#weather-day-cards");
var searchedEl = document.querySelector("#searched-cities");
var uvi;
var citiesList = new Set();

//Call format: https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
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

function research(e) {
  document.querySelector("#location").value = this.innerHTML;
  callWeatherApi(e);
  
  this.style.display = 'none';
}

function displayWeather(data,cityName) {

  // Add searched city
  citiesList.add(cityName);
  makeButtons();

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

  // Current weather
  let iconMain = document.createElement("img");
  iconMain.setAttribute("src","https://openweathermap.org/img/w/"+data.current.weather[0].icon+".png");
  iconMain.setAttribute("style","width:75px")
  summaryEl.append(iconMain);

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
  
  // 2 or less: Low. A UV Index reading of 2 or less means low danger from the sun's UV rays for the average person: ...
  // 3 - 5: Moderate. A UV Index reading of 3 to 5 means moderate risk of harm from unprotected sun exposure. ...
  // 6 - 7: High. ...
  // 8 - 10: Very High.
  if (data.current.uvi <= 2) {
    uv.setAttribute("style","background-color:green;");
  } else if (data.current.uvi <= 5) {
    uv.setAttribute("style","background-color:yellow;");
  } else if (data.current.uvi <= 7) {
    uv.setAttribute("style","background-color:orange;");
  } else {
    uv.setAttribute("style","background-color:red;");
  }

  summaryEl.append(uv)

  // Start 5-day forecast block

  document.querySelector("#forecast-title").setAttribute("style","display:block")

  for (let ii=0; ii<5; ii++) {
    forecast = data.daily[ii];
    let block = document.createElement('div');
    block.classList = "card m-2 p-2";
    
    let day = document.createElement('h2');
    day.innerHTML = moment.unix(forecast.dt).format('ddd');
    block.append(day);

    // change to icon
    let icon = document.createElement("img");
    icon.setAttribute("src","https://openweathermap.org/img/w/"+forecast.weather[0].icon+".png");
    icon.setAttribute("style","width:75px")
    block.append(icon);


    temp = document.createElement("p");
    temp.innerHTML = 'Temp: ' + Math.round(KtoF(data.current.temp)) + ' &#176;F';
    block.append(temp)

    hum = document.createElement("p");
    hum.innerHTML = 'Hum: ' + (data.current.humidity) + '%';
    block.append(hum)

    wind = document.createElement("p");
    wind.innerHTML = 'Wind: ' + (data.current.wind_speed) + ' MPH';
    block.append(wind)
    
    cardsEl.append(block);
  }

}

function initialLoad() {
  var previousCitiesButtons = localStorage.getItem("previousCities");
  if (previousCitiesButtons) {
    let savedData = JSON.parse(previousCitiesButtons);
    Array.from(savedData).forEach((city) => {
      citiesList.add(city);
    })
    makeButtons();
  }
}

function makeButtons() {
  // Clearing current buttons
  Array.from(searchedEl.children).forEach((child) => {
    searchedEl.removeChild(child);
  })

  citiesList.forEach((city) => {
    let newBtn = document.createElement("button");

    newBtn.textContent = city;
    newBtn.classList = "btn btn-secondary m-1";

    newBtn.addEventListener("click", function (e) {
      document.querySelector("#location").value = this.innerHTML;
      callWeatherApi(e);
    });


    searchedEl.append(newBtn);
  })

  localStorage.setItem("previousCities", JSON.stringify(Array.from(citiesList)));
}

initialLoad()

document.querySelector("#submit-button").addEventListener("click",callWeatherApi);