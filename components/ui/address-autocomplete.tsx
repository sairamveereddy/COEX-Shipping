import React, { useState, useEffect, useRef } from 'react';
import { AutoComplete, Input, Spin } from 'antd';

export type AddressComponentData = {
  address: string;
  city: string;
  state: string;
  zip: string;
};

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelectAddress?: (data: AddressComponentData) => void;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelectAddress,
  placeholder = 'Start typing an address...',
}: AddressAutocompleteProps) {
  const [options, setOptions] = useState<{ value: string; label: string; data: any }[]>([]);
  const [fetching, setFetching] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const fetchAddresses = async (searchText: string) => {
    if (!searchText || searchText.length < 5) {
      setOptions([]);
      setFetching(false);
      return;
    }

    try {
      const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(
        searchText
      )}&benchmark=Public_AR_Current&format=json`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      if (data.result && data.result.addressMatches) {
        const newOptions = data.result.addressMatches.map((match: any) => ({
          value: match.matchedAddress,
          label: match.matchedAddress,
          data: match,
        }));
        setOptions(newOptions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error('Census API fetch failed', error);
      setOptions([]);
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = (searchText: string) => {
    setInternalValue(searchText);
    if (onChange) onChange(searchText);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setFetching(true);
    timerRef.current = setTimeout(() => {
      fetchAddresses(searchText);
    }, 800); // 800ms debounce since Census API is slow and we don't want to spam it
  };

  const handleSelect = (selectedValue: string, option: any) => {
    setInternalValue(selectedValue);
    if (onChange) onChange(selectedValue);

    if (onSelectAddress && option.data && option.data.addressComponents) {
      const components = option.data.addressComponents;
      
      // Construct the street address piece by piece if possible, or fallback to the matched string
      const streetParts = [
        components.fromAddress || '',
        components.preDirection || '',
        components.streetName || '',
        components.suffixType || '',
        components.suffixDirection || '',
      ].filter(Boolean).join(' ');

      onSelectAddress({
        address: streetParts || selectedValue.split(',')[0],
        city: components.city || '',
        state: components.state || '',
        zip: components.zip || '',
      });
    }
  };

  return (
    <AutoComplete
      value={internalValue}
      options={options}
      onSelect={handleSelect}
      onSearch={handleSearch}
      style={{ width: '100%' }}
      notFoundContent={fetching ? <Spin size="small" /> : null}
    >
      <Input
        placeholder={placeholder}
        suffix={fetching ? <Spin size="small" /> : null}
      />
    </AutoComplete>
  );
}
