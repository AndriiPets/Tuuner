"use client";

import { create } from "zustand";

const defaultOptions = {
  type: "line",
  style: "bars",
  background: "none",
  numBars: 60,
  radius: 50,
  color: "rgb(0, 0, 0)",
  position: "down",
  orientation: "up",
};

const remove = "";

export const useOptions = create((set) => ({
  current: {
    Visualizer_1: { ...defaultOptions },
  },
  addVisualizer: (name) => {
    console.log(`add ${name}`);
    set((state) => ({
      current: {
        ...state.current,
        [name]: { ...defaultOptions },
      },
    }));
  },

  deleteVisualizer: (name) => {
    console.log(`delete ${name}`);
    set((state) => ({
      current: { [name]: remove, ...state.current },
    }));
  },

  changeOption: (optionType, option, visualizerName) => {
    console.log(
      `change option ${optionType} of ${visualizerName} to ${option}`
    );
    set((state) => ({
      current: {
        ...state.current,
        [visualizerName]: {
          ...state.current[visualizerName],
          [optionType]: option,
        },
      },
    }));
  },
}));
