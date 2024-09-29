import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { WiDaySunny, WiNightClear, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';
import moment from 'moment-timezone';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import cityTimezones from 'city-timezones';
import axios from 'axios';

// Styled Components
const AppContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const SearchBarContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
`;

const ClockContainer = styled.div`
  margin-left: 50px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
`;

const SearchInput = styled.input`
  padding: 12px 20px 12px 45px;
  font-size: 16px;
  border: none;
  border-radius: 25px;
  width: 300px;
  outline: none;
  background-color: transparent;
  
  &:focus {
    box-shadow: 0 0 0 2px #3498db;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 15px;
  color: #3498db;
  font-size: 18px;
`;

const ClockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ClockSVG = styled.svg`
  width: 300px;
  height: 300px;
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.2));
`;

const ClockFace = styled.circle`
  fill: #000000;
  stroke: #333;
  stroke-width: 8;
`;

const ClockNumber = styled.text`
  font-size: 24px;
  font-weight: bold;
  fill: #ffffff;
  text-anchor: middle;
  dominant-baseline: central;
  font-family: 'Arial', sans-serif;
`;

const ClockHand = styled.line`
  stroke-linecap: round;
  transform-origin: 150px 150px;
`;

const HourHand = styled(ClockHand)`
  stroke: #ffffff;
  stroke-width: 12;
`;

const MinuteHand = styled(ClockHand)`
  stroke: #ffffff;
  stroke-width: 8;
`;

const SecondHand = styled(ClockHand)`
  stroke: #e74c3c;
  stroke-width: 4;
`;

const CenterDot = styled.circle`
  fill: #e74c3c;
`;

const DecorativeRing = styled.circle`
  fill: none;
  stroke: #ffffff;
  stroke-width: 3;
  opacity: 0.6;
`;

const TickMark = styled.line`
  stroke: #ffffff;
  stroke-width: ${props => props.isMajor ? 3 : 1};
`;

const DigitalTimeAndDate = styled.div`
  font-size: 24px;
  color: #333;
  margin-top: 20px;
  text-align: center;
  font-family: 'Arial', sans-serif;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px 20px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DigitalDate = styled.div`
  font-size: 18px;
  margin-top: 5px;
`;

const SuggestionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 0 0 25px 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 10px 20px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const LocationMessage = styled.div`
  font-size: 18px;
  color: #333;
  margin-top: 10px;
  text-align: center;
`;

const CenterSearchBarContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
`;

const WeatherContainer = styled.div`
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 300px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  background-image: ${props => props.backgroundImage};
  background-size: cover;
  background-position: center;
`;

const WeatherInfo = styled.div`
  font-size: 16px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const WeatherLocation = styled.h3`
  margin: 0 0 10px;
  font-size: 24px;
  color: #fff;
`;

const WeatherCondition = styled.p`
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0;
  color: #fff;
`;

const WeatherIcon = styled.div`
  font-size: 64px;
  margin: 10px 0;
  color: #fff;
`;

const WeatherDetail = styled.p`
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 10px;
`;

const WeatherLabel = styled.span`
  font-weight: bold;
  color: #fff;
`;

const WeatherValue = styled.span`
  color: #fff;
`;

// Helper Functions
const prepareTimezoneData = (allTimezones, cityTimezonesData) => {
  const preparedData = allTimezones.flatMap(tz => {
    const parts = tz.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    const countryCode = moment.tz.zone(tz).countries()[0];
    const country = countries.getName(countryCode, 'en') || parts[0].replace(/_/g, ' ');
    const tzAbbr = moment().tz(tz).format('z');
    
    const fullEntry = { 
      timezone: tz, 
      city, 
      country, 
      display: `${city}, ${country} (${tzAbbr})`,
      tzAbbr
    };
    
    const additionalEntries = parts.map((part, index) => ({
      timezone: tz,
      city: part.replace(/_/g, ' '),
      country: index === 0 ? country : parts[index - 1].replace(/_/g, ' '),
      display: `${part.replace(/_/g, ' ')}, ${index === 0 ? country : parts[index - 1].replace(/_/g, ' ')} (${tzAbbr})`,
      tzAbbr
    }));
    
    return [fullEntry, ...additionalEntries];
  });

  const detailedLocationData = cityTimezonesData
    .map(cityData => {
      const tz = cityData.timezone;
      if (moment.tz.zone(tz)) {
        const tzAbbr = moment().tz(tz).format('z');
        return {
          timezone: tz,
          city: cityData.city,
          country: countries.getName(cityData.iso2, 'en') || cityData.country,
          display: `${cityData.city}, ${countries.getName(cityData.iso2, 'en') || cityData.country} (${tzAbbr})`,
          tzAbbr,
          province: cityData.province || '',
          state: cityData.state || '',
        };
      }
      return null;
    })
    .filter(Boolean);

  const combinedData = [...preparedData, ...detailedLocationData];

  return Array.from(new Set(combinedData.map(JSON.stringify)))
    .map(JSON.parse)
    .sort((a, b) => a.display.localeCompare(b.display));
};

const formatDigitalTime = (date) => date.format('hh:mm:ss A');
const formatDigitalDate = (date) => date.format('dddd, MMMM D, YYYY');

// Main App Component
const App = () => {
  const [time, setTime] = useState(moment().tz('America/Chicago'));
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('Columbia, United States (CDT)');
  const [selectedTimezone, setSelectedTimezone] = useState('America/Chicago');
  const [timezoneData, setTimezoneData] = useState([]);
  const [weatherLocation, setWeatherLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherSuggestions, setWeatherSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const weatherInputRef = useRef(null);
  
  useEffect(() => {
    countries.registerLocale(enLocale);
    const timer = setInterval(() => setTime(moment().tz(selectedTimezone)), 50);

    const allTimezones = moment.tz.names();
    const cityTimezonesData = cityTimezones.cityMapping;
    
    setTimezoneData(prepareTimezoneData(allTimezones, cityTimezonesData));

    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedTimezone]);

  const adjustedTime = moment(time).tz(selectedTimezone);

  const hours = adjustedTime.hours() % 12;
  const minutes = adjustedTime.minutes();
  const seconds = adjustedTime.seconds();
  const milliseconds = adjustedTime.milliseconds();

  const hourRotation = (hours * 30) + (minutes * 0.5);
  const minuteRotation = (minutes * 6) + (seconds * 0.1) + (milliseconds * 0.0001);
  const secondRotation = (seconds * 6) + (milliseconds * 0.006);

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(event.target.value);
    
    const filteredSuggestions = timezoneData
      .filter(item => 
        item.city.toLowerCase().includes(value) || 
        item.country.toLowerCase().includes(value) ||
        item.timezone.toLowerCase().includes(value) ||
        item.tzAbbr.toLowerCase().includes(value) ||
        (item.province && item.province.toLowerCase().includes(value)) ||
        (item.state && item.state.toLowerCase().includes(value))
      )
      .sort((a, b) => {
        if (a.city.toLowerCase() === value) return -1;
        if (b.city.toLowerCase() === value) return 1;
        if (a.country.toLowerCase() === value) return -1;
        if (b.country.toLowerCase() === value) return 1;
        if (a.city.toLowerCase().startsWith(value)) return -1;
        if (b.city.toLowerCase().startsWith(value)) return 1;
        return a.display.localeCompare(b.display);
      });
    
    const uniqueSuggestions = Array.from(new Set(filteredSuggestions.map(JSON.stringify)))
      .map(JSON.parse)
      .slice(0, 10);
  
    setSuggestions(uniqueSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedLocation(suggestion.display);
    setSelectedTimezone(suggestion.timezone);
    setSearchTerm('');
    setSuggestions([]);
  };

  const fetchWeatherData = async (location) => {
    try {
      const API_KEY = '1749d7acb6d84f249d1221730242909';
      const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`);
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
    }
  };

  const fetchWeatherSuggestions = async (query) => {
    if (query.length < 3) {
      setWeatherSuggestions([]);
      return;
    }
    try {
      const API_KEY = '1749d7acb6d84f249d1221730242909';
      const response = await axios.get(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`);
      setWeatherSuggestions(response.data.slice(0, 10)); // Limit to 10 suggestions
    } catch (error) {
      console.error('Error fetching weather suggestions:', error);
      setWeatherSuggestions([]);
    }
  };

  const handleWeatherSearch = (event) => {
    const value = event.target.value;
    setWeatherLocation(value);
    fetchWeatherSuggestions(value);
  };

  const handleWeatherSuggestionClick = (suggestion) => {
    setWeatherLocation(suggestion.name);
    setWeatherSuggestions([]);
    fetchWeatherData(suggestion.name);
  };

  const getWeatherIcon = (condition) => {
    const lowercaseCondition = condition.toLowerCase();
    if (lowercaseCondition.includes('sunny') || lowercaseCondition.includes('clear')) {
      return <WiDaySunny />;
    } else if (lowercaseCondition.includes('cloudy')) {
      return <WiCloudy />;
    } else if (lowercaseCondition.includes('rain')) {
      return <WiRain />;
    } else if (lowercaseCondition.includes('snow')) {
      return <WiSnow />;
    } else if (lowercaseCondition.includes('thunder')) {
      return <WiThunderstorm />;
    } else if (lowercaseCondition.includes('fog') || lowercaseCondition.includes('mist')) {
      return <WiFog />;
    } else {
      return <WiDaySunny />;
    }
  };

  const getWeatherBackground = (condition) => {
    const lowercaseCondition = condition.toLowerCase();
    if (lowercaseCondition.includes('sunny') || lowercaseCondition.includes('clear')) {
      return 'url("https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80")';
    } else if (lowercaseCondition.includes('cloudy')) {
      return 'url("https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1051&q=80")';
    } else if (lowercaseCondition.includes('rain')) {
      return 'url("https://images.unsplash.com/photo-1519692933481-e162a57d6721?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80")';
    } else if (lowercaseCondition.includes('snow')) {
      return 'url("https://images.unsplash.com/photo-1477601263568-180e2c6d046e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80")';
    } else if (lowercaseCondition.includes('thunder')) {
      return 'url("https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80")';
    } else if (lowercaseCondition.includes('fog') || lowercaseCondition.includes('mist')) {
      return 'url("https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80")';
    } else {
      return 'url("https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80")';
    }
  };

  return (
    <AppContainer>
      <SearchBarContainer>
        <SearchInputWrapper ref={searchInputRef}>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search for a city, country, or time zone..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {suggestions.length > 0 && (
            <SuggestionList>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion.display}
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}
        </SearchInputWrapper>
      </SearchBarContainer>
      <CenterSearchBarContainer>
        <SearchInputWrapper ref={weatherInputRef}>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search for weather..."
            value={weatherLocation}
            onChange={handleWeatherSearch}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeatherData(weatherLocation)}
          />
          {weatherSuggestions.length > 0 && (
            <SuggestionList>
              {weatherSuggestions.map((suggestion, index) => (
                <SuggestionItem key={index} onClick={() => handleWeatherSuggestionClick(suggestion)}>
                  {suggestion.name}, {suggestion.region}, {suggestion.country}
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}
        </SearchInputWrapper>
      </CenterSearchBarContainer>
      {weatherData && (
        <WeatherContainer backgroundImage={getWeatherBackground(weatherData.current.condition.text)}>
          <WeatherInfo>
            <WeatherLocation>{weatherData.location.name}, {weatherData.location.country}</WeatherLocation>
            <WeatherIcon>{getWeatherIcon(weatherData.current.condition.text)}</WeatherIcon>
            <WeatherCondition>{weatherData.current.condition.text}</WeatherCondition>
            <WeatherDetail>
              <WeatherLabel>Temperature:</WeatherLabel>
              <WeatherValue>{weatherData.current.temp_c}°C / {weatherData.current.temp_f}°F</WeatherValue>
            </WeatherDetail>
            <WeatherDetail>
              <WeatherLabel>Feels like:</WeatherLabel>
              <WeatherValue>{weatherData.current.feelslike_c}°C / {weatherData.current.feelslike_f}°F</WeatherValue>
            </WeatherDetail>
            <WeatherDetail>
              <WeatherLabel>Humidity:</WeatherLabel>
              <WeatherValue>{weatherData.current.humidity}%</WeatherValue>
            </WeatherDetail>
            <WeatherDetail>
              <WeatherLabel>Wind:</WeatherLabel>
              <WeatherValue>{weatherData.current.wind_kph} km/h</WeatherValue>
            </WeatherDetail>
          </WeatherInfo>
        </WeatherContainer>
      )}
      <ClockContainer>
        <ClockWrapper>
          <ClockSVG viewBox="0 0 300 300">
            <defs>
              <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5f5f5" />
                <stop offset="100%" stopColor="#e0e0e0" />
              </linearGradient>
            </defs>
            <ClockFace cx="150" cy="150" r="145" />
            <DecorativeRing cx="150" cy="150" r="135" />
            {[...Array(60)].map((_, i) => {
              const angle = (i * 6 - 90) * (Math.PI / 180);
              const isMajor = i % 5 === 0;
              const length = isMajor ? 15 : 10;
              const x1 = 150 + 140 * Math.cos(angle);
              const y1 = 150 + 140 * Math.sin(angle);
              const x2 = 150 + (140 - length) * Math.cos(angle);
              const y2 = 150 + (140 - length) * Math.sin(angle);
              return (
                <TickMark key={i} x1={x1} y1={y1} x2={x2} y2={y2} isMajor={isMajor} />
              );
            })}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x = 150 + 115 * Math.cos(angle);
              const y = 150 + 115 * Math.sin(angle);
              return (
                <ClockNumber key={i} x={x} y={y}>
                  {i === 0 ? 12 : i}
                </ClockNumber>
              );
            })}
            <HourHand
              x1="150"
              y1="150"
              x2="150"
              y2="80"
              transform={`rotate(${hourRotation})`}
            />
            <MinuteHand
              x1="150"
              y1="150"
              x2="150"
              y2="50"
              transform={`rotate(${minuteRotation})`}
            />
            <SecondHand
              x1="150"
              y1="150"
              x2="150"
              y2="30"
              transform={`rotate(${secondRotation})`}
            />
            <CenterDot cx="150" cy="150" r="10" />
          </ClockSVG>
          <DigitalTimeAndDate>
            <div>{formatDigitalTime(adjustedTime)}</div>
            <DigitalDate>{formatDigitalDate(adjustedTime)}</DigitalDate>
          </DigitalTimeAndDate>
          {selectedLocation && (
            <LocationMessage>{selectedLocation}</LocationMessage>
          )}
        </ClockWrapper>
      </ClockContainer>
    </AppContainer>
  );
};

export default App;