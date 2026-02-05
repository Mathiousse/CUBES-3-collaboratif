import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/AddressAutocomplete.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function AddressAutocomplete({ value, onChange, onAddressSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/address/search`, {
          params: { q: value, limit: 5 }
        });
        setSuggestions(response.data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSelectSuggestion = (feature) => {
    const address = feature.properties.label;
    const details = {
      street: feature.properties.name,
      city: feature.properties.city,
      postalCode: feature.properties.postcode,
      coordinates: {
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0]
      }
    };
    
    onChange(address);
    onAddressSelect(details);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="address-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Entrez votre adresse de livraison"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
      />
      {loading && <div className="loading-indicator">Recherche...</div>}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((feature, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(feature)}
              className="suggestion-item"
            >
              <span className="suggestion-label">{feature.properties.label}</span>
              <span className="suggestion-context">{feature.properties.context}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressAutocomplete;

