import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import moment from 'moment-timezone';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import cityTimezones from 'city-timezones';


// Styled Components
const AppContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #3494e6 0%, #ec6ead 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const SearchBarContainer = styled.div`
  position: absolute;
  top: 20px;
  z-index: 1000;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.5);
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
  color: #ffffff;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
`;

const ClockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ClockWrapper = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
`;

const ClockSVG = styled.svg`
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 25px rgba(0, 0, 0, 0.3));
`;

const ClockFace = styled.circle`
  fill: #ffffff;
  stroke: #000000;
  stroke-width: 10;
`;

const ClockNumber = styled.text`
  font-size: 20px;
  font-weight: bold;
  fill: #333333;
  text-anchor: middle;
  dominant-baseline: central;
  font-family: 'Arial', sans-serif';
`;

const ClockHand = styled.line`
  stroke-linecap: round;
  transform-origin: 150px 150px;
`;

const HourHand = styled(ClockHand)`
  stroke: #2c3e50;
  stroke-width: 8;
  stroke-linecap: round;
`;

const MinuteHand = styled(ClockHand)`
  stroke: #34495e;
  stroke-width: 6;
  stroke-linecap: round;
`;

const SecondHand = styled(ClockHand)`
  stroke: #e74c3c;
  stroke-width: 4;
  stroke-linecap: round;
`;

const CenterDot = styled.circle`
  fill: #e74c3c;
`;

const DecorativeRing = styled.circle`
  fill: none;
  stroke: #808080;
  stroke-width: 5;
  opacity: 0.8;
`;

const TickMark = styled.line`
  stroke: #333333;
  stroke-width: ${props => props.isMajor ? 3 : 1};
`;

const DigitalTimeAndDate = styled.div`
  font-size: 28px;
  color: #ffffff;
  margin-top: 30px;
  text-align: center;
  font-family: 'Arial', sans-serif';
  background-color: rgba(255, 255, 255, 0.2);
  padding: 15px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const DigitalDate = styled.div`
  font-size: 20px;
  margin-top: 5px;
`;

const SuggestionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 25px 25px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 10px 20px;
  cursor: pointer;
  color: #333333;
  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

const LocationMessage = styled.div`
  font-size: 20px;
  color: #ffffff;
  margin-top: 15px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
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
const Time = () => {
  const [time, setTime] = useState(moment().tz('America/Chicago'));
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('Columbia, United States (CDT)');
  const [selectedTimezone, setSelectedTimezone] = useState('America/Chicago');
  const [timezoneData, setTimezoneData] = useState([]);
  const searchInputRef = useRef(null);
  
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
      .slice(0, 20);

    setSuggestions(uniqueSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedLocation(suggestion.display);
    setSelectedTimezone(suggestion.timezone);
    setSearchTerm('');
    setSuggestions([]);
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
      <ClockContainer>
        <ClockWrapper>
          <ClockSVG viewBox="0 0 300 300">
            <defs>
              <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f9f9f9" />
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
              transform={`rotate(${hourRotation}, 150, 150)`}
            />
            <MinuteHand
              x1="150"
              y1="150"
              x2="150"
              y2="50"
              transform={`rotate(${minuteRotation}, 150, 150)`}
            />
            <SecondHand
              x1="150"
              y1="150"
              x2="150"
              y2="30"
              transform={`rotate(${secondRotation}, 150, 150)`}
            />
            <CenterDot cx="150" cy="150" r="8" />
          </ClockSVG>
        </ClockWrapper>
        <DigitalTimeAndDate>
          <div>{formatDigitalTime(adjustedTime)}</div>
          <DigitalDate>{formatDigitalDate(adjustedTime)}</DigitalDate>
        </DigitalTimeAndDate>
        {selectedLocation && (
          <LocationMessage>{selectedLocation}</LocationMessage>
        )}
      </ClockContainer>
    </AppContainer>
  );
};

export default Time;