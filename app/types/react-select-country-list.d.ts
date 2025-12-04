declare module 'react-select-country-list' {
  type Country = {
    value: string;
    label: string;
  };

  type CountryList = {
    getData: () => Country[];
    getLabel: (value: string) => string;
    getValue: (label: string) => string;
    getList: () => Country[];
  };

  function countryList(): CountryList;
  export default countryList;
}

