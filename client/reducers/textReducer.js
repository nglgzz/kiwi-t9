import actions from 'utils/actions.json';


const initialState = {
  digits: '',
  lastWord: '',
  lastWordIndex: -1,
  symbols: '',
  suggestions: [],
  text: [],
};


export default (state = initialState, action) => {
  switch (action.type) {
    case actions.fetchSuggestions.fulfilled: {
      const { digits, suggestions } = action.payload.data;

      // For now suggestions are ordered by rank (lower == better).
      // Later it could also be possible to take into account how many times
      // each word was used by the user.
      let orderedSuggestions = suggestions.sort((a, b) => {
        if (a.rank < b.rank) {
          return 1;
        }

        if (a.rank > b.rank) {
          return -1;
        }

        return 0;
      });

      if (orderedSuggestions.length === 0) {
        orderedSuggestions = [{ word: '' }];
      }

      return {
        ...state,
        digits,
        lastWord: orderedSuggestions[0].word,
        lastWordIndex: 0,
        suggestions: orderedSuggestions,
      };
    }

    case actions.nextSuggestion: {
      // Cycle through the suggestions.
      const lastWordIndex = (state.lastWordIndex + 1) % state.suggestions.length;

      return {
        ...state,
        lastWordIndex,
        lastWord: state.suggestions[lastWordIndex].word,
      };
    }

    case actions.endSuggestion: {
      // Save the current word on the text array, and start a new word.
      const text = [...state.text];
      text.push({
        digits: state.digits,
        word: state.lastWord,
        symbols: state.symbols,
        index: state.lastWordIndex,
        suggestions: [...state.suggestions],
      });

      return {
        ...state,
        text,
        digits: '',
        lastWord: '',
        symbols: '',
        lastWordIndex: 0,
        suggestions: [{ word: '' }],
      };
    }

    case actions.text.reset:
      return initialState;

    case actions.wordDelete: {
      // Remove current word and pop last word from text.
      const text = [...state.text];
      const previousWord = text.pop();

      return {
        ...state,
        text,
        digits: previousWord.digits,
        lastWord: previousWord.word,
        lastWordIndex: previousWord.index,
        suggestions: previousWord.suggestions,
        symbols: previousWord.symbols,
      };
    }

    case actions.symbol.insert:
      return {
        ...state,
        symbols: `${state.symbols}.`,
      };

    case actions.symbol.next: {
      const symbols = ['.', ',', '!'];
      const symbolIndex = symbols.indexOf(state.symbols[state.symbols.length - 1]);
      const newSymbolIndex = (symbolIndex + 1) % symbols.length;

      return {
        ...state,
        symbols: state.symbols.slice(0, -1) + symbols[newSymbolIndex],
      };
    }

    case actions.symbol.deleteSymbol:
      return {
        ...state,
        symbols: state.symbols.slice(0, -1),
      };

    default:
      return state;
  }
};
