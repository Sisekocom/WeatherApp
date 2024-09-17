document.getElementById("search-button").addEventListener("click", function () {
    const city = document.getElementById("city-input").value.trim();
    const countryCode = document.getElementById("countryCode").value.trim();
    if (!city && !countryCode) {
        alert("Please enter a city or country code.");
        return;
    }
    document.getElementById("loading-gif").style.display = "block";
    fetch("/weather", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ city, countryCode }),
    })
    .then((response) => response.json())
    .then((data) => {
        // Hide loading GIF
        document.getElementById("loading-gif").style.display = "none";
        if (data.error) {
            document.querySelector(".not-found").style.display = "block";
            return;
        }
        document.querySelector(".cityName").textContent = data.city;
        document.querySelector(".temperature").innerHTML = `${data.temperature}°C`;
        document.querySelector(".description").textContent = data.description;
        document.querySelector(".humidity").textContent = data.humidity;
        document.querySelector(".wind-speed").textContent = data.wind_speed;
        const iconUrl = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
        document.getElementById("weather-icon").src = iconUrl;
        document.querySelector(".weather-box").style.display = "block";
        const forecastBoxes = document.querySelector(".forecast-boxes");
        forecastBoxes.innerHTML = ""; // Clear previous forecast
        data.forecast.forEach((day) => {
            const date = new Date(day.date * 1000);git 
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            const iconUrlForecast = `http://openweathermap.org/img/wn/${day.icon}@2x.png`;
            const box = document.createElement("div");
            box.classList.add("forecast-box", "fadeIn");
            box.innerHTML = `
                <h3>${dayOfWeek}</h3>
                <img src="${iconUrlForecast}" alt="${day.description}">
                <p>Max ${day.temp_max}°C</p>
                <p>Min ${day.temp_min}°C</p>
                <p>${day.description}</p>
            `;
            forecastBoxes.appendChild(box);
        });
        // Show the forecast section
        document.querySelector(".forecast").style.display = "block";
        // Ensure search button is visible
        document.getElementById("search-button").style.display = "block";

        // Update recommendation message based on temperature
        const recommendation = document.querySelector(".recommendation");
        if (data.temperature >= 20) {
            recommendation.textContent = "It's warm! Wear shorts and a t-shirt.";
        } else {
            recommendation.textContent = "It's cold! Wear a warm jacket.";
        }
        recommendation.style.display = "block"; // Show recommendation
    })
    .catch((error) => {
        console.error(error);
        document.querySelector(".not-found").style.display = "block";
        // Ensure search button is visible
        document.getElementById("search-button").style.display = "block";
    });
});
