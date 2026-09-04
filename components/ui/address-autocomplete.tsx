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
    if (!searchText || searchText.length < 3) {
      setOptions([]);
      setFetching(false);
      return;
    }

    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        searchText
      )}&apiKey=a940585baf074507b51d0d482ab62823&filter=countrycode:us`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const newOptions = data.features.map((feature: any) => ({
          value: feature.properties.formatted,
          label: feature.properties.formatted,
          data: feature.properties,
        }));
        setOptions(newOptions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error('Geoapify fetch failed', error);
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
    }, 300); // 300ms debounce for Geoapify
  };

  const handleSelect = (selectedValue: string, option: any) => {
    setInternalValue(selectedValue);
    if (onChange) onChange(selectedValue);

    if (onSelectAddress && option.data) {
      const props = option.data;
      
      onSelectAddress({
        address: props.address_line1 || selectedValue.split(',')[0],
        city: props.city || '',
        state: props.state_code || props.state || '',
        zip: props.postcode || '',
      });
    }
  };

  return (
    <AutoComplete
      value={internalValue}
      options={options}
      onSelect={handleSelect}
      onSearch={handleSearch}
      onChange={(val) => {
        setInternalValue(val);
        if (onChange) onChange(val);
      }}
      filterOption={false}
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
