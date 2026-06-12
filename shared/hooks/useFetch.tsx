import {useState, useEffect} from 'react';

const useFetch = () => {
  async function fetchData({pageParam = 1, options = {}, endpoint}: any) {
    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  return {fetchData};
};

export default useFetch;
