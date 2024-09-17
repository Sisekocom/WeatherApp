from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime
app = Flask(__name__)
API_KEY = '11b50c32a19fb87878c1d68d788908d5'  # Replace with your OpenWeatherMap API key
@app.route('/')
def index():
    return render_template('index.html')
@app.route('/weather', methods=['POST'])
def get_weather():
    city = request.form.get('city')
    country_code = request.form.get('countryCode')
    if not city:
        return jsonify({'error': 'Please enter the city name.'}), 400
    # If no country code is provided, search by city only
    if country_code:
        location = f"{city},{country_code}"
    else:
        location = city
    weather_url = f'https://api.openweathermap.org/data/2.5/weather?q={location}&units=metric&appid={API_KEY}'
    response = requests.get(weather_url)
    if response.status_code != 200:
        return jsonify({'error': 'Location not found.'}), 404
    data = response.json()
    weather_data = {
        'city': data['name'],
        'temperature': int(data['main']['temp']),
        'description': data['weather'][0]['description'],
        'humidity': data['main']['humidity'],
        'wind_speed': int(data['wind']['speed']),
        'icon': data['weather'][0]['icon'],
        'lat': data['coord']['lat'],
        'lon': data['coord']['lon']
    }
    forecast_url = f'https://api.openweathermap.org/data/2.5/forecast?lat={weather_data["lat"]}&lon={weather_data["lon"]}&units=metric&appid={API_KEY}'
    forecast_response = requests.get(forecast_url)
    if forecast_response.status_code == 200:
        forecast_data = forecast_response.json()
        daily_forecast = {}
        for forecast in forecast_data['list']:
            date = forecast['dt_txt'].split(' ')[0]  # Extract the date part
            if date == datetime.now().strftime('%Y-%m-%d'):
                continue
            if date not in daily_forecast:
                daily_forecast[date] = {
                    'temp_max': forecast['main']['temp_max'],
                    'temp_min': forecast['main']['temp_min'],
                    'description': forecast['weather'][0]['description'],
                    'icon': forecast['weather'][0]['icon'],
                    'date': forecast['dt']
                }
            else:
                daily_forecast[date]['temp_max'] = max(daily_forecast[date]['temp_max'], forecast['main']['temp_max'])
                daily_forecast[date]['temp_min'] = min(daily_forecast[date]['temp_min'], forecast['main']['temp_min'])
        weather_data['forecast'] = list(daily_forecast.values())[:5]
    return jsonify(weather_data)
if __name__ == '__main__':
    app.run(debug=True)