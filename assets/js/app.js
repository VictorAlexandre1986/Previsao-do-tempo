const searchButton = document.querySelector('.search-btn');
const cityInput = document.querySelector('.city-input');
const weatherCardsDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const locationButton = document.querySelector('.location-btn')


const API_KEY = "b685a5b83e9bedc8302d05c5216883a4";


const createWeatherCard = (cityName,weatherItem, index) => {
    if(index==0){//Cria o card principal
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperatura: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                    <h4>Vento: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidade: ${weatherItem.main.humidity} %</h4>
                </div>
                <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="">          
                </div>`;
    }else{//Cria os cards menores
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
                    <h5>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h5>
                    <h5>Vento: ${weatherItem.wind.speed} M/S</h5>
                    <h5>Humidade: ${weatherItem.main.humidity} %</h5>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {
        const uniqueForeacastDays = [];
        // console.log(data)

        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();

            if(!uniqueForeacastDays.includes(forecastDate)){
                return uniqueForeacastDays.push(forecastDate);
            }
        });
        // console.log(fiveDaysForecast)

        //Limpando precisões
        cityInput.value="";
        weatherCardsDiv.innerHTML="";
        currentWeatherDiv.innerHTML="";

        //Cria os cards e adiciona no DOM
        fiveDaysForecast.forEach((weatherItem,index) => {
            if(index == 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index));
            }
        });
    })
    .catch(()=>{
        alert('Não foi possível pegar a previsão do tempo!');
    })

}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) {
        return;
    }
    const GEOCODING_API_URL=`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    //Obtendo a latitude e a logintude do local informado
    console.log(GEOCODING_API_URL)
    fetch(GEOCODING_API_URL)
    .then(res => res.json())
    .then(data => {
        if(!data.length){
            return alert(`Local não encontrado: ${cityName} `);
        }
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    })
    .catch(()=>{
        alert('Local não encontrado.');
    });

}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position =>{
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            //Obtendo o nome da cidade atraves das coordenadas que o navegador forneceu
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const {name} = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(()=>{
                    alert('Local não encontrado.');
                });
        },
        error =>{//O navegador nao permite a obtenção da geolocalização
            if(error.code === error.PERMISSION_DENIED){
                alert('Geolocalização negada')
            }
        }
    )
}


locationButton.addEventListener('click',getUserCoordinates);
searchButton.addEventListener('click',getCityCoordinates);