import { useState } from 'react';
import './Weather.scss';
import searchIcon from '../../assets/search.png';
import { FaWind } from 'react-icons/fa';
import { BsWater } from 'react-icons/bs';

function Weather() {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);


    const search = async (city) => {
        if (city === "") {
            alert("Enter City Name");
            return;
        }
        try {
            // Step 1: Get coordinates from city name using the geocoding API
            const cityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${import.meta.env.VITE_OW_API_KEY}`
            console.log("Geocoding URL:", cityUrl);

            const geoResponse = await fetch(cityUrl);
            const geoData = await geoResponse.json();

            if (!geoResponse.ok || !geoData.length) {
                alert("City not found");
                return;
            }

            console.log("Geocoding data:", geoData);

            // Get latitude and longitude from the first result
            const { lat, lon } = geoData[0];

            // Step 2: Get weather data using coordinates
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_OW_API_KEY}`;
            console.log("Weather URL:", weatherUrl);

            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            if (!weatherResponse.ok) {
                alert(weatherData.message);
                return;
            }

            // Step 3: Set the 5-day/ 3 hour forecast data
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OW_API_KEY}&units=metric`;
            console.log("Forecast URL:", forecastUrl);

            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();

            if (!forecastResponse.ok) {
                alert(forecastData.message);
                return;
            }


            setWeatherData({
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed,
                temperature: Math.floor(weatherData.main.temp),
                feelsLike: Math.floor(weatherData.main.feels_like),
                location: weatherData.name,
                icon: weatherData.weather[0].icon,
                description: weatherData.weather[0].description,
            })

            setForecastData(forecastData.list)



        } catch (error) {
            setWeatherData(false);
            console.error("Error in fetching weather data:", error);
        }
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDay() + 1;

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];


    function forecastToday(date) {
        const forcastYear = Number(date.slice(0, 4));
        const forcastMonth = Number(date.slice(5, 7));
        const forcastDay = Number(date.slice(-2));

        const verifyDate =
            forcastYear === currentYear &&
            forcastMonth === currentMonth &&
            forcastDay === currentDay;

        return verifyDate;

    }

    return (
        <div className="weather">
            <div className="weather__search-bar">
                <input
                    type="text"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search(city)}
                />
                <img
                    src={searchIcon}
                    alt="Search"
                    onClick={() => search(city)}
                />
            </div>

            {weatherData && (
                <>
                    <img
                        src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                        alt={weatherData.description}
                        className="weather-icon"
                    />
                    <div className="info">
                        <p className="info__description">{weatherData.description}</p>
                        <p className="info__temperature">{weatherData.temperature}°C</p>
                        <p className="info__feels-like">Feels like: {weatherData.feelsLike}°C</p>
                        <p className="info__location">{weatherData.location}</p>
                    </div>
                    <div className="weather-data">
                        <div className="weather-data__col">
                            <BsWater />
                            <p>
                                {weatherData.humidity}%
                                <span>Humidity</span>
                            </p>
                        </div>
                        <div className="weather-data__col">
                            <FaWind />
                            <p>
                                {weatherData.windSpeed} m/s
                                <span>Wind Speed</span>
                            </p>
                        </div>
                    </div>
                    <div className="forecast">
                        <div className='forecast__date'>
                            <p>Today</p>
                            <p>{currentDay} {months[currentMonth - 1]} </p>
                        </div>

                        <div className="forecast__data">
                            {forecastData.map((forecast, index) => (
                                forecastToday(forecast.dt_txt.slice(0, 10)) && (
                                    <div className='forecast__data__container' key={index}>
                                        <p>{forecast.main?.temp.toFixed()}°C</p>
                                        <img src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`} alt="icon" />
                                        <p>{forecast.dt_txt.slice(11, -3)}</p>
                                    </div>

                                )
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Weather;